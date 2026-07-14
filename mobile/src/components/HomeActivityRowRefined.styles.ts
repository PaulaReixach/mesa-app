import { StyleSheet } from 'react-native';

import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';

export const activityStyles = StyleSheet.create({
  row: {
    minHeight: 62,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E8DDD6',
    backgroundColor: colors.surface,
  },
  avatarWrap: { position: 'relative', width: 42, height: 42 },
  avatar: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: 19,
    backgroundColor: '#F3DED5',
  },
  avatarImage: { width: '100%', height: '100%' },
  avatarInitial: { color: colors.primary, fontSize: 12, fontFamily: fonts.bold },
  badge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.surface,
    borderRadius: 9,
  },
  copy: { flex: 1, minWidth: 0 },
  sentence: { color: colors.muted, fontSize: 10, lineHeight: 15, fontFamily: fonts.regular },
  actor: { color: colors.primary, fontFamily: fonts.bold },
  strong: { color: colors.text, fontFamily: fonts.bold },
  group: { color: '#5D7444', fontFamily: fonts.bold },
  trailing: { minWidth: 54, alignItems: 'flex-end', gap: 5 },
  time: { color: colors.muted, fontSize: 8, fontFamily: fonts.regular },
  scorePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: '#FFF1DB',
  },
  scoreText: { color: colors.text, fontSize: 8, fontFamily: fonts.bold },
});
