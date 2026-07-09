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
    backgroundColor: '#FDF8F4',
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 18,
    backgroundColor: '#FDF8F4',
  },
  header: {
    minHeight: 58,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  closeButton: {
    position: 'absolute',
    left: 0,
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E8DED7',
    borderRadius: 24,
    backgroundColor: '#FFFDFC',
  },
  closeButtonCompact: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  title: {
    color: '#171412',
    fontFamily: mediumFont,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.25,
  },
  titleCompact: {
    fontSize: 17,
  },
  actions: {
    gap: 12,
  },
  actionsCompact: {
    gap: 10,
  },
  tipCard: {
    minHeight: 84,
    flexDirection: 'row',
    alignItems: 'stretch',
    marginTop: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#EADFD6',
    borderRadius: 19,
    backgroundColor: '#FAF2E9',
  },
  tipCardCompact: {
    minHeight: 76,
    marginTop: 12,
    borderRadius: 18,
  },
  tipCopyRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingLeft: 13,
    paddingVertical: 10,
    zIndex: 2,
  },
  tipIcon: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: 21,
  },
  tipIconCompact: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  tipIconImage: {
    width: '100%',
    height: '100%',
  },
  tipText: {
    flex: 1,
    color: '#625C58',
    fontFamily: regularFont,
    fontSize: 11.5,
    fontWeight: '400',
    lineHeight: 17,
  },
  tipTextCompact: {
    fontSize: 10.5,
    lineHeight: 15,
  },
  tipStrong: {
    color: colors.primary,
    fontFamily: mediumFont,
    fontWeight: '700',
  },
  illustration: {
    width: 148,
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  illustrationCompact: {
    width: 124,
  },
  illustrationImage: {
    width: 148,
    height: 84,
  },
  illustrationImageCompact: {
    width: 124,
    height: 76,
  },
  pressed: {
    opacity: 0.74,
  },
});
