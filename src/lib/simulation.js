// "Mikrobiznes" simulyatsiya o'yini: talaba har haftada narx, ishlab chiqarish hajmi va reklama byudjetini tanlaydi.
// Talab modeli serverda yashirin; natija har bir raund uchun hisoblanadi.

const num = (v, def = 0) => {
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? n : def;
};

export function simulate(c, decisions = []) {
  let cash = num(c.start_cash);
  let costMult = 1;
  const rounds = [];
  const total = Math.min(decisions.length, c.rounds || 6);
  for (let r = 0; r < total; r++) {
    const evs = (c.events || []).filter((e) => e.round === r + 1);
    let demandMult = 1;
    for (const e of evs) {
      if (e.unit_cost_mult) costMult *= e.unit_cost_mult;
      if (e.demand_mult) demandMult *= e.demand_mult;
    }
    const unitCost = Math.round(c.unit_cost * costMult);
    const d = decisions[r] || {};
    const price = Math.max(1, Math.round(num(d.price, c.price_ref)));
    let ads = Math.round(num(d.ads));
    const available = Math.max(0, cash - c.fixed_cost);
    ads = Math.min(ads, available);
    const maxQty = Math.floor((available - ads) / unitCost);
    const qty = Math.min(Math.floor(num(d.qty)), Math.max(0, maxQty));
    const season = (c.season || [])[r] ?? 1;
    const adBoost = 1 + c.ad_boost * (1 - Math.exp(-ads / c.ad_half));
    const demand = Math.max(0, Math.round(c.base_demand * season * demandMult * Math.pow(c.price_ref / price, c.elasticity) * adBoost));
    const sold = Math.min(qty, demand);
    const revenue = sold * price;
    const tax = Math.round(revenue * (c.tax_rate ?? 0.04));
    const costs = qty * unitCost + c.fixed_cost + ads;
    const profit = revenue - costs - tax;
    cash += profit;
    rounds.push({
      round: r + 1, events: evs.map((e) => e.text), unit_cost: unitCost, price, qty, ads, demand, sold,
      unsold: qty - sold, lost: Math.max(0, demand - qty), revenue, costs, tax, profit, cash, cash_gap: cash < 0,
    });
  }
  return { rounds, cash, profit: cash - num(c.start_cash), finished: total >= (c.rounds || 6) };
}

/** O'quvchiga ko'rsatiladigan qism (talab modeli yashiriladi). */
export function publicSimulation(c) {
  return {
    game: c.game, product: c.product, intro: c.intro, rounds: c.rounds, round_label: c.round_label || 'Hafta',
    start_cash: c.start_cash, unit_cost: c.unit_cost, fixed_cost: c.fixed_cost, price_ref: c.price_ref,
    tax_rate: c.tax_rate ?? 0.04, target_profit: c.target_profit,
    events: (c.events || []).map((e) => ({ round: e.round, text: e.text })),
  };
}
