export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...headers },
  });
}

export const fail = (status, message) => { throw new HttpError(status, message); };
export const badRequest = (m) => fail(400, m);
export const notFound = (m = 'Topilmadi') => fail(404, m);
export const forbidden = (m = "Ruxsat yo'q") => fail(403, m);

export async function readJson(req) {
  try {
    return (await req.json()) ?? {};
  } catch {
    throw new HttpError(400, "So'rov tanasi noto'g'ri JSON");
  }
}

export function str(v, { max = 20000, required = false, name = 'maydon' } = {}) {
  if (v === undefined || v === null) {
    if (required) badRequest(`${name} kiritilishi shart`);
    return null;
  }
  const s = String(v).trim();
  if (required && !s) badRequest(`${name} kiritilishi shart`);
  if (s.length > max) badRequest(`${name} juda uzun (maks. ${max})`);
  return s;
}

export function int(v, def = null) {
  if (v === undefined || v === null || v === '') return def;
  const n = Number.parseInt(v, 10);
  return Number.isFinite(n) ? n : def;
}

export function parseJSON(s, def = null) {
  if (s === null || s === undefined || s === '') return def;
  if (typeof s !== 'string') return s;
  try { return JSON.parse(s); } catch { return def; }
}
