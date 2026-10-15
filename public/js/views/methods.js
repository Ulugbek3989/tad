import { api } from '../api.js';
import { html, setHTML, on, shuffle, toast } from '../ui.js';
import { isTeacher } from '../app.js';
import { getMethods } from './lesson.js';

const CAT_ICONS = { interactive: '💡', graphic: '🗺️', group: '🤝', problem: '🧩', assessment: '📏', model: '🏛️' };

export async function methodsView(view, ctx) {
  const { methods, categories } = await getMethods();
  if (!ctx.isCurrent()) return;
  let cat = ctx.query.cat || '';
  let q = '';
  setHTML(view, html`<div class="page-head"><div><h1>🧭 Metodlar kutubxonasi</h1><p>Interfaol metodlar, grafik organayzerlar va zamonaviy ta'lim modellari — darsda qo'llash bo'yicha qadamma-qadam ko'rsatmalar</p></div>
    <input type="search" id="q" placeholder="🔎 Qidirish…" style="max-width:260px"></div>
    <div class="tabs" id="cats"><button data-cat="" class="${!cat ? 'active' : ''}">Barchasi</button>${Object.entries(categories).map(([k, v]) => html`<button data-cat="${k}" class="${cat === k ? 'active' : ''}">${CAT_ICONS[k]} ${v}</button>`)}</div>
    <div id="mlist" class="grid grid-auto"></div>
    <div class="card" style="margin-top:20px"><h3>📐 Bloom taksonomiyasi — o'quv maqsadlarini belgilash uchun</h3>
      <div class="grid grid-3 small">${[
        ['1. Eslash', "Ta'riflang, sanab bering, ayting", 'Test, kartochkalar, blits-so\'rov'],
        ['2. Tushunish', 'Tushuntiring, misol keltiring, solishtiring', 'Klaster, INSERT, Venn diagrammasi'],
        ['3. Qo\'llash', 'Hisoblang, bajaring, yeching', 'Amaliy topshiriq, laboratoriya'],
        ['4. Tahlil', 'Ajrating, sabablarini toping', 'Baliq skeleti, SWOT, keys'],
        ['5. Baholash', 'Asoslang, tanqidiy baholang', 'FSMU, debat, olti qalpoqcha'],
        ['6. Yaratish', 'Loyihalang, ishlab chiqing', 'Loyihaviy ta\'lim, esse, sinkveyn'],
      ].map(([a, b, c]) => html`<div class="card" style="box-shadow:none"><strong>${a}</strong><div class="muted">${b}</div><div style="margin-top:6px">🛠 ${c}</div></div>`)}</div></div>`);
  const draw = () => {
    const list = methods.filter((m) => (!cat || m.category === cat) && (!q || (m.name + m.goal).toLowerCase().includes(q)));
    setHTML(view.querySelector('#mlist'), html`${list.map((m) => html`<a class="card method-card" href="#/methods/${m.key}">
      <div class="row between"><span style="font-size:1.6rem">${CAT_ICONS[m.category]}</span>${m.board ? html`<span class="badge primary">Interaktiv doska</span>` : ''}</div>
      <strong>${m.name}</strong><span class="small muted">${m.goal}</span>
      <div class="row small" style="margin-top:auto"><span class="badge">⏱ ${m.duration}</span><span class="badge">👥 ${m.group}</span></div></a>`)}
      ${!list.length ? html`<p class="muted">Topilmadi</p>` : ''}`);
  };
  draw();
  on(view, 'click', '[data-cat]', (e, b) => { cat = b.dataset.cat; view.querySelectorAll('#cats button').forEach((x) => x.classList.toggle('active', x === b)); draw(); });
  view.querySelector('#q').addEventListener('input', (e) => { q = e.target.value.toLowerCase(); draw(); });
}

export async function methodView(view, ctx) {
  const { methods, categories } = await getMethods();
  if (!ctx.isCurrent()) return;
  const m = methods.find((x) => x.key === ctx.params.key);
  if (!m) { setHTML(view, html`<div class="empty"><h2>Metod topilmadi</h2><a href="#/methods">Kutubxonaga</a></div>`); return; }
  setHTML(view, html`<div class="small muted"><a href="#/methods">← Metodlar kutubxonasi</a></div>
    <div class="page-head"><div><span class="badge primary">${CAT_ICONS[m.category]} ${categories[m.category]}</span><h1 style="margin-top:8px">${m.name}</h1><p>${m.goal}</p></div></div>
    <div class="grid dash-split">
      <div class="card"><h3>📋 O'tkazish tartibi</h3><ol class="steps">${m.steps.map((s) => html`<li>${s}</li>`)}</ol>
        ${m.tips ? html`<div class="alert info"><strong>💡 Maslahat:</strong> ${m.tips}</div>` : ''}</div>
      <div class="stack">
        <div class="card"><table class="table"><tbody>
          <tr><td class="muted">Davomiyligi</td><td><strong>${m.duration}</strong></td></tr>
          <tr><td class="muted">Ishtirokchilar</td><td><strong>${m.group}</strong></td></tr>
          <tr><td class="muted">Bloom darajasi</td><td>${m.bloom.join(', ')}</td></tr></tbody></table></div>
        ${m.board ? html`<div class="card"><h4>🧠 Platformada qo'llash</h4><p class="small">Dars muharririda <strong>"Interaktiv doska"</strong> mashg'ulotini qo'shing va metod sifatida <strong>${m.name}</strong> ni tanlang. Ustunlar avtomatik yaratiladi:</p>
          <div class="row">${m.board.map((c) => html`<span class="badge">${c}</span>`)}</div></div>` : ''}
        ${isTeacher() ? html`<div class="card"><h4>🧰 Dars vositalari</h4><p class="small muted">Taymer, tasodifiy o'quvchi tanlash va guruhlarga bo'lish.</p><a class="btn" href="#/tools">Ochish →</a></div>` : ''}
      </div></div>`);
}

// ======================= Dars vositalari =======================
export async function toolsView(view, ctx) {
  const { groups } = await api.get('/api/groups');
  if (!ctx.isCurrent()) return;
  setHTML(view, html`<div class="page-head"><div><h1>🧰 Dars vositalari</h1><p>Darsni interaktiv o'tkazish uchun yordamchi vositalar (proyektorda ko'rsatish uchun qulay)</p></div>
    <select id="tg" style="width:auto"><option value="">— Guruhni tanlang —</option>${groups.map((g) => html`<option value="${g.id}">${g.name} (${g.course_title})</option>`)}</select></div>
    <div class="grid grid-2">
      <div class="card"><h3>⏱ Taymer</h3>
        <div class="big-timer" id="timer">05:00</div>
        <div class="row" style="justify-content:center">${[1, 3, 5, 10, 15, 20].map((n) => html`<button class="chip" data-min="${n}">${n} daq</button>`)}</div>
        <div class="row" style="justify-content:center;margin-top:12px"><button class="btn primary" id="t-start">▶ Boshlash</button><button class="btn" id="t-pause">⏸ To'xtatish</button><button class="btn" id="t-reset">↺</button></div></div>
      <div class="card"><h3>🎲 Tasodifiy o'quvchi</h3>
        <div class="picked" id="picked">—</div>
        <label class="row small" style="justify-content:center;font-weight:500"><input type="checkbox" id="no-repeat" checked> Takrorlanmasin</label>
        <div class="row" style="justify-content:center;margin-top:10px"><button class="btn primary lg" id="pick">🎲 Tanlash</button></div>
        <p class="small muted center" id="pick-info">Avval guruhni tanlang</p></div>
      <div class="card"><h3>👥 Guruhlarga bo'lish</h3><p class="small muted">Zig-zag, Bumerang, keys-stadi va loyihaviy ish uchun</p>
        <div class="row"><label style="margin:0">Guruhlar soni</label><input type="number" id="ng" value="4" min="2" max="20" style="width:90px"><button class="btn primary" id="split">🔀 Bo'lish</button></div>
        <div id="teams" class="grid grid-2" style="margin-top:12px"></div></div>
      <div class="card"><h3>🎩 Olti qalpoqcha taqsimoti</h3><p class="small muted">Har bir o'quvchiga tasodifiy "qalpoqcha" (rol) beriladi</p>
        <button class="btn" id="hats">🎩 Taqsimlash</button><div id="hats-out" style="margin-top:10px"></div></div>
    </div>`);

  // Taymer
  let total = 300;
  let left = 300;
  let iv = null;
  const show = () => {
    const el = view.querySelector('#timer');
    if (!el) { clearInterval(iv); return; }
    el.textContent = `${String(Math.floor(left / 60)).padStart(2, '0')}:${String(left % 60).padStart(2, '0')}`;
    el.style.color = left <= 10 ? 'var(--danger)' : '';
  };
  on(view, 'click', '[data-min]', (e, b) => { clearInterval(iv); iv = null; total = left = Number(b.dataset.min) * 60; show(); });
  view.querySelector('#t-start').addEventListener('click', () => {
    if (iv) return;
    iv = setInterval(() => {
      if (left <= 0) { clearInterval(iv); iv = null; toast('⏰ Vaqt tugadi!', 'reward'); beep(); return; }
      left--; show();
    }, 1000);
  });
  view.querySelector('#t-pause').addEventListener('click', () => { clearInterval(iv); iv = null; });
  view.querySelector('#t-reset').addEventListener('click', () => { clearInterval(iv); iv = null; left = total; show(); });

  // O'quvchilar
  let members = [];
  let used = new Set();
  view.querySelector('#tg').addEventListener('change', async (e) => {
    members = e.target.value ? (await api.get(`/api/groups/${e.target.value}`)).members : [];
    used = new Set();
    view.querySelector('#pick-info').textContent = `${members.length} o'quvchi`;
  });
  view.querySelector('#pick').addEventListener('click', () => {
    if (!members.length) return toast('Guruhni tanlang', 'error');
    const noRep = view.querySelector('#no-repeat').checked;
    let pool = noRep ? members.filter((m) => !used.has(m.id)) : members;
    if (!pool.length) { used = new Set(); pool = members; toast('Barcha o\'quvchilar tanlandi — qaytadan boshlandi'); }
    const out = view.querySelector('#picked');
    let n = 0;
    const spin = setInterval(() => {
      out.textContent = pool[Math.floor(Math.random() * pool.length)].name;
      if (++n > 14) {
        clearInterval(spin);
        const p = pool[Math.floor(Math.random() * pool.length)];
        used.add(p.id);
        out.textContent = `🎉 ${p.name}`;
      }
    }, 70);
  });
  view.querySelector('#split').addEventListener('click', () => {
    if (!members.length) return toast('Guruhni tanlang', 'error');
    const n = Math.max(2, Math.min(20, Number(view.querySelector('#ng').value) || 2));
    const teams = Array.from({ length: n }, () => []);
    shuffle(members).forEach((m, i) => teams[i % n].push(m.name));
    setHTML(view.querySelector('#teams'), html`${teams.map((t, i) => html`<div class="card" style="box-shadow:none;padding:12px"><strong>${i + 1}-guruh</strong><ul class="small" style="margin:6px 0 0;padding-left:1.2em">${t.map((x) => html`<li>${x}</li>`)}</ul></div>`)}`);
  });
  view.querySelector('#hats').addEventListener('click', () => {
    if (!members.length) return toast('Guruhni tanlang', 'error');
    const hats = ['⚪ Oq — faktlar', '🔴 Qizil — hissiyot', '⚫ Qora — xavflar', '🟡 Sariq — afzalliklar', '🟢 Yashil — g\'oyalar', '🔵 Ko\'k — boshqaruv'];
    setHTML(view.querySelector('#hats-out'), html`<table class="table"><tbody>${shuffle(members).map((m, i) => html`<tr><td>${m.name}</td><td>${hats[i % 6]}</td></tr>`)}</tbody></table>`);
  });
}

function beep() {
  try {
    const ctx = new AudioContext();
    const o = ctx.createOscillator();
    o.frequency.value = 880;
    o.connect(ctx.destination);
    o.start();
    setTimeout(() => { o.stop(); ctx.close(); }, 600);
  } catch { /* e'tiborsiz */ }
}
