import { MaterialIcons } from '@expo/vector-icons';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { getRestaurantFallbackImage } from '../lib/restaurant-images';
import { resolveApiUrl } from '../lib/api';
import { colors } from '../theme/colors';
import type {
  GroupRestaurant,
  GroupRestaurantStatus,
} from '../types/restaurant';

type GroupRestaurantRowPolishedProps = {
  item: GroupRestaurant;
  onFavoritePress?: () => void;
  onPress: () => void;
};

const statusPresentation: Record<
  GroupRestaurantStatus,
  {
    background: string;
    label: string;
    text: string;
  }
> = {
  WANT_TO_GO: {
    background: '#FFF0E8',
    label: 'Pendiente',
    text: colors.primary,
  },
  VISITED: {
    background: '#E8EEDD',
    label: 'Visitado',
    text: '#617C3A',
  },
  FAVORITE: {
    background: '#FFF0E8',
    label: 'Favorito',
    text: colors.primary,
  },
  WANT_TO_REPEAT: {
    background: '#E8EEDD',
    label: 'Repetir',
    text: '#617C3A',
  },
  DO_NOT_REPEAT: {
    background: '#F2ECE7',
    label: 'No repetir',
    text: colors.muted,
  },
  ARCHIVED: {
    background: '#ECE8E6',
    label: 'Archivado',
    text: colors.muted,
  },
};

function formatRating(value: number | null): string | null {
  if (value == null) {
    return null;
  }

  return value.toFixed(1).replace('.', ',');
}

export function GroupRestaurantRowPolished({
  item,
  onFavoritePress,
  onPress,
}: GroupRestaurantRowPolishedProps) {
  const restaurant = item.restaurant;
  const status = statusPresentation[item.status];
  const imageUri = restaurant.imageUrl
    ? resolveApiUrl(restaurant.imageUrl)
    : getRestaurantFallbackImage(restaurant.name);
  const location = [restaurant.city, restaurant.address]
    .filter(Boolean)
    .join(' · ');
  const rating = formatRating(item.averageScore);

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        pressed ? styles.cardPressed : null,
      ]}
    >
      <Image
        accessibilityIgnoresInvertColors
        resizeMode="cover"
        source={{ uri: imageUri }}
        style={styles.image}
      />

      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text numberOfLines={1} style={styles.name}>
            {restaurant.name}
          </Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: status.background },
            ]}
          >
            <Text
              numberOfLines={1}
              style={[
                styles.statusText,
                { color: status.text },
              ]}
            >
              {status.label}
            </Text>
          </View>
        </View>

        <Text numberOfLines={1} style={styles.category}>
          {restaurant.category ?? 'Restaurante'}
        </Text>

        <View style={styles.locationRow}>
          <MaterialIcons
            color={colors.muted}
            name="place"
            size={13}
          />
          <Text numberOfLines={1} style={styles.location}>
            {location || 'Sin ubicación'}
          </Text>
        </View>

        {rating ? (
          <View style={styles.ratingRow}>
            <MaterialIcons
              color="#E1A22E"
              name="star"
              size={13}
            />
            <Text style={styles.ratingText}>
              {rating}
            </Text>
            {item.ratingsCount > 0 ? (
              <Text style={styles.ratingCount}>
                ({item.ratingsCount})
              </Text>
            ) : null}
          </View>
        ) : null}
      </View>

      <View style={styles.trailing}>
        <Pressable
          accessibilityLabel={item.favorite
            ? 'Quitar de favoritos'
            : 'Marcar como favorito'}
          accessibilityRole="button"
          disabled={!onFavoritePress}
          hitSlop={8}
          onPress={(event) => {
            event.stopPropagation();
            onFavoritePress?.();
          }}
          style={({ pressed }) => [
            styles.favoriteButton,
            item.favorite ? styles.favoriteButtonActive : null,
            pressed ? styles.favoriteButtonPressed : null,
          ]}
        >
          <MaterialIcons
            color={item.favorite ? colors.primary : colors.muted}
            name={item.favorite ? 'favorite' : 'favorite-border'}
            size={19}
          />
        </Pressable>

        <MaterialIcons
          color={colors.muted}
          name="chevron-right"
          size={22}
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 92,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 22,
    backgroundColor: colors.surface,
    shadowColor: '#2B211C',
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 1,
  },
  cardPressed: {
    opacity: 0.74,
  },
  image: {
    width: 72,
    height: 72,
    borderRadius: 18,
    backgroundColor: '#E8DED8',
  },
  content: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  name: {
    flex: 1,
    color: colors.text,
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: -0.25,
  },
  statusBadge: {
    maxWidth: 82,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '900',
  },
  category: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '700',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  location: {
    flex: 1,
    color: colors.muted,
    fontSize: 11,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 2,
  },
  ratingText: {
    color: colors.text,
    fontSize: 11,
    fontWeight: '900',
  },
  ratingCount: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: '600',
  },
  trailing: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  favoriteButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: '#F8F3EF',
  },
  favoriteButtonActive: {
    backgroundColor: '#FFF0E8',
  },
  favoriteButtonPressed: {
    opacity: 0.74,
  },
});
