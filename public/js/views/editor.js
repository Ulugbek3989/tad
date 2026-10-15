// O'qituvchi uchun kurs, dars va mashg'ulot muharriri
import { api } from '../api.js';
import { html, setHTML, md, modal, formData, toast, confirmDialog, on, download, renderMath } from '../ui.js';
import { navigate, reload as rerender } from '../app.js';
import { TYPES, LESSON_KINDS, typeIcon, typeName } from '../types.js';
import { courseDialog } from './courses.js';
import { getMethods } from './lesson.js';
import { renderActivity } from './activities.js';

const AI_TYPES = ['lab', 'practical', 'case', 'essay'];
const lines = (s) => String(s || '').split('\n').map((x) => x.trim()).filter(Boolean);
const pairs = (s) => lines(s).map((l) => l.split('|').map((x) => x.trim())).filter((p) => p.length >= 2 && p[0] && p[1]);

// ======================= Kurs muharriri =======================
export async function courseEditorView(view, ctx) {
  const id = ctx.params.id;
  const { course } = await api.get(`/api/courses/${id}`);
  if (!ctx.isCurrent()) return;
  if (!course.can_edit) { navigate(`/courses/${id}`); return; }
  const tab = ctx.query.tab || 'structure';
  setHTML(view, html`
    <div class="small muted"><a href="#/courses/${id}">← ${course.title}</a></div>
    <div class="page-head"><div><h1>Kurs muharriri</h1><p>${course.title}</p></div>
      <div class="row"><a class="btn" href="#/courses/${id}">👁 Ko'rish</a></div></div>
    <div class="tabs">${[['structure', '🗂 Tuzilma va darslar'], ['syllabus', '📄 Fan dasturi'], ['settings', '⚙️ Sozlamalar']].map(([k, l]) => html`<a href="#/courses/${id}/edit?tab=${k}" class="${tab === k ? 'active' : ''}">${l}</a>`)}</div>
    <div id="ed"></div>`);
  const ed = view.querySelector('#ed');
  if (tab === 'structure') structureTab(ed, course);
  else if (tab === 'syllabus') syllabusTab(ed, course);
  else settingsTab(ed, course);
}

function structureTab(ed, course) {
  const reload = () => navigate(`/courses/${course.id}/edit?tab=structure&t=${Date.now()}`);
  setHTML(ed, html`
    <div class="row between" style="margin-bottom:14px">
      <span class="muted small">Bo'limlar (modullar) → darslar → mashg'ulotlar. Tartibni ↑↓ tugmalari bilan o'zgartiring.</span>
      <div class="row"><button class="btn" id="ai-structure">✨ Fan dasturidan AI bilan tuzish</button><button class="btn primary" id="add-module">➕ Bo'lim qo'shish</button></div></div>
    <div class="editor-tree">
      ${course.modules.map((m, mi) => html`<div class="mod" data-mod="${m.id}">
        <div class="mod-h"><span style="flex:1">${m.title}</span>
          <button class="btn sm ghost" data-mmove="up" ${mi === 0 ? 'disabled' : ''}>↑</button><button class="btn sm ghost" data-mmove="down" ${mi === course.modules.length - 1 ? 'disabled' : ''}>↓</button>
          <button class="btn sm" data-medit>✏️</button><button class="btn sm danger" data-mdel>🗑</button></div>
        ${m.lessons.map((l, li) => html`<div class="les" data-les="${l.id}">
          <span class="badge">${LESSON_KINDS[l.kind] || ''}</span>
          <div class="t"><a href="#/edit/lesson/${l.id}"><strong>${l.title}</strong></a><div class="small muted">${l.activities.map((a) => typeIcon(a.type)).join(' ') || "Mashg'ulotlar yo'q"} · ${l.hours} soat</div></div>
          <button class="btn sm ghost" data-lmove="up" ${li === 0 ? 'disabled' : ''}>↑</button><button class="btn sm ghost" data-lmove="down" ${li === m.lessons.length - 1 ? 'disabled' : ''}>↓</button>
          <a class="btn sm" href="#/edit/lesson/${l.id}">Tahrirlash</a><button class="btn sm danger" data-ldel>🗑</button></div>`)}
        <div class="les"><button class="btn sm primary" data-addles>➕ Dars qo'shish</button></div>
      </div>`)}
    </div>
    ${!course.modules.length ? html`<div class="card empty"><div class="big">🗂</div><p>Avval bo'lim (modul) qo'shing, so'ng unga darslar qo'shing.<br>Yoki fan dasturini "Fan dasturi" bo'limiga kiritib, AI yordamida tuzilmani avtomatik yarating.</p></div>` : ''}`);

  ed.querySelector('#add-module').addEventListener('click', () => promptDialog("Yangi bo'lim", "Bo'lim nomi", '', async (title) => {
    await api.post(`/api/courses/${course.id}/modules`, { title });
    reload();
  }));
  ed.querySelector('#ai-structure').addEventListener('click', () => aiStructureDialog(course, reload));
  const modIds = course.modules.map((m) => m.id);
  on(ed, 'click', '[data-mmove]', async (e, b) => {
    const id = Number(b.closest('[data-mod]').dataset.mod);
    const ids = move(modIds, id, b.dataset.mmove);
    await api.post('/api/reorder', { kind: 'modules', ids });
    reload();
  });
  on(ed, 'click', '[data-medit]', (e, b) => {
    const m = course.modules.find((x) => x.id === Number(b.closest('[data-mod]').dataset.mod));
    promptDialog("Bo'limni tahrirlash", "Bo'lim nomi", m.title, async (title) => { await api.patch(`/api/modules/${m.id}`, { title }); reload(); });
  });
  on(ed, 'click', '[data-mdel]', async (e, b) => {
    if (!(await confirmDialog("Bo'lim va undagi barcha darslar o'chiriladi. Davom etasizmi?"))) return;
    await api.del(`/api/modules/${b.closest('[data-mod]').dataset.mod}`);
    reload();
  });
  on(ed, 'click', '[data-addles]', (e, b) => {
    const mid = b.closest('[data-mod]').dataset.mod;
    promptDialog('Yangi dars', 'Dars mavzusi', '', async (title) => {
      const { id } = await api.post(`/api/modules/${mid}/lessons`, { title });
      navigate(`/edit/lesson/${id}`);
    });
  });
  on(ed, 'click', '[data-lmove]', async (e, b) => {
    const m = course.modules.find((x) => x.id === Number(b.closest('[data-mod]').dataset.mod));
    const id = Number(b.closest('[data-les]').dataset.les);
    await api.post('/api/reorder', { kind: 'lessons', ids: move(m.lessons.map((l) => l.id), id, b.dataset.lmove) });
    reload();
  });
  on(ed, 'click', '[data-ldel]', async (e, b) => {
    if (!(await confirmDialog("Dars va uning barcha mashg'ulotlari o'chiriladi. Davom etasizmi?"))) return;
    await api.del(`/api/lessons/${b.closest('[data-les]').dataset.les}`);
    reload();
  });
}

function move(ids, id, dir) {
  const a = [...ids];
  const i = a.indexOf(id);
  const j = dir === 'up' ? i - 1 : i + 1;
  if (i < 0 || j < 0 || j >= a.length) return a;
  [a[i], a[j]] = [a[j], a[i]];
  return a;
}

function promptDialog(title, label, value, onSave) {
  modal({
    title,
    body: html`<form id="pf"><div class="field"><label>${label}</label><input type="text" name="v" required value="${value}"></div></form>`,
    footer: html`<button class="btn" data-close>Bekor qilish</button><button class="btn primary" form="pf">Saqlash</button>`,
    onMount: (el, close) => el.querySelector('#pf').addEventListener('submit', async (e) => {
      e.preventDefault();
      try { await onSave(e.target.elements.v.value.trim()); close(); } catch (err) { toast(err.message, 'error'); }
    }),
  });
}

function aiStructureDialog(course, reload) {
  modal({
    title: '✨ Fan dasturidan tuzilma yaratish',
    size: 'lg',
    body: html`<p class="muted small">Fan dasturi (mavzular rejasi) matnini kiriting. AI uni bo'limlar va darslarga ajratadi; natijani ko'rib chiqib, kursga qo'shasiz.</p>
      <textarea id="syl" rows="10">${course.syllabus || ''}</textarea><div id="preview" style="margin-top:12px"></div>`,
    footer: html`<button class="btn" data-close>Yopish</button><button class="btn" id="gen">✨ Tahlil qilish</button><button class="btn primary hidden" id="apply">Kursga qo'shish</button>`,
    onMount: (el, close) => {
      let result = null;
      el.querySelector('#gen').addEventListener('click', async (e) => {
        e.target.disabled = true;
        setHTML(el.querySelector('#preview'), html`<span class="spinner"></span> AI tahlil qilmoqda…`);
        try {
          const { content } = await api.post('/api/ai/generate', { kind: 'syllabus', text: el.querySelector('#syl').value, topic: course.title });
          result = content;
          setHTML(el.querySelector('#preview'), html`${(content.modules || []).map((m) => html`<div style="margin-bottom:8px"><strong>${m.title}</strong><ul class="small">${(m.lessons || []).map((l) => html`<li>${l.title} <span class="muted">(${LESSON_KINDS[l.kind] || l.kind}, ${l.hours} soat)</span></li>`)}</ul></div>`)}`);
          el.querySelector('#apply').classList.remove('hidden');
        } catch (err) { setHTML(el.querySelector('#preview'), html`<div class="alert danger">${err.message}</div>`); }
        e.target.disabled = false;
      });
      el.querySelector('#apply').addEventListener('click', async (e) => {
        e.target.disabled = true;
        try {
          for (const m of result.modules || []) {
            const { id: mid } = await api.post(`/api/courses/${course.id}/modules`, { title: m.title });
            for (const l of m.lessons || []) await api.post(`/api/modules/${mid}/lessons`, { title: l.title, summary: l.summary, kind: l.kind, hours: l.hours });
          }
          close();
          toast('Tuzilma yaratildi', 'success');
          reload();
        } catch (err) { toast(err.message, 'error'); e.target.disabled = false; }
      });
    },
  });
}

function syllabusTab(ed, course) {
  setHTML(ed, html`<form id="sf" class="card">
    <div class="field"><label>Fan dasturi (markdown)</label><textarea name="syllabus" rows="18" class="code">${course.syllabus || ''}</textarea>
      <div class="hint">Fanning maqsadi, vazifalari, soatlar taqsimoti, baholash mezonlari va h.k. Markdown, jadval va $formula$ qo'llab-quvvatlanadi.</div></div>
    <div class="field"><label>O'quv maqsadlari (har biri yangi qatorda)</label><textarea name="objectives" rows="5">${(course.objectives || []).join('\n')}</textarea></div>
    <div class="field"><label>Adabiyotlar (markdown)</label><textarea name="literature" rows="6">${course.literature || ''}</textarea></div>
    <div class="right"><button class="btn primary">💾 Saqlash</button></div></form>`);
  ed.querySelector('#sf').addEventListener('submit', async (e) => {
    e.preventDefault();
    const d = formData(e.target);
    try {
      await api.patch(`/api/courses/${course.id}`, { syllabus: d.syllabus, literature: d.literature, objectives: lines(d.objectives) });
      toast('Saqlandi', 'success');
    } catch (err) { toast(err.message, 'error'); }
  });
}

function settingsTab(ed, course) {
  setHTML(ed, html`<div class="grid grid-2">
    <div class="card"><h3>Asosiy ma'lumotlar</h3><p class="muted">Nomi, kodi, rangi, tavsifi va ko'rinishi.</p><button class="btn" id="edit-info">✏️ Tahrirlash</button></div>
    <div class="card"><h3>Eksport</h3><p class="muted">Kursni JSON faylga yuklab oling (zaxira nusxa yoki boshqa platformaga ko'chirish uchun).</p><button class="btn" id="export">📤 JSON eksport</button></div>
    <div class="card"><h3 style="color:var(--danger)">Kursni o'chirish</h3><p class="muted">Kurs, barcha darslar, guruhlar va natijalar butunlay o'chiriladi.</p><button class="btn danger solid" id="del">🗑 O'chirish</button></div>
  </div>`);
  ed.querySelector('#edit-info').addEventListener('click', () => courseDialog(course));
  ed.querySelector('#export').addEventListener('click', async () => {
    const data = await api.get(`/api/courses/${course.id}/export`);
    download(`${(course.code || 'kurs').replace(/\W+/g, '-')}-${course.id}.json`, JSON.stringify(data, null, 2));
  });
  ed.querySelector('#del').addEventListener('click', async () => {
    if (!(await confirmDialog(`"${course.title}" kursini butunlay o'chirasizmi? Bu amalni qaytarib bo'lmaydi.`))) return;
    await api.del(`/api/courses/${course.id}`);
    toast("Kurs o'chirildi", 'success');
    navigate('/courses');
  });
}

// ======================= Dars muharriri =======================
export async function lessonEditorView(view, ctx) {
  const id = ctx.params.id;
  const [data, methodsData] = await Promise.all([api.get(`/api/lessons/${id}`), getMethods()]);
  if (!ctx.isCurrent()) return;
  const { lesson, course, activities } = data;
  if (!course.can_edit) { navigate(`/lessons/${id}`); return; }
  const { methods, categories } = methodsData;
  const reload = () => rerender();

  setHTML(view, html`
    <div class="small muted"><a href="#/courses/${course.id}/edit">← ${course.title}</a></div>
    <div class="page-head"><div><h1>Darsni tahrirlash</h1><p>${lesson.title}</p></div>
      <div class="row"><a class="btn" href="#/lessons/${lesson.id}">👁 O'quvchi ko'rinishi</a></div></div>
    <div class="grid dash-split">
      <form id="lf" class="card">
        <div class="field"><label>Dars mavzusi</label><input type="text" name="title" required value="${lesson.title}"></div>
        <div class="field"><label>Qisqa tavsif</label><input type="text" name="summary" value="${lesson.summary || ''}"></div>
        <div class="grid grid-2"><div class="field"><label>Mashg'ulot turi</label><select name="kind">${Object.entries(LESSON_KINDS).map(([k, v]) => html`<option value="${k}" ${lesson.kind === k ? 'selected' : ''}>${v}</option>`)}</select></div>
          <div class="field"><label>Soat</label><input type="number" name="hours" step="0.5" min="0" value="${lesson.hours}"></div></div>
        <div class="field"><div class="row between"><label>Ma'ruza matni (markdown)</label><div class="row"><button type="button" class="btn sm" id="plan-btn">✨ AI dars ishlanmasi</button><button type="button" class="btn sm" id="prev-btn">👁 Ko'rish</button></div></div>
          <textarea name="content" rows="20" class="code">${lesson.content || ''}</textarea>
          <div class="hint">Sarlavhalar (#), ro'yxatlar, jadvallar, rasmlar ![](url), formulalar $E=mc^2$ qo'llab-quvvatlanadi.</div>
          <div id="preview" class="prose card hidden" style="margin-top:10px;box-shadow:none"></div></div>
        <div class="field"><label>Darsda qo'llaniladigan metodlar</label>
          <div style="max-height:260px;overflow:auto;border:1px solid var(--border);border-radius:10px;padding:10px">
          ${Object.entries(categories).map(([ck, cn]) => html`<div class="small muted" style="margin:6px 0 4px;font-weight:700">${cn}</div>
            ${methods.filter((m) => m.category === ck).map((m) => html`<label class="row" style="font-weight:500;margin-bottom:4px"><input type="checkbox" name="m_${m.key}" ${lesson.methods.includes(m.key) ? 'checked' : ''}> ${m.name}</label>`)}`)}</div></div>
        <div class="right"><button class="btn primary">💾 Saqlash</button></div>
      </form>
      <div class="stack">
        <div class="card">
          <div class="card-head"><h3>Mashg'ulotlar</h3><button class="btn primary sm" id="add-act">➕ Qo'shish</button></div>
          ${activities.length ? activities.map((a, i) => html`<div class="row" style="padding:8px 0;border-bottom:1px solid var(--border);flex-wrap:nowrap" data-act="${a.id}">
              <span style="font-size:1.3rem">${typeIcon(a.type)}</span>
              <div style="flex:1;min-width:0"><strong>${a.title}</strong><div class="small muted">${typeName(a.type)} · ${a.max_points} ball</div></div>
              <button class="btn sm ghost" data-amove="up" ${i === 0 ? 'disabled' : ''}>↑</button><button class="btn sm ghost" data-amove="down" ${i === activities.length - 1 ? 'disabled' : ''}>↓</button>
              <button class="btn sm" data-aedit>✏️</button><button class="btn sm danger" data-adel>🗑</button></div>`)
            : html`<p class="muted small">Slaydlar, test, laboratoriya, keys va boshqa mashg'ulotlarni qo'shing.</p>`}
        </div>
        <div class="alert info small"><strong>Maslahat:</strong> samarali dars tuzilmasi — <em>Taqdimot → Interaktiv metod (doska) → Kartochkalar → Test → Amaliy/Laboratoriya/Keys → Refleksiya (esse)</em>.</div>
      </div>
    </div>`);

  const form = view.querySelector('#lf');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const d = formData(form);
    const selected = methods.filter((m) => d[`m_${m.key}`]).map((m) => m.key);
    try {
      await api.patch(`/api/lessons/${lesson.id}`, { title: d.title, summary: d.summary, kind: d.kind, hours: d.hours, content: d.content, methods: selected });
      toast('Saqlandi', 'success');
    } catch (err) { toast(err.message, 'error'); }
  });
  view.querySelector('#prev-btn').addEventListener('click', () => {
    const p = view.querySelector('#preview');
    p.classList.toggle('hidden');
    setHTML(p, md(form.elements.content.value));
  });
  view.querySelector('#plan-btn').addEventListener('click', () => lessonPlanDialog(methods, form));
  view.querySelector('#add-act').addEventListener('click', () => typePicker((type) => activityEditor({ type, title: '', content: {}, max_points: defaultPoints(type), attempts: 0 }, lesson, reload)));
  const actIds = activities.map((a) => a.id);
  on(view, 'click', '[data-amove]', async (e, b) => {
    await api.post('/api/reorder', { kind: 'activities', ids: move(actIds, Number(b.closest('[data-act]').dataset.act), b.dataset.amove) });
    reload();
  });
  on(view, 'click', '[data-aedit]', (e, b) => activityEditor(activities.find((a) => a.id === Number(b.closest('[data-act]').dataset.act)), lesson, reload));
  on(view, 'click', '[data-adel]', async (e, b) => {
    if (!(await confirmDialog("Mashg'ulot va uning natijalari o'chiriladi. Davom etasizmi?"))) return;
    await api.del(`/api/activities/${b.closest('[data-act]').dataset.act}`);
    reload();
  });
}

const defaultPoints = (t) => ({ slides: 0, reading: 0, flashcards: 0, board: 5, quiz: 10, lab: 30, case: 25, practical: 20, essay: 10 }[t] ?? 10);

function lessonPlanDialog(methods, form) {
  modal({
    title: '✨ AI dars ishlanmasi (texnologik xarita)',
    size: 'lg',
    body: html`<div class="grid grid-2"><div class="field"><label>Davomiyligi (daqiqa)</label><input type="number" id="mins" value="80"></div>
      <div class="field"><label>Metodlar</label><div class="small muted">Dars sozlamalarida belgilangan metodlar ishlatiladi; belgilanmagan bo'lsa AI o'zi tanlaydi.</div></div></div>
      <div id="plan-out"></div>`,
    footer: html`<button class="btn" data-close>Yopish</button><button class="btn" id="gen">✨ Yaratish</button><button class="btn primary hidden" id="ins">Ma'ruza matni oxiriga qo'shish</button>`,
    onMount: (el, close) => {
      let markdown = '';
      el.querySelector('#gen').addEventListener('click', async (e) => {
        e.target.disabled = true;
        const out = el.querySelector('#plan-out');
        setHTML(out, html`<span class="spinner"></span> Tayyorlanmoqda…`);
        const selected = methods.filter((m) => form.elements[`m_${m.key}`]?.checked).map((m) => m.key);
        try {
          const { content } = await api.post('/api/ai/generate', { kind: 'lesson_plan', topic: form.elements.title.value, text: form.elements.content.value, methods: selected, minutes: Number(el.querySelector('#mins').value) || 80 });
          markdown = content.markdown || '';
          setHTML(out, html`<div class="prose card" style="box-shadow:none;max-height:50vh;overflow:auto">${md(markdown)}</div>`);
          el.querySelector('#ins').classList.remove('hidden');
        } catch (err) { setHTML(out, html`<div class="alert danger">${err.message}</div>`); }
        e.target.disabled = false;
      });
      el.querySelector('#ins').addEventListener('click', () => {
        form.elements.content.value += `\n\n---\n\n## Dars ishlanmasi\n\n${markdown}`;
        close();
        toast("Qo'shildi. Saqlashni unutmang!", 'success');
      });
    },
  });
}

function typePicker(onPick) {
  modal({
    title: "Mashg'ulot turini tanlang",
    size: 'lg',
    body: html`<div class="grid grid-3">${Object.entries(TYPES).map(([k, t]) => html`<button class="card method-card" data-type="${k}" style="text-align:left;cursor:pointer;font:inherit">
      <div style="font-size:1.8rem">${t.icon}</div><strong>${t.name}</strong><span class="small muted">${t.desc}</span></button>`)}</div>`,
    onMount: (el, close) => on(el, 'click', '[data-type]', (e, b) => { close(); onPick(b.dataset.type); }),
  });
}

// ======================= Mashg'ulot muharriri =======================
const EDITORS = {
  slides: {
    render: (c) => html`<div class="field"><label>Slaydlar (markdown)</label>
      <textarea name="slides" rows="16" class="code">${(c.slides || []).map((s) => `# ${s.title || ''}\n${s.body || ''}${s.notes ? `\nIzoh: ${s.notes}` : ''}`).join('\n\n---\n\n')}</textarea>
      <div class="hint">Slaydlar <code>---</code> qatori bilan ajratiladi. Birinchi <code># qator</code> — slayd sarlavhasi. <code>Izoh:</code> bilan boshlangan qator — o'qituvchi izohi (o'quvchiga ko'rinmaydi).</div></div>`,
    read: (f) => ({
      slides: f.elements.slides.value.split(/\n-{3,}\n/).map((chunk) => {
        const ls = chunk.trim().split('\n');
        let title = '';
        if (ls[0]?.startsWith('# ')) title = ls.shift().slice(2).trim();
        const notes = ls.filter((l) => /^izoh:/i.test(l)).map((l) => l.replace(/^izoh:\s*/i, '')).join(' ');
        return { title, body: ls.filter((l) => !/^izoh:/i.test(l)).join('\n').trim(), notes };
      }).filter((s) => s.title || s.body),
    }),
  },
  reading: {
    render: (c) => html`<div class="field"><label>Video havolasi (YouTube, Vimeo yoki .mp4)</label><input type="url" name="video_url" value="${c.video_url || ''}"></div>
      <div class="field"><label>Matn (markdown)</label><textarea name="body" rows="14" class="code">${c.body || ''}</textarea></div>
      <div class="field"><label>Havolalar (har qatorda: nomi | url)</label><textarea name="links" rows="3">${(c.links || []).map((l) => `${l.title} | ${l.url}`).join('\n')}</textarea></div>`,
    read: (f) => ({ video_url: f.elements.video_url.value.trim(), body: f.elements.body.value, links: pairs(f.elements.links.value).map(([title, url]) => ({ title, url })) }),
  },
  flashcards: {
    render: (c) => html`<div class="field"><label>Kartochkalar (har qatorda: old tomoni | orqa tomoni)</label><textarea name="cards" rows="14">${(c.cards || []).map((x) => `${x.front} | ${x.back}`).join('\n')}</textarea></div>`,
    read: (f) => ({ cards: pairs(f.elements.cards.value).map(([front, ...rest]) => ({ front, back: rest.join(' | ') })) }),
  },
  matching: {
    render: (c) => html`<div class="field"><label>Juftliklar (har qatorda: chap | o'ng)</label><textarea name="pairs" rows="10">${(c.pairs || []).map((x) => `${x.left} | ${x.right}`).join('\n')}</textarea></div>`,
    read: (f) => ({ pairs: pairs(f.elements.pairs.value).map(([left, ...r]) => ({ left, right: r.join(' | ') })) }),
  },
  ordering: {
    render: (c) => html`<div class="field"><label>Savol / ko'rsatma</label><input type="text" name="prompt" value="${c.prompt || ''}"></div>
      <div class="field"><label>Elementlar — TO'G'RI tartibda (har biri yangi qatorda)</label><textarea name="items" rows="10">${(c.items || []).join('\n')}</textarea><div class="hint">O'quvchiga aralashtirilgan holda ko'rsatiladi.</div></div>`,
    read: (f) => ({ prompt: f.elements.prompt.value, items: lines(f.elements.items.value) }),
  },
  fillblank: {
    render: (c) => html`<div class="field"><label>Matn</label><textarea name="text" rows="10">${c.text || ''}</textarea>
      <div class="hint">Bo'sh joylarni <code>[[javob]]</code> ko'rinishida belgilang. Bir nechta to'g'ri variant: <code>[[CPU/protsessor]]</code></div></div>
      <label class="row" style="font-weight:500"><input type="checkbox" name="word_bank" ${c.word_bank ? 'checked' : ''}> So'zlar bankini ko'rsatish (osonroq variant)</label>`,
    read: (f) => ({ text: f.elements.text.value, word_bank: f.elements.word_bank.checked }),
  },
  classify: {
    render: (c) => html`<div class="field"><label>Toifalar va elementlar (har qatorda: Toifa: element1; element2; …)</label>
      <textarea name="cats" rows="8">${(c.categories || []).map((x) => `${x.name}: ${(x.items || []).join('; ')}`).join('\n')}</textarea></div>`,
    read: (f) => ({ categories: lines(f.elements.cats.value).map((l) => { const [name, rest = ''] = l.split(/:(.*)/s); return { name: name.trim(), items: rest.split(';').map((x) => x.trim()).filter(Boolean) }; }).filter((x) => x.name && x.items.length) }),
  },
  lab: {
    render: (c) => html`<div class="field"><label>Ishning maqsadi</label><textarea name="objective" rows="2">${c.objective || ''}</textarea></div>
      <div class="field"><label>Jihozlar (har biri yangi qatorda)</label><textarea name="equipment" rows="3">${(c.equipment || []).join('\n')}</textarea></div>
      <div class="field"><label>Qisqa nazariya (markdown)</label><textarea name="theory" rows="5">${c.theory || ''}</textarea></div>
      <div class="grid grid-2"><div class="field"><label>Video (ixtiyoriy)</label><input type="url" name="video_url" value="${c.video_url || ''}"></div>
        <div class="field"><label>Virtual laboratoriya / simulyatsiya havolasi (masalan, PhET)</label><input type="url" name="simulation_url" value="${c.simulation_url || ''}"></div></div>
      <div class="field"><label>Bajarish bosqichlari</label><textarea name="steps" rows="8" class="code">${(c.steps || []).map((s) => `# ${s.title}\n${s.body}`).join('\n\n---\n\n')}</textarea><div class="hint">Bosqichlar <code>---</code> bilan ajratiladi; <code># sarlavha</code> va matn.</div></div>
      <div class="field"><label>Nazorat savollari (har biri yangi qatorda)</label><textarea name="questions" rows="4">${(c.questions || []).join('\n')}</textarea></div>
      <div class="field"><label>Namunaviy javob (o'quvchiga ko'rinmaydi, AI solishtirish uchun)</label><textarea name="reference_answer" rows="4">${c.reference_answer || ''}</textarea></div>`,
    read: (f) => ({
      objective: f.elements.objective.value, equipment: lines(f.elements.equipment.value), theory: f.elements.theory.value,
      video_url: f.elements.video_url.value.trim(), simulation_url: f.elements.simulation_url.value.trim(),
      steps: f.elements.steps.value.split(/\n-{3,}\n/).map((ch) => { const ls = ch.trim().split('\n'); const title = ls[0]?.startsWith('# ') ? ls.shift().slice(2) : ''; return { title, body: ls.join('\n').trim() }; }).filter((s) => s.title || s.body),
      questions: lines(f.elements.questions.value), reference_answer: f.elements.reference_answer.value,
    }),
  },
  practical: {
    render: (c) => html`<div class="field"><label>Topshiriq sharti (markdown)</label><textarea name="task" rows="8">${c.task || ''}</textarea></div>
      <div class="field"><label>Ishoralar (har biri yangi qatorda)</label><textarea name="hints" rows="3">${(c.hints || []).join('\n')}</textarea></div>
      <div class="field"><label>Namunaviy yechim (o'quvchiga ko'rinmaydi)</label><textarea name="reference_answer" rows="5">${c.reference_answer || ''}</textarea></div>`,
    read: (f) => ({ task: f.elements.task.value, hints: lines(f.elements.hints.value), reference_answer: f.elements.reference_answer.value }),
  },
  case: {
    render: (c) => html`<div class="field"><label>Vaziyat (markdown)</label><textarea name="scenario" rows="9">${c.scenario || ''}</textarea></div>
      <div class="field"><label>Savollar (har biri yangi qatorda)</label><textarea name="questions" rows="5">${(c.questions || []).join('\n')}</textarea></div>
      <div class="field"><label>Namunaviy yechim (o'quvchiga ko'rinmaydi)</label><textarea name="reference_answer" rows="5">${c.reference_answer || ''}</textarea></div>`,
    read: (f) => ({ scenario: f.elements.scenario.value, questions: lines(f.elements.questions.value), reference_answer: f.elements.reference_answer.value }),
  },
  essay: {
    render: (c) => html`<div class="field"><label>Mavzu / savol (markdown)</label><textarea name="prompt" rows="4">${c.prompt || ''}</textarea></div>
      <div class="field"><label>Minimal so'zlar soni</label><input type="number" name="min_words" min="0" value="${c.min_words || 0}"></div>`,
    read: (f) => ({ prompt: f.elements.prompt.value, min_words: Number(f.elements.min_words.value) || 0 }),
  },
};

function boardEditor(methods) {
  const withBoard = methods.filter((m) => m.board);
  return {
    render: (c) => html`<div class="field"><label>Metod</label><select name="method"><option value="">— Erkin —</option>${withBoard.map((m) => html`<option value="${m.key}" ${c.method === m.key ? 'selected' : ''}>${m.name}</option>`)}</select><div class="hint">Metod tanlansa, ustunlar avtomatik to'ldiriladi.</div></div>
      <div class="field"><label>Savol / muammo</label><input type="text" name="prompt" value="${c.prompt || ''}"></div>
      <div class="field"><label>Ustunlar (har biri yangi qatorda)</label><textarea name="columns" rows="4">${(c.columns || []).join('\n')}</textarea></div>
      <label class="row" style="font-weight:500"><input type="checkbox" name="anonymous" ${c.anonymous ? 'checked' : ''}> Anonim (o'quvchilar bir-birining ismini ko'rmaydi)</label>`,
    read: (f) => ({ method: f.elements.method.value, prompt: f.elements.prompt.value, columns: lines(f.elements.columns.value), anonymous: f.elements.anonymous.checked }),
    mount: (el) => {
      el.querySelector('[name=method]').addEventListener('change', (e) => {
        const m = withBoard.find((x) => x.key === e.target.value);
        if (m) el.querySelector('[name=columns]').value = m.board.join('\n');
      });
    },
  };
}

// --- Test muharriri (vizual) ---
function quizEditor() {
  let qs = [];
  const QT = { single: 'Bitta javob', multiple: "Bir nechta javob", truefalse: "To'g'ri / noto'g'ri", short: 'Qisqa javob', numeric: 'Sonli javob' };
  const qHtml = (q, i) => html`<div class="q-edit" data-qi="${i}">
    <div class="row between" style="margin-bottom:8px"><strong>${i + 1}-savol</strong>
      <div class="row"><select data-f="type" style="width:auto">${Object.entries(QT).map(([k, v]) => html`<option value="${k}" ${q.type === k ? 'selected' : ''}>${v}</option>`)}</select>
      <input type="number" data-f="points" value="${q.points ?? 1}" min="0" step="0.5" style="width:70px" title="Ball">
      <button type="button" class="btn sm danger" data-qdel>🗑</button></div></div>
    <textarea data-f="text" rows="2" placeholder="Savol matni">${q.text || ''}</textarea>
    <div style="margin-top:8px">${q.type === 'single' || q.type === 'multiple' ? html`
      ${(q.options || []).map((o, k) => html`<div class="opt-row"><input type="${q.type === 'single' ? 'radio' : 'checkbox'}" name="ans${i}" data-ans="${k}" ${[].concat(q.answer ?? []).map(Number).includes(k) ? 'checked' : ''} title="To'g'ri javob">
        <input type="text" data-opt="${k}" value="${o}" placeholder="Variant ${k + 1}"><button type="button" class="btn sm ghost" data-odel="${k}">✕</button></div>`)}
      <button type="button" class="btn sm" data-oadd>+ Variant</button> <span class="small muted">To'g'ri javob(lar)ni belgilang</span>`
    : q.type === 'truefalse' ? html`<label class="row"><input type="radio" name="tf${i}" value="true" data-tf ${q.answer === true ? 'checked' : ''}> To'g'ri</label><label class="row"><input type="radio" name="tf${i}" value="false" data-tf ${q.answer === false ? 'checked' : ''}> Noto'g'ri</label>`
    : q.type === 'numeric' ? html`<div class="row"><input type="number" step="any" data-f="answer" value="${q.answer ?? ''}" placeholder="To'g'ri javob" style="max-width:180px"><input type="number" step="any" data-f="tolerance" value="${q.tolerance ?? 0}" placeholder="Xatolik" style="max-width:120px" title="Ruxsat etilgan xatolik"></div>`
    : html`<input type="text" data-f="answer" value="${[].concat(q.answer ?? []).join(' / ')}" placeholder="To'g'ri javob(lar), / bilan ajrating">`}</div>
    <input type="text" data-f="explanation" value="${q.explanation || ''}" placeholder="Izoh (javobdan keyin ko'rsatiladi)" style="margin-top:8px">
  </div>`;
  let root;
  const sync = () => {
    root.querySelectorAll('[data-qi]').forEach((box) => {
      const q = qs[Number(box.dataset.qi)];
      q.text = box.querySelector('[data-f=text]').value;
      q.points = Number(box.querySelector('[data-f=points]').value) || 0;
      q.explanation = box.querySelector('[data-f=explanation]').value;
      if (q.type === 'single' || q.type === 'multiple') {
        q.options = [...box.querySelectorAll('[data-opt]')].map((x) => x.value);
        const sel = [...box.querySelectorAll('[data-ans]:checked')].map((x) => Number(x.dataset.ans));
        q.answer = q.type === 'single' ? (sel[0] ?? 0) : sel;
      } else if (q.type === 'truefalse') {
        const x = box.querySelector('[data-tf]:checked');
        q.answer = x ? x.value === 'true' : true;
      } else if (q.type === 'numeric') {
        q.answer = Number(box.querySelector('[data-f=answer]').value);
        q.tolerance = Number(box.querySelector('[data-f=tolerance]').value) || 0;
      } else {
        q.answer = box.querySelector('[data-f=answer]').value.split('/').map((x) => x.trim()).filter(Boolean);
      }
    });
  };
  const redraw = () => {
    setHTML(root.querySelector('#qlist'), html`${qs.map(qHtml)}`);
    root.querySelector('#qcount').textContent = `${qs.length} ta savol`;
  };
  return {
    render: (c) => {
      qs = JSON.parse(JSON.stringify(c.questions || []));
      return html`<div class="grid grid-3"><div class="field"><label>Vaqt chegarasi (daqiqa, 0 — cheklanmagan)</label><input type="number" name="time_limit_min" min="0" value="${c.time_limit_min || 0}"></div>
        <label class="row" style="font-weight:500"><input type="checkbox" name="shuffle" ${c.shuffle ? 'checked' : ''}> Savollarni aralashtirish</label>
        <label class="row" style="font-weight:500"><input type="checkbox" name="show_answers" ${c.show_answers !== false ? 'checked' : ''}> Natijada to'g'ri javoblarni ko'rsatish</label></div>
        <div class="row between"><h4 style="margin:0" id="qcount"></h4><button type="button" class="btn sm primary" data-qadd>➕ Savol qo'shish</button></div>
        <div id="qlist" style="margin-top:10px"></div>`;
    },
    mount: (el) => {
      root = el;
      redraw();
      on(el, 'click', '[data-qadd]', () => { sync(); qs.push({ type: 'single', text: '', options: ['', '', '', ''], answer: 0, points: 1 }); redraw(); });
      on(el, 'click', '[data-qdel]', (e, b) => { sync(); qs.splice(Number(b.closest('[data-qi]').dataset.qi), 1); redraw(); });
      on(el, 'click', '[data-oadd]', (e, b) => { sync(); qs[Number(b.closest('[data-qi]').dataset.qi)].options.push(''); redraw(); });
      on(el, 'click', '[data-odel]', (e, b) => { sync(); const q = qs[Number(b.closest('[data-qi]').dataset.qi)]; q.options.splice(Number(b.dataset.odel), 1); redraw(); });
      el.addEventListener('change', (e) => {
        if (e.target.matches('[data-f=type]')) {
          sync();
          const q = qs[Number(e.target.closest('[data-qi]').dataset.qi)];
          q.type = e.target.value;
          if ((q.type === 'single' || q.type === 'multiple') && !q.options?.length) q.options = ['', '', '', ''];
          q.answer = q.type === 'multiple' ? [] : q.type === 'truefalse' ? true : q.type === 'single' ? 0 : '';
          redraw();
        }
      });
    },
    read: (f) => { sync(); return { time_limit_min: Number(f.elements.time_limit_min.value) || 0, shuffle: f.elements.shuffle.checked, show_answers: f.elements.show_answers.checked, questions: qs }; },
    setFromAI: (c) => { sync(); qs = qs.concat(c.questions || []); redraw(); },
  };
}

async function activityEditor(act, lesson, onSaved) {
  const { methods } = await getMethods();
  const isNew = !act.id;
  const type = act.type;
  const editor = type === 'quiz' ? quizEditor() : type === 'board' ? boardEditor(methods) : EDITORS[type];
  const canAI = ['quiz', 'flashcards', 'matching', 'ordering', 'fillblank', 'case', 'practical', 'lab', 'slides'].includes(type);
  modal({
    title: `${typeIcon(type)} ${isNew ? 'Yangi' : 'Tahrirlash'}: ${typeName(type)}`,
    size: 'lg',
    body: html`<form id="af">
      <div class="grid grid-3" style="grid-template-columns:2fr 1fr 1fr">
        <div class="field"><label>Nomi</label><input type="text" name="title" required value="${act.title || ''}"></div>
        <div class="field"><label>Maks. ball</label><input type="number" name="max_points" min="0" value="${act.max_points ?? 10}"></div>
        <div class="field"><label>Urinishlar (0 — cheksiz)</label><input type="number" name="attempts" min="0" value="${act.attempts ?? 0}"></div></div>
      <div class="field"><label>Ko'rsatma (ixtiyoriy)</label><textarea name="instructions" rows="2">${act.instructions || ''}</textarea></div>
      ${canAI ? html`<div class="alert info row between small" style="align-items:center"><span>✨ Mazmunni AI yordamida yaratish mumkin (dars matni asosida).</span><button type="button" class="btn sm primary" id="ai-gen">✨ AI bilan yaratish</button></div>` : ''}
      <div id="type-editor">${editor.render(act.content || {})}</div>
      ${AI_TYPES.includes(type) ? html`<div class="field"><label>Baholash mezonlari (rubrika) — AI shu asosda baholaydi</label><textarea name="rubric" rows="4" placeholder="Masalan: To'g'rilik — 10 ball; to'liqlik — 5 ball; xulosa — 5 ball">${act.rubric || ''}</textarea></div>` : ''}
      <details style="margin-top:8px"><summary class="small muted" style="cursor:pointer">Kengaytirilgan: JSON ko'rinishi</summary><textarea id="raw-json" class="code" rows="8" style="margin-top:6px">${JSON.stringify(act.content || {}, null, 2)}</textarea>
        <button type="button" class="btn sm" id="use-json" style="margin-top:6px">JSON'dan saqlash</button></details>
    </form>`,
    footer: html`<button class="btn" data-close>Bekor qilish</button><button class="btn" id="preview-btn">👁 Sinab ko'rish</button><button class="btn primary" id="save-btn">💾 Saqlash</button>`,
    onMount: (el, close) => {
      const form = el.querySelector('#af');
      editor.mount?.(el);
      const collect = () => {
        const d = formData(form);
        return { type, title: d.title, instructions: d.instructions, max_points: Number(d.max_points) || 0, attempts: Number(d.attempts) || 0, rubric: d.rubric, content: editor.read(form) };
      };
      const save = async (payload) => {
        if (!payload.title) return toast('Nomini kiriting', 'error');
        try {
          if (isNew) await api.post(`/api/lessons/${lesson.id}/activities`, payload);
          else await api.patch(`/api/activities/${act.id}`, payload);
          close();
          toast('Saqlandi', 'success');
          onSaved();
        } catch (err) { toast(err.message, 'error'); }
      };
      el.querySelector('#save-btn').addEventListener('click', () => { if (form.reportValidity()) save(collect()); });
      el.querySelector('#use-json').addEventListener('click', () => {
        try { save({ ...collect(), content: JSON.parse(el.querySelector('#raw-json').value) }); } catch { toast("JSON noto'g'ri", 'error'); }
      });
      el.querySelector('#preview-btn').addEventListener('click', () => {
        const p = collect();
        modal({ title: `👁 ${p.title || 'Sinov'}`, size: 'lg', body: html`<div id="pv"></div><p class="small muted" style="margin-top:12px">O'qituvchi rejimi: natijalar saqlanmaydi${isNew ? " (saqlanmagan mashg'ulotni topshirib bo'lmaydi)" : ''}.</p>`,
          onMount: (pel) => renderActivity(pel.querySelector('#pv'), { id: act.id || 0, ...p, content: previewContent(p) }) });
      });
      el.querySelector('#ai-gen')?.addEventListener('click', () => aiGenerateDialog(type, lesson, (content) => {
        if (editor.setFromAI) editor.setFromAI(content);
        else {
          const merged = { ...(editor.read(form)), ...content };
          setHTML(el.querySelector('#type-editor'), editor.render(merged));
          editor.mount?.(el);
        }
        if (content.rubric && form.elements.rubric) form.elements.rubric.value = content.rubric;
        toast("AI mazmuni qo'shildi — tekshirib, saqlang", 'success');
      }));
      renderMath(el);
    },
  });
}

/** Ko'rish rejimida o'quvchi formatiga yaqinlashtirish (javoblarni yashirmasdan). */
function previewContent(p) {
  const c = p.content;
  switch (p.type) {
    case 'quiz': return { ...c, questions: (c.questions || []).map((q, i) => ({ ...q, i })) };
    case 'matching': return { lefts: (c.pairs || []).map((x) => x.left), rights: (c.pairs || []).map((x) => x.right).sort() };
    case 'ordering': return { prompt: c.prompt, items: [...(c.items || [])].reverse() };
    case 'fillblank': {
      const answers = [];
      const text = String(c.text || '').replace(/\[\[(.+?)\]\]/g, (_, a) => { answers.push(a.split('/')[0]); return `{{${answers.length - 1}}}`; });
      return { text, count: answers.length, word_bank: c.word_bank ? answers : null };
    }
    case 'classify': return { categories: (c.categories || []).map((x) => x.name), items: (c.categories || []).flatMap((x) => x.items) };
    default: return c;
  }
}

function aiGenerateDialog(type, lesson, onDone) {
  modal({
    title: `✨ AI: ${typeName(type)} yaratish`,
    body: html`<form id="gf">
      <div class="field"><label>Mavzu</label><input type="text" name="topic" value="${lesson.title}"></div>
      <div class="field"><label>Manba matn (bo'sh qolsa — dars ma'ruza matni ishlatiladi)</label><textarea name="text" rows="6"></textarea></div>
      <div class="field"><label>Soni (savollar/kartochkalar/slaydlar)</label><input type="number" name="count" value="${type === 'slides' ? 8 : 6}" min="1" max="30"></div></form>
      <div id="gout"></div>`,
    footer: html`<button class="btn" data-close>Bekor qilish</button><button class="btn primary" form="gf">✨ Yaratish</button>`,
    onMount: (el, close) => el.querySelector('#gf').addEventListener('submit', async (e) => {
      e.preventDefault();
      const d = formData(e.target);
      const btn = el.querySelector('button[form=gf]');
      btn.disabled = true;
      setHTML(el.querySelector('#gout'), html`<span class="spinner"></span> AI tayyorlamoqda… (10–30 soniya)`);
      try {
        const { content } = await api.post('/api/ai/generate', { kind: type, topic: d.topic, text: d.text || lesson.content || '', count: Number(d.count) });
        close();
        onDone(content);
      } catch (err) {
        setHTML(el.querySelector('#gout'), html`<div class="alert danger">${err.message}</div>`);
        btn.disabled = false;
      }
    }),
  });
}
