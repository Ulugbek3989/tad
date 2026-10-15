import { all, first, run, insert, notify } from '../lib/db.js';
import { json, readJson, str, int, badRequest, notFound, forbidden, fail, parseJSON } from '../lib/http.js';
import { requireUser, requireTeacher, isTeacher } from '../lib/auth.js';
import { assertCourseTeach, assertCourseView, assertGroupTeach, assertTeachesStudent } from '../lib/access.js';
import { gradeOpenAnswer } from '../lib/ai.js';
import { awardXP, giveBadge, checkBadges, BADGES } from '../lib/gamification.js';
import { METHODS, METHOD_CATEGORIES } from '../data/methods.js';

/** Topshiriq o'quvchiga tegishlimi (shaxsan yoki guruhi orqali)? */
async function assignmentVisible(env, a, userId) {
  if (a.student_id) return a.student_id === userId;
  if (a.group_id) return !!(await first(env, 'SELECT 1 FROM group_members WHERE group_id = ? AND user_id = ?', a.group_id, userId));
  return !!(await first(env, 'SELECT 1 FROM group_members gm JOIN groups g ON g.id = gm.group_id WHERE g.course_id = ? AND gm.user_id = ?', a.course_id, userId));
}

export default function (r) {
  r.get('/api/methods', async (ctx) => {
    requireUser(ctx);
    return json({ methods: METHODS, categories: METHOD_CATEGORIES });
  });

  r.get('/api/badges', async (ctx) => {
    requireUser(ctx);
    return json({ badges: Object.entries(BADGES).map(([key, b]) => ({ key, ...b })) });
  });

  // ---- Tekshirish navbati ----
  r.get('/api/review', async (ctx) => {
    const u = requireTeacher(ctx);
    const status = ctx.url.searchParams.get('status') || 'open';
    const courseId = int(ctx.url.searchParams.get('course_id'));
    const statuses = status === 'open' ? ['pending', 'ai_graded'] : status === 'all' ? ['pending', 'ai_graded', 'reviewed', 'graded'] : [status];
    const scope = u.role === 'admin' ? '1=1' : `(c.owner_id = ${Number(u.id)} OR c.id IN (SELECT course_id FROM groups WHERE teacher_id = ${Number(u.id)}))`;
    const rows = await all(
      ctx.env,
      `SELECT s.id, s.score, s.max_score, s.status, s.created_at, s.answer, s.ai_feedback, s.feedback,
              us.id AS user_id, us.name AS student, c.id AS course_id, c.title AS course_title,
              a.id AS activity_id, a.title AS activity_title, a.type AS activity_type,
              asg.id AS assignment_id, asg.title AS assignment_title
         FROM submissions s JOIN users us ON us.id = s.user_id
         LEFT JOIN activities a ON a.id = s.activity_id
         LEFT JOIN assignments asg ON asg.id = s.assignment_id
         JOIN courses c ON c.id = COALESCE(a.course_id, asg.course_id)
        WHERE s.status IN (${statuses.map(() => '?').join(',')}) AND ${scope}
          AND (a.type IS NULL OR a.type IN ('lab','practical','case','essay'))
          ${courseId ? 'AND c.id = ?' : ''}
        ORDER BY CASE s.status WHEN 'pending' THEN 0 WHEN 'ai_graded' THEN 1 ELSE 2 END, s.id DESC LIMIT 200`,
      ...statuses,
      ...(courseId ? [courseId] : []),
    );
    return json({ submissions: rows.map((s) => ({ ...s, answer: parseJSON(s.answer, {}), ai_feedback: parseJSON(s.ai_feedback) })) });
  });

  r.get('/api/submissions/:id', async (ctx) => {
    const u = requireUser(ctx);
    const s = await first(ctx.env, 'SELECT * FROM submissions WHERE id = ?', Number(ctx.params.id));
    if (!s) notFound();
    if (s.user_id !== u.id) {
      if (!isTeacher(u)) forbidden();
      await assertTeachesStudent(ctx.env, u, s.user_id);
    }
    const act = s.activity_id ? await first(ctx.env, 'SELECT * FROM activities WHERE id = ?', s.activity_id) : null;
    const asg = s.assignment_id ? await first(ctx.env, 'SELECT * FROM assignments WHERE id = ?', s.assignment_id) : null;
    const student = await first(ctx.env, 'SELECT id, name, email FROM users WHERE id = ?', s.user_id);
    return json({
      submission: { ...s, answer: parseJSON(s.answer, {}), details: parseJSON(s.details), ai_feedback: parseJSON(s.ai_feedback) },
      activity: act && isTeacher(u) ? { ...act, content: parseJSON(act.content, {}) } : act ? { id: act.id, title: act.title, type: act.type } : null,
      assignment: asg,
      student,
    });
  });

  r.patch('/api/submissions/:id', async (ctx) => {
    const u = requireTeacher(ctx);
    const s = await first(ctx.env, 'SELECT * FROM submissions WHERE id = ?', Number(ctx.params.id));
    if (!s) notFound();
    await assertTeachesStudent(ctx.env, u, s.user_id);
    const b = await readJson(ctx.req);
    const score = b.score === undefined ? s.score : Number(b.score);
    if (!Number.isFinite(score) || score < 0 || score > (s.max_score || 100)) badRequest(`Ball 0 dan ${s.max_score} gacha bo'lishi kerak`);
    await run(ctx.env, "UPDATE submissions SET score = ?, feedback = ?, status = 'reviewed', graded_by = ? WHERE id = ?", score, str(b.feedback, { max: 5000 }), u.id, s.id);
    const title = s.activity_id
      ? (await first(ctx.env, 'SELECT title FROM activities WHERE id = ?', s.activity_id))?.title
      : (await first(ctx.env, 'SELECT title FROM assignments WHERE id = ?', s.assignment_id))?.title;
    await notify(ctx.env, s.user_id, `Ishingiz baholandi: ${title}`, `Ball: ${score} / ${s.max_score}`, s.assignment_id ? `#/assignments/${s.assignment_id}` : `#/submission/${s.id}`);
    return json({ ok: true });
  });

  // ---- Qo'shimcha topshiriqlar ----
  r.get('/api/assignments', async (ctx) => {
    const u = requireUser(ctx);
    const courseId = int(ctx.url.searchParams.get('course_id'));
    if (isTeacher(u)) {
      const scope = u.role === 'admin' ? '1=1' : `(a.teacher_id = ${Number(u.id)} OR c.owner_id = ${Number(u.id)})`;
      const rows = await all(
        ctx.env,
        `SELECT a.*, c.title AS course_title, g.name AS group_name, st.name AS student_name,
                (SELECT COUNT(DISTINCT user_id) FROM submissions WHERE assignment_id = a.id) AS submitted
           FROM assignments a JOIN courses c ON c.id = a.course_id
           LEFT JOIN groups g ON g.id = a.group_id LEFT JOIN users st ON st.id = a.student_id
          WHERE ${scope} ${courseId ? 'AND a.course_id = ?' : ''} ORDER BY a.id DESC LIMIT 300`,
        ...(courseId ? [courseId] : []),
      );
      return json({ assignments: rows });
    }
    const rows = await all(
      ctx.env,
      `SELECT a.*, c.title AS course_title, us.name AS teacher_name,
              (SELECT MAX(score) FROM submissions WHERE assignment_id = a.id AND user_id = ?1) AS my_score,
              (SELECT status FROM submissions WHERE assignment_id = a.id AND user_id = ?1 ORDER BY id DESC LIMIT 1) AS my_status
         FROM assignments a JOIN courses c ON c.id = a.course_id JOIN users us ON us.id = a.teacher_id
        WHERE (a.student_id = ?1
           OR a.group_id IN (SELECT group_id FROM group_members WHERE user_id = ?1)
           OR (a.student_id IS NULL AND a.group_id IS NULL AND a.course_id IN (SELECT g.course_id FROM groups g JOIN group_members gm ON gm.group_id = g.id WHERE gm.user_id = ?1)))
          ${courseId ? 'AND a.course_id = ?2' : ''}
        ORDER BY (my_score IS NOT NULL), COALESCE(a.due_at, '9999'), a.id DESC`,
      u.id,
      ...(courseId ? [courseId] : []),
    );
    return json({ assignments: rows });
  });

  r.post('/api/assignments', async (ctx) => {
    const u = requireTeacher(ctx);
    const b = await readJson(ctx.req);
    const courseId = int(b.course_id);
    await assertCourseTeach(ctx.env, u, courseId);
    let groupId = int(b.group_id);
    const studentIds = Array.isArray(b.student_ids) ? b.student_ids.map(Number).filter(Boolean) : int(b.student_id) ? [int(b.student_id)] : [];
    if (groupId) {
      const g = await assertGroupTeach(ctx.env, u, groupId);
      if (g.course_id !== courseId) badRequest("Guruh bu kursga tegishli emas");
    }
    for (const sid of studentIds) await assertTeachesStudent(ctx.env, u, sid);
    const base = {
      title: str(b.title, { required: true, max: 200, name: 'Topshiriq nomi' }),
      description: str(b.description, { max: 20000 }),
      rubric: str(b.rubric, { max: 5000 }),
      points: Math.max(1, int(b.points, 10)),
      bonus_xp: Math.max(0, int(b.bonus_xp, 50)),
      ai_grading: b.ai_grading === false ? 0 : 1,
      due_at: str(b.due_at, { max: 30 }),
    };
    const targets = studentIds.length ? studentIds.map((sid) => ({ group_id: null, student_id: sid })) : [{ group_id: groupId || null, student_id: null }];
    const ids = [];
    for (const t of targets) {
      ids.push(await insert(
        ctx.env,
        'INSERT INTO assignments (course_id, teacher_id, group_id, student_id, title, description, rubric, points, bonus_xp, ai_grading, due_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)',
        courseId, u.id, t.group_id, t.student_id, base.title, base.description, base.rubric, base.points, base.bonus_xp, base.ai_grading, base.due_at,
      ));
    }
    // Bildirishnomalar
    const recipients = studentIds.length
      ? studentIds
      : (await all(ctx.env, groupId ? 'SELECT user_id FROM group_members WHERE group_id = ?' : 'SELECT gm.user_id FROM group_members gm JOIN groups g ON g.id = gm.group_id WHERE g.course_id = ?', groupId || courseId)).map((x) => x.user_id);
    for (let i = 0; i < recipients.length; i++) {
      const aid = studentIds.length ? ids[i] : ids[0];
      await notify(ctx.env, recipients[i], `📝 Qo'shimcha topshiriq: ${base.title}`, base.due_at ? `Muddat: ${base.due_at}` : null, `#/assignments/${aid}`);
    }
    return json({ ids }, 201);
  });

  r.get('/api/assignments/:id', async (ctx) => {
    const u = requireUser(ctx);
    const a = await first(ctx.env, 'SELECT a.*, c.title AS course_title, us.name AS teacher_name FROM assignments a JOIN courses c ON c.id = a.course_id JOIN users us ON us.id = a.teacher_id WHERE a.id = ?', Number(ctx.params.id));
    if (!a) notFound();
    if (isTeacher(u)) {
      await assertCourseTeach(ctx.env, u, a.course_id);
      const subs = await all(ctx.env, 'SELECT s.*, us.name AS student FROM submissions s JOIN users us ON us.id = s.user_id WHERE s.assignment_id = ? ORDER BY s.id DESC', a.id);
      return json({ assignment: a, submissions: subs.map((s) => ({ ...s, answer: parseJSON(s.answer, {}), ai_feedback: parseJSON(s.ai_feedback) })) });
    }
    if (!(await assignmentVisible(ctx.env, a, u.id))) forbidden();
    const subs = await all(ctx.env, 'SELECT * FROM submissions WHERE assignment_id = ? AND user_id = ? ORDER BY id DESC', a.id, u.id);
    return json({ assignment: a, submissions: subs.map((s) => ({ ...s, answer: parseJSON(s.answer, {}), ai_feedback: parseJSON(s.ai_feedback) })) });
  });

  r.post('/api/assignments/:id/submit', async (ctx) => {
    const u = requireUser(ctx);
    const a = await first(ctx.env, 'SELECT * FROM assignments WHERE id = ?', Number(ctx.params.id));
    if (!a) notFound();
    if (!(await assignmentVisible(ctx.env, a, u.id))) forbidden();
    const b = await readJson(ctx.req);
    const text = str(b.text, { required: true, max: 50000, name: 'Javob' });
    const link = str(b.link, { max: 1000 });
    const prev = await first(ctx.env, 'SELECT COUNT(*) AS n, MAX(score) AS best FROM submissions WHERE assignment_id = ? AND user_id = ?', a.id, u.id);
    if (prev.n >= 5) fail(409, "Topshirishlar soni 5 tadan oshmasligi kerak");
    let score = null;
    let ai = null;
    let status = 'pending';
    if (a.ai_grading) {
      ai = await gradeOpenAnswer(ctx.env, { title: a.title, task: a.description, rubric: a.rubric, answerText: text + (link ? `\nHavola: ${link}` : ''), maxPoints: a.points });
      score = ai.score;
      status = ai.provider === 'rule' ? 'pending' : 'ai_graded';
    }
    const id = await insert(
      ctx.env,
      'INSERT INTO submissions (assignment_id, user_id, answer, score, max_score, ai_feedback, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      a.id, u.id, JSON.stringify({ text, link }), score, a.points, ai ? JSON.stringify(ai) : null, status,
    );
    let xp = 0;
    if (!prev.n) xp += await awardXP(ctx.env, u.id, Math.round(a.bonus_xp * 0.4), `Qo'shimcha topshiriq topshirildi: ${a.title}`, a.course_id);
    const pct = score !== null ? score / a.points : 0;
    const prevPct = prev.best !== null ? prev.best / a.points : 0;
    if (pct > prevPct) xp += await awardXP(ctx.env, u.id, Math.round(a.bonus_xp * 0.6 * (pct - prevPct)), `Qo'shimcha topshiriq natijasi: ${a.title}`, a.course_id);
    if (pct >= 0.9) await giveBadge(ctx.env, u.id, 'extra_mile', a.title);
    await notify(ctx.env, a.teacher_id, `Topshiriq topshirildi: ${a.title}`, `${u.name}`, `#/review`);
    const badges = await checkBadges(ctx.env, u.id);
    return json({ result: { id, score, max: a.points, ai, status, xp, badges } });
  });

  r.delete('/api/assignments/:id', async (ctx) => {
    const u = requireTeacher(ctx);
    const a = await first(ctx.env, 'SELECT * FROM assignments WHERE id = ?', Number(ctx.params.id));
    if (!a) notFound();
    if (!(u.role === 'admin' || a.teacher_id === u.id)) await assertCourseTeach(ctx.env, u, a.course_id);
    await run(ctx.env, 'DELETE FROM assignments WHERE id = ?', a.id);
    return json({ ok: true });
  });

  // ---- Rag'batlantirish ----
  r.post('/api/rewards', async (ctx) => {
    const u = requireTeacher(ctx);
    const b = await readJson(ctx.req);
    const ids = Array.isArray(b.user_ids) ? b.user_ids.map(Number) : [int(b.user_id)];
    const xp = Math.max(-500, Math.min(1000, int(b.xp, 0)));
    const reason = str(b.reason, { max: 300 }) || "O'qituvchi tomonidan rag'batlantirildi";
    const badge = b.badge_key && BADGES[b.badge_key] ? b.badge_key : null;
    if (!xp && !badge) badRequest('XP yoki nishon tanlang');
    for (const id of ids.filter(Boolean)) {
      await assertTeachesStudent(ctx.env, u, id);
      if (xp) {
        await awardXP(ctx.env, id, xp, `🎁 ${reason}`, int(b.course_id), u.id);
        await notify(ctx.env, id, xp > 0 ? `🎁 Sizga +${xp} XP berildi` : `${xp} XP`, reason, '#/profile');
      }
      if (badge) await giveBadge(ctx.env, id, badge, reason, u.id);
      await checkBadges(ctx.env, id);
    }
    return json({ ok: true, count: ids.length });
  });

  // ---- E'lonlar ----
  r.get('/api/announcements', async (ctx) => {
    const u = requireUser(ctx);
    const courseId = int(ctx.url.searchParams.get('course_id'));
    let rows;
    if (courseId) await assertCourseView(ctx.env, u, courseId);
    if (isTeacher(u)) {
      rows = await all(
        ctx.env,
        `SELECT an.*, us.name AS author, c.title AS course_title, g.name AS group_name FROM announcements an
           JOIN courses c ON c.id = an.course_id LEFT JOIN users us ON us.id = an.author_id LEFT JOIN groups g ON g.id = an.group_id
          WHERE ${courseId ? 'an.course_id = ?' : '(an.author_id = ? OR c.owner_id = ?)'} ORDER BY an.id DESC LIMIT 50`,
        ...(courseId ? [courseId] : [u.id, u.id]),
      );
    } else {
      rows = await all(
        ctx.env,
        `SELECT an.*, us.name AS author, c.title AS course_title FROM announcements an
           JOIN courses c ON c.id = an.course_id LEFT JOIN users us ON us.id = an.author_id
          WHERE (an.group_id IN (SELECT group_id FROM group_members WHERE user_id = ?1)
             OR (an.group_id IS NULL AND an.course_id IN (SELECT g.course_id FROM groups g JOIN group_members gm ON gm.group_id = g.id WHERE gm.user_id = ?1)))
            ${courseId ? 'AND an.course_id = ?2' : ''}
          ORDER BY an.id DESC LIMIT 50`,
        u.id,
        ...(courseId ? [courseId] : []),
      );
    }
    return json({ announcements: rows });
  });

  r.post('/api/announcements', async (ctx) => {
    const u = requireTeacher(ctx);
    const b = await readJson(ctx.req);
    const courseId = int(b.course_id);
    await assertCourseTeach(ctx.env, u, courseId);
    const groupId = int(b.group_id);
    if (groupId) await assertGroupTeach(ctx.env, u, groupId);
    const title = str(b.title, { required: true, max: 200, name: 'Sarlavha' });
    const id = await insert(ctx.env, 'INSERT INTO announcements (course_id, group_id, author_id, title, body) VALUES (?, ?, ?, ?, ?)', courseId, groupId, u.id, title, str(b.body, { max: 10000 }));
    const recipients = await all(ctx.env, groupId ? 'SELECT user_id FROM group_members WHERE group_id = ?' : 'SELECT DISTINCT gm.user_id FROM group_members gm JOIN groups g ON g.id = gm.group_id WHERE g.course_id = ?', groupId || courseId);
    for (const r2 of recipients) await notify(ctx.env, r2.user_id, `📢 ${title}`, null, `#/courses/${courseId}`);
    return json({ id }, 201);
  });

  r.delete('/api/announcements/:id', async (ctx) => {
    const u = requireTeacher(ctx);
    const an = await first(ctx.env, 'SELECT * FROM announcements WHERE id = ?', Number(ctx.params.id));
    if (!an) notFound();
    if (an.author_id !== u.id) await assertCourseTeach(ctx.env, u, an.course_id);
    await run(ctx.env, 'DELETE FROM announcements WHERE id = ?', an.id);
    return json({ ok: true });
  });

  // ---- Bildirishnomalar ----
  r.get('/api/notifications', async (ctx) => {
    const u = requireUser(ctx);
    const rows = await all(ctx.env, 'SELECT * FROM notifications WHERE user_id = ? ORDER BY id DESC LIMIT 50', u.id);
    return json({ notifications: rows });
  });

  r.post('/api/notifications/read', async (ctx) => {
    const u = requireUser(ctx);
    await run(ctx.env, 'UPDATE notifications SET is_read = 1 WHERE user_id = ?', u.id);
    return json({ ok: true });
  });

  // ---- O'quvchi bo'yicha batafsil hisobot (o'qituvchi uchun) ----
  r.get('/api/students/:id/report', async (ctx) => {
    const u = requireTeacher(ctx);
    const sid = Number(ctx.params.id);
    await assertTeachesStudent(ctx.env, u, sid);
    const courseId = int(ctx.url.searchParams.get('course_id'));
    if (courseId) await assertCourseView(ctx.env, u, courseId);
    const student = await first(ctx.env, 'SELECT id, name, email, xp, streak, last_active_date, created_at FROM users WHERE id = ?', sid);
    const subs = await all(
      ctx.env,
      `SELECT s.id, s.score, s.max_score, s.status, s.created_at, a.title, a.type, l.title AS lesson_title
         FROM submissions s JOIN activities a ON a.id = s.activity_id JOIN lessons l ON l.id = a.lesson_id
        WHERE s.user_id = ? ${courseId ? 'AND a.course_id = ?' : ''} ORDER BY s.id DESC LIMIT 200`,
      sid,
      ...(courseId ? [courseId] : []),
    );
    const badges = (await all(ctx.env, 'SELECT badge_key, reason, created_at FROM user_badges WHERE user_id = ?', sid)).map((b) => ({ ...b, ...(BADGES[b.badge_key] || {}) }));
    return json({ student, submissions: subs, badges });
  });
}
