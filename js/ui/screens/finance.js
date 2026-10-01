// Finanzübersicht
import { esc, fmtEUR } from '../../util.js';
import { seasonFinance } from '../../finance.js';
import { topbar } from '../components.js';

const CAT = { prize: 'Preisgeld', fee: 'Gebühr', travel: 'Reise', start: 'Start', sponsor: 'Sponsor', staff: 'Team', recovery: 'Erholung' };

export function render(app) {
  const s = app.state, f = s.finance, y = s.date.year;
  const sf = seasonFinance(s, y);
  const years = Object.keys(f.seasons).sort((a, b) => b - a);
  return `${topbar({ title: 'Finanzen', sub: `Saison ${y}`, money: f.balance })}
  <div class="kpi-grid">
    <div class="kpi"><div class="label">Kontostand</div><div class="v num ${f.balance >= 0 ? 'pos' : 'neg'}">${fmtEUR(f.balance)}</div></div>
    <div class="kpi"><div class="label">Einnahmen ${y}</div><div class="v num pos">${fmtEUR(sf.income)}</div></div>
    <div class="kpi"><div class="label">Ausgaben ${y}</div><div class="v num neg">${fmtEUR(sf.expenses)}</div></div>
    <div class="kpi"><div class="label">Preisgeld gesamt</div><div class="v num gold">${fmtEUR(f.prizeTotal)}</div></div>
  </div>
  <div class="section-title"><span class="label">Saisonbilanz</span></div>
  <div class="panel table-wrap"><table class="table">
    <tr><th>Saison</th><th class="r">Einnahmen</th><th class="r">Ausgaben</th><th class="r">Preisgeld</th><th class="r">Saldo</th></tr>
    ${years.map(yr => { const x = f.seasons[yr]; const net = x.income - x.expenses;
      return `<tr><td>${yr}</td><td class="r num pos">${fmtEUR(x.income)}</td><td class="r num neg">${fmtEUR(x.expenses)}</td><td class="r num">${fmtEUR(x.prize)}</td><td class="r num ${net >= 0 ? 'pos' : 'neg'}">${fmtEUR(net)}</td></tr>`; }).join('')}
  </table></div>
  <div class="section-title"><span class="label">Buchungen</span></div>
  <div class="panel table-wrap"><table class="table">
    <tr><th>Datum</th><th>Vorgang</th><th class="r">Betrag</th></tr>
    ${f.tx.slice(0, 150).map(t => `<tr><td class="muted" style="white-space:nowrap">KW ${t.week}/${t.year}</td>
      <td>${esc(t.text)} <span class="dim" style="font-size:.75rem">${CAT[t.cat] ?? ''}</span></td>
      <td class="r num ${t.amount >= 0 ? 'pos' : 'neg'}" style="white-space:nowrap">${t.amount >= 0 ? '+' : ''}${fmtEUR(t.amount)}</td></tr>`).join('')}
  </table></div>
  <p class="muted" style="font-size:.8rem;margin-top:12px">Kosten: Anmeldegebühr 25 € (Q-School, Challenge, Dev) je Turnier · Reise England 600 €, Deutschland 250 €, sonst 400 € · Lokale Turniere kostenlos.</p>`;
}
