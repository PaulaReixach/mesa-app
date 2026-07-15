import { StyleSheet } from 'react-native';

import { colors } from '../theme/colors';

export const tabNavigationColors = {
  active: '#C84A30',
  inactive: '#6F6864',
  border: colors.border,
  background: '#FFFDFC',
} as const;

export const appTabsStyles = StyleSheet.create({
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
    backgroundColor: '#FFFDFC',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#F0E4DE',
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
  },
});
