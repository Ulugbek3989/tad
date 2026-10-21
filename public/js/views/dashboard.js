import { api } from '../api.js';
import { html, setHTML, md, progressBar, fmtDate, timeAgo, toast, modal, formData, scoreClass } from '../ui.js';
import { navigate } from '../app.js';

const DAY_NAMES = ['Ya', 'Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh'];

export async function dashboardView(view, ctx) {
  const d = await api.get('/api/dashboard');
  if (!ctx.isCurrent()) return;
  if (d.role === 'teacher') return teacherDashboard(view, d);
  return studentDashboard(view, d);
}

function studentDashboard(view, d) {
  const lvl = d.me.level;
  // So'nggi 7 kun XP grafigi
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const dt = new Date(Date.now() - i * 864e5);
    const key = dt.toISOString().slice(0, 10);
    days.push({ key, label: DAY_NAMES[dt.getDay()], xp: d.week.find((w) => w.day === key)?.xp || 0 });
  }
  const maxXp = Math.max(20, ...days.map((x) => x.xp));
  setHTML(view, html`
    <div class="page-head"><div><h1>Salom, ${d.me.name.split(' ')[0]}! 👋</h1><p>Bugun ham bilimingizni bir pog'ona oshiramiz.</p></div>
      <button class="btn" id="join-btn">➕ Guruhga qo'shilish</button></div>

    <div class="grid grid-4">
      <div class="card level-card">
        <div class="small" style="opacity:.85">${lvl.level}-daraja</div>
        <div style="font-size:1.35rem;font-weight:800;margin-bottom:8px">${lvl.title}</div>
        ${progressBar(lvl.progress)}
        <div class="small" style="margin-top:6px;opacity:.9">${d.me.xp} / ${lvl.next_level_xp} XP</div>
      </div>
      <div class="card stat"><div class="ico">🔥</div><div><div class="val">${d.me.streak} kun</div><div class="lbl">Seriya</div></div></div>
      <a class="card stat" href="#/review" style="color:inherit;text-decoration:none"><div class="ico">🃏</div><div><div class="val">${d.due_cards}</div><div class="lbl">Takrorlash kerak</div></div></a>
      <a class="card stat" href="#/leaderboard" style="color:inherit;text-decoration:none"><div class="ico">🏆</div><div><div class="val">${d.rank ? '#' + d.rank.rank : '—'}</div><div class="lbl">${d.rank ? d.rank.group + ' reytingi' : 'Reyting'}</div></div></a>
    </div>

    ${d.resume ? html`<div class="card" style="margin-top:16px;display:flex;align-items:center;gap:16px;flex-wrap:wrap">
      <div style="font-size:2rem">▶️</div>
      <div style="flex:1;min-width:200px"><div class="small muted">Davom ettirish · ${d.resume.course_title}</div>
        <div style="font-weight:700;font-size:1.05rem">${d.resume.lesson_title}</div><div class="muted small">Navbatdagi: ${d.resume.activity_title}</div></div>
      <a class="btn primary lg" href="#/lessons/${d.resume.lesson_id}?a=${d.resume.activity_id}">Davom etish →</a></div>` : ''}

    <div class="grid dash-split" style="margin-top:16px">
      <div class="stack">
        <div class="card">
          <div class="card-head"><h3>📚 Mening fanlarim</h3><a href="#/courses" class="small">Barchasi</a></div>
          ${d.courses.length ? d.courses.map((c) => html`<a href="#/courses/${c.id}" style="display:block;color:inherit;text-decoration:none;padding:10px 0;border-bottom:1px solid var(--border)">
              <div class="row between"><strong>${c.title}</strong><span class="small muted">${c.progress}%</span></div>
              <div style="margin-top:6px">${progressBar(c.progress)}</div></a>`)
            : html`<div class="empty"><div class="big">📭</div><p>Hali birorta fanga yozilmagansiz.<br>O'qituvchingizdan guruh kodini so'rang.</p></div>`}
        </div>
        <div class="grid grid-3">
          <a class="card method-card" href="#/resources"><div style="font-size:1.6rem">🗂️</div><strong>Resurslar</strong><span class="small muted">Lug'at, shablonlar, manbalar, keyslar</span></a>
          <a class="card method-card" href="#/project"><div style="font-size:1.6rem">💼</div><strong>Biznes loyiham</strong><span class="small muted">G'oyadan biznes-rejagacha</span></a>
          <a class="card method-card" href="#/calc"><div style="font-size:1.6rem">🧮</div><strong>Kalkulyatorlar</strong><span class="small muted">Zararsizlik, kredit, soliq, ROI</span></a>
        </div>
        <div class="card" id="reco-card"><div class="card-head"><h3>🤖 Shaxsiy tavsiyalar</h3></div><div id="reco"><span class="spinner"></span></div></div>
      </div>
      <div class="stack">
        <div class="card">
          <h3>📈 Haftalik faollik</h3>
          <div class="bars" style="margin:14px 0 26px">${days.map((x) => html`<div class="bar" style="height:${Math.max(3, (x.xp / maxXp) * 100)}%" title="${x.xp} XP"><span>${x.label}</span></div>`)}</div>
        </div>
        <div class="card">
          <div class="card-head"><h3>📝 Topshiriqlar</h3><a href="#/assignments" class="small">Barchasi</a></div>
          ${d.assignments.length ? d.assignments.map((a) => html`<a href="#/assignments/${a.id}" style="display:block;padding:8px 0;border-bottom:1px solid var(--border);color:inherit;text-decoration:none">
              <div style="font-weight:600">${a.title}</div><div class="small muted">${a.course_title}${a.due_at ? html` · ⏰ ${fmtDate(a.due_at)}` : ''}</div></a>`)
            : html`<p class="muted small">Bajarilmagan topshiriqlar yo'q ✨</p>`}
        </div>
        <div class="card">
          <div class="card-head"><h3>🏅 Nishonlar</h3><a href="#/profile" class="small">Barchasi</a></div>
          ${d.badges.length ? html`<div class="row" style="font-size:1.8rem">${d.badges.map((b) => html`<span title="${b.name}">${b.icon}</span>`)}</div>`
            : html`<p class="muted small">Birinchi mashg'ulotni bajaring va nishon oling!</p>`}
        </div>
        ${d.announcements.length ? html`<div class="card"><h3>📢 E'lonlar</h3>${d.announcements.map((a) => html`<div style="padding:8px 0;border-bottom:1px solid var(--border)"><div style="font-weight:600">${a.title}</div><div class="small muted">${a.course_title} · ${timeAgo(a.created_at)}</div>${a.body ? html`<div class="small prose">${md(a.body)}</div>` : ''}</div>`)}</div>` : ''}
      </div>
    </div>`);
  view.querySelector('#join-btn').addEventListener('click', joinGroupDialog);
  loadRecommendations(view.querySelector('#reco'), d.courses[0]?.id);
}

export function joinGroupDialog() {
  modal({
    title: "Guruhga qo'shilish",
    body: html`<form id="jf"><div class="field"><label>Guruh kodi</label><input type="text" name="code" required style="text-transform:uppercase;font-size:1.3rem;letter-spacing:.2em" maxlength="20"></div></form>`,
    footer: html`<button class="btn" data-close>Bekor qilish</button><button class="btn primary" form="jf">Qo'shilish</button>`,
    onMount: (el, close) => {
      el.querySelector('#jf').addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
          const r = await api.post('/api/groups/join', { code: formData(e.target).code.toUpperCase() });
          close();
          toast(`"${r.course_title}" fani qo'shildi!`, 'success');
          navigate(`/courses/${r.course_id}`);
        } catch (err) { toast(err.message, 'error'); }
      });
    },
  });
}

export async function loadRecommendations(box, courseId, userId = null, refresh = false) {
  if (!box) return;
  if (!courseId) { setHTML(box, html`<p class="muted small">Fanga yozilganingizdan so'ng tavsiyalar paydo bo'ladi.</p>`); return; }
  setHTML(box, html`<span class="spinner"></span> <span class="muted small">Tahlil qilinmoqda…</span>`);
  try {
    const q = new URLSearchParams({ course_id: courseId });
    if (userId) q.set('user_id', userId);
    if (refresh) q.set('refresh', '1');
    const r = await api.get('/api/ai/recommendations?' + q);
    const a = r.advice || {};
    setHTML(box, html`
      <p>${a.summary || ''}</p>
      ${a.focus?.length ? html`<div class="small"><strong>E'tibor bering:</strong> ${a.focus.join(', ')}</div>` : ''}
      ${r.plan.length ? html`<h4 style="margin-top:12px">🎯 Keyingi qadamlar</h4>
        ${r.plan.map((p) => html`<a href="${p.link}" style="display:flex;gap:10px;padding:8px 10px;border-radius:10px;background:var(--surface-2);margin-bottom:6px;color:inherit;text-decoration:none">
          <span>${{ repeat: '🔁', review: '🃏', next: '➡️' }[p.kind] || '•'}</span><span><strong>${p.title}</strong><br><span class="small muted">${p.reason}</span></span></a>`)}` : ''}
      ${a.tips?.length ? html`<h4 style="margin-top:12px">💡 Maslahatlar</h4><ul class="small">${a.tips.map((t) => html`<li>${t}</li>`)}</ul>` : ''}
      ${a.motivation ? html`<div class="alert success small" style="margin:10px 0 0">${a.motivation}</div>` : ''}
      <div class="row between" style="margin-top:10px"><span class="small muted">${a.offline ? 'Qoidaga asoslangan tavsiya' : 'AI tavsiyasi'}</span><button class="btn sm" data-refresh>🔄 Yangilash</button></div>`);
    box.querySelector('[data-refresh]').addEventListener('click', () => loadRecommendations(box, courseId, userId, true));
  } catch (e) {
    setHTML(box, html`<p class="muted small">${e.message}</p>`);
  }
}

function teacherDashboard(view, d) {
  setHTML(view, html`
    <div class="page-head"><div><h1>Xush kelibsiz, ${d.me.name}! 👋</h1><p>O'qituvchi boshqaruv paneli</p></div>
      <div class="row"><a class="btn" href="#/ai">✨ AI studiya</a><a class="btn primary" href="#/courses">📚 Kurslar</a></div></div>
    <div class="grid grid-4">
      <a class="card stat" href="#/courses" style="color:inherit;text-decoration:none"><div class="ico">📚</div><div><div class="val">${d.stats.courses}</div><div class="lbl">Kurslar</div></div></a>
      <a class="card stat" href="#/groups" style="color:inherit;text-decoration:none"><div class="ico">👥</div><div><div class="val">${d.stats.groups}</div><div class="lbl">Guruhlar</div></div></a>
      <div class="card stat"><div class="ico">🎓</div><div><div class="val">${d.stats.students}</div><div class="lbl">O'quvchilar</div></div></div>
      <a class="card stat" href="#/grading" style="color:inherit;text-decoration:none"><div class="ico">✅</div><div><div class="val">${d.stats.pending}</div><div class="lbl">Tekshirish kutilmoqda</div></div></a>
    </div>
    ${!d.courses.length ? html`<div class="alert info" style="margin-top:16px"><strong>Boshlash uchun:</strong> "Kurslar" bo'limida yangi kurs yarating, fan materiallaringizni JSON orqali import qiling yoki namuna kursni yuklang. So'ng guruh yaratib, o'quvchilarga guruh kodini bering.</div>` : ''}
    <div class="grid grid-2" style="margin-top:16px">
      <div class="card">
        <div class="card-head"><h3>👥 Guruhlarim</h3><a href="#/groups" class="small">Barchasi</a></div>
        ${d.groups.length ? html`<table class="table"><tbody>${d.groups.map((g) => html`<tr><td><a href="#/groups/${g.id}"><strong>${g.name}</strong></a><div class="small muted">${g.course_title}</div></td><td><span class="badge">${g.members} o'quvchi</span></td><td class="right"><code>${g.join_code}</code></td></tr>`)}</tbody></table>`
          : html`<p class="muted">Guruhlar yo'q. Kurs sahifasidan guruh yarating.</p>`}
      </div>
      <div class="card">
        <div class="card-head"><h3>🕒 So'nggi topshiriqlar</h3><a href="#/grading" class="small">Tekshirish</a></div>
        ${d.recent.length ? html`<table class="table"><tbody>${d.recent.map((s) => html`<tr>
            <td><strong>${s.student}</strong><div class="small muted">${s.title}</div></td>
            <td class="nowrap"><span class="badge ${scoreClass(s.score, s.max_score)}">${s.score ?? '—'} / ${s.max_score}</span></td>
            <td class="small muted nowrap">${timeAgo(s.created_at)}</td></tr>`)}</tbody></table>`
          : html`<p class="muted">Hali topshiriqlar yo'q.</p>`}
      </div>
    </div>
    <div class="grid grid-3" style="margin-top:16px">
      <a class="card method-card" href="#/methods"><div style="font-size:2rem">🧭</div><strong>Metodlar kutubxonasi</strong><span class="small muted">Aqliy hujum, klaster, keys-stadi, zig-zag va boshqa 25+ metod</span></a>
      <a class="card method-card" href="#/tools"><div style="font-size:2rem">🧰</div><strong>Dars vositalari</strong><span class="small muted">Taymer, tasodifiy o'quvchi, guruhlarga bo'lish</span></a>
      <a class="card method-card" href="#/ai"><div style="font-size:2rem">✨</div><strong>AI studiya</strong><span class="small muted">Test, keys, laboratoriya va dars ishlanmasini AI bilan yaratish</span></a>
    </div>`);
}
