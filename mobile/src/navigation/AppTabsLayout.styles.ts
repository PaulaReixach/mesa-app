import { createThemedStyles, fonts, typography } from '../theme';

// MESA tab bar (DESIGN.md › Components): olive on a sage pill when selected; terracotta "Añadir".
export const useAppTabsStyles = createThemedStyles(({ colors }) => ({
  primaryTabButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryTabIcon: {
    width: 62,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  primaryTabIconActive: {
    backgroundColor: colors.secondarySoft,
  },
  addTabButton: {
    flex: 1,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    overflow: 'visible',
  },
  addCircleFramePressed: {
    backgroundColor: colors.accentPressed,
  },
  addCircle: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: 18,
    backgroundColor: colors.accent,
  },
  tabLabel: { ...typography.tab, textAlign: 'center' },
  tabLabelSelected: { fontFamily: fonts.semiBold },
}));
