import { api } from '../api.js';
import { html, setHTML, md, progressBar, modal, formData, toast, timeAgo, confirmDialog, on } from '../ui.js';
import { isTeacher, navigate, reload as rerender } from '../app.js';
import { typeIcon, typeName, LESSON_KINDS } from '../types.js';
import { joinGroupDialog, loadRecommendations } from './dashboard.js';

export async function coursesView(view, ctx) {
  const { courses } = await api.get('/api/courses');
  if (!ctx.isCurrent()) return;
  const t = isTeacher();
  setHTML(view, html`
    <div class="page-head"><div><h1>${t ? 'Kurslar' : 'Mening fanlarim'}</h1><p>${t ? "Fanlar, ularning dasturi va o'quv materiallari" : "Siz o'qiyotgan fanlar"}</p></div>
      <div class="row">${t ? html`
        <button class="btn" id="sample-btn">📦 Tayyor kurslar</button>
        <button class="btn" id="import-btn">📥 Import (JSON)</button>
        <button class="btn primary" id="new-btn">➕ Yangi kurs</button>` : html`<button class="btn primary" id="join-btn">➕ Guruhga qo'shilish</button>`}</div></div>
    ${courses.length ? html`<div class="grid grid-auto">${courses.map((c) => html`
      <a class="card course-card" href="#/courses/${c.id}">
        <div class="cover" style="background:linear-gradient(135deg, ${c.color}, ${c.color}bb)">${c.code || ''}</div>
        <div class="body">
          <strong style="font-size:1.05rem">${c.title}</strong>
          <span class="small muted">${(c.description || '').slice(0, 120)}</span>
          <div class="row small muted" style="margin-top:auto">📘 ${c.lessons} dars · 🧩 ${c.activities} mashg'ulot ${!c.published ? html`<span class="badge warning">Qoralama</span>` : ''}</div>
          ${!t ? html`${progressBar(c.progress)}<span class="small muted">${c.progress}% bajarildi</span>` : ''}
        </div>
      </a>`)}</div>`
    : html`<div class="card empty"><div class="big">📚</div><h3>Kurslar yo'q</h3><p>${t ? "Yangi kurs yarating yoki «Tayyor kurslar» bo'limidan kursni yuklang." : "O'qituvchingizdan guruh kodini oling."}</p></div>`}`);

  if (!t) { view.querySelector('#join-btn').addEventListener('click', joinGroupDialog); return; }
  view.querySelector('#new-btn').addEventListener('click', () => courseDialog());
  view.querySelector('#sample-btn').addEventListener('click', catalogDialog);
  view.querySelector('#import-btn').addEventListener('click', importDialog);
}

async function catalogDialog() {
  const { courses } = await api.get('/api/courses/catalog');
  modal({
    title: '📦 Tayyor kurslar',
    size: 'lg',
    body: html`<p class="muted">Platformaga o'rnatilgan, to'liq tayyorlangan kurslar. Yuklangan kursni keyin istalgancha tahrirlashingiz mumkin.</p>
      <div class="stack">${courses.map((c) => html`<div class="card" style="box-shadow:none;border-left:5px solid ${c.color}">
        <div class="row between"><div><strong style="font-size:1.05rem">${c.title}</strong> ${c.code ? html`<span class="badge">${c.code}</span>` : ''}</div>
          <button class="btn primary sm" data-key="${c.key}">Yuklash</button></div>
        <p class="small muted" style="margin:6px 0">${c.description}</p>
        <div class="small">🗂 ${c.modules} bo'lim · 📘 ${c.lessons} dars · 🧩 ${c.activities} mashg'ulot</div></div>`)}</div>`,
    onMount: (el, close) => on(el, 'click', '[data-key]', async (e, b) => {
      b.disabled = true;
      b.textContent = 'Yuklanmoqda…';
      try {
        const { id } = await api.post(`/api/courses/catalog/${b.dataset.key}`);
        close();
        toast('Kurs yuklandi', 'success');
        navigate(`/courses/${id}`);
      } catch (err) { toast(err.message, 'error'); b.disabled = false; b.textContent = 'Yuklash'; }
    }),
  });
}

function importDialog() {
  modal({
    title: 'Kursni import qilish',
    size: 'lg',
    body: html`<p class="muted">Fan dasturi va materiallarini <code>tad-course-v1</code> JSON formatida yuklang. Formatni ko'rish uchun <a href="/api/courses/template" target="_blank">namuna faylni</a> oching yoki mavjud kursni eksport qiling.</p>
      <div class="field"><label>JSON fayl</label><input type="file" id="imp-file" accept=".json,application/json"></div>
      <div class="field"><label>yoki JSON matnini qo'ying</label><textarea class="code" id="imp-text" placeholder='{"course": {"title": "..."}, "modules": [...]}'></textarea></div>`,
    footer: html`<button class="btn" data-close>Bekor qilish</button><button class="btn primary" id="imp-go">Import qilish</button>`,
    onMount: (el, close) => {
      el.querySelector('#imp-file').addEventListener('change', async (e) => {
        const f = e.target.files[0];
        if (f) el.querySelector('#imp-text').value = await f.text();
      });
      el.querySelector('#imp-go').addEventListener('click', async () => {
        let data;
        try { data = JSON.parse(el.querySelector('#imp-text').value); } catch { return toast("JSON noto'g'ri", 'error'); }
        try {
          const { id } = await api.post('/api/courses/import', data);
          close();
          toast('Kurs import qilindi', 'success');
          navigate(`/courses/${id}`);
        } catch (e) { toast(e.message, 'error'); }
      });
    },
  });
}

export function courseDialog(course = null) {
  const c = course || { title: '', code: '', description: '', color: '#4f46e5', published: 1 };
  modal({
    title: course ? 'Kursni tahrirlash' : 'Yangi kurs',
    body: html`<form id="cf">
      <div class="field"><label>Fan nomi</label><input type="text" name="title" required value="${c.title}"></div>
      <div class="grid grid-2"><div class="field"><label>Kod</label><input type="text" name="code" value="${c.code || ''}" placeholder="FIZ-101"></div>
        <div class="field"><label>Rang</label><input type="color" name="color" value="${c.color || '#4f46e5'}" style="height:42px;width:100%"></div></div>
      <div class="field"><label>Qisqa tavsif</label><textarea name="description">${c.description || ''}</textarea></div>
      <label class="row" style="font-weight:500"><input type="checkbox" name="published" ${c.published ? 'checked' : ''}> Boshqa o'qituvchilarga ko'rinadi (e'lon qilingan)</label>
    </form>`,
    footer: html`<button class="btn" data-close>Bekor qilish</button><button class="btn primary" form="cf">Saqlash</button>`,
    onMount: (el, close) => {
      el.querySelector('#cf').addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = formData(e.target);
        try {
          if (course) {
            await api.patch(`/api/courses/${course.id}`, data);
            close();
            toast('Saqlandi', 'success');
            navigate(`/courses/${course.id}`);
          } else {
            const { id } = await api.post('/api/courses', data);
            close();
            toast('Kurs yaratildi', 'success');
            navigate(`/courses/${id}/edit`);
          }
        } catch (err) { toast(err.message, 'error'); }
      });
    },
  });
}

export async function courseView(view, ctx) {
  const id = ctx.params.id;
  const { course } = await api.get(`/api/courses/${id}`);
  if (!ctx.isCurrent()) return;
  const t = isTeacher();
  const tab = ctx.query.tab || 'content';
  const totalActs = course.modules.reduce((n, m) => n + m.lessons.reduce((k, l) => k + l.activities.length, 0), 0);
  const totalLessons = course.modules.reduce((n, m) => n + m.lessons.length, 0);
  const hours = course.modules.reduce((n, m) => n + m.lessons.reduce((k, l) => k + (l.hours || 0), 0), 0);
  const tabs = [['content', '📘 Mundarija'], ['syllabus', '📄 Fan dasturi'], ['news', "📢 E'lonlar"], ...(t ? [['groups', '👥 Guruhlar']] : [['ai', '🤖 Tavsiyalar']])];

  setHTML(view, html`
    <div class="course-hero" style="background:linear-gradient(135deg, ${course.color}, ${course.color}cc 60%, #1e1b4b)">
      <div class="row between" style="align-items:flex-start">
        <div style="max-width:760px">
          ${course.code ? html`<span class="badge" style="background:rgba(255,255,255,.2);color:#fff">${course.code}</span>` : ''}
          <h1 style="margin-top:8px">${course.title}</h1>
          <p style="opacity:.92">${course.description || ''}</p>
          <div class="row small" style="opacity:.9">📘 ${totalLessons} dars · 🧩 ${totalActs} mashg'ulot · ⏱ ${hours} soat ${course.owner_name ? html`· 👤 ${course.owner_name}` : ''}</div>
        </div>
        ${course.can_edit ? html`<div class="row"><a class="btn" href="#/courses/${course.id}/edit">✏️ Tahrirlash</a></div>` : ''}
      </div>
      ${!t ? html`<div style="margin-top:16px;max-width:420px">${progressBar(course.progress)}<div class="small" style="margin-top:4px">${course.progress}% bajarildi</div></div>` : ''}
    </div>
    <div class="tabs">${tabs.map(([k, label]) => html`<a href="#/courses/${course.id}?tab=${k}" class="${tab === k ? 'active' : ''}">${label}</a>`)}</div>
    <div id="tab-body"></div>`);

  const body = view.querySelector('#tab-body');
  if (tab === 'content') renderContents(body, course, t);
  else if (tab === 'syllabus') renderSyllabus(body, course);
  else if (tab === 'news') await renderNews(body, course, t);
  else if (tab === 'groups' && t) renderGroups(body, course);
  else if (tab === 'ai') {
    setHTML(body, html`<div class="card"><div id="reco"></div></div>`);
    loadRecommendations(body.querySelector('#reco'), course.id);
  }
}

function renderContents(body, course, t) {
  if (!course.modules.length) {
    setHTML(body, html`<div class="card empty"><div class="big">🗂️</div><p>Kursda hali mavzular yo'q.</p>${course.can_edit ? html`<a class="btn primary" href="#/courses/${course.id}/edit">Mavzular qo'shish</a>` : ''}</div>`);
    return;
  }
  let n = 0;
  setHTML(body, html`${course.modules.map((m) => {
    const acts = m.lessons.flatMap((l) => l.activities);
    const done = acts.filter((a) => a.result).length;
    return html`<div class="card module" style="padding:0">
      <div class="module-head"><h3>${m.title}</h3>${!t && acts.length ? html`<span class="small muted">${done}/${acts.length}</span>` : ''}</div>
      ${m.description ? html`<p class="muted small" style="padding:0 18px">${m.description}</p>` : ''}
      ${m.lessons.map((l) => {
        n++;
        const full = l.activities.length && l.done === l.activities.length;
        const cls = t ? '' : full ? 'done' : l.done || l.viewed ? 'part' : '';
        return html`<a class="lesson-item" href="#/lessons/${l.id}">
          <span class="num ${cls}">${full && !t ? '✓' : n}</span>
          <div class="info"><div class="title">${l.title}</div>
            <div class="small muted">${LESSON_KINDS[l.kind] || ''} · ${l.hours} soat${l.summary ? html` · ${l.summary.slice(0, 90)}` : ''}</div>
            <div class="act-chips">${l.activities.map((a) => html`<span class="act-chip ${a.result ? 'done' : ''}" title="${typeName(a.type)}">${typeIcon(a.type)} ${a.title.length > 28 ? a.title.slice(0, 28) + '…' : a.title}</span>`)}</div>
          </div><span class="muted">›</span></a>`;
      })}
    </div>`;
  })}`);
}

function renderSyllabus(body, course) {
  setHTML(body, html`<div class="grid dash-split">
    <div class="card prose">${course.syllabus ? md(course.syllabus) : html`<p class="muted">Fan dasturi kiritilmagan.</p>`}</div>
    <div class="stack">
      ${course.objectives?.length ? html`<div class="card"><h3>🎯 O'quv maqsadlari</h3><ul>${course.objectives.map((o) => html`<li>${o}</li>`)}</ul></div>` : ''}
      ${course.literature ? html`<div class="card prose"><h3>📚 Adabiyotlar</h3>${md(course.literature)}</div>` : ''}
      <div class="card"><h3>🗓 Mavzular rejasi</h3>
        <table class="table"><thead><tr><th>Mavzu</th><th>Turi</th><th>Soat</th></tr></thead><tbody>
        ${course.modules.flatMap((m) => m.lessons.map((l) => html`<tr><td>${l.title}</td><td class="small">${LESSON_KINDS[l.kind]}</td><td>${l.hours}</td></tr>`))}
        </tbody></table></div>
    </div></div>`);
}

async function renderNews(body, course, t) {
  const { announcements } = await api.get(`/api/announcements?course_id=${course.id}`);
  setHTML(body, html`
    ${t ? html`<div class="card"><form id="an-form"><h3>Yangi e'lon</h3>
      <div class="field"><input type="text" name="title" placeholder="Sarlavha" required></div>
      <div class="field"><textarea name="body" placeholder="Matn (markdown)"></textarea></div>
      <div class="row between"><select name="group_id" style="width:auto"><option value="">Barcha guruhlar</option>${course.groups.map((g) => html`<option value="${g.id}">${g.name}</option>`)}</select>
      <button class="btn primary">E'lon qilish</button></div></form></div>` : ''}
    ${announcements.length ? announcements.map((a) => html`<div class="card"><div class="row between"><h3 style="margin:0">${a.title}</h3>
        ${t ? html`<button class="btn sm danger" data-del="${a.id}">O'chirish</button>` : ''}</div>
        <div class="small muted" style="margin-bottom:8px">${a.author || ''} · ${timeAgo(a.created_at)}${a.group_name ? ` · ${a.group_name}` : ''}</div>
        <div class="prose">${md(a.body || '')}</div></div>`)
      : html`<div class="card empty"><div class="big">📭</div><p>E'lonlar yo'q</p></div>`}`);
  if (t) {
    body.querySelector('#an-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        await api.post('/api/announcements', { ...formData(e.target), course_id: course.id });
        toast("E'lon yuborildi", 'success');
        rerender();
      } catch (err) { toast(err.message, 'error'); }
    });
    on(body, 'click', '[data-del]', async (e, b) => {
      if (!(await confirmDialog("E'lonni o'chirasizmi?"))) return;
      await api.del(`/api/announcements/${b.dataset.del}`);
      rerender();
    });
  }
}

function renderGroups(body, course) {
  setHTML(body, html`<div class="card">
    <div class="card-head"><h3>Kurs guruhlari</h3><button class="btn primary" id="new-group">➕ Guruh yaratish</button></div>
    ${course.groups.length ? html`<table class="table"><thead><tr><th>Guruh</th><th>O'quvchilar</th><th>Qo'shilish kodi</th><th></th></tr></thead><tbody>
      ${course.groups.map((g) => html`<tr><td><strong>${g.name}</strong></td><td>${g.members}</td><td><code style="font-size:1.05rem;letter-spacing:.1em">${g.join_code}</code>
        <button class="btn sm ghost" data-copy="${location.origin}/#/register?code=${g.join_code}" title="Taklif havolasini nusxalash">🔗</button></td>
        <td class="right"><a class="btn sm" href="#/groups/${g.id}">Jurnal →</a></td></tr>`)}</tbody></table>`
      : html`<p class="muted">Guruh yarating va o'quvchilarga qo'shilish kodini bering.</p>`}
  </div>`);
  body.querySelector('#new-group').addEventListener('click', () => newGroupDialog(course.id));
  on(body, 'click', '[data-copy]', async (e, b) => {
    try { await navigator.clipboard.writeText(b.dataset.copy); toast('Taklif havolasi nusxalandi', 'success'); } catch { toast(b.dataset.copy); }
  });
}

export function newGroupDialog(courseId, courses = null) {
  modal({
    title: 'Yangi guruh',
    body: html`<form id="gf">
      ${courses ? html`<div class="field"><label>Kurs</label><select name="course_id" required>${courses.map((c) => html`<option value="${c.id}">${c.title}</option>`)}</select></div>` : ''}
      <div class="field"><label>Guruh nomi</label><input type="text" name="name" required placeholder="Masalan: 101-guruh"></div></form>`,
    footer: html`<button class="btn" data-close>Bekor qilish</button><button class="btn primary" form="gf">Yaratish</button>`,
    onMount: (el, close) => {
      el.querySelector('#gf').addEventListener('submit', async (e) => {
        e.preventDefault();
        const d = formData(e.target);
        try {
          const r = await api.post('/api/groups', { course_id: courses ? d.course_id : courseId, name: d.name });
          close();
          toast(`Guruh yaratildi. Kod: ${r.join_code}`, 'success', 6000);
          navigate(`/groups/${r.id}`);
        } catch (err) { toast(err.message, 'error'); }
      });
    },
  });
}
