/** PeriferiaLab — tokens visuais, sem dependências do motor. */
export const colors = {
  background: '#0D1117', surface: '#161B22', control: '#21262D',
  border: '#30363D', accent: '#4ADE80', primary: '#238636',
  text: '#F0F6FC', muted: '#8B949E', info: '#60A5FA',
  onPrimary: '#FFFFFF', danger: '#F87171', warning: '#EAB308',
  selectedSurface: '#13291F', overlay: 'rgba(0,0,0,0.65)',
} as const;

export const epidemiologyColors = {
  susceptible: '#22C55E', exposed: '#EAB308', infected: '#EF4444',
  recovered: '#60A5FA', deceased: '#94A3B8',
} as const;

export const scenarioColors = { a: '#FBBF24', b: '#60A5FA' } as const;
export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;
export const radius = { sm: 6, md: 10, lg: 14, pill: 999 } as const;
export const typography = {
  caption: { fontSize: 12, lineHeight: 18 },
  body: { fontSize: 14, lineHeight: 21 },
  button: { fontSize: 14, lineHeight: 20, fontWeight: '600' },
  section: { fontSize: 18, lineHeight: 24, fontWeight: '600' },
  title: { fontSize: 24, lineHeight: 32, fontWeight: '700' },
  metric: { fontSize: 28, lineHeight: 36, fontWeight: '700' },
} as const;
export const layout = { screenPadding: 16, minTouchTarget: 48 } as const;
export const theme = { colors, epidemiologyColors, scenarioColors, spacing, radius, typography, layout } as const;
export default theme;
