// Intervalli takrorlash (Anki uslubida, SM-2 algoritmi)
import { api } from '../api.js';
import { html, setHTML, md, toast, confetti } from '../ui.js';
import { refreshUser } from '../app.js';

export async function reviewView(view, ctx) {
  const { cards, stats } = await api.get('/api/srs/due');
  if (!ctx.isCurrent()) return;
  let i = 0;
  let flipped = false;
  let reviewed = 0;
  const draw = () => {
    if (i >= cards.length) {
      setHTML(view, html`<div class="page-head"><div><h1>🃏 Takrorlash</h1></div></div>
        <div class="card empty"><div class="big">🎉</div><h2>${reviewed ? 'Bugungi takrorlash yakunlandi!' : "Hozircha takrorlash uchun kartochkalar yo'q"}</h2>
        <p>${reviewed ? `${reviewed} ta kartochka takrorlandi. Ertaga yana qaytib keling — seriyangizni uzmang! 🔥` : "Darslardagi kartochkalar bo'limlari bu yerda avtomatik paydo bo'ladi."}</p>
        <p class="small muted">Jami: ${stats.total || 0} · O'zlashtirilgan (21+ kun): ${stats.learned}</p>
        <a class="btn primary" href="#/">Bosh sahifaga</a></div>`);
      if (reviewed) { confetti(); refreshUser(); }
      return;
    }
    const c = cards[i];
    setHTML(view, html`<div class="page-head"><div><h1>🃏 Takrorlash</h1><p>Intervalli takrorlash: qiyin kartochkalar tez-tez, osonlari kamroq ko'rsatiladi</p></div>
      <div class="row"><span class="badge primary">${i + 1} / ${cards.length}</span>${c.is_new ? html`<span class="badge warning">Yangi</span>` : ''}</div></div>
      <p class="center small muted">${c.deck}</p>
      <div class="flashcard ${flipped ? 'flipped' : ''}" id="fc"><div class="inner"><div class="face front"><div>${md(c.front)}</div></div><div class="face back"><div class="prose">${md(c.back)}</div></div></div></div>
      ${flipped ? html`<p class="center small muted" style="margin-top:12px">Qanchalik yaxshi esladingiz?</p>
        <div class="srs-buttons">
          <button class="btn danger" data-q="1">😣 Eslolmadim<br><span class="small">1</span></button>
          <button class="btn" data-q="3">🤔 Qiyin<br><span class="small">2</span></button>
          <button class="btn primary" data-q="4">🙂 Yaxshi<br><span class="small">3</span></button>
          <button class="btn success" data-q="5">😎 Oson<br><span class="small">4</span></button></div>`
      : html`<div class="center" style="margin-top:16px"><button class="btn primary lg" id="show">Javobni ko'rsatish (Bo'sh joy)</button></div>`}`);
    view.querySelector('#fc').addEventListener('click', flip);
    view.querySelector('#show')?.addEventListener('click', flip);
    view.querySelectorAll('[data-q]').forEach((b) => b.addEventListener('click', () => rate(Number(b.dataset.q))));
  };
  const flip = () => { flipped = !flipped; draw(); };
  const rate = async (q) => {
    const c = cards[i];
    try {
      await api.post('/api/srs/review', { activity_id: c.activity_id, card_index: c.card_index, quality: q });
      reviewed++;
      if (q < 3) cards.push({ ...c, is_new: false }); // eslay olmagan kartochka sessiya oxirida qayta chiqadi
      i++;
      flipped = false;
      draw();
    } catch (e) { toast(e.message, 'error'); }
  };
  const key = (e) => {
    if (!view.isConnected || !location.hash.startsWith('#/review')) return document.removeEventListener('keydown', key);
    if (e.code === 'Space') { e.preventDefault(); if (!flipped) flip(); }
    if (flipped && ['1', '2', '3', '4'].includes(e.key)) rate([1, 3, 4, 5][Number(e.key) - 1]);
  };
  document.addEventListener('keydown', key);
  draw();
}
