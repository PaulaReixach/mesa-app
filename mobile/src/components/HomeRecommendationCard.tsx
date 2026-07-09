import { SymbolView } from 'expo-symbols';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { resolveApiUrl } from '../lib/api';
import { colors } from '../theme/colors';
import type { RestaurantGroup } from '../types/group';
import type { GroupRestaurant } from '../types/restaurant';

export type HomeRecommendation = {
  group: RestaurantGroup;
  restaurant: GroupRestaurant;
};

export function HomeRecommendationCard({
  recommendation,
  onPress,
}: {
  recommendation: HomeRecommendation;
  onPress: () => void;
}) {
  const { group, restaurant: groupRestaurant } = recommendation;
  const restaurant = groupRestaurant.restaurant;
  const imageUri = group.imageUrl
    ? resolveApiUrl(group.imageUrl)
    : null;
  const score = groupRestaurant.averageScore;
  const location = [restaurant.address, restaurant.city]
    .filter(Boolean)
    .join(' · ');

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        pressed ? styles.pressed : null,
      ]}
    >
      <View style={styles.artwork}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.image} />
        ) : (
          <View style={styles.fallback}>
            <SymbolView
              name={{ ios: 'fork.knife', android: 'restaurant', web: 'restaurant' }}
              size={29}
              tintColor={colors.primary}
            />
          </View>
        )}
      </View>

      <View style={styles.copy}>
        <Text style={styles.eyebrow}>Recomendación para ti</Text>
        <Text numberOfLines={1} style={styles.title}>
          {restaurant.name}
        </Text>
        <Text numberOfLines={1} style={styles.category}>
          {restaurant.category ?? 'Restaurante'}
        </Text>
        <View style={styles.locationRow}>
          <SymbolView
            name={{ ios: 'mappin', android: 'location_on', web: 'location_on' }}
            size={12}
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
            size={14}
            tintColor="#EAA72D"
          />
          <Text style={styles.scoreText}>
            {score?.toFixed(1).replace('.', ',') ?? '—'}
          </Text>
        </View>
      </View>

      <SymbolView
        name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
        size={17}
        tintColor={colors.text}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 94,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 8,
    borderWidth: 1,
    borderColor: '#EDE3DD',
    borderRadius: 18,
    backgroundColor: '#FFFDFC',
  },
  artwork: {
    width: 88,
    height: 78,
    overflow: 'hidden',
    borderRadius: 14,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  fallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E6E0CB',
  },
  copy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  eyebrow: {
    color: colors.primary,
    fontSize: 8,
    fontWeight: '900',
  },
  title: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '900',
  },
  category: {
    color: colors.text,
    fontSize: 9,
    fontWeight: '600',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 1,
  },
  location: {
    flex: 1,
    color: colors.muted,
    fontSize: 7,
  },
  trailing: {
    alignItems: 'flex-end',
    gap: 7,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: '#EAF0DE',
  },
  statusText: {
    color: '#5D7444',
    fontSize: 7,
    fontWeight: '800',
  },
  scorePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#FFF2DD',
  },
  scoreText: {
    color: colors.text,
    fontSize: 10,
    fontWeight: '900',
  },
  pressed: {
    opacity: 0.74,
  },
});
