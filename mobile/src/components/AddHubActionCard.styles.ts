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

export const addHubActionStyles = StyleSheet.create({
  card: {
    minHeight: 106,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E8DED7',
    borderRadius: 22,
    backgroundColor: '#FFFDFC',
  },
  cardCompact: {
    minHeight: 94,
    gap: 11,
    paddingHorizontal: 13,
    paddingVertical: 10,
    borderRadius: 20,
  },
  cardPressed: {
    opacity: 0.76,
    transform: [{ scale: 0.994 }],
  },
  iconCircle: {
    width: 72,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: 36,
  },
  iconCircleCompact: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  iconImage: {
    width: '100%',
    height: '100%',
  },
  copy: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  title: {
    color: colors.text,
    fontFamily: mediumFont,
    fontSize: 16.5,
    fontWeight: '600',
    letterSpacing: -0.15,
  },
  titleCompact: {
    fontSize: 15.5,
  },
  subtitle: {
    color: '#706A66',
    fontFamily: regularFont,
    fontSize: 11,
    fontWeight: '400',
    lineHeight: 16,
  },
  subtitleCompact: {
    fontSize: 10.25,
    lineHeight: 14.5,
  },
});
