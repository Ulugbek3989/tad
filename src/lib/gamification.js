// Rag'batlantirish tizimi: XP, darajalar, seriya (streak) va nishonlar
import { all, first, run, today, addDays, notify } from './db.js';

export const BADGES = {
  first_step: { name: 'Birinchi qadam', icon: '🚀', desc: 'Birinchi mashg\'ulotni bajardi', auto: true },
  quiz_ace: { name: 'Test ustasi', icon: '🎯', desc: 'Testdan 100% natija oldi', auto: true },
  quiz_five: { name: 'Bilimdon', icon: '🧠', desc: '5 ta testni 80%+ natija bilan topshirdi', auto: true },
  lab_expert: { name: 'Tadqiqotchi', icon: '🔬', desc: '3 ta laboratoriya ishini bajardi', auto: true },
  case_solver: { name: 'Muammo yechuvchi', icon: '🧩', desc: '3 ta keysni yechdi', auto: true },
  practitioner: { name: 'Amaliyotchi', icon: '🛠️', desc: '5 ta amaliy topshiriqni bajardi', auto: true },
  bookworm: { name: 'Kitobxon', icon: '📚', desc: '10 ta darsni o\'rgandi', auto: true },
  memory: { name: 'Mustahkam xotira', icon: '🃏', desc: '100 ta kartochkani takrorladi', auto: true },
  streak_3: { name: '3 kunlik seriya', icon: '🔥', desc: '3 kun ketma-ket o\'qidi', auto: true },
  streak_7: { name: 'Haftalik seriya', icon: '⚡', desc: '7 kun ketma-ket o\'qidi', auto: true },
  streak_30: { name: 'Temir iroda', icon: '🏆', desc: '30 kun ketma-ket o\'qidi', auto: true },
  voice: { name: 'Faol ishtirokchi', icon: '💬', desc: 'Interaktiv doskaga 10 ta fikr yozdi', auto: true },
  xp_1000: { name: 'Ming XP', icon: '💎', desc: '1000 XP to\'pladi', auto: true },
  extra_mile: { name: 'Qo\'shimcha harakat', icon: '⭐', desc: 'Qo\'shimcha topshiriqni a\'lo bajardi', auto: true },
  // O'qituvchi beradigan nishonlar
  active: { name: 'Faol o\'quvchi', icon: '🙋', desc: 'Darsda faolligi uchun', auto: false },
  creative: { name: 'Ijodkor', icon: '🎨', desc: 'Ijodiy yondashuv uchun', auto: false },
  helper: { name: 'Yordamchi', icon: '🤝', desc: 'Sheriklariga yordam bergani uchun', auto: false },
  leader: { name: 'Lider', icon: '👑', desc: 'Guruh ishida yetakchilik uchun', auto: false },
  researcher: { name: 'Izlanuvchan', icon: '🔎', desc: 'Mustaqil izlanish uchun', auto: false },
  excellent: { name: 'A\'lochi', icon: '🥇', desc: 'A\'lo o\'zlashtirish uchun', auto: false },
};

export const levelFor = (xp) => Math.floor(Math.sqrt(Math.max(0, xp) / 50)) + 1;
export const xpForLevel = (lvl) => (lvl - 1) ** 2 * 50;

export const LEVEL_TITLES = ['Yangi boshlovchi', 'Izlanuvchi', 'O\'rganuvchi', 'Bilimdon', 'Tajribali', 'Mohir', 'Ekspert', 'Ustoz', 'Akademik', 'Afsona'];
export const levelTitle = (lvl) => LEVEL_TITLES[Math.min(LEVEL_TITLES.length - 1, lvl - 1)];

export function levelInfo(xp) {
  const level = levelFor(xp);
  const cur = xpForLevel(level);
  const next = xpForLevel(level + 1);
  return { level, title: levelTitle(level), xp, current_floor: cur, next_level_xp: next, progress: Math.round(((xp - cur) / (next - cur)) * 100) };
}

export async function awardXP(env, userId, amount, reason, courseId = null, givenBy = null) {
  amount = Math.round(amount);
  if (!amount) return 0;
  await env.DB.batch([
    env.DB.prepare('INSERT INTO xp_events (user_id, amount, reason, course_id, given_by) VALUES (?, ?, ?, ?, ?)').bind(userId, amount, reason, courseId, givenBy),
    env.DB.prepare('UPDATE users SET xp = MAX(0, xp + ?) WHERE id = ?').bind(amount, userId),
  ]);
  return amount;
}

/** Kunlik faollik: seriyani yangilaydi va kunning birinchi faolligi uchun bonus beradi. */
export async function touchStreak(env, user) {
  const t = today();
  if (user.last_active_date === t) return null;
  const streak = user.last_active_date === addDays(t, -1) ? (user.streak || 0) + 1 : 1;
  await run(env, 'UPDATE users SET streak = ?, last_active_date = ? WHERE id = ?', streak, t, user.id);
  user.streak = streak;
  user.last_active_date = t;
  await awardXP(env, user.id, 5 + Math.min(streak, 10), `Kunlik faollik (seriya: ${streak} kun)`);
  return streak;
}

export async function giveBadge(env, userId, key, reason = null, awardedBy = null) {
  if (!BADGES[key]) return false;
  if (BADGES[key].auto) {
    const has = await first(env, 'SELECT 1 FROM user_badges WHERE user_id = ? AND badge_key = ?', userId, key);
    if (has) return false;
  }
  await run(env, 'INSERT INTO user_badges (user_id, badge_key, reason, awarded_by) VALUES (?, ?, ?, ?)', userId, key, reason, awardedBy);
  const b = BADGES[key];
  await notify(env, userId, `${b.icon} Yangi nishon: ${b.name}`, reason || b.desc, '#/profile');
  return true;
}

/** Avtomatik nishonlarni tekshiradi; yangi olinganlar ro'yxatini qaytaradi. */
export async function checkBadges(env, userId) {
  const owned = new Set((await all(env, 'SELECT badge_key FROM user_badges WHERE user_id = ?', userId)).map((r) => r.badge_key));
  const stats = await first(
    env,
    `SELECT
       (SELECT COUNT(*) FROM submissions WHERE user_id = ?1) AS subs,
       (SELECT COUNT(*) FROM submissions s JOIN activities a ON a.id = s.activity_id WHERE s.user_id = ?1 AND a.type = 'quiz' AND s.score >= s.max_score AND s.max_score > 0) AS quiz_full,
       (SELECT COUNT(DISTINCT s.activity_id) FROM submissions s JOIN activities a ON a.id = s.activity_id WHERE s.user_id = ?1 AND a.type = 'quiz' AND s.score >= 0.8 * s.max_score) AS quiz80,
       (SELECT COUNT(DISTINCT s.activity_id) FROM submissions s JOIN activities a ON a.id = s.activity_id WHERE s.user_id = ?1 AND a.type = 'lab') AS labs,
       (SELECT COUNT(DISTINCT s.activity_id) FROM submissions s JOIN activities a ON a.id = s.activity_id WHERE s.user_id = ?1 AND a.type = 'case') AS cases,
       (SELECT COUNT(DISTINCT s.activity_id) FROM submissions s JOIN activities a ON a.id = s.activity_id WHERE s.user_id = ?1 AND a.type = 'practical') AS practicals,
       (SELECT COUNT(*) FROM lesson_progress WHERE user_id = ?1) AS lessons,
       (SELECT COUNT(*) FROM xp_events WHERE user_id = ?1 AND reason = 'Kartochka takrorlash') AS reviews,
       (SELECT COUNT(*) FROM posts WHERE user_id = ?1) AS posts,
       (SELECT xp FROM users WHERE id = ?1) AS xp,
       (SELECT streak FROM users WHERE id = ?1) AS streak`,
    userId,
  );
  const rules = {
    first_step: stats.subs >= 1,
    quiz_ace: stats.quiz_full >= 1,
    quiz_five: stats.quiz80 >= 5,
    lab_expert: stats.labs >= 3,
    case_solver: stats.cases >= 3,
    practitioner: stats.practicals >= 5,
    bookworm: stats.lessons >= 10,
    memory: stats.reviews >= 100,
    streak_3: stats.streak >= 3,
    streak_7: stats.streak >= 7,
    streak_30: stats.streak >= 30,
    voice: stats.posts >= 10,
    xp_1000: stats.xp >= 1000,
  };
  const earned = [];
  for (const [key, ok] of Object.entries(rules)) {
    if (ok && !owned.has(key)) {
      await giveBadge(env, userId, key);
      earned.push({ key, ...BADGES[key] });
    }
  }
  return earned;
}

/** Mashg'ulot turi bo'yicha maksimal XP. */
export const XP_BASE = { simulation: 60, quiz: 50, matching: 25, ordering: 25, fillblank: 25, classify: 25, lab: 80, practical: 60, case: 70, essay: 50, slides: 10, reading: 10, flashcards: 15, board: 10 };
