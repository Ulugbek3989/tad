import { api } from '../api.js';
import { html, setHTML, md, toast, modal, formData, confirmDialog, on, fmtDate, timeAgo, scoreClass, ring, celebrate } from '../ui.js';
import { isTeacher, navigate, refreshUser, reload as rerender } from '../app.js';
import { typeIcon, typeName } from '../types.js';

const STATUS = {
  pending: ['warning', 'Tekshirish kutilmoqda'],
  ai_graded: ['info', 'AI baholagan'],
  reviewed: ['success', "O'qituvchi tasdiqlagan"],
  graded: ['success', 'Avtomatik baholangan'],
};
const statusBadge = (s) => html`<span class="badge ${STATUS[s]?.[0] || ''}">${STATUS[s]?.[1] || s}</span>`;

// ======================= Tekshirish navbati =======================
export async function gradingView(view, ctx) {
  const status = ctx.query.status || 'open';
  const { submissions } = await api.get(`/api/review?status=${status}`);
  if (!ctx.isCurrent()) return;
  setHTML(view, html`<div class="page-head"><div><h1>✅ Tekshirish</h1><p>Laboratoriya, amaliy, keys, esse va qo'shimcha topshiriqlar. AI dastlabki bahoni qo'yadi — siz tasdiqlaysiz yoki o'zgartirasiz.</p></div></div>
    <div class="tabs">${[['open', 'Ochiq'], ['pending', 'Kutilmoqda'], ['ai_graded', 'AI baholagan'], ['reviewed', 'Tasdiqlangan']].map(([k, l]) => html`<a href="#/grading?status=${k}" class="${status === k ? 'active' : ''}">${l}</a>`)}</div>
    ${submissions.length ? html`<div class="table-wrap"><table class="table"><thead><tr><th>O'quvchi</th><th>Topshiriq</th><th>Kurs</th><th>Ball</th><th>Holat</th><th>Vaqt</th><th></th></tr></thead><tbody>
      ${submissions.map((s) => html`<tr><td><strong>${s.student}</strong></td>
        <td>${s.assignment_id ? html`📝 ${s.assignment_title}` : html`${typeIcon(s.activity_type)} ${s.activity_title}`}</td>
        <td class="small muted">${s.course_title}</td>
        <td><span class="badge ${scoreClass(s.score, s.max_score)}">${s.score ?? '—'} / ${s.max_score}</span></td>
        <td>${statusBadge(s.status)}</td><td class="small muted nowrap">${timeAgo(s.created_at)}</td>
        <td class="right"><a class="btn sm primary" href="#/submission/${s.id}">Ko'rish</a></td></tr>`)}
      </tbody></table></div>`
    : html`<div class="card empty"><div class="big">🎉</div><p>Tekshirilishi kerak bo'lgan ishlar yo'q.</p></div>`}`);
}

function answerView(sub, act, asg) {
  const a = sub.answer || {};
  const c = act?.content || {};
  if (asg) {
    return html`<div class="prose">${md(a.text || '')}</div>${a.link ? html`<p>🔗 <a href="${a.link}" target="_blank" rel="noopener">${a.link}</a></p>` : ''}`;
  }
  switch (act?.type) {
    case 'lab':
      return html`<p><strong>Bajarilgan bosqichlar:</strong> ${(a.steps_done || []).length} / ${(c.steps || []).length}</p>
        ${a.observations ? html`<h4>Kuzatuvlar</h4><div class="prose">${md(a.observations)}</div>` : ''}
        ${(c.questions || []).map((q, i) => html`<h4>${i + 1}. ${q}</h4><div class="prose">${md((a.answers || [])[i] || '—')}</div>`)}
        <h4>Xulosa</h4><div class="prose">${md(a.conclusion || '—')}</div>`;
    case 'case':
      return html`${(c.questions || []).map((q, i) => html`<h4>${i + 1}. ${q}</h4><div class="prose">${md((a.answers || [])[i] || '—')}</div>`)}
        ${a.conclusion ? html`<h4>Xulosa</h4><div class="prose">${md(a.conclusion)}</div>` : ''}`;
    case 'practical':
    case 'essay':
      return html`<div class="prose">${md(a.text || '—')}</div>`;
    default:
      return html`<pre class="small">${JSON.stringify(a, null, 2)}</pre>`;
  }
}

export async function submissionView(view, ctx) {
  const { submission: s, activity: act, assignment: asg, student } = await api.get(`/api/submissions/${ctx.params.id}`);
  if (!ctx.isCurrent()) return;
  const t = isTeacher();
  const ai = s.ai_feedback;
  const title = asg ? asg.title : act?.title;
  const ref = act?.content?.reference_answer;
  setHTML(view, html`<div class="small muted"><a href="javascript:history.back()">← Orqaga</a></div>
    <div class="page-head"><div><h1>${asg ? '📝' : typeIcon(act?.type)} ${title}</h1><p>${student.name} · ${fmtDate(s.created_at, true)} · ${asg ? "Qo'shimcha topshiriq" : typeName(act?.type)}</p></div>${statusBadge(s.status)}</div>
    <div class="grid dash-split">
      <div class="stack">
        <div class="card"><h3>O'quvchi javobi</h3>${s.details && !ai ? html`<p>Avtomatik tekshiruv: ${s.details.ok ?? ''} / ${s.details.total ?? ''} to'g'ri</p>` : ''}${answerView(s, act, asg)}</div>
        ${t && ref ? html`<details class="card"><summary style="cursor:pointer;font-weight:700">📗 Namunaviy javob</summary><div class="prose" style="margin-top:10px">${md(ref)}</div></details>` : ''}
        ${t && (act?.rubric || asg?.rubric) ? html`<div class="card"><h4>📋 Baholash mezonlari</h4><div class="prose small">${md(act?.rubric || asg?.rubric)}</div></div>` : ''}
      </div>
      <div class="stack">
        <div class="card center">${ring(s.max_score ? ((s.score || 0) / s.max_score) * 100 : 0, `${s.score ?? '—'}/${s.max_score}`)}</div>
        ${ai ? html`<div class="card"><h3>🤖 AI bahosi${ai.provider === 'rule' ? ' (dastlabki)' : ''}</h3><p>${ai.feedback}</p>
          ${ai.criteria?.length ? html`<table class="table small"><tbody>${ai.criteria.map((c) => html`<tr><td>${c.name}</td><td class="nowrap">${c.score}/${c.max}</td></tr>`)}</tbody></table>` : ''}
          ${ai.strengths?.length ? html`<strong class="small">✅ Kuchli tomonlar</strong><ul class="small">${ai.strengths.map((x) => html`<li>${x}</li>`)}</ul>` : ''}
          ${ai.improvements?.length ? html`<strong class="small">📈 Yaxshilash uchun</strong><ul class="small">${ai.improvements.map((x) => html`<li>${x}</li>`)}</ul>` : ''}</div>` : ''}
        ${t ? html`<form class="card" id="grade-form"><h3>👩‍🏫 Yakuniy baho</h3>
            <div class="field"><label>Ball (0 – ${s.max_score})</label><input type="number" name="score" step="0.5" min="0" max="${s.max_score}" value="${s.score ?? ''}" required></div>
            <div class="field"><label>Izoh o'quvchiga</label><textarea name="feedback" rows="5">${s.feedback || ''}</textarea></div>
            <div class="row between"><button type="button" class="btn sm" id="copy-ai" ${ai ? '' : 'disabled'}>AI izohini olish</button><button class="btn primary">✓ Tasdiqlash</button></div></form>`
          : s.feedback ? html`<div class="card"><h3>👩‍🏫 O'qituvchi izohi</h3><p>${s.feedback}</p></div>` : ''}
      </div></div>`);
  if (!t) return;
  const form = view.querySelector('#grade-form');
  view.querySelector('#copy-ai').addEventListener('click', () => {
    form.elements.feedback.value = [ai.feedback, ...(ai.improvements || []).map((x) => `• ${x}`)].filter(Boolean).join('\n');
  });
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      await api.patch(`/api/submissions/${s.id}`, formData(form));
      toast('Baho tasdiqlandi', 'success');
      navigate('/grading');
    } catch (err) { toast(err.message, 'error'); }
  });
}

// ======================= Qo'shimcha topshiriqlar =======================
export async function assignmentsView(view, ctx) {
  const { assignments } = await api.get('/api/assignments');
  if (!ctx.isCurrent()) return;
  const t = isTeacher();
  if (t) {
    setHTML(view, html`<div class="page-head"><div><h1>📝 Qo'shimcha topshiriqlar</h1><p>Guruhga yoki alohida o'quvchilarga individual topshiriqlar (mustaqil ish, loyiha, korreksion mashqlar)</p></div>
      <button class="btn primary" id="new-a">➕ Yangi topshiriq</button></div>
      ${assignments.length ? html`<div class="table-wrap"><table class="table"><thead><tr><th>Topshiriq</th><th>Kimga</th><th>Muddat</th><th>Topshirgan</th><th></th></tr></thead><tbody>
        ${assignments.map((a) => html`<tr><td><a href="#/assignments/${a.id}"><strong>${a.title}</strong></a><div class="small muted">${a.course_title} · ${a.points} ball · ⭐${a.bonus_xp} XP</div></td>
          <td class="small">${a.student_name ? `👤 ${a.student_name}` : a.group_name ? `👥 ${a.group_name}` : 'Butun kurs'}</td>
          <td class="small">${a.due_at ? fmtDate(a.due_at, true) : '—'}</td><td>${a.submitted}</td>
          <td class="right"><button class="btn sm danger" data-del="${a.id}">🗑</button></td></tr>`)}</tbody></table></div>`
      : html`<div class="card empty"><div class="big">📝</div><p>Topshiriqlar yo'q</p></div>`}`);
    view.querySelector('#new-a').addEventListener('click', () => assignmentDialog({}));
    on(view, 'click', '[data-del]', async (e, b) => {
      if (!(await confirmDialog("Topshiriq va unga berilgan javoblar o'chiriladi."))) return;
      await api.del(`/api/assignments/${b.dataset.del}`);
      rerender();
    });
    return;
  }
  const now = new Date().toISOString();
  setHTML(view, html`<div class="page-head"><div><h1>📝 Qo'shimcha topshiriqlar</h1><p>O'qituvchingiz bergan topshiriqlar — bajarib, bonus XP oling!</p></div></div>
    ${assignments.length ? html`<div class="grid grid-auto">${assignments.map((a) => {
      const overdue = a.due_at && a.due_at < now && a.my_score === null;
      return html`<a class="card method-card" href="#/assignments/${a.id}">
        <div class="row between"><strong>${a.title}</strong>${a.my_score !== null ? html`<span class="badge success">✓ ${a.my_score}/${a.points}</span>` : overdue ? html`<span class="badge danger">Muddati o'tgan</span>` : html`<span class="badge warning">Yangi</span>`}</div>
        <span class="small muted">${a.course_title} · ${a.teacher_name}</span>
        <span class="small">${a.due_at ? `⏰ ${fmtDate(a.due_at, true)}` : 'Muddatsiz'} · ⭐ ${a.bonus_xp} XP</span></a>`;
    })}</div>` : html`<div class="card empty"><div class="big">✨</div><p>Hozircha qo'shimcha topshiriqlar yo'q</p></div>`}`);
}

export async function assignmentDialog({ course_id = null, student_ids = null, group_id = null }) {
  const [{ courses }, { groups }] = await Promise.all([api.get('/api/courses'), api.get('/api/groups')]);
  const editable = courses;
  modal({
    title: "📝 Qo'shimcha topshiriq berish",
    size: 'lg',
    body: html`<form id="asf">
      ${student_ids ? html`<div class="alert info small">${student_ids.length} ta o'quvchiga individual topshiriq</div>` : ''}
      <div class="grid grid-2">
        <div class="field"><label>Kurs</label><select name="course_id" required ${course_id ? 'disabled' : ''}>${editable.map((c) => html`<option value="${c.id}" ${c.id === course_id ? 'selected' : ''}>${c.title}</option>`)}</select></div>
        ${!student_ids ? html`<div class="field"><label>Kimga</label><select name="group_id"><option value="">Kursdagi barcha guruhlar</option>${groups.map((g) => html`<option value="${g.id}" data-course="${g.course_id}" ${g.id === group_id ? 'selected' : ''}>${g.name} (${g.course_title})</option>`)}</select></div>` : html`<div></div>`}
      </div>
      <div class="field"><label>Nomi</label><input type="text" name="title" required placeholder="Masalan: Mavzu bo'yicha mini-loyiha"></div>
      <div class="field"><label>Topshiriq sharti (markdown)</label><textarea name="description" rows="7" required></textarea></div>
      <div class="field"><label>Baholash mezonlari (AI shu asosda baholaydi)</label><textarea name="rubric" rows="3"></textarea></div>
      <div class="grid grid-3"><div class="field"><label>Maks. ball</label><input type="number" name="points" value="10" min="1"></div>
        <div class="field"><label>Bonus XP</label><input type="number" name="bonus_xp" value="50" min="0"></div>
        <div class="field"><label>Muddat</label><input type="datetime-local" name="due_at"></div></div>
      <label class="row" style="font-weight:500"><input type="checkbox" name="ai_grading" checked> AI yordamida darhol baholash va fikr-mulohaza berish</label>
    </form>`,
    footer: html`<button class="btn" data-close>Bekor qilish</button><button class="btn primary" form="asf">📤 Yuborish</button>`,
    onMount: (el, close) => {
      el.querySelector('#asf').addEventListener('submit', async (e) => {
        e.preventDefault();
        const d = formData(e.target);
        try {
          await api.post('/api/assignments', {
            ...d,
            course_id: course_id || Number(d.course_id),
            group_id: d.group_id ? Number(d.group_id) : null,
            student_ids,
            due_at: d.due_at ? new Date(d.due_at).toISOString() : null,
          });
          close();
          toast('Topshiriq yuborildi', 'success');
          if (location.hash.startsWith('#/assignments')) navigate(`/assignments?t=${Date.now()}`);
        } catch (err) { toast(err.message, 'error'); }
      });
    },
  });
}

export async function assignmentView(view, ctx) {
  const { assignment: a, submissions } = await api.get(`/api/assignments/${ctx.params.id}`);
  if (!ctx.isCurrent()) return;
  const t = isTeacher();
  const draw = () => setHTML(view, html`<div class="small muted"><a href="#/assignments">← Topshiriqlar</a></div>
    <div class="page-head"><div><h1>📝 ${a.title}</h1><p>${a.course_title} · ${a.teacher_name} · ${a.points} ball · ⭐ ${a.bonus_xp} XP${a.due_at ? ` · ⏰ ${fmtDate(a.due_at, true)}` : ''}</p></div></div>
    <div class="grid dash-split">
      <div class="stack">
        <div class="card prose">${md(a.description || '')}</div>
        ${a.rubric ? html`<div class="card"><h4>📋 Baholash mezonlari</h4><div class="prose small">${md(a.rubric)}</div></div>` : ''}
        ${!t ? html`<form class="card" id="as-sub"><h3>Javobingiz</h3>
          <div class="field"><textarea name="text" rows="10" required placeholder="Javob, yechim yoki loyiha tavsifi…"></textarea></div>
          <div class="field"><label>Havola (ixtiyoriy: Google Drive, GitHub, video…)</label><input type="url" name="link"></div>
          <div class="right"><button class="btn primary lg">📤 Topshirish</button></div></form>` : ''}
      </div>
      <div class="stack">
        <div class="card"><h3>${t ? `Topshirilgan javoblar (${submissions.length})` : 'Mening topshirishlarim'}</h3>
          ${submissions.length ? submissions.map((s) => html`<div style="padding:10px 0;border-bottom:1px solid var(--border)">
            <div class="row between">${t ? html`<strong>${s.student}</strong>` : html`<span class="small muted">${timeAgo(s.created_at)}</span>`}<span class="badge ${scoreClass(s.score, s.max_score)}">${s.score ?? '—'} / ${s.max_score}</span></div>
            <div class="row between" style="margin-top:4px">${statusBadge(s.status)}${t ? html`<a class="btn sm" href="#/submission/${s.id}">Tekshirish</a>` : ''}</div>
            ${!t && s.ai_feedback ? html`<p class="small" style="margin-top:6px">🤖 ${s.ai_feedback.feedback}</p>${s.ai_feedback.improvements?.length ? html`<ul class="small">${s.ai_feedback.improvements.map((x) => html`<li>${x}</li>`)}</ul>` : ''}` : ''}
            ${!t && s.feedback ? html`<p class="small">👩‍🏫 ${s.feedback}</p>` : ''}</div>`)
          : html`<p class="muted small">Hali topshirilmagan</p>`}</div>
      </div></div>`);
  draw();
  if (t) return;
  view.querySelector('#as-sub').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Baholanmoqda…';
    try {
      const { result } = await api.post(`/api/assignments/${a.id}/submit`, formData(e.target));
      celebrate(result);
      refreshUser();
      toast(result.score !== null ? `Natija: ${result.score} / ${result.max}` : "Topshirildi! O'qituvchi tekshiradi.", 'success');
      rerender();
    } catch (err) { toast(err.message, 'error'); btn.disabled = false; btn.textContent = '📤 Topshirish'; }
  });
}
