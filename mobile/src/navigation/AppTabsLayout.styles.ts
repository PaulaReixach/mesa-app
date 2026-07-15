import { StyleSheet } from 'react-native';

import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';

export const tabNavigationColors = {
  active: colors.primary,
  inactive: colors.muted,
  border: colors.border,
  background: colors.surfaceElevated,
} as const;

export const appTabsStyles = StyleSheet.create({
  tabIconContainer: {
    width: 50,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 17,
  },
  tabIconContainerActive: {
    backgroundColor: '#F8E5DE',
  },
  tabLabel: {
    color: tabNavigationColors.inactive,
    fontFamily: fonts.medium,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: -0.15,
  },
  tabLabelActive: {
    color: tabNavigationColors.active,
    fontFamily: fonts.semiBold,
  },
  addTabButton: {
    flex: 1,
    height: 58,
    alignItems: 'center',
    justifyContent: 'flex-start',
    overflow: 'visible',
  },
  addTabButtonPressed: { transform: [{ scale: 0.95 }] },
  addSquareShadow: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#C94327',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.2,
    shadowRadius: 13,
    elevation: 9,
  },
  addSquare: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: 14,
  },
});
