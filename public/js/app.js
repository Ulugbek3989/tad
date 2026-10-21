// Ilova: holat, marshrutlash va umumiy maket
import { api } from './api.js';
import { html, setHTML, $, on, toast, loading, avatar, esc } from './ui.js';
import { authView } from './views/auth.js';
import { dashboardView } from './views/dashboard.js';
import { coursesView, courseView } from './views/courses.js';
import { lessonView } from './views/lesson.js';
import { courseEditorView, lessonEditorView } from './views/editor.js';
import { groupsView, groupView, leaderboardView } from './views/groups.js';
import { gradingView, submissionView, assignmentsView, assignmentView } from './views/teaching.js';
import { methodsView, methodView, toolsView } from './views/methods.js';
import { reviewView } from './views/review.js';
import { profileView, notificationsView, adminView } from './views/profile.js';
import { aiStudioView } from './views/aistudio.js';
import { mountTutor, setTutorContext } from './views/tutor.js';
import { projectView } from './views/project.js';
import { calcView } from './views/calc.js';

export const state = { user: null, route: null };

export const isTeacher = () => state.user && (state.user.role === 'teacher' || state.user.role === 'admin');

const routes = [
  ['/', dashboardView],
  ['/courses', coursesView],
  ['/courses/:id', courseView],
  ['/courses/:id/edit', courseEditorView],
  ['/edit/lesson/:id', lessonEditorView],
  ['/lessons/:id', lessonView],
  ['/review', reviewView],
  ['/assignments', assignmentsView],
  ['/assignments/:id', assignmentView],
  ['/groups', groupsView],
  ['/groups/:id', groupView],
  ['/leaderboard', leaderboardView],
  ['/grading', gradingView],
  ['/submission/:id', submissionView],
  ['/methods', methodsView],
  ['/methods/:key', methodView],
  ['/tools', toolsView],
  ['/ai', aiStudioView],
  ['/courses/:id/project', projectView],
  ['/calc', calcView],
  ['/project', myProjectRedirect],
  ['/profile', profileView],
  ['/users/:id', profileView],
  ['/notifications', notificationsView],
  ['/admin', adminView],
].map(([pattern, view]) => {
  const keys = [];
  const re = new RegExp('^' + pattern.replace(/:(\w+)/g, (_, k) => { keys.push(k); return '([^/]+)'; }) + '$');
  return { re, keys, view };
});

/** O'quvchining birinchi kursidagi biznes loyihasiga yo'naltirish. */
async function myProjectRedirect(view) {
  const { courses } = await api.get('/api/courses');
  if (!courses.length) {
    setHTML(view, html`<div class="empty"><div class="big">💼</div><h2>Biznes loyiha</h2><p>Loyiha ustida ishlash uchun avval fanga (guruhga) qo'shiling.</p></div>`);
    return;
  }
  const c = courses.find((x) => /tadbirkor/i.test(x.title)) || courses[0];
  location.replace(`#/courses/${c.id}/project`);
}

function parseHash() {
  const h = location.hash.replace(/^#/, '') || '/';
  const [path, query = ''] = h.split('?');
  return { path, query: Object.fromEntries(new URLSearchParams(query)) };
}

export function navigate(path) {
  if (location.hash === '#' + path) render();
  else location.hash = path;
}

export async function refreshUser() {
  try {
    const { user } = await api.get('/api/auth/me');
    state.user = user;
  } catch {
    state.user = null;
  }
  updateTopbar();
  return state.user;
}

function navLinks() {
  const u = state.user;
  const t = isTeacher();
  const items = [
    ['Asosiy', [
      ['/', '🏠', 'Bosh sahifa'],
      ['/courses', '📚', t ? 'Kurslar' : 'Mening fanlarim'],
      ...(t ? [] : [['/project', '💼', 'Biznes loyiham'], ['/review', '🃏', 'Takrorlash'], ['/assignments', '📝', "Qo'shimcha topshiriqlar"], ['/leaderboard', '🏆', 'Reyting']]),
    ]],
    ...(t ? [['O\'qituvchi', [
      ['/groups', '👥', 'Guruhlar va jurnal'],
      ['/grading', '✅', 'Tekshirish', 'pending'],
      ['/assignments', '📝', "Qo'shimcha topshiriqlar"],
      ['/ai', '✨', 'AI studiya'],
    ]]] : []),
    ['Metodika', [
      ['/methods', '🧭', 'Metodlar kutubxonasi'],
      ['/calc', '🧮', 'Biznes kalkulyatorlari'],
      ...(t ? [['/tools', '🧰', 'Dars vositalari']] : []),
    ]],
    ['Shaxsiy', [
      ['/profile', '👤', 'Profil va nishonlar'],
      ...(u?.role === 'admin' ? [['/admin', '⚙️', 'Administrator']] : []),
    ]],
  ];
  return items;
}

function layout() {
  const u = state.user;
  return html`<div class="app">
    <aside class="sidebar" id="sidebar">
      <div class="brand"><div class="logo">🎓</div><div>TAD<small>Ta'lim platformasi</small></div></div>
      <nav class="nav" id="nav">
        ${navLinks().map(([title, links]) => html`<div class="nav-title">${title}</div>
          ${links.map(([href, ico, label, count]) => html`<a href="#${href}" data-href="${href}"><span class="ico">${ico}</span>${label}${count ? html`<span class="count hidden" data-count="${count}"></span>` : ''}</a>`)}`)}
      </nav>
      <div class="sidebar-foot">
        <div class="row">${avatar(u.name, u.id)}<div style="min-width:0;flex:1"><div style="font-weight:700;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${u.name}</div><div class="small muted">${{ admin: 'Administrator', teacher: "O'qituvchi", student: "O'quvchi" }[u.role]}</div></div>
        <button class="btn ghost icon-btn" id="logout" title="Chiqish">⎋</button></div>
      </div>
    </aside>
    <div class="overlay" id="overlay"></div>
    <div class="main">
      <header class="topbar">
        <button class="btn ghost icon-btn menu-btn" id="menu-btn" aria-label="Menyu">☰</button>
        <div class="spacer"></div>
        <div id="topbar-stats" class="row"></div>
        <button class="btn ghost icon-btn" id="theme-btn" title="Mavzu">🌓</button>
        <a class="btn ghost icon-btn" href="#/notifications" title="Bildirishnomalar">🔔<span class="dot hidden" id="notif-dot"></span></a>
      </header>
      <main class="content" id="view"></main>
    </div>
  </div>`;
}

export function updateTopbar() {
  const u = state.user;
  const box = $('#topbar-stats');
  if (!u || !box) return;
  setHTML(box, u.role === 'student'
    ? html`<span class="xp-pill" title="Kunlik seriya">🔥 ${u.streak}</span>
           <span class="xp-pill" title="Daraja: ${u.level.title}">⭐ ${u.xp} XP · ${u.level.level}-daraja</span>`
    : html`<span class="badge primary">${u.role === 'admin' ? 'Administrator' : "O'qituvchi"}</span>`);
  const dot = $('#notif-dot');
  if (dot) {
    dot.textContent = u.unread > 9 ? '9+' : u.unread;
    dot.classList.toggle('hidden', !u.unread);
  }
}

async function updatePendingCount() {
  if (!isTeacher()) return;
  try {
    const d = await api.get('/api/dashboard');
    const el = document.querySelector('[data-count="pending"]');
    if (el) { el.textContent = d.stats.pending; el.classList.toggle('hidden', !d.stats.pending); }
  } catch { /* e'tiborsiz */ }
}

let shellMounted = false;

function mountShell() {
  const root = $('#root');
  setHTML(root, layout());
  shellMounted = true;
  $('#logout').addEventListener('click', async () => {
    await api.post('/api/auth/logout').catch(() => {});
    state.user = null;
    shellMounted = false;
    navigate('/');
  });
  const closeMenu = () => { $('#sidebar').classList.remove('open'); $('#overlay').classList.remove('show'); };
  $('#menu-btn').addEventListener('click', () => { $('#sidebar').classList.add('open'); $('#overlay').classList.add('show'); });
  $('#overlay').addEventListener('click', closeMenu);
  on($('#nav'), 'click', 'a', closeMenu);
  $('#theme-btn').addEventListener('click', () => {
    const cur = document.documentElement.dataset.theme || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    const next = cur === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem('tad-theme', next); } catch { /* e'tiborsiz */ }
  });
  updateTopbar();
  updatePendingCount();
  mountTutor();
}

let renderSeq = 0;

/** Joriy sahifani qayta chizish. */
export const reload = () => render();

export async function render() {
  const seq = ++renderSeq;
  const { path, query } = parseHash();
  if (!state.user) {
    shellMounted = false;
    document.querySelector('.tutor-fab')?.remove();
    document.querySelector('.tutor-panel')?.remove();
    return authView($('#root'), { mode: path === '/register' ? 'register' : 'login', query });
  }
  if (path === '/login' || path === '/register') return navigate('/');
  if (!shellMounted || !$('#view')) mountShell();
  // Faol menyu elementi
  document.querySelectorAll('#nav a').forEach((a) => {
    const href = a.dataset.href;
    a.classList.toggle('active', href === '/' ? path === '/' : path === href || path.startsWith(href + '/'));
  });
  let match = null;
  for (const r of routes) {
    const m = path.match(r.re);
    if (m) {
      const params = {};
      r.keys.forEach((k, i) => { params[k] = decodeURIComponent(m[i + 1]); });
      match = { view: r.view, params };
      break;
    }
  }
  // Har bir sahifa uchun yangi konteyner: oldingi sahifaning hodisa tinglovchilari qolib ketmaydi
  const old = $('#view');
  const view = old.cloneNode(false);
  old.replaceWith(view);
  view.className = 'content';
  setTutorContext(null);
  if (!match) {
    setHTML(view, html`<div class="empty"><div class="big">🧭</div><h2>Sahifa topilmadi</h2><a class="btn primary" href="#/">Bosh sahifaga</a></div>`);
    return;
  }
  setHTML(view, loading());
  window.scrollTo(0, 0);
  try {
    await match.view(view, { params: match.params, query, isCurrent: () => seq === renderSeq });
  } catch (e) {
    if (seq !== renderSeq) return;
    console.error(e);
    setHTML(view, html`<div class="empty"><div class="big">⚠️</div><h2>Xatolik</h2><p>${e.message}</p><a class="btn" href="#/">Bosh sahifaga</a></div>`);
  }
}

window.addEventListener('hashchange', render);
window.addEventListener('tad:unauthorized', () => {
  state.user = null;
  shellMounted = false;
  toast('Sessiya tugadi. Qaytadan kiring.', 'error');
  render();
});

(async function boot() {
  try {
    const t = localStorage.getItem('tad-theme');
    if (t) document.documentElement.dataset.theme = t;
  } catch { /* e'tiborsiz */ }
  // Kutubxonalar (defer) yuklanishini kutamiz
  if (document.readyState === 'loading') await new Promise((r) => document.addEventListener('DOMContentLoaded', r));
  await refreshUser();
  render();
  // Bildirishnomalarni vaqti-vaqti bilan yangilash
  setInterval(() => { if (state.user && document.visibilityState === 'visible') refreshUser(); }, 60000);
})();

export { esc };
