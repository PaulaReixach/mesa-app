import { StyleSheet } from 'react-native';

import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';

export const recommendationStyles = StyleSheet.create({
  card: {
    minHeight: 96,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    padding: 9,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    backgroundColor: colors.surfaceElevated,
  },
  artwork: {
    width: 76,
    height: 76,
    overflow: 'hidden',
    borderRadius: 14,
  },
  image: {
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
    fontFamily: fonts.bold,
    fontSize: 17,
    lineHeight: 21,
  },
  meta: {
    color: colors.mutedStrong,
    fontFamily: fonts.medium,
    fontSize: 11,
    lineHeight: 15,
  },
  savedLabel: {
    color: colors.olive,
    fontFamily: fonts.medium,
    fontSize: 10,
    lineHeight: 14,
  },
  scorePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: colors.oliveSoft,
  },
  scoreText: {
    color: '#5E714A',
    fontFamily: fonts.semiBold,
    fontSize: 10,
    lineHeight: 13,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.992 }],
  },
});
