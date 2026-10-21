import { simulate, publicSimulation } from './simulation.js';

// Mashg'ulot turlari, o'quvchiga ko'rsatishdan oldin javoblarni yashirish va avtomatik tekshirish

export const ACTIVITY_TYPES = {
  slides: { name: 'Taqdimot slaydlari', mode: 'view' },
  reading: { name: "O'quv materiali / video", mode: 'view' },
  quiz: { name: 'Test', mode: 'auto' },
  flashcards: { name: "Kartochkalar (takrorlash)", mode: 'view' },
  matching: { name: 'Moslashtirish', mode: 'auto' },
  ordering: { name: "Ketma-ketlikni tiklash", mode: 'auto' },
  fillblank: { name: "Bo'sh joyni to'ldirish", mode: 'auto' },
  classify: { name: 'Guruhlash (klassifikatsiya)', mode: 'auto' },
  lab: { name: 'Laboratoriya ishi', mode: 'ai' },
  practical: { name: "Amaliy topshiriq", mode: 'ai' },
  case: { name: 'Keys (vaziyatli masala)', mode: 'ai' },
  essay: { name: 'Esse / refleksiya', mode: 'ai' },
  board: { name: 'Interaktiv doska (metod)', mode: 'participate' },
  simulation: { name: "Simulyatsiya o'yini", mode: 'auto' },
};

export const isAiType = (t) => ACTIVITY_TYPES[t]?.mode === 'ai';

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function norm(s) {
  return String(s ?? '')
    .toLowerCase()
    .replace(/[‘’ʻʼ`´]/g, "'")
    .replace(/[.,;:!?"«»()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const BLANK_RE = /\[\[(.+?)\]\]/g;

export function parseBlanks(text) {
  const answers = [];
  const masked = String(text || '').replace(BLANK_RE, (_, a) => {
    answers.push(a.split('/').map((x) => x.trim()).filter(Boolean));
    return `{{${answers.length - 1}}}`;
  });
  return { masked, answers };
}

/** O'quvchi uchun mashg'ulot mazmunidan to'g'ri javoblarni olib tashlaydi. */
export function sanitizeContent(type, c = {}) {
  switch (type) {
    case 'slides':
      return { slides: (c.slides || []).map(({ notes, ...s }) => s) };
    case 'quiz':
      return {
        time_limit_min: c.time_limit_min || 0,
        shuffle: !!c.shuffle,
        questions: (c.questions || []).map((q, i) => ({
          i,
          type: q.type,
          text: q.text,
          image: q.image || null,
          options: q.options || [],
          points: q.points ?? 1,
        })),
      };
    case 'matching': {
      const pairs = c.pairs || [];
      return { lefts: pairs.map((p) => p.left), rights: shuffle(pairs.map((p) => p.right)) };
    }
    case 'ordering':
      return { prompt: c.prompt || '', items: shuffle(c.items || []) };
    case 'fillblank': {
      const { masked, answers } = parseBlanks(c.text);
      return {
        text: masked,
        count: answers.length,
        word_bank: c.word_bank ? shuffle(answers.map((a) => a[0])) : null,
      };
    }
    case 'classify': {
      const cats = c.categories || [];
      return { categories: cats.map((x) => x.name), items: shuffle(cats.flatMap((x) => x.items || [])) };
    }
    case 'simulation':
      return publicSimulation(c);
    case 'practical':
    case 'case':
    case 'lab':
    case 'essay': {
      const { reference_answer, ...rest } = c;
      return rest;
    }
    default:
      return c;
  }
}

/** Avtomatik tekshirish. {score, max, details} qaytaradi; score [0..max]. */
export function autoGrade(type, c = {}, answer = {}, maxPoints = 10) {
  switch (type) {
    case 'quiz': return gradeQuiz(c, answer, maxPoints);
    case 'matching': {
      const pairs = c.pairs || [];
      const given = answer.matches || [];
      const results = pairs.map((p, i) => norm(given[i]) === norm(p.right));
      return fraction(results, maxPoints, { results, correct: pairs.map((p) => p.right) });
    }
    case 'ordering': {
      const items = c.items || [];
      const given = answer.order || [];
      const results = items.map((it, i) => norm(given[i]) === norm(it));
      return fraction(results, maxPoints, { results, correct: items });
    }
    case 'fillblank': {
      const { answers } = parseBlanks(c.text);
      const given = answer.blanks || [];
      const results = answers.map((alts, i) => alts.some((a) => norm(a) === norm(given[i])));
      return fraction(results, maxPoints, { results, correct: answers.map((a) => a[0]) });
    }
    case 'classify': {
      const map = {};
      for (const cat of c.categories || []) for (const it of cat.items || []) map[norm(it)] = cat.name;
      const given = answer.placement || {};
      const keys = Object.keys(map);
      const givenNorm = {};
      for (const [k, v] of Object.entries(given)) givenNorm[norm(k)] = v;
      const results = keys.map((k) => givenNorm[k] === map[k]);
      const correct = {};
      for (const cat of c.categories || []) for (const it of cat.items || []) correct[it] = cat.name;
      return fraction(results, maxPoints, { results, correct });
    }
    case 'simulation': {
      const res = simulate(c, answer.decisions || []);
      if (!res.finished) return { score: 0, max: maxPoints, details: { ...res, ok: 0, total: 1 } };
      const frac = Math.max(0, Math.min(1, res.profit / (c.target_profit || 1)));
      return { score: round(frac * maxPoints), max: maxPoints, details: { ...res, ok: frac >= 1 ? 1 : 0, total: 1, target_profit: c.target_profit } };
    }
    default:
      return { score: maxPoints, max: maxPoints, details: { completed: true } };
  }
}

function fraction(results, maxPoints, details) {
  const ok = results.filter(Boolean).length;
  const total = results.length || 1;
  return { score: round((ok / total) * maxPoints), max: maxPoints, details: { ...details, ok, total } };
}

const round = (x) => Math.round(x * 100) / 100;

function gradeQuiz(c, answer, maxPoints) {
  const qs = c.questions || [];
  const given = answer.answers || {};
  let earned = 0;
  let total = 0;
  const results = qs.map((q, i) => {
    const pts = Number(q.points ?? 1);
    total += pts;
    const a = given[i];
    let frac = 0;
    switch (q.type) {
      case 'single':
        frac = Number(a) === Number(q.answer) ? 1 : 0;
        break;
      case 'truefalse':
        frac = String(a) === String(q.answer) ? 1 : 0;
        break;
      case 'multiple': {
        const correct = new Set((q.answer || []).map(Number));
        const sel = new Set((Array.isArray(a) ? a : []).map(Number));
        let good = 0;
        let bad = 0;
        for (const s of sel) (correct.has(s) ? good++ : bad++);
        frac = correct.size ? Math.max(0, (good - bad) / correct.size) : 0;
        break;
      }
      case 'short': {
        const accepted = Array.isArray(q.answer) ? q.answer : [q.answer];
        frac = accepted.some((x) => norm(x) === norm(a)) ? 1 : 0;
        break;
      }
      case 'numeric': {
        const v = Number(String(a ?? '').replace(',', '.'));
        const tol = Number(q.tolerance || 0);
        frac = a !== undefined && a !== '' && Math.abs(v - Number(q.answer)) <= tol + 1e-9 ? 1 : 0;
        break;
      }
      default:
        frac = 0;
    }
    earned += frac * pts;
    return { correct: frac === 1, partial: frac > 0 && frac < 1, answer: q.answer, explanation: q.explanation || null };
  });
  const score = total ? round((earned / total) * maxPoints) : 0;
  return { score, max: maxPoints, details: { results, ok: results.filter((r) => r.correct).length, total: qs.length } };
}

/** Ochiq javobni AI uchun matnga aylantirish. */
export function answerToText(type, content, answer) {
  if (!answer) return '';
  if (type === 'case' || type === 'lab') {
    const parts = [];
    if (type === 'lab') {
      if (answer.observations) parts.push(`Kuzatuvlar / o'lchovlar:\n${answer.observations}`);
      if (answer.steps_done) parts.push(`Bajarilgan bosqichlar: ${answer.steps_done.length} / ${(content.steps || []).length}`);
    }
    (content.questions || []).forEach((q, i) => parts.push(`Savol ${i + 1}: ${q}\nJavob: ${(answer.answers || [])[i] || '(javob yo\'q)'}`));
    if (answer.conclusion) parts.push(`Xulosa:\n${answer.conclusion}`);
    if (answer.text) parts.push(answer.text);
    return parts.join('\n\n');
  }
  return answer.text || '';
}
