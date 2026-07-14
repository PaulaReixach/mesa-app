import { StyleSheet } from 'react-native';

import { colors } from '../theme/colors';

export const tabNavigationColors = {
  active: colors.primary,
  inactive: colors.muted,
  border: colors.border,
  background: colors.surfaceElevated,
} as const;

export const appTabsStyles = StyleSheet.create({
  addTabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  addTabButtonPressed: { transform: [{ scale: 0.95 }] },
  addCircle: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -9,
    borderWidth: 5,
    borderColor: tabNavigationColors.background,
    borderRadius: 26,
    backgroundColor: '#D84C2B',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 10,
  },
});
