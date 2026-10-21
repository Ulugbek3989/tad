import { all, first, run, insert } from '../lib/db.js';
import { json, readJson, str, badRequest, fail, notFound } from '../lib/http.js';
import { hashPassword, verifyPassword, createSession, sessionCookie, requireUser, requireAdmin } from '../lib/auth.js';
import { levelInfo, touchStreak, BADGES } from '../lib/gamification.js';
import { CATALOG } from '../data/catalog.js';
import { importCourse } from './courses.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function publicUser(u) {
  return { id: u.id, email: u.email, name: u.name, role: u.role, xp: u.xp, streak: u.streak, bio: u.bio, level: levelInfo(u.xp || 0) };
}

async function createUser(env, { name, email, password, role }) {
  if (!EMAIL_RE.test(email)) badRequest("Email noto'g'ri");
  if (!password || password.length < 6) badRequest("Parol kamida 6 ta belgidan iborat bo'lishi kerak");
  const exists = await first(env, 'SELECT id FROM users WHERE email = ?', email);
  if (exists) fail(409, "Bu email bilan foydalanuvchi allaqachon ro'yxatdan o'tgan");
  const { hash, salt } = await hashPassword(password);
  return insert(env, 'INSERT INTO users (email, name, password_hash, salt, role) VALUES (?, ?, ?, ?, ?)', email, name, hash, salt, role);
}

export default function (r) {
  r.post('/api/auth/register', async ({ req, env }) => {
    const b = await readJson(req);
    const name = str(b.name, { required: true, max: 100, name: 'Ism' });
    const email = str(b.email, { required: true, max: 200, name: 'Email' }).toLowerCase();
    const count = (await first(env, 'SELECT COUNT(*) AS n FROM users')).n;
    // Birinchi ro'yxatdan o'tgan foydalanuvchi — administrator
    let role = count === 0 ? 'admin' : 'student';
    if (role === 'student' && b.teacher_code && env.TEACHER_CODE && b.teacher_code === env.TEACHER_CODE) role = 'teacher';
    const id = await createUser(env, { name, email, password: b.password, role });
    const token = await createSession(env, id);
    // Platforma fanga moslangan: birinchi administrator uchun asosiy kurs avtomatik yuklanadi
    if (role === 'admin' && env.DEFAULT_COURSE && CATALOG[env.DEFAULT_COURSE]) {
      await importCourse(env, CATALOG[env.DEFAULT_COURSE], id);
    }
    if (b.join_code) {
      const g = await first(env, 'SELECT id FROM groups WHERE join_code = ?', String(b.join_code).trim().toUpperCase());
      if (g) await run(env, 'INSERT OR IGNORE INTO group_members (group_id, user_id) VALUES (?, ?)', g.id, id);
    }
    const user = await first(env, 'SELECT * FROM users WHERE id = ?', id);
    return json({ user: publicUser(user), token }, 201, { 'set-cookie': sessionCookie(token, req) });
  });

  r.post('/api/auth/login', async ({ req, env }) => {
    const b = await readJson(req);
    const email = str(b.email, { required: true, name: 'Email' }).toLowerCase();
    const user = await first(env, 'SELECT * FROM users WHERE email = ?', email);
    if (!user || !(await verifyPassword(String(b.password || ''), user.password_hash, user.salt))) {
      fail(401, "Email yoki parol noto'g'ri");
    }
    await run(env, 'DELETE FROM sessions WHERE user_id = ? AND expires_at < ?', user.id, new Date().toISOString());
    const token = await createSession(env, user.id);
    return json({ user: publicUser(user), token }, 200, { 'set-cookie': sessionCookie(token, req) });
  });

  r.post('/api/auth/logout', async (ctx) => {
    if (ctx.user) await run(ctx.env, 'DELETE FROM sessions WHERE token = ?', ctx.user.token);
    return json({ ok: true }, 200, { 'set-cookie': sessionCookie(null, ctx.req) });
  });

  r.get('/api/auth/me', async (ctx) => {
    if (!ctx.user) return json({ user: null });
    if (ctx.user.role === 'student') await touchStreak(ctx.env, ctx.user);
    const u = await first(ctx.env, 'SELECT * FROM users WHERE id = ?', ctx.user.id);
    const unread = (await first(ctx.env, 'SELECT COUNT(*) AS n FROM notifications WHERE user_id = ? AND is_read = 0', u.id)).n;
    return json({ user: { ...publicUser(u), unread } });
  });

  r.patch('/api/auth/me', async (ctx) => {
    const u = requireUser(ctx);
    const b = await readJson(ctx.req);
    if (b.name !== undefined) await run(ctx.env, 'UPDATE users SET name = ? WHERE id = ?', str(b.name, { required: true, max: 100, name: 'Ism' }), u.id);
    if (b.bio !== undefined) await run(ctx.env, 'UPDATE users SET bio = ? WHERE id = ?', str(b.bio, { max: 500 }), u.id);
    if (b.new_password) {
      const full = await first(ctx.env, 'SELECT * FROM users WHERE id = ?', u.id);
      if (!(await verifyPassword(String(b.password || ''), full.password_hash, full.salt))) fail(400, "Joriy parol noto'g'ri");
      if (String(b.new_password).length < 6) badRequest("Yangi parol kamida 6 ta belgi bo'lishi kerak");
      const { hash, salt } = await hashPassword(String(b.new_password));
      await run(ctx.env, 'UPDATE users SET password_hash = ?, salt = ? WHERE id = ?', hash, salt, u.id);
      await run(ctx.env, 'DELETE FROM sessions WHERE user_id = ? AND token != ?', u.id, u.token);
    }
    return json({ ok: true });
  });

  // Profil: nishonlar, XP tarixi
  r.get('/api/users/:id/profile', async (ctx) => {
    const me = requireUser(ctx);
    const id = Number(ctx.params.id);
    const u = await first(ctx.env, 'SELECT id, name, role, xp, streak, bio, created_at FROM users WHERE id = ?', id);
    if (!u) notFound();
    const badges = (await all(ctx.env, 'SELECT badge_key, reason, created_at FROM user_badges WHERE user_id = ? ORDER BY created_at DESC', id))
      .map((b) => ({ ...b, ...(BADGES[b.badge_key] || { name: b.badge_key, icon: '🏅' }) }));
    const canSeePrivate = me.id === id || me.role !== 'student';
    const xp_history = canSeePrivate
      ? await all(ctx.env, 'SELECT amount, reason, created_at FROM xp_events WHERE user_id = ? ORDER BY id DESC LIMIT 30', id)
      : [];
    return json({ user: { ...u, level: levelInfo(u.xp) }, badges, xp_history });
  });

  // ---- Administrator: foydalanuvchilarni boshqarish ----
  r.get('/api/admin/users', async (ctx) => {
    requireAdmin(ctx);
    const q = `%${ctx.url.searchParams.get('q') || ''}%`;
    const users = await all(ctx.env, 'SELECT id, email, name, role, xp, created_at FROM users WHERE name LIKE ? OR email LIKE ? ORDER BY id DESC LIMIT 500', q, q);
    return json({ users });
  });

  r.post('/api/admin/users', async (ctx) => {
    requireAdmin(ctx);
    const b = await readJson(ctx.req);
    const role = ['admin', 'teacher', 'student'].includes(b.role) ? b.role : 'student';
    const id = await createUser(ctx.env, {
      name: str(b.name, { required: true, max: 100, name: 'Ism' }),
      email: str(b.email, { required: true, max: 200, name: 'Email' }).toLowerCase(),
      password: String(b.password || ''),
      role,
    });
    return json({ id }, 201);
  });

  r.patch('/api/admin/users/:id', async (ctx) => {
    const admin = requireAdmin(ctx);
    const id = Number(ctx.params.id);
    const b = await readJson(ctx.req);
    if (b.role) {
      if (!['admin', 'teacher', 'student'].includes(b.role)) badRequest("Noto'g'ri rol");
      if (id === admin.id && b.role !== 'admin') badRequest("O'zingizning admin rolingizni olib tashlay olmaysiz");
      await run(ctx.env, 'UPDATE users SET role = ? WHERE id = ?', b.role, id);
    }
    if (b.name) await run(ctx.env, 'UPDATE users SET name = ? WHERE id = ?', str(b.name, { max: 100 }), id);
    if (b.password) {
      if (String(b.password).length < 6) badRequest('Parol kamida 6 ta belgi');
      const { hash, salt } = await hashPassword(String(b.password));
      await run(ctx.env, 'UPDATE users SET password_hash = ?, salt = ? WHERE id = ?', hash, salt, id);
      await run(ctx.env, 'DELETE FROM sessions WHERE user_id = ?', id);
    }
    return json({ ok: true });
  });

  r.delete('/api/admin/users/:id', async (ctx) => {
    const admin = requireAdmin(ctx);
    const id = Number(ctx.params.id);
    if (id === admin.id) badRequest("O'zingizni o'chira olmaysiz");
    await run(ctx.env, 'DELETE FROM users WHERE id = ?', id);
    return json({ ok: true });
  });
}
