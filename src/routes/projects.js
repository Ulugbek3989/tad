// Kurs resurslari va talabaning biznes loyihasi (vertikal loyiha portfeli)
import { all, first, run, notify } from '../lib/db.js';
import { json, readJson, str, int, badRequest, forbidden, notFound, parseJSON } from '../lib/http.js';
import { requireUser, requireTeacher, isTeacher } from '../lib/auth.js';
import { assertCourseView, assertCourseEdit, assertCourseTeach, assertTeachesStudent } from '../lib/access.js';
import { aiJSON, aiProvider, AIUnavailable, truncate } from '../lib/ai.js';
import { awardXP, giveBadge } from '../lib/gamification.js';
import { visibleCourses } from './courses.js';

/** Loyiha bo'limlari va "to'ldirilgan" deb hisoblash uchun minimal maydonlar soni. */
export const PROJECT_SECTIONS = {
  idea: 4, canvas: 7, persona: 6, market: 6, swot: 4, legal: 3,
  pricing: 4, marketing: 3, cashflow: 6, risks: 12, funding: 3, pitch: 3,
};

function filledCount(v) {
  if (v === null || v === undefined) return 0;
  if (Array.isArray(v)) return v.reduce((n, x) => n + filledCount(x), 0);
  if (typeof v === 'object') return Object.values(v).reduce((n, x) => n + filledCount(x), 0);
  return String(v).trim() ? 1 : 0;
}

export function projectProgress(data) {
  const done = {};
  for (const [k, min] of Object.entries(PROJECT_SECTIONS)) done[k] = filledCount(data?.[k]) >= min;
  return { done, count: Object.values(done).filter(Boolean).length, total: Object.keys(PROJECT_SECTIONS).length };
}

async function loadProject(env, userId, courseId) {
  const p = await first(env, 'SELECT * FROM projects WHERE user_id = ? AND course_id = ?', userId, courseId);
  const data = parseJSON(p?.data, {});
  return {
    data,
    progress: projectProgress(data),
    ai_feedback: parseJSON(p?.ai_feedback),
    teacher_comment: p?.teacher_comment || null,
    updated_at: p?.updated_at || null,
  };
}

export default function (r) {
  // ---- Kurs resurslari (lug'at, shablonlar, havolalar, adabiyotlar, keyslar) ----
  // Resurslar ochiq material: kursga yozilgan har bir kishi hamda e'lon qilingan kurslar uchun barcha foydalanuvchilar ko'radi
  r.get('/api/resources', async (ctx) => {
    const u = requireUser(ctx);
    const mine = new Set((await visibleCourses(ctx.env, u)).map((c) => c.id));
    const rows = await all(ctx.env,
      `SELECT c.id, c.title, c.code, c.color, c.published, cr.data FROM course_resources cr JOIN courses c ON c.id = cr.course_id ORDER BY c.id`);
    const courses = rows
      .filter((c) => mine.has(c.id) || c.published)
      .map((c) => {
        const d = parseJSON(c.data, {});
        return { id: c.id, title: c.title, code: c.code, color: c.color, enrolled: mine.has(c.id),
          counts: { glossary: d.glossary?.length || 0, templates: d.templates?.length || 0, cases: d.cases?.length || 0, links: (d.links || []).reduce((n, g) => n + (g.items?.length || 0), 0) } };
      })
      .filter((c) => Object.values(c.counts).some(Boolean))
      .sort((a, b) => Number(b.enrolled) - Number(a.enrolled));
    return json({ courses });
  });

  r.get('/api/courses/:id/resources', async (ctx) => {
    const u = requireUser(ctx);
    const id = Number(ctx.params.id);
    const course = await first(ctx.env, 'SELECT id, published FROM courses WHERE id = ?', id);
    if (!course) notFound('Kurs topilmadi');
    if (!course.published) await assertCourseView(ctx.env, u, id);
    const row = await first(ctx.env, 'SELECT data FROM course_resources WHERE course_id = ?', id);
    return json({ resources: parseJSON(row?.data, {}) });
  });

  r.put('/api/courses/:id/resources', async (ctx) => {
    const u = requireTeacher(ctx);
    const id = Number(ctx.params.id);
    await assertCourseEdit(ctx.env, u, id);
    const b = await readJson(ctx.req);
    const data = JSON.stringify(b.resources || {});
    if (data.length > 500000) badRequest('Resurslar hajmi juda katta');
    await run(ctx.env, `INSERT INTO course_resources (course_id, data, updated_at) VALUES (?, ?, datetime('now'))
      ON CONFLICT (course_id) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at`, id, data);
    return json({ ok: true });
  });

  // ---- Talabaning biznes loyihasi ----
  r.get('/api/courses/:id/project', async (ctx) => {
    const u = requireUser(ctx);
    const courseId = Number(ctx.params.id);
    const course = await assertCourseView(ctx.env, u, courseId);
    let userId = u.id;
    const asked = int(ctx.url.searchParams.get('user_id'));
    if (asked && asked !== u.id) {
      if (!isTeacher(u)) forbidden();
      await assertTeachesStudent(ctx.env, u, asked);
      userId = asked;
    }
    const owner = await first(ctx.env, 'SELECT id, name FROM users WHERE id = ?', userId);
    return json({ project: await loadProject(ctx.env, userId, courseId), owner, course: { id: course.id, title: course.title, code: course.code }, readonly: userId !== u.id });
  });

  r.put('/api/courses/:id/project', async (ctx) => {
    const u = requireUser(ctx);
    const courseId = Number(ctx.params.id);
    await assertCourseView(ctx.env, u, courseId);
    const b = await readJson(ctx.req);
    if (!b.data || typeof b.data !== 'object') badRequest("Loyiha ma'lumotlari noto'g'ri");
    const data = JSON.stringify(b.data);
    if (data.length > 200000) badRequest('Loyiha hajmi juda katta (200 KB dan oshmasin)');
    const prev = await first(ctx.env, 'SELECT progress FROM projects WHERE user_id = ? AND course_id = ?', u.id, courseId);
    const progress = projectProgress(b.data);
    await run(ctx.env, `INSERT INTO projects (user_id, course_id, data, progress, updated_at) VALUES (?, ?, ?, ?, datetime('now'))
      ON CONFLICT (user_id, course_id) DO UPDATE SET data = excluded.data, progress = MAX(projects.progress, excluded.progress), updated_at = excluded.updated_at`,
      u.id, courseId, data, progress.count);
    let xp = 0;
    const before = prev?.progress || 0;
    if (u.role === 'student' && progress.count > before) {
      xp = await awardXP(ctx.env, u.id, 15 * (progress.count - before), `Biznes loyiha: ${progress.count}/${progress.total} bo'lim tayyor`, courseId);
      if (progress.count === progress.total) await giveBadge(ctx.env, u.id, 'researcher', "Biznes loyihaning barcha bo'limlarini to'ldirdi");
    }
    return json({ ok: true, progress, xp });
  });

  // O'qituvchi: kurs bo'yicha barcha loyihalar
  r.get('/api/courses/:id/projects', async (ctx) => {
    const u = requireTeacher(ctx);
    const courseId = Number(ctx.params.id);
    await assertCourseTeach(ctx.env, u, courseId);
    const rows = await all(ctx.env,
      `SELECT DISTINCT us.id, us.name, g.name AS group_name, p.progress, p.updated_at, p.teacher_comment IS NOT NULL AS commented,
              json_extract(p.data, '$.idea.problem') AS problem, json_extract(p.data, '$.pitch.summary') AS summary
         FROM group_members gm JOIN groups g ON g.id = gm.group_id AND g.course_id = ?1
         JOIN users us ON us.id = gm.user_id
         LEFT JOIN projects p ON p.user_id = us.id AND p.course_id = ?1
        WHERE ${u.role === 'admin' ? '1=1' : '(g.teacher_id = ?2 OR (SELECT owner_id FROM courses WHERE id = ?1) = ?2)'}
        ORDER BY COALESCE(p.progress, 0) DESC, us.name`,
      courseId, ...(u.role === 'admin' ? [] : [u.id]));
    return json({ projects: rows, total_sections: Object.keys(PROJECT_SECTIONS).length });
  });

  r.patch('/api/courses/:id/projects/:uid', async (ctx) => {
    const u = requireTeacher(ctx);
    const courseId = Number(ctx.params.id);
    const uid = Number(ctx.params.uid);
    await assertCourseTeach(ctx.env, u, courseId);
    await assertTeachesStudent(ctx.env, u, uid);
    const b = await readJson(ctx.req);
    const comment = str(b.teacher_comment, { max: 5000 });
    await run(ctx.env, `INSERT INTO projects (user_id, course_id, teacher_comment) VALUES (?, ?, ?)
      ON CONFLICT (user_id, course_id) DO UPDATE SET teacher_comment = excluded.teacher_comment`, uid, courseId, comment);
    await notify(ctx.env, uid, "👩‍🏫 O'qituvchi biznes loyihangizga izoh qoldirdi", comment?.slice(0, 120), `#/courses/${courseId}/project`);
    return json({ ok: true });
  });

  // AI: butun loyihani ekspert sifatida baholash
  r.post('/api/courses/:id/project/review', async (ctx) => {
    const u = requireUser(ctx);
    const courseId = Number(ctx.params.id);
    await assertCourseView(ctx.env, u, courseId);
    const b = await readJson(ctx.req);
    let userId = u.id;
    if (b.user_id && Number(b.user_id) !== u.id) {
      if (!isTeacher(u)) forbidden();
      await assertTeachesStudent(ctx.env, u, Number(b.user_id));
      userId = Number(b.user_id);
    }
    const p = await loadProject(ctx.env, userId, courseId);
    if (p.progress.count < 3) badRequest("AI baholashi uchun kamida 3 ta bo'limni to'ldiring");
    let feedback;
    try {
      feedback = await aiJSON(ctx.env,
        `Sen tajribali biznes-murabbiy, bank kredit eksperti va startap investorisan. Talabaning biznes loyihasini (biznes-reja qoralamasini) baholaysan.
Mezonlar: muammo va mijoz aniqligi, biznes-model mantig'i, bozor va raqobat tahlili, moliyaviy hisob-kitoblarning to'g'riligi va realligi (narx, zararsizlik nuqtasi, pul oqimi), xavflar, taqdimotning ishonarliligi.
Format: {"score": <0..100>, "verdict": "<1 gap: investor/bank qarori>", "summary": "<3-4 gap>", "strengths": ["..."], "gaps": ["<eng muhim kamchiliklar>"], "next_steps": ["<aniq keyingi qadamlar>"], "questions": ["<investor beradigan 3 ta qiyin savol>"]}`,
        `Loyiha ma'lumotlari (JSON):\n${truncate(JSON.stringify(p.data), 12000)}`, 2000);
      feedback.provider = aiProvider(ctx.env);
    } catch (e) {
      if (!(e instanceof AIUnavailable)) throw e;
      const missing = Object.entries(p.progress.done).filter(([, d]) => !d).map(([k]) => k);
      feedback = {
        score: Math.round((p.progress.count / p.progress.total) * 100),
        verdict: "AI ulanmagan — bu bo'limlar to'liqligiga asoslangan dastlabki baho.",
        summary: `Loyihaning ${p.progress.count} / ${p.progress.total} bo'limi to'ldirilgan.`,
        strengths: [],
        gaps: missing.length ? [`To'ldirilmagan bo'limlar: ${missing.join(', ')}`] : [],
        next_steps: ["Moliyaviy bo'limlardagi raqamlarni bir-biriga bog'lang: narx × hajm = pul oqimidagi savdo tushumi."],
        questions: ['Birinchi 10 ta to\'lovchi mijozni qayerdan topasiz?', 'Savdo rejadagidan 30% kam bo\'lsa nima qilasiz?', 'Nima uchun mijoz raqobatchidan emas, sizdan sotib oladi?'],
        provider: 'rule',
      };
    }
    await run(ctx.env, `INSERT INTO projects (user_id, course_id, ai_feedback) VALUES (?, ?, ?)
      ON CONFLICT (user_id, course_id) DO UPDATE SET ai_feedback = excluded.ai_feedback`, userId, courseId, JSON.stringify(feedback));
    return json({ feedback });
  });
}
