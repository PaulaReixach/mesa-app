import { SymbolView } from 'expo-symbols';
import { Image, Pressable, Text, View } from 'react-native';

import { recommendationStyles as styles } from './HomeRecommendationCardRefined.styles';
import { getRestaurantInteriorFallbackImage } from '../lib/restaurant-images';
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
  const imageUri = getRestaurantInteriorFallbackImage(restaurant.name);
  const location = restaurant.city?.trim() || 'Sin ciudad';
  const category = restaurant.category?.trim();
  const score = groupRestaurant.averageScore;
  const detailLabel = [location, category]
    .filter((detail): detail is string => Boolean(detail))
    .join(' · ');
  const savedLabel = `Guardado en ${group.name}`;

  return (
    <Pressable
      accessibilityLabel={`Abrir ${restaurant.name}, pendiente en ${group.name}`}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed ? styles.pressed : null]}
    >
      <View style={styles.artwork}>
        <Image source={{ uri: imageUri }} style={styles.image} />
      </View>

      <View style={styles.copy}>
        <Text allowFontScaling={false} numberOfLines={1} style={styles.title}>
          {restaurant.name}
        </Text>
        <Text allowFontScaling={false} numberOfLines={1} style={styles.meta}>
          {detailLabel}
        </Text>
        <Text allowFontScaling={false} numberOfLines={1} style={styles.savedLabel}>
          {savedLabel}
        </Text>
      </View>

      {score != null ? (
        <View style={styles.scorePill}>
          <SymbolView
            name={{ ios: 'star.fill', android: 'star', web: 'star' }}
            size={12}
            tintColor="#5E714A"
          />
          <Text allowFontScaling={false} style={styles.scoreText}>
            {score.toFixed(1).replace('.', ',')}
          </Text>
        </View>
      ) : null}

      <SymbolView
        name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
        size={18}
        tintColor="#2A231F"
      />
    </Pressable>
  );
}
