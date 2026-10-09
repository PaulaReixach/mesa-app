import { Platform, StyleSheet } from 'react-native';
import { colors, loginColors as homeColors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import { radii, spacing } from '../theme/layout';

export const homeBrandFont = Platform.select({
  ios: 'Georgia',
  android: 'serif',
  default: 'serif'
});
export const homeFocusStyle = {
  outlineColor: homeColors.primary,
  outlineWidth: 2,
  outlineOffset: 3
} as const;

export const homeStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: homeColors.hero
  },
  content: {
    flexGrow: 1,
    backgroundColor: homeColors.surface
  },
  header: { width: '100%' },
  heroBackground: {
    overflow: 'hidden', backgroundColor: homeColors.hero, paddingBottom: 48,
    borderBottomLeftRadius: radii.xl, borderBottomRightRadius: radii.xl,
  },
  topBar: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md
  },
  brand: {
    color: homeColors.cream,
    fontFamily: homeBrandFont,
    fontSize: 32,
    lineHeight: 40
  },
  topActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs
  },
  avatarButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.round
  },
  avatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20
  },
  avatarInitial: {
    width: 40, height: 40, borderRadius: 20, overflow: 'hidden', textAlign: 'center', lineHeight: 40,
    backgroundColor: homeColors.cream, color: homeColors.primary, fontFamily: fonts.semiBold, fontSize: 16,
  },
  heroCopy: {
    zIndex: 2,
    marginTop: spacing.md
  },
  greeting: {
    color: homeColors.cream,
    fontFamily: fonts.medium,
    fontSize: 14,
    lineHeight: 20
  },
  title: {
    marginTop: spacing.xs,
    color: homeColors.cream,
    fontFamily: fonts.bold,
    fontSize: 27,
    lineHeight: 34,
    letterSpacing: -0.5
  },
  subtitle: {
    marginTop: spacing.xs,
    color: homeColors.cream,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 21
  },
  illustration: {
    position: 'absolute',
    right: -56,
    bottom: -58,
    width: 150,
    height: 154,
    opacity: 0.6
  },
  headerControls: { marginTop: -26 },
  searchBar: {
    minHeight: 52, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm, borderRadius: radii.md, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: colors.white,
  },
  searchText: {
    flex: 1,
    color: homeColors.text,
    fontFamily: fonts.medium,
    fontSize: 16,
    lineHeight: 24
  },
  quickActions: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: spacing.sm,
    marginTop: spacing.md
  },
  stacked: { flexDirection: 'column' },
  dashboard: {
    gap: spacing.xl,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl
  },
  section: { gap: spacing.sm },
  sectionHeader: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.xs
  },
  sectionTitle: {
    flexShrink: 1,
    color: homeColors.text,
    fontFamily: fonts.bold,
    fontSize: 20,
    lineHeight: 28
  },
  sectionAction: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
    paddingHorizontal: spacing.xs,
    borderRadius: radii.sm
  },
  sectionActionText: {
    color: homeColors.primary,
    fontFamily: fonts.semiBold,
    fontSize: 14,
    lineHeight: 20
  },
  groupGrid: { gap: spacing.sm },
  activityList: {
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    backgroundColor: colors.white
  },
  emptyCard: {
    gap: spacing.md,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    backgroundColor: colors.white
  },
  emptyIcon: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.md,
    backgroundColor: colors.primarySoft
  },
  emptyCopy: { gap: spacing.xs },
  emptyTitle: {
    color: homeColors.text,
    fontFamily: fonts.semiBold,
    fontSize: 22,
    lineHeight: 29
  },
  emptySubtitle: {
    color: homeColors.muted,
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 23
  },
  secondaryAction: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xs,
    borderRadius: radii.sm
  },
  secondaryText: {
    color: homeColors.primary,
    fontFamily: fonts.semiBold,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center'
  },
  loadingCard: {
    gap: spacing.md,
    margin: spacing.xl
  },
  loadingText: {
    color: homeColors.muted,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 21
  },
  skeletonTitle: {
    width: '42%',
    height: 24,
    borderRadius: radii.sm,
    backgroundColor: colors.border
  },
  skeletonCard: {
    height: 152,
    borderRadius: radii.lg,
    backgroundColor: colors.surfaceMuted
  },
  errorCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginHorizontal: spacing.xl,
    marginTop: spacing.xl,
    padding: spacing.md,
    borderRadius: radii.md,
    backgroundColor: colors.dangerSoft
  },
  errorIcon: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center'
  },
  errorCopy: {
    flex: 1,
    gap: spacing.xs
  },
  errorTitle: {
    color: colors.danger,
    fontFamily: fonts.semiBold,
    fontSize: 16,
    lineHeight: 24
  },
  errorText: {
    color: homeColors.muted,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 21
  },
  retryButton: {
    minHeight: 48,
    alignSelf: 'flex-start',
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
    borderRadius: radii.sm
  },
  retryText: {
    color: homeColors.primary,
    fontFamily: fonts.semiBold,
    fontSize: 15,
    lineHeight: 22
  },
  pressed: { opacity: 0.78 },
});
