import { all, first, run, today } from '../lib/db.js';
import { json, readJson, str, int, badRequest, notFound, fail, parseJSON } from '../lib/http.js';
import { requireUser, requireTeacher, isTeacher } from '../lib/auth.js';
import { assertCourseView, assertTeachesStudent, assertGroupTeach } from '../lib/access.js';
import { aiChat, aiJSON, aiProvider, AIUnavailable, truncate } from '../lib/ai.js';
import { ACTIVITY_TYPES } from '../lib/grading.js';
import { METHODS, methodByKey } from '../data/methods.js';
import { studentResults } from './courses.js';

const UZ = "Faqat o'zbek tilida (lotin yozuvida) yoz.";

/** O'quvchining kurs bo'yicha holati — tavsiyalar uchun asos. */
async function learnerSnapshot(env, userId, courseId) {
  const lessons = await all(
    env,
    `SELECT l.id, l.title, m.title AS module_title FROM lessons l JOIN modules m ON m.id = l.module_id
      WHERE l.course_id = ? ORDER BY m.position, m.id, l.position, l.id`,
    courseId,
  );
  const acts = await all(env, 'SELECT id, lesson_id, type, title, max_points FROM activities WHERE course_id = ?', courseId);
  const results = await studentResults(env, userId, courseId);
  const viewed = new Set((await all(env, 'SELECT lesson_id FROM lesson_progress WHERE user_id = ?', userId)).map((x) => x.lesson_id));
  const due = (await first(
    env,
    `SELECT COUNT(*) AS n FROM srs_cards sc JOIN activities a ON a.id = sc.activity_id WHERE sc.user_id = ? AND a.course_id = ? AND sc.due_date <= ?`,
    userId, courseId, today(),
  )).n;
  const weak = [];
  const strong = [];
  const todo = [];
  for (const a of acts) {
    const r = results[a.id];
    const lesson = lessons.find((l) => l.id === a.lesson_id);
    const item = { activity_id: a.id, lesson_id: a.lesson_id, title: a.title, type: ACTIVITY_TYPES[a.type]?.name || a.type, lesson: lesson?.title };
    if (!r) todo.push(item);
    else if (r.max > 0) {
      const pct = Math.round((r.best / r.max) * 100);
      (pct < 60 ? weak : pct >= 85 ? strong : []).push({ ...item, percent: pct });
    }
  }
  const unseen = lessons.filter((l) => !viewed.has(l.id));
  const done = acts.filter((a) => results[a.id]).length;
  return {
    progress: acts.length ? Math.round((done / acts.length) * 100) : 0,
    weak: weak.sort((a, b) => a.percent - b.percent),
    strong,
    todo,
    unseen,
    due_cards: due,
    lesson_order: lessons,
  };
}

function rulePlan(snap) {
  const plan = [];
  for (const w of snap.weak.slice(0, 3)) {
    plan.push({ kind: 'repeat', title: `"${w.title}" ni qayta bajaring`, reason: `Natijangiz ${w.percent}% — mavzuni mustahkamlash kerak (${w.lesson}).`, link: `#/lessons/${w.lesson_id}?a=${w.activity_id}` });
  }
  if (snap.due_cards > 0) plan.push({ kind: 'review', title: `${snap.due_cards} ta kartochkani takrorlang`, reason: 'Intervalli takrorlash bilimni uzoq muddat saqlaydi.', link: '#/review' });
  // Ketma-ketlik bo'yicha birinchi bajarilmagan mashg'ulotlar
  const order = new Map(snap.lesson_order.map((l, i) => [l.id, i]));
  const todo = [...snap.todo].sort((a, b) => (order.get(a.lesson_id) ?? 0) - (order.get(b.lesson_id) ?? 0));
  for (const t of todo.slice(0, 3)) {
    plan.push({ kind: 'next', title: `${t.type}: ${t.title}`, reason: `"${t.lesson}" darsidagi navbatdagi mashg'ulot.`, link: `#/lessons/${t.lesson_id}?a=${t.activity_id}` });
  }
  return plan.slice(0, 6);
}

export default function (r) {
  r.get('/api/ai/status', async (ctx) => {
    requireUser(ctx);
    return json({ provider: aiProvider(ctx.env) });
  });

  // ---- Shaxsiy tavsiyalar ----
  r.get('/api/ai/recommendations', async (ctx) => {
    const u = requireUser(ctx);
    const courseId = int(ctx.url.searchParams.get('course_id'));
    if (!courseId) badRequest('course_id kerak');
    await assertCourseView(ctx.env, u, courseId);
    let userId = u.id;
    const asked = int(ctx.url.searchParams.get('user_id'));
    if (asked && asked !== u.id) {
      if (!isTeacher(u)) fail(403, "Ruxsat yo'q");
      await assertTeachesStudent(ctx.env, u, asked);
      userId = asked;
    }
    const refresh = ctx.url.searchParams.get('refresh') === '1';
    const snap = await learnerSnapshot(ctx.env, userId, courseId);
    const plan = rulePlan(snap);
    const cached = await first(ctx.env, 'SELECT * FROM recommendations WHERE user_id = ? AND course_id = ?', userId, courseId);
    let advice = cached && !refresh ? parseJSON(cached.content) : null;
    if (refresh || !advice) {
      try {
        const course = await first(ctx.env, 'SELECT title FROM courses WHERE id = ?', courseId);
        advice = await aiJSON(
          ctx.env,
          `Sen shaxsiy ta'lim maslahatchisisan (learning coach). O'quvchi natijalarini tahlil qilib, qisqa, aniq va rag'batlantiruvchi tavsiyalar berasan.
Format: {"summary": "<2-3 gap: umumiy holat>", "strengths": ["..."], "focus": ["<e'tibor berish kerak bo'lgan mavzular>"], "tips": ["<3-5 ta amaliy o'quv maslahati (masalan, qaysi metod bilan o'rganish)>"], "motivation": "<1 gap>"}`,
          `Fan: ${course?.title}
Umumiy bajarilish: ${snap.progress}%
Zaif natijalar: ${snap.weak.map((w) => `${w.title} (${w.lesson}) — ${w.percent}%`).join('; ') || "yo'q"}
Kuchli natijalar: ${snap.strong.map((w) => `${w.title} — ${w.percent}%`).join('; ') || "hali yo'q"}
Bajarilmagan mashg'ulotlar soni: ${snap.todo.length}
O'qilmagan darslar: ${snap.unseen.map((l) => l.title).slice(0, 8).join('; ') || "yo'q"}
Takrorlanishi kerak bo'lgan kartochkalar: ${snap.due_cards}`,
          1200,
        );
        await run(
          ctx.env,
          `INSERT INTO recommendations (user_id, course_id, content, created_at) VALUES (?, ?, ?, datetime('now'))
           ON CONFLICT (user_id, course_id) DO UPDATE SET content = excluded.content, created_at = excluded.created_at`,
          userId, courseId, JSON.stringify(advice),
        );
      } catch (e) {
        if (!(e instanceof AIUnavailable)) console.error(e);
        advice = {
          summary: `Kurs bo'yicha bajarilish: ${snap.progress}%. ${snap.weak.length ? `${snap.weak.length} ta mashg'ulotda natija 60% dan past.` : 'Natijalaringiz yaxshi!'}`,
          strengths: snap.strong.slice(0, 3).map((s) => s.title),
          focus: [...new Set(snap.weak.map((s) => s.lesson || s.title))].slice(0, 3),
          tips: [
            "Har kuni 10 daqiqa kartochkalarni takrorlang (intervalli takrorlash).",
            "Xato qilgan test savollaringiz izohini o'qib, testni qayta ishlang.",
            "Tushunmagan joylarni AI-yordamchiga savol qilib bering.",
          ],
          motivation: "Kichik qadamlar bilan doimiy harakat — eng katta natija garovi!",
          offline: true,
        };
      }
    }
    return json({ progress: snap.progress, plan, advice, generated_at: cached && !refresh ? cached.created_at : new Date().toISOString() });
  });

  // ---- AI-yordamchi (sokratik tyutor) ----
  r.post('/api/ai/tutor', async (ctx) => {
    const u = requireUser(ctx);
    const b = await readJson(ctx.req);
    const courseId = int(b.course_id);
    await assertCourseView(ctx.env, u, courseId);
    const course = await first(ctx.env, 'SELECT title, description FROM courses WHERE id = ?', courseId);
    let lessonCtx = '';
    if (b.lesson_id) {
      const l = await first(ctx.env, 'SELECT title, summary, content FROM lessons WHERE id = ? AND course_id = ?', int(b.lesson_id), courseId);
      if (l) lessonCtx = `\n\nJoriy dars: ${l.title}\n${l.summary || ''}\n\nDars materiali (qisqartirilgan):\n${truncate(l.content, 6000)}`;
    }
    const messages = (Array.isArray(b.messages) ? b.messages : [])
      .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
      .slice(-12)
      .map((m) => ({ role: m.role, content: m.content.slice(0, 4000) }));
    if (!messages.length || messages[messages.length - 1].role !== 'user') badRequest('Savol yozing');
    if (messages[0].role !== 'user') messages.shift();
    const mode = b.mode === 'explain' ? 'explain' : 'socratic';
    const system = `Sen "${course.title}" fanidan AI-yordamchi (tyutor)san. ${UZ}
${mode === 'socratic'
    ? "Sokratik usulda ishlaysan: tayyor javobni darhol berma, yo'naltiruvchi savollar, ishoralar va qadamma-qadam fikrlash orqali o'quvchini javobga olib kel. Agar o'quvchi tushunchani tushuntirishni so'rasa — sodda tilda, misol bilan tushuntir."
    : "Tushunchalarni sodda tilda, hayotiy misollar, o'xshatishlar va qisqa xulosa bilan tushuntir."}
Baholanadigan test yoki topshiriqlarning tayyor javoblarini aytma — buning o'rniga yechish yo'lini o'rgat.
Javoblaring qisqa va aniq bo'lsin (odatda 150 so'zgacha), kerak bo'lsa markdown ishlat.
Fan haqida: ${course.description || ''}${lessonCtx}`;
    try {
      const reply = await aiChat(ctx.env, { system, messages, maxTokens: 900 });
      return json({ reply });
    } catch (e) {
      if (e instanceof AIUnavailable) {
        return json({ reply: "AI-yordamchi hozircha ulanmagan. Administrator Workers AI yoki ANTHROPIC_API_KEY ni sozlashi kerak. Savolingizni o'qituvchingizga yuboring.", offline: true });
      }
      throw e;
    }
  });

  // ---- O'qituvchi uchun kontent generatsiyasi ----
  r.post('/api/ai/generate', async (ctx) => {
    requireTeacher(ctx);
    const b = await readJson(ctx.req);
    const kind = String(b.kind || '');
    const text = truncate(str(b.text, { max: 60000 }) || '', 15000);
    const topic = str(b.topic, { max: 300 }) || '';
    const count = Math.min(30, Math.max(1, int(b.count, 5)));
    if (!text && !topic) badRequest("Mavzu yoki matn kiriting");
    const source = `Mavzu: ${topic}\n${text ? `Manba matn:\n"""\n${text}\n"""` : ''}`;
    const specs = {
      quiz: `${count} ta test savoli tuz (Bloom taksonomiyasining turli darajalari: eslash, tushunish, qo'llash, tahlil). Asosan "single" (bitta to'g'ri javob, 4 variant), bir nechta "multiple", "truefalse" bo'lsin.
Format: {"questions": [{"type": "single", "text": "...", "options": ["...","...","...","..."], "answer": <to'g'ri variant indeksi 0 dan>, "explanation": "..."}, {"type": "multiple", "text": "...", "options": [...], "answer": [<indekslar>], "explanation": "..."}, {"type": "truefalse", "text": "...", "answer": true, "explanation": "..."}]}`,
      flashcards: `${count} ta kartochka (atama — ta'rif) tuz. Format: {"cards": [{"front": "...", "back": "..."}]}`,
      matching: `${count} ta moslashtirish juftligi tuz (tushuncha — ta'rif/misol). Format: {"pairs": [{"left": "...", "right": "..."}]}`,
      ordering: `Mavzuga oid jarayon yoki algoritmning ${count} ta bosqichini to'g'ri tartibda yoz. Format: {"prompt": "...", "items": ["1-bosqich", "..."]}`,
      fillblank: `Mavzu bo'yicha ${count} ta bo'sh joyli matn tuz. Bo'sh joy [[javob]] ko'rinishida belgilanadi (muqobil javoblar / bilan). Format: {"text": "..."}`,
      case: `Real hayotiy vaziyat asosida keys (vaziyatli masala) tuz. Format: {"scenario": "<markdown, 150-300 so'z>", "questions": ["<${Math.min(count, 5)} ta tahliliy savol>"], "reference_answer": "<namunaviy yechim>", "rubric": "<baholash mezonlari>"}`,
      practical: `Amaliy topshiriq tuz. Format: {"task": "<markdown topshiriq sharti>", "hints": ["..."], "reference_answer": "<namunaviy yechim>", "rubric": "<baholash mezonlari>"}`,
      lab: `Laboratoriya ishi tuz. Format: {"objective": "...", "equipment": ["..."], "theory": "<markdown qisqa nazariya>", "steps": [{"title": "...", "body": "..."}], "questions": ["<nazorat savollari>"], "reference_answer": "...", "rubric": "..."}`,
      slides: `${count} ta slayddan iborat taqdimot tuz. Format: {"slides": [{"title": "...", "body": "<markdown: qisqa punktlar>", "notes": "<o'qituvchi uchun izoh>"}]}`,
      lesson_plan: `Dars ishlanmasi (texnologik xarita) tuz: maqsadlar, kutilayotgan natijalar, bosqichlar (vaqt bilan), qo'llaniladigan metodlar, baholash va uyga vazifa. ${b.methods?.length ? `Quyidagi metodlardan foydalan: ${b.methods.map((k) => methodByKey(k)?.name).filter(Boolean).join(', ')}.` : `Mos metodlarni tanla: ${METHODS.map((m) => m.name).join(', ')}.`} Dars davomiyligi: ${int(b.minutes, 80)} daqiqa.
Format: {"markdown": "<to'liq dars ishlanmasi markdown formatida>", "methods": ["<metod nomlari>"]}`,
      syllabus: `Berilgan fan dasturini modullar va darslarga ajrat. Format: {"modules": [{"title": "...", "lessons": [{"title": "...", "summary": "...", "kind": "lecture|practical|lab|seminar|independent", "hours": 2}]}]}`,
    };
    if (!specs[kind]) badRequest("Noma'lum generatsiya turi");
    try {
      const data = await aiJSON(ctx.env, `Sen tajribali metodist va fan o'qituvchisisan. O'quv materiallarini yuqori sifatda, ilmiy aniq va o'quvchi yoshiga mos tayyorlaysan.\n${specs[kind]}`, source, 4000);
      return json({ kind, content: data });
    } catch (e) {
      if (e instanceof AIUnavailable) fail(503, `AI mavjud emas: ${e.message}`);
      throw e;
    }
  });

  // ---- Guruh bo'yicha AI tahlil (o'qituvchi uchun) ----
  r.post('/api/ai/group-insights', async (ctx) => {
    const u = requireTeacher(ctx);
    const b = await readJson(ctx.req);
    const g = await assertGroupTeach(ctx.env, u, int(b.group_id));
    const stats = b.stats || {};
    try {
      const data = await aiJSON(
        ctx.env,
        `Sen ta'lim tahlilchisi va metodistsan. Guruh natijalarini tahlil qilib, o'qituvchiga aniq pedagogik tavsiyalar berasan.
Format: {"summary": "...", "problems": ["..."], "actions": ["<aniq harakatlar: qaysi mavzuni qaysi metod bilan qayta o'tish, kimga qo'shimcha topshiriq berish>"], "methods": ["<tavsiya etilgan metodlar>"]}`,
        `Guruh: ${g.name}\nStatistika: ${truncate(JSON.stringify(stats), 6000)}\nMavjud metodlar: ${METHODS.map((m) => m.name).join(', ')}`,
        1500,
      );
      return json({ insights: data });
    } catch (e) {
      if (e instanceof AIUnavailable) fail(503, 'AI mavjud emas');
      throw e;
    }
  });
}
