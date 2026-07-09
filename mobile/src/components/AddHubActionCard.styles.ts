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
    minHeight: 112,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#E8DED7',
    borderRadius: 23,
    backgroundColor: '#FFFDFC',
  },
  cardCompact: {
    minHeight: 102,
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 21,
  },
  cardPressed: {
    opacity: 0.76,
    transform: [{ scale: 0.994 }],
  },
  iconCircle: {
    width: 76,
    height: 76,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: 38,
  },
  iconCircleCompact: {
    width: 68,
    height: 68,
    borderRadius: 34,
  },
  iconImage: {
    width: '100%',
    height: '100%',
  },
  copy: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  title: {
    color: colors.text,
    fontFamily: mediumFont,
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  titleCompact: {
    fontSize: 16,
  },
  subtitle: {
    color: '#706A66',
    fontFamily: regularFont,
    fontSize: 11.5,
    fontWeight: '400',
    lineHeight: 17,
  },
  subtitleCompact: {
    fontSize: 10.5,
    lineHeight: 15,
  },
});
