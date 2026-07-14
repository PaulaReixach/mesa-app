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

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed ? styles.pressed : null]}
    >
      <View style={styles.artwork}>
        <Image source={{ uri: imageUri }} style={styles.image} />
      </View>

      <View style={styles.copy}>
        <Text style={styles.eyebrow}>Recomendación para ti</Text>
        <Text numberOfLines={1} style={styles.title}>{restaurant.name}</Text>
        <Text numberOfLines={1} style={styles.location}>{location}</Text>
        <Text numberOfLines={1} style={styles.description}>
          La mejor valorada en {group.name}
        </Text>
      </View>

      <View style={styles.trailing}>
        <View style={styles.statusPill}>
          <Text style={styles.statusText}>Para descubrir</Text>
        </View>
      </View>

      <SymbolView
        name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
        size={18}
        tintColor="#2A231F"
      />
    </Pressable>
  );
}
