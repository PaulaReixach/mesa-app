import { StyleSheet } from 'react-native';

import { colors } from '../theme/colors';

export const tabNavigationColors = {
  active: colors.primary,
  inactive: '#8D8681',
  border: '#E6DAD2',
  background: '#FCF9F7',
} as const;

export const appTabsStyles = StyleSheet.create({
  addTabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addTabButtonPressed: { opacity: 0.78 },
  addCircle: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -5,
    borderWidth: 3,
    borderColor: tabNavigationColors.background,
    borderRadius: 22,
    backgroundColor: colors.primary,
    shadowColor: '#7E3B2A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.14,
    shadowRadius: 4,
    elevation: 4,
  },
});
