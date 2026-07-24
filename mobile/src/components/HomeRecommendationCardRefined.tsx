import { SymbolView } from 'expo-symbols';
import { Image, Pressable, Text, View } from 'react-native';

import { recommendationStyles as styles } from './HomeRecommendationCardRefined.styles';
import { getRestaurantFallbackImage } from '../lib/restaurant-images';
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
  const imageUri = getRestaurantFallbackImage(restaurant.name);
  const location = restaurant.city ?? group.city ?? 'Sin ciudad';
  const score = groupRestaurant.averageScore;
  const ratingLabel = groupRestaurant.ratingsCount === 1
    ? '1 valoración'
    : `${groupRestaurant.ratingsCount} valoraciones`;
  const statusLabel = groupRestaurant.favorite
    ? 'Favorito del grupo'
    : 'Guardado en el grupo';

  return (
    <Pressable
      accessibilityLabel={`Abrir ${restaurant.name}, ${location}, del grupo ${group.name}`}
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
        <View style={styles.metaRow}>
          <Text allowFontScaling={false} numberOfLines={1} style={styles.location}>
            {location}
          </Text>
          <View style={styles.metaDot} />
          <Text allowFontScaling={false} numberOfLines={1} style={styles.groupName}>
            {group.name}
          </Text>
        </View>
        <Text allowFontScaling={false} numberOfLines={1} style={styles.description}>
          {score != null ? ratingLabel : statusLabel}
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
