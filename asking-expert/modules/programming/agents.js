// Bot identifiers, never tokens. Keep snowflakes as strings to preserve precision.
// Sources and verification limitations: docs/programming-features.md.
export const AGENTS = Object.freeze([
  { key: 'astra', name: 'Astra', botId: '1491356445827010620' },
  { key: 'jolene', name: 'Jolene', botId: '1525813280432722031' },
  { key: 'lilith', name: 'Lilith', botId: '1491685434667831427' },
  { key: 'miko', name: 'Miko', botId: '1489873862668718240' },
  { key: 'nova', name: 'Nova', botId: '1491686849779863623' },
  { key: 'scarlet', name: 'Scarlet', botId: '1491378395253309510' },
].map(agent => Object.freeze(agent)));

export const DEFAULT_AGENT = 'miko';
