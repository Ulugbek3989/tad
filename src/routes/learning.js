import { all, first, run, insert, today, addDays } from '../lib/db.js';
import { json, readJson, str, int, badRequest, notFound, fail, forbidden, parseJSON } from '../lib/http.js';
import { requireUser, isTeacher } from '../lib/auth.js';
import { assertCourseView, assertTeachesStudent } from '../lib/access.js';
import { ACTIVITY_TYPES, autoGrade, answerToText } from '../lib/grading.js';
import { gradeOpenAnswer } from '../lib/ai.js';
import { awardXP, checkBadges, XP_BASE } from '../lib/gamification.js';
import { visibleCourses } from './courses.js';

const NEW_CARDS_PER_DAY = 20;

/** O'quvchi ishiga XP: eng yaxshi natija yaxshilangan qismi uchun. */
async function xpForResult(env, user, act, pct, prevPct) {
  const base = XP_BASE[act.type] || 20;
  const gain = Math.max(0, Math.round(base * (pct - Math.max(0, prevPct))));
  const firstBonus = prevPct < 0 ? Math.round(base * 0.2) : 0;
  const total = gain + firstBonus;
  if (total > 0) await awardXP(env, user.id, total, `${ACTIVITY_TYPES[act.type]?.name || 'Mashg\'ulot'}: ${act.title}`, act.course_id);
  return total;
}

export default function (r) {
  r.post('/api/activities/:id/submit', async (ctx) => {
    const u = requireUser(ctx);
    const act = await first(ctx.env, 'SELECT * FROM activities WHERE id = ?', Number(ctx.params.id));
    if (!act) notFound();
    await assertCourseView(ctx.env, u, act.course_id);
    const b = await readJson(ctx.req);
    const answer = b.answer && typeof b.answer === 'object' ? b.answer : {};
    if (JSON.stringify(answer).length > 100000) badRequest('Javob juda katta');
    const content = parseJSON(act.content, {});
    const mode = ACTIVITY_TYPES[act.type]?.mode;
    const preview = isTeacher(u); // o'qituvchi sinab ko'radi — saqlanmaydi

    const prev = preview ? null : await first(
      ctx.env,
      'SELECT COUNT(*) AS n, MAX(score) AS best, MAX(max_score) AS max FROM submissions WHERE user_id = ? AND activity_id = ?',
      u.id,
      act.id,
    );
    if (!preview && act.attempts > 0 && prev.n >= act.attempts) fail(409, `Urinishlar soni tugagan (${act.attempts})`);
    const prevPct = prev && prev.n ? (prev.max ? prev.best / prev.max : 1) : -1;

    let score;
    let details = null;
    let aiFeedback = null;
    let status = 'graded';
    const maxPoints = act.max_points;

    if (mode === 'view' || mode === 'participate') {
      if (prev && prev.n) return json({ result: { score: prev.best, max: prev.max, already: true } });
      score = maxPoints;
      details = { completed: true };
    } else if (mode === 'auto') {
      const g = autoGrade(act.type, content, answer, maxPoints);
      score = g.score;
      details = g.details;
      const used = (prev?.n || 0) + 1;
      const exhausted = act.attempts > 0 && used >= act.attempts;
      const perfect = g.score >= maxPoints;
      if (content.show_answers === false && !exhausted && !perfect) {
        // To'g'ri javoblarni yashiramiz, faqat to'g'ri/noto'g'ri belgisi qoladi
        if (details.results) details.results = details.results.map((x) => (typeof x === 'object' ? { correct: x.correct, partial: x.partial } : x));
        delete details.correct;
      }
    } else if (mode === 'ai') {
      const text = answerToText(act.type, content, answer);
      const g = await gradeOpenAnswer(ctx.env, {
        title: act.title,
        task: [act.instructions, content.task, content.scenario, content.objective, content.prompt, (content.questions || []).join('\n')].filter(Boolean).join('\n\n'),
        rubric: act.rubric,
        reference: content.reference_answer,
        answerText: text,
        maxPoints,
      });
      score = g.score;
      aiFeedback = g;
      status = g.provider === 'rule' ? 'pending' : 'ai_graded';
    } else {
      badRequest("Bu mashg'ulot turini topshirib bo'lmaydi");
    }

    if (preview) {
      return json({ result: { score, max: maxPoints, details, ai: aiFeedback, status, preview: true } });
    }

    const id = await insert(
      ctx.env,
      `INSERT INTO submissions (activity_id, user_id, answer, score, max_score, details, ai_feedback, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      act.id, u.id, JSON.stringify(answer), score, maxPoints, details ? JSON.stringify(details) : null, aiFeedback ? JSON.stringify(aiFeedback) : null, status,
    );
    const pct = maxPoints ? score / maxPoints : 1;
    const xp = await xpForResult(ctx.env, u, act, pct, prevPct);
    const badges = await checkBadges(ctx.env, u.id);
    return json({ result: { id, score, max: maxPoints, details, ai: aiFeedback, status, xp, badges, attempt: (prev?.n || 0) + 1 } });
  });

  r.get('/api/activities/:id/submissions', async (ctx) => {
    const u = requireUser(ctx);
    const act = await first(ctx.env, 'SELECT * FROM activities WHERE id = ?', Number(ctx.params.id));
    if (!act) notFound();
    await assertCourseView(ctx.env, u, act.course_id);
    let userId = u.id;
    const asked = int(ctx.url.searchParams.get('user_id'));
    if (asked && asked !== u.id) {
      if (!isTeacher(u)) forbidden();
      await assertTeachesStudent(ctx.env, u, asked);
      userId = asked;
    }
    const rows = await all(ctx.env, 'SELECT * FROM submissions WHERE activity_id = ? AND user_id = ? ORDER BY id DESC LIMIT 20', act.id, userId);
    return json({
      submissions: rows.map((s) => ({ ...s, answer: parseJSON(s.answer, {}), details: parseJSON(s.details), ai_feedback: parseJSON(s.ai_feedback) })),
    });
  });

  // ---- Intervalli takrorlash (SM-2) ----
  r.get('/api/srs/due', async (ctx) => {
    const u = requireUser(ctx);
    const courseId = int(ctx.url.searchParams.get('course_id'));
    const courses = (await visibleCourses(ctx.env, u)).filter((c) => !courseId || c.id === courseId);
    if (!courses.length) return json({ cards: [], stats: { due: 0, new: 0, learned: 0 } });
    const cids = courses.map((c) => c.id);
    const acts = await all(
      ctx.env,
      `SELECT a.id, a.title, a.content, a.course_id FROM activities a WHERE a.type = 'flashcards' AND a.course_id IN (${cids.map(() => '?').join(',')})`,
      ...cids,
    );
    const states = await all(ctx.env, 'SELECT * FROM srs_cards WHERE user_id = ?', u.id);
    const st = new Map(states.map((s) => [`${s.activity_id}:${s.card_index}`, s]));
    const t = today();
    const introducedToday = (await first(ctx.env, 'SELECT COUNT(*) AS n FROM srs_cards WHERE user_id = ? AND first_seen = ?', u.id, t)).n;
    let newBudget = Math.max(0, NEW_CARDS_PER_DAY - introducedToday);
    const due = [];
    let learned = 0;
    let newCount = 0;
    for (const a of acts) {
      const cards = parseJSON(a.content, {}).cards || [];
      cards.forEach((c, i) => {
        const s = st.get(`${a.id}:${i}`);
        const item = { activity_id: a.id, card_index: i, front: c.front, back: c.back, deck: a.title, course_id: a.course_id };
        if (!s) {
          newCount++;
          if (newBudget > 0) { due.push({ ...item, is_new: true }); newBudget--; }
        } else {
          if (s.interval_days >= 21) learned++;
          if (s.due_date <= t) due.push({ ...item, is_new: false });
        }
      });
    }
    return json({ cards: due.slice(0, 100), stats: { due: due.length, new: newCount, learned, total: states.length + newCount } });
  });

  r.post('/api/srs/review', async (ctx) => {
    const u = requireUser(ctx);
    const b = await readJson(ctx.req);
    const activityId = int(b.activity_id);
    const idx = int(b.card_index);
    const q = Math.min(5, Math.max(0, int(b.quality, 0)));
    const act = await first(ctx.env, "SELECT * FROM activities WHERE id = ? AND type = 'flashcards'", activityId);
    if (!act) notFound();
    await assertCourseView(ctx.env, u, act.course_id);
    const s = (await first(ctx.env, 'SELECT * FROM srs_cards WHERE user_id = ? AND activity_id = ? AND card_index = ?', u.id, activityId, idx)) || { ease: 2.5, interval_days: 0, reps: 0 };
    // SM-2 algoritmi
    let { ease, interval_days: interval, reps } = s;
    if (q < 3) {
      reps = 0;
      interval = 1;
    } else {
      reps += 1;
      interval = reps === 1 ? 1 : reps === 2 ? 3 : Math.round(interval * ease);
    }
    ease = Math.max(1.3, ease + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)));
    const due = addDays(today(), q < 3 ? 0 : interval);
    await run(
      ctx.env,
      `INSERT INTO srs_cards (user_id, activity_id, card_index, ease, interval_days, reps, due_date, first_seen) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT (user_id, activity_id, card_index) DO UPDATE SET ease = excluded.ease, interval_days = excluded.interval_days, reps = excluded.reps, due_date = excluded.due_date`,
      u.id, activityId, idx, ease, interval, reps, due, today(),
    );
    if (u.role === 'student') await awardXP(ctx.env, u.id, q >= 3 ? 2 : 1, 'Kartochka takrorlash', act.course_id);
    return json({ ok: true, next_due: due, interval });
  });

  // ---- Interaktiv doska (metodlar: aqliy hujum, klaster, Venn, INSERT, ...) ----
  r.get('/api/activities/:id/posts', async (ctx) => {
    const u = requireUser(ctx);
    const act = await first(ctx.env, 'SELECT * FROM activities WHERE id = ?', Number(ctx.params.id));
    if (!act) notFound();
    await assertCourseView(ctx.env, u, act.course_id);
    const posts = await all(
      ctx.env,
      `SELECT p.*, us.name AS author, EXISTS(SELECT 1 FROM post_likes pl WHERE pl.post_id = p.id AND pl.user_id = ?) AS liked
         FROM posts p JOIN users us ON us.id = p.user_id WHERE p.activity_id = ? ORDER BY p.id`,
      u.id,
      act.id,
    );
    const anonymous = !!parseJSON(act.content, {}).anonymous && !isTeacher(u);
    return json({
      posts: posts.map((p) => ({ ...p, author: anonymous && p.user_id !== u.id ? 'Ishtirokchi' : p.author, mine: p.user_id === u.id })),
    });
  });

  r.post('/api/activities/:id/posts', async (ctx) => {
    const u = requireUser(ctx);
    const act = await first(ctx.env, "SELECT * FROM activities WHERE id = ? AND type = 'board'", Number(ctx.params.id));
    if (!act) notFound();
    await assertCourseView(ctx.env, u, act.course_id);
    const b = await readJson(ctx.req);
    const content = str(b.content, { required: true, max: 2000, name: 'Fikr' });
    const id = await insert(ctx.env, 'INSERT INTO posts (activity_id, user_id, content, column_key) VALUES (?, ?, ?, ?)', act.id, u.id, content, str(b.column_key, { max: 100 }));
    let xp = 0;
    if (u.role === 'student') {
      const has = await first(ctx.env, 'SELECT 1 FROM submissions WHERE user_id = ? AND activity_id = ?', u.id, act.id);
      if (!has) {
        await run(ctx.env, "INSERT INTO submissions (activity_id, user_id, answer, score, max_score, status) VALUES (?, ?, '{}', ?, ?, 'graded')", act.id, u.id, act.max_points, act.max_points);
        xp += await awardXP(ctx.env, u.id, XP_BASE.board, `Interaktiv doska: ${act.title}`, act.course_id);
      }
      xp += await awardXP(ctx.env, u.id, 3, 'Doskaga fikr yozdi', act.course_id);
      await checkBadges(ctx.env, u.id);
    }
    return json({ id, xp }, 201);
  });

  r.post('/api/posts/:id/like', async (ctx) => {
    const u = requireUser(ctx);
    const p = await first(ctx.env, 'SELECT p.*, a.course_id FROM posts p JOIN activities a ON a.id = p.activity_id WHERE p.id = ?', Number(ctx.params.id));
    if (!p) notFound();
    await assertCourseView(ctx.env, u, p.course_id);
    const res = await run(ctx.env, 'INSERT OR IGNORE INTO post_likes (post_id, user_id) VALUES (?, ?)', p.id, u.id);
    if (res.meta.changes) {
      await run(ctx.env, 'UPDATE posts SET likes = likes + 1 WHERE id = ?', p.id);
      if (p.user_id !== u.id) await awardXP(ctx.env, p.user_id, 2, "Fikringiz yoqdi", p.course_id);
    } else {
      await run(ctx.env, 'DELETE FROM post_likes WHERE post_id = ? AND user_id = ?', p.id, u.id);
      await run(ctx.env, 'UPDATE posts SET likes = MAX(0, likes - 1) WHERE id = ?', p.id);
    }
    return json({ ok: true, liked: !!res.meta.changes });
  });

  r.delete('/api/posts/:id', async (ctx) => {
    const u = requireUser(ctx);
    const p = await first(ctx.env, 'SELECT p.*, a.course_id FROM posts p JOIN activities a ON a.id = p.activity_id WHERE p.id = ?', Number(ctx.params.id));
    if (!p) notFound();
    if (p.user_id !== u.id) {
      if (!isTeacher(u)) forbidden();
      await assertCourseView(ctx.env, u, p.course_id);
    }
    await run(ctx.env, 'DELETE FROM posts WHERE id = ?', p.id);
    return json({ ok: true });
  });
}
