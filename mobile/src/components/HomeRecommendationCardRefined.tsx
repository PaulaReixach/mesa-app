import { SymbolView } from 'expo-symbols';
import { Image, Pressable, Text, View } from 'react-native';

import { recommendationStyles as styles } from './HomeRecommendationCardRefined.styles';
import { resolveApiUrl } from '../lib/api';
import { colors } from '../theme/colors';
import type { RestaurantGroup } from '../types/group';
import type { GroupRestaurant } from '../types/restaurant';

export type HomeRecommendation = {
  group: RestaurantGroup;
  restaurant: GroupRestaurant;
};

export function HomeRecommendationCardRefined({
  recommendation,
  onPress,
}: {
  recommendation: HomeRecommendation;
  onPress: () => void;
}) {
  const { group, restaurant: groupRestaurant } = recommendation;
  const restaurant = groupRestaurant.restaurant;
  const imageUri = group.imageUrl ? resolveApiUrl(group.imageUrl) : null;
  const score = groupRestaurant.averageScore;
  const location = [restaurant.address, restaurant.city].filter(Boolean).join(' · ');

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed ? styles.pressed : null]}
    >
      <View style={styles.artwork}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.image} />
        ) : (
          <View style={styles.fallback}>
            <SymbolView
              name={{ ios: 'fork.knife', android: 'restaurant', web: 'restaurant' }}
              size={24}
              tintColor={colors.primary}
            />
          </View>
        )}
      </View>

      <View style={styles.copy}>
        <Text style={styles.eyebrow}>Recomendación para ti</Text>
        <Text numberOfLines={1} style={styles.title}>{restaurant.name}</Text>
        <Text numberOfLines={1} style={styles.category}>
          {restaurant.category ?? 'Restaurante'}
        </Text>
        <View style={styles.locationRow}>
          <SymbolView
            name={{ ios: 'mappin', android: 'location_on', web: 'location_on' }}
            size={10}
            tintColor={colors.muted}
          />
          <Text numberOfLines={1} style={styles.location}>
            {location || group.name}
          </Text>
        </View>
      </View>

      <View style={styles.trailing}>
        <View style={styles.statusPill}>
          <Text style={styles.statusText}>
            {score != null && score >= 4.5 ? 'Muy valorado' : 'Para descubrir'}
          </Text>
        </View>
        <View style={styles.scorePill}>
          <SymbolView
            name={{ ios: 'star.fill', android: 'star', web: 'star' }}
            size={12}
            tintColor="#EAA72D"
          />
          <Text style={styles.scoreText}>
            {score?.toFixed(1).replace('.', ',') ?? '—'}
          </Text>
        </View>
      </View>

      <SymbolView
        name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
        size={15}
        tintColor={colors.text}
      />
    </Pressable>
  );
}
