import { StyleSheet } from 'react-native';

import { colors } from '../theme/colors';

export const addHubActionStyles = StyleSheet.create({
  card: {
    minHeight: 106,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderWidth: 1,
    borderColor: '#E8DED7',
    borderRadius: 23,
    backgroundColor: '#FFFDFC',
  },
  cardCompact: {
    minHeight: 104,
    gap: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 22,
  },
  cardPressed: {
    opacity: 0.76,
    transform: [{ scale: 0.994 }],
  },
  iconCircle: {
    width: 76,
    height: 76,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 38,
  },
  iconCircleCompact: {
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  copy: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  title: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.25,
  },
  titleCompact: {
    fontSize: 19,
  },
  subtitle: {
    color: '#706A66',
    fontSize: 15.5,
    fontWeight: '400',
    lineHeight: 21,
  },
  subtitleCompact: {
    fontSize: 15,
    lineHeight: 20,
  },
});
