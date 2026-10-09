import type { TextStyle } from 'react-native';

import { fonts } from './fonts';

// MESA type ramp (Inter only). Sizes come from the prototype; see DESIGN.md › Typography.
export const typography = {
  screenTitle: { fontFamily: fonts.semiBold, fontSize: 27, lineHeight: 33, letterSpacing: -0.9 },
  emptyTitle: { fontFamily: fonts.semiBold, fontSize: 25, lineHeight: 30, letterSpacing: -0.8 },
  featureTitle: { fontFamily: fonts.semiBold, fontSize: 23, lineHeight: 29, letterSpacing: -0.65 },
  sectionTitle: { fontFamily: fonts.semiBold, fontSize: 18, lineHeight: 24, letterSpacing: -0.35 },
  cardTitle: { fontFamily: fonts.semiBold, fontSize: 16, lineHeight: 22, letterSpacing: -0.1 },
  bodyStrong: { fontFamily: fonts.semiBold, fontSize: 14, lineHeight: 21 },
  body: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 21 },
  button: { fontFamily: fonts.semiBold, fontSize: 14, lineHeight: 20 },
  buttonSmall: { fontFamily: fonts.semiBold, fontSize: 13, lineHeight: 18 },
  secondary: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 20 },
  secondaryStrong: { fontFamily: fonts.medium, fontSize: 13, lineHeight: 20 },
  caption: { fontFamily: fonts.regular, fontSize: 12, lineHeight: 18 },
  label: { fontFamily: fonts.medium, fontSize: 12, lineHeight: 16 },
  tab: { fontFamily: fonts.medium, fontSize: 11, lineHeight: 14 },
  monogram: { fontFamily: fonts.semiBold, fontSize: 56, lineHeight: 60, letterSpacing: -1.5 },
  score: { fontFamily: fonts.semiBold, fontSize: 14, lineHeight: 21, fontVariant: ['tabular-nums'] },
} as const satisfies Record<string, TextStyle>;

export type TypographyVariant = keyof typeof typography;

/** Spanish decimal comma: 8.4 → "8,4". */
export function formatScore(score: number): string {
  return score.toFixed(1).replace('.', ',');
}
