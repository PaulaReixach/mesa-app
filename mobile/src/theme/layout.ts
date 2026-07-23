import { Platform } from 'react-native';

import { colors } from './colors';

export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  section: 40,
} as const;

export const radii = {
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 30,
  round: 999,
} as const;

export const touchTargets = {
  minimum: 44,
  comfortable: 52,
} as const;

export const shadows = {
  card: Platform.select({
    ios: {
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 7 },
      shadowOpacity: 0.07,
      shadowRadius: 18,
    },
    android: {
      elevation: 2,
    },
    default: {
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 7 },
      shadowOpacity: 0.07,
      shadowRadius: 18,
    },
  }),
  floating: Platform.select({
    ios: {
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.13,
      shadowRadius: 24,
    },
    android: {
      elevation: 6,
    },
    default: {
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.13,
      shadowRadius: 24,
    },
  }),
} as const;
