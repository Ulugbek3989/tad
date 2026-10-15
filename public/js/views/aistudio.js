// AI studiya: o'qituvchi uchun o'quv materiallarini tez yaratish
import { api } from '../api.js';
import { html, setHTML, md, toast, formData, modal, download } from '../ui.js';
import { isTeacher, navigate } from '../app.js';
import { TYPES, typeIcon } from '../types.js';
import { getMethods } from './lesson.js';

const KINDS = ['quiz', 'flashcards', 'case', 'lab', 'practical', 'slides', 'matching', 'ordering', 'fillblank'];
const POINTS = { quiz: 10, case: 25, lab: 30, practical: 20, slides: 0, flashcards: 0, matching: 10, ordering: 10, fillblank: 10 };

export async function aiStudioView(view, ctx) {
  if (!isTeacher()) { navigate('/'); return; }
  const [{ provider }, { methods }] = await Promise.all([api.get('/api/ai/status'), getMethods()]);
  if (!ctx.isCurrent()) return;
  setHTML(view, html`<div class="page-head"><div><h1>✨ AI studiya</h1><p>Fan materiali asosida test, keys, laboratoriya ishi, slaydlar va dars ishlanmalarini bir necha soniyada yarating</p></div>
      <span class="badge ${provider ? 'success' : 'warning'}">AI: ${provider === 'claude' ? 'Claude' : provider === 'workers-ai' ? 'Workers AI' : 'ulanmagan'}</span></div>
    <div class="grid dash-split">
      <form class="card" id="gen-form">
        <div class="field"><label>Nima yaratamiz?</label>
          <div class="grid grid-3">${[...KINDS.map((k) => [k, typeIcon(k), TYPES[k].name]), ['lesson_plan', '🗒', 'Dars ishlanmasi']].map(([k, i, n], idx) => html`<label class="option" style="margin:0"><input type="radio" name="kind" value="${k}" ${idx === 0 ? 'checked' : ''}> ${i} ${n}</label>`)}</div></div>
        <div class="field"><label>Mavzu</label><input type="text" name="topic" required placeholder="Masalan: Nyutonning ikkinchi qonuni"></div>
        <div class="field"><label>Manba matn (ma'ruza, darslik bo'limi — ixtiyoriy, lekin sifatni oshiradi)</label><textarea name="text" rows="9"></textarea></div>
        <div class="grid grid-2"><div class="field"><label>Soni</label><input type="number" name="count" value="8" min="1" max="30"></div>
          <div class="field"><label>Dars davomiyligi (dars ishlanmasi uchun, daqiqa)</label><input type="number" name="minutes" value="80"></div></div>
        <div class="field"><label>Metodlar (dars ishlanmasi uchun, ixtiyoriy)</label><select name="methods" multiple size="5">${methods.map((m) => html`<option value="${m.key}">${m.name}</option>`)}</select></div>
        <button class="btn primary lg block">✨ Yaratish</button>
      </form>
      <div class="card" id="out"><div class="empty"><div class="big">🪄</div><p>Natija shu yerda paydo bo'ladi. Uni ko'rib chiqib, istalgan darsga qo'shishingiz mumkin.</p></div></div>
    </div>`);
  const out = view.querySelector('#out');
  view.querySelector('#gen-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const f = e.target;
    const d = formData(f);
    d.methods = [...f.elements.methods.selectedOptions].map((o) => o.value);
    const btn = f.querySelector('button');
    btn.disabled = true;
    setHTML(out, html`<div class="loading"><span class="spinner"></span>&nbsp; AI ishlamoqda… (10–40 soniya)</div>`);
    try {
      const { content } = await api.post('/api/ai/generate', { ...d, count: Number(d.count), minutes: Number(d.minutes) });
      showResult(out, d.kind, d.topic, content);
    } catch (err) {
      setHTML(out, html`<div class="alert danger">${err.message}</div>`);
    }
    btn.disabled = false;
  });
}

function preview(kind, c) {
  switch (kind) {
    case 'quiz': return html`<ol>${(c.questions || []).map((q) => html`<li style="margin-bottom:10px"><strong>${q.text}</strong>
      ${q.options ? html`<ul class="small">${q.options.map((o, i) => html`<li style="${[].concat(q.answer).map(Number).includes(i) ? 'color:var(--success);font-weight:700' : ''}">${o}</li>`)}</ul>` : html`<div class="small">Javob: ${String(q.answer)}</div>`}
      ${q.explanation ? html`<div class="small muted">💡 ${q.explanation}</div>` : ''}</li>`)}</ol>`;
    case 'flashcards': return html`<table class="table">${(c.cards || []).map((x) => html`<tr><td><strong>${x.front}</strong></td><td>${x.back}</td></tr>`)}</table>`;
    case 'matching': return html`<table class="table">${(c.pairs || []).map((x) => html`<tr><td>${x.left}</td><td>${x.right}</td></tr>`)}</table>`;
    case 'ordering': return html`<p>${c.prompt || ''}</p><ol>${(c.items || []).map((x) => html`<li>${x}</li>`)}</ol>`;
    case 'fillblank': return html`<div class="prose">${md(c.text || '')}</div>`;
    case 'slides': return html`${(c.slides || []).map((s, i) => html`<div class="card" style="box-shadow:none;margin-bottom:8px"><strong>${i + 1}. ${s.title}</strong><div class="prose small">${md(s.body)}</div></div>`)}`;
    case 'case': return html`<div class="prose">${md(c.scenario || '')}</div><ol>${(c.questions || []).map((q) => html`<li>${q}</li>`)}</ol>`;
    case 'practical': return html`<div class="prose">${md(c.task || '')}</div>`;
    case 'lab': return html`<p><strong>Maqsad:</strong> ${c.objective}</p><ol>${(c.steps || []).map((s) => html`<li><strong>${s.title}</strong> — ${s.body}</li>`)}</ol>`;
    case 'lesson_plan': return html`<div class="prose">${md(c.markdown || '')}</div>`;
    default: return html`<pre>${JSON.stringify(c, null, 2)}</pre>`;
  }
}

function showResult(out, kind, topic, content) {
  setHTML(out, html`<div class="card-head"><h3>Natija</h3><div class="row">
      <button class="btn sm" id="dl">💾 JSON</button>
      ${kind !== 'lesson_plan' ? html`<button class="btn sm primary" id="add">➕ Darsga qo'shish</button>` : html`<button class="btn sm" id="print">🖨 Chop etish</button>`}</div></div>
    <div style="max-height:70vh;overflow:auto">${preview(kind, content)}</div>`);
  out.querySelector('#dl').addEventListener('click', () => download(`${kind}.json`, JSON.stringify(content, null, 2)));
  out.querySelector('#print')?.addEventListener('click', () => window.print());
  out.querySelector('#add')?.addEventListener('click', () => addToLesson(kind, topic, content));
}

async function addToLesson(kind, topic, content) {
  const { courses } = await api.get('/api/courses');
  const editable = courses.filter((c) => c.can_edit);
  if (!editable.length) return toast("Tahrirlash mumkin bo'lgan kurs yo'q", 'error');
  modal({
    title: "Darsga qo'shish",
    body: html`<form id="al"><div class="field"><label>Kurs</label><select name="course" id="al-course">${editable.map((c) => html`<option value="${c.id}">${c.title}</option>`)}</select></div>
      <div class="field"><label>Dars</label><select name="lesson" id="al-lesson" required></select></div>
      <div class="field"><label>Mashg'ulot nomi</label><input type="text" name="title" value="${TYPES[kind].name}: ${topic}" required></div></form>`,
    footer: html`<button class="btn" data-close>Bekor qilish</button><button class="btn primary" form="al">Qo'shish</button>`,
    onMount: (el, close) => {
      const loadLessons = async () => {
        const { course } = await api.get(`/api/courses/${el.querySelector('#al-course').value}`);
        setHTML(el.querySelector('#al-lesson'), html`${course.modules.map((m) => html`<optgroup label="${m.title}">${m.lessons.map((l) => html`<option value="${l.id}">${l.title}</option>`)}</optgroup>`)}`);
      };
      el.querySelector('#al-course').addEventListener('change', loadLessons);
      loadLessons();
      el.querySelector('#al').addEventListener('submit', async (e) => {
        e.preventDefault();
        const d = formData(e.target);
        const { rubric, ...rest } = content;
        try {
          await api.post(`/api/lessons/${d.lesson}/activities`, { type: kind, title: d.title, content: rest, rubric: rubric || null, max_points: POINTS[kind] ?? 10 });
          close();
          toast("Darsga qo'shildi", 'success');
          navigate(`/edit/lesson/${d.lesson}`);
        } catch (err) { toast(err.message, 'error'); }
      });
    },
  });
}
