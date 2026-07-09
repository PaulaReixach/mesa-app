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
    backgroundColor: '#FFFCF8',
  },
  content: {
    flexGrow: 1,
    gap: 18,
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 26,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: {
    color: colors.primary,
    fontFamily: homeBrandFont,
    fontSize: 30,
    fontWeight: '900',
    letterSpacing: -0.8,
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
    borderColor: '#EDE3DD',
    borderRadius: 22,
    backgroundColor: '#F4DFD5',
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
    gap: 5,
  },
  title: {
    color: colors.text,
    fontSize: 27,
    fontWeight: '900',
    letterSpacing: -0.7,
  },
  subtitle: {
    maxWidth: 310,
    color: colors.muted,
    fontSize: 12,
    lineHeight: 18,
  },
  searchBar: {
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#E7DDD7',
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
  },
  searchText: {
    flex: 1,
    color: '#A09994',
    fontSize: 12,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 8,
  },
  section: {
    gap: 10,
  },
  sectionHeader: {
    minHeight: 23,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '900',
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
    borderColor: '#EDE3DD',
    borderRadius: 17,
    backgroundColor: colors.surface,
  },
  emptyCard: {
    minHeight: 76,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    padding: 12,
    borderWidth: 1,
    borderColor: '#EDE3DD',
    borderRadius: 17,
    backgroundColor: colors.surface,
  },
  emptyIcon: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
    backgroundColor: '#FBE9E2',
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
    borderColor: '#EDE3DD',
    borderRadius: 20,
    backgroundColor: colors.surface,
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
    borderRadius: 17,
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
