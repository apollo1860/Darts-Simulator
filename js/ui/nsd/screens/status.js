// Hauptscreen (Status): Star-Status, Energie, Alter, Sterne-Geld, Fähigkeiten/Zufriedenheit/Lifestyle, Tour-Status, Shop, Getränke, Darts
import { esc } from '../../../util.js';
import { skillsAvg, SKILL_MAX, starPct, starNeed } from '../../../nsd.js';
import { starMeter, frame, header, meter, starIcon, heartIcon, coin, bar, bindHead, arrowIcon } from '../frame.js';

export const nsd = true;
const HELP = `<p><b>Ranglisten</b>: Order of Merits, Premier League, Spielplan. <b>Fähigkeit</b>: deine Werte und das Training. <b>Leben</b>: Beziehungen, Lifestyle, Erfolge. <b>Spielen</b>: die Turniere dieser Woche.</p>
  <p>Unter 20 % Energie bist du nicht match-fit: Du wirfst keine Schlüsselmomente mehr selbst und spielst immer schlechter.</p>`;

export function render(app) {
  const s = app.state, p = s.player, e = Math.round(p.energy ?? 100), fit = e >= 20;
  const d = p.drinks ?? {}, yearNo = s.date.year - (s.startYear ?? 2026) + 1;
  return frame({
    body: `${header(p.name)}
    <div class="nsd-meters">
      ${starMeter(app.state, { starIcon, starPct, starNeed })}
      ${meter({ icon: heartIcon(), label: 'Energie', pct: e, tone: fit ? 'green' : 'red' })}
    </div>
    ${s.lifeEvent ? '<button class="nsd-dark nsd-alert" data-go="lifeevent">📬 Ein Ereignis wartet auf dich!</button>' : ''}
    <div class="nsd-strip"><span>Alter ${p.age}</span><span class="mid">Status</span><span class="r">${coin(s.stars ?? 0)}</span></div>
    <div class="nsd-rows">
      <div class="nsd-grid3">
        ${meter({ label: 'Fähigkeiten', pct: skillsAvg(p) / SKILL_MAX * 100, cls: 'sm' })}
        ${meter({ label: 'Zufriedenheit', pct: p.satisfaction ?? 50 })}
        ${meter({ label: 'Lifestyle', pct: p.lifestyle ?? 0 })}
      </div>
      <div class="nsd-rowpair">
        <div class="nsd-tag ${p.tour === 'tour' ? 'green' : 'red'}">🛡️ ${p.tour === 'tour' ? `Tourcard bis Ende ${p.cardUntil}` : 'Keine Tourcard'}</div>
        <div class="nsd-dark ${fit ? '' : 'red'}">${fit ? 'Match-fit' : 'Nicht fit'}</div>
      </div>
      <div class="nsd-rowpair x">
        <button class="nsd-btn row" id="s-shop"><span class="ic">🛒</span><span class="lb">Shop</span></button>
        <button class="nsd-dark" data-go="team" style="font-size:1.05rem;border:0;cursor:pointer;font-family:inherit;color:inherit">${p.fitness ? esc(p.fitness.name) : 'Fitnesstrainer'}</button>
        <div class="nsd-x" style="${p.fitness ? 'color:#2bd33a' : ''}">${p.fitness ? '✔' : '✖'}</div>
      </div>
      <div class="nsd-rowpair">
        <button class="nsd-btn row" id="s-drinks"><span class="ic">🍺</span><span class="lb">Getränke</span></button>
        <div class="nsd-dark" style="font-size:1.15rem;white-space:nowrap">🍺${d.beer ?? 0}&nbsp; 🥃${d.schnaps ?? 0}&nbsp; 🍸${d.wodka ?? 0}</div>
      </div>
      <div class="nsd-rowpair">
        <button class="nsd-btn row" id="s-darts"><span class="ic">🎯</span><span class="lb">Darts</span></button>
        <div class="nsd-dark ${p.gear ? '' : 'red'}">${p.gear ? esc(p.gear.name) : 'Keine'}</div>
      </div>
    </div>
    <div class="nsd-pager"><button data-go="goals">◀ 🎯 Ziele</button><button data-go="stats">📋 Statistik</button><button data-go="editor">🛠️</button><button data-go="calendar">Spielplan 🗓️ ▶</button></div>
    <div class="nsd-strip"><span>Jahr ${yearNo}</span><span class="mid">${s.date.year}</span><span class="r">KW ${s.date.week}</span></div>`,
    bottom: bar([
      { go: 'league', icon: '🏆', label: 'Ranglisten' },
      { go: 'skills', icon: '🎯', label: 'Fähigkeit' },
      { go: 'life', icon: '👥', label: 'Leben' },
      { id: 's-play', icon: arrowIcon(), label: 'Spielen' },
    ]),
  });
}

export function mount(root, app) {
  bindHead(root, app, HELP);
  root.querySelector('#s-shop').onclick = () => app.go('accessories');   // Zubehör; Lifestyle nur über Leben
  root.querySelector('#s-drinks').onclick = () => app.go('drinks');
  root.querySelector('#s-darts').onclick = () => app.go('darts');
  // Spielen: laufendes Turnier → Turnier, sonst Wochenansicht (Melden / Weiter)
  root.querySelector('#s-play').onclick = () => app.go(app.state.ended ? 'careerEnd' : app.state.lifeEvent ? 'lifeevent' : app.state.activeEvent ? 'event' : 'week');
}
