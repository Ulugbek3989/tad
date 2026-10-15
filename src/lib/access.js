import { first } from './db.js';
import { forbidden, notFound } from './http.js';
import { isTeacher } from './auth.js';

/** Foydalanuvchi kursni ko'ra oladimi? Kurs yozuvini qaytaradi. */
export async function assertCourseView(env, user, courseId) {
  const course = await first(env, 'SELECT * FROM courses WHERE id = ?', courseId);
  if (!course) notFound('Kurs topilmadi');
  if (user.role === 'admin' || course.owner_id === user.id) return course;
  if (isTeacher(user)) {
    const g = await first(env, 'SELECT 1 FROM groups WHERE course_id = ? AND teacher_id = ?', courseId, user.id);
    if (g || course.published) return course;
    forbidden();
  }
  const m = await first(
    env,
    `SELECT 1 FROM group_members gm JOIN groups g ON g.id = gm.group_id
      WHERE g.course_id = ? AND gm.user_id = ?`,
    courseId,
    user.id,
  );
  if (!m) forbidden('Siz bu kursga yozilmagansiz');
  return course;
}

/** Kursni tahrirlash huquqi (egasi yoki admin). */
export async function assertCourseEdit(env, user, courseId) {
  const course = await first(env, 'SELECT * FROM courses WHERE id = ?', courseId);
  if (!course) notFound('Kurs topilmadi');
  if (user.role === 'admin' || (isTeacher(user) && course.owner_id === user.id)) return course;
  forbidden('Bu kursni tahrirlash huquqingiz yo\'q');
}

/** Kurs bo'yicha o'qituvchilik huquqi (egasi, admin yoki shu kursda guruhi bor o'qituvchi). */
export async function assertCourseTeach(env, user, courseId) {
  const course = await first(env, 'SELECT * FROM courses WHERE id = ?', courseId);
  if (!course) notFound('Kurs topilmadi');
  if (!isTeacher(user)) forbidden();
  if (user.role === 'admin' || course.owner_id === user.id) return course;
  const g = await first(env, 'SELECT 1 FROM groups WHERE course_id = ? AND teacher_id = ?', courseId, user.id);
  if (!g) forbidden();
  return course;
}

export async function assertGroupTeach(env, user, groupId) {
  const group = await first(env, 'SELECT * FROM groups WHERE id = ?', groupId);
  if (!group) notFound('Guruh topilmadi');
  if (user.role === 'admin' || group.teacher_id === user.id) return group;
  const c = await first(env, 'SELECT owner_id FROM courses WHERE id = ?', group.course_id);
  if (c && c.owner_id === user.id) return group;
  forbidden();
}

/** O'qituvchi talabaga tegishli (uning guruhlaridan birida) ekanini tekshiradi. */
export async function assertTeachesStudent(env, user, studentId) {
  if (user.role === 'admin') return;
  const r = await first(
    env,
    `SELECT 1 FROM group_members gm JOIN groups g ON g.id = gm.group_id
       LEFT JOIN courses c ON c.id = g.course_id
      WHERE gm.user_id = ? AND (g.teacher_id = ? OR c.owner_id = ?)`,
    studentId,
    user.id,
    user.id,
  );
  if (!r) forbidden("Bu o'quvchi sizning guruhlaringizda emas");
}
