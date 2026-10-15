// Sun'iy intellekt: Claude API (ANTHROPIC_API_KEY bo'lsa) yoki Cloudflare Workers AI.
// Ikkalasi ham bo'lmasa, qoidaga asoslangan zaxira usullar ishlaydi.
import { norm } from './grading.js';

export class AIUnavailable extends Error {}

export function aiProvider(env) {
  if (env.ANTHROPIC_API_KEY) return 'claude';
  if (env.AI) return 'workers-ai';
  return null;
}

export async function aiChat(env, { system, messages, maxTokens = 1500 }) {
  const provider = aiProvider(env);
  if (provider === 'claude') {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: env.CLAUDE_MODEL || 'claude-sonnet-5-5',
        max_tokens: maxTokens,
        system,
        messages,
      }),
    });
    if (!res.ok) throw new AIUnavailable(`Claude API xatosi: ${res.status} ${await res.text()}`);
    const data = await res.json();
    return (data.content || []).filter((b) => b.type === 'text').map((b) => b.text).join('');
  }
  if (provider === 'workers-ai') {
    const out = await env.AI.run(env.AI_MODEL || '@cf/meta/llama-3.3-70b-instruct-fp8-fast', {
      messages: [{ role: 'system', content: system }, ...messages],
      max_tokens: maxTokens,
    });
    const r = out?.response;
    if (typeof r === 'string') return r;
    if (r && typeof r === 'object') return JSON.stringify(r);
    if (out?.choices?.[0]?.message?.content) return out.choices[0].message.content;
    throw new AIUnavailable('Workers AI bo\'sh javob qaytardi');
  }
  throw new AIUnavailable("AI ulanmagan");
}

export function extractJSON(text) {
  if (!text) return null;
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenced ? fenced[1] : text;
  const start = candidate.search(/[[{]/);
  if (start < 0) return null;
  const open = candidate[start];
  const close = open === '{' ? '}' : ']';
  const end = candidate.lastIndexOf(close);
  if (end <= start) return null;
  try {
    return JSON.parse(candidate.slice(start, end + 1));
  } catch {
    return null;
  }
}

const UZ = "Faqat o'zbek tilida (lotin yozuvida) yoz.";

export async function aiJSON(env, system, user, maxTokens = 2000) {
  const text = await aiChat(env, {
    system: `${system}\n${UZ}\nJavobni faqat yaroqli JSON ko'rinishida qaytar, boshqa matnsiz.`,
    messages: [{ role: 'user', content: user }],
    maxTokens,
  });
  const data = extractJSON(text);
  if (!data) throw new AIUnavailable('AI javobini JSON sifatida o\'qib bo\'lmadi');
  return data;
}

/** Ochiq javobni (laboratoriya, keys, amaliy, esse, qo'shimcha topshiriq) baholash. */
export async function gradeOpenAnswer(env, { title, task, rubric, reference, answerText, maxPoints }) {
  if (!answerText || answerText.trim().length < 3) {
    return { score: 0, feedback: "Javob bo'sh yoki juda qisqa.", strengths: [], improvements: ['Topshiriqni to\'liq bajaring.'], provider: 'rule' };
  }
  try {
    const data = await aiJSON(
      env,
      `Sen tajribali, adolatli va rag'batlantiruvchi o'qituvchisan. O'quvchi javobini mezonlar asosida baholaysan.
Format: {"score": <0..${maxPoints} oralig'idagi son>, "feedback": "<2-4 gapli umumiy izoh>", "strengths": ["..."], "improvements": ["..."], "criteria": [{"name": "...", "score": <son>, "max": <son>, "comment": "..."}]}`,
      `Topshiriq nomi: ${title}
Topshiriq matni:
${truncate(task, 4000)}

Baholash mezonlari (rubrika):
${rubric || "Mazmunning to'g'riligi, to'liqligi, mantiqiy izchillik, misollar va xulosa."}
${reference ? `\nNamunaviy (to'g'ri) javob — faqat solishtirish uchun:\n${truncate(reference, 3000)}` : ''}

Maksimal ball: ${maxPoints}

O'quvchi javobi:
"""
${truncate(answerText, 8000)}
"""`,
    );
    const score = clamp(Number(data.score), 0, maxPoints);
    return {
      score: Number.isFinite(score) ? Math.round(score * 10) / 10 : 0,
      feedback: String(data.feedback || ''),
      strengths: arr(data.strengths),
      improvements: arr(data.improvements),
      criteria: Array.isArray(data.criteria) ? data.criteria.slice(0, 10) : [],
      provider: aiProvider(env),
    };
  } catch (e) {
    return heuristicGrade({ rubric, reference, answerText, maxPoints, error: e.message });
  }
}

/** AI mavjud bo'lmaganda: kalit so'zlar mosligi va hajmga qarab dastlabki baho (o'qituvchi tekshiradi). */
function heuristicGrade({ rubric, reference, answerText, maxPoints }) {
  const words = (s) => new Set(norm(s).split(' ').filter((w) => w.length > 4));
  const ref = words(`${reference || ''} ${rubric || ''}`);
  const ans = words(answerText);
  let overlap = 0;
  for (const w of ref) if (ans.has(w)) overlap++;
  const coverage = ref.size ? overlap / ref.size : 0.5;
  const lengthFactor = Math.min(1, answerText.split(/\s+/).length / 120);
  const score = Math.round(maxPoints * (0.6 * coverage + 0.4 * lengthFactor) * 10) / 10;
  return {
    score,
    feedback: "Dastlabki avtomatik baho (AI ulanmagan). Yakuniy bahoni o'qituvchi qo'yadi.",
    strengths: [],
    improvements: [],
    provider: 'rule',
    needs_review: true,
  };
}

const truncate = (s, n) => (String(s || '').length > n ? String(s).slice(0, n) + '…' : String(s || ''));
const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
const arr = (x) => (Array.isArray(x) ? x.map(String).slice(0, 8) : []);
export { truncate };
