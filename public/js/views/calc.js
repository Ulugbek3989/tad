// Biznes kalkulyatorlari: zararsizlik nuqtasi, narx, kredit, soliq, ROI, bozor hajmi, reklama
import { html, setHTML, on } from '../ui.js';

export const som = (n) => `${Math.round(Number(n) || 0).toLocaleString('ru-RU').replace(/,/g, ' ')} so'm`;
const fmt = (n, d = 0) => (Number.isFinite(n) ? n.toLocaleString('ru-RU', { maximumFractionDigits: d }).replace(/,/g, ' ') : '—');
const row = (label, value, strong = false) => html`<tr><td>${label}</td><td class="right" style="font-variant-numeric:tabular-nums">${strong ? html`<strong>${value}</strong>` : value}</td></tr>`;

/** Daromad va xarajatlar chizig'i (zararsizlik grafigi). */
export function breakEvenChart({ fixed, price, variable, maxQty }) {
  const W = 520, H = 220, P = 40;
  const qMax = Math.max(1, maxQty);
  const yMax = Math.max(price * qMax, fixed + variable * qMax) * 1.05;
  const x = (q) => P + (q / qMax) * (W - P - 10);
  const y = (v) => H - 25 - (v / yMax) * (H - 40);
  const bep = price > variable ? fixed / (price - variable) : null;
  return html`<svg viewBox="0 0 ${W} ${H}" style="width:100%;max-width:560px;height:auto" role="img" aria-label="Zararsizlik grafigi">
    <line x1="${P}" y1="${H - 25}" x2="${W - 10}" y2="${H - 25}" stroke="var(--border)"/>
    <line x1="${P}" y1="10" x2="${P}" y2="${H - 25}" stroke="var(--border)"/>
    <polyline fill="none" stroke="var(--danger)" stroke-width="2.5" points="${x(0)},${y(fixed)} ${x(qMax)},${y(fixed + variable * qMax)}"/>
    <polyline fill="none" stroke="var(--success)" stroke-width="2.5" points="${x(0)},${y(0)} ${x(qMax)},${y(price * qMax)}"/>
    <polyline fill="none" stroke="var(--muted)" stroke-dasharray="4 4" points="${x(0)},${y(fixed)} ${x(qMax)},${y(fixed)}"/>
    ${bep && bep <= qMax ? html`<circle cx="${x(bep)}" cy="${y(price * bep)}" r="5" fill="var(--primary)"/>
      <text x="${x(bep) + 8}" y="${y(price * bep) - 8}" font-size="12" fill="var(--text)">Zararsizlik: ${fmt(Math.ceil(bep))} dona</text>` : ''}
    <text x="${W - 12}" y="${H - 8}" font-size="11" text-anchor="end" fill="var(--muted)">${fmt(qMax)} dona</text>
    <text x="${P}" y="${H - 8}" font-size="11" fill="var(--muted)">0</text>
    <text x="${P + 6}" y="20" font-size="11" fill="var(--success)">— Tushum</text>
    <text x="${P + 80}" y="20" font-size="11" fill="var(--danger)">— Jami xarajat</text>
    <text x="${P + 175}" y="20" font-size="11" fill="var(--muted)">- - Doimiy xarajat</text>
  </svg>`;
}

export function loanSchedule({ amount, rate, months, grace = 0, type = 'annuity' }) {
  const r = rate / 100 / 12;
  const rows = [];
  let bal = amount;
  const payN = Math.max(1, months - grace);
  const ann = r ? (amount * r) / (1 - Math.pow(1 + r, -payN)) : amount / payN;
  for (let m = 1; m <= months; m++) {
    const interest = bal * r;
    let principal = 0;
    if (m > grace) principal = type === 'annuity' ? ann - interest : amount / payN;
    principal = Math.min(principal, bal);
    bal -= principal;
    rows.push({ m, interest, principal, payment: interest + principal, bal: Math.max(0, bal) });
  }
  return rows;
}

const CALCS = [
  {
    key: 'bep', icon: '⚖️', title: 'Zararsizlik nuqtasi', topic: 'M10',
    fields: [['fixed', 'Oylik doimiy xarajatlar, so\'m', 6000000], ['price', 'Sotish narxi (1 dona), so\'m', 50000], ['variable', "O'zgaruvchan xarajat (1 dona), so'm", 30000], ['plan', 'Rejalashtirilgan savdo, dona/oy', 400], ['target', 'Maqsadli oylik foyda, so\'m', 3000000]],
    out: (v) => {
      const m = v.price - v.variable;
      if (m <= 0) return html`<div class="alert danger">Narx o'zgaruvchan xarajatdan yuqori bo'lishi kerak — aks holda har bir sotuv zarar keltiradi.</div>`;
      const bep = v.fixed / m;
      const profit = v.plan * m - v.fixed;
      return html`<table class="table"><tbody>
        ${row('Marjinal daromad (1 dona)', som(m))}
        ${row('Marjinal daromad ulushi', fmt((m / v.price) * 100, 1) + '%')}
        ${row('Zararsizlik nuqtasi', `${fmt(Math.ceil(bep))} dona/oy`, true)}
        ${row('Zararsizlik nuqtasi (tushum)', som(Math.ceil(bep) * v.price))}
        ${row('Maqsadli foyda uchun savdo', `${fmt(Math.ceil((v.fixed + v.target) / m))} dona/oy`)}
        ${row(`Reja (${fmt(v.plan)} dona) bo'yicha foyda`, html`<span style="color:${profit >= 0 ? 'var(--success)' : 'var(--danger)'}">${som(profit)}</span>`, true)}
        ${row('Xavfsizlik zaxirasi', v.plan > 0 ? fmt(((v.plan - bep) / v.plan) * 100, 1) + '%' : '—')}
      </tbody></table>${breakEvenChart({ fixed: v.fixed, price: v.price, variable: v.variable, maxQty: Math.max(v.plan, Math.ceil(bep * 1.6)) })}
      <p class="small muted">Formula: zararsizlik nuqtasi = doimiy xarajatlar ÷ (narx − o'zgaruvchan xarajat). Xavfsizlik zaxirasi — savdo zararsizlik nuqtasigacha necha foiz kamayishi mumkinligi.</p>`;
    },
  },
  {
    key: 'price', icon: '🏷️', title: 'Narx va tannarx', topic: 'M10',
    fields: [['material', 'Xomashyo va materiallar (1 dona), so\'m', 45000], ['labor', 'Ishbay haq (1 dona), so\'m', 30000], ['other', 'Qadoq, yetkazish va boshqalar (1 dona), so\'m', 5000], ['fixed', 'Oylik doimiy xarajatlar, so\'m', 8000000], ['volume', 'Oylik hajm, dona', 200], ['markup', 'Ustama, %', 30], ['competitor', 'Raqobatchi narxi, so\'m', 160000]],
    out: (v) => {
      const varCost = v.material + v.labor + v.other;
      const fixedPer = v.volume > 0 ? v.fixed / v.volume : 0;
      const cost = varCost + fixedPer;
      const price = cost * (1 + v.markup / 100);
      const diff = v.competitor ? ((price - v.competitor) / v.competitor) * 100 : null;
      return html`<table class="table"><tbody>
        ${row("O'zgaruvchan xarajat (1 dona)", som(varCost))}
        ${row('Doimiy xarajat ulushi (1 dona)', som(fixedPer))}
        ${row("To'liq tannarx (1 dona)", som(cost), true)}
        ${row(`Narx (tannarx + ${fmt(v.markup)}%)`, som(price), true)}
        ${row('Raqobatchiga nisbatan', diff === null ? '—' : `${diff > 0 ? '+' : ''}${fmt(diff, 1)}%`)}
        ${row('Oylik foyda (rejadagi hajmda)', som((price - cost) * v.volume))}
      </tbody></table>
      ${diff !== null && diff > 15 ? html`<div class="alert warning small">Narxingiz raqobatchidan ${fmt(diff, 0)}% qimmat. Uni sifat, xizmat yoki brend bilan asoslang yoki xarajatlarni qisqartiring.</div>` : ''}
      <p class="small muted">Xarajat + ustama usuli. Qiymatga asoslangan narx uchun mijoz to'lashga tayyor summani so'rovnoma orqali aniqlang.</p>`;
    },
  },
  {
    key: 'loan', icon: '🏦', title: 'Kredit kalkulyatori', topic: 'M3',
    fields: [['amount', 'Kredit summasi, so\'m', 18000000], ['rate', 'Yillik foiz stavkasi, %', 14], ['months', 'Muddat, oy', 24], ['grace', 'Imtiyozli davr, oy', 6], ['cashflow', 'Biznesning oylik sof pul oqimi, so\'m', 2600000]],
    extra: html`<div class="field"><label>To'lov turi</label><select name="type"><option value="annuity">Annuitet (teng to'lovlar)</option><option value="diff">Differensial (kamayib boruvchi)</option></select></div>`,
    out: (v) => {
      const months = Math.max(1, Math.round(v.months));
      const grace = Math.min(Math.max(0, Math.round(v.grace)), months - 1);
      const sch = loanSchedule({ amount: v.amount, rate: v.rate, months, grace, type: v.type });
      const total = sch.reduce((a, r) => a + r.payment, 0);
      const maxPay = Math.max(...sch.map((r) => r.payment));
      const share = v.cashflow > 0 ? (maxPay / v.cashflow) * 100 : null;
      return html`<table class="table"><tbody>
        ${row('Eng katta oylik to\'lov', som(maxPay), true)}
        ${row('Jami to\'lanadigan summa', som(total))}
        ${row("Jami foiz (kredit narxi)", som(total - v.amount), true)}
        ${row("To'lovning sof pul oqimidagi ulushi", share === null ? '—' : html`<span style="color:${share > 60 ? 'var(--danger)' : share > 40 ? 'var(--warning)' : 'var(--success)'}">${fmt(share, 0)}%</span>`)}
      </tbody></table>
      ${share !== null ? html`<div class="alert ${share > 60 ? 'danger' : share > 40 ? 'warning' : 'success'} small">${share > 60 ? "Yuqori xavf: to'lov pul oqimining katta qismini oladi. Summani kamaytiring yoki muddatni uzaytiring." : share > 40 ? "O'rtacha xavf: savdo pasaysa, to'lovda qiyinchilik bo'lishi mumkin. Zaxira fondi yarating." : "Qaytarish qobiliyati yaxshi: to'lov sof pul oqimining kichik qismi."}</div>` : ''}
      <details><summary class="small" style="cursor:pointer;font-weight:600">To'lov jadvali (${months} oy)</summary>
      <div class="table-wrap" style="max-height:320px;margin-top:8px"><table class="table small" style="font-variant-numeric:tabular-nums"><thead><tr><th>Oy</th><th>Asosiy qarz</th><th>Foiz</th><th>To'lov</th><th>Qoldiq</th></tr></thead>
      <tbody>${sch.map((r) => html`<tr><td>${r.m}</td><td>${fmt(r.principal)}</td><td>${fmt(r.interest)}</td><td><strong>${fmt(r.payment)}</strong></td><td>${fmt(r.bal)}</td></tr>`)}</tbody></table></div></details>`;
    },
  },
  {
    key: 'tax', icon: '🧾', title: 'Soliq rejimlarini solishtirish', topic: 'M5',
    fields: [['revenue', 'Oylik tushum (QQS bilan), so\'m', 60000000], ['costs_vat', "QQS bilan xarid qilingan xarajatlar, so'm", 30000000], ['costs_other', "Boshqa xarajatlar (ish haqi, ijara va h.k.), so'm", 15000000], ['turnover_rate', 'Aylanma solig\'i stavkasi, %', 4], ['vat_rate', 'QQS stavkasi, %', 12], ['profit_rate', "Foyda solig'i stavkasi, %", 15]],
    out: (v) => {
      const simple = v.revenue * (v.turnover_rate / 100);
      const simpleProfit = v.revenue - v.costs_vat - v.costs_other - simple;
      const k = v.vat_rate / (100 + v.vat_rate);
      const vatOut = v.revenue * k;
      const vatIn = v.costs_vat * k;
      const vat = Math.max(0, vatOut - vatIn);
      const base = v.revenue - vatOut - (v.costs_vat - vatIn) - v.costs_other;
      const profitTax = Math.max(0, base) * (v.profit_rate / 100);
      const generalProfit = base - profitTax;
      const better = simpleProfit >= generalProfit ? 'simple' : 'general';
      return html`<div class="table-wrap"><table class="table"><thead><tr><th>Ko'rsatkich</th><th class="right">Aylanmadan olinadigan soliq</th><th class="right">QQS + foyda solig'i</th></tr></thead><tbody>
        <tr><td>Soliqlar jami</td><td class="right">${som(simple)}</td><td class="right">${som(vat + profitTax)}</td></tr>
        <tr><td class="small muted">shu jumladan</td><td class="right small muted">aylanma: ${som(simple)}</td><td class="right small muted">QQS: ${som(vat)} · foyda: ${som(profitTax)}</td></tr>
        <tr><td><strong>Sof foyda</strong></td><td class="right ${better === 'simple' ? 'score-hi' : ''}"><strong>${som(simpleProfit)}</strong></td><td class="right ${better === 'general' ? 'score-hi' : ''}"><strong>${som(generalProfit)}</strong></td></tr>
      </tbody></table></div>
      <div class="alert info small">Ushbu ma'lumotlarda <strong>${better === 'simple' ? 'aylanmadan olinadigan soliq' : 'umumbelgilangan tartib (QQS + foyda solig\'i)'}</strong> foydaliroq. Rejimni tanlashda aylanma chegarasi (yillik 1 mlrd so'm), mijozlaringiz QQS to'lovchisi ekani va hisob yuritish imkoniyatini ham hisobga oling.</div>
      <p class="small muted">Soddalashtirilgan o'quv hisobi: ijtimoiy soliq, mol-mulk soliqlari va imtiyozlar hisobga olinmagan. Amaldagi stavkalarni soliq.uz va lex.uz dan tekshiring.</p>`;
    },
  },
  {
    key: 'roi', icon: '📈', title: 'ROI va qoplanish muddati', topic: 'M12',
    fields: [['invest', "Boshlang'ich investitsiya, so'm", 24000000], ['revenue', 'Oylik tushum, so\'m', 27000000], ['costs', 'Oylik xarajatlar (soliq bilan), so\'m', 25000000]],
    out: (v) => {
      const p = v.revenue - v.costs;
      return html`<table class="table"><tbody>
        ${row('Oylik sof foyda', som(p), true)}
        ${row('Sof rentabellik', v.revenue ? fmt((p / v.revenue) * 100, 1) + '%' : '—')}
        ${row('Yillik ROI', v.invest ? fmt(((p * 12) / v.invest) * 100, 1) + '%' : '—', true)}
        ${row('Qoplanish muddati', p > 0 ? `${fmt(v.invest / p, 1)} oy` : 'Foyda yo\'q — qoplanmaydi', true)}
      </tbody></table><p class="small muted">ROI = yillik sof foyda ÷ investitsiya × 100%. Qoplanish muddati = investitsiya ÷ oylik sof foyda.</p>`;
    },
  },
  {
    key: 'market', icon: '🎯', title: 'Bozor hajmi (TAM / SAM / SOM)', topic: 'M7',
    fields: [['people', 'Potensial mijozlar soni (TAM bo\'yicha)', 200000], ['freq', 'Yillik xaridlar soni (1 mijoz)', 4], ['check', 'O\'rtacha chek, so\'m', 50000], ['sam', 'Xizmat ko\'rsatish mumkin bo\'lgan ulush (SAM), %', 20], ['som', 'Real egallanadigan ulush (SOM), %', 5]],
    out: (v) => {
      const tam = v.people * v.freq * v.check;
      const sam = tam * (v.sam / 100);
      const somV = sam * (v.som / 100);
      const bar = (val, color) => html`<div class="track" style="height:14px;background:var(--surface-2);border-radius:99px;overflow:hidden"><span style="display:block;height:100%;width:${tam ? Math.max(1, (val / tam) * 100) : 0}%;background:${color}"></span></div>`;
      return html`<div class="stack">
        <div><div class="row between"><strong>TAM</strong><span>${som(tam)}/yil</span></div>${bar(tam, 'var(--primary-2)')}</div>
        <div><div class="row between"><strong>SAM</strong><span>${som(sam)}/yil</span></div>${bar(sam, 'var(--primary)')}</div>
        <div><div class="row between"><strong>SOM</strong><span><strong>${som(somV)}/yil</strong> · ${som(somV / 12)}/oy</span></div>${bar(somV, 'var(--success)')}</div></div>
        <p class="small muted">TAM = mijozlar × xaridlar × o'rtacha chek. Mijozlar sonini stat.uz ma'lumotlari va o'z so'rovnomangiz asosida asoslang.</p>`;
    },
  },
  {
    key: 'ads', icon: '📣', title: 'Reklama samaradorligi', topic: 'M8',
    fields: [['budget', 'Reklama byudjeti, so\'m', 3000000], ['reach', 'Qamrov (ko\'rganlar)', 40000], ['leads', 'Qiziqqanlar (lidlar)', 2000], ['buyers', 'Xaridorlar', 80], ['margin', "Bitta mijozdan foyda (marja), so'm", 60000]],
    out: (v) => {
      const cac = v.buyers ? v.budget / v.buyers : null;
      const romi = v.budget ? ((v.buyers * v.margin - v.budget) / v.budget) * 100 : null;
      return html`<table class="table"><tbody>
        ${row('Lid konversiyasi (qamrov → lid)', v.reach ? fmt((v.leads / v.reach) * 100, 2) + '%' : '—')}
        ${row('Xarid konversiyasi (lid → xarid)', v.leads ? fmt((v.buyers / v.leads) * 100, 1) + '%' : '—')}
        ${row('CAC — bitta mijozni jalb qilish narxi', cac === null ? '—' : som(cac), true)}
        ${row('ROMI', romi === null ? '—' : html`<span style="color:${romi >= 0 ? 'var(--success)' : 'var(--danger)'}">${fmt(romi, 0)}%</span>`, true)}
      </tbody></table>
      ${cac !== null && cac > v.margin ? html`<div class="alert danger small">CAC (${som(cac)}) bitta mijozdan olinadigan foydadan katta — reklama zarar keltirmoqda. Kanal, kontent yoki takroriy xaridlarni ko'paytiring.</div>` : ''}`;
    },
  },
];

export async function calcView(view, ctx) {
  let key = ctx.query.c && CALCS.some((c) => c.key === ctx.query.c) ? ctx.query.c : 'bep';
  const draw = () => {
    const c = CALCS.find((x) => x.key === key);
    setHTML(view, html`<div class="page-head"><div><h1>🧮 Biznes kalkulyatorlari</h1><p>Amaliy mashg'ulotlar va biznes loyihangiz uchun tezkor hisob-kitoblar</p></div></div>
      <div class="tabs">${CALCS.map((x) => html`<button data-calc="${x.key}" class="${x.key === key ? 'active' : ''}">${x.icon} ${x.title}</button>`)}</div>
      <div class="grid grid-2">
        <form class="card" id="calc-form"><h3>${c.icon} ${c.title} <span class="badge">${c.topic}</span></h3>
          ${c.fields.map(([n, l, d]) => html`<div class="field"><label for="calc-${n}">${l}</label><input id="calc-${n}" type="number" name="${n}" value="${d}" step="any" min="0"></div>`)}
          ${c.extra || ''}</form>
        <div class="card" id="calc-out"></div></div>`);
    const form = view.querySelector('#calc-form');
    const recompute = () => {
      const v = {};
      for (const el of form.elements) if (el.name) v[el.name] = el.type === 'number' ? Number(el.value) || 0 : el.value;
      setHTML(view.querySelector('#calc-out'), html`<h3>Natija</h3>${c.out(v)}`);
    };
    form.addEventListener('input', recompute);
    recompute();
  };
  on(view, 'click', '[data-calc]', (e, b) => { key = b.dataset.calc; draw(); });
  draw();
}
