import { all, first, run, insert } from '../lib/db.js';
import { json, readJson, str, int, badRequest, notFound, parseJSON } from '../lib/http.js';
import { requireUser, requireTeacher, isTeacher } from '../lib/auth.js';
import { assertCourseView, assertCourseEdit } from '../lib/access.js';
import { ACTIVITY_TYPES, sanitizeContent } from '../lib/grading.js';
import { awardXP, checkBadges } from '../lib/gamification.js';

const LESSON_KINDS = ['lecture', 'practical', 'lab', 'seminar', 'independent'];

function courseFields(b, partial = false) {
  const f = {};
  if (!partial || b.title !== undefined) f.title = str(b.title, { required: true, max: 200, name: 'Kurs nomi' });
  if (b.code !== undefined) f.code = str(b.code, { max: 50 });
  if (b.description !== undefined) f.description = str(b.description, { max: 5000 });
  if (b.syllabus !== undefined) f.syllabus = str(b.syllabus, { max: 200000 });
  if (b.literature !== undefined) f.literature = str(b.literature, { max: 50000 });
  if (b.objectives !== undefined) f.objectives = JSON.stringify(Array.isArray(b.objectives) ? b.objectives.map(String) : []);
  if (b.color !== undefined) f.color = /^#[0-9a-fA-F]{6}$/.test(b.color) ? b.color : '#4f46e5';
  if (b.published !== undefined) f.published = b.published ? 1 : 0;
  return f;
}

function lessonFields(b, partial = false) {
  const f = {};
  if (!partial || b.title !== undefined) f.title = str(b.title, { required: true, max: 200, name: 'Dars nomi' });
  if (b.summary !== undefined) f.summary = str(b.summary, { max: 2000 });
  if (b.content !== undefined) f.content = str(b.content, { max: 300000 });
  if (b.methods !== undefined) f.methods = JSON.stringify(Array.isArray(b.methods) ? b.methods.map(String) : []);
  if (b.hours !== undefined) f.hours = Number.isFinite(Number(b.hours)) ? Math.max(0, Number(b.hours)) : 2;
  if (b.kind !== undefined) f.kind = LESSON_KINDS.includes(b.kind) ? b.kind : 'lecture';
  return f;
}

function activityFields(b, partial = false) {
  const f = {};
  if (!partial || b.type !== undefined) {
    if (!ACTIVITY_TYPES[b.type]) badRequest("Noma'lum mashg'ulot turi");
    f.type = b.type;
  }
  if (!partial || b.title !== undefined) f.title = str(b.title, { required: true, max: 200, name: 'Nomi' });
  if (b.instructions !== undefined) f.instructions = str(b.instructions, { max: 20000 });
  if (b.content !== undefined) {
    const c = typeof b.content === 'string' ? parseJSON(b.content) : b.content;
    if (!c || typeof c !== 'object') badRequest("Mashg'ulot mazmuni noto'g'ri");
    f.content = JSON.stringify(c);
    if (f.content.length > 300000) badRequest('Mazmun juda katta');
  }
  if (b.rubric !== undefined) f.rubric = str(b.rubric, { max: 10000 });
  if (b.max_points !== undefined) f.max_points = Math.max(0, int(b.max_points, 10));
  if (b.attempts !== undefined) f.attempts = Math.max(0, int(b.attempts, 0));
  return f;
}

function updateSQL(table, fields, id) {
  const keys = Object.keys(fields);
  if (!keys.length) return null;
  return { sql: `UPDATE ${table} SET ${keys.map((k) => `${k} = ?`).join(', ')} WHERE id = ?`, params: [...keys.map((k) => fields[k]), id] };
}

function insertSQL(table, fields) {
  const keys = Object.keys(fields);
  return { sql: `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${keys.map(() => '?').join(', ')})`, params: keys.map((k) => fields[k]) };
}

async function nextPos(env, table, col, id) {
  const r = await first(env, `SELECT COALESCE(MAX(position), -1) + 1 AS p FROM ${table} WHERE ${col} = ?`, id);
  return r.p;
}

/** O'quvchining kurs bo'yicha natijalari: activity_id -> {best, max, attempts, status} */
export async function studentResults(env, userId, courseId) {
  const rows = await all(
    env,
    `SELECT s.activity_id, MAX(s.score) AS best, MAX(s.max_score) AS max, COUNT(*) AS attempts,
            SUM(CASE WHEN s.status = 'pending' THEN 1 ELSE 0 END) AS pending
       FROM submissions s JOIN activities a ON a.id = s.activity_id
      WHERE s.user_id = ? AND a.course_id = ? GROUP BY s.activity_id`,
    userId,
    courseId,
  );
  const map = {};
  for (const r of rows) map[r.activity_id] = r;
  return map;
}

export function courseProgress(activityIds, results) {
  if (!activityIds.length) return 0;
  const done = activityIds.filter((id) => results[id]).length;
  return Math.round((done / activityIds.length) * 100);
}

export async function visibleCourses(env, user) {
  if (user.role === 'admin') return all(env, 'SELECT * FROM courses ORDER BY id DESC');
  if (isTeacher(user)) {
    return all(
      env,
      `SELECT * FROM courses WHERE owner_id = ?1 OR published = 1
          OR id IN (SELECT course_id FROM groups WHERE teacher_id = ?1) ORDER BY id DESC`,
      user.id,
    );
  }
  return all(
    env,
    `SELECT DISTINCT c.* FROM courses c JOIN groups g ON g.course_id = c.id
       JOIN group_members gm ON gm.group_id = g.id WHERE gm.user_id = ? ORDER BY c.id DESC`,
    user.id,
  );
}

export default function (r) {
  r.get('/api/courses', async (ctx) => {
    const u = requireUser(ctx);
    const courses = await visibleCourses(ctx.env, u);
    const stats = await all(ctx.env, 'SELECT course_id, COUNT(*) AS n FROM activities GROUP BY course_id');
    const lessonStats = await all(ctx.env, 'SELECT course_id, COUNT(*) AS n FROM lessons GROUP BY course_id');
    const nAct = Object.fromEntries(stats.map((s) => [s.course_id, s.n]));
    const nLes = Object.fromEntries(lessonStats.map((s) => [s.course_id, s.n]));
    let done = {};
    if (u.role === 'student') {
      const rows = await all(
        ctx.env,
        `SELECT a.course_id, COUNT(DISTINCT s.activity_id) AS n FROM submissions s
           JOIN activities a ON a.id = s.activity_id WHERE s.user_id = ? GROUP BY a.course_id`,
        u.id,
      );
      done = Object.fromEntries(rows.map((x) => [x.course_id, x.n]));
    }
    return json({
      courses: courses.map((c) => ({
        id: c.id, title: c.title, code: c.code, description: c.description, color: c.color, published: c.published,
        owner_id: c.owner_id, lessons: nLes[c.id] || 0, activities: nAct[c.id] || 0,
        progress: nAct[c.id] ? Math.round(((done[c.id] || 0) / nAct[c.id]) * 100) : 0,
        can_edit: u.role === 'admin' || c.owner_id === u.id,
      })),
    });
  });

  r.post('/api/courses', async (ctx) => {
    const u = requireTeacher(ctx);
    const f = { ...courseFields(await readJson(ctx.req)), owner_id: u.id };
    const q = insertSQL('courses', f);
    const id = await insert(ctx.env, q.sql, ...q.params);
    return json({ id }, 201);
  });

  r.get('/api/courses/:id', async (ctx) => {
    const u = requireUser(ctx);
    const id = Number(ctx.params.id);
    const course = await assertCourseView(ctx.env, u, id);
    const modules = await all(ctx.env, 'SELECT * FROM modules WHERE course_id = ? ORDER BY position, id', id);
    const lessons = await all(ctx.env, 'SELECT id, module_id, title, summary, methods, hours, kind, position FROM lessons WHERE course_id = ? ORDER BY position, id', id);
    const acts = await all(ctx.env, 'SELECT id, lesson_id, type, title, max_points, position FROM activities WHERE course_id = ? ORDER BY position, id', id);
    const results = u.role === 'student' ? await studentResults(ctx.env, u.id, id) : {};
    const viewed = u.role === 'student'
      ? new Set((await all(ctx.env, 'SELECT lesson_id FROM lesson_progress lp JOIN lessons l ON l.id = lp.lesson_id WHERE lp.user_id = ? AND l.course_id = ?', u.id, id)).map((x) => x.lesson_id))
      : new Set();
    const canEdit = u.role === 'admin' || course.owner_id === u.id;
    const groups = isTeacher(u)
      ? await all(ctx.env, `SELECT g.*, (SELECT COUNT(*) FROM group_members WHERE group_id = g.id) AS members FROM groups g WHERE g.course_id = ? ${u.role === 'admin' || canEdit ? '' : 'AND g.teacher_id = ' + Number(u.id)} ORDER BY g.id`, id)
      : [];
    const owner = await first(ctx.env, 'SELECT name FROM users WHERE id = ?', course.owner_id);
    const out = {
      ...course,
      objectives: parseJSON(course.objectives, []),
      owner_name: owner?.name || null,
      can_edit: canEdit,
      groups,
      progress: courseProgress(acts.map((a) => a.id), results),
      modules: modules.map((m) => ({
        ...m,
        lessons: lessons.filter((l) => l.module_id === m.id).map((l) => {
          const la = acts.filter((a) => a.lesson_id === l.id).map((a) => ({ ...a, result: results[a.id] || null }));
          return {
            ...l,
            methods: parseJSON(l.methods, []),
            viewed: viewed.has(l.id),
            activities: la,
            done: la.length ? la.filter((a) => a.result).length : 0,
          };
        }),
      })),
    };
    return json({ course: out });
  });

  r.patch('/api/courses/:id', async (ctx) => {
    const u = requireTeacher(ctx);
    const id = Number(ctx.params.id);
    await assertCourseEdit(ctx.env, u, id);
    const q = updateSQL('courses', courseFields(await readJson(ctx.req), true), id);
    if (q) await run(ctx.env, q.sql, ...q.params);
    return json({ ok: true });
  });

  r.delete('/api/courses/:id', async (ctx) => {
    const u = requireTeacher(ctx);
    const id = Number(ctx.params.id);
    await assertCourseEdit(ctx.env, u, id);
    await run(ctx.env, 'DELETE FROM courses WHERE id = ?', id);
    return json({ ok: true });
  });

  // ---- Eksport / import (fan materiallarini ommaviy yuklash) ----
  r.get('/api/courses/:id/export', async (ctx) => {
    const u = requireTeacher(ctx);
    const id = Number(ctx.params.id);
    const c = await assertCourseEdit(ctx.env, u, id);
    const modules = await all(ctx.env, 'SELECT * FROM modules WHERE course_id = ? ORDER BY position, id', id);
    const lessons = await all(ctx.env, 'SELECT * FROM lessons WHERE course_id = ? ORDER BY position, id', id);
    const acts = await all(ctx.env, 'SELECT * FROM activities WHERE course_id = ? ORDER BY position, id', id);
    const res = await first(ctx.env, 'SELECT data FROM course_resources WHERE course_id = ?', id);
    const data = {
      format: 'tad-course-v1',
      resources: parseJSON(res?.data, undefined),
      course: { title: c.title, code: c.code, description: c.description, syllabus: c.syllabus, objectives: parseJSON(c.objectives, []), literature: c.literature, color: c.color },
      modules: modules.map((m) => ({
        title: m.title,
        description: m.description,
        lessons: lessons.filter((l) => l.module_id === m.id).map((l) => ({
          title: l.title, summary: l.summary, content: l.content, methods: parseJSON(l.methods, []), hours: l.hours, kind: l.kind,
          activities: acts.filter((a) => a.lesson_id === l.id).map((a) => ({
            type: a.type, title: a.title, instructions: a.instructions, content: parseJSON(a.content, {}), rubric: a.rubric, max_points: a.max_points, attempts: a.attempts,
          })),
        })),
      })),
    };
    return json(data, 200, { 'content-disposition': `attachment; filename="course-${id}.json"` });
  });

  r.post('/api/courses/import', async (ctx) => {
    const u = requireTeacher(ctx);
    const data = await readJson(ctx.req);
    const id = await importCourse(ctx.env, data, u.id);
    return json({ id }, 201);
  });

  // ---- Bo'limlar (modullar) ----
  r.post('/api/courses/:id/modules', async (ctx) => {
    const u = requireTeacher(ctx);
    const courseId = Number(ctx.params.id);
    await assertCourseEdit(ctx.env, u, courseId);
    const b = await readJson(ctx.req);
    const id = await insert(
      ctx.env,
      'INSERT INTO modules (course_id, title, description, position) VALUES (?, ?, ?, ?)',
      courseId,
      str(b.title, { required: true, max: 200, name: "Bo'lim nomi" }),
      str(b.description, { max: 5000 }),
      await nextPos(ctx.env, 'modules', 'course_id', courseId),
    );
    return json({ id }, 201);
  });

  r.patch('/api/modules/:id', async (ctx) => {
    const u = requireTeacher(ctx);
    const m = await first(ctx.env, 'SELECT * FROM modules WHERE id = ?', Number(ctx.params.id));
    if (!m) notFound();
    await assertCourseEdit(ctx.env, u, m.course_id);
    const b = await readJson(ctx.req);
    const f = {};
    if (b.title !== undefined) f.title = str(b.title, { required: true, max: 200 });
    if (b.description !== undefined) f.description = str(b.description, { max: 5000 });
    const q = updateSQL('modules', f, m.id);
    if (q) await run(ctx.env, q.sql, ...q.params);
    return json({ ok: true });
  });

  r.delete('/api/modules/:id', async (ctx) => {
    const u = requireTeacher(ctx);
    const m = await first(ctx.env, 'SELECT * FROM modules WHERE id = ?', Number(ctx.params.id));
    if (!m) notFound();
    await assertCourseEdit(ctx.env, u, m.course_id);
    await run(ctx.env, 'DELETE FROM modules WHERE id = ?', m.id);
    return json({ ok: true });
  });

  // ---- Darslar ----
  r.post('/api/modules/:id/lessons', async (ctx) => {
    const u = requireTeacher(ctx);
    const m = await first(ctx.env, 'SELECT * FROM modules WHERE id = ?', Number(ctx.params.id));
    if (!m) notFound();
    await assertCourseEdit(ctx.env, u, m.course_id);
    const f = { ...lessonFields(await readJson(ctx.req)), module_id: m.id, course_id: m.course_id, position: await nextPos(ctx.env, 'lessons', 'module_id', m.id) };
    const q = insertSQL('lessons', f);
    return json({ id: await insert(ctx.env, q.sql, ...q.params) }, 201);
  });

  r.get('/api/lessons/:id', async (ctx) => {
    const u = requireUser(ctx);
    const lesson = await first(ctx.env, 'SELECT * FROM lessons WHERE id = ?', Number(ctx.params.id));
    if (!lesson) notFound('Dars topilmadi');
    const course = await assertCourseView(ctx.env, u, lesson.course_id);
    const canEdit = u.role === 'admin' || course.owner_id === u.id;
    const teacher = isTeacher(u);
    const acts = await all(ctx.env, 'SELECT * FROM activities WHERE lesson_id = ? ORDER BY position, id', lesson.id);
    const results = u.role === 'student' ? await studentResults(ctx.env, u.id, lesson.course_id) : {};
    if (u.role === 'student') {
      const res = await run(ctx.env, 'INSERT OR IGNORE INTO lesson_progress (user_id, lesson_id) VALUES (?, ?)', u.id, lesson.id);
      if (res.meta.changes) {
        await awardXP(ctx.env, u.id, 10, `Darsni o'rgandi: ${lesson.title}`, lesson.course_id);
        await checkBadges(ctx.env, u.id);
      }
    }
    // Navigatsiya: oldingi / keyingi dars
    const order = await all(
      ctx.env,
      `SELECT l.id, l.title FROM lessons l JOIN modules m ON m.id = l.module_id
        WHERE l.course_id = ? ORDER BY m.position, m.id, l.position, l.id`,
      lesson.course_id,
    );
    const idx = order.findIndex((x) => x.id === lesson.id);
    return json({
      lesson: { ...lesson, methods: parseJSON(lesson.methods, []) },
      course: { id: course.id, title: course.title, color: course.color, can_edit: canEdit },
      prev: order[idx - 1] || null,
      next: order[idx + 1] || null,
      activities: acts.map((a) => ({
        id: a.id, type: a.type, title: a.title, instructions: a.instructions, max_points: a.max_points, attempts: a.attempts, rubric: a.rubric,
        content: teacher ? parseJSON(a.content, {}) : sanitizeContent(a.type, parseJSON(a.content, {})),
        result: results[a.id] || null,
      })),
    });
  });

  r.patch('/api/lessons/:id', async (ctx) => {
    const u = requireTeacher(ctx);
    const l = await first(ctx.env, 'SELECT * FROM lessons WHERE id = ?', Number(ctx.params.id));
    if (!l) notFound();
    await assertCourseEdit(ctx.env, u, l.course_id);
    const b = await readJson(ctx.req);
    const f = lessonFields(b, true);
    if (b.module_id !== undefined) {
      const m = await first(ctx.env, 'SELECT id FROM modules WHERE id = ? AND course_id = ?', Number(b.module_id), l.course_id);
      if (!m) badRequest("Bo'lim topilmadi");
      f.module_id = m.id;
    }
    const q = updateSQL('lessons', f, l.id);
    if (q) await run(ctx.env, q.sql, ...q.params);
    return json({ ok: true });
  });

  r.delete('/api/lessons/:id', async (ctx) => {
    const u = requireTeacher(ctx);
    const l = await first(ctx.env, 'SELECT * FROM lessons WHERE id = ?', Number(ctx.params.id));
    if (!l) notFound();
    await assertCourseEdit(ctx.env, u, l.course_id);
    await run(ctx.env, 'DELETE FROM lessons WHERE id = ?', l.id);
    return json({ ok: true });
  });

  // ---- Mashg'ulotlar ----
  r.post('/api/lessons/:id/activities', async (ctx) => {
    const u = requireTeacher(ctx);
    const l = await first(ctx.env, 'SELECT * FROM lessons WHERE id = ?', Number(ctx.params.id));
    if (!l) notFound();
    await assertCourseEdit(ctx.env, u, l.course_id);
    const f = { content: '{}', ...activityFields(await readJson(ctx.req)), lesson_id: l.id, course_id: l.course_id, position: await nextPos(ctx.env, 'activities', 'lesson_id', l.id) };
    const q = insertSQL('activities', f);
    return json({ id: await insert(ctx.env, q.sql, ...q.params) }, 201);
  });

  r.get('/api/activities/:id', async (ctx) => {
    const u = requireUser(ctx);
    const a = await first(ctx.env, 'SELECT * FROM activities WHERE id = ?', Number(ctx.params.id));
    if (!a) notFound();
    await assertCourseView(ctx.env, u, a.course_id);
    const content = isTeacher(u) ? parseJSON(a.content, {}) : sanitizeContent(a.type, parseJSON(a.content, {}));
    return json({ activity: { ...a, content } });
  });

  r.patch('/api/activities/:id', async (ctx) => {
    const u = requireTeacher(ctx);
    const a = await first(ctx.env, 'SELECT * FROM activities WHERE id = ?', Number(ctx.params.id));
    if (!a) notFound();
    await assertCourseEdit(ctx.env, u, a.course_id);
    const q = updateSQL('activities', activityFields(await readJson(ctx.req), true), a.id);
    if (q) await run(ctx.env, q.sql, ...q.params);
    return json({ ok: true });
  });

  r.delete('/api/activities/:id', async (ctx) => {
    const u = requireTeacher(ctx);
    const a = await first(ctx.env, 'SELECT * FROM activities WHERE id = ?', Number(ctx.params.id));
    if (!a) notFound();
    await assertCourseEdit(ctx.env, u, a.course_id);
    await run(ctx.env, 'DELETE FROM activities WHERE id = ?', a.id);
    return json({ ok: true });
  });

  // Tartibni o'zgartirish: { kind: 'modules'|'lessons'|'activities', ids: [...] }
  r.post('/api/reorder', async (ctx) => {
    const u = requireTeacher(ctx);
    const b = await readJson(ctx.req);
    const table = { modules: 'modules', lessons: 'lessons', activities: 'activities' }[b.kind];
    if (!table || !Array.isArray(b.ids) || !b.ids.length) badRequest("Noto'g'ri so'rov");
    const ids = b.ids.map(Number);
    const rows = await all(ctx.env, `SELECT id, course_id FROM ${table} WHERE id IN (${ids.map(() => '?').join(',')})`, ...ids);
    const courseIds = [...new Set(rows.map((x) => x.course_id))];
    if (courseIds.length !== 1 || rows.length !== ids.length) badRequest("Noto'g'ri elementlar");
    await assertCourseEdit(ctx.env, u, courseIds[0]);
    await ctx.env.DB.batch(ids.map((id, i) => ctx.env.DB.prepare(`UPDATE ${table} SET position = ? WHERE id = ?`).bind(i, id)));
    return json({ ok: true });
  });
}

/** Kursni JSON'dan yaratadi (bitta atomik batch). */
export async function importCourse(env, data, ownerId) {
  if (!data || typeof data !== 'object' || !data.course) badRequest("Import fayli formati noto'g'ri: 'course' maydoni yo'q");
  const cf = courseFields(data.course);
  const ids = await first(
    env,
    `SELECT (SELECT COALESCE(MAX(id),0) FROM courses) AS c, (SELECT COALESCE(MAX(id),0) FROM modules) AS m,
            (SELECT COALESCE(MAX(id),0) FROM lessons) AS l, (SELECT COALESCE(MAX(id),0) FROM activities) AS a`,
  );
  const courseId = ids.c + 1;
  let mId = ids.m;
  let lId = ids.l;
  let aId = ids.a;
  const stmts = [];
  const push = (table, f) => {
    const q = insertSQL(table, f);
    stmts.push(env.DB.prepare(q.sql).bind(...q.params));
  };
  push('courses', { id: courseId, ...cf, owner_id: ownerId });
  (data.modules || []).forEach((m, mi) => {
    const moduleId = ++mId;
    push('modules', { id: moduleId, course_id: courseId, title: str(m.title, { required: true, max: 200, name: "Bo'lim nomi" }), description: str(m.description, { max: 5000 }), position: mi });
    (m.lessons || []).forEach((l, li) => {
      const lessonId = ++lId;
      push('lessons', { id: lessonId, ...lessonFields(l), module_id: moduleId, course_id: courseId, position: li });
      (l.activities || []).forEach((a, ai) => {
        push('activities', { id: ++aId, content: '{}', ...activityFields(a), lesson_id: lessonId, course_id: courseId, position: ai });
      });
    });
  });
  if (data.resources && typeof data.resources === 'object') {
    stmts.push(env.DB.prepare('INSERT INTO course_resources (course_id, data) VALUES (?, ?)').bind(courseId, JSON.stringify(data.resources)));
  }
  if (stmts.length > 5000) badRequest('Kurs juda katta — qismlarga bo\'lib yuklang');
  await env.DB.batch(stmts);
  return courseId;
}
