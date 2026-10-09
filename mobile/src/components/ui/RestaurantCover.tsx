import { SymbolView } from 'expo-symbols';
import type { ComponentProps } from 'react';
import { View, useWindowDimensions } from 'react-native';

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

/**
 * Typographic cover for restaurants without a photo (DESIGN.md › Components): a brand tone,
 * the initial as a monogram and the place type. Hidden at large text sizes.
 */
export function RestaurantCover({ name, category, height = 132 }: {
  name: string;
  category: string | null;
  height?: number;
}) {
  const { cover } = useTheme();
  const styles = useStyles();
  const { fontScale } = useWindowDimensions();
  if (fontScale > 1.3) return null;

  const tone = cover[toneIndex(name.trim() || 'mesa', cover.length)];
  const known = category ? categories[category.toLowerCase()] : undefined;
  const label = restaurantCategoryLabel(category);

  return (
    <View accessible={false} importantForAccessibility="no-hide-descendants"
      style={[styles.cover, { height, backgroundColor: tone.background }]}>
      <AppText maxFontSizeMultiplier={1} style={[typography.monogram, { color: tone.ink }]}>
        {name.trim().charAt(0).toUpperCase() || '·'}
      </AppText>
      <View style={styles.type}>
        <SymbolView name={known?.icon ?? FORK_KNIFE} size={iconSize.inline} tintColor={tone.ink} />
        {label && <AppText variant="label" maxFontSizeMultiplier={1} style={{ color: tone.ink }}>{label}</AppText>}
      </View>
    </View>
  );
}

const useStyles = createThemedStyles(() => ({
  cover: {
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: space.s3,
    paddingBottom: 14,
    borderTopLeftRadius: radius.xl - 1,
    borderTopRightRadius: radius.xl - 1,
    borderCurve: 'continuous',
  },
  type: { flexDirection: 'row', alignItems: 'center', gap: 6 },
}));
