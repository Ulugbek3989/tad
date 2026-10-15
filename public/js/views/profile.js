import { api } from '../api.js';
import { html, setHTML, toast, formData, timeAgo, fmtDate, avatar, progressBar, confirmDialog, on, modal } from '../ui.js';
import { state, refreshUser, navigate, reload as rerender } from '../app.js';

export async function profileView(view, ctx) {
  const uid = ctx.params.id ? Number(ctx.params.id) : state.user.id;
  const [{ user, badges, xp_history }, { badges: catalog }] = await Promise.all([api.get(`/api/users/${uid}/profile`), api.get('/api/badges')]);
  if (!ctx.isCurrent()) return;
  const mine = uid === state.user.id;
  const owned = new Set(badges.map((b) => b.badge_key));
  const lvl = user.level;
  setHTML(view, html`<div class="page-head"><div class="row" style="gap:16px">${avatar(user.name, user.id)}<div><h1>${user.name}</h1><p>${{ admin: 'Administrator', teacher: "O'qituvchi", student: "O'quvchi" }[user.role]} · ${fmtDate(user.created_at)} dan beri</p></div></div></div>
    <div class="grid grid-3">
      <div class="card level-card"><div class="small" style="opacity:.85">${lvl.level}-daraja</div><div style="font-size:1.4rem;font-weight:800;margin-bottom:8px">${lvl.title}</div>${progressBar(lvl.progress)}<div class="small" style="margin-top:6px">${user.xp} / ${lvl.next_level_xp} XP</div></div>
      <div class="card stat"><div class="ico">🔥</div><div><div class="val">${user.streak} kun</div><div class="lbl">Joriy seriya</div></div></div>
      <div class="card stat"><div class="ico">🏅</div><div><div class="val">${badges.length}</div><div class="lbl">Nishonlar</div></div></div></div>
    <div class="grid dash-split" style="margin-top:16px">
      <div class="card"><h3>🏅 Nishonlar</h3>
        <div class="badge-grid">${catalog.map((b) => {
          const got = badges.find((x) => x.badge_key === b.key);
          return html`<div class="badge-tile ${owned.has(b.key) ? '' : 'locked'}" title="${got?.reason || b.desc}"><div class="icon">${b.icon}</div><div class="name">${b.name}</div><div class="small muted">${got ? fmtDate(got.created_at) : b.desc}</div></div>`;
        })}</div></div>
      <div class="stack">
        ${xp_history.length ? html`<div class="card"><h3>⭐ XP tarixi</h3>${xp_history.map((x) => html`<div class="row between small" style="padding:6px 0;border-bottom:1px solid var(--border)"><span>${x.reason}</span><span class="nowrap"><strong style="color:${x.amount > 0 ? 'var(--success)' : 'var(--danger)'}">${x.amount > 0 ? '+' : ''}${x.amount}</strong> <span class="muted">${timeAgo(x.created_at)}</span></span></div>`)}</div>` : ''}
        ${mine ? html`<form class="card" id="pf"><h3>⚙️ Sozlamalar</h3>
          <div class="field"><label>Ism</label><input type="text" name="name" value="${state.user.name}" required></div>
          <div class="field"><label>Email</label><input type="email" value="${state.user.email}" disabled></div>
          <details><summary style="cursor:pointer;font-weight:600;margin-bottom:8px">Parolni o'zgartirish</summary>
            <div class="field"><label>Joriy parol</label><input type="password" name="password" autocomplete="current-password"></div>
            <div class="field"><label>Yangi parol</label><input type="password" name="new_password" minlength="6" autocomplete="new-password"></div></details>
          <div class="right"><button class="btn primary">Saqlash</button></div></form>` : ''}
      </div></div>`);
  view.querySelector('#pf')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const d = formData(e.target);
    if (!d.new_password) { delete d.new_password; delete d.password; }
    try { await api.patch('/api/auth/me', d); toast('Saqlandi', 'success'); refreshUser(); } catch (err) { toast(err.message, 'error'); }
  });
}

export async function notificationsView(view, ctx) {
  const { notifications } = await api.get('/api/notifications');
  if (!ctx.isCurrent()) return;
  setHTML(view, html`<div class="page-head"><div><h1>🔔 Bildirishnomalar</h1></div></div>
    <div class="card">${notifications.length ? notifications.map((n) => html`<a href="${n.link || '#/'}" style="display:flex;gap:12px;padding:12px 6px;border-bottom:1px solid var(--border);color:inherit;text-decoration:none;${n.is_read ? '' : 'background:var(--primary-soft);border-radius:10px'}">
      <div style="flex:1"><strong>${n.title}</strong>${n.body ? html`<div class="small muted">${n.body}</div>` : ''}</div><span class="small muted nowrap">${timeAgo(n.created_at)}</span></a>`)
      : html`<div class="empty"><div class="big">🔕</div><p>Bildirishnomalar yo'q</p></div>`}</div>`);
  if (notifications.some((n) => !n.is_read)) { await api.post('/api/notifications/read'); refreshUser(); }
}

export async function adminView(view, ctx) {
  if (state.user.role !== 'admin') { navigate('/'); return; }
  const [{ users }, ai] = await Promise.all([api.get('/api/admin/users'), api.get('/api/ai/status')]);
  if (!ctx.isCurrent()) return;
  const roleName = { admin: 'Administrator', teacher: "O'qituvchi", student: "O'quvchi" };
  setHTML(view, html`<div class="page-head"><div><h1>⚙️ Administrator</h1><p>Foydalanuvchilar va tizim holati</p></div><button class="btn primary" id="new-u">➕ Foydalanuvchi qo'shish</button></div>
    <div class="grid grid-3">
      <div class="card stat"><div class="ico">👥</div><div><div class="val">${users.length}</div><div class="lbl">Foydalanuvchilar</div></div></div>
      <div class="card stat"><div class="ico">👩‍🏫</div><div><div class="val">${users.filter((u) => u.role !== 'student').length}</div><div class="lbl">O'qituvchi / admin</div></div></div>
      <div class="card stat"><div class="ico">🤖</div><div><div class="val" style="font-size:1rem">${ai.provider === 'claude' ? 'Claude API' : ai.provider === 'workers-ai' ? 'Cloudflare Workers AI' : 'Ulanmagan'}</div><div class="lbl">AI provayder</div></div></div></div>
    ${!ai.provider ? html`<div class="alert warning" style="margin-top:16px">AI ulanmagan: ochiq javoblar qoidaga asoslangan dastlabki baho oladi va o'qituvchi tekshiruviga tushadi. <code>wrangler.jsonc</code> da <code>ai</code> binding yoki <code>ANTHROPIC_API_KEY</code> maxfiy kalitini sozlang.</div>` : ''}
    <div class="card" style="margin-top:16px"><div class="card-head"><h3>Foydalanuvchilar</h3><input type="search" id="uq" placeholder="🔎 Qidirish" style="max-width:240px"></div>
      <div class="table-wrap"><table class="table"><thead><tr><th>Ism</th><th>Email</th><th>Rol</th><th>XP</th><th>Ro'yxatdan o'tgan</th><th></th></tr></thead><tbody id="ub">
      ${users.map((u) => html`<tr data-row="${(u.name + ' ' + u.email).toLowerCase()}"><td><strong>${u.name}</strong></td><td class="small">${u.email}</td>
        <td><select data-role="${u.id}" style="width:auto;padding:4px 8px" ${u.id === state.user.id ? 'disabled' : ''}>${Object.entries(roleName).map(([k, v]) => html`<option value="${k}" ${u.role === k ? 'selected' : ''}>${v}</option>`)}</select></td>
        <td>${u.xp}</td><td class="small muted">${fmtDate(u.created_at)}</td>
        <td class="right nowrap"><button class="btn sm" data-pass="${u.id}">🔑</button> ${u.id !== state.user.id ? html`<button class="btn sm danger" data-del="${u.id}">🗑</button>` : ''}</td></tr>`)}
      </tbody></table></div></div>`);
  view.querySelector('#uq').addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase();
    view.querySelectorAll('[data-row]').forEach((r) => { r.style.display = r.dataset.row.includes(q) ? '' : 'none'; });
  });
  view.addEventListener('change', async (e) => {
    if (!e.target.dataset.role) return;
    try { await api.patch(`/api/admin/users/${e.target.dataset.role}`, { role: e.target.value }); toast('Rol yangilandi', 'success'); } catch (err) { toast(err.message, 'error'); }
  });
  on(view, 'click', '[data-del]', async (e, b) => {
    if (!(await confirmDialog("Foydalanuvchi va uning barcha natijalari o'chiriladi."))) return;
    await api.del(`/api/admin/users/${b.dataset.del}`);
    rerender();
  });
  on(view, 'click', '[data-pass]', (e, b) => modal({
    title: 'Parolni tiklash',
    body: html`<form id="pw"><div class="field"><label>Yangi parol</label><input type="text" name="password" minlength="6" required></div></form>`,
    footer: html`<button class="btn" data-close>Bekor qilish</button><button class="btn primary" form="pw">Saqlash</button>`,
    onMount: (el, close) => el.querySelector('#pw').addEventListener('submit', async (ev) => {
      ev.preventDefault();
      try { await api.patch(`/api/admin/users/${b.dataset.pass}`, formData(ev.target)); close(); toast('Parol yangilandi', 'success'); } catch (err) { toast(err.message, 'error'); }
    }),
  }));
  view.querySelector('#new-u').addEventListener('click', () => modal({
    title: "Foydalanuvchi qo'shish",
    body: html`<form id="nu"><div class="field"><label>Ism</label><input type="text" name="name" required></div>
      <div class="field"><label>Email</label><input type="email" name="email" required></div>
      <div class="field"><label>Parol</label><input type="text" name="password" minlength="6" required></div>
      <div class="field"><label>Rol</label><select name="role">${Object.entries(roleName).map(([k, v]) => html`<option value="${k}" ${k === 'teacher' ? 'selected' : ''}>${v}</option>`)}</select></div></form>`,
    footer: html`<button class="btn" data-close>Bekor qilish</button><button class="btn primary" form="nu">Qo'shish</button>`,
    onMount: (el, close) => el.querySelector('#nu').addEventListener('submit', async (ev) => {
      ev.preventDefault();
      try { await api.post('/api/admin/users', formData(ev.target)); close(); toast("Qo'shildi", 'success'); rerender(); } catch (err) { toast(err.message, 'error'); }
    }),
  }));
}
