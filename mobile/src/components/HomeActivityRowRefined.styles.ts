import { StyleSheet } from 'react-native';

import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';

export const activityStyles = StyleSheet.create({
  row: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E8DDD6',
    backgroundColor: '#FDF9F8',
  },
  avatarWrap: { position: 'relative', width: 35, height: 35 },
  avatar: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: 16,
    backgroundColor: '#F3DED5',
  },
  avatarImage: { width: '100%', height: '100%' },
  avatarInitial: { color: colors.primary, fontSize: 11, fontFamily: fonts.bold },
  badge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FDF9F8',
    borderRadius: 8,
  },
  copy: { flex: 1, minWidth: 0 },
  sentence: { color: colors.muted, fontSize: 8.5, lineHeight: 13 },
  actor: { color: colors.primary, fontFamily: fonts.bold },
  strong: { color: colors.text, fontFamily: fonts.bold },
  group: { color: '#5D7444', fontFamily: fonts.bold },
  trailing: { minWidth: 50, alignItems: 'flex-end', gap: 4 },
  time: { color: colors.muted, fontSize: 7 },
  scorePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: '#FFF1DB',
  },
  scoreText: { color: colors.text, fontSize: 7, fontFamily: fonts.bold },
});
