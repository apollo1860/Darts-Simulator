// Willkommen-Karte vor der Profilerstellung
import { card } from '../frame.js';

export const nsd = true;
export function render() {
  return card('Willkommen bei New Star Darts. Du stehst kurz davor, die spannende Dartskarriere eines jungen Spielers zu beginnen. Zuerst musst du aber dein Profil erstellen.');
}
export function mount(root, app, params) {
  root.querySelector('#nsd-ok').onclick = () => app.go('newprofile', { slot: params.slot ?? 1 });
}
