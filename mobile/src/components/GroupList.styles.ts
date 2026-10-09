import { StyleSheet } from 'react-native';
import { colors, loginColors as palette } from '../theme/colors';
import { fonts } from '../theme/fonts';
import { radii, spacing } from '../theme/layout';

export const groupListStyles = StyleSheet.create({
  wrapper: {
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radii.lg,
    backgroundColor: colors.white
  },
  card: {
    minHeight: 112,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radii.lg
  },
  stackedCard: {
    flexDirection: 'column',
    alignItems: 'stretch'
  },
  stackedContent: { flex: 0 },
  stackedChevron: {
    position: 'absolute',
    right: spacing.md,
    top: spacing.xl
  },
  pressed: { backgroundColor: palette.surface },
  artwork: {
    width: 76,
    height: 76,
    borderRadius: radii.md,
    overflow: 'hidden',
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center'
  },
  smallArtwork: {
    width: 48,
    height: 48,
    borderRadius: radii.sm
  },
  image: {
    width: '100%',
    height: '100%'
  },
  initial: {
    fontFamily: fonts.semiBold,
    fontSize: 26,
    color: palette.primary
  },
  content: {
    flex: 1,
    minWidth: 0,
    gap: spacing.xs
  },
  title: {
    fontFamily: fonts.semiBold,
    fontSize: 18,
    lineHeight: 25,
    color: palette.text
  },
  description: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 21,
    color: palette.muted
  },
  meta: {
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 20,
    color: palette.muted
  },
  owner: {
    fontFamily: fonts.medium,
    fontSize: 14,
    lineHeight: 21,
    color: palette.primary
  },
  location: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs
  },
  locationText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 20,
    color: palette.muted
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs
  },
  badge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xxs,
    borderRadius: radii.sm,
    backgroundColor: colors.primarySoft
  },
  publicBadge: { backgroundColor: colors.oliveSoft },
  badgeText: {
    flexShrink: 1,
    fontFamily: fonts.medium,
    fontSize: 12,
    lineHeight: 18,
    color: palette.primaryPressed
  },
  publicText: { color: colors.olivePressed },
  manage: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.borderStrong,
    borderBottomLeftRadius: radii.lg,
    borderBottomRightRadius: radii.lg,
    backgroundColor: palette.surface
  },
  manageText: {
    flex: 1,
    fontFamily: fonts.semiBold,
    fontSize: 14,
    lineHeight: 21,
    color: palette.primary
  },
});
