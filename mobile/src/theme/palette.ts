import type { GroupRestaurantStatus } from '../types/restaurant';

// MESA semantic color roles. Values, sources and contrast checks: DESIGN.md › Colors.

export type ColorScheme = 'light' | 'dark';

export type ThemeColors = {
  background: string;
  surface: string;
  surfaceSecondary: string;
  surfaceElevated: string;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  iconMuted: string;
  separator: string;
  border: string;
  borderInput: string;
  overlay: string;
  accent: string;
  accentPressed: string;
  accentSoft: string;
  onAccent: string;
  onAccentSoft: string;
  accentDisabled: string;
  onAccentDisabled: string;
  secondary: string;
  secondarySoft: string;
  onSecondarySoft: string;
  tint: string;
  rating: string;
  success: string;
  successSoft: string;
  danger: string;
  dangerSoft: string;
};

export type StatusColors = Record<GroupRestaurantStatus, { foreground: string; background: string }>;

export type Elevation = {
  /** Featured card shadow; none in dark mode. */
  feature: string | undefined;
  floating: string;
};

/** Brand tones for the typographic restaurant cover (DESIGN.md › Components). */
export type CoverTone = { background: string; ink: string };

export const lightColors: ThemeColors = {
  background: '#FCFAF7',
  surface: '#FFFFFF',
  surfaceSecondary: '#F1F2ED',
  surfaceElevated: '#FFFFFF',
  textPrimary: '#272924',
  textSecondary: '#687064',
  textTertiary: '#687064',
  iconMuted: '#87927E',
  separator: '#E2E4DC',
  border: '#E8E8E0',
  borderInput: '#8C9383',
  overlay: 'rgba(39, 41, 36, 0.40)',
  accent: '#A6412B',
  accentPressed: '#873421',
  accentSoft: '#F5E6DD',
  onAccent: '#FFFFFF',
  onAccentSoft: '#873421',
  accentDisabled: '#E5E5DF',
  onAccentDisabled: '#687064',
  secondary: '#4C5C3C',
  secondarySoft: '#E8EDDF',
  onSecondarySoft: '#4C5C3C',
  tint: '#F1F4EA',
  rating: '#4C5C3C',
  success: '#4E633D',
  successSoft: '#E8EDDF',
  danger: '#AA342A',
  dangerSoft: '#FCECE6',
};

export const darkColors: ThemeColors = {
  background: '#141612',
  surface: '#1D201B',
  surfaceSecondary: '#262A23',
  surfaceElevated: '#2A2E27',
  textPrimary: '#ECEEE6',
  textSecondary: '#A7AE9E',
  textTertiary: '#A7AE9E',
  iconMuted: '#7E8576',
  separator: '#33382F',
  border: '#2E3229',
  borderInput: '#6E7566',
  overlay: 'rgba(0, 0, 0, 0.60)',
  accent: '#E27A5F',
  accentPressed: '#CC6650',
  accentSoft: '#3B271F',
  onAccent: '#1E0F0A',
  onAccentSoft: '#F2B7A3',
  accentDisabled: '#2A2E27',
  onAccentDisabled: '#A7AE9E',
  secondary: '#B4C59D',
  secondarySoft: '#2B3424',
  onSecondarySoft: '#C7D6B2',
  tint: '#232920',
  rating: '#B4C59D',
  success: '#B4C99D',
  successSoft: '#263021',
  danger: '#FFAA9E',
  dangerSoft: '#3D1814',
};

export const lightStatusColors: StatusColors = {
  WANT_TO_GO: { foreground: '#8D553A', background: '#F4E8DE' },
  VISITED: { foreground: '#4E633D', background: '#E8EDDF' },
  FAVORITE: { foreground: '#A6412B', background: '#F5E6DD' },
  WANT_TO_REPEAT: { foreground: '#4E633D', background: '#E8EDDF' },
  DO_NOT_REPEAT: { foreground: '#A23D32', background: '#FAE7E2' },
  ARCHIVED: { foreground: '#5E655A', background: '#EAEBE6' },
};

export const darkStatusColors: StatusColors = {
  WANT_TO_GO: { foreground: '#E8B79A', background: '#3A2A20' },
  VISITED: { foreground: '#B4C99D', background: '#263021' },
  FAVORITE: { foreground: '#F0A99A', background: '#3B221D' },
  WANT_TO_REPEAT: { foreground: '#B4C99D', background: '#263021' },
  DO_NOT_REPEAT: { foreground: '#F0A99A', background: '#3B1E1A' },
  ARCHIVED: { foreground: '#B9BDB1', background: '#2A2D27' },
};

export const lightElevation: Elevation = {
  feature: '0 4px 15px rgba(39, 41, 36, 0.03)',
  floating: '0 6px 18px rgba(39, 41, 36, 0.10)',
};

export const darkElevation: Elevation = {
  feature: undefined,
  floating: '0 6px 18px rgba(0, 0, 0, 0.45)',
};

// Sage, soft terracotta, sand and mist.
export const lightCoverTones: CoverTone[] = [
  { background: '#E8EDDF', ink: '#4C5C3C' },
  { background: '#F5E6DD', ink: '#A6412B' },
  { background: '#F1ECE3', ink: '#8D553A' },
  { background: '#EEF1E8', ink: '#4C5C3C' },
];

export const darkCoverTones: CoverTone[] = [
  { background: '#2B3424', ink: '#B4C59D' },
  { background: '#3B271F', ink: '#E8A48E' },
  { background: '#332C24', ink: '#E2BC97' },
  { background: '#242A21', ink: '#B4C59D' },
];
