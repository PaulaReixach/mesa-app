import { StyleSheet } from 'react-native';
import { colors, loginColors as homeColors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import { radii, spacing } from '../theme/layout';

export const quickActionStyles = StyleSheet.create({
  stacked: {
    flexBasis: 'auto',
    flexGrow: 0
  },
  card: {
    flexGrow: 1,
    flexBasis: 0,
    minWidth: 0,
    minHeight: 80,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radii.md,
    backgroundColor: colors.white
  },
  iconWrap: {
    width: 24,
    alignItems: 'center',
    justifyContent: 'center'
  },
  copy: {
    flex: 1,
    minWidth: 0,
    gap: spacing.xxs
  },
  title: {
    color: homeColors.text,
    fontFamily: fonts.semiBold,
    fontSize: 14,
    lineHeight: 20
  },
  subtitle: {
    color: homeColors.muted,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18
  },
  pressed: { backgroundColor: homeColors.surface },
});
