export const all = async (env, sql, ...params) =>
  (await env.DB.prepare(sql).bind(...params).all()).results || [];

export const first = (env, sql, ...params) => env.DB.prepare(sql).bind(...params).first();

export const run = (env, sql, ...params) => env.DB.prepare(sql).bind(...params).run();

export async function insert(env, sql, ...params) {
  const r = await env.DB.prepare(sql).bind(...params).run();
  return r.meta.last_row_id;
}

export const today = () => new Date().toISOString().slice(0, 10);

export function addDays(dateStr, days) {
  const d = new Date(dateStr + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function notify(env, userId, title, body = null, link = null) {
  return run(env, 'INSERT INTO notifications (user_id, title, body, link) VALUES (?, ?, ?, ?)', userId, title, body, link);
}
