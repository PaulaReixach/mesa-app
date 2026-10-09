import { StyleSheet } from 'react-native';
import { colors, loginColors as homeColors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import { radii, spacing } from '../theme/layout';

export const recommendationStyles = StyleSheet.create({
  card: {
    gap: spacing.sm,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radii.lg,
    backgroundColor: colors.white
  },
  main: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm
  },
  artwork: {
    width: 72,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.md,
    backgroundColor: colors.primarySoft
  },
  copy: {
    flex: 1,
    minWidth: 0,
    gap: spacing.xxs
  },
  title: {
    color: homeColors.text,
    fontFamily: fonts.semiBold,
    fontSize: 18,
    lineHeight: 25
  },
  location: {
    color: homeColors.muted,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20
  },
  description: {
    color: homeColors.muted,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 21
  },
  rating: {
    color: homeColors.primary,
    fontFamily: fonts.semiBold,
    fontSize: 14,
    lineHeight: 21
  },
  pressed: { backgroundColor: homeColors.surface },
});
