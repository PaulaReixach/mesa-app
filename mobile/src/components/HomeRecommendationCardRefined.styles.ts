import { StyleSheet } from 'react-native';

import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';

export const recommendationStyles = StyleSheet.create({
  card: {
    minHeight: 102,
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
    width: 82,
    height: 82,
    overflow: 'hidden',
    borderRadius: 15,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  copy: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  eyebrow: {
    color: colors.primary,
    fontFamily: fonts.semiBold,
    fontSize: 9,
    lineHeight: 13,
  },
  title: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 17,
    lineHeight: 21,
  },
  metaRow: {
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  location: {
    flexShrink: 1,
    color: colors.mutedStrong,
    fontFamily: fonts.medium,
    fontSize: 10,
    lineHeight: 13,
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.borderStrong,
  },
  groupName: {
    flexShrink: 1,
    color: colors.olive,
    fontFamily: fonts.semiBold,
    fontSize: 10,
    lineHeight: 13,
  },
  description: {
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 9,
    lineHeight: 13,
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
