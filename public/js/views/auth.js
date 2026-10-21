import { api } from '../api.js';
import { html, setHTML, formData, toast } from '../ui.js';
import { refreshUser, render } from '../app.js';

export function authView(root, { mode, query }) {
  const isReg = mode === 'register';
  setHTML(root, html`<div class="auth-wrap">
    <section class="auth-hero">
      <div style="font-size:3rem">🎓</div>
      <h1 id="hero-title">Fanni chuqur o'zlashtirish platformasi</h1>
      <p style="opacity:.9;font-size:1.05rem">Dunyoning eng yaxshi ta'lim platformalari tajribasi asosida: Coursera'ning tuzilmasi, Khan Academy'ning to'liq o'zlashtirish yondashuvi, Duolingo'ning rag'batlantirish tizimi va Anki'ning intervalli takrorlashi — bitta platformada.</p>
      <ul style="opacity:.95;padding-left:1.2em">
        <li>📊 Taqdimot slaydlari, ma'ruzalar va video darslar</li>
        <li>🧪 Laboratoriya, amaliy mashg'ulotlar va keyslar</li>
        <li>🧩 Interaktiv mashg'ulotlar va testlar</li>
        <li>🤖 Sun'iy intellekt yordamida baholash va shaxsiy tavsiyalar</li>
        <li>🏆 XP, darajalar, nishonlar va reyting</li>
        <li>💼 Biznes loyiha ish maydoni: g'oyadan tayyor biznes-rejagacha</li>
        <li>🧮 Biznes kalkulyatorlari, 🎲 simulyatsiya o'yinlari va AI rol o'yinlari</li>
        <li>🧭 30 ta pedagogik metod va dars vositalari</li>
      </ul>
    </section>
    <section class="auth-form">
      <div class="card">
        <h2>${isReg ? "Ro'yxatdan o'tish" : 'Tizimga kirish'}</h2>
        <form id="auth-form">
          ${isReg ? html`<div class="field"><label>To'liq ism</label><input type="text" name="name" required maxlength="100" autocomplete="name"></div>` : ''}
          <div class="field"><label>Email</label><input type="email" name="email" required autocomplete="email"></div>
          <div class="field"><label>Parol</label><input type="password" name="password" required minlength="6" autocomplete="${isReg ? 'new-password' : 'current-password'}"></div>
          ${isReg ? html`<div class="field"><label>Guruh kodi <span class="muted">(ixtiyoriy)</span></label><input type="text" name="join_code" maxlength="20" value="${query.code || ''}" style="text-transform:uppercase" placeholder="Masalan: AB12CD"><div class="hint">O'qituvchingiz bergan kod bilan darhol guruhga qo'shilasiz.</div></div>
          <details class="field"><summary class="small muted" style="cursor:pointer">Men o'qituvchiman</summary><div style="margin-top:8px"><input type="text" name="teacher_code" placeholder="O'qituvchi taklif kodi"><div class="hint">Kodni administrator beradi. Kodsiz ro'yxatdan o'tsangiz, administrator rolingizni o'zgartirishi mumkin.</div></div></details>` : ''}
          <button class="btn primary block lg" type="submit">${isReg ? "Ro'yxatdan o'tish" : 'Kirish'}</button>
        </form>
        <p class="center muted" style="margin-top:16px">
          ${isReg ? html`Akkauntingiz bormi? <a href="#/login">Kirish</a>` : html`Akkauntingiz yo'qmi? <a href="#/register">Ro'yxatdan o'ting</a>`}
        </p>
      </div>
    </section>
  </div>`);
  api.get('/api/public/info').then((i) => {
    const h = root.querySelector('#hero-title');
    if (i.tagline && h) h.textContent = i.tagline;
  }).catch(() => {});
  const form = root.querySelector('#auth-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type=submit]');
    btn.disabled = true;
    try {
      const data = formData(form);
      if (data.join_code) data.join_code = data.join_code.toUpperCase();
      await api.post(isReg ? '/api/auth/register' : '/api/auth/login', data);
      await refreshUser();
      toast(isReg ? 'Xush kelibsiz! 🎉' : 'Xush kelibsiz!', 'success');
      location.hash = '#/';
      render();
    } catch (err) {
      toast(err.message, 'error');
      btn.disabled = false;
    }
  });
}
