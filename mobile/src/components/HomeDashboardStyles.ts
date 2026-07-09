import { Platform, StyleSheet } from 'react-native';

import { colors } from '../theme/colors';

export const homeBrandFont = Platform.select({
  ios: 'Georgia-Bold',
  android: 'serif',
  default: 'serif',
});

export const homeStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FBF7F4',
  },
  content: {
    flexGrow: 1,
    gap: 16,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 28,
    backgroundColor: '#FBF7F4',
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
    fontSize: 16,
    fontWeight: '900',
  },
  hero: {
    gap: 6,
    marginTop: 2,
  },
  title: {
    color: colors.text,
    fontSize: 29,
    fontWeight: '900',
    letterSpacing: -0.8,
  },
  subtitle: {
    maxWidth: 320,
    color: colors.muted,
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
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: -0.2,
  },
  sectionAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sectionActionText: {
    color: '#5D7444',
    fontSize: 10,
    fontWeight: '900',
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
    fontSize: 12,
    fontWeight: '900',
  },
  emptySubtitle: {
    color: colors.muted,
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
    fontSize: 12,
    fontWeight: '900',
  },
  errorText: {
    color: colors.muted,
    fontSize: 9,
    lineHeight: 13,
  },
  retryText: {
    marginTop: 2,
    color: colors.primary,
    fontSize: 9,
    fontWeight: '900',
  },
  pressed: {
    opacity: 0.72,
  },
});
