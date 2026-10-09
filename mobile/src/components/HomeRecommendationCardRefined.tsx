import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { Pressable, Text, View, useWindowDimensions } from 'react-native';
import { recommendationStyles as styles } from './HomeRecommendationCardRefined.styles';
import { homeFocusStyle } from './HomeDashboardStyles';
import { loginColors } from '../theme/colors';
import type { RestaurantGroup } from '../types/group';
import type { GroupRestaurant } from '../types/restaurant';

export type HomeRecommendation = { group: RestaurantGroup; restaurant: GroupRestaurant };

export function HomeRecommendationCardRefined({ recommendation, onPress }: {
  recommendation: HomeRecommendation; onPress: () => void;
}) {
  const { group, restaurant: groupRestaurant } = recommendation;
  const { restaurant, averageScore, ratingsCount } = groupRestaurant;
  const location = restaurant.city ?? group.city;
  const { width, fontScale } = useWindowDimensions();
  const [focused, setFocused] = useState(false);
  const rating = averageScore != null && ratingsCount > 0
    ? `${averageScore.toFixed(1).replace('.', ',')} · ${ratingsCount} ${ratingsCount === 1 ? 'valoración' : 'valoraciones'}`
    : 'Aún sin valoraciones';

  return (
    <Pressable accessibilityRole="button"
      accessibilityLabel={`${restaurant.name}${location ? `, ${location}` : ''}. Guardado en ${group.name}. ${rating}`}
      onPress={onPress} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
      style={({ pressed }) => [styles.card, pressed && styles.pressed, focused && homeFocusStyle]}>
      <View style={styles.main}>
        {width >= 350 && fontScale <= 1.3 && <View style={styles.artwork} accessible={false} importantForAccessibility="no-hide-descendants">
          <SymbolView name={{ ios: 'fork.knife', android: 'restaurant', web: 'restaurant' }} size={28} tintColor={loginColors.primary} />
        </View>}
        <View style={styles.copy}>
          <Text style={styles.title}>{restaurant.name}</Text>
          {location && <Text style={styles.location}>{location}</Text>}
        </View>
        <SymbolView accessible={false} name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }} size={20} tintColor={loginColors.text} />
      </View>
      <Text style={styles.description}>Guardado en {group.name}</Text>
      <Text style={styles.rating}>{rating}</Text>
    </Pressable>
  );
}
