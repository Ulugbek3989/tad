// Jadvallarni Worker ishga tushgandan keyingi birinchi so'rovda yaratadi.
// Barcha migratsiyalar idempotent (IF NOT EXISTS), shuning uchun har bir izolyatda bir marta bajariladi.
import m1 from '../../migrations/0001_init.sql';
import m2 from '../../migrations/0002_projects.sql';

const MIGRATIONS = [m1, m2];
let ready = null;

export function ensureSchema(env) {
  if (!ready) {
    ready = (async () => {
      const statements = MIGRATIONS.join(';\n')
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
