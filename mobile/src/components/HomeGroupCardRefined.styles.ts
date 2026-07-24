import { StyleSheet } from 'react-native';

import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';

export const groupCardStyles = StyleSheet.create({
  card: {
    width: '100%',
    height: 142,
    overflow: 'hidden',
    borderRadius: 22,
    backgroundColor: '#D7CEC8',
  },
  image: {
    flex: 1,
    overflow: 'hidden',
    borderRadius: 22,
  },
  imageRadius: {
    borderRadius: 22,
  },
  overlay: {
    ...StyleSheet.absoluteFill,
  },
  privacyPill: {
    position: 'absolute',
    top: 13,
    left: 13,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 11,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  privacyText: {
    color: '#617C4A',
    fontFamily: fonts.medium,
    fontSize: 11,
    lineHeight: 14,
  },
  memberPill: {
    position: 'absolute',
    top: 13,
    right: 13,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 255, 255, 0.28)',
    borderRadius: 11,
    backgroundColor: 'rgba(34, 26, 22, 0.42)',
  },
  memberText: {
    color: colors.white,
    fontFamily: fonts.medium,
    fontSize: 10,
    lineHeight: 14,
  },
  bottomContent: {
    position: 'absolute',
    right: 60,
    bottom: 17,
    left: 15,
    gap: 3,
  },
  title: {
    color: colors.white,
    fontFamily: fonts.bold,
    fontSize: 22,
    lineHeight: 27,
    letterSpacing: -0.3,
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
    top: '50%',
    right: 14,
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -19,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 255, 255, 0.20)',
    borderRadius: 19,
    backgroundColor: 'rgba(34, 26, 22, 0.50)',
  },
  pressed: {
    opacity: 0.84,
    transform: [{ scale: 0.992 }],
  },
});
