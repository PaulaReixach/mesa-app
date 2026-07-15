import { StyleSheet } from 'react-native';

import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';

export const recommendationStyles = StyleSheet.create({
  card: {
    height: 84,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    padding: 8,
    borderWidth: 1,
    borderColor: '#E2D7D1',
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
  },
  artwork: {
    width: 91,
    height: 68,
    overflow: 'hidden',
    borderRadius: 12,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  copy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  eyebrow: {
    color: '#D34A2B',
    fontFamily: fonts.medium,
    fontSize: 9,
    lineHeight: 12,
  },
  title: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 16,
    lineHeight: 20,
  },
  location: {
    color: colors.text,
    fontFamily: fonts.medium,
    fontSize: 10,
    lineHeight: 13,
  },
  description: {
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 9,
    lineHeight: 12,
  },
  trailing: {
    alignItems: 'flex-end',
  },
  statusPill: {
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#E8EEDC',
  },
  statusText: {
    color: '#5E714A',
    fontFamily: fonts.medium,
    fontSize: 8,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.992 }],
  },
});
