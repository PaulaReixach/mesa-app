import { StyleSheet } from 'react-native';
import { colors, loginColors as homeColors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import { spacing } from '../theme/layout';

export const activityStyles = StyleSheet.create({
  row: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    padding: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    backgroundColor: colors.white
  },
  avatar: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: 16,
    backgroundColor: colors.primarySoft
  },
  avatarImage: {
    width: '100%',
    height: '100%'
  },
  avatarInitial: {
    color: homeColors.primary,
    fontFamily: fonts.medium,
    fontSize: 14
  },
  copy: {
    flex: 1,
    minWidth: 0,
    gap: spacing.xxs
  },
  sentence: {
    color: homeColors.muted,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 21
  },
  actor: {
    color: homeColors.primary,
    fontFamily: fonts.semiBold
  },
  strong: {
    color: homeColors.text,
    fontFamily: fonts.semiBold
  },
  group: {
    color: colors.olivePressed,
    fontFamily: fonts.semiBold
  },
  time: {
    color: homeColors.muted,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 19
  },
});
