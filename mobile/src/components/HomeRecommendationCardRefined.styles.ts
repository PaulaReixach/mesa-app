import { StyleSheet } from 'react-native';

import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import { radii, shadows } from '../theme/layout';

export const recommendationStyles = StyleSheet.create({
  card: {
    minHeight: 112,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
    ...shadows.card,
  },
  artwork: { width: 92, height: 92, overflow: 'hidden', borderRadius: radii.md },
  image: { width: '100%', height: '100%' },
  fallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E6E0CB',
  },
  copy: { flex: 1, minWidth: 0, gap: 3 },
  eyebrow: { color: colors.primary, fontSize: 8, fontFamily: fonts.semiBold },
  title: { color: colors.text, fontSize: 15, fontFamily: fonts.bold },
  category: { color: colors.text, fontSize: 10, fontFamily: fonts.medium },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: 1 },
  location: { flex: 1, color: colors.muted, fontSize: 8, fontFamily: fonts.regular },
  trailing: { alignItems: 'flex-end', gap: 5 },
  statusPill: {
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#EAF0DE',
  },
  statusText: { color: '#5D7444', fontSize: 7, fontFamily: fonts.semiBold },
  scorePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: '#FFF1DB',
  },
  scoreText: { color: colors.text, fontSize: 10, fontFamily: fonts.bold },
  pressed: { opacity: 0.8, transform: [{ scale: 0.99 }] },
});
