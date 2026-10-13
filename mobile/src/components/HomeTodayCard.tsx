import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { SymbolView } from 'expo-symbols';
import { AccessibilityInfo, Pressable, View } from 'react-native';

import { AppText } from './ui/AppText';
import { Avatar } from './ui/Avatar';
import { restaurantCategoryLabel } from './ui/Cover';
import { statusMeta } from './ui/StatusChip';
import { resolveApiUrl } from '../lib/api';
import type { SavedPlace } from '../lib/home-recommendation';
import { createThemedStyles, fonts, space, useTheme } from '../theme';
import type { GroupMember } from '../types/group-member';

const symbol = require('../../assets/images/brand/symbol.svg');

const WHITE = 'rgb(255, 255, 255)';
const WHITE_SOFT = 'rgba(255, 255, 255, 0.84)';
/** Dark mode keeps white text on the deep brand terracotta (the light accent of dark mode lacks contrast). */
const DEEP_TERRACOTTA = 'rgb(135, 52, 33)';
const BRAND_TERRACOTTA = 'rgb(166, 65, 43)';

/**
 * «Un sitio para hoy» (DESIGN.md › Inicio v2, artboard InicioV2): 384 pt card, radius 30.
 * Restaurants have no photo yet, so the background is the group's own cover photo (blurred,
 * with the charcoal veil). Without it: terracotta with the brand symbol large and faint.
 */
export function HomeTodayCard({ place, members, canPickAnother, onOpen, onPickAnother }: {
  place: SavedPlace;
  members: GroupMember[];
  canPickAnother: boolean;
  onOpen: () => void;
  onPickAnother: () => void;
}) {
  const styles = useStyles();
  const { scheme, status } = useTheme();
  const { group, restaurant: saved } = place;
  const restaurant = saved.restaurant;
  const photo = group.imageUrl ? resolveApiUrl(group.imageUrl) : null;
  const category = restaurantCategoryLabel(restaurant.category);
  const where = restaurant.city ?? group.city;
  const meta = category && where ? `${category} en ${where}` : category ?? where;
  const proposer = members.find(member => member.userId === saved.proposedByUserId);
  const chip = statusMeta[saved.status];
  const chipColors = status[saved.status];

  const pickAnother = () => {
    if (canPickAnother) onPickAnother();
    else AccessibilityInfo.announceForAccessibility('No hay otro sitio para proponer ahora');
  };

  return (
    <View style={[styles.card, { backgroundColor: photo ? 'rgb(30, 22, 18)' : scheme === 'dark' ? DEEP_TERRACOTTA : BRAND_TERRACOTTA }]}
      accessibilityLabel={`Un sitio para hoy: ${restaurant.name}${meta ? `, ${meta}` : ''}`}>
      {photo ? (
        <>
          <Image source={{ uri: photo }} style={styles.photo} contentFit="cover" contentPosition={{ left: '60%', top: '50%' }}
            blurRadius={3} accessible={false} />
          <LinearGradient
            colors={['rgba(30, 22, 18, 0.30)', 'rgba(30, 22, 18, 0.06)', 'rgba(30, 22, 18, 0.38)', 'rgba(30, 22, 18, 0.90)']}
            locations={[0, 0.26, 0.52, 1]} style={styles.fill} pointerEvents="none" />
        </>
      ) : (
        <Image source={symbol} style={styles.watermark} contentFit="contain" tintColor={WHITE} accessible={false} />
      )}

      <View style={styles.content}>
        <View style={styles.top}>
          <View style={styles.glassChip}>
            <Image source={symbol} style={styles.chipSymbol} contentFit="contain" tintColor={WHITE} accessible={false} />
            <AppText style={styles.glassText}>Un sitio para hoy</AppText>
          </View>
          <View style={[styles.status, { backgroundColor: chipColors.background }]}>
            <SymbolView name={chip.icon} size={13} tintColor={chipColors.foreground} />
            <AppText style={[styles.statusText, { color: chipColors.foreground }]}>{chip.label}</AppText>
          </View>
        </View>

        <View style={styles.bottom}>
          {meta && <AppText style={styles.meta} numberOfLines={1}>{meta}</AppText>}
          <AppText accessibilityRole="header" style={styles.name} numberOfLines={3}>{restaurant.name}</AppText>
          <View style={styles.who}>
            {proposer && (
              <Avatar name={proposer.name} uri={proposer.avatarUrl ? resolveApiUrl(proposer.avatarUrl) : null}
                size={34} ringColor="rgba(255, 255, 255, 0.9)" />
            )}
            <AppText style={styles.whoText} numberOfLines={2}>
              {proposer && <AppText style={styles.whoStrong}>{proposer.name.split(/\s+/)[0]}</AppText>}
              {proposer ? ' lo guardó, en ' : 'Guardado en '}
              {group.name}
            </AppText>
          </View>
          <View style={styles.buttons}>
            <Pressable onPress={onOpen} accessibilityRole="button" accessibilityLabel={`Ver ${restaurant.name}`}
              style={({ pressed }) => [styles.primary, !photo && styles.primaryOnTerracotta, pressed && styles.pressed]}>
              <AppText style={[styles.primaryText, !photo && styles.primaryTextOnTerracotta]}>Ver restaurante</AppText>
            </Pressable>
            <Pressable onPress={pickAnother} accessibilityRole="button" accessibilityLabel="Proponer otro sitio"
              accessibilityState={{ disabled: !canPickAnother }}
              style={({ pressed }) => [styles.glassButton, pressed && styles.pressed]}>
              <SymbolView name={{ ios: 'arrow.triangle.2.circlepath', android: 'sync', web: 'sync' }} size={17} tintColor={WHITE} />
              <AppText style={styles.glassButtonText}>Otro sitio</AppText>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}

const useStyles = createThemedStyles(({ colors, scheme }) => ({
  card: {
    height: 384,
    borderRadius: 30,
    borderCurve: 'continuous',
    overflow: 'hidden',
    boxShadow: scheme === 'dark' ? undefined : '0 1px 2px rgba(39, 41, 36, 0.08), 0 12px 32px rgba(39, 41, 36, 0.16)',
  },
  photo: { position: 'absolute', left: -24, top: -24, right: -24, bottom: -24 },
  fill: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  watermark: { position: 'absolute', right: -40, top: 40, width: 260, height: 287, opacity: 0.1 },
  content: { flex: 1, paddingTop: space.s4, paddingHorizontal: space.s4, paddingBottom: 18 },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.s2 },
  glassChip: {
    height: 34, borderRadius: 17, flexDirection: 'row', alignItems: 'center', gap: 7, paddingLeft: 9, paddingRight: 13,
    backgroundColor: 'rgba(252, 250, 247, 0.20)', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.22)',
  },
  chipSymbol: { width: 17, height: 19 },
  glassText: { fontFamily: fonts.semiBold, fontSize: 13, color: WHITE },
  status: { height: 30, borderRadius: 15, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 11 },
  statusText: { fontFamily: fonts.semiBold, fontSize: 12 },
  bottom: { marginTop: 'auto' },
  meta: { fontFamily: fonts.medium, fontSize: 14, lineHeight: 20, color: WHITE_SOFT },
  name: { marginTop: space.s1, fontFamily: fonts.display, fontSize: 32, lineHeight: 35, letterSpacing: -1, color: WHITE },
  who: { marginTop: 14, flexDirection: 'row', alignItems: 'center', gap: 10 },
  whoText: { flex: 1, fontFamily: fonts.regular, fontSize: 13, lineHeight: 18, color: WHITE_SOFT },
  whoStrong: { fontFamily: fonts.semiBold, color: WHITE },
  buttons: { marginTop: 18, flexDirection: 'row', gap: space.s2 },
  primary: {
    flex: 1, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center',
    backgroundColor: BRAND_TERRACOTTA, boxShadow: '0 6px 16px rgba(166, 65, 43, 0.35)',
  },
  // On the terracotta fallback the terracotta button would vanish: cream instead.
  primaryOnTerracotta: { backgroundColor: colors.background, boxShadow: undefined },
  primaryText: { fontFamily: fonts.semiBold, fontSize: 15, color: WHITE },
  primaryTextOnTerracotta: { color: scheme === 'dark' ? colors.textPrimary : colors.accentPressed },
  glassButton: {
    height: 52, borderRadius: 26, flexDirection: 'row', alignItems: 'center', gap: 7, paddingLeft: 15, paddingRight: 18,
    backgroundColor: 'rgba(252, 250, 247, 0.18)', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.28)',
  },
  glassButtonText: { fontFamily: fonts.semiBold, fontSize: 15, color: WHITE },
  pressed: { transform: [{ scale: 0.97 }] },
}));
