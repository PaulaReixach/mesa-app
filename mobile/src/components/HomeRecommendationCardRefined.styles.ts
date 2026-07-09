import { StyleSheet } from 'react-native';

import { colors } from '../theme/colors';

export const recommendationStyles = StyleSheet.create({
  card: {
    minHeight: 82,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 7,
    borderWidth: 1,
    borderColor: '#E4D8D0',
    borderRadius: 18,
    backgroundColor: '#FDF9F8',
  },
  artwork: { width: 72, height: 66, overflow: 'hidden', borderRadius: 13 },
  image: { width: '100%', height: '100%' },
  fallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E6E0CB',
  },
  copy: { flex: 1, minWidth: 0, gap: 1 },
  eyebrow: { color: colors.primary, fontSize: 7, fontWeight: '900' },
  title: { color: colors.text, fontSize: 13, fontWeight: '900' },
  category: { color: colors.text, fontSize: 8, fontWeight: '600' },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: 1 },
  location: { flex: 1, color: colors.muted, fontSize: 6.5 },
  trailing: { alignItems: 'flex-end', gap: 5 },
  statusPill: {
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#EAF0DE',
  },
  statusText: { color: '#5D7444', fontSize: 6.5, fontWeight: '800' },
  scorePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: '#FFF1DB',
  },
  scoreText: { color: colors.text, fontSize: 9, fontWeight: '900' },
  pressed: { opacity: 0.74 },
});
