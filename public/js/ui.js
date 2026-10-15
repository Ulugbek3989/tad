// UI yordamchilari: xavfsiz HTML shablonlar, markdown, toast, modal va boshqalar

class Raw {
  constructor(s) { this.s = s; }
  toString() { return this.s; }
}
export const raw = (s) => new Raw(String(s ?? ''));

export function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function fmt(v) {
  if (v === null || v === undefined || v === false) return '';
  if (v instanceof Raw) return v.s;
  if (Array.isArray(v)) return v.map(fmt).join('');
  return esc(v);
}

/** Interpolatsiyalar avtomatik ekranlanadigan HTML shablon. */
export function html(strings, ...vals) {
  let out = '';
  strings.forEach((s, i) => {
    out += s;
    if (i < vals.length) out += fmt(vals[i]);
  });
  return new Raw(out);
}

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

export function on(root, event, selector, handler) {
  root.addEventListener(event, (e) => {
    const el = e.target.closest(selector);
    if (el && root.contains(el)) handler(e, el);
  });
}

export function setHTML(el, content) {
  el.innerHTML = String(content);
  renderMath(el);
}

/** Markdown -> xavfsiz HTML (DOMPurify bilan tozalanadi). */
export function md(text) {
  const src = String(text ?? '');
  if (!window.marked || !window.DOMPurify) return raw(esc(src).replace(/\n/g, '<br>'));
  const htmlStr = window.marked.parse(src, { breaks: true, gfm: true });
  const clean = window.DOMPurify.sanitize(htmlStr, { ADD_ATTR: ['target'] });
  return raw(clean);
}

export function renderMath(el) {
  if (window.renderMathInElement) {
    try {
      window.renderMathInElement(el, {
        delimiters: [
          { left: '$$', right: '$$', display: true },
          { left: '$', right: '$', display: false },
          { left: '\\(', right: '\\)', display: false },
          { left: '\\[', right: '\\]', display: true },
        ],
        throwOnError: false,
      });
    } catch { /* e'tiborsiz */ }
  }
}

/** YouTube/Vimeo havolasini embed'ga aylantiradi. */
export function videoEmbed(url) {
  if (!url) return '';
  let m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{11})/);
  if (m) return html`<div class="video-wrap"><iframe src="https://www.youtube-nocookie.com/embed/${m[1]}" allowfullscreen loading="lazy"></iframe></div>`;
  m = url.match(/vimeo\.com\/(\d+)/);
  if (m) return html`<div class="video-wrap"><iframe src="https://player.vimeo.com/video/${m[1]}" allowfullscreen loading="lazy"></iframe></div>`;
  if (/\.(mp4|webm|ogg)(\?|$)/i.test(url)) return html`<div class="video-wrap"><video src="${url}" controls></video></div>`;
  return html`<p><a href="${url}" target="_blank" rel="noopener">🎬 Videoni ochish</a></p>`;
}

export function toast(msg, type = 'info', ms = 3500) {
  const box = document.getElementById('toasts');
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.textContent = msg;
  box.appendChild(t);
  setTimeout(() => t.remove(), ms);
}

export function confetti(n = 80) {
  const colors = ['#4f46e5', '#a855f7', '#f59e0b', '#16a34a', '#ec4899', '#0ea5e9'];
  for (let i = 0; i < n; i++) {
    const c = document.createElement('div');
    c.className = 'confetti';
    c.style.left = Math.random() * 100 + 'vw';
    c.style.background = colors[i % colors.length];
    c.style.animationDuration = 1.8 + Math.random() * 1.8 + 's';
    c.style.animationDelay = Math.random() * 0.4 + 's';
    document.body.appendChild(c);
    setTimeout(() => c.remove(), 4200);
  }
}

/** XP va nishonlar haqida xabar. */
export function celebrate(result) {
  if (!result) return;
  if (result.xp > 0) toast(`⭐ +${result.xp} XP`, 'reward');
  for (const b of result.badges || []) {
    setTimeout(() => toast(`${b.icon} Yangi nishon: ${b.name}!`, 'reward', 5000), 600);
  }
  if ((result.badges || []).length || (result.max > 0 && result.score >= result.max)) confetti();
}

/** Modal oyna. body — Raw HTML; onMount(el, close) ichida hodisalar ulanadi. */
export function modal({ title, body, footer = '', size = '', onMount, onClose }) {
  const back = document.createElement('div');
  back.className = 'modal-back';
  back.innerHTML = String(html`<div class="modal ${size}" role="dialog" aria-modal="true">
    <div class="modal-head"><h3>${title}</h3><button class="btn ghost icon-btn" data-close aria-label="Yopish">✕</button></div>
    <div class="modal-body">${body}</div>
    ${footer ? html`<div class="modal-foot">${footer}</div>` : ''}
  </div>`);
  const close = () => { if (!back.isConnected) return; back.remove(); document.removeEventListener('keydown', onKey); onClose?.(); };
  const onKey = (e) => { if (e.key === 'Escape') close(); };
  document.addEventListener('keydown', onKey);
  back.addEventListener('mousedown', (e) => { if (e.target === back) close(); });
  on(back, 'click', '[data-close]', close);
  document.body.appendChild(back);
  renderMath(back);
  onMount?.(back, close);
  const first = back.querySelector('input, textarea, select');
  if (first) first.focus();
  return close;
}

export function confirmDialog(message, { danger = true, ok = 'Ha' } = {}) {
  return new Promise((resolve) => {
    let done = false;
    modal({
      title: 'Tasdiqlang',
      body: html`<p>${message}</p>`,
      footer: html`<button class="btn" data-close>Bekor qilish</button><button class="btn ${danger ? 'danger solid' : 'primary'}" data-ok>${ok}</button>`,
      onMount: (el, c) => {
        el.querySelector('[data-ok]').addEventListener('click', () => { done = true; c(); resolve(true); });
      },
      onClose: () => { if (!done) resolve(false); },
    });
  });
}

/** Forma maydonlarini obyektga yig'adi. */
export function formData(form) {
  const out = {};
  for (const el of form.elements) {
    if (!el.name) continue;
    if (el.type === 'checkbox') out[el.name] = el.checked;
    else if (el.type === 'radio') { if (el.checked) out[el.name] = el.value; }
    else out[el.name] = el.value;
  }
  return out;
}

export const loading = () => html`<div class="loading"><span class="spinner"></span></div>`;

export function fmtDate(s, withTime = false) {
  if (!s) return '';
  const d = new Date(s.includes('T') ? s : s.replace(' ', 'T') + (s.length > 10 ? 'Z' : ''));
  if (Number.isNaN(d.getTime())) return s;
  const opts = { day: 'numeric', month: 'short', year: 'numeric' };
  if (withTime) Object.assign(opts, { hour: '2-digit', minute: '2-digit' });
  return d.toLocaleString('uz-UZ', opts);
}

export function timeAgo(s) {
  if (!s) return '';
  const d = new Date(s.includes('T') ? s : s.replace(' ', 'T') + 'Z');
  const sec = (Date.now() - d.getTime()) / 1000;
  if (sec < 60) return 'hozirgina';
  if (sec < 3600) return `${Math.floor(sec / 60)} daqiqa oldin`;
  if (sec < 86400) return `${Math.floor(sec / 3600)} soat oldin`;
  if (sec < 86400 * 7) return `${Math.floor(sec / 86400)} kun oldin`;
  return fmtDate(s);
}

const AVATAR_COLORS = ['#4f46e5', '#0ea5e9', '#16a34a', '#d97706', '#db2777', '#7c3aed', '#0d9488', '#dc2626'];
export function avatar(name = '?', id = 0) {
  const initials = String(name).split(/\s+/).map((p) => p[0]).slice(0, 2).join('').toUpperCase();
  return html`<span class="avatar" style="background:${AVATAR_COLORS[id % AVATAR_COLORS.length]}">${initials}</span>`;
}

export function progressBar(pct, cls = '') {
  return html`<div class="progress ${cls}"><span style="width:${Math.max(0, Math.min(100, pct || 0))}%"></span></div>`;
}

export function ring(pct, label = null) {
  const p = Math.max(0, Math.min(100, Math.round(pct || 0)));
  const c = p >= 85 ? 'var(--success)' : p >= 60 ? 'var(--warning)' : 'var(--danger)';
  return html`<div class="ring" style="--p:${p};--c:${c}"><div>${label ?? p + '%'}</div></div>`;
}

export function scoreClass(score, max) {
  if (score === null || score === undefined || !max) return '';
  const p = score / max;
  return p >= 0.85 ? 'score-hi' : p >= 0.6 ? 'score-mid' : 'score-lo';
}

export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function download(filename, text, type = 'application/json') {
  const blob = new Blob([text], { type });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

/** Sichqoncha va sensor bilan ishlaydigan oddiy drag & drop ro'yxat tartiblash. */
export function sortable(list, onChange) {
  let dragging = null;
  list.addEventListener('dragstart', (e) => {
    dragging = e.target.closest('[draggable]');
    dragging?.classList.add('dragging');
  });
  list.addEventListener('dragend', () => { dragging?.classList.remove('dragging'); dragging = null; onChange?.(); });
  list.addEventListener('dragover', (e) => {
    e.preventDefault();
    if (!dragging) return;
    const after = [...list.querySelectorAll('[draggable]:not(.dragging)')].find((el) => {
      const r = el.getBoundingClientRect();
      return e.clientY < r.top + r.height / 2;
    });
    if (after) list.insertBefore(dragging, after);
    else list.appendChild(dragging);
  });
  // Sensorli ekranlar uchun: yuqoriga/pastga tugmalari
  on(list, 'click', '[data-move]', (e, btn) => {
    const item = btn.closest('[draggable]');
    if (btn.dataset.move === 'up' && item.previousElementSibling) list.insertBefore(item, item.previousElementSibling);
    if (btn.dataset.move === 'down' && item.nextElementSibling) list.insertBefore(item.nextElementSibling, item);
    onChange?.();
  });
}
