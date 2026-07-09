import { StyleSheet } from 'react-native';

import { colors } from '../theme/colors';

export const quickActionStyles = StyleSheet.create({
  card: {
    position: 'relative',
    flex: 1,
    minWidth: 0,
    minHeight: 94,
    gap: 4,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E4D8D0',
    borderRadius: 18,
    backgroundColor: '#FDF9F8',
  },
  iconWrap: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
    borderRadius: 12,
    backgroundColor: '#F7E7DF',
  },
  iconWrapSage: { backgroundColor: '#EBF0E0' },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderRadius: 9,
    backgroundColor: '#F8E3DA',
  },
  badgeText: { color: colors.primary, fontSize: 8, fontWeight: '900' },
  title: { color: colors.text, fontSize: 10, fontWeight: '900' },
  subtitle: { color: colors.muted, fontSize: 8, lineHeight: 11 },
  pressed: { opacity: 0.74 },
});
