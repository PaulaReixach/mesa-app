import { Platform, StyleSheet } from 'react-native';

import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';

export const homeBrandFont = Platform.select({
  ios: 'Georgia-Bold',
  android: 'serif',
  default: 'serif',
});

export const homeStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FBF6F3',
  },
  content: {
    flexGrow: 1,
    gap: 16,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 28,
    backgroundColor: '#FBF6F3',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: {
    color: colors.primary,
    fontFamily: homeBrandFont,
    fontSize: 31,
    fontWeight: '900',
    letterSpacing: -0.9,
  },
  topActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  avatarButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E7DAD2',
    borderRadius: 22,
    backgroundColor: '#F3DED5',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarInitial: {
    color: colors.primary,
    fontFamily: fonts.bold,
    fontSize: 16,
  },
  hero: {
    gap: 6,
    marginTop: 2,
  },
  title: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 29,
    letterSpacing: -0.8,
  },
  subtitle: {
    maxWidth: 320,
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 19,
  },
  searchBar: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E3D6CE',
    borderRadius: 19,
    backgroundColor: '#FCF9F7',
  },
  searchText: {
    flex: 1,
    color: '#9B938E',
    fontFamily: fonts.regular,
    fontSize: 12,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 9,
  },
  section: {
    gap: 10,
  },
  sectionHeader: {
    minHeight: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  sectionTitle: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 16,
    letterSpacing: -0.2,
  },
  sectionAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sectionActionText: {
    color: '#5D7444',
    fontFamily: fonts.bold,
    fontSize: 10,
  },
  groupGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  activityList: {
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E4D8D0',
    borderRadius: 18,
    backgroundColor: '#FCF9F7',
  },
  emptyCard: {
    minHeight: 78,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    padding: 13,
    borderWidth: 1,
    borderColor: '#E4D8D0',
    borderRadius: 18,
    backgroundColor: '#FCF9F7',
  },
  emptyIcon: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
    backgroundColor: '#F7E7DF',
  },
  emptyCopy: {
    flex: 1,
    gap: 3,
  },
  emptyTitle: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 12,
  },
  emptySubtitle: {
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 9,
    lineHeight: 13,
  },
  loadingCard: {
    minHeight: 150,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: '#E4D8D0',
    borderRadius: 20,
    backgroundColor: '#FCF9F7',
  },
  loadingText: {
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 11,
  },
  errorCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 11,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F0C7BF',
    borderRadius: 18,
    backgroundColor: '#FFF2EF',
  },
  errorIcon: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: '#FBE2DD',
  },
  errorCopy: {
    flex: 1,
    gap: 4,
  },
  errorTitle: {
    color: colors.danger,
    fontFamily: fonts.bold,
    fontSize: 12,
  },
  errorText: {
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 9,
    lineHeight: 13,
  },
  retryText: {
    marginTop: 2,
    color: colors.primary,
    fontFamily: fonts.bold,
    fontSize: 9,
  },
  pressed: {
    opacity: 0.72,
  },
});
