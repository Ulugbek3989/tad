// AI-yordamchi (sokratik tyutor) — dars sahifalarida suzuvchi chat oynasi
import { api } from '../api.js';
import { html, setHTML, md, toast } from '../ui.js';

let context = null;
const histories = new Map();
let fab = null;
let panel = null;
let mode = 'socratic';

export function mountTutor() {
  if (fab) return;
  fab = document.createElement('button');
  fab.className = 'tutor-fab hidden';
  fab.title = 'AI-yordamchi';
  fab.textContent = '🤖';
  fab.addEventListener('click', toggle);
  document.body.appendChild(fab);
}

export function setTutorContext(ctx) {
  context = ctx;
  if (!fab || !fab.isConnected) { fab = null; panel = null; mountTutor(); }
  fab.classList.toggle('hidden', !ctx);
  if (!ctx && panel) { panel.remove(); panel = null; }
  if (ctx && panel) draw();
}

function key() { return context ? `${context.course_id}:${context.lesson_id || ''}` : ''; }

function toggle() {
  if (panel) { panel.remove(); panel = null; return; }
  panel = document.createElement('div');
  panel.className = 'tutor-panel';
  document.body.appendChild(panel);
  draw();
}

function draw() {
  if (!panel || !context) return;
  const msgs = histories.get(key()) || [];
  setHTML(panel, html`<div class="head"><span style="font-size:1.3rem">🤖</span><div style="flex:1;min-width:0"><strong>AI-yordamchi</strong><div class="small" style="opacity:.85;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${context.title || ''}</div></div>
      <select id="tutor-mode" style="width:auto;padding:4px 6px;font-size:.8rem;background:rgba(255,255,255,.2);color:#fff;border:0">
        <option value="socratic" ${mode === 'socratic' ? 'selected' : ''}>Sokratik</option><option value="explain" ${mode === 'explain' ? 'selected' : ''}>Tushuntirish</option></select>
      <button class="btn ghost sm" id="tutor-close" style="color:#fff">✕</button></div>
    <div class="msgs" id="tutor-msgs">
      ${!msgs.length ? html`<div class="msg assistant">Salom! Men shu dars bo'yicha yordamchingizman. Tushunmagan joyingizni so'rang — men sizni javobga yo'naltiraman. 🙂
        <div class="row" style="margin-top:8px">${["Asosiy tushunchalarni sodda tushuntiring", "Menga mavzu bo'yicha savol bering", 'Hayotiy misol keltiring'].map((q) => html`<button class="btn sm" data-suggest="${q}">${q}</button>`)}</div></div>` : ''}
      ${msgs.map((m) => html`<div class="msg ${m.role}">${m.role === 'assistant' ? md(m.content) : m.content}</div>`)}
    </div>
    <form id="tutor-form"><textarea name="q" placeholder="Savolingizni yozing…" required></textarea><button class="btn primary">➤</button></form>`);
  const box = panel.querySelector('#tutor-msgs');
  box.scrollTop = box.scrollHeight;
  panel.querySelector('#tutor-close').addEventListener('click', toggle);
  panel.querySelector('#tutor-mode').addEventListener('change', (e) => { mode = e.target.value; });
  panel.querySelectorAll('[data-suggest]').forEach((b) => b.addEventListener('click', () => send(b.dataset.suggest)));
  const form = panel.querySelector('#tutor-form');
  form.addEventListener('submit', (e) => { e.preventDefault(); send(form.elements.q.value); });
  form.elements.q.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); form.requestSubmit(); } });
  form.elements.q.focus();
}

async function send(text) {
  text = String(text || '').trim();
  if (!text || !context) return;
  const k = key();
  const msgs = histories.get(k) || [];
  msgs.push({ role: 'user', content: text });
  histories.set(k, msgs);
  draw();
  const box = panel.querySelector('#tutor-msgs');
  const typing = document.createElement('div');
  typing.className = 'msg assistant';
  typing.innerHTML = '<span class="spinner"></span>';
  box.appendChild(typing);
  box.scrollTop = box.scrollHeight;
  try {
    const { reply } = await api.post('/api/ai/tutor', { course_id: context.course_id, lesson_id: context.lesson_id, messages: msgs, mode });
    msgs.push({ role: 'assistant', content: reply });
  } catch (e) {
    toast(e.message, 'error');
    msgs.pop();
  }
  draw();
}
