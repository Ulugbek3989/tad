// Jadvallarni Worker ishga tushgandan keyingi birinchi so'rovda yaratadi.
// Barcha migratsiyalar idempotent (IF NOT EXISTS), shuning uchun har bir izolyatda bir marta bajariladi.
import m1 from '../../migrations/0001_init.sql';
import m2 from '../../migrations/0002_projects.sql';
import m3 from '../../migrations/0003_catalog_sync.sql';
import { syncCatalogCourses } from './catalog-sync.js';

const MIGRATIONS = [m1, m2, m3];
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
      // Katalog kurslarini yangi versiya bilan sinxronlash (xato bo'lsa ilova ishlashda davom etadi)
      try { await syncCatalogCourses(env); } catch (e) { console.error('catalog sync', e); }
    })().catch((e) => {
      ready = null;
      throw e;
    });
  }
  return ready;
}
