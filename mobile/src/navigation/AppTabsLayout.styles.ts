import { StyleSheet } from 'react-native';

import { colors } from '../theme/colors';
import { shadows } from '../theme/layout';

export const tabNavigationColors = {
  active: colors.primary,
  inactive: colors.mutedStrong,
  border: colors.border,
  background: colors.surfaceElevated,
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
    backgroundColor: colors.primarySoft,
  },
  addTabButton: {
    flex: 1,
    height: 60,
    alignItems: 'center',
    justifyContent: 'flex-start',
    overflow: 'visible',
  },
  addCircleFrame: {
    width: 58,
    height: 58,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -6,
    padding: 4,
    borderRadius: 29,
    backgroundColor: colors.surfaceElevated,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    ...shadows.floating,
  },
  addCircleFramePressed: {
    opacity: 0.94,
    transform: [{ scale: 0.985 }],
  },
  addCircle: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: 25,
    backgroundColor: colors.primary,
  },
  addCirclePressed: {
    backgroundColor: colors.primaryPressed,
  },
});
