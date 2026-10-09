// Scheme-independent tokens from the MESA prototype. Rationale: DESIGN.md › Layout.

export const space = {
  s1: 4,
  s2: 8,
  s3: 12,
  s4: 16,
  s5: 20,
  s6: 24,
  s8: 32,
} as const;

export const radius = {
  xs: 6,
  sm: 10,
  md: 12,
  lg: 15,
  xl: 18,
  full: 999,
} as const;

export const iconSize = {
  status: 12,
  inline: 14,
  link: 16,
  search: 18,
  nav: 22,
  state: 30,
} as const;

export const motion = {
  press: 100,
  state: 200,
  enter: 300,
} as const;

export const touchTarget = 44;

/** Screen side margin of the prototype. */
export const SCREEN_GUTTER = 22;

/** Screen side gutter: 22pt, reduced to 16pt on very narrow screens (< 340pt). */
export function screenGutter(width: number): number {
  return width < 340 ? space.s4 : SCREEN_GUTTER;
}

/** Extra touch area so small text actions reach 44pt without changing their look. */
export const textActionHitSlop = { top: 12, bottom: 12, left: 8, right: 8 } as const;
