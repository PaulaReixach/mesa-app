import { StyleSheet } from 'react-native';

import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';

export const addHubActionStyles = StyleSheet.create({
  card: {
    minHeight: 108,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderWidth: 1,
    borderColor: '#E8DED7',
    borderRadius: 23,
    backgroundColor: '#FFFDFC',
  },
  cardCompact: {
    minHeight: 102,
    gap: 14,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 22,
  },
  cardPressed: {
    opacity: 0.76,
    transform: [{ scale: 0.994 }],
  },
  iconCircle: {
    width: 74,
    height: 74,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 37,
  },
  iconCircleCompact: {
    width: 68,
    height: 68,
    borderRadius: 34,
  },
  copy: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  title: {
    color: colors.text,
    fontFamily: fonts.semiBold,
    fontSize: 17.5,
    lineHeight: 22,
    letterSpacing: -0.25,
  },
  titleCompact: {
    fontSize: 17,
    lineHeight: 21,
  },
  subtitle: {
    color: '#706A66',
    fontFamily: fonts.regular,
    fontSize: 14.5,
    lineHeight: 20,
  },
  subtitleCompact: {
    fontSize: 14,
    lineHeight: 19,
  },
});
