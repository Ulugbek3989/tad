import { all, first, run, insert, notify } from '../lib/db.js';
import { json, readJson, str, int, badRequest, notFound, forbidden } from '../lib/http.js';
import { requireUser, requireTeacher, isTeacher } from '../lib/auth.js';
import { assertGroupTeach } from '../lib/access.js';
import { levelInfo } from '../lib/gamification.js';

const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
function joinCode() {
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  return [...bytes].map((b) => CODE_ALPHABET[b % CODE_ALPHABET.length]).join('');
}

async function assertGroupView(env, user, groupId) {
  const g = await first(env, 'SELECT g.*, c.title AS course_title, c.owner_id FROM groups g JOIN courses c ON c.id = g.course_id WHERE g.id = ?', groupId);
  if (!g) notFound('Guruh topilmadi');
  if (user.role === 'admin' || g.teacher_id === user.id || g.owner_id === user.id) return g;
  const m = await first(env, 'SELECT 1 FROM group_members WHERE group_id = ? AND user_id = ?', groupId, user.id);
  if (!m) forbidden();
  return g;
}

/** Guruh bo'yicha jurnal: talabalar × mashg'ulotlar (eng yaxshi ball). */
export async function gradebook(env, group) {
  const students = await all(
    env,
    `SELECT u.id, u.name, u.email, u.xp FROM group_members gm JOIN users u ON u.id = gm.user_id
      WHERE gm.group_id = ? ORDER BY u.name`,
    group.id,
  );
  const activities = await all(
    env,
    `SELECT a.id, a.title, a.type, a.max_points, l.title AS lesson_title FROM activities a
       JOIN lessons l ON l.id = a.lesson_id JOIN modules m ON m.id = l.module_id
      WHERE a.course_id = ? ORDER BY m.position, m.id, l.position, l.id, a.position, a.id`,
    group.course_id,
  );
  const scores = await all(
    env,
    `SELECT s.user_id, s.activity_id, MAX(s.score) AS best, COUNT(*) AS attempts,
            MAX(CASE WHEN s.status = 'pending' THEN 1 ELSE 0 END) AS pending
       FROM submissions s JOIN group_members gm ON gm.user_id = s.user_id AND gm.group_id = ?
       JOIN activities a ON a.id = s.activity_id AND a.course_id = ?
      GROUP BY s.user_id, s.activity_id`,
    group.id,
    group.course_id,
  );
  const assignments = await all(
    env,
    `SELECT a.id, a.title, a.points, a.student_id FROM assignments a
      WHERE a.course_id = ? AND (a.group_id = ? OR a.student_id IN (SELECT user_id FROM group_members WHERE group_id = ?))
      ORDER BY a.id`,
    group.course_id,
    group.id,
    group.id,
  );
  const asScores = await all(
    env,
    `SELECT s.user_id, s.assignment_id, MAX(s.score) AS best FROM submissions s
      WHERE s.assignment_id IN (SELECT id FROM assignments WHERE course_id = ?) GROUP BY s.user_id, s.assignment_id`,
    group.course_id,
  );
  const cell = {};
  for (const s of scores) cell[`${s.user_id}:${s.activity_id}`] = s;
  const acell = {};
  for (const s of asScores) acell[`${s.user_id}:${s.assignment_id}`] = s.best;
  const graded = activities.filter((a) => a.max_points > 0);
  const totalMax = graded.reduce((x, a) => x + a.max_points, 0);
  const rows = students.map((st) => {
    let earned = 0;
    let done = 0;
    const cells = activities.map((a) => {
      const c = cell[`${st.id}:${a.id}`];
      if (c) { done++; earned += a.max_points > 0 ? c.best : 0; }
      return c ? { best: c.best, attempts: c.attempts, pending: !!c.pending } : null;
    });
    const extra = assignments.map((a) => (a.student_id && a.student_id !== st.id ? undefined : acell[`${st.id}:${a.id}`] ?? null));
    return {
      student: st,
      cells,
      extra,
      total: Math.round(earned * 10) / 10,
      percent: totalMax ? Math.round((earned / totalMax) * 100) : 0,
      progress: activities.length ? Math.round((done / activities.length) * 100) : 0,
    };
  });
  return { students, activities, assignments, rows, total_max: totalMax };
}

/** 100 ballik tizimdan 5 ballik bahoga. */
const grade5 = (p) => (p >= 86 ? 5 : p >= 71 ? 4 : p >= 55 ? 3 : 2);

function csvEscape(v) {
  const s = String(v ?? '');
  return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export default function (r) {
  r.get('/api/groups', async (ctx) => {
    const u = requireUser(ctx);
    let groups;
    if (u.role === 'admin') {
      groups = await all(ctx.env, `SELECT g.*, c.title AS course_title, us.name AS teacher_name, (SELECT COUNT(*) FROM group_members WHERE group_id = g.id) AS members FROM groups g JOIN courses c ON c.id = g.course_id JOIN users us ON us.id = g.teacher_id ORDER BY g.id DESC`);
    } else if (isTeacher(u)) {
      groups = await all(ctx.env, `SELECT g.*, c.title AS course_title, us.name AS teacher_name, (SELECT COUNT(*) FROM group_members WHERE group_id = g.id) AS members FROM groups g JOIN courses c ON c.id = g.course_id JOIN users us ON us.id = g.teacher_id WHERE g.teacher_id = ?1 OR c.owner_id = ?1 ORDER BY g.id DESC`, u.id);
    } else {
      groups = await all(ctx.env, `SELECT g.id, g.name, g.course_id, c.title AS course_title, us.name AS teacher_name FROM group_members gm JOIN groups g ON g.id = gm.group_id JOIN courses c ON c.id = g.course_id JOIN users us ON us.id = g.teacher_id WHERE gm.user_id = ? ORDER BY g.id DESC`, u.id);
    }
    return json({ groups });
  });

  r.post('/api/groups', async (ctx) => {
    const u = requireTeacher(ctx);
    const b = await readJson(ctx.req);
    const courseId = int(b.course_id);
    const course = await first(ctx.env, 'SELECT * FROM courses WHERE id = ?', courseId);
    if (!course) notFound('Kurs topilmadi');
    if (!(u.role === 'admin' || course.owner_id === u.id || course.published)) forbidden();
    let code = joinCode();
    while (await first(ctx.env, 'SELECT 1 FROM groups WHERE join_code = ?', code)) code = joinCode();
    const id = await insert(ctx.env, 'INSERT INTO groups (course_id, teacher_id, name, join_code) VALUES (?, ?, ?, ?)', courseId, u.id, str(b.name, { required: true, max: 100, name: 'Guruh nomi' }), code);
    return json({ id, join_code: code }, 201);
  });

  r.get('/api/groups/:id', async (ctx) => {
    const u = requireUser(ctx);
    const g = await assertGroupView(ctx.env, u, Number(ctx.params.id));
    const teacherView = isTeacher(u);
    const members = await all(
      ctx.env,
      `SELECT u.id, u.name, ${teacherView ? 'u.email,' : ''} u.xp, u.streak, gm.joined_at FROM group_members gm JOIN users u ON u.id = gm.user_id WHERE gm.group_id = ? ORDER BY u.name`,
      g.id,
    );
    if (!teacherView) delete g.join_code;
    return json({ group: g, members: members.map((m) => ({ ...m, level: levelInfo(m.xp).level })) });
  });

  r.patch('/api/groups/:id', async (ctx) => {
    const u = requireTeacher(ctx);
    const g = await assertGroupTeach(ctx.env, u, Number(ctx.params.id));
    const b = await readJson(ctx.req);
    if (b.name) await run(ctx.env, 'UPDATE groups SET name = ? WHERE id = ?', str(b.name, { max: 100 }), g.id);
    if (b.regenerate_code) {
      let code = joinCode();
      while (await first(ctx.env, 'SELECT 1 FROM groups WHERE join_code = ?', code)) code = joinCode();
      await run(ctx.env, 'UPDATE groups SET join_code = ? WHERE id = ?', code, g.id);
    }
    return json({ ok: true });
  });

  r.delete('/api/groups/:id', async (ctx) => {
    const u = requireTeacher(ctx);
    const g = await assertGroupTeach(ctx.env, u, Number(ctx.params.id));
    await run(ctx.env, 'DELETE FROM groups WHERE id = ?', g.id);
    return json({ ok: true });
  });

  r.post('/api/groups/join', async (ctx) => {
    const u = requireUser(ctx);
    const b = await readJson(ctx.req);
    const code = str(b.code, { required: true, max: 20, name: 'Kod' }).toUpperCase();
    const g = await first(ctx.env, 'SELECT g.*, c.title AS course_title FROM groups g JOIN courses c ON c.id = g.course_id WHERE g.join_code = ?', code);
    if (!g) notFound("Bunday kodli guruh topilmadi");
    await run(ctx.env, 'INSERT OR IGNORE INTO group_members (group_id, user_id) VALUES (?, ?)', g.id, u.id);
    await notify(ctx.env, g.teacher_id, `Yangi o'quvchi: ${u.name}`, `"${g.name}" guruhiga qo'shildi`, `#/groups/${g.id}`);
    return json({ group_id: g.id, course_id: g.course_id, course_title: g.course_title });
  });

  r.post('/api/groups/:id/members', async (ctx) => {
    const u = requireTeacher(ctx);
    const g = await assertGroupTeach(ctx.env, u, Number(ctx.params.id));
    const b = await readJson(ctx.req);
    const emails = String(b.emails || b.email || '').split(/[\s,;]+/).map((e) => e.trim().toLowerCase()).filter(Boolean);
    if (!emails.length) badRequest('Email kiriting');
    const added = [];
    const missing = [];
    for (const e of emails.slice(0, 200)) {
      const st = await first(ctx.env, 'SELECT id FROM users WHERE email = ?', e);
      if (!st) { missing.push(e); continue; }
      await run(ctx.env, 'INSERT OR IGNORE INTO group_members (group_id, user_id) VALUES (?, ?)', g.id, st.id);
      added.push(e);
    }
    return json({ added, missing });
  });

  r.delete('/api/groups/:id/members/:uid', async (ctx) => {
    const u = requireUser(ctx);
    const gid = Number(ctx.params.id);
    const uid = Number(ctx.params.uid);
    if (uid !== u.id) await assertGroupTeach(ctx.env, requireTeacher(ctx), gid);
    await run(ctx.env, 'DELETE FROM group_members WHERE group_id = ? AND user_id = ?', gid, uid);
    return json({ ok: true });
  });

  r.get('/api/groups/:id/gradebook', async (ctx) => {
    const u = requireTeacher(ctx);
    const g = await assertGroupTeach(ctx.env, u, Number(ctx.params.id));
    return json(await gradebook(ctx.env, g));
  });

  r.get('/api/groups/:id/gradebook.csv', async (ctx) => {
    const u = requireTeacher(ctx);
    const g = await assertGroupTeach(ctx.env, u, Number(ctx.params.id));
    const gb = await gradebook(ctx.env, g);
    const head = ["O'quvchi", 'Email', ...gb.activities.map((a) => `${a.title} (${a.max_points})`), ...gb.assignments.map((a) => `Qo'shimcha: ${a.title} (${a.points})`), 'Jami', 'Foiz', 'Baho (5)', 'Bajarilish %', 'XP'];
    const lines = [head.map(csvEscape).join(';')];
    for (const row of gb.rows) {
      lines.push([
        row.student.name, row.student.email,
        ...row.cells.map((c) => (c ? c.best : '')),
        ...row.extra.map((x) => (x === undefined || x === null ? '' : x)),
        row.total, row.percent, grade5(row.percent), row.progress, row.student.xp,
      ].map(csvEscape).join(';'));
    }
    return new Response('﻿' + lines.join('\n'), {
      headers: { 'content-type': 'text/csv; charset=utf-8', 'content-disposition': `attachment; filename="jurnal-${g.id}.csv"` },
    });
  });

  r.get('/api/groups/:id/analytics', async (ctx) => {
    const u = requireTeacher(ctx);
    const g = await assertGroupTeach(ctx.env, u, Number(ctx.params.id));
    const gb = await gradebook(ctx.env, g);
    const n = gb.students.length || 1;
    const perActivity = gb.activities.map((a, i) => {
      const vals = gb.rows.map((r) => r.cells[i]).filter(Boolean);
      const avg = vals.length && a.max_points ? vals.reduce((x, c) => x + c.best, 0) / vals.length / a.max_points : null;
      return { id: a.id, title: a.title, type: a.type, lesson_title: a.lesson_title, completion: Math.round((vals.length / n) * 100), avg_percent: avg === null ? null : Math.round(avg * 100) };
    });
    const atRisk = gb.rows
      .filter((r) => r.progress < 40 || (r.progress > 0 && r.percent < 55 * (r.progress / 100)))
      .map((r) => ({ id: r.student.id, name: r.student.name, progress: r.progress, percent: r.percent }));
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0 };
    for (const r of gb.rows) distribution[grade5(r.percent)]++;
    const weekly = await all(
      ctx.env,
      `SELECT date(s.created_at) AS day, COUNT(*) AS n FROM submissions s
         JOIN group_members gm ON gm.user_id = s.user_id AND gm.group_id = ?
        WHERE s.created_at >= datetime('now', '-14 days') GROUP BY day ORDER BY day`,
      g.id,
    );
    const pending = (await first(
      ctx.env,
      `SELECT COUNT(*) AS n FROM submissions s JOIN group_members gm ON gm.user_id = s.user_id AND gm.group_id = ?
        LEFT JOIN activities a ON a.id = s.activity_id LEFT JOIN assignments asg ON asg.id = s.assignment_id
        WHERE s.status IN ('pending','ai_graded') AND COALESCE(a.course_id, asg.course_id) = ?`,
      g.id,
      g.course_id,
    )).n;
    return json({
      group: g,
      students: gb.students.length,
      avg_progress: Math.round(gb.rows.reduce((x, r) => x + r.progress, 0) / n),
      avg_percent: Math.round(gb.rows.reduce((x, r) => x + r.percent, 0) / n),
      per_activity: perActivity,
      hardest: perActivity.filter((a) => a.avg_percent !== null).sort((a, b) => a.avg_percent - b.avg_percent).slice(0, 5),
      at_risk: atRisk,
      distribution,
      activity_by_day: weekly,
      pending_reviews: pending,
    });
  });

  r.get('/api/groups/:id/leaderboard', async (ctx) => {
    const u = requireUser(ctx);
    const g = await assertGroupView(ctx.env, u, Number(ctx.params.id));
    const period = ctx.url.searchParams.get('period') || 'all';
    let rows;
    if (period === 'week' || period === 'month') {
      const days = period === 'week' ? 7 : 30;
      rows = await all(
        ctx.env,
        `SELECT u.id, u.name, u.xp AS total_xp, COALESCE(SUM(x.amount), 0) AS xp
           FROM group_members gm JOIN users u ON u.id = gm.user_id
           LEFT JOIN xp_events x ON x.user_id = u.id AND x.created_at >= datetime('now', ?)
          WHERE gm.group_id = ? GROUP BY u.id ORDER BY xp DESC, u.name LIMIT 100`,
        `-${days} days`,
        g.id,
      );
    } else {
      rows = await all(
        ctx.env,
        `SELECT u.id, u.name, u.xp, u.xp AS total_xp FROM group_members gm JOIN users u ON u.id = gm.user_id WHERE gm.group_id = ? ORDER BY u.xp DESC, u.name LIMIT 100`,
        g.id,
      );
    }
    const badgeCounts = await all(ctx.env, 'SELECT user_id, COUNT(*) AS n FROM user_badges WHERE user_id IN (SELECT user_id FROM group_members WHERE group_id = ?) GROUP BY user_id', g.id);
    const bc = Object.fromEntries(badgeCounts.map((b) => [b.user_id, b.n]));
    return json({
      group: { id: g.id, name: g.name, course_title: g.course_title },
      leaders: rows.map((x, i) => ({ rank: i + 1, ...x, level: levelInfo(x.total_xp).level, badges: bc[x.id] || 0, me: x.id === u.id })),
    });
  });
}

export { grade5 };
