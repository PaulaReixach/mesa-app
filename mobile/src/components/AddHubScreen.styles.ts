import { StyleSheet } from 'react-native';

import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import { radii, shadows } from '../theme/layout';

export const addHubScreenStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flexGrow: 1,
    gap: 24,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 118,
  },
  header: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  closeButton: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 21,
    backgroundColor: colors.surface,
  },
  headerTitle: {
    color: colors.text,
    fontFamily: fonts.semiBold,
    fontSize: 16,
  },
  hero: {
    gap: 6,
    paddingTop: 4,
  },
  eyebrow: {
    color: colors.primary,
    fontFamily: fonts.semiBold,
    fontSize: 11,
  },
  title: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 30,
    lineHeight: 36,
    letterSpacing: -0.9,
  },
  subtitle: {
    maxWidth: 330,
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 18,
  },
  featuredGrid: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 10,
  },
  featuredAction: {
    position: 'relative',
    minWidth: 0,
    minHeight: 198,
    flex: 1,
    justifyContent: 'space-between',
    gap: 14,
    padding: 15,
    overflow: 'hidden',
    borderWidth: 1,
    borderRadius: radii.xl,
  },
  featuredActionTerracotta: {
    borderColor: '#EACCC1',
    backgroundColor: colors.primarySoft,
  },
  featuredActionOlive: {
    borderColor: '#D7DEC5',
    backgroundColor: colors.oliveSoft,
  },
  featuredIcon: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.72)',
  },
  featuredIconOlive: {
    backgroundColor: 'rgba(255,255,255,0.68)',
  },
  featuredCopy: {
    flex: 1,
    justifyContent: 'flex-end',
    gap: 6,
  },
  featuredTitle: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 16,
    lineHeight: 20,
    letterSpacing: -0.25,
  },
  featuredSubtitle: {
    color: colors.mutedStrong,
    fontFamily: fonts.regular,
    fontSize: 10,
    lineHeight: 15,
  },
  featuredArrow: {
    position: 'absolute',
    top: 16,
    right: 14,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.62)',
  },
  featuredArrowOlive: {
    backgroundColor: 'rgba(255,255,255,0.58)',
  },
  section: {
    gap: 12,
  },
  sectionHeading: {
    gap: 2,
  },
  sectionTitle: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 17,
    letterSpacing: -0.25,
  },
  sectionCaption: {
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 10,
  },
  secondaryList: {
    gap: 10,
  },
  secondaryAction: {
    minHeight: 78,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 13,
    paddingVertical: 11,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
    ...shadows.card,
  },
  secondaryIcon: {
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
    backgroundColor: colors.primarySoft,
  },
  secondaryCopy: {
    flex: 1,
    gap: 3,
  },
  secondaryTitle: {
    color: colors.text,
    fontFamily: fonts.semiBold,
    fontSize: 13,
  },
  secondarySubtitle: {
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 9,
    lineHeight: 13,
  },
  tipCard: {
    minHeight: 82,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 11,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EFD8B8',
    borderRadius: radii.lg,
    backgroundColor: colors.amberSoft,
  },
  tipIcon: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.62)',
  },
  tipCopy: {
    flex: 1,
    gap: 4,
  },
  tipTitle: {
    color: colors.text,
    fontFamily: fonts.semiBold,
    fontSize: 11,
  },
  tipText: {
    color: colors.mutedStrong,
    fontFamily: fonts.regular,
    fontSize: 9,
    lineHeight: 14,
  },
  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.988 }],
  },
});
