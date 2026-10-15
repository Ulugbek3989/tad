import { first, run } from './db.js';
import { fail } from './http.js';

const ITERATIONS = 100000; // Workers'da PBKDF2 uchun maksimal qiymat
const SESSION_DAYS = 30;
export const COOKIE = 'tad_session';

const toHex = (buf) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
const fromHex = (hex) => new Uint8Array(hex.match(/.{2}/g).map((h) => parseInt(h, 16)));

export function randomToken(bytes = 32) {
  return toHex(crypto.getRandomValues(new Uint8Array(bytes)));
}

export async function hashPassword(password, saltHex = randomToken(16)) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt: fromHex(saltHex), iterations: ITERATIONS },
    key,
    256,
  );
  return { hash: toHex(bits), salt: saltHex };
}

export async function verifyPassword(password, hash, salt) {
  const { hash: h } = await hashPassword(password, salt);
  if (h.length !== hash.length) return false;
  let diff = 0;
  for (let i = 0; i < h.length; i++) diff |= h.charCodeAt(i) ^ hash.charCodeAt(i);
  return diff === 0;
}

export async function createSession(env, userId) {
  const token = randomToken();
  const expires = new Date(Date.now() + SESSION_DAYS * 864e5).toISOString();
  await run(env, 'INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)', token, userId, expires);
  return token;
}

export function sessionCookie(token, req) {
  const secure = new URL(req.url).protocol === 'https:' ? '; Secure' : '';
  const maxAge = token ? SESSION_DAYS * 86400 : 0;
  return `${COOKIE}=${token || ''}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure}`;
}

function readToken(req) {
  const auth = req.headers.get('authorization');
  if (auth?.startsWith('Bearer ')) return auth.slice(7);
  const cookie = req.headers.get('cookie') || '';
  const m = cookie.match(new RegExp(`(?:^|;\\s*)${COOKIE}=([a-f0-9]+)`));
  return m ? m[1] : null;
}

export async function loadUser(env, req) {
  const token = readToken(req);
  if (!token) return null;
  const user = await first(
    env,
    `SELECT u.id, u.email, u.name, u.role, u.xp, u.streak, u.last_active_date, u.bio, s.token
       FROM sessions s JOIN users u ON u.id = s.user_id
      WHERE s.token = ? AND s.expires_at > ?`,
    token,
    new Date().toISOString(),
  );
  return user || null;
}

export const isTeacher = (u) => u && (u.role === 'teacher' || u.role === 'admin');

export function requireUser(ctx) {
  if (!ctx.user) fail(401, 'Tizimga kiring');
  return ctx.user;
}

export function requireTeacher(ctx) {
  const u = requireUser(ctx);
  if (!isTeacher(u)) fail(403, "Bu amal faqat o'qituvchilar uchun");
  return u;
}

export function requireAdmin(ctx) {
  const u = requireUser(ctx);
  if (u.role !== 'admin') fail(403, 'Bu amal faqat administrator uchun');
  return u;
}
