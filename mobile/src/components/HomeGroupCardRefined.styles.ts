import { StyleSheet } from 'react-native';

import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';

export const groupCardStyles = StyleSheet.create({
  card: {
    minWidth: 0,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(73, 55, 46, 0.18)',
    borderRadius: 20,
    backgroundColor: '#D7CEC8',
  },
  gridCard: {
    height: 158,
  },
  wideCard: {
    width: '100%',
    height: 120,
  },
  image: {
    flex: 1,
    overflow: 'hidden',
    borderRadius: 20,
  },
  imageRadius: {
    borderRadius: 20,
  },
  overlay: {
    ...StyleSheet.absoluteFill,
  },
  privacyPill: {
    position: 'absolute',
    top: 11,
    left: 11,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 255, 255, 0.75)',
    borderRadius: 11,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
  },
  privacyText: {
    color: '#617C4A',
    fontFamily: fonts.medium,
    fontSize: 10,
    lineHeight: 13,
  },
  memberAvatarStack: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
  },
  memberAvatar: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    backgroundColor: '#F4DDD4',
  },
  memberAvatarOverlap: {
    marginLeft: -7,
  },
  memberAvatarImage: {
    width: '100%',
    height: '100%',
  },
  memberAvatarInitial: {
    color: '#B84A2D',
    fontFamily: fonts.bold,
    fontSize: 9,
    lineHeight: 11,
  },
  remainingMembers: {
    backgroundColor: '#6F7F55',
  },
  remainingMembersText: {
    color: colors.white,
    fontFamily: fonts.bold,
    fontSize: 9,
    lineHeight: 11,
  },
  bottomContent: {
    position: 'absolute',
    right: 12,
    bottom: 12,
    left: 12,
    gap: 7,
  },
  title: {
    color: colors.white,
    fontFamily: fonts.bold,
    letterSpacing: -0.2,
    textShadowColor: 'rgba(27, 20, 17, 0.24)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  gridTitle: {
    minHeight: 34,
    fontSize: 15,
    lineHeight: 17,
  },
  wideTitle: {
    fontSize: 19,
    lineHeight: 23,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 7,
  },
  locationRow: {
    minWidth: 0,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  locationText: {
    flex: 1,
    color: colors.white,
    fontFamily: fonts.medium,
    fontSize: 10,
    lineHeight: 14,
    textShadowColor: 'rgba(27, 20, 17, 0.24)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  pressed: {
    opacity: 0.84,
    transform: [{ scale: 0.992 }],
  },
});
