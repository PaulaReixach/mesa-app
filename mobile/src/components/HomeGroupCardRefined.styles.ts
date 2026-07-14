import { StyleSheet } from 'react-native';

import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';

export const groupCardStyles = StyleSheet.create({
  card: {
    width: '100%',
    height: 130,
    overflow: 'hidden',
    borderRadius: 21,
    backgroundColor: '#D7CEC8',
  },
  image: {
    flex: 1,
    overflow: 'hidden',
    borderRadius: 21,
  },
  imageRadius: {
    borderRadius: 21,
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(30, 22, 18, 0.35)',
  },
  privacyPill: {
    position: 'absolute',
    top: 14,
    left: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  privacyText: {
    color: '#617C4A',
    fontFamily: fonts.medium,
    fontSize: 11,
    lineHeight: 14,
  },
  bottomContent: {
    position: 'absolute',
    right: 56,
    bottom: 16,
    left: 14,
    gap: 2,
  },
  title: {
    color: colors.white,
    fontFamily: fonts.bold,
    fontSize: 21,
    lineHeight: 26,
    letterSpacing: -0.35,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    flex: 1,
    color: colors.white,
    fontFamily: fonts.medium,
    fontSize: 14,
    lineHeight: 18,
  },
  openButton: {
    position: 'absolute',
    right: 13,
    bottom: 35,
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 17,
    backgroundColor: 'rgba(34, 26, 22, 0.50)',
  },
  pressed: {
    opacity: 0.84,
    transform: [{ scale: 0.992 }],
  },
});
