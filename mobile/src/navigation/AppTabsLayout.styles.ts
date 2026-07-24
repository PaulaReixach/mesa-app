import { StyleSheet } from 'react-native';

import { colors } from '../theme/colors';
import { shadows } from '../theme/layout';

export const tabNavigationColors = {
  active: colors.primary,
  inactive: colors.mutedStrong,
  border: colors.border,
  background: colors.surface,
} as const;

export const appTabsStyles = StyleSheet.create({
  primaryTabButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryTabIcon: {
    width: 58,
    height: 29,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
  },
  primaryTabIconActive: {
    backgroundColor: colors.primarySoft,
  },
  addTabButton: {
    flex: 1,
    height: 54,
    alignItems: 'center',
    justifyContent: 'flex-start',
    overflow: 'visible',
  },
  addCircleFrame: {
    width: 54,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -5,
    padding: 4,
    borderRadius: 27,
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
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: 23,
    backgroundColor: colors.primary,
  },
  addCirclePressed: {
    backgroundColor: colors.primaryPressed,
  },
});
