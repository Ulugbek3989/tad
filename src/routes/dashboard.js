import { all, first, today } from '../lib/db.js';
import { json } from '../lib/http.js';
import { requireUser, isTeacher } from '../lib/auth.js';
import { levelInfo, BADGES } from '../lib/gamification.js';
import { visibleCourses } from './courses.js';

export default function (r) {
  r.get('/api/dashboard', async (ctx) => {
    const u = requireUser(ctx);
    const env = ctx.env;
    const me = await first(env, 'SELECT id, name, role, xp, streak FROM users WHERE id = ?', u.id);
    const courses = await visibleCourses(env, u);

    if (isTeacher(u)) {
      const scope = u.role === 'admin' ? '1=1' : `(c.owner_id = ${Number(u.id)} OR c.id IN (SELECT course_id FROM groups WHERE teacher_id = ${Number(u.id)}))`;
      const pending = (await first(
        env,
        `SELECT COUNT(*) AS n FROM submissions s LEFT JOIN activities a ON a.id = s.activity_id
           LEFT JOIN assignments asg ON asg.id = s.assignment_id JOIN courses c ON c.id = COALESCE(a.course_id, asg.course_id)
          WHERE s.status IN ('pending','ai_graded') AND ${scope}`,
      )).n;
      const groups = await all(
        env,
        `SELECT g.id, g.name, g.join_code, c.title AS course_title, (SELECT COUNT(*) FROM group_members WHERE group_id = g.id) AS members
           FROM groups g JOIN courses c ON c.id = g.course_id WHERE ${u.role === 'admin' ? '1=1' : 'g.teacher_id = ' + Number(u.id)} ORDER BY g.id DESC LIMIT 12`,
      );
      const students = (await first(
        env,
        `SELECT COUNT(DISTINCT gm.user_id) AS n FROM group_members gm JOIN groups g ON g.id = gm.group_id
          WHERE ${u.role === 'admin' ? '1=1' : 'g.teacher_id = ' + Number(u.id)}`,
      )).n;
      const recent = await all(
        env,
        `SELECT s.id, s.score, s.max_score, s.status, s.created_at, us.name AS student, COALESCE(a.title, asg.title) AS title
           FROM submissions s JOIN users us ON us.id = s.user_id LEFT JOIN activities a ON a.id = s.activity_id
           LEFT JOIN assignments asg ON asg.id = s.assignment_id JOIN courses c ON c.id = COALESCE(a.course_id, asg.course_id)
          WHERE ${scope} ORDER BY s.id DESC LIMIT 10`,
      );
      return json({
        role: 'teacher',
        me: { ...me, level: levelInfo(me.xp) },
        stats: { courses: courses.length, groups: groups.length, students, pending },
        courses: courses.slice(0, 8).map((c) => ({ id: c.id, title: c.title, color: c.color, code: c.code })),
        groups,
        recent,
      });
    }

    const cids = courses.map((c) => c.id);
    const ph = cids.map(() => '?').join(',') || 'NULL';
    const actCounts = cids.length ? await all(env, `SELECT course_id, COUNT(*) AS n FROM activities WHERE course_id IN (${ph}) GROUP BY course_id`, ...cids) : [];
    const doneCounts = await all(
      env,
      'SELECT a.course_id, COUNT(DISTINCT s.activity_id) AS n FROM submissions s JOIN activities a ON a.id = s.activity_id WHERE s.user_id = ? GROUP BY a.course_id',
      u.id,
    );
    const nA = Object.fromEntries(actCounts.map((x) => [x.course_id, x.n]));
    const nD = Object.fromEntries(doneCounts.map((x) => [x.course_id, x.n]));
    // "Davom ettirish": birinchi bajarilmagan mashg'ulotga ega dars
    let resume = null;
    if (cids.length) {
      resume = await first(
        env,
        `SELECT l.id AS lesson_id, l.title AS lesson_title, c.title AS course_title, a.id AS activity_id, a.title AS activity_title
           FROM activities a JOIN lessons l ON l.id = a.lesson_id JOIN modules m ON m.id = l.module_id JOIN courses c ON c.id = a.course_id
          WHERE a.course_id IN (${ph}) AND NOT EXISTS (SELECT 1 FROM submissions s WHERE s.activity_id = a.id AND s.user_id = ?)
          ORDER BY c.id DESC, m.position, m.id, l.position, l.id, a.position, a.id LIMIT 1`,
        ...cids,
        u.id,
      );
    }
    const assignments = await all(
      env,
      `SELECT a.id, a.title, a.due_at, a.points, c.title AS course_title FROM assignments a JOIN courses c ON c.id = a.course_id
        WHERE (a.student_id = ?1 OR a.group_id IN (SELECT group_id FROM group_members WHERE user_id = ?1)
           OR (a.student_id IS NULL AND a.group_id IS NULL AND a.course_id IN (SELECT g.course_id FROM groups g JOIN group_members gm ON gm.group_id = g.id WHERE gm.user_id = ?1)))
          AND NOT EXISTS (SELECT 1 FROM submissions s WHERE s.assignment_id = a.id AND s.user_id = ?1)
        ORDER BY COALESCE(a.due_at, '9999') LIMIT 10`,
      u.id,
    );
    const due = (await first(env, 'SELECT COUNT(*) AS n FROM srs_cards WHERE user_id = ? AND due_date <= ?', u.id, today())).n;
    const badges = (await all(env, 'SELECT badge_key, created_at FROM user_badges WHERE user_id = ? ORDER BY id DESC LIMIT 8', u.id)).map((b) => ({ ...b, ...(BADGES[b.badge_key] || {}) }));
    const week = await all(env, "SELECT date(created_at) AS day, SUM(amount) AS xp FROM xp_events WHERE user_id = ? AND created_at >= datetime('now', '-7 days') GROUP BY day ORDER BY day", u.id);
    const announcements = await all(
      env,
      `SELECT an.id, an.title, an.body, an.created_at, c.title AS course_title FROM announcements an JOIN courses c ON c.id = an.course_id
        WHERE an.group_id IN (SELECT group_id FROM group_members WHERE user_id = ?1)
           OR (an.group_id IS NULL AND an.course_id IN (SELECT g.course_id FROM groups g JOIN group_members gm ON gm.group_id = g.id WHERE gm.user_id = ?1))
        ORDER BY an.id DESC LIMIT 5`,
      u.id,
    );
    const groups = await all(env, 'SELECT g.id, g.name FROM group_members gm JOIN groups g ON g.id = gm.group_id WHERE gm.user_id = ?', u.id);
    let rank = null;
    if (groups.length) {
      const r2 = await first(
        env,
        `SELECT COUNT(*) + 1 AS rank FROM group_members gm JOIN users us ON us.id = gm.user_id WHERE gm.group_id = ? AND us.xp > ?`,
        groups[0].id,
        me.xp,
      );
      rank = { group_id: groups[0].id, group: groups[0].name, rank: r2.rank };
    }
    return json({
      role: 'student',
      me: { ...me, level: levelInfo(me.xp) },
      courses: courses.map((c) => ({ id: c.id, title: c.title, color: c.color, code: c.code, progress: nA[c.id] ? Math.round(((nD[c.id] || 0) / nA[c.id]) * 100) : 0 })),
      resume,
      assignments,
      due_cards: due,
      badges,
      week,
      announcements,
      rank,
    });
  });
}
