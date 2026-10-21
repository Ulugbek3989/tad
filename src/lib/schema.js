// Jadvallar mavjud bo'lmasa, birinchi so'rovda ularni yaratadi (migratsiya idempotent).
import schema from '../../migrations/0001_init.sql';

let ready = null;

export function ensureSchema(env) {
  if (!ready) {
    ready = (async () => {
      const t = await env.DB.prepare("SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = 'recommendations'").first();
      if (t) return;
      const statements = schema
        .replace(/--.*$/gm, '')
        .split(';')
        .map((s) => s.trim())
        .filter(Boolean);
      await env.DB.batch(statements.map((s) => env.DB.prepare(s)));
    })().catch((e) => {
      ready = null;
      throw e;
    });
  }
  return ready;
}
