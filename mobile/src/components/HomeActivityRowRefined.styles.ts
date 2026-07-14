import { StyleSheet } from 'react-native';

import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';

export const activityStyles = StyleSheet.create({
  row: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    paddingHorizontal: 13,
    paddingVertical: 5,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5DAD4',
    backgroundColor: '#FFFFFF',
  },
  avatar: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: 16,
    backgroundColor: '#F5DDD5',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarInitial: {
    color: '#C94B2E',
    fontFamily: fonts.medium,
    fontSize: 12,
  },
  copy: {
    flex: 1,
    minWidth: 0,
  },
  sentence: {
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 10,
    lineHeight: 15,
  },
  actor: {
    color: '#D34A2B',
    fontFamily: fonts.bold,
  },
  strong: {
    color: colors.text,
    fontFamily: fonts.bold,
  },
  group: {
    color: colors.olive,
    fontFamily: fonts.semiBold,
  },
  time: {
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 9,
  },
});
