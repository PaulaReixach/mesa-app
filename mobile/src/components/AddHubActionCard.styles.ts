import { StyleSheet } from 'react-native';

import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';

export const addHubActionStyles = StyleSheet.create({
  card: {
    minHeight: 104,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E8DED7',
    borderRadius: 22,
    backgroundColor: '#FFFDFC',
  },
  cardCompact: {
    minHeight: 98,
    gap: 14,
    paddingHorizontal: 15,
    paddingVertical: 11,
    borderRadius: 21,
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
    borderRadius: 36,
  },
  iconCircleCompact: {
    width: 66,
    height: 66,
    borderRadius: 33,
  },
  copy: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  title: {
    color: colors.text,
    fontFamily: fonts.semiBold,
    fontSize: 17,
    lineHeight: 21,
    letterSpacing: -0.2,
  },
  titleCompact: {
    fontSize: 16.5,
    lineHeight: 20.5,
  },
  subtitle: {
    color: '#706A66',
    fontFamily: fonts.regular,
    fontSize: 13.2,
    lineHeight: 18,
  },
  subtitleCompact: {
    fontSize: 12.8,
    lineHeight: 17,
  },
});
