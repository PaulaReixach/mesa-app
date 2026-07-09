import { StyleSheet } from 'react-native';

import { colors } from '../theme/colors';

export const addHubActionStyles = StyleSheet.create({
  card: {
    minHeight: 126,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#E5DAD3',
    borderRadius: 25,
    backgroundColor: '#FDF9F8',
  },
  cardCompact: {
    minHeight: 104,
    gap: 15,
    paddingHorizontal: 17,
    paddingVertical: 13,
    borderRadius: 22,
  },
  cardPressed: {
    opacity: 0.76,
    transform: [{ scale: 0.992 }],
  },
  iconCircle: {
    width: 90,
    height: 90,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 45,
  },
  iconCircleCompact: {
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  iconCircleTerracotta: {
    backgroundColor: '#F8EEE8',
  },
  iconCircleSage: {
    backgroundColor: '#F0F3E8',
  },
  copy: {
    flex: 1,
    minWidth: 0,
    gap: 5,
  },
  title: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.35,
  },
  titleCompact: {
    fontSize: 17,
  },
  subtitle: {
    color: '#716B67',
    fontSize: 13,
    lineHeight: 19,
  },
  subtitleCompact: {
    fontSize: 11,
    lineHeight: 16,
  },
});
