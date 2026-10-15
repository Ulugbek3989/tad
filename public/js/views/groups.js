import { api } from '../api.js';
import { html, setHTML, toast, modal, formData, confirmDialog, on, avatar, progressBar, scoreClass, md } from '../ui.js';
import { isTeacher, navigate, reload as rerender } from '../app.js';
import { typeIcon } from '../types.js';
import { newGroupDialog } from './courses.js';
import { assignmentDialog } from './teaching.js';
import { loadRecommendations } from './dashboard.js';

export async function groupsView(view, ctx) {
  const [{ groups }, { courses }] = await Promise.all([api.get('/api/groups'), api.get('/api/courses')]);
  if (!ctx.isCurrent()) return;
  const t = isTeacher();
  setHTML(view, html`<div class="page-head"><div><h1>${t ? 'Guruhlar va jurnal' : 'Guruhlarim'}</h1><p>${t ? "O'quvchilar, baholar jurnali, analitika va reyting" : ''}</p></div>
    ${t ? html`<button class="btn primary" id="new-g">➕ Guruh yaratish</button>` : ''}</div>
    ${groups.length ? html`<div class="grid grid-auto">${groups.map((g) => html`<a class="card method-card" href="#/groups/${g.id}">
      <div class="row between"><strong style="font-size:1.1rem">👥 ${g.name}</strong>${t ? html`<code>${g.join_code}</code>` : ''}</div>
      <span class="small muted">${g.course_title}</span>
      <span class="small">${t ? `${g.members} o'quvchi · ${g.teacher_name}` : `O'qituvchi: ${g.teacher_name}`}</span></a>`)}</div>`
      : html`<div class="card empty"><div class="big">👥</div><p>Guruhlar yo'q.</p></div>`}`);
  view.querySelector('#new-g')?.addEventListener('click', () => {
    if (!courses.length) return toast('Avval kurs yarating', 'error');
    newGroupDialog(null, courses);
  });
}

export async function groupView(view, ctx) {
  const id = ctx.params.id;
  const t = isTeacher();
  const tab = ctx.query.tab || (t ? 'gradebook' : 'leaderboard');
  const { group, members } = await api.get(`/api/groups/${id}`);
  if (!ctx.isCurrent()) return;
  const tabs = t ? [['gradebook', '📒 Jurnal'], ['analytics', '📊 Analitika'], ['members', "👥 O'quvchilar"], ['leaderboard', '🏆 Reyting']] : [['leaderboard', '🏆 Reyting'], ['members', "👥 A'zolar"]];
  setHTML(view, html`<div class="small muted"><a href="#/courses/${group.course_id}">${group.course_title}</a></div>
    <div class="page-head"><div><h1>👥 ${group.name}</h1><p>${members.length} o'quvchi</p></div>
      ${t ? html`<div class="row"><span class="badge primary" style="font-size:1rem;padding:6px 12px">Kod: <strong style="letter-spacing:.12em">${group.join_code}</strong></span>
        <button class="btn sm" id="copy-link">🔗 Taklif havolasi</button><button class="btn sm" id="regen">🔄 Yangi kod</button><button class="btn sm danger" id="del-g">🗑</button></div>` : ''}</div>
    <div class="tabs">${tabs.map(([k, l]) => html`<a href="#/groups/${id}?tab=${k}" class="${tab === k ? 'active' : ''}">${l}</a>`)}</div>
    <div id="gbody"></div>`);
  const body = view.querySelector('#gbody');
  if (t) {
    view.querySelector('#copy-link').addEventListener('click', async () => {
      const link = `${location.origin}/#/register?code=${group.join_code}`;
      try { await navigator.clipboard.writeText(link); toast('Havola nusxalandi', 'success'); } catch { toast(link, 'info', 8000); }
    });
    view.querySelector('#regen').addEventListener('click', async () => {
      if (!(await confirmDialog("Eski kod ishlamay qoladi. Yangi kod yaratilsinmi?", { danger: false }))) return;
      await api.patch(`/api/groups/${id}`, { regenerate_code: true });
      rerender();
    });
    view.querySelector('#del-g').addEventListener('click', async () => {
      if (!(await confirmDialog("Guruhni o'chirasizmi? O'quvchilar akkauntlari va natijalari saqlanadi."))) return;
      await api.del(`/api/groups/${id}`);
      navigate('/groups');
    });
  }
  if (tab === 'gradebook' && t) await gradebookTab(body, group);
  else if (tab === 'analytics' && t) await analyticsTab(body, group);
  else if (tab === 'members') membersTab(body, group, members, t, () => rerender());
  else await leaderboardTab(body, group.id);
}

async function gradebookTab(body, group) {
  const gb = await api.get(`/api/groups/${group.id}/gradebook`);
  if (!gb.rows.length) { setHTML(body, html`<div class="card empty"><div class="big">📒</div><p>Guruhda hali o'quvchilar yo'q. Ularga qo'shilish kodini bering: <code>${group.join_code}</code></p></div>`); return; }
  const g5 = (p) => (p >= 86 ? 5 : p >= 71 ? 4 : p >= 55 ? 3 : 2);
  setHTML(body, html`<div class="row between" style="margin-bottom:12px"><span class="muted small">Har bir katakda — eng yaxshi natija. 🟡 — tekshirish kutilmoqda. Katakni bosing — o'quvchi javobini ko'rasiz.</span>
      <a class="btn" href="/api/groups/${group.id}/gradebook.csv" download>📥 Excel (CSV) yuklab olish</a></div>
    <div class="table-wrap" style="max-height:70vh"><table class="table gradebook"><thead><tr>
      <th style="position:sticky;left:0;z-index:2;min-width:180px">O'quvchi</th>
      ${gb.activities.map((a) => html`<th class="rot" title="${a.lesson_title}: ${a.title}">${typeIcon(a.type)} ${a.title.slice(0, 26)} (${a.max_points})</th>`)}
      ${gb.assignments.map((a) => html`<th class="rot" title="Qo'shimcha: ${a.title}">📝 ${a.title.slice(0, 26)} (${a.points})</th>`)}
      <th>Jami / ${gb.total_max}</th><th>%</th><th>Baho</th><th>Bajarilish</th></tr></thead><tbody>
      ${gb.rows.map((r) => html`<tr><td style="position:sticky;left:0;background:var(--surface);z-index:1"><a href="#/groups/${group.id}?tab=members&s=${r.student.id}" data-student="${r.student.id}"><strong>${r.student.name}</strong></a></td>
        ${r.cells.map((c, i) => html`<td class="cell ${c ? scoreClass(c.best, gb.activities[i].max_points) : ''}" ${c ? html`data-cell="${gb.activities[i].id}:${r.student.id}" style="cursor:pointer"` : ''}>${c ? (gb.activities[i].max_points ? c.best : '✓') : ''}${c?.pending ? ' 🟡' : ''}</td>`)}
        ${r.extra.map((x, i) => html`<td class="cell ${x !== null && x !== undefined ? scoreClass(x, gb.assignments[i].points) : ''}">${x === undefined ? '·' : x ?? ''}</td>`)}
        <td class="cell"><strong>${r.total}</strong></td><td class="cell">${r.percent}%</td><td class="cell"><strong>${g5(r.percent)}</strong></td>
        <td style="min-width:110px">${progressBar(r.progress)}<span class="small muted">${r.progress}%</span></td></tr>`)}
    </tbody></table></div>`);
  on(body, 'click', '[data-cell]', async (e, td) => {
    const [aid, uid] = td.dataset.cell.split(':');
    const { submissions } = await api.get(`/api/activities/${aid}/submissions?user_id=${uid}`);
    const s = submissions[0];
    if (s) navigate(`/submission/${s.id}`);
  });
  on(body, 'click', '[data-student]', (e, a) => { e.preventDefault(); studentDialog(group, Number(a.dataset.student)); });
}

async function analyticsTab(body, group) {
  const a = await api.get(`/api/groups/${group.id}/analytics`);
  const maxDay = Math.max(1, ...a.activity_by_day.map((d) => d.n));
  const distTotal = Object.values(a.distribution).reduce((x, y) => x + y, 0) || 1;
  const color = (p) => (p >= 85 ? 'var(--success)' : p >= 60 ? 'var(--warning)' : 'var(--danger)');
  setHTML(body, html`<div class="grid grid-4">
      <div class="card stat"><div class="ico">🎓</div><div><div class="val">${a.students}</div><div class="lbl">O'quvchilar</div></div></div>
      <div class="card stat"><div class="ico">📈</div><div><div class="val">${a.avg_progress}%</div><div class="lbl">O'rtacha bajarilish</div></div></div>
      <div class="card stat"><div class="ico">🎯</div><div><div class="val">${a.avg_percent}%</div><div class="lbl">O'rtacha o'zlashtirish</div></div></div>
      <a class="card stat" href="#/grading" style="color:inherit;text-decoration:none"><div class="ico">✅</div><div><div class="val">${a.pending_reviews}</div><div class="lbl">Tekshirish kutilmoqda</div></div></a></div>
    <div class="grid grid-2" style="margin-top:16px">
      <div class="card"><h3>📊 Mashg'ulotlar bo'yicha o'rtacha natija</h3>
        ${a.per_activity.filter((x) => x.avg_percent !== null).map((x) => html`<div class="hbar"><span class="lbl" title="${x.title}">${typeIcon(x.type)} ${x.title}</span><span class="track"><span style="width:${x.avg_percent}%;background:${color(x.avg_percent)}"></span></span><span class="v">${x.avg_percent}%</span></div>`)}
        ${!a.per_activity.some((x) => x.avg_percent !== null) ? html`<p class="muted">Hali natijalar yo'q</p>` : ''}</div>
      <div class="stack">
        <div class="card"><h3>⚠️ E'tibor talab qiladigan o'quvchilar</h3>
          ${a.at_risk.length ? html`<table class="table"><tbody>${a.at_risk.map((s) => html`<tr><td><a href="#" data-student="${s.id}">${s.name}</a></td><td class="small">Bajarilish: ${s.progress}%</td><td class="small">Natija: ${s.percent}%</td>
            <td class="right"><button class="btn sm" data-assign="${s.id}">📝 Topshiriq</button></td></tr>`)}</tbody></table>` : html`<p class="muted small">Hammasi yaxshi 👍</p>`}</div>
        <div class="card"><h3>🧮 Baholar taqsimoti</h3>
          ${[5, 4, 3, 2].map((g) => html`<div class="hbar"><span class="lbl" style="width:60px">"${g}"</span><span class="track"><span style="width:${(a.distribution[g] / distTotal) * 100}%;background:${{ 5: 'var(--success)', 4: 'var(--info)', 3: 'var(--warning)', 2: 'var(--danger)' }[g]}"></span></span><span class="v">${a.distribution[g]}</span></div>`)}</div>
        <div class="card"><h3>📅 So'nggi 14 kun faolligi</h3>
          <div class="bars" style="margin-bottom:24px">${a.activity_by_day.map((d) => html`<div class="bar" style="height:${(d.n / maxDay) * 100}%" title="${d.day}: ${d.n}"><span>${d.day.slice(8)}</span></div>`)}</div>
          ${!a.activity_by_day.length ? html`<p class="muted small">Faollik yo'q</p>` : ''}</div>
      </div></div>
    <div class="card" style="margin-top:16px"><div class="card-head"><h3>🤖 AI pedagogik tahlil</h3><button class="btn primary" id="ai-ins">✨ Tahlil qilish</button></div><div id="ins-out" class="muted small">Guruh natijalari asosida AI qaysi mavzularni qaysi metod bilan qayta o'tish kerakligini tavsiya qiladi.</div></div>`);
  on(body, 'click', '[data-student]', (e, el) => { e.preventDefault(); studentDialog(group, Number(el.dataset.student)); });
  on(body, 'click', '[data-assign]', (e, b) => assignmentDialog({ course_id: group.course_id, student_ids: [Number(b.dataset.assign)] }));
  body.querySelector('#ai-ins').addEventListener('click', async (e) => {
    e.target.disabled = true;
    const out = body.querySelector('#ins-out');
    setHTML(out, html`<span class="spinner"></span>`);
    try {
      const stats = { avg_progress: a.avg_progress, avg_percent: a.avg_percent, hardest: a.hardest, at_risk: a.at_risk.length, distribution: a.distribution };
      const { insights } = await api.post('/api/ai/group-insights', { group_id: group.id, stats });
      setHTML(out, html`<div style="color:var(--text)"><p>${insights.summary}</p>
        <div class="grid grid-3"><div><strong>Muammolar</strong><ul>${(insights.problems || []).map((x) => html`<li>${x}</li>`)}</ul></div>
        <div><strong>Harakatlar rejasi</strong><ul>${(insights.actions || []).map((x) => html`<li>${x}</li>`)}</ul></div>
        <div><strong>Tavsiya etilgan metodlar</strong><ul>${(insights.methods || []).map((x) => html`<li>${x}</li>`)}</ul></div></div></div>`);
    } catch (err) { setHTML(out, html`<div class="alert warning">${err.message}</div>`); }
    e.target.disabled = false;
  });
}

function membersTab(body, group, members, t, reload) {
  setHTML(body, html`
    ${t ? html`<div class="card"><form id="add-m" class="row"><input type="text" name="emails" placeholder="O'quvchi email(lar)i: vergul yoki bo'sh joy bilan" style="flex:1;min-width:240px"><button class="btn">➕ Qo'shish</button></form>
      <p class="small muted" style="margin:8px 0 0">O'quvchi avval ro'yxatdan o'tgan bo'lishi kerak. Yoki ularga guruh kodini bering: <code>${group.join_code}</code></p></div>` : ''}
    <div class="card">
      ${t ? html`<div class="row between" style="margin-bottom:10px"><label class="row" style="font-weight:500"><input type="checkbox" id="sel-all"> Barchasini tanlash</label>
        <div class="row"><button class="btn sm" id="reward-sel">🎁 Rag'batlantirish</button><button class="btn sm" id="assign-sel">📝 Qo'shimcha topshiriq</button></div></div>` : ''}
      <table class="table"><thead><tr>${t ? html`<th></th>` : ''}<th>O'quvchi</th><th>Daraja</th><th>XP</th><th>Seriya</th>${t ? html`<th></th>` : ''}</tr></thead><tbody>
      ${members.map((m) => html`<tr>${t ? html`<td><input type="checkbox" data-sel="${m.id}"></td>` : ''}
        <td><div class="row">${avatar(m.name, m.id)}<div><a href="#/users/${m.id}"><strong>${m.name}</strong></a>${m.email ? html`<div class="small muted">${m.email}</div>` : ''}</div></div></td>
        <td>${m.level}</td><td>⭐ ${m.xp}</td><td>🔥 ${m.streak}</td>
        ${t ? html`<td class="right nowrap"><button class="btn sm" data-report="${m.id}">📊</button> <button class="btn sm" data-reward="${m.id}">🎁</button> <button class="btn sm" data-assign="${m.id}">📝</button> <button class="btn sm danger" data-remove="${m.id}">✕</button></td>` : ''}</tr>`)}
      </tbody></table>
      ${!members.length ? html`<p class="muted center">A'zolar yo'q</p>` : ''}</div>`);
  if (!t) return;
  const selected = () => [...body.querySelectorAll('[data-sel]:checked')].map((x) => Number(x.dataset.sel));
  body.querySelector('#add-m').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      const r = await api.post(`/api/groups/${group.id}/members`, { emails: e.target.elements.emails.value });
      toast(`Qo'shildi: ${r.added.length}${r.missing.length ? `. Topilmadi: ${r.missing.join(', ')}` : ''}`, r.missing.length ? 'error' : 'success', 6000);
      reload();
    } catch (err) { toast(err.message, 'error'); }
  });
  body.querySelector('#sel-all').addEventListener('change', (e) => body.querySelectorAll('[data-sel]').forEach((x) => { x.checked = e.target.checked; }));
  body.querySelector('#reward-sel').addEventListener('click', () => { const ids = selected(); if (!ids.length) return toast("O'quvchilarni tanlang", 'error'); rewardDialog(ids, group.course_id); });
  body.querySelector('#assign-sel').addEventListener('click', () => { const ids = selected(); if (!ids.length) return toast("O'quvchilarni tanlang", 'error'); assignmentDialog({ course_id: group.course_id, student_ids: ids }); });
  on(body, 'click', '[data-reward]', (e, b) => rewardDialog([Number(b.dataset.reward)], group.course_id));
  on(body, 'click', '[data-assign]', (e, b) => assignmentDialog({ course_id: group.course_id, student_ids: [Number(b.dataset.assign)] }));
  on(body, 'click', '[data-report]', (e, b) => studentDialog(group, Number(b.dataset.report)));
  on(body, 'click', '[data-remove]', async (e, b) => {
    if (!(await confirmDialog("O'quvchini guruhdan chiqarasizmi?"))) return;
    await api.del(`/api/groups/${group.id}/members/${b.dataset.remove}`);
    reload();
  });
}

export async function rewardDialog(userIds, courseId) {
  const { badges } = await api.get('/api/badges');
  modal({
    title: `🎁 Rag'batlantirish (${userIds.length} o'quvchi)`,
    body: html`<form id="rf">
      <div class="field"><label>Bonus XP</label><div class="row">${[10, 25, 50, 100].map((x) => html`<button type="button" class="chip" data-xp="${x}">+${x}</button>`)}<input type="number" name="xp" value="25" style="width:110px"></div>
        <div class="hint">Manfiy qiymat — jarima (masalan, -10).</div></div>
      <div class="field"><label>Nishon (ixtiyoriy)</label><div class="badge-grid">${badges.filter((b) => !b.auto).map((b) => html`<label class="badge-tile" style="cursor:pointer"><input type="radio" name="badge_key" value="${b.key}" style="display:none"><div class="icon">${b.icon}</div><div class="name">${b.name}</div></label>`)}
        <label class="badge-tile" style="cursor:pointer"><input type="radio" name="badge_key" value="" checked style="display:none"><div class="icon">—</div><div class="name">Nishonsiz</div></label></div></div>
      <div class="field"><label>Sabab</label><input type="text" name="reason" placeholder="Masalan: Darsda faol ishtirok uchun" required></div></form>`,
    footer: html`<button class="btn" data-close>Bekor qilish</button><button class="btn primary" form="rf">🎁 Berish</button>`,
    onMount: (el, close) => {
      on(el, 'click', '[data-xp]', (e, b) => { el.querySelector('[name=xp]').value = b.dataset.xp; });
      el.addEventListener('change', (e) => {
        if (e.target.name === 'badge_key') el.querySelectorAll('.badge-tile').forEach((t) => { t.style.borderColor = t.querySelector('input').checked ? 'var(--primary)' : ''; });
      });
      el.querySelector('#rf').addEventListener('submit', async (e) => {
        e.preventDefault();
        const d = formData(e.target);
        try {
          await api.post('/api/rewards', { user_ids: userIds, xp: Number(d.xp) || 0, badge_key: d.badge_key || null, reason: d.reason, course_id: courseId });
          close();
          toast("Rag'batlantirildi! 🎉", 'success');
        } catch (err) { toast(err.message, 'error'); }
      });
    },
  });
}

async function studentDialog(group, studentId) {
  const r = await api.get(`/api/students/${studentId}/report?course_id=${group.course_id}`);
  modal({
    title: `📊 ${r.student.name}`,
    size: 'lg',
    body: html`<div class="grid grid-3"><div class="card stat"><div class="ico">⭐</div><div><div class="val">${r.student.xp}</div><div class="lbl">XP</div></div></div>
      <div class="card stat"><div class="ico">🔥</div><div><div class="val">${r.student.streak}</div><div class="lbl">Seriya</div></div></div>
      <div class="card stat"><div class="ico">🏅</div><div><div class="val">${r.badges.length}</div><div class="lbl">Nishonlar</div></div></div></div>
      <h4 style="margin-top:16px">🤖 AI tavsiyalari</h4><div id="sreco" class="card" style="box-shadow:none"></div>
      <h4 style="margin-top:16px">So'nggi natijalar</h4>
      <div class="table-wrap" style="max-height:300px"><table class="table"><tbody>${r.submissions.map((s) => html`<tr><td>${typeIcon(s.type)} <a href="#/submission/${s.id}" data-close>${s.title}</a><div class="small muted">${s.lesson_title}</div></td><td class="nowrap"><span class="badge ${scoreClass(s.score, s.max_score)}">${s.score ?? '—'} / ${s.max_score}</span></td></tr>`)}</tbody></table></div>`,
    footer: html`<button class="btn" id="sd-reward">🎁 Rag'batlantirish</button><button class="btn" id="sd-assign">📝 Qo'shimcha topshiriq</button><button class="btn primary" data-close>Yopish</button>`,
    onMount: (el) => {
      loadRecommendations(el.querySelector('#sreco'), group.course_id, studentId);
      el.querySelector('#sd-reward').addEventListener('click', () => rewardDialog([studentId], group.course_id));
      el.querySelector('#sd-assign').addEventListener('click', () => assignmentDialog({ course_id: group.course_id, student_ids: [studentId] }));
    },
  });
}

async function leaderboardTab(body, groupId) {
  let period = 'week';
  const draw = async () => {
    const { leaders } = await api.get(`/api/groups/${groupId}/leaderboard?period=${period}`);
    const medal = (r) => ({ 1: '🥇', 2: '🥈', 3: '🥉' }[r] || r);
    setHTML(body, html`<div class="card"><div class="tabs" style="margin-bottom:10px">${[['week', 'Bu hafta'], ['month', 'Bu oy'], ['all', 'Umumiy']].map(([k, l]) => html`<button class="${period === k ? 'active' : ''}" data-period="${k}">${l}</button>`)}</div>
      ${leaders.map((l) => html`<div class="leader-row ${l.me ? 'me' : ''}"><span class="rank">${medal(l.rank)}</span>${avatar(l.name, l.id)}
        <div style="flex:1"><strong>${l.name}</strong>${l.me ? ' (siz)' : ''}<div class="small muted">${l.level}-daraja · 🏅 ${l.badges}</div></div><strong>⭐ ${l.xp} XP</strong></div>`)}
      ${!leaders.length ? html`<p class="muted center">Hali ishtirokchilar yo'q</p>` : ''}</div>`);
  };
  on(body, 'click', '[data-period]', (e, b) => { period = b.dataset.period; draw(); });
  await draw();
}

export async function leaderboardView(view, ctx) {
  const { groups } = await api.get('/api/groups');
  if (!ctx.isCurrent()) return;
  if (!groups.length) { setHTML(view, html`<div class="card empty"><div class="big">🏆</div><p>Reytingni ko'rish uchun guruhga qo'shiling.</p></div>`); return; }
  const gid = Number(ctx.query.g) || groups[0].id;
  setHTML(view, html`<div class="page-head"><div><h1>🏆 Reyting</h1><p>XP — mashg'ulotlar, faollik va o'qituvchi rag'batlari uchun beriladi</p></div>
    ${groups.length > 1 ? html`<select id="gsel" style="width:auto">${groups.map((g) => html`<option value="${g.id}" ${g.id === gid ? 'selected' : ''}>${g.name} — ${g.course_title}</option>`)}</select>` : ''}</div>
    <div id="lb"></div>
    <div class="card" style="margin-top:16px"><h3>💡 Qanday qilib XP to'plash mumkin?</h3><div class="prose small">${md(`- Har bir mashg'ulot va test uchun — natijaga qarab **10–80 XP**
- Natijani yaxshilash uchun qayta topshirish — qo'shimcha XP
- Kunlik faollik — **5–15 XP** (seriya qancha uzun bo'lsa, shuncha ko'p)
- Kartochkalarni takrorlash — har biri **1–2 XP**
- Interaktiv doskadagi fikrlar va ularga "yoqdi" — **2–3 XP**
- Qo'shimcha topshiriqlar — **bonus XP**
- O'qituvchi rag'batlari va nishonlar`)}</div></div>`);
  view.querySelector('#gsel')?.addEventListener('change', (e) => navigate(`/leaderboard?g=${e.target.value}`));
  await leaderboardTab(view.querySelector('#lb'), gid);
}
