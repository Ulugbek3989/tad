// Kurs resurslari: atamalar lug'ati, shablonlar, rasmiy manbalar, qo'shimcha keyslar
import { api } from '../api.js';
import { html, setHTML, md, modal, toast, on, download, progressBar, timeAgo } from '../ui.js';
import { reload as rerender } from '../app.js';

export async function renderResources(body, course, t, initialTab = 'glossary') {
  const { resources: r } = await api.get(`/api/courses/${course.id}/resources`);
  const empty = !r || !Object.keys(r).length;
  let tab = initialTab;
  let q = '';
  const tabs = [['glossary', `📖 Lug'at (${r.glossary?.length || 0})`], ['templates', `📋 Shablonlar (${r.templates?.length || 0})`], ['links', '🔗 Manbalar'], ['cases', `💼 Keyslar (${r.cases?.length || 0})`], ['tools', '🧮 Kalkulyatorlar']];
  const draw = () => {
    setHTML(body, html`
      ${t && course.can_edit ? html`<div class="row" style="justify-content:flex-end;margin-bottom:10px"><button class="btn sm" data-edit-res>✏️ Resurslarni tahrirlash (JSON)</button></div>` : ''}
      ${empty ? html`<div class="card empty"><div class="big">📚</div><p>Bu kurs uchun resurslar hali qo'shilmagan.</p></div>` : html`
      <div class="tabs" style="margin-bottom:14px">${tabs.map(([k, l]) => html`<button data-rtab="${k}" class="${tab === k ? 'active' : ''}">${l}</button>`)}</div>
      <div id="rbody">${section()}</div>`}`);
    const inp = body.querySelector('#gq');
    if (inp) { inp.focus(); inp.setSelectionRange(q.length, q.length); }
  };
  const section = () => {
    if (tab === 'glossary') {
      const list = (r.glossary || []).filter((g) => !q || (g.term + ' ' + g.def).toLowerCase().includes(q.toLowerCase()));
      return html`<input type="search" id="gq" placeholder="🔎 Atamani qidiring…" value="${q}" style="max-width:360px;margin-bottom:12px">
        <div class="grid grid-2">${list.map((g) => html`<div class="card" style="box-shadow:none;padding:14px"><div class="row between"><strong>${g.term}</strong>${g.topic ? html`<span class="badge">${g.topic}</span>` : ''}</div><div class="small" style="margin-top:4px">${g.def}</div></div>`)}</div>
        ${!list.length ? html`<p class="muted">Topilmadi</p>` : ''}`;
    }
    if (tab === 'templates') {
      return html`<div class="grid grid-auto">${(r.templates || []).map((x, i) => html`<div class="card method-card" style="cursor:default">
        <div class="row between"><span style="font-size:1.6rem">${x.format === 'csv' ? '📊' : '📄'}</span><span class="badge">${x.topic || ''}</span></div>
        <strong>${x.title}</strong><span class="small muted">${x.desc || ''}</span>
        <div class="row" style="margin-top:auto"><button class="btn sm" data-tview="${i}">👁 Ko'rish</button><button class="btn sm primary" data-tdl="${i}">⬇ ${x.format === 'csv' ? 'Excel (CSV)' : 'Yuklab olish'}</button></div></div>`)}</div>`;
    }
    if (tab === 'links') {
      return html`${(r.links || []).map((g) => html`<div class="card" style="box-shadow:none"><h3>${g.group}</h3>
        ${g.items.map((it) => html`<div style="padding:8px 0;border-bottom:1px solid var(--border)"><a href="${it.url}" target="_blank" rel="noopener"><strong>${it.title}</strong></a> <span class="small muted">${it.url}</span><div class="small">${it.desc || ''}</div></div>`)}</div>`)}
        ${course.enrolled === false ? '' : html`<div class="card" style="box-shadow:none"><h3>📚 Adabiyotlar</h3><p class="small">Asosiy va qo'shimcha adabiyotlar ro'yxati fan dasturida: <a href="#/courses/${course.id}?tab=syllabus">Fan dasturi → Adabiyotlar</a>.</p></div>`}`;
    }
    if (tab === 'cases') {
      return html`<p class="small muted">Qo'shimcha o'quv keyslari (shartli vaziyatlar) — seminar, guruh muhokamasi va mustaqil tahlil uchun.</p>
        <div class="grid grid-2">${(r.cases || []).map((c) => html`<div class="card" style="box-shadow:none">
          <div class="row between"><h3 style="margin:0">${c.title}</h3><span class="badge primary">${c.tag || ''}</span></div>
          <div class="small muted" style="margin:4px 0 8px">Mavzular: ${c.topic}</div>
          <div class="prose small">${md(c.body)}</div>
          <strong class="small">Muhokama savollari</strong><ol class="small">${(c.questions || []).map((x) => html`<li>${x}</li>`)}</ol></div>`)}</div>`;
    }
    return html`<div class="card" style="box-shadow:none"><p>Zararsizlik nuqtasi, narx, kredit grafigi, soliq rejimlarini solishtirish, ROI, bozor hajmi va reklama samaradorligi kalkulyatorlari.</p><a class="btn primary" href="#/calc">🧮 Kalkulyatorlarni ochish</a></div>`;
  };
  draw();
  on(body, 'click', '[data-rtab]', (e, b) => { tab = b.dataset.rtab; draw(); });
  body.addEventListener('input', (e) => { if (e.target.id === 'gq') { q = e.target.value; setHTML(body.querySelector('#rbody'), section()); const i = body.querySelector('#gq'); i.focus(); i.setSelectionRange(q.length, q.length); } });
  on(body, 'click', '[data-tview]', (e, b) => {
    const x = r.templates[Number(b.dataset.tview)];
    modal({ title: x.title, size: 'lg', body: x.format === 'csv' ? csvTable(x.content) : html`<div class="prose">${md(x.content)}</div>`,
      footer: html`<button class="btn" data-copy-t>📋 Nusxalash</button><button class="btn primary" data-dl-t>⬇ Yuklab olish</button>`,
      onMount: (el) => {
        el.querySelector('[data-dl-t]').addEventListener('click', () => dl(x));
        el.querySelector('[data-copy-t]').addEventListener('click', async () => { try { await navigator.clipboard.writeText(x.content); toast('Nusxalandi', 'success'); } catch { toast("Nusxalab bo'lmadi", 'error'); } });
      } });
  });
  on(body, 'click', '[data-tdl]', (e, b) => dl(r.templates[Number(b.dataset.tdl)]));
  on(body, 'click', '[data-edit-res]', () => modal({
    title: 'Resurslarni tahrirlash', size: 'lg',
    body: html`<p class="small muted">Tuzilma: <code>{"glossary": [{"term","def","topic"}], "templates": [{"title","desc","format":"md|csv","content","topic"}], "links": [{"group","items":[{"title","url","desc"}]}], "cases": [{"title","topic","tag","body","questions":[]}]}</code></p>
      <textarea id="res-json" class="code" rows="20">${JSON.stringify(r || {}, null, 2)}</textarea>`,
    footer: html`<button class="btn" data-close>Bekor qilish</button><button class="btn primary" id="res-save">💾 Saqlash</button>`,
    onMount: (el, close) => el.querySelector('#res-save').addEventListener('click', async () => {
      let data;
      try { data = JSON.parse(el.querySelector('#res-json').value); } catch { toast("JSON noto'g'ri", 'error'); return; }
      try { await api.put(`/api/courses/${course.id}/resources`, { resources: data }); close(); toast('Saqlandi', 'success'); rerender(); } catch (err) { toast(err.message, 'error'); }
    }),
  }));
}

function dl(x) {
  const name = x.title.replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, '').toLowerCase();
  if (x.format === 'csv') download(`${name}.csv`, '﻿' + x.content, 'text/csv;charset=utf-8');
  else download(`${name}.md`, x.content, 'text/markdown;charset=utf-8');
}

function csvTable(text) {
  const rows = text.trim().split('\n').map((l) => l.split(';'));
  return html`<div class="table-wrap"><table class="table"><thead><tr>${rows[0].map((h) => html`<th>${h}</th>`)}</tr></thead><tbody>${rows.slice(1).map((r) => html`<tr>${rows[0].map((_, i) => html`<td>${r[i] || ''}</td>`)}</tr>`)}</tbody></table></div>
    <p class="small muted">Faylni Excel yoki Google Sheets'da oching (ajratuvchi — nuqta-vergul).</p>`;
}

/** Kurs sahifasidagi "Biznes loyiha" yorlig'i. */
export async function renderProjectTab(body, course, t) {
  if (!t) {
    const { project } = await api.get(`/api/courses/${course.id}/project`);
    const p = project.progress;
    setHTML(body, html`<div class="card" style="display:flex;gap:20px;align-items:center;flex-wrap:wrap">
      <div style="font-size:3rem">💼</div>
      <div style="flex:1;min-width:240px"><h2 style="margin:0 0 6px">Mening biznes loyiham</h2>
        <p class="muted" style="margin:0 0 10px">Semestr davomida o'z biznes g'oyangizni bosqichma-bosqich rivojlantirasiz: g'oya → biznes-model → mijoz va bozor → narx va pul oqimi → xavflar → pitch. Natija — tayyor biznes-reja.</p>
        ${progressBar((p.count / p.total) * 100)}<div class="small muted" style="margin-top:4px">${p.count} / ${p.total} bo'lim tayyor${project.updated_at ? ` · oxirgi o'zgarish ${timeAgo(project.updated_at)}` : ''}</div></div>
      <a class="btn primary lg" href="#/courses/${course.id}/project">${p.count ? 'Davom ettirish' : 'Boshlash'} →</a></div>
      ${project.teacher_comment ? html`<div class="alert info"><strong>👩‍🏫 O'qituvchi izohi:</strong> ${project.teacher_comment}</div>` : ''}`);
    return;
  }
  const { projects, total_sections: total } = await api.get(`/api/courses/${course.id}/projects`);
  setHTML(body, html`<div class="card"><div class="card-head"><h3>💼 Talabalarning biznes loyihalari</h3><span class="small muted">${projects.filter((x) => x.progress).length} / ${projects.length} talaba boshlagan</span></div>
    ${projects.length ? html`<div class="table-wrap"><table class="table"><thead><tr><th>Talaba</th><th>Guruh</th><th>Muammo / g'oya</th><th>Tayyorlik</th><th>Yangilangan</th><th></th></tr></thead><tbody>
      ${projects.map((x) => html`<tr><td><strong>${x.name}</strong></td><td class="small">${x.group_name}</td><td class="small" style="max-width:320px">${(x.problem || '—').slice(0, 120)}</td>
        <td style="min-width:120px">${progressBar(((x.progress || 0) / total) * 100)}<span class="small muted">${x.progress || 0}/${total}</span></td>
        <td class="small muted nowrap">${x.updated_at ? timeAgo(x.updated_at) : '—'}</td>
        <td class="right nowrap">${x.commented ? '💬 ' : ''}<a class="btn sm" href="#/courses/${course.id}/project?user=${x.id}">Ko'rish</a></td></tr>`)}</tbody></table></div>`
      : html`<p class="muted">Kursda hali talabalar yo'q.</p>`}</div>`);
}

/** Alohida "Resurslar" sahifasi (menyudan): o'quvchi va o'qituvchi uchun. */
export async function resourcesPage(view, ctx) {
  const { courses } = await api.get('/api/resources');
  if (!ctx.isCurrent()) return;
  if (!courses.length) {
    setHTML(view, html`<div class="page-head"><div><h1>📚 Resurslar</h1></div></div>
      <div class="card empty"><div class="big">📚</div><p>Hozircha resurslar mavjud emas.<br>O'qituvchingizdan guruh kodini olib, fanga qo'shiling.</p></div>`);
    return;
  }
  const c = courses.find((x) => String(x.id) === ctx.query.c) || courses[0];
  setHTML(view, html`<div class="page-head"><div><h1>📚 Resurslar</h1><p>Atamalar lug'ati, shablonlar, rasmiy manbalar, qo'shimcha keyslar va biznes kalkulyatorlari</p></div>
      ${courses.length > 1 ? html`<select id="res-course" style="width:auto">${courses.map((x) => html`<option value="${x.id}" ${x.id === c.id ? 'selected' : ''}>${x.title}${x.code ? ` (${x.code})` : ''}</option>`)}</select>` : html`<span class="badge primary">${c.title}</span>`}</div>
    ${!c.enrolled ? html`<div class="alert info small">Siz bu fan guruhiga hali qo'shilmagansiz — resurslar ochiq, lekin darslar, testlar va biznes loyiha uchun guruh kodi kerak.</div>` : ''}
    <div id="res-body"></div>`);
  view.querySelector('#res-course')?.addEventListener('change', (e) => { location.hash = `#/resources?c=${e.target.value}`; });
  await renderResources(view.querySelector('#res-body'), { ...c, can_edit: false }, false, ctx.query.t || 'glossary');
}
