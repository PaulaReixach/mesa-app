import { StyleSheet } from 'react-native';

import { colors, loginColors } from '../theme/colors';
import { fonts } from '../theme/fonts';

export const tabNavigationColors = {
  active: loginColors.primary,
  inactive: '#6F6864',
  border: colors.border,
  background: '#FFFDFC',
} as const;

export const appTabsStyles = StyleSheet.create({
  primaryTabButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryTabIcon: {
    width: 62,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
  },
  primaryTabIconActive: {
    backgroundColor: '#F9E4DC',
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
    backgroundColor: loginColors.primaryPressed,
  },
  addCircle: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: 18,
    backgroundColor: loginColors.primary,
  },
  tabLabel: { fontSize: 11, lineHeight: 14, fontFamily: fonts.medium, textAlign: 'center' },
});
