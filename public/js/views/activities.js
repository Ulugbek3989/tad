// Mashg'ulot turlari uchun interaktiv pleyerlar
import { api } from '../api.js';
import { html, raw, setHTML, md, toast, celebrate, ring, on, shuffle, sortable, videoEmbed, esc, timeAgo, confirmDialog } from '../ui.js';
import { isTeacher, state, refreshUser } from '../app.js';

const PLAYERS = { slides, reading, quiz, flashcards, matching, ordering, fillblank, classify, lab, practical, case: caseStudy, essay, board };

/** Mashg'ulotni konteynerga chizadi. onResult(result) — topshirilgandan keyin. */
export function renderActivity(el, act, { onResult } = {}) {
  const player = PLAYERS[act.type];
  if (!player) return setHTML(el, html`<p class="muted">Bu turdagi mashg'ulot qo'llab-quvvatlanmaydi.</p>`);
  const ctx = {
    act,
    async submit(answer) {
      const { result } = await api.post(`/api/activities/${act.id}/submit`, { answer });
      if (result.preview) toast("O'qituvchi rejimi: natija saqlanmadi", 'info');
      celebrate(result);
      if (!result.preview && !result.already) {
        act.result = { best: Math.max(act.result?.best ?? 0, result.score), max: result.max, attempts: (act.result?.attempts || 0) + 1 };
        onResult?.(result);
        refreshUser();
      }
      return result;
    },
  };
  player(el, ctx);
}

const header = (act) => html`${act.instructions ? html`<div class="alert info prose" style="margin-bottom:16px">${md(act.instructions)}</div>` : ''}`;

function attemptsInfo(act) {
  const used = act.result?.attempts || 0;
  if (!act.attempts) return used ? `Urinishlar: ${used}` : '';
  return `Urinishlar: ${used} / ${act.attempts}`;
}

function scoreBlock(r, extra = '') {
  const pct = r.max ? (r.score / r.max) * 100 : 100;
  const msg = pct >= 90 ? "A'lo natija! 🎉" : pct >= 70 ? 'Yaxshi! 👍' : pct >= 50 ? "Yomon emas, yana mashq qiling 💪" : "Mavzuni qayta ko'rib chiqing 📖";
  return html`<div class="result-box"><div class="row" style="gap:18px">${ring(pct, `${Math.round(r.score * 10) / 10}/${r.max}`)}
    <div><div style="font-size:1.2rem;font-weight:800">${msg}</div>
    ${r.xp ? html`<div class="badge warning">⭐ +${r.xp} XP</div>` : ''} ${extra}</div></div></div>`;
}

function aiFeedbackBlock(ai, status) {
  if (!ai) return '';
  return html`<div class="result-box">
    <div class="row between"><h3 style="margin:0">🤖 ${ai.provider === 'rule' ? 'Dastlabki baho' : 'AI baholash'}</h3>
      ${status === 'pending' ? html`<span class="badge warning">O'qituvchi tekshiradi</span>` : status === 'ai_graded' ? html`<span class="badge info">AI baholadi · o'qituvchi tasdiqlashi mumkin</span>` : status === 'reviewed' ? html`<span class="badge success">O'qituvchi tasdiqladi</span>` : ''}</div>
    <div class="row" style="gap:18px;margin-top:12px">${ring(ai.score && ai.max ? (ai.score / ai.max) * 100 : 0, ai.max ? `${ai.score}/${ai.max}` : ai.score)}<p style="flex:1;margin:0">${ai.feedback}</p></div>
    ${ai.criteria?.length ? html`<table class="table" style="margin-top:12px"><thead><tr><th>Mezon</th><th>Ball</th><th>Izoh</th></tr></thead><tbody>${ai.criteria.map((c) => html`<tr><td>${c.name}</td><td class="nowrap">${c.score}/${c.max}</td><td class="small">${c.comment}</td></tr>`)}</tbody></table>` : ''}
    <div class="grid grid-2" style="margin-top:12px">
      ${ai.strengths?.length ? html`<div><strong>✅ Kuchli tomonlar</strong><ul class="small">${ai.strengths.map((s) => html`<li>${s}</li>`)}</ul></div>` : ''}
      ${ai.improvements?.length ? html`<div><strong>📈 Yaxshilash uchun</strong><ul class="small">${ai.improvements.map((s) => html`<li>${s}</li>`)}</ul></div>` : ''}
    </div></div>`;
}

// ---------------- Slaydlar ----------------
function slides(el, { act, submit }) {
  const list = act.content.slides || [];
  let i = 0;
  let completed = !!act.result;
  const draw = () => {
    const s = list[i] || { title: 'Slayd yo\'q', body: '' };
    setHTML(el, html`${header(act)}
      <div class="slides" id="slides">
        <div class="slide">${s.title ? html`<h2>${s.title}</h2>` : ''}<div class="prose">${md(s.body)}</div>${s.image ? html`<img src="${s.image}" alt="" style="max-height:45%;object-fit:contain;margin-top:10px">` : ''}</div>
        <div class="slide-nav">
          <button class="btn" data-nav="-1" ${i === 0 ? 'disabled' : ''}>← Oldingi</button>
          <div class="slide-dots">${list.map((_, k) => html`<span class="${k === i ? 'on' : ''}" data-go="${k}"></span>`)}</div>
          <div class="row"><span class="small muted">${i + 1} / ${list.length}</span>
          <button class="btn ghost icon-btn" data-full title="To'liq ekran">⛶</button>
          <button class="btn primary" data-nav="1" ${i >= list.length - 1 ? 'disabled' : ''}>Keyingi →</button></div>
        </div>
      </div>
      ${isTeacher() && s.notes ? html`<div class="alert warning small" style="margin-top:12px"><strong>🗒 O'qituvchi izohi:</strong> ${s.notes}</div>` : ''}
      ${i === list.length - 1 && !completed ? html`<div class="center" style="margin-top:16px"><button class="btn success lg" data-done>✓ Taqdimotni yakunladim</button></div>` : ''}
      ${completed ? html`<div class="center small muted" style="margin-top:10px">✅ Ko'rib chiqilgan</div>` : ''}`);
  };
  draw();
  on(el, 'click', '[data-nav]', (e, b) => { i = Math.max(0, Math.min(list.length - 1, i + Number(b.dataset.nav))); draw(); });
  on(el, 'click', '[data-go]', (e, b) => { i = Number(b.dataset.go); draw(); });
  on(el, 'click', '[data-full]', () => {
    const s = el.querySelector('#slides');
    if (document.fullscreenElement) document.exitFullscreen(); else s.requestFullscreen?.();
  });
  on(el, 'click', '[data-done]', async () => { await submit({ viewed: true }); completed = true; draw(); });
  const key = (e) => {
    if (!el.isConnected) return document.removeEventListener('keydown', key);
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) return;
    if (e.key === 'ArrowRight' && i < list.length - 1) { i++; draw(); }
    if (e.key === 'ArrowLeft' && i > 0) { i--; draw(); }
  };
  document.addEventListener('keydown', key);
}

// ---------------- O'quv materiali ----------------
function reading(el, { act, submit }) {
  const c = act.content;
  const draw = () => setHTML(el, html`${header(act)}
    ${c.video_url ? videoEmbed(c.video_url) : ''}
    <div class="prose">${md(c.body || '')}</div>
    ${c.links?.length ? html`<h4>🔗 Foydali havolalar</h4><ul>${c.links.map((l) => html`<li><a href="${l.url || l}" target="_blank" rel="noopener">${l.title || l.url || l}</a></li>`)}</ul>` : ''}
    <div class="center" style="margin-top:16px">${act.result ? html`<span class="badge success">✅ O'qilgan</span>` : html`<button class="btn success lg" data-done>✓ O'qib chiqdim</button>`}</div>`);
  draw();
  on(el, 'click', '[data-done]', async () => { await submit({ viewed: true }); draw(); });
}

// ---------------- Test ----------------
function quiz(el, { act, submit }) {
  const c = act.content;
  const qs = c.questions || [];
  let timer = null;
  const stopTimer = () => { if (timer) clearInterval(timer); timer = null; };

  const start = () => {
    const order = c.shuffle ? shuffle(qs) : qs;
    const answers = {};
    setHTML(el, html`${header(act)}
      <div class="row between" style="margin-bottom:12px"><span class="muted small">${qs.length} ta savol · ${attemptsInfo(act)}</span>
        ${c.time_limit_min ? html`<span class="badge warning">⏱ <span class="timer" id="timer"></span></span>` : ''}</div>
      <form id="quiz-form">${order.map((q, n) => html`<div class="question" data-q="${q.i}">
        <div class="q-text">${n + 1}. ${md(q.text)}</div>
        ${q.image ? html`<img src="${q.image}" alt="" style="max-height:240px;margin-bottom:10px">` : ''}
        ${questionInput(q)}</div>`)}
        <div class="row between"><span class="small muted" id="answered">0 / ${qs.length} javob berildi</span><button class="btn primary lg" type="submit">Testni yakunlash</button></div>
      </form>`);
    const form = el.querySelector('#quiz-form');
    const collect = () => {
      for (const q of qs) {
        const box = form.querySelector(`[data-q="${q.i}"]`);
        if (q.type === 'multiple') answers[q.i] = [...box.querySelectorAll('input:checked')].map((x) => Number(x.value));
        else if (q.type === 'single' || q.type === 'truefalse') { const x = box.querySelector('input:checked'); answers[q.i] = x ? x.value : undefined; }
        else answers[q.i] = box.querySelector('input').value;
      }
      const n = Object.values(answers).filter((v) => v !== undefined && v !== '' && !(Array.isArray(v) && !v.length)).length;
      form.querySelector('#answered').textContent = `${n} / ${qs.length} javob berildi`;
      return n;
    };
    form.addEventListener('change', collect);
    form.addEventListener('input', collect);
    const finish = async (auto = false) => {
      const n = collect();
      if (!auto && n < qs.length && !(await confirmDialog(`${qs.length - n} ta savolga javob berilmagan. Yakunlaysizmi?`, { danger: false, ok: 'Yakunlash' }))) return;
      stopTimer();
      form.querySelector('button[type=submit]').disabled = true;
      try {
        const r = await submit({ answers });
        showResult(order, answers, r);
      } catch (e) {
        toast(e.message, 'error');
        form.querySelector('button[type=submit]').disabled = false;
      }
    };
    form.addEventListener('submit', (e) => { e.preventDefault(); finish(); });
    if (c.time_limit_min) {
      let left = c.time_limit_min * 60;
      const tick = () => {
        const t = el.querySelector('#timer');
        if (!t || !el.isConnected) return stopTimer();
        t.textContent = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`;
        if (left-- <= 0) { stopTimer(); toast('Vaqt tugadi!', 'error'); finish(true); }
      };
      tick();
      timer = setInterval(tick, 1000);
    }
  };

  const showResult = (order, answers, r) => {
    const res = r.details?.results || [];
    setHTML(el, html`${scoreBlock(r, html`<div class="small muted">${r.details?.ok ?? 0} / ${r.details?.total ?? qs.length} to'g'ri</div>`)}
      <h3 style="margin-top:20px">Javoblar tahlili</h3>
      ${order.map((q, n) => {
        const rr = res[q.i] || {};
        const given = answers[q.i];
        return html`<div class="question ${rr.correct ? 'correct' : 'wrong'}">
          <div class="q-text">${rr.correct ? '✅' : rr.partial ? '🟡' : '❌'} ${n + 1}. ${md(q.text)}</div>
          ${reviewAnswer(q, given, rr)}
          ${rr.explanation ? html`<div class="explain">💡 ${md(rr.explanation)}</div>` : ''}</div>`;
      })}
      <div class="center" style="margin-top:12px">${!act.attempts || (act.result?.attempts || 0) < act.attempts ? html`<button class="btn primary" data-retry>🔁 Qayta topshirish</button>` : html`<span class="muted">Urinishlar tugadi</span>`}</div>`);
  };

  const intro = () => setHTML(el, html`${header(act)}<div class="card center" style="box-shadow:none">
    <div style="font-size:3rem">📝</div><h2>${act.title}</h2>
    <p class="muted">${qs.length} ta savol${c.time_limit_min ? ` · ${c.time_limit_min} daqiqa` : ''} · maks. ${act.max_points} ball</p>
    ${act.result ? html`<p>Eng yaxshi natijangiz: <strong>${act.result.best} / ${act.result.max}</strong></p>` : ''}
    <p class="small muted">${attemptsInfo(act)}</p>
    ${act.attempts && (act.result?.attempts || 0) >= act.attempts ? html`<span class="badge">Urinishlar tugagan</span>` : html`<button class="btn primary lg" data-start>${act.result ? 'Qayta boshlash' : 'Testni boshlash'}</button>`}
  </div>`);
  intro();
  on(el, 'click', '[data-start], [data-retry]', start);
}

function questionInput(q) {
  const name = `q${q.i}`;
  switch (q.type) {
    case 'single':
      return html`${q.options.map((o, k) => html`<label class="option"><input type="radio" name="${name}" value="${k}"> <span>${md(o)}</span></label>`)}`;
    case 'multiple':
      return html`<div class="small muted" style="margin-bottom:6px">Bir nechta to'g'ri javob bo'lishi mumkin</div>${q.options.map((o, k) => html`<label class="option"><input type="checkbox" name="${name}" value="${k}"> <span>${md(o)}</span></label>`)}`;
    case 'truefalse':
      return html`<label class="option"><input type="radio" name="${name}" value="true"> To'g'ri</label><label class="option"><input type="radio" name="${name}" value="false"> Noto'g'ri</label>`;
    case 'numeric':
      return html`<input type="text" inputmode="decimal" name="${name}" placeholder="Sonli javob" style="max-width:240px">`;
    default:
      return html`<input type="text" name="${name}" placeholder="Javobingiz" style="max-width:420px">`;
  }
}

function reviewAnswer(q, given, rr) {
  const show = rr.answer !== undefined;
  if (q.type === 'single' || q.type === 'multiple') {
    const correct = show ? new Set([].concat(rr.answer).map(Number)) : new Set();
    const sel = new Set([].concat(given ?? []).map(Number));
    return html`${q.options.map((o, k) => html`<div class="option ${correct.has(k) ? 'correct' : sel.has(k) ? 'wrong' : ''}">${sel.has(k) ? '☑' : '☐'} ${md(o)}</div>`)}`;
  }
  if (q.type === 'truefalse') {
    const label = (v) => (String(v) === 'true' ? "To'g'ri" : String(v) === 'false' ? "Noto'g'ri" : '—');
    return html`<div class="small">Sizning javobingiz: <strong>${label(given)}</strong>${show ? html` · To'g'ri javob: <strong>${label(rr.answer)}</strong>` : ''}</div>`;
  }
  return html`<div class="small">Sizning javobingiz: <strong>${given || '—'}</strong>${show ? html` · To'g'ri javob: <strong>${[].concat(rr.answer).join(' / ')}</strong>` : ''}</div>`;
}

// ---------------- Kartochkalar ----------------
function flashcards(el, { act, submit }) {
  const cards = act.content.cards || [];
  let i = 0;
  let seen = new Set([0]);
  const draw = () => {
    const c = cards[i] || { front: '—', back: '—' };
    setHTML(el, html`${header(act)}
      <div class="flashcard" id="fc"><div class="inner"><div class="face front"><div>${md(c.front)}</div></div><div class="face back"><div class="prose">${md(c.back)}</div></div></div></div>
      <p class="center small muted" style="margin-top:8px">Kartochkani aylantirish uchun bosing (yoki Bo'sh joy tugmasi)</p>
      <div class="row" style="justify-content:center">
        <button class="btn" data-nav="-1" ${i === 0 ? 'disabled' : ''}>←</button>
        <span class="muted">${i + 1} / ${cards.length}</span>
        <button class="btn" data-nav="1" ${i >= cards.length - 1 ? 'disabled' : ''}>→</button>
        <button class="btn ghost" data-shuffle title="Aralashtirish">🔀</button>
      </div>
      <div class="center" style="margin-top:16px">
        ${act.result ? html`<span class="badge success">✅ Ko'rib chiqilgan</span>` : seen.size >= cards.length ? html`<button class="btn success" data-done>✓ Barchasini ko'rib chiqdim</button>` : html`<span class="small muted">Ko'rilgan: ${seen.size}/${cards.length}</span>`}
        <a class="btn ghost" href="#/review">🃏 Intervalli takrorlash</a>
      </div>`);
    el.querySelector('#fc').addEventListener('click', (e) => e.currentTarget.classList.toggle('flipped'));
  };
  draw();
  on(el, 'click', '[data-nav]', (e, b) => { i = Math.max(0, Math.min(cards.length - 1, i + Number(b.dataset.nav))); seen.add(i); draw(); });
  on(el, 'click', '[data-shuffle]', () => { const s = shuffle(cards); cards.splice(0, cards.length, ...s); i = 0; seen = new Set([0]); draw(); });
  on(el, 'click', '[data-done]', async () => { await submit({ viewed: true }); draw(); });
  const key = (e) => {
    if (!el.isConnected) return document.removeEventListener('keydown', key);
    if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;
    if (e.code === 'Space') { e.preventDefault(); el.querySelector('#fc')?.classList.toggle('flipped'); }
    if (e.key === 'ArrowRight' && i < cards.length - 1) { i++; seen.add(i); draw(); }
    if (e.key === 'ArrowLeft' && i > 0) { i--; draw(); }
  };
  document.addEventListener('keydown', key);
}

// ---------------- Moslashtirish ----------------
function matching(el, { act, submit }) {
  const { lefts = [], rights = [] } = act.content;
  const draw = (result = null, given = []) => {
    const res = result?.details?.results || [];
    const correct = result?.details?.correct || [];
    setHTML(el, html`${header(act)}
      <p class="muted small">Har bir tushunchaga mos javobni tanlang. ${attemptsInfo(act)}</p>
      <form id="mf">${lefts.map((l, k) => html`<div class="match-row ${result ? (res[k] ? 'correct' : 'wrong') : ''}">
        <div class="left">${md(l)}</div><div class="center muted">→</div>
        <div><select name="m${k}" ${result ? 'disabled' : ''}><option value="">— tanlang —</option>${rights.map((r) => html`<option ${given[k] === r ? 'selected' : ''}>${r}</option>`)}</select>
        ${result && !res[k] && correct[k] ? html`<div class="small" style="color:var(--success);margin-top:3px">✓ ${correct[k]}</div>` : ''}</div></div>`)}
        ${result ? scoreBlock(result) : html`<div class="right" style="margin-top:12px"><button class="btn primary">Tekshirish</button></div>`}
      </form>
      ${result ? html`<div class="center" style="margin-top:12px"><button class="btn" data-retry>🔁 Qayta urinish</button></div>` : ''}`);
    el.querySelector('#mf').addEventListener('submit', async (e) => {
      e.preventDefault();
      const matches = lefts.map((_, k) => e.target.elements[`m${k}`].value);
      try { draw(await submit({ matches }), matches); } catch (err) { toast(err.message, 'error'); }
    });
  };
  draw();
  on(el, 'click', '[data-retry]', () => draw());
}

// ---------------- Ketma-ketlik ----------------
function ordering(el, { act, submit }) {
  const items = act.content.items || [];
  const draw = (result = null, order = items) => {
    const res = result?.details?.results || [];
    setHTML(el, html`${header(act)}
      ${act.content.prompt ? html`<p><strong>${act.content.prompt}</strong></p>` : ''}
      <p class="muted small">Elementlarni sudrab yoki ↑↓ tugmalari bilan to'g'ri tartibga keltiring. ${attemptsInfo(act)}</p>
      <ul class="dnd-list" id="ol">${order.map((it, k) => html`<li class="dnd-item ${result ? (res[k] ? 'correct' : 'wrong') : ''}" draggable="${result ? 'false' : 'true'}" data-v="${it}">
        <span class="handle">⋮⋮</span><span style="flex:1">${it}</span>
        ${result ? (res[k] ? '✅' : html`<span class="small" style="color:var(--success)">→ ${result.details.correct?.[k] || ''}</span>`) : html`<button type="button" class="btn sm ghost" data-move="up">↑</button><button type="button" class="btn sm ghost" data-move="down">↓</button>`}</li>`)}</ul>
      ${result ? html`${scoreBlock(result)}<div class="center" style="margin-top:12px"><button class="btn" data-retry>🔁 Qayta urinish</button></div>` : html`<div class="right"><button class="btn primary" data-check>Tekshirish</button></div>`}`);
    if (!result) sortable(el.querySelector('#ol'));
  };
  draw();
  on(el, 'click', '[data-check]', async () => {
    const order = [...el.querySelectorAll('#ol [data-v]')].map((x) => x.dataset.v);
    try { draw(await submit({ order }), order); } catch (err) { toast(err.message, 'error'); }
  });
  on(el, 'click', '[data-retry]', () => draw(null, shuffle(items)));
}

// ---------------- Bo'sh joylar ----------------
function fillblank(el, { act, submit }) {
  const { text = '', count = 0, word_bank: bank } = act.content;
  const draw = (result = null, given = []) => {
    const res = result?.details?.results || [];
    const correct = result?.details?.correct || [];
    const withInputs = String(md(text)).replace(/\{\{(\d+)\}\}/g, (_, n) => {
      const k = Number(n);
      const cls = result ? (res[k] ? 'correct' : 'wrong') : '';
      const hint = result && !res[k] && correct[k] ? `<small style="color:var(--success)"> (${esc(correct[k])})</small>` : '';
      return `<input type="text" class="blank-input ${cls}" data-b="${k}" value="${esc(given[k] || '')}" ${result ? 'disabled' : ''} autocomplete="off">${hint}`;
    });
    setHTML(el, html`${header(act)}
      ${bank && !result ? html`<div class="word-bank">${bank.map((w) => html`<span class="chip" data-word="${w}">${w}</span>`)}</div><p class="small muted">So'zni bosing — u faol bo'sh joyga qo'yiladi.</p>` : ''}
      <div class="prose" style="font-size:1.05rem;line-height:2.1">${raw(withInputs)}</div>
      <p class="small muted">${count} ta bo'sh joy · ${attemptsInfo(act)}</p>
      ${result ? html`${scoreBlock(result)}<div class="center" style="margin-top:12px"><button class="btn" data-retry>🔁 Qayta urinish</button></div>` : html`<div class="right"><button class="btn primary" data-check>Tekshirish</button></div>`}`);
  };
  let active = null;
  draw();
  el.addEventListener('focusin', (e) => { if (e.target.matches('.blank-input')) active = e.target; });
  on(el, 'click', '[data-word]', (e, chip) => {
    const target = active && el.contains(active) ? active : [...el.querySelectorAll('.blank-input')].find((i) => !i.value);
    if (target) { target.value = chip.dataset.word; const next = [...el.querySelectorAll('.blank-input')].find((i) => !i.value); (next || target).focus(); }
  });
  on(el, 'click', '[data-check]', async () => {
    const blanks = [...el.querySelectorAll('.blank-input')].sort((a, b) => a.dataset.b - b.dataset.b).map((i) => i.value);
    try { draw(await submit({ blanks }), blanks); } catch (err) { toast(err.message, 'error'); }
  });
  on(el, 'click', '[data-retry]', () => draw());
}

// ---------------- Guruhlash ----------------
function classify(el, { act, submit }) {
  const { categories = [], items = [] } = act.content;
  let placement = {};
  let selected = null;
  const draw = (result = null) => {
    const correct = result?.details?.correct || {};
    const unplaced = items.filter((it) => !placement[it]);
    const chip = (it) => {
      const cls = result ? (correct[it] === placement[it] ? 'correct' : 'wrong') : selected === it ? 'sel' : '';
      return html`<span class="chip ${cls}" data-item="${it}" title="${result && correct[it] !== placement[it] ? `To'g'ri: ${correct[it]}` : ''}">${it}</span>`;
    };
    setHTML(el, html`${header(act)}
      <p class="muted small">Elementni tanlang, so'ng tegishli guruhni bosing. ${attemptsInfo(act)}</p>
      ${!result ? html`<div class="word-bank" style="min-height:48px">${unplaced.length ? unplaced.map(chip) : html`<span class="small muted">Barcha elementlar joylashtirildi ✓</span>`}</div>` : ''}
      <div class="buckets">${categories.map((c) => html`<div class="bucket" data-cat="${c}"><h4>${c}</h4><div class="chips">${items.filter((it) => placement[it] === c).map(chip)}</div></div>`)}</div>
      ${result ? html`${scoreBlock(result)}<div class="center" style="margin-top:12px"><button class="btn" data-retry>🔁 Qayta urinish</button></div>`
        : html`<div class="right" style="margin-top:12px"><button class="btn primary" data-check ${unplaced.length ? 'disabled' : ''}>Tekshirish</button></div>`}`);
  };
  draw();
  on(el, 'click', '[data-item]', (e, c) => {
    if (el.querySelector('[data-retry]')) return;
    e.stopPropagation();
    const it = c.dataset.item;
    if (placement[it]) { delete placement[it]; selected = it; } else selected = selected === it ? null : it;
    draw();
  });
  on(el, 'click', '[data-cat]', (e, b) => {
    if (!selected || el.querySelector('[data-retry]')) return;
    placement[selected] = b.dataset.cat;
    selected = null;
    draw();
  });
  on(el, 'click', '[data-check]', async () => {
    try { draw(await submit({ placement })); } catch (err) { toast(err.message, 'error'); }
  });
  on(el, 'click', '[data-retry]', () => { placement = {}; selected = null; draw(); });
}

// ---------------- Ochiq javobli turlar (AI baholaydi) ----------------
async function loadLast(act) {
  if (!act.result || isTeacher()) return null;
  try {
    const { submissions } = await api.get(`/api/activities/${act.id}/submissions`);
    return submissions[0] || null;
  } catch { return null; }
}

function rubricBlock(act) {
  return act.rubric ? html`<details class="small" style="margin:10px 0"><summary style="cursor:pointer;font-weight:600">📋 Baholash mezonlari (maks. ${act.max_points} ball)</summary><div class="prose" style="margin-top:6px">${md(act.rubric)}</div></details>` : '';
}

function lastSubmissionBlock(last) {
  if (!last) return '';
  const ai = last.ai_feedback ? { ...last.ai_feedback, max: last.max_score, score: last.score } : null;
  return html`<div class="alert ${last.status === 'reviewed' ? 'success' : 'info'}">
    <strong>Oxirgi topshirish:</strong> ${timeAgo(last.created_at)} · Ball: <strong>${last.score ?? '—'} / ${last.max_score}</strong>
    ${last.feedback ? html`<div style="margin-top:6px">👩‍🏫 <strong>O'qituvchi izohi:</strong> ${last.feedback}</div>` : ''}</div>
    ${ai ? aiFeedbackBlock(ai, last.status) : ''}`;
}

async function openTask(el, act, submit, { intro, form, collect, restore }) {
  const last = await loadLast(act);
  let showForm = !last;
  const draw = (result = null) => {
    setHTML(el, html`${header(act)}${intro}${rubricBlock(act)}
      ${result ? html`${scoreBlock(result)}${aiFeedbackBlock({ ...result.ai, max: result.max, score: result.score }, result.status)}
        <div class="center" style="margin-top:12px"><button class="btn" data-again>✏️ Javobni yaxshilab qayta topshirish</button></div>`
      : !showForm ? html`${lastSubmissionBlock(last)}<div class="center" style="margin-top:12px"><button class="btn primary" data-again>✏️ Qayta topshirish</button></div>`
      : html`<form id="open-form">${form}<div class="row between" style="margin-top:12px"><span class="small muted">${attemptsInfo(act)} · AI darhol baholaydi va tavsiya beradi</span><button class="btn primary lg" type="submit">📤 Topshirish</button></div></form>`}`);
    const f = el.querySelector('#open-form');
    if (!f) return;
    if (last && restore) restore(f, last.answer || {});
    f.addEventListener('submit', async (e) => {
      e.preventDefault();
      const answer = collect(f);
      const btn = f.querySelector('button[type=submit]');
      btn.disabled = true;
      btn.innerHTML = '<span class="spinner"></span> AI baholamoqda…';
      try { draw(await submit(answer)); } catch (err) { toast(err.message, 'error'); btn.disabled = false; btn.textContent = '📤 Topshirish'; }
    });
  };
  draw();
  on(el, 'click', '[data-again]', () => { showForm = true; draw(); });
}

const wordCount = (s) => String(s || '').trim().split(/\s+/).filter(Boolean).length;

function lab(el, { act, submit }) {
  const c = act.content;
  openTask(el, act, submit, {
    intro: html`<div class="grid grid-2">
        <div class="card" style="box-shadow:none"><h4>🎯 Ishning maqsadi</h4><p>${c.objective || ''}</p></div>
        <div class="card" style="box-shadow:none"><h4>🧰 Jihozlar va vositalar</h4><ul>${(c.equipment || []).map((e) => html`<li>${e}</li>`)}</ul></div></div>
      ${c.theory ? html`<div class="card prose" style="box-shadow:none;margin-top:12px"><h4>📘 Qisqa nazariya</h4>${md(c.theory)}</div>` : ''}
      ${c.video_url ? videoEmbed(c.video_url) : ''}
      ${c.simulation_url ? html`<div class="video-wrap"><iframe src="${c.simulation_url}" allowfullscreen loading="lazy"></iframe></div><p class="small muted">Virtual laboratoriya / simulyatsiya</p>` : ''}`,
    form: html`<h3 style="margin-top:16px">🔬 Ishni bajarish tartibi</h3>
      ${(c.steps || []).map((s, k) => html`<label class="option" style="align-items:flex-start;cursor:default"><input type="checkbox" name="step" value="${k}" style="margin-top:3px">
        <div><strong>${k + 1}. ${s.title || ''}</strong><div class="prose small">${md(s.body || '')}</div></div></label>`)}
      <div class="field" style="margin-top:12px"><label>📊 Kuzatuvlar, o'lchov natijalari, hisoblashlar</label><textarea name="observations" rows="6" placeholder="Jadval, formulalar, natijalar…"></textarea></div>
      ${(c.questions || []).length ? html`<h3>❓ Nazorat savollari</h3>${c.questions.map((q, k) => html`<div class="field"><label>${k + 1}. ${q}</label><textarea name="q${k}" rows="3"></textarea></div>`)}` : ''}
      <div class="field"><label>🧾 Xulosa</label><textarea name="conclusion" rows="4" required></textarea></div>`,
    collect: (f) => ({
      steps_done: [...f.querySelectorAll('[name=step]:checked')].map((x) => Number(x.value)),
      observations: f.elements.observations.value,
      answers: (c.questions || []).map((_, k) => f.elements[`q${k}`].value),
      conclusion: f.elements.conclusion.value,
    }),
    restore: (f, a) => {
      (a.steps_done || []).forEach((k) => { const x = f.querySelector(`[name=step][value="${k}"]`); if (x) x.checked = true; });
      f.elements.observations.value = a.observations || '';
      (a.answers || []).forEach((v, k) => { if (f.elements[`q${k}`]) f.elements[`q${k}`].value = v; });
      f.elements.conclusion.value = a.conclusion || '';
    },
  });
}

function practical(el, { act, submit }) {
  const c = act.content;
  openTask(el, act, submit, {
    intro: html`<div class="card prose" style="box-shadow:none"><h4>🛠️ Topshiriq</h4>${md(c.task || '')}</div>
      ${(c.hints || []).length ? html`<details style="margin-top:10px"><summary style="cursor:pointer;font-weight:600">💡 Yordamchi ishoralar (${c.hints.length})</summary><ol class="small">${c.hints.map((h) => html`<li>${md(h)}</li>`)}</ol></details>` : ''}`,
    form: html`<div class="field" style="margin-top:14px"><label>Yechim / javobingiz</label><textarea name="text" rows="12" required placeholder="Yechimni batafsil yozing: qadamlar, hisoblashlar, izohlar…"></textarea><div class="hint" id="wc"></div></div>`,
    collect: (f) => ({ text: f.elements.text.value }),
    restore: (f, a) => { f.elements.text.value = a.text || ''; },
  });
  el.addEventListener('input', (e) => { if (e.target.name === 'text') { const w = el.querySelector('#wc'); if (w) w.textContent = `${wordCount(e.target.value)} so'z`; } });
}

function caseStudy(el, { act, submit }) {
  const c = act.content;
  openTask(el, act, submit, {
    intro: html`<div class="card prose" style="box-shadow:none;border-left:4px solid var(--primary)"><h4>💼 Vaziyat</h4>${md(c.scenario || '')}</div>
      ${c.method ? html`<p class="small muted">Tavsiya etilgan metod: <a href="#/methods/${c.method}">${c.method}</a></p>` : ''}`,
    form: html`<h3 style="margin-top:16px">Keys savollari</h3>
      ${(c.questions || []).map((q, k) => html`<div class="field"><label>${k + 1}. ${q}</label><textarea name="q${k}" rows="4" required></textarea></div>`)}
      <div class="field"><label>Umumiy xulosa va tavsiyalar</label><textarea name="conclusion" rows="4"></textarea></div>`,
    collect: (f) => ({ answers: (c.questions || []).map((_, k) => f.elements[`q${k}`].value), conclusion: f.elements.conclusion.value }),
    restore: (f, a) => {
      (a.answers || []).forEach((v, k) => { if (f.elements[`q${k}`]) f.elements[`q${k}`].value = v; });
      f.elements.conclusion.value = a.conclusion || '';
    },
  });
}

function essay(el, { act, submit }) {
  const c = act.content;
  openTask(el, act, submit, {
    intro: html`${c.prompt ? html`<div class="card prose" style="box-shadow:none"><h4>🖋️ Mavzu</h4>${md(c.prompt)}</div>` : ''}`,
    form: html`<div class="field" style="margin-top:14px"><label>Javobingiz ${c.min_words ? html`<span class="muted">(kamida ${c.min_words} so'z)</span>` : ''}</label><textarea name="text" rows="10" required></textarea><div class="hint" id="wc">0 so'z</div></div>`,
    collect: (f) => ({ text: f.elements.text.value }),
    restore: (f, a) => { f.elements.text.value = a.text || ''; },
  });
  el.addEventListener('input', (e) => { if (e.target.name === 'text') { const w = el.querySelector('#wc'); if (w) w.textContent = `${wordCount(e.target.value)} so'z`; } });
}

// ---------------- Interaktiv doska ----------------
function board(el, { act }) {
  const c = act.content;
  const cols = c.columns?.length ? c.columns : ["G'oyalar"];
  let poll = null;
  const load = async () => {
    if (!el.isConnected) { clearInterval(poll); return; }
    const { posts } = await api.get(`/api/activities/${act.id}/posts`);
    const byCol = Object.fromEntries(cols.map((k) => [k, []]));
    for (const p of posts) (byCol[p.column_key] || byCol[cols[0]]).push(p);
    const boardEl = el.querySelector('#board');
    if (!boardEl) return;
    setHTML(boardEl, html`${cols.map((k) => html`<div class="board-col"><h4><span>${k}</span><span class="badge">${byCol[k].length}</span></h4>
      ${byCol[k].map((p) => html`<div class="sticky">${p.content}<div class="meta"><span>${p.author}</span>
        <span><button data-like="${p.id}" title="Yoqdi">${p.liked ? '❤️' : '🤍'} ${p.likes}</button>${p.mine || isTeacher() ? html`<button data-del="${p.id}" title="O'chirish">🗑</button>` : ''}</span></div></div>`)}</div>`)}`);
  };
  setHTML(el, html`${header(act)}
    ${c.prompt ? html`<div class="card" style="box-shadow:none;background:var(--primary-soft);border:0"><div class="small muted">${c.method ? html`Metod: <a href="#/methods/${c.method}">${c.method}</a>` : 'Savol'}</div><div style="font-size:1.15rem;font-weight:700">${c.prompt}</div></div>` : ''}
    <form id="post-form" class="row" style="margin:14px 0;align-items:stretch">
      ${cols.length > 1 ? html`<select name="column_key" style="width:auto">${cols.map((k) => html`<option>${k}</option>`)}</select>` : html`<input type="hidden" name="column_key" value="${cols[0]}">`}
      <input type="text" name="content" placeholder="Fikringizni yozing…" required maxlength="2000" style="flex:1;min-width:200px">
      <button class="btn primary">Qo'shish</button></form>
    <div class="board" id="board"><span class="spinner"></span></div>
    <p class="small muted" style="margin-top:8px">Doska har 10 soniyada avtomatik yangilanadi.${act.result ? ' ✅ Siz ishtirok etdingiz.' : ''}</p>`);
  el.querySelector('#post-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const f = e.target;
    try {
      const r = await api.post(`/api/activities/${act.id}/posts`, { content: f.elements.content.value, column_key: f.elements.column_key.value });
      if (r.xp) { toast(`⭐ +${r.xp} XP`, 'reward'); refreshUser(); }
      if (!act.result && state.user.role === 'student') act.result = { best: act.max_points, max: act.max_points, attempts: 1 };
      f.elements.content.value = '';
      load();
    } catch (err) { toast(err.message, 'error'); }
  });
  on(el, 'click', '[data-like]', async (e, b) => { await api.post(`/api/posts/${b.dataset.like}/like`); load(); });
  on(el, 'click', '[data-del]', async (e, b) => { await api.del(`/api/posts/${b.dataset.del}`); load(); });
  load();
  poll = setInterval(() => { if (document.visibilityState === 'visible') load(); }, 10000);
}
