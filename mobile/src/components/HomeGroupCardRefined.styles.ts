import { StyleSheet } from 'react-native';
import { colors, loginColors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import { radii, spacing } from '../theme/layout';

export const groupCardStyles = StyleSheet.create({
  card: {
    width: '100%',
    borderRadius: radii.lg,
    backgroundColor: loginColors.primaryPressed
  },
  image: {
    minHeight: 152,
    padding: spacing.md,
    gap: spacing.xl,
    justifyContent: 'space-between',
    overflow: 'hidden',
    borderRadius: radii.lg
  },
  imageRadius: { borderRadius: radii.lg },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(30, 22, 18, 0.58)'
  },
  privacyPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xxs,
    borderRadius: radii.sm,
    backgroundColor: loginColors.cream
  },
  privacyText: {
    color: colors.olivePressed,
    fontFamily: fonts.medium,
    fontSize: 13,
    lineHeight: 18
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm
  },
  bottomContent: {
    flex: 1,
    minWidth: 0,
    gap: spacing.xxs
  },
  title: {
    color: colors.white,
    fontFamily: fonts.bold,
    fontSize: 22,
    lineHeight: 28
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs
  },
  locationText: {
    flex: 1,
    color: colors.white,
    fontFamily: fonts.medium,
    fontSize: 14,
    lineHeight: 20
  },
  openButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center'
  },
  pressed: { opacity: 0.85 },
});
