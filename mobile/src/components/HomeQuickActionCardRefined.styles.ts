import { StyleSheet } from 'react-native';

import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';

export const quickActionStyles = StyleSheet.create({
  card: {
    position: 'relative',
    flex: 1,
    minWidth: 0,
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 11,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    backgroundColor: colors.surfaceElevated,
  },
  iconWrap: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 13,
    backgroundColor: colors.primarySoft,
  },
  iconWrapSage: {
    backgroundColor: colors.oliveSoft,
  },
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
    fontSize: 12,
    lineHeight: 16,
  },
  subtitle: {
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 9,
    lineHeight: 13,
  },
  pressed: {
    opacity: 0.76,
    transform: [{ scale: 0.985 }],
  },
});
