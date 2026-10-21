// "Mening biznes loyiham" — semestr davomidagi vertikal loyiha ish maydoni
import { api } from '../api.js';
import { html, setHTML, md, toast, on, progressBar, ring, timeAgo } from '../ui.js';
import { isTeacher, refreshUser } from '../app.js';
import { som, breakEvenChart } from './calc.js';
import { setTutorContext } from './tutor.js';

const MIN = { idea: 4, canvas: 7, persona: 6, market: 6, swot: 4, legal: 3, pricing: 4, marketing: 3, cashflow: 6, risks: 12, funding: 3, pitch: 3 };

const CF_IN = [['sales', 'Savdo tushumi'], ['other_in', "Kredit / o'z mablag'i / grant"]];
const CF_OUT = [['materials', 'Xomashyo va materiallar'], ['salary', 'Ish haqi'], ['rent', 'Ijara va kommunal'], ['marketing', 'Reklama'], ['tax', 'Soliqlar'], ['loan', "Kredit to'lovi"], ['capex', 'Uskuna (investitsiya)'], ['other_out', 'Boshqa chiqimlar']];
const RISK_TYPES = ['Bozor', 'Moliyaviy', 'Operatsion', 'Huquqiy', 'Kadrlar', 'Tashqi'];

export const SECTIONS = [
  { key: 'idea', icon: '💡', title: "Biznes g'oya", ref: 'A1–A2', fields: [
    ['problem', 'Muammo: kim, qachon va nima uchun qiynaladi?', 'textarea'], ['solution', 'Yechim (mahsulot yoki xizmat)', 'textarea'],
    ['customer', 'Asosiy mijoz', 'text'], ['revenue', 'Daromad manbai (sotuv, obuna, komissiya…)', 'text'],
    ['value_prop', "Qiymat taklifi: «Biz [mijoz]ga [muammo]ni [yechim] orqali hal qilamiz, [raqobatchi]dan farqli ravishda [afzallik]»", 'textarea'],
    ['mvp', 'MVP va bozorda sinov natijalari (raqamlar bilan)', 'textarea']] },
  { key: 'canvas', icon: '🧩', title: 'Biznes-model (9 blok)', ref: 'A6', layout: 'canvas', fields: [
    ['partners', '8. Asosiy hamkorlar'], ['activities', '7. Asosiy faoliyat'], ['resources', '6. Asosiy resurslar'], ['value', '2. Qiymat taklifi'],
    ['relations', '4. Mijozlar bilan munosabat'], ['channels', '3. Sotish kanallari'], ['segments', '1. Mijozlar segmentlari'], ['costs', '9. Xarajatlar tuzilmasi'], ['revenue', '5. Daromad manbalari']] },
  { key: 'persona', icon: '👤', title: 'Mijoz portreti', ref: 'A7', fields: [
    ['name', 'Ism, yosh', 'text'], ['job', 'Kasbi, daromadi, yashash joyi', 'text'], ['pains', "Og'riq nuqtalari (muammolari)", 'textarea'],
    ['goals', 'Maqsad va istaklari', 'textarea'], ['channels', 'Ma\'lumotni qayerdan oladi', 'text'], ['criteria', 'Xarid qarorini nima belgilaydi', 'text'], ['objections', "E'tirozlari", 'textarea']] },
  { key: 'market', icon: '🎯', title: 'Bozor va raqobat', ref: 'A7, MT18–19', fields: [
    ['tam', 'TAM — umumiy bozor (so\'m/yil va hisob formulasi)', 'text'], ['sam', 'SAM — xizmat ko\'rsatish mumkin bo\'lgan bozor', 'text'], ['som', 'SOM — 1–3 yilda real egallanadigan ulush', 'text']],
    table: { name: 'competitors', title: 'Raqobatchilar', rows: 3, cols: [['name', 'Raqobatchi'], ['offer', 'Taklifi'], ['price', 'Narxi'], ['weakness', 'Zaif tomoni']] } },
  { key: 'swot', icon: '🔍', title: 'SWOT tahlil', ref: 'MT19', layout: 'grid', fields: [
    ['s', 'S — Kuchli tomonlar'], ['w', 'W — Zaif tomonlar'], ['o', 'O — Imkoniyatlar'], ['t', 'T — Tahdidlar']] },
  { key: 'legal', icon: '⚖️', title: 'Huquqiy shakl va soliq', ref: 'A4–A5', fields: [
    ['form', 'Tashkiliy-huquqiy shakl', 'select', ['', "Yakka tartibdagi tadbirkor (YaTT)", "O'zini o'zi band qilgan shaxs", "Mas'uliyati cheklangan jamiyat (MChJ)", 'Oilaviy korxona', "Fermer xo'jaligi"]],
    ['reason', 'Tanlov sababi (javobgarlik, ta\'sischilar, soliq, kengayish)', 'textarea'],
    ['tax_regime', 'Soliq rejimi', 'select', ['', 'Aylanmadan olinadigan soliq', "Umumbelgilangan (QQS + foyda solig'i)", "YaTT uchun qat'iy belgilangan soliq", "Soliqdan ozod (o'zini o'zi band qilgan)"]],
    ['documents', 'Zarur hujjatlar va litsenziyalar', 'textarea']] },
  { key: 'pricing', icon: '🏷️', title: 'Narx va zararsizlik nuqtasi', ref: 'A10', fields: [
    ['fixed', 'Oylik doimiy xarajatlar, so\'m', 'number'], ['variable', "O'zgaruvchan xarajat (1 dona), so'm", 'number'],
    ['price', 'Sotish narxi (1 dona), so\'m', 'number'], ['volume', 'Rejalashtirilgan savdo, dona/oy', 'number'], ['competitor_price', 'Raqobatchi narxi, so\'m', 'number']] },
  { key: 'marketing', icon: '📣', title: 'Marketing va savdo', ref: 'A8–A9', fields: [
    ['channels', 'Kanallar va ularni tanlash sababi', 'textarea'], ['content', 'Kontent-reja (asosiy g\'oyalar)', 'textarea'],
    ['budget', 'Oylik reklama byudjeti, so\'m', 'number'], ['sales', "Savdo jarayoni va e'tirozlarga javoblar", 'textarea'], ['delivery', 'Yetkazib berish usuli', 'text']] },
  { key: 'cashflow', icon: '💵', title: 'Pul oqimi (3 oy)', ref: 'A11', layout: 'cashflow' },
  { key: 'risks', icon: '⚠️', title: 'Xavflar matritsasi', ref: 'A14', layout: 'risks' },
  { key: 'funding', icon: '🏦', title: 'Moliyalashtirish', ref: 'A3', fields: [
    ['amount', 'Kerakli mablag\', so\'m', 'number'], ['source', 'Manba (o\'z mablag\'i, kredit, grant, investor, dastur)', 'text'],
    ['purpose', 'Mablag\'ning sarflanishi (smeta)', 'textarea'], ['repay', 'Qaytarish manbai va jadvali / investorga taklif', 'textarea']] },
  { key: 'pitch', icon: '🎤', title: 'Pitch va keyingi qadamlar', ref: 'A15', fields: [
    ['summary', 'Rezyume: loyihaning 1 sahifalik qisqacha mazmuni', 'textarea'], ['ask', "So'rov: qancha mablag', nimaga, investor/bank nima oladi", 'textarea'],
    ['next90', 'Birinchi 90 kun rejasi', 'textarea']] },
];

function filled(v) {
  if (v === null || v === undefined) return 0;
  if (Array.isArray(v)) return v.reduce((n, x) => n + filled(x), 0);
  if (typeof v === 'object') return Object.values(v).reduce((n, x) => n + filled(x), 0);
  return String(v).trim() ? 1 : 0;
}
const isDone = (data, key) => filled(data[key]) >= MIN[key];
const n = (v) => Number(v) || 0;

function cashflowCalc(cf = {}) {
  const months = [0, 1, 2].map((i) => {
    const inn = CF_IN.reduce((a, [k]) => a + n(cf.rows?.[k]?.[i]), 0);
    const out = CF_OUT.reduce((a, [k]) => a + n(cf.rows?.[k]?.[i]), 0);
    return { inn, out, net: inn - out };
  });
  let bal = n(cf.start);
  for (const m of months) { m.begin = bal; bal += m.net; m.end = bal; }
  return months;
}

// ---------- Ko'rinish ----------
export async function projectView(view, ctx) {
  const courseId = ctx.params.id;
  const userQ = ctx.query.user ? `?user_id=${ctx.query.user}` : '';
  const d = await api.get(`/api/courses/${courseId}/project${userQ}`);
  if (!ctx.isCurrent()) return;
  const { project, owner, course, readonly } = d;
  const data = project.data || {};
  let active = ctx.query.s && SECTIONS.some((s) => s.key === ctx.query.s) ? ctx.query.s : 'idea';
  let mode = ctx.query.view === 'plan' ? 'plan' : 'edit';
  let saveTimer = null;
  let saving = false;
  view.className = 'content wide';
  if (!readonly) setTutorContext({ course_id: course.id, title: "Biznes loyiha · rol o'yinlari: bank, investor, xaridor" });

  const shell = () => {
    const doneN = SECTIONS.filter((s) => isDone(data, s.key)).length;
    setHTML(view, html`
      <div class="small muted"><a href="#/courses/${course.id}">${course.title}</a> › Biznes loyiha</div>
      <div class="page-head"><div><h1>💼 ${readonly ? `${owner.name}: biznes loyihasi` : 'Mening biznes loyiham'}</h1>
        <p>Semestr davomidagi vertikal loyiha: har bir amaliy mashg'ulot natijasini shu yerga kiriting — yakunda u biznes-rejaga aylanadi.</p></div>
        <div class="row"><span class="small muted" id="save-status">${project.updated_at ? `Saqlangan: ${timeAgo(project.updated_at)}` : ''}</span>
          <button class="btn" data-mode="${mode === 'plan' ? 'edit' : 'plan'}">${mode === 'plan' ? '✏️ Tahrirlash' : '📄 Biznes-reja ko\'rinishi'}</button>
          <button class="btn primary" data-review>🤖 AI ekspert bahosi</button></div></div>
      <div class="lesson-layout">
        <aside class="lesson-side"><div class="card" style="padding:12px">
          <div class="row between small" style="margin-bottom:6px"><strong>Tayyorlik</strong><span>${doneN} / ${SECTIONS.length}</span></div>
          ${progressBar((doneN / SECTIONS.length) * 100)}
          <div style="margin-top:10px" id="sec-list">${SECTIONS.map((s) => html`<a class="act-link ${s.key === active && mode === 'edit' ? 'active' : ''}" data-sec="${s.key}">
            <span>${s.icon}</span><span style="min-width:0">${s.title}<div class="small muted">${s.ref}</div></span><span class="st">${isDone(data, s.key) ? '✅' : ''}</span></a>`)}</div></div>
          ${project.teacher_comment ? html`<div class="card" style="padding:14px"><h4>👩‍🏫 O'qituvchi izohi</h4><p class="small">${project.teacher_comment}</p></div>` : ''}
          ${readonly && isTeacher() ? html`<form class="card" id="tc-form" style="padding:14px"><h4>👩‍🏫 Izoh qoldirish</h4><textarea name="c" rows="5">${project.teacher_comment || ''}</textarea><button class="btn primary sm" style="margin-top:8px">Yuborish</button></form>` : ''}
          <div id="ai-box">${aiBox(project.ai_feedback)}</div>
        </aside>
        <section class="card" id="stage"></section></div>`);
    drawStage();
  };

  const drawStage = () => {
    const stage = view.querySelector('#stage');
    if (mode === 'plan') { setHTML(stage, planDoc(data, owner, course)); return; }
    const s = SECTIONS.find((x) => x.key === active);
    const v = data[s.key] || {};
    setHTML(stage, html`<div class="row between" style="margin-bottom:12px"><h2 style="margin:0">${s.icon} ${s.title}</h2><span class="badge primary">${s.ref}</span></div>
      <fieldset id="sec-form" style="border:0;padding:0;margin:0" ${readonly ? 'disabled' : ''}>${sectionForm(s, v)}</fieldset>
      <div id="sec-calc">${sectionCalc(s.key, v)}</div>
      <hr><div class="row between">${(() => {
        const i = SECTIONS.indexOf(s);
        return html`${i > 0 ? html`<button class="btn" data-sec="${SECTIONS[i - 1].key}">← ${SECTIONS[i - 1].title}</button>` : html`<span></span>`}
          ${i < SECTIONS.length - 1 ? html`<button class="btn primary" data-sec="${SECTIONS[i + 1].key}">${SECTIONS[i + 1].title} →</button>` : html`<button class="btn primary" data-mode="plan">📄 Biznes-rejani ko'rish</button>`}`;
      })()}</div>`);
    if (readonly) return;
    const form = stage.querySelector('#sec-form');
    form.addEventListener('input', () => {
      data[s.key] = readSection(s, form);
      setHTML(stage.querySelector('#sec-calc'), sectionCalc(s.key, data[s.key]));
      scheduleSave();
    });
  };

  const scheduleSave = () => {
    const st = view.querySelector('#save-status');
    if (st) st.textContent = 'Saqlanmoqda…';
    clearTimeout(saveTimer);
    saveTimer = setTimeout(save, 1000);
  };
  const save = async () => {
    if (saving) { scheduleSave(); return; }
    saving = true;
    try {
      const r = await api.put(`/api/courses/${courseId}/project`, { data });
      const st = view.querySelector('#save-status');
      if (st) st.textContent = 'Saqlandi ✓';
      if (r.xp) { toast(`⭐ +${r.xp} XP — loyiha bo'limi tayyor!`, 'reward'); refreshUser(); }
      // Yon panel belgilarini yangilash
      view.querySelectorAll('#sec-list [data-sec]').forEach((a) => { a.querySelector('.st').textContent = isDone(data, a.dataset.sec) ? '✅' : ''; });
    } catch (e) { toast(e.message, 'error'); } finally { saving = false; }
  };

  on(view, 'click', '[data-sec]', (e, b) => { active = b.dataset.sec; mode = 'edit'; shell(); window.scrollTo({ top: 0 }); });
  on(view, 'click', '[data-mode]', (e, b) => { mode = b.dataset.mode; shell(); });
  on(view, 'click', '[data-print]', () => window.print());
  on(view, 'click', '[data-review]', async (e, b) => {
    b.disabled = true;
    b.innerHTML = '<span class="spinner"></span> Baholanmoqda…';
    try {
      clearTimeout(saveTimer);
      if (!readonly) await api.put(`/api/courses/${courseId}/project`, { data });
      const { feedback } = await api.post(`/api/courses/${courseId}/project/review`, readonly ? { user_id: owner.id } : {});
      project.ai_feedback = feedback;
      setHTML(view.querySelector('#ai-box'), aiBox(feedback));
      view.querySelector('#ai-box').scrollIntoView({ behavior: 'smooth' });
    } catch (err) { toast(err.message, 'error'); }
    b.disabled = false;
    b.textContent = '🤖 AI ekspert bahosi';
  });
  view.addEventListener('submit', async (e) => {
    if (e.target.id !== 'tc-form') return;
    e.preventDefault();
    try {
      await api.patch(`/api/courses/${courseId}/projects/${owner.id}`, { teacher_comment: e.target.elements.c.value });
      toast('Izoh yuborildi', 'success');
    } catch (err) { toast(err.message, 'error'); }
  });
  shell();
}

function aiBox(f) {
  if (!f) return '';
  return html`<div class="card" style="padding:14px"><div class="row between"><h4 style="margin:0">🤖 Ekspert bahosi</h4>${ring(f.score, f.score)}</div>
    <p class="small"><strong>${f.verdict || ''}</strong></p><p class="small">${f.summary || ''}</p>
    ${f.strengths?.length ? html`<div class="small"><strong>✅ Kuchli tomonlar</strong><ul>${f.strengths.map((x) => html`<li>${x}</li>`)}</ul></div>` : ''}
    ${f.gaps?.length ? html`<div class="small"><strong>⚠️ Kamchiliklar</strong><ul>${f.gaps.map((x) => html`<li>${x}</li>`)}</ul></div>` : ''}
    ${f.next_steps?.length ? html`<div class="small"><strong>➡️ Keyingi qadamlar</strong><ul>${f.next_steps.map((x) => html`<li>${x}</li>`)}</ul></div>` : ''}
    ${f.questions?.length ? html`<div class="small"><strong>❓ Investor savollari</strong><ul>${f.questions.map((x) => html`<li>${x}</li>`)}</ul></div>` : ''}</div>`;
}

// ---------- Bo'lim formalari ----------
function field([name, label, type = 'textarea', options], v) {
  const id = `pf-${name}`;
  const val = v?.[name] ?? '';
  if (type === 'select') return html`<div class="field"><label for="${id}">${label}</label><select id="${id}" data-f="${name}">${options.map((o) => html`<option value="${o}" ${o === val ? 'selected' : ''}>${o || '— tanlang —'}</option>`)}</select></div>`;
  if (type === 'text' || type === 'number') return html`<div class="field"><label for="${id}">${label}</label><input id="${id}" type="${type}" data-f="${name}" value="${val}" ${type === 'number' ? 'min="0" step="any"' : ''}></div>`;
  return html`<div class="field"><label for="${id}">${label}</label><textarea id="${id}" data-f="${name}" rows="3">${val}</textarea></div>`;
}

function sectionForm(s, v) {
  if (s.layout === 'canvas') {
    const f = Object.fromEntries(s.fields.map((x) => [x[0], x]));
    const box = (k, extra = '') => html`<div style="${extra}">${field([k, f[k][1], 'textarea'], v)}</div>`;
    return html`<div style="display:grid;gap:10px;grid-template-columns:repeat(auto-fit,minmax(170px,1fr))">
      ${box('segments')}${box('value')}${box('channels')}${box('relations')}${box('revenue')}${box('resources')}${box('activities')}${box('partners')}${box('costs')}</div>
      <p class="small muted">Tartib: o'ng tomon (1–5) — mijoz va daromad; chap tomon (6–9) — resurslar va xarajatlar. Shablon: Resurslar → Shablonlar.</p>`;
  }
  if (s.layout === 'grid') return html`<div class="grid grid-2">${s.fields.map((x) => field([x[0], x[1], 'textarea'], v))}</div>`;
  if (s.layout === 'cashflow') {
    const rows = v.rows || {};
    const cell = (k, i) => html`<td><input type="number" min="0" step="any" data-cf="${k}" data-i="${i}" value="${rows[k]?.[i] ?? ''}" style="min-width:110px"></td>`;
    return html`<div class="field" style="max-width:320px"><label for="pf-start">Boshlang'ich qoldiq (o'z mablag'i), so'm</label><input id="pf-start" type="number" data-f="start" value="${v.start ?? ''}"></div>
      <div class="table-wrap"><table class="table"><thead><tr><th>Modda</th><th>1-oy</th><th>2-oy</th><th>3-oy</th></tr></thead><tbody>
      <tr><td colspan="4"><strong>Kirimlar</strong></td></tr>
      ${CF_IN.map(([k, l]) => html`<tr><td>${l}</td>${[0, 1, 2].map((i) => cell(k, i))}</tr>`)}
      <tr><td colspan="4"><strong>Chiqimlar</strong></td></tr>
      ${CF_OUT.map(([k, l]) => html`<tr><td>${l}</td>${[0, 1, 2].map((i) => cell(k, i))}</tr>`)}
      </tbody></table></div>`;
  }
  if (s.layout === 'risks') {
    const list = Array.isArray(v.items) && v.items.length ? v.items : Array.from({ length: 5 }, () => ({}));
    return html`<div class="table-wrap"><table class="table"><thead><tr><th>Xavf</th><th>Turi</th><th>Ehtimollik (1–5)</th><th>Ta'sir (1–5)</th><th>Chora</th></tr></thead><tbody>
      ${list.map((r, i) => html`<tr data-risk="${i}"><td><input type="text" data-r="name" value="${r.name || ''}" style="min-width:160px"></td>
        <td><select data-r="type">${['', ...RISK_TYPES].map((t) => html`<option ${t === r.type ? 'selected' : ''}>${t}</option>`)}</select></td>
        <td><input type="number" min="1" max="5" data-r="prob" value="${r.prob || ''}" style="width:80px"></td>
        <td><input type="number" min="1" max="5" data-r="impact" value="${r.impact || ''}" style="width:80px"></td>
        <td><input type="text" data-r="action" value="${r.action || ''}" style="min-width:200px"></td></tr>`)}
      </tbody></table></div><p class="small muted">Kamida 4–5 ta turli xavfni yozing. Daraja = ehtimollik × ta'sir (15+ yuqori, 8–14 o'rta).</p>`;
  }
  return html`${s.fields.map((x) => field(x, v))}
    ${s.table ? html`<h4>${s.table.title}</h4><div class="table-wrap"><table class="table"><thead><tr>${s.table.cols.map(([, l]) => html`<th>${l}</th>`)}</tr></thead><tbody>
      ${Array.from({ length: Math.max(s.table.rows, (v[s.table.name] || []).length) }, (_, i) => html`<tr data-row="${i}">${s.table.cols.map(([k]) => html`<td><input type="text" data-t="${k}" value="${v[s.table.name]?.[i]?.[k] || ''}" style="min-width:120px"></td>`)}</tr>`)}
      </tbody></table></div>` : ''}`;
}

function readSection(s, form) {
  const out = {};
  form.querySelectorAll('[data-f]').forEach((el) => { out[el.dataset.f] = el.value; });
  if (s.table) out[s.table.name] = [...form.querySelectorAll('[data-row]')].map((tr) => Object.fromEntries([...tr.querySelectorAll('[data-t]')].map((el) => [el.dataset.t, el.value])));
  if (s.layout === 'cashflow') {
    out.rows = {};
    form.querySelectorAll('[data-cf]').forEach((el) => { (out.rows[el.dataset.cf] ||= ['', '', ''])[Number(el.dataset.i)] = el.value; });
  }
  if (s.layout === 'risks') {
    out.items = [...form.querySelectorAll('[data-risk]')].map((tr) => Object.fromEntries([...tr.querySelectorAll('[data-r]')].map((el) => [el.dataset.r, el.value])));
  }
  return out;
}

// ---------- Avtomatik hisob-kitoblar ----------
function sectionCalc(key, v = {}) {
  if (key === 'pricing') {
    const m = n(v.price) - n(v.variable);
    if (!n(v.price) || !n(v.fixed)) return html`<p class="small muted">Narx va xarajatlarni kiriting — zararsizlik nuqtasi avtomatik hisoblanadi.</p>`;
    if (m <= 0) return html`<div class="alert danger">Narx o'zgaruvchan xarajatdan yuqori bo'lishi kerak.</div>`;
    const bep = Math.ceil(n(v.fixed) / m);
    const profit = n(v.volume) * m - n(v.fixed);
    return html`<div class="card" style="box-shadow:none;background:var(--surface-2)"><div class="grid grid-3">
      <div><div class="small muted">Zararsizlik nuqtasi</div><strong style="font-size:1.2rem">${bep} dona/oy</strong></div>
      <div><div class="small muted">Rejadagi oylik foyda</div><strong style="font-size:1.2rem;color:${profit >= 0 ? 'var(--success)' : 'var(--danger)'}">${som(profit)}</strong></div>
      <div><div class="small muted">Raqobatchiga nisbatan</div><strong style="font-size:1.2rem">${n(v.competitor_price) ? `${Math.round(((n(v.price) - n(v.competitor_price)) / n(v.competitor_price)) * 100)}%` : '—'}</strong></div></div>
      ${breakEvenChart({ fixed: n(v.fixed), price: n(v.price), variable: n(v.variable), maxQty: Math.max(n(v.volume), bep * 1.6) })}</div>`;
  }
  if (key === 'cashflow') {
    const ms = cashflowCalc(v);
    return html`<div class="table-wrap" style="margin-top:12px"><table class="table" style="font-variant-numeric:tabular-nums"><thead><tr><th>Natija</th><th>1-oy</th><th>2-oy</th><th>3-oy</th></tr></thead><tbody>
      <tr><td>Oy boshidagi qoldiq</td>${ms.map((m) => html`<td>${som(m.begin)}</td>`)}</tr>
      <tr><td>Jami kirim</td>${ms.map((m) => html`<td>${som(m.inn)}</td>`)}</tr>
      <tr><td>Jami chiqim</td>${ms.map((m) => html`<td>${som(m.out)}</td>`)}</tr>
      <tr><td><strong>Sof pul oqimi</strong></td>${ms.map((m) => html`<td class="${m.net >= 0 ? 'score-hi' : 'score-lo'}">${som(m.net)}</td>`)}</tr>
      <tr><td><strong>Oy oxiridagi qoldiq</strong></td>${ms.map((m) => html`<td class="${m.end < 0 ? 'score-lo' : ''}"><strong>${som(m.end)}</strong></td>`)}</tr></tbody></table></div>
      ${ms.some((m) => m.end < 0) ? html`<div class="alert danger small">⚠️ Kassa uzilishi xavfi: ${ms.map((m, i) => (m.end < 0 ? `${i + 1}-oy` : null)).filter(Boolean).join(', ')}da qoldiq manfiy. Avans, to'lov muddatini uzaytirish yoki qo'shimcha moliyalashtirishni rejalashtiring.</div>` : ''}`;
  }
  if (key === 'risks') {
    const items = (v.items || []).filter((r) => r.name);
    if (!items.length) return '';
    const lvl = (r) => n(r.prob) * n(r.impact);
    return html`<h4 style="margin-top:14px">Xavflar xaritasi</h4><div class="stack">${[...items].sort((a, b) => lvl(b) - lvl(a)).map((r) => {
      const L = lvl(r);
      const c = L >= 15 ? 'danger' : L >= 8 ? 'warning' : 'success';
      return html`<div class="row" style="flex-wrap:nowrap"><span class="badge ${c}" style="min-width:64px;justify-content:center">${L || '—'}</span><span style="flex:1">${r.name}${r.type ? html` <span class="small muted">(${r.type})</span>` : ''}</span><span class="small muted">${r.action || ''}</span></div>`;
    })}</div>`;
  }
  return '';
}

// ---------- Biznes-reja hujjati ----------
function planDoc(d, owner, course) {
  const t = (s) => (s ? md(s) : html`<p class="muted">— to'ldirilmagan —</p>`);
  const p = d.pricing || {};
  const bep = n(p.price) > n(p.variable) && n(p.fixed) ? Math.ceil(n(p.fixed) / (n(p.price) - n(p.variable))) : null;
  const ms = cashflowCalc(d.cashflow || {});
  const c = d.canvas || {};
  const cv = (k, l) => html`<div style="border:1px solid var(--border);border-radius:8px;padding:8px"><div class="small" style="font-weight:700">${l}</div><div class="small">${c[k] || '—'}</div></div>`;
  return html`<div class="row between no-print" style="margin-bottom:10px"><span class="small muted">Biznes-reja loyihangiz bo'limlaridan avtomatik yig'ildi.</span><button class="btn" data-print>🖨 Chop etish / PDF</button></div>
  <article class="prose">
    <h1 style="margin-bottom:0">Biznes-reja</h1>
    <p class="muted">${owner.name} · ${course.title}${course.code ? ` (${course.code})` : ''}</p>
    <h2>1. Rezyume</h2>${t(d.pitch?.summary)}
    <h2>2. Biznes g'oya va mahsulot</h2>
    <p><strong>Muammo.</strong> ${d.idea?.problem || '—'}</p><p><strong>Yechim.</strong> ${d.idea?.solution || '—'}</p>
    <p><strong>Qiymat taklifi.</strong> ${d.idea?.value_prop || '—'}</p><p><strong>MVP va sinov natijalari.</strong> ${d.idea?.mvp || '—'}</p>
    <h2>3. Biznes-model</h2>
    <div style="display:grid;gap:6px;grid-template-columns:repeat(auto-fit,minmax(150px,1fr))">${cv('segments', 'Mijozlar segmentlari')}${cv('value', 'Qiymat taklifi')}${cv('channels', 'Sotish kanallari')}${cv('relations', 'Munosabat')}${cv('revenue', 'Daromad manbalari')}${cv('resources', 'Asosiy resurslar')}${cv('activities', 'Asosiy faoliyat')}${cv('partners', 'Hamkorlar')}${cv('costs', 'Xarajatlar')}</div>
    <h2>4. Bozor tahlili</h2>
    <p><strong>Mijoz portreti:</strong> ${[d.persona?.name, d.persona?.job].filter(Boolean).join(', ') || '—'}. Muammolari: ${d.persona?.pains || '—'}. Xarid mezonlari: ${d.persona?.criteria || '—'}.</p>
    <p><strong>Bozor hajmi:</strong> TAM: ${d.market?.tam || '—'}; SAM: ${d.market?.sam || '—'}; SOM: ${d.market?.som || '—'}.</p>
    <table><thead><tr><th>Raqobatchi</th><th>Taklif</th><th>Narx</th><th>Zaif tomoni</th></tr></thead><tbody>${(() => { const rows = (d.market?.competitors || []).filter((r) => r.name); return rows.length ? rows.map((r) => html`<tr><td>${r.name}</td><td>${r.offer}</td><td>${r.price}</td><td>${r.weakness}</td></tr>`) : html`<tr><td colspan="4" class="muted">— to'ldirilmagan —</td></tr>`; })()}</tbody></table>
    <table><tbody><tr><td><strong>S</strong> ${d.swot?.s || '—'}</td><td><strong>W</strong> ${d.swot?.w || '—'}</td></tr><tr><td><strong>O</strong> ${d.swot?.o || '—'}</td><td><strong>T</strong> ${d.swot?.t || '—'}</td></tr></tbody></table>
    <h2>5. Marketing va savdo</h2><p><strong>Kanallar:</strong> ${d.marketing?.channels || '—'}</p><p><strong>Kontent:</strong> ${d.marketing?.content || '—'}</p>
    <p><strong>Reklama byudjeti:</strong> ${d.marketing?.budget ? som(d.marketing.budget) + '/oy' : '—'} · <strong>Yetkazib berish:</strong> ${d.marketing?.delivery || '—'}</p><p><strong>Savdo jarayoni:</strong> ${d.marketing?.sales || '—'}</p>
    <h2>6. Tashkiliy reja</h2><p><strong>Huquqiy shakl:</strong> ${d.legal?.form || '—'}${d.legal?.reason ? ` — ${d.legal.reason}` : ''}</p><p><strong>Soliq rejimi:</strong> ${d.legal?.tax_regime || '—'}</p><p><strong>Hujjatlar:</strong> ${d.legal?.documents || '—'}</p>
    <h2>7. Moliyaviy reja</h2>
    <table><tbody><tr><td>Narx (1 dona)</td><td>${som(p.price)}</td></tr><tr><td>O'zgaruvchan xarajat (1 dona)</td><td>${som(p.variable)}</td></tr><tr><td>Doimiy xarajatlar (oy)</td><td>${som(p.fixed)}</td></tr>
      <tr><td>Zararsizlik nuqtasi</td><td><strong>${bep ? `${bep} dona/oy` : '—'}</strong></td></tr><tr><td>Rejadagi savdo</td><td>${p.volume || '—'} dona/oy</td></tr>
      <tr><td>Rejadagi oylik foyda</td><td><strong>${bep ? som(n(p.volume) * (n(p.price) - n(p.variable)) - n(p.fixed)) : '—'}</strong></td></tr></tbody></table>
    <table><thead><tr><th>Pul oqimi</th><th>1-oy</th><th>2-oy</th><th>3-oy</th></tr></thead><tbody>
      <tr><td>Kirim</td>${ms.map((m) => html`<td>${som(m.inn)}</td>`)}</tr><tr><td>Chiqim</td>${ms.map((m) => html`<td>${som(m.out)}</td>`)}</tr>
      <tr><td>Oy oxiridagi qoldiq</td>${ms.map((m) => html`<td><strong>${som(m.end)}</strong></td>`)}</tr></tbody></table>
    <h2>8. Xavflar</h2>
    <table><thead><tr><th>Xavf</th><th>Turi</th><th>Daraja</th><th>Chora</th></tr></thead><tbody>${(() => { const rows = (d.risks?.items || []).filter((r) => r.name); return rows.length ? rows.map((r) => html`<tr><td>${r.name}</td><td>${r.type || ''}</td><td>${n(r.prob) * n(r.impact) || '—'}</td><td>${r.action || ''}</td></tr>`) : html`<tr><td colspan="4" class="muted">— to'ldirilmagan —</td></tr>`; })()}</tbody></table>
    <h2>9. Moliyalashtirish</h2><p><strong>Kerakli mablag':</strong> ${d.funding?.amount ? som(d.funding.amount) : '—'} · <strong>Manba:</strong> ${d.funding?.source || '—'}</p>
    <p><strong>Sarflanishi:</strong> ${d.funding?.purpose || '—'}</p><p><strong>Qaytarish / taklif:</strong> ${d.funding?.repay || '—'}</p>
    <h2>10. So'rov va keyingi qadamlar</h2><p>${d.pitch?.ask || '—'}</p>${t(d.pitch?.next90)}
  </article>`;
}

