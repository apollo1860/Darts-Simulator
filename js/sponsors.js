// Sponsoren (Phase 6). Erst nach der ersten Tourcard verfügbar, max. 4 gleichzeitig.
export const MAX_SPONSORS = 4;
export const sponsorsUnlocked = state => !!state.player.everTourcard;
