import { useColorScheme } from 'react-native';

import {
  darkColors,
  darkCoverTones,
  darkElevation,
  darkStatusColors,
  lightColors,
  lightCoverTones,
  lightElevation,
  lightStatusColors,
  type ColorScheme,
  type CoverTone,
  type Elevation,
  type StatusColors,
  type ThemeColors,
} from './palette';

export type Theme = {
  scheme: ColorScheme;
  colors: ThemeColors;
  status: StatusColors;
  elevation: Elevation;
  cover: CoverTone[];
};

const themes: Record<ColorScheme, Theme> = {
  light: { scheme: 'light', colors: lightColors, status: lightStatusColors, elevation: lightElevation, cover: lightCoverTones },
  dark: { scheme: 'dark', colors: darkColors, status: darkStatusColors, elevation: darkElevation, cover: darkCoverTones },
};

// Development-only override to review migrated screens in dark mode while app.json still
// forces light mode (see DESIGN.md › Components › Modo claro y oscuro). Ignored in production builds.
const forcedScheme: ColorScheme | null = __DEV__
  && (process.env.EXPO_PUBLIC_COLOR_SCHEME === 'dark' || process.env.EXPO_PUBLIC_COLOR_SCHEME === 'light')
  ? process.env.EXPO_PUBLIC_COLOR_SCHEME
  : null;

export function useTheme(): Theme {
  const systemScheme = useColorScheme();
  return themes[forcedScheme ?? (systemScheme === 'dark' ? 'dark' : 'light')];
}
