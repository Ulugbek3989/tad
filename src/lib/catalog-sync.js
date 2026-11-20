// Katalogdagi kurs yangilansa (yangi testlar, taqdimotlar), bazadagi mavjud kurs nusxalarini avtomatik yangilaydi.
// Faqat test (quiz) va taqdimot (slides) mazmuni yangilanadi; yetishmayotgan mashg'ulotlar qo'shiladi.
// O'qituvchi qo'shgan mashg'ulotlar va talabalar javoblari saqlanadi. Har bir izolyatda bir marta, versiya o'zgarganda ishlaydi.
import { CATALOG } from '../data/catalog.js';

const norm = (s) => String(s || '').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '');
const SYNC_TYPES = new Set(['quiz', 'slides']);

async function digest(obj) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(JSON.stringify(obj)));
  return [...new Uint8Array(buf)].slice(0, 12).map((b) => b.toString(16).padStart(2, '0')).join('');
}

function catalogFor(course) {
  return Object.values(CATALOG).find((c) => c.course && (
    (course.code && c.course.code && norm(c.course.code) === norm(course.code)) || norm(c.course.title) === norm(course.title)));
}

export async function syncCatalogCourses(env) {
  const courses = (await env.DB.prepare('SELECT c.id, c.title, c.code, s.hash FROM courses c LEFT JOIN catalog_sync s ON s.course_id = c.id').all()).results || [];
  for (const course of courses) {
    const data = catalogFor(course);
    if (!data) continue;
    const hash = await digest(data);
    if (course.hash === hash) continue;
    // Bir vaqtda ishga tushgan izolyatlardan faqat bittasi sinxronlaydi: avval versiyani "band qilamiz"
    const claim = await env.DB.prepare(
      "INSERT INTO catalog_sync (course_id, hash, synced_at) VALUES (?, ?, datetime('now')) ON CONFLICT(course_id) DO UPDATE SET hash = excluded.hash, synced_at = excluded.synced_at WHERE catalog_sync.hash <> excluded.hash",
    ).bind(course.id, hash).run();
    if (!claim.meta?.changes) continue;
    try {
      await syncCourse(env, course.id, data);
    } catch (e) {
      // Muvaffaqiyatsiz bo'lsa keyingi safar qayta urinish uchun eski holatga qaytaramiz
      if (course.hash) await env.DB.prepare('UPDATE catalog_sync SET hash = ? WHERE course_id = ?').bind(course.hash, course.id).run();
      else await env.DB.prepare('DELETE FROM catalog_sync WHERE course_id = ?').bind(course.id).run();
      throw e;
    }
  }
}

async function syncCourse(env, courseId, data) {
  const lessons = (await env.DB.prepare('SELECT id, title FROM lessons WHERE course_id = ?').bind(courseId).all()).results || [];
  const acts = (await env.DB.prepare('SELECT id, lesson_id, type, title, position FROM activities WHERE course_id = ? ORDER BY position, id').bind(courseId).all()).results || [];
  const byLesson = new Map(lessons.map((l) => [norm(l.title), l.id]));
  const stmts = [];
  const fullUpdate = new Set();
  // Katalogdagi dars almashtirilgan bo'lsa (masalan, 11-mavzu): eski darsni yangisiga aylantiramiz
  const catLessons = (data.modules || []).flatMap((m) => m.lessons || []);
  for (const mg of data.migrations?.lessons || []) {
    const lessonId = byLesson.get(norm(mg.from));
    const target = catLessons.find((l) => norm(l.title) === norm(mg.to));
    if (!lessonId || !target || byLesson.has(norm(mg.to))) continue;
    for (const rule of mg.remove || []) {
      const victim = acts.find((a) => a.lesson_id === lessonId && a.type === rule.type && String(a.title).startsWith(rule.title_prefix) && !a._removed);
      if (victim) {
        victim._removed = true;
        await env.DB.prepare('DELETE FROM activities WHERE id = ?').bind(victim.id).run();
      }
    }
    await env.DB.prepare('UPDATE lessons SET title = ?, summary = ?, content = ?, methods = ? WHERE id = ?')
      .bind(target.title, target.summary ?? null, target.content ?? null, JSON.stringify(target.methods || []), lessonId).run();
    byLesson.delete(norm(mg.from));
    byLesson.set(norm(mg.to), lessonId);
    fullUpdate.add(lessonId);
  }
  for (const m of data.modules || []) {
    for (const l of m.lessons || []) {
      const lessonId = byLesson.get(norm(l.title));
      if (!lessonId) continue;
      const dbActs = acts.filter((a) => a.lesson_id === lessonId && !a._removed);
      const full = fullUpdate.has(lessonId);
      const used = new Set();
      const order = [];
      const seen = {};
      for (const a of l.activities || []) {
        // Bir xil turdagi mashg'ulotlar tartib raqami bo'yicha juftlanadi (masalan, 1-test ↔ 1-test)
        const k = (seen[a.type] = (seen[a.type] ?? -1) + 1);
        const match = dbActs.filter((x) => x.type === a.type)[k];
        if (match) {
          used.add(match.id);
          order.push(match.id);
          if (full || SYNC_TYPES.has(a.type)) {
            stmts.push(env.DB.prepare('UPDATE activities SET rubric = ?, title = ?, instructions = ?, content = ?, max_points = ?, attempts = ? WHERE id = ?')
              .bind(a.rubric ?? null, a.title, a.instructions ?? null, JSON.stringify(a.content || {}), a.max_points ?? 10, a.attempts ?? 0, match.id));
          }
        } else if (full || SYNC_TYPES.has(a.type)) {
          order.push({ a });
        }
      }
      // O'qituvchi qo'shgan (katalogda yo'q) mashg'ulotlar oxirida saqlanadi
      dbActs.filter((x) => !used.has(x.id)).forEach((x) => order.push(x.id));
      order.forEach((item, pos) => {
        if (typeof item === 'number') {
          stmts.push(env.DB.prepare('UPDATE activities SET position = ? WHERE id = ?').bind(pos, item));
        } else {
          const a = item.a;
          stmts.push(env.DB.prepare('INSERT INTO activities (lesson_id, course_id, type, title, instructions, content, rubric, max_points, attempts, position) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
            .bind(lessonId, courseId, a.type, a.title, a.instructions ?? null, JSON.stringify(a.content || {}), a.rubric ?? null, a.max_points ?? 10, a.attempts ?? 0, pos));
        }
      });
    }
  }
  // Resurslar: katalogdagi yangi bo'limlar (kalitlar) mavjud yozuvga qo'shiladi
  if (data.resources) {
    const row = await env.DB.prepare('SELECT data FROM course_resources WHERE course_id = ?').bind(courseId).first();
    if (row) {
      let cur = {};
      try { cur = JSON.parse(row.data) || {}; } catch { cur = {}; }
      const merged = { ...data.resources, ...cur };
      if (Object.keys(merged).length !== Object.keys(cur).length) stmts.push(env.DB.prepare('UPDATE course_resources SET data = ? WHERE course_id = ?').bind(JSON.stringify(merged), courseId));
    }
  }
  for (let i = 0; i < stmts.length; i += 50) await env.DB.batch(stmts.slice(i, i + 50));
}
