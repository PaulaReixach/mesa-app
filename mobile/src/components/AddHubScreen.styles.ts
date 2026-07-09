import { Platform, StyleSheet } from 'react-native';

import { colors } from '../theme/colors';

const regularFont = Platform.select({
  ios: 'System',
  android: 'sans-serif',
  default: 'System',
});

const mediumFont = Platform.select({
  ios: 'System',
  android: 'sans-serif-medium',
  default: 'System',
});

export const addHubScreenStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FBF6F3',
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 18,
    paddingTop: 7,
    paddingBottom: 26,
    backgroundColor: '#FBF6F3',
  },
  header: {
    minHeight: 54,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  closeButton: {
    position: 'absolute',
    left: 0,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E8DED7',
    borderRadius: 22,
    backgroundColor: '#FFFDFC',
  },
  closeButtonCompact: {
    width: 38,
    height: 38,
    borderRadius: 19,
  },
  title: {
    color: '#171412',
    fontFamily: mediumFont,
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  titleCompact: {
    fontSize: 16,
  },
  actions: {
    gap: 11,
  },
  actionsCompact: {
    gap: 9,
  },
  tipSlot: {
    marginTop: 'auto',
    paddingTop: 20,
  },
  tipCard: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'stretch',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#EADFD6',
    borderRadius: 18,
    backgroundColor: '#FAF2E9',
  },
  tipCardCompact: {
    minHeight: 64,
    borderRadius: 17,
  },
  tipCopyRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    paddingLeft: 12,
    paddingVertical: 8,
    zIndex: 2,
  },
  tipIcon: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: 18,
  },
  tipIconCompact: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  tipIconImage: {
    width: '100%',
    height: '100%',
  },
  tipText: {
    flex: 1,
    color: '#625C58',
    fontFamily: regularFont,
    fontSize: 10.5,
    fontWeight: '400',
    lineHeight: 15.5,
  },
  tipTextCompact: {
    fontSize: 9.75,
    lineHeight: 14,
  },
  tipStrong: {
    color: colors.primary,
    fontFamily: mediumFont,
    fontWeight: '600',
  },
  illustration: {
    width: 132,
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  illustrationCompact: {
    width: 112,
  },
  illustrationImage: {
    width: 132,
    height: 72,
  },
  illustrationImageCompact: {
    width: 112,
    height: 64,
  },
  pressed: {
    opacity: 0.74,
  },
});
