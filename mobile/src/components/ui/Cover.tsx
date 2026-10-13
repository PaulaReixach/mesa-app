import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { SymbolView } from 'expo-symbols';
import type { ComponentProps, ReactNode } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';

import { AppText } from './AppText';
import { createThemedStyles, iconSize, radius, space, typography, useTheme } from '../../theme';

type SymbolName = ComponentProps<typeof SymbolView>['name'];

const FORK_KNIFE: SymbolName = { ios: 'fork.knife', android: 'restaurant', web: 'restaurant' };
const CUP: SymbolName = { ios: 'cup.and.saucer', android: 'local_cafe', web: 'local_cafe' };
const GLASS: SymbolName = { ios: 'wineglass', android: 'wine_bar', web: 'wine_bar' };

// OpenStreetMap place types → label and icon. Unknown types keep the fork and knife.
const categories: Record<string, { label: string; icon: SymbolName }> = {
  restaurant: { label: 'Restaurante', icon: FORK_KNIFE },
  fast_food: { label: 'Comida rápida', icon: FORK_KNIFE },
  food_court: { label: 'Zona de comidas', icon: FORK_KNIFE },
  cafe: { label: 'Cafetería', icon: CUP },
  bakery: { label: 'Panadería', icon: CUP },
  ice_cream: { label: 'Heladería', icon: CUP },
  bar: { label: 'Bar', icon: GLASS },
  pub: { label: 'Pub', icon: GLASS },
  biergarten: { label: 'Cervecería', icon: GLASS },
  wine_bar: { label: 'Vinoteca', icon: GLASS },
};

export function restaurantCategoryLabel(category: string | null): string | null {
  if (!category) return null;
  const known = categories[category.toLowerCase()];
  if (known) return known.label;
  const text = category.replace(/_/g, ' ');
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** Stable tone per name, so a restaurant keeps its colour everywhere. */
function toneIndex(name: string, tones: number): number {
  return Array.from(name).reduce((total, character) => total + character.charCodeAt(0), 0) % tones;
}

const GROUP: SymbolName = { ios: 'person.2', android: 'group', web: 'group' };

/** Wide photo header of the restaurant and group screens (DESIGN.md › Editar un sitio). */
const HEADER_HEIGHT = 176;
const HEADER_RADIUS = 24;

type CoverProps = {
  name: string;
  category?: string | null;
  kind?: 'restaurant' | 'group';
  /** Real photo of the place or group. Never a stock photo. */
  photoUrl?: string | null;
  /** `card`: top of a card (132). `header`: wide rounded header (176). */
  shape?: 'card' | 'header';
  height?: number;
  /** Overlay pinned bottom-right («Añadir foto», «1/N»). */
  children?: ReactNode;
};

/**
 * Cover for restaurants and groups (DESIGN.md › Portada tipográfica). With a photo: the photo with
 * a bottom veil. Without: a stable brand tone, the initial as monogram and the place type.
 * The typographic version hides at large text sizes unless it carries an overlay.
 */
export function Cover({
  name, category = null, kind = 'restaurant', photoUrl, shape = 'card', height, children,
}: CoverProps) {
  const { cover } = useTheme();
  const styles = useStyles();
  const { fontScale } = useWindowDimensions();
  const largeText = fontScale > 1.3;
  const boxStyle = [
    shape === 'header' ? styles.header : styles.card,
    { height: height ?? (shape === 'header' ? HEADER_HEIGHT : 132) },
  ];

  if (photoUrl) {
    return (
      <View style={[boxStyle, styles.photoBox]}>
        <Image source={{ uri: photoUrl }} style={StyleSheet.absoluteFill} contentFit="cover"
          accessible={false} transition={150} />
        <LinearGradient colors={['rgba(39, 41, 36, 0)', 'rgba(39, 41, 36, 0.45)']}
          style={styles.veil} pointerEvents="none" />
        {children && <View style={styles.overlay}>{children}</View>}
      </View>
    );
  }
  if (largeText && !children) return null;

  const tone = cover[toneIndex(name.trim() || 'mesa', cover.length)];
  const known = kind === 'restaurant' && category ? categories[category.toLowerCase()] : undefined;
  const label = kind === 'restaurant' ? restaurantCategoryLabel(category) : null;
  const icon = kind === 'group' ? GROUP : known?.icon ?? FORK_KNIFE;

  return (
    <View style={[boxStyle, styles.tone, { backgroundColor: tone.background }]}>
      {!largeText && (
        <View accessible={false} importantForAccessibility="no-hide-descendants" style={styles.typeBox}>
          <AppText maxFontSizeMultiplier={1} style={[typography.monogram, { color: tone.ink }]}>
            {name.trim().charAt(0).toUpperCase() || '·'}
          </AppText>
          <View style={styles.type}>
            <SymbolView name={icon} size={iconSize.inline} tintColor={tone.ink} />
            {label && <AppText variant="label" maxFontSizeMultiplier={1} style={{ color: tone.ink }}>{label}</AppText>}
          </View>
        </View>
      )}
      {children && <View style={styles.overlay}>{children}</View>}
    </View>
  );
}

const useStyles = createThemedStyles(() => ({
  card: {
    borderTopLeftRadius: radius.xl - 1,
    borderTopRightRadius: radius.xl - 1,
    borderCurve: 'continuous',
    overflow: 'hidden',
  },
  header: { borderRadius: HEADER_RADIUS, borderCurve: 'continuous', overflow: 'hidden' },
  photoBox: { justifyContent: 'flex-end' },
  veil: { position: 'absolute', left: 0, right: 0, bottom: 0, height: '55%' },
  tone: { paddingHorizontal: 18, paddingTop: space.s3, paddingBottom: 14 },
  typeBox: { flex: 1, justifyContent: 'space-between' },
  type: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  overlay: { position: 'absolute', right: space.s3, bottom: space.s3 },
}));
