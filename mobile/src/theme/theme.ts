/** PeriferiaLab — tokens visuais independentes do motor. */
export const darkColors = {
  background: '#0D1117', surface: '#161B22', control: '#21262D',
  border: '#30363D', controlBorder: '#64748B', accent: '#4ADE80', primary: '#237A32',
  text: '#F0F6FC', muted: '#B0BAC4', info: '#60A5FA',
  onPrimary: '#FFFFFF', danger: '#F87171', warning: '#EAB308',
  selectedSurface: '#13291F', overlay: 'rgba(0,0,0,0.65)',
};
export type ThemeColors = typeof darkColors;
export const lightColors: ThemeColors = {
  background: '#F1F5F9', surface: '#FFFFFF', control: '#E2E8F0',
  border: '#64748B', controlBorder: '#64748B', accent: '#166534', primary: '#166534',
  text: '#172033', muted: '#475569', info: '#1D4ED8',
  onPrimary: '#FFFFFF', danger: '#B91C1C', warning: '#854D0E',
  selectedSurface: '#DCFCE7', overlay: 'rgba(0,0,0,0.45)',
};
export const epidemiologyColors = {
  susceptible: '#22C55E', exposed: '#EAB308', infected: '#EF4444',
  recovered: '#60A5FA', deceased: '#94A3B8',
};
export const scenarioColors = { a: '#FBBF24', b: '#60A5FA' };
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
export const colors = darkColors; // compatibilidade durante a migração
export const darkTheme = { colors, epidemiologyColors, scenarioColors, spacing, radius, typography, layout };
export const lightTheme: typeof darkTheme = {
  ...darkTheme, colors: lightColors,
  epidemiologyColors: { susceptible: '#15803D', exposed: '#A16207', infected: '#B91C1C', recovered: '#1D4ED8', deceased: '#475569' },
  scenarioColors: { a: '#92400E', b: '#1D4ED8' },
};
export type Theme = typeof darkTheme;
export type ThemeMode = 'light' | 'dark' | 'system';
export const theme = darkTheme;
export default theme;
