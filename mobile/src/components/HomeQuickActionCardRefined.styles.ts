import { StyleSheet } from 'react-native';

import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';

export const quickActionStyles = StyleSheet.create({
  card: {
    position: 'relative',
    flex: 1,
    minWidth: 0,
    height: 58,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    paddingHorizontal: 13,
    borderWidth: 1,
    borderColor: '#E2D7D1',
    borderRadius: 15,
    backgroundColor: '#FFFCFA',
  },
  iconWrap: {
    width: 34,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapSage: {},
  copy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  badge: {
    position: 'absolute',
    top: 7,
    right: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderRadius: 8,
    backgroundColor: colors.primary,
  },
  badgeText: {
    color: colors.white,
    fontFamily: fonts.bold,
    fontSize: 7,
  },
  title: {
    color: '#29221F',
    fontFamily: fonts.semiBold,
    fontSize: 13,
    lineHeight: 17,
  },
  subtitle: {
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 10,
    lineHeight: 14,
  },
  pressed: {
    opacity: 0.76,
    transform: [{ scale: 0.985 }],
  },
});
