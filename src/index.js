import { Router } from './lib/router.js';
import { json, HttpError } from './lib/http.js';
import { loadUser, requireTeacher } from './lib/auth.js';
import { ensureSchema } from './lib/schema.js';
import authRoutes from './routes/auth.js';
import courseRoutes, { importCourse } from './routes/courses.js';
import learningRoutes from './routes/learning.js';
import groupRoutes from './routes/groups.js';
import teachingRoutes from './routes/teaching.js';
import aiRoutes from './routes/ai.js';
import dashboardRoutes from './routes/dashboard.js';
import projectRoutes from './routes/projects.js';
import { CATALOG, sampleCourse } from './data/catalog.js';

const router = new Router();
// Statik marshrutlar dinamik /api/courses/:id dan oldin turishi kerak
router.get('/api/courses/catalog', async (ctx) => {
  requireTeacher(ctx);
  return json({
    courses: Object.entries(CATALOG).map(([key, c]) => {
      const lessons = c.modules.flatMap((m) => m.lessons);
      return { key, title: c.course.title, code: c.course.code, description: c.course.description, color: c.course.color,
        modules: c.modules.length, lessons: lessons.length, activities: lessons.reduce((n, l) => n + (l.activities || []).length, 0) };
    }),
  });
});
router.post('/api/courses/catalog/:key', async (ctx) => {
  const u = requireTeacher(ctx);
  const data = CATALOG[ctx.params.key];
  if (!data) return json({ error: 'Kurs topilmadi' }, 404);
  return json({ id: await importCourse(ctx.env, data, u.id) }, 201);
});
router.post('/api/courses/sample', async (ctx) => {
  const u = requireTeacher(ctx);
  return json({ id: await importCourse(ctx.env, sampleCourse, u.id) }, 201);
});
router.get('/api/courses/template', async () => json(sampleCourse));
[authRoutes, courseRoutes, learningRoutes, groupRoutes, teachingRoutes, aiRoutes, dashboardRoutes, projectRoutes].forEach((register) => register(router));
router.get('/api/health', async (ctx) => json({ ok: true, app: ctx.env.APP_NAME || 'TAD' }));
router.get('/api/public/info', async (ctx) => json({ app_name: ctx.env.APP_NAME || "TAD Ta'lim platformasi", tagline: ctx.env.APP_TAGLINE || null }));

const MUTATING = new Set(['POST', 'PATCH', 'PUT', 'DELETE']);

async function handleApi(req, env, execCtx) {
  const url = new URL(req.url);
  // CSRF himoyasi: o'zgartiruvchi so'rovlar JSON bo'lishi va boshqa domendan kelmasligi kerak
  if (MUTATING.has(req.method)) {
    const origin = req.headers.get('origin');
    if (origin && new URL(origin).host !== url.host) return json({ error: "Boshqa domendan so'rov taqiqlangan" }, 403);
    const ct = req.headers.get('content-type') || '';
    if (req.method !== 'DELETE' && !ct.includes('application/json')) return json({ error: 'Content-Type: application/json kerak' }, 415);
  }
  await ensureSchema(env);
  const m = router.match(req.method, url.pathname);
  if (!m.handler) return json({ error: m.pathMatched ? 'Usul qo\'llab-quvvatlanmaydi' : 'API topilmadi' }, m.pathMatched ? 405 : 404);
  const ctx = { req, env, url, params: m.params, user: await loadUser(env, req), waitUntil: (p) => execCtx.waitUntil(p) };
  return m.handler(ctx);
}

export default {
  async fetch(req, env, execCtx) {
    const url = new URL(req.url);
    if (url.pathname.startsWith('/api/')) {
      try {
        return await handleApi(req, env, execCtx);
      } catch (e) {
        if (e instanceof HttpError) return json({ error: e.message }, e.status);
        console.error(e);
        return json({ error: 'Serverda kutilmagan xatolik' }, 500);
      }
    }
    return env.ASSETS.fetch(req);
  },
};
