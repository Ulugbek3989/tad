// "Tadbirkorlik asoslari" taqdimotlarini yaratish: PPTX fayllar + platforma uchun JSON
// Ishlatish: node courses/presentations/build.mjs [mavzu raqamlari, masalan: 1 2 3]
import { createRequire } from 'node:module';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import part1 from './content-1.mjs';
import part2 from './content-2.mjs';
import part3 from './content-3.mjs';

const require = createRequire(import.meta.url);
const pptxgen = require('pptxgenjs');

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..', '..');
const OUT_DIR = join(ROOT, 'public', 'resources', 'taqdimotlar');
mkdirSync(OUT_DIR, { recursive: true });

const COURSE = 'Tadbirkorlik asoslari';
const CODE = 'TDAB 404';
const ORG = "Mirzo Ulug'bek nomidagi O'zbekiston Milliy universitetining Jizzax filiali · \"Iqtisodiyot va turizm\" kafedrasi";

// Mavzu: chuqur zangori-yashil (o'sish, ishonch) + kahrabo (pul, harakat)
const THEME = {
  name: 'Tadbirkorlik asoslari',
  headFontFace: 'Cambria',
  bodyFontFace: 'Calibri',
  colors: {
    dk1: '0F172A', lt1: 'FFFFFF', dk2: '0B3D3A', lt2: 'EAF4F2',
    accent1: '0F766E', accent2: 'D97706', accent3: '14B8A6', accent4: '475569', accent5: 'B91C1C', accent6: '15803D',
    hlink: '0F766E', folHlink: '0B3D3A',
  },
};
const HEX = THEME.colors;

const W = 13.333;
const H = 7.5;
const MX = 0.6; // chap/o'ng chekka
const CW = W - 2 * MX; // kontent kengligi
const TOP = 1.45; // kontent boshlanishi
const BOTTOM = 6.85; // kontent oxiri

function definePres() {
  const pres = new pptxgen();
  pres.layout = 'LAYOUT_WIDE';
  pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
  pres.author = "N.G'. To'ychiyeva";
  pres.company = 'OzMU Jizzax filiali';
  pres.subject = `${COURSE} (${CODE})`;
  const C = pres.SchemeColor;

  pres.defineSlideMaster({
    title: 'TITLE_PH',
    background: { color: HEX.dk2 },
    objects: [
      { text: { text: `${COURSE.toUpperCase()} · ${CODE}`, options: { x: MX, y: 0.55, w: 9, h: 0.4, fontSize: 13, color: 'A7D7D0', bold: true, charSpacing: 3, margin: 0 } } },
      { text: { text: ORG, options: { x: MX, y: 6.7, w: CW, h: 0.4, fontSize: 11, color: 'A7D7D0', margin: 0 } } },
      { placeholder: { options: { name: 'eyebrow', type: 'body', x: MX, y: 1.7, w: 6, h: 0.5, fontSize: 20, color: 'FBBF24', bold: true, margin: 0 }, text: '' } },
      { placeholder: { options: { name: 'title', type: 'title', x: MX, y: 2.25, w: 11.4, h: 2.3, fontSize: 40, color: 'FFFFFF', bold: true, valign: 'top', align: 'left', margin: 0, fontFace: THEME.headFontFace }, text: '' } },
      { placeholder: { options: { name: 'body', type: 'body', x: MX, y: 4.75, w: 11.4, h: 1.4, fontSize: 16, color: 'D7EDEA', valign: 'top', margin: 0 }, text: '' } },
    ],
  });
  pres.defineSlideMaster({
    title: 'CONTENT',
    background: { color: 'FFFFFF' },
    margin: [0.5, 0.6, 0.7, 0.6],
    objects: [
      { text: { text: `${COURSE} · ${CODE}`, options: { x: MX, y: 7.0, w: 8, h: 0.3, fontSize: 10, color: '64748B', margin: 0 } } },
      { placeholder: { options: { name: 'title', type: 'title', x: MX, y: 0.35, w: CW, h: 0.95, fontSize: 30, color: HEX.dk2, bold: true, valign: 'middle', margin: 0, fontFace: THEME.headFontFace }, text: '' } },
    ],
    slideNumber: { x: W - MX - 0.8, y: 7.0, w: 0.8, h: 0.3, fontSize: 10, color: '64748B', align: 'right' },
  });
  pres.defineSlideMaster({
    title: 'DARK',
    background: { color: HEX.dk2 },
    objects: [
      { text: { text: `${COURSE} · ${CODE}`, options: { x: MX, y: 7.0, w: 8, h: 0.3, fontSize: 10, color: 'A7D7D0', margin: 0 } } },
      { placeholder: { options: { name: 'title', type: 'title', x: MX, y: 0.45, w: CW, h: 0.9, fontSize: 32, color: 'FFFFFF', bold: true, margin: 0, fontFace: THEME.headFontFace }, text: '' } },
    ],
    slideNumber: { x: W - MX - 0.8, y: 7.0, w: 0.8, h: 0.3, fontSize: 10, color: 'A7D7D0', align: 'right' },
  });
  return { pres, C };
}

// ---------- yordamchi chizish funksiyalari ----------
function badge(slide, x, y, label, opts = {}) {
  const d = opts.d || 0.5;
  slide.addShape('ellipse', { x, y, w: d, h: d, fill: { color: opts.fill || HEX.accent1 }, line: { color: opts.fill || HEX.accent1 }, objectName: `badge-${label}` });
  slide.addText(String(label), { x, y, w: d, h: d, fontSize: opts.size || 16, bold: true, color: 'FFFFFF', align: 'center', valign: 'middle', margin: 0, isTextBox: true });
}

function lead(slide, text, y = TOP) {
  if (!text) return y;
  const lines = Math.ceil(text.length / 150);
  const h = Math.max(0.45, lines * 0.32);
  slide.addText(text, { x: MX, y, w: CW, h, fontSize: 16, italic: true, color: '334155', margin: 0, valign: 'top', isTextBox: true });
  return y + h + 0.2;
}

function bodyRuns(text, ex) {
  const runs = [{ text, options: { color: '1E293B', breakLine: !!ex } }];
  if (ex) runs.push({ text: `Misol: ${ex}`, options: { italic: true, color: HEX.accent1 } });
  return runs;
}

function card(slide, x, y, w, h, n, head, text, ex, { tint = HEX.lt2 } = {}) {
  slide.addShape('roundRect', { x, y, w, h, fill: { color: tint }, line: { color: tint }, rectRadius: 0.08, objectName: `card-${n}` });
  badge(slide, x + 0.2, y + 0.2, n, { d: 0.46, size: 15 });
  slide.addText(head, { x: x + 0.8, y: y + 0.17, w: w - 1.0, h: 0.52, fontSize: 17, bold: true, color: HEX.dk2, valign: 'middle', margin: 0, isTextBox: true, fontFace: THEME.headFontFace });
  slide.addText(bodyRuns(text, ex), { x: x + 0.25, y: y + 0.78, w: w - 0.45, h: h - 0.9, fontSize: 14, valign: 'top', margin: 0, isTextBox: true, paraSpaceAfter: 6 });
}

// ---------- slayd turlari ----------
const R = {
  def(s, d) {
    let y = lead(s, d.lead);
    const boxH = 1.75;
    s.addShape('roundRect', { x: MX, y, w: CW, h: boxH, fill: { color: HEX.dk2 }, line: { color: HEX.dk2 }, rectRadius: 0.1, objectName: 'definition' });
    s.addText(d.term, { x: MX + 0.4, y: y + 0.2, w: CW - 0.8, h: 0.45, fontSize: 18, bold: true, color: 'FBBF24', margin: 0, isTextBox: true, fontFace: THEME.headFontFace });
    s.addText(d.def, { x: MX + 0.4, y: y + 0.65, w: CW - 0.8, h: boxH - 0.8, fontSize: 18, color: 'FFFFFF', margin: 0, valign: 'top', isTextBox: true });
    y += boxH + 0.3;
    const n = d.items.length;
    const gap = 0.3;
    const cw = (CW - gap * (n - 1)) / n;
    d.items.forEach(([h, t, ex], i) => card(s, MX + i * (cw + gap), y, cw, BOTTOM - y, i + 1, h, t, ex));
  },
  cards(s, d) {
    const y0 = lead(s, d.lead);
    const n = d.items.length;
    const cols = n <= 4 ? 2 : 3;
    const rows = Math.ceil(n / cols);
    const gap = 0.25;
    const cw = (CW - gap * (cols - 1)) / cols;
    const ch = (BOTTOM - y0 - gap * (rows - 1)) / rows;
    d.items.forEach(([h, t, ex], i) => {
      const c = i % cols;
      const r = Math.floor(i / cols);
      card(s, MX + c * (cw + gap), y0 + r * (ch + gap), cw, ch, i + 1, h, t, ex);
    });
  },
  table(s, d) {
    const y = lead(s, d.lead);
    const colW = d.colW || d.head.map(() => CW / d.head.length);
    const headRow = d.head.map((t) => ({ text: t, options: { bold: true, color: 'FFFFFF', fill: { color: HEX.accent1 }, fontSize: 15, valign: 'middle' } }));
    const rows = d.rows.map((r, ri) => r.map((t, ci) => ({ text: t, options: { fontSize: 14, color: '0F172A', bold: ci === 0, fill: { color: ri % 2 ? 'FFFFFF' : HEX.lt2 }, valign: 'middle' } })));
    const rowH = Math.min(0.75, (BOTTOM - y - 0.5) / d.rows.length);
    s.addTable([headRow, ...rows], { x: MX, y, w: colW.reduce((a, b) => a + b, 0), colW, rowH: [0.5, ...d.rows.map(() => rowH)], border: { type: 'solid', pt: 0.75, color: 'CBD5E1' }, margin: [4, 8, 4, 8], fontFace: THEME.bodyFontFace, objectName: 'data-table' });
  },
  steps(s, d) {
    const y0 = lead(s, d.lead);
    const n = d.items.length;
    if (n <= 5) {
      // Gorizontal jarayon: raqamli doiralar + ostida matn
      const gap = 0.25;
      const cw = (CW - gap * (n - 1)) / n;
      s.addShape('line', { x: MX + cw / 2, y: y0 + 0.35, w: CW - cw, h: 0, line: { color: HEX.accent3, width: 2.5 } });
      d.items.forEach(([h, t, ex], i) => {
        const x = MX + i * (cw + gap);
        badge(s, x + cw / 2 - 0.35, y0, i + 1, { d: 0.7, size: 22, fill: i === n - 1 ? HEX.accent2 : HEX.accent1 });
        s.addShape('roundRect', { x, y: y0 + 0.95, w: cw, h: BOTTOM - y0 - 0.95, fill: { color: HEX.lt2 }, line: { color: HEX.lt2 }, rectRadius: 0.08 });
        s.addText(h, { x: x + 0.2, y: y0 + 1.05, w: cw - 0.4, h: 0.6, fontSize: 17, bold: true, color: HEX.dk2, align: 'center', valign: 'middle', margin: 0, isTextBox: true, fontFace: THEME.headFontFace });
        s.addText(bodyRuns(t, ex), { x: x + 0.2, y: y0 + 1.7, w: cw - 0.4, h: BOTTOM - y0 - 1.85, fontSize: 14, valign: 'top', margin: 0, isTextBox: true, paraSpaceAfter: 6 });
      });
    } else {
      // Vertikal ro'yxat, ikki ustun
      const cols = 2;
      const rows = Math.ceil(n / cols);
      const gap = 0.25;
      const cw = (CW - gap) / cols;
      const ch = (BOTTOM - y0 - gap * (rows - 1)) / rows;
      d.items.forEach(([h, t, ex], i) => {
        const c = Math.floor(i / rows);
        const r = i % rows;
        const x = MX + c * (cw + gap);
        const y = y0 + r * (ch + gap);
        badge(s, x, y + 0.05, i + 1, { d: 0.55, size: 18 });
        s.addText(h, { x: x + 0.75, y, w: cw - 0.8, h: 0.45, fontSize: 17, bold: true, color: HEX.dk2, margin: 0, isTextBox: true, fontFace: THEME.headFontFace });
        s.addText(bodyRuns(t, ex), { x: x + 0.75, y: y + 0.45, w: cw - 0.8, h: ch - 0.5, fontSize: 14, valign: 'top', margin: 0, isTextBox: true, paraSpaceAfter: 4 });
      });
    }
  },
  compare(s, d) {
    const y0 = lead(s, d.lead);
    const gap = 0.35;
    const cw = (CW - gap) / 2;
    [[d.left, 'B91C1C', 'FDECEC'], [d.right, HEX.accent1, HEX.lt2]].forEach(([side, head, tint], i) => {
      const x = MX + i * (cw + gap);
      s.addShape('roundRect', { x, y: y0, w: cw, h: BOTTOM - y0, fill: { color: tint }, line: { color: tint }, rectRadius: 0.08, objectName: `column-${i}` });
      s.addShape('roundRect', { x, y: y0, w: cw, h: 0.65, fill: { color: head }, line: { color: head }, rectRadius: 0.08 });
      s.addText(side.h, { x: x + 0.3, y: y0, w: cw - 0.6, h: 0.65, fontSize: 18, bold: true, color: 'FFFFFF', valign: 'middle', margin: 0, isTextBox: true, fontFace: THEME.headFontFace });
      s.addText(side.items.map((t, k) => ({ text: t, options: { bullet: true, breakLine: k < side.items.length - 1 } })), { x: x + 0.3, y: y0 + 0.85, w: cw - 0.6, h: BOTTOM - y0 - 1.0, fontSize: 16, color: '1E293B', valign: 'top', margin: 0, paraSpaceAfter: 12, isTextBox: true });
    });
  },
  formula(s, d) {
    let y = lead(s, d.lead);
    s.addShape('roundRect', { x: MX, y, w: CW, h: 1.1, fill: { color: HEX.dk2 }, line: { color: HEX.dk2 }, rectRadius: 0.1, objectName: 'formula' });
    s.addText(d.formula, { x: MX + 0.3, y, w: CW - 0.6, h: 1.1, fontSize: 22, bold: true, color: 'FFFFFF', align: 'center', valign: 'middle', margin: 0, isTextBox: true, fontFace: THEME.headFontFace });
    y += 1.35;
    const exH = 1.25;
    const listH = BOTTOM - y - exH - 0.25;
    const rowH = listH / d.where.length;
    d.where.forEach(([k, v], i) => {
      const yy = y + i * rowH;
      s.addText(k, { x: MX, y: yy, w: 2.6, h: rowH, fontSize: 16, bold: true, color: HEX.accent1, valign: 'middle', margin: 0, isTextBox: true });
      s.addText(v, { x: MX + 2.7, y: yy, w: CW - 2.7, h: rowH, fontSize: 15, color: '1E293B', valign: 'middle', margin: 0, isTextBox: true });
    });
    const ey = BOTTOM - exH;
    s.addShape('roundRect', { x: MX, y: ey, w: CW, h: exH, fill: { color: 'FEF3C7' }, line: { color: 'FEF3C7' }, rectRadius: 0.08, objectName: 'example' });
    s.addText(d.example, { x: MX + 0.3, y: ey + 0.1, w: CW - 0.6, h: exH - 0.2, fontSize: 14, color: '78350F', valign: 'middle', margin: 0, isTextBox: true });
  },
};

// ---------- platforma uchun markdown ----------
function toMarkdown(d) {
  const L = [];
  if (d.lead) L.push(`*${d.lead}*`, '');
  if (d.t === 'def') { L.push(`> **${d.term}.** ${d.def}`, ''); d.items.forEach(([h, t, ex]) => L.push(`- **${h}.** ${t}${ex ? ` *Misol: ${ex}*` : ''}`)); }
  if (d.t === 'cards' || d.t === 'steps') d.items.forEach(([h, t, ex], i) => L.push(`${d.t === 'steps' ? `${i + 1}.` : '-'} **${h}.** ${t}${ex ? ` *Misol: ${ex}*` : ''}`));
  if (d.t === 'table') { L.push(`| ${d.head.join(' | ')} |`, `|${d.head.map(() => '---').join('|')}|`); d.rows.forEach((r) => L.push(`| ${r.join(' | ')} |`)); }
  if (d.t === 'compare') { [d.left, d.right].forEach((side) => { L.push(`**${side.h}**`); side.items.forEach((t) => L.push(`- ${t}`)); L.push(''); }); }
  if (d.t === 'formula') { L.push(`> **${d.formula}**`, ''); d.where.forEach(([k, v]) => L.push(`- **${k}** — ${v}`)); L.push('', d.example); }
  return L.join('\n').trim();
}

const fileName = (deck) => `M${String(deck.n).padStart(2, '0')}-taqdimot.pptx`;

async function buildDeck(deck) {
  const { pres } = definePres();
  pres.title = `${deck.n}-mavzu. ${deck.title}`;
  const md = [];

  // 1. Titul
  let s = pres.addSlide({ masterName: 'TITLE_PH' });
  s.addText(`${deck.n}-MAVZU · MA'RUZA`, { placeholder: 'eyebrow' });
  s.addText(deck.title, { placeholder: 'title', fit: 'shrink' });
  s.addText(deck.goal, { placeholder: 'body' });
  md.push({ title: `${deck.n}-mavzu. ${deck.title}`, body: `**Darsning maqsadi:** ${deck.goal}` });

  // 2. Reja
  s = pres.addSlide({ masterName: 'CONTENT' });
  s.addText('Reja', { placeholder: 'title' });
  const planH = BOTTOM - TOP;
  const step = planH / deck.plan.length;
  deck.plan.forEach((p, i) => {
    const y = TOP + i * step;
    badge(s, MX, y + (step - 0.5) / 2, i + 1, { d: 0.5 });
    s.addText(p, { x: MX + 0.75, y, w: 6.9, h: step, fontSize: 18, color: '0F172A', valign: 'middle', margin: 0, isTextBox: true });
  });
  s.addShape('roundRect', { x: 8.75, y: TOP, w: 3.98, h: planH, fill: { color: HEX.lt2 }, line: { color: HEX.lt2 }, rectRadius: 0.08, objectName: 'keywords' });
  s.addText('Tayanch tushunchalar', { x: 9.05, y: TOP + 0.25, w: 3.4, h: 0.45, fontSize: 18, bold: true, color: HEX.dk2, margin: 0, isTextBox: true, fontFace: THEME.headFontFace });
  s.addText(deck.keywords.map((k, i) => ({ text: k, options: { bullet: true, breakLine: i < deck.keywords.length - 1 } })), { x: 9.05, y: TOP + 0.85, w: 3.4, h: planH - 1.1, fontSize: 16, color: '1E293B', valign: 'top', margin: 0, paraSpaceAfter: 6, isTextBox: true });
  md.push({ title: 'Reja', body: deck.plan.map((p, i) => `${i + 1}. ${p}`).join('\n') + `\n\n**Tayanch tushunchalar:** ${deck.keywords.join(', ')}` });

  // 3. Kontent slaydlari
  for (const d of deck.slides) {
    s = pres.addSlide({ masterName: 'CONTENT' });
    s.addText(d.title, { placeholder: 'title' });
    R[d.t](s, d);
    if (d.notes) s.addNotes(d.notes);
    md.push({ title: d.title, body: toMarkdown(d) });
  }

  // 4. Xulosa
  s = pres.addSlide({ masterName: 'DARK' });
  s.addText('Xulosa', { placeholder: 'title' });
  const sh = (BOTTOM - TOP) / deck.summary.length;
  deck.summary.forEach((t, i) => {
    const y = TOP + i * sh;
    badge(s, MX, y + (sh - 0.5) / 2, '✓', { d: 0.5, fill: HEX.accent2, size: 16 });
    s.addText(t, { x: MX + 0.8, y, w: CW - 0.8, h: sh, fontSize: 18, color: 'FFFFFF', valign: 'middle', margin: 0, isTextBox: true });
  });
  md.push({ title: 'Xulosa', body: deck.summary.map((t) => `- ${t}`).join('\n') });

  // 5. Nazorat savollari va topshiriq
  s = pres.addSlide({ masterName: 'CONTENT' });
  s.addText("Nazorat savollari va topshiriq", { placeholder: 'title' });
  const qH = 3.9;
  s.addText(deck.questions.map((q, i) => ({ text: q, options: { bullet: { type: 'number' }, breakLine: i < deck.questions.length - 1 } })), { x: MX, y: TOP, w: CW, h: qH, fontSize: 18, color: '0F172A', valign: 'top', margin: 0, paraSpaceAfter: 14, isTextBox: true });
  const ty = TOP + qH + 0.2;
  s.addShape('roundRect', { x: MX, y: ty, w: CW, h: BOTTOM - ty, fill: { color: 'FEF3C7' }, line: { color: 'FEF3C7' }, rectRadius: 0.08, objectName: 'task' });
  s.addText([{ text: 'Amaliy topshiriq: ', options: { bold: true, color: '92400E' } }, { text: deck.task, options: { color: '78350F' } }], { x: MX + 0.3, y: ty + 0.1, w: CW - 0.6, h: BOTTOM - ty - 0.2, fontSize: 16, valign: 'middle', margin: 0, isTextBox: true });
  md.push({ title: 'Nazorat savollari va topshiriq', body: deck.questions.map((q, i) => `${i + 1}. ${q}`).join('\n') + `\n\n> **Amaliy topshiriq:** ${deck.task}` });

  // 6. Adabiyotlar
  s = pres.addSlide({ masterName: 'CONTENT' });
  s.addText('Adabiyotlar va manbalar', { placeholder: 'title' });
  const lit = [
    "O'zbekiston Respublikasining \"Tadbirkorlik faoliyati erkinligining kafolatlari to'g'risida\"gi Qonuni (amaldagi tahrir) — lex.uz",
    "O'zbekiston Respublikasining Soliq kodeksi (2019, O'RQ–599) va Fuqarolik kodeksi — lex.uz",
    "Raxmatullaeva D.R. Tadbirkorlikni tashkil etish. O'quv qo'llanma. — T.: Tafakkur bo'stoni, 2022",
    "Raxmatullaeva D.R. Kichik biznes va xususiy tadbirkorlikni tashkil etish. O'quv qo'llanma. — T., 2025",
    'Osterwalder A., Pigneur Y. Business Model Generation. — Wiley, 2010',
    'Ries E. The Lean Startup. — Crown Business, 2011',
    'Axborot manbalari: my.gov.uz, my.soliq.uz, stat.uz, finlit.uz',
  ];
  s.addText(lit.map((t, i) => ({ text: t, options: { bullet: { type: 'number' }, breakLine: i < lit.length - 1 } })), { x: MX, y: TOP, w: CW, h: BOTTOM - TOP, fontSize: 16, color: '0F172A', valign: 'top', margin: 0, paraSpaceAfter: 8, isTextBox: true });
  md.push({ title: 'Adabiyotlar va manbalar', body: lit.map((t, i) => `${i + 1}. ${t}`).join('\n') });

  const out = join(OUT_DIR, fileName(deck));
  await pres.writeFile({ fileName: out });
  return { n: deck.n, title: deck.title, file: `/resources/taqdimotlar/${fileName(deck)}`, pdf: `/resources/taqdimotlar/${fileName(deck).replace('.pptx', '.pdf')}`, slides: md };
}

const only = process.argv.slice(2).map(Number).filter(Boolean);
const decks = [...part1, ...part2, ...part3].filter((d) => !only.length || only.includes(d.n));
const meta = [];
for (const d of decks) {
  meta.push(await buildDeck(d));
  console.log(`✓ ${d.n}-mavzu: ${d.slides.length + 5} slayd`);
}
if (!only.length) {
  // Platforma "Resurslar → Taqdimotlar" bo'limi shu faylni o'qiydi
  writeFileSync(join(OUT_DIR, 'index.json'), JSON.stringify({ course: COURSE, code: CODE, decks: meta }));
}
