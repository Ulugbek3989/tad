import { api } from '../api.js';
import { html, setHTML, md, on } from '../ui.js';
import { typeIcon, typeName, LESSON_KINDS } from '../types.js';
import { renderActivity } from './activities.js';
import { setTutorContext } from './tutor.js';

const short = (t, n = 42) => (t.length > n ? t.slice(0, n - 1) + '…' : t);

let methodsCache = null;
export async function getMethods() {
  if (!methodsCache) methodsCache = await api.get('/api/methods');
  return methodsCache;
}

export async function lessonView(view, ctx) {
  const id = ctx.params.id;
  const data = await api.get(`/api/lessons/${id}`);
  if (!ctx.isCurrent()) return;
  const { lesson, course, activities, prev, next } = data;
  const methods = lesson.methods?.length ? (await getMethods()).methods.filter((m) => lesson.methods.includes(m.key)) : [];
  setTutorContext({ course_id: course.id, lesson_id: lesson.id, title: lesson.title });
  view.className = 'content wide';
  const hasLecture = !!(lesson.content && lesson.content.trim());
  let current = ctx.query.a ? Number(ctx.query.a) : hasLecture ? 'lecture' : activities[0]?.id ?? 'lecture';

  const sideItems = () => html`
    ${hasLecture ? html`<a class="act-link ${current === 'lecture' ? 'active' : ''}" data-act="lecture"><span>📖</span><span>Ma'ruza matni</span></a>` : ''}
    ${activities.map((a) => html`<a class="act-link ${current === a.id ? 'active' : ''}" data-act="${a.id}">
      <span>${typeIcon(a.type)}</span><span style="min-width:0">${a.title}<div class="small muted">${typeName(a.type)}${a.max_points ? ` · ${a.max_points} ball` : ''}</div></span>
      <span class="st">${a.result ? (a.result.max ? html`<span class="badge success">${Math.round((a.result.best / a.result.max) * 100)}%</span>` : '✅') : ''}</span></a>`)}`;

  setHTML(view, html`
    <div class="small muted" style="margin-bottom:6px"><a href="#/courses/${course.id}">${course.title}</a> › ${LESSON_KINDS[lesson.kind] || 'Dars'}</div>
    <div class="page-head" style="margin-bottom:14px"><div><h1>${lesson.title}</h1>${lesson.summary ? html`<p>${lesson.summary}</p>` : ''}</div>
      ${course.can_edit ? html`<a class="btn" href="#/edit/lesson/${lesson.id}">✏️ Darsni tahrirlash</a>` : ''}</div>
    <div class="lesson-layout">
      <aside class="lesson-side">
        <div class="card" style="padding:10px"><div id="side">${sideItems()}</div>
          ${!activities.length && !hasLecture ? html`<p class="muted small" style="padding:10px">Bu darsda hali material yo'q.</p>` : ''}</div>
        ${methods.length ? html`<div class="card" style="padding:14px"><h4 style="margin-bottom:8px">🧭 Darsda qo'llaniladigan metodlar</h4>
          ${methods.map((m) => html`<a href="#/methods/${m.key}" style="display:block;padding:5px 0" class="small">• ${m.name}</a>`)}</div>` : ''}
        <div class="row" style="margin-top:12px">
          ${prev ? html`<a class="btn sm" href="#/lessons/${prev.id}" title="${prev.title}">← Oldingi dars</a>` : ''}
          ${next ? html`<a class="btn sm primary" href="#/lessons/${next.id}" title="${next.title}">Keyingi dars →</a>` : ''}
        </div>
      </aside>
      <section class="card" id="stage" style="min-height:400px"></section>
    </div>`);

  const stage = view.querySelector('#stage');
  const side = view.querySelector('#side');
  const show = () => {
    setHTML(side, sideItems());
    // Har safar yangi konteyner — oldingi hodisa tinglovchilari qolib ketmasligi uchun
    const inner = document.createElement('div');
    stage.replaceChildren(inner);
    if (current === 'lecture') {
      const firstAct = activities[0];
      setHTML(inner, html`<div class="prose">${md(lesson.content)}</div>
        ${firstAct ? html`<hr><div class="row between"><span class="muted">Ma'ruzani o'qib bo'ldingizmi? Endi mashg'ulotlarga o'ting.</span>
          <button class="btn primary" data-act="${firstAct.id}">${typeIcon(firstAct.type)} ${short(firstAct.title)} →</button></div>` : ''}`);
      return;
    }
    const act = activities.find((a) => a.id === current);
    if (!act) { setHTML(inner, html`<p class="muted">Mashg'ulot topilmadi.</p>`); return; }
    const idx = activities.indexOf(act);
    const nextAct = activities[idx + 1];
    const head = document.createElement('div');
    setHTML(head, html`<div class="row between" style="margin-bottom:14px"><div><div class="small muted">${typeIcon(act.type)} ${typeName(act.type)}</div><h2 style="margin:0">${act.title}</h2></div>
      ${act.max_points ? html`<span class="badge primary">Maks. ${act.max_points} ball</span>` : ''}</div>`);
    const body = document.createElement('div');
    const foot = document.createElement('div');
    inner.append(head, body, foot);
    renderActivity(body, act, { onResult: () => setHTML(side, sideItems()) });
    setHTML(foot, html`<hr><div class="row between">
      ${idx > 0 ? html`<button class="btn" data-act="${activities[idx - 1].id}">← ${short(activities[idx - 1].title)}</button>` : hasLecture ? html`<button class="btn" data-act="lecture">← Ma'ruza</button>` : html`<span></span>`}
      ${nextAct ? html`<button class="btn primary" data-act="${nextAct.id}">${short(nextAct.title)} →</button>` : next ? html`<a class="btn primary" href="#/lessons/${next.id}">Keyingi dars: ${short(next.title)} →</a>` : html`<a class="btn success" href="#/courses/${course.id}">🎉 Kursga qaytish</a>`}
    </div>`);
  };
  on(view, 'click', '[data-act]', (e, b) => {
    e.preventDefault();
    current = b.dataset.act === 'lecture' ? 'lecture' : Number(b.dataset.act);
    history.replaceState(null, '', `#/lessons/${lesson.id}${current === 'lecture' ? '' : `?a=${current}`}`);
    show();
    if (innerWidth < 900) stage.scrollIntoView({ behavior: 'smooth' });
    else window.scrollTo({ top: 0, behavior: 'smooth' });
  });
  show();
}
