import { StyleSheet } from 'react-native';

import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import { radii, shadows } from '../theme/layout';

export const quickActionStyles = StyleSheet.create({
  card: {
    position: 'relative',
    flex: 1,
    minWidth: 0,
    minHeight: 112,
    gap: 6,
    padding: 13,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
    ...shadows.card,
  },
  iconWrap: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 3,
    borderRadius: 14,
    backgroundColor: colors.primarySoft,
  },
  iconWrapSage: { backgroundColor: colors.oliveSoft },
  badge: {
    position: 'absolute',
    top: 11,
    right: 11,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderRadius: 10,
    backgroundColor: colors.primary,
  },
  badgeText: { color: colors.white, fontSize: 8, fontFamily: fonts.bold },
  title: { color: colors.text, fontSize: 13, fontFamily: fonts.semiBold },
  subtitle: { color: colors.muted, fontSize: 10, lineHeight: 14, fontFamily: fonts.regular },
  pressed: { opacity: 0.78, transform: [{ scale: 0.985 }] },
});
