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
    width: 54,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -19,
    borderWidth: 5,
    borderColor: tabNavigationColors.background,
    borderRadius: 27,
    backgroundColor: colors.primary,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 9 },
    shadowOpacity: 0.22,
    shadowRadius: 16,
    elevation: 10,
  },
});
