import { SymbolView } from 'expo-symbols';
import { router } from 'expo-router';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { colors } from '../theme/colors';
import type {
  GroupRestaurant,
  GroupRestaurantStatus,
} from '../types/restaurant';

type RestaurantCardProps = {
  groupRestaurant: GroupRestaurant;
  presentation?: 'status' | 'rating';
};

const statusPresentation: Record<
  GroupRestaurantStatus,
  {
    label: string;
    backgroundColor: string;
    textColor: string;
  }
> = {
  WANT_TO_GO: {
    label: 'Pendiente',
    backgroundColor: '#FBE4DA',
    textColor: colors.primary,
  },
  VISITED: {
    label: 'Visitado',
    backgroundColor: '#E8EEDD',
    textColor: '#607349',
  },
  FAVORITE: {
    label: 'Favorito',
    backgroundColor: '#F7DDD3',
    textColor: colors.primary,
  },
  WANT_TO_REPEAT: {
    label: 'Repetir',
    backgroundColor: '#E7EEDC',
    textColor: '#62794D',
  },
  DO_NOT_REPEAT: {
    label: 'No repetir',
    backgroundColor: '#F1E5E1',
    textColor: colors.danger,
  },
  ARCHIVED: {
    label: 'Archivado',
    backgroundColor: '#ECE8E6',
    textColor: colors.muted,
  },
};

export function RestaurantCard({
  groupRestaurant,
  presentation = 'status',
}: RestaurantCardProps) {
  const { restaurant } = groupRestaurant;

  const location = [
    restaurant.address,
    restaurant.city,
  ]
    .filter(Boolean)
    .join(' · ');

  const status =
    statusPresentation[groupRestaurant.status];

  const formattedAverage = groupRestaurant.averageScore == null
    ? null
    : groupRestaurant.averageScore
        .toFixed(1)
        .replace('.', ',');

  function openRestaurant(): void {
    router.push({
      pathname:
        '/groups/[groupId]/restaurants/[groupRestaurantId]',
      params: {
        groupId: groupRestaurant.groupId,
        groupRestaurantId: groupRestaurant.id,
      },
    });
  }

  return (
    <Pressable
      accessibilityRole="button"
      onPress={openRestaurant}
      style={({ pressed }) => [
        styles.card,
        pressed ? styles.cardPressed : null,
      ]}
    >
      <View style={styles.artwork}>
        <SymbolView
          name={{
            ios: 'fork.knife',
            android: 'restaurant',
            web: 'restaurant',
          }}
          size={23}
          tintColor={colors.primary}
        />
      </View>

      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text
            numberOfLines={1}
            style={styles.title}
          >
            {restaurant.name}
          </Text>

          <View style={styles.ratingBadge}>
            <Text style={styles.ratingText}>
              {formattedAverage
                ? `★ ${formattedAverage}`
                : 'Sin valorar'}
            </Text>
          </View>
        </View>

        <View style={styles.metaRow}>
          <Text
            numberOfLines={1}
            style={styles.category}
          >
            {restaurant.category ?? 'Restaurante'}
          </Text>

          {presentation === 'status' ? (
            <View
              style={[
                styles.status,
                {
                  backgroundColor:
                    status.backgroundColor,
                },
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  {
                    color: status.textColor,
                  },
                ]}
              >
                {status.label}
              </Text>
            </View>
          ) : null}
        </View>

        <Text
          numberOfLines={1}
          style={styles.location}
        >
          {location || 'Sin ubicación'}
        </Text>

        {groupRestaurant.groupNotes ? (
          <Text
            numberOfLines={1}
            style={styles.notes}
          >
            {groupRestaurant.groupNotes}
          </Text>
        ) : null}
      </View>

      <SymbolView
        name={{
          ios: 'chevron.right',
          android: 'chevron_right',
          web: 'chevron_right',
        }}
        size={19}
        tintColor={colors.muted}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 82,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 11,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    backgroundColor: colors.surface,
  },
  cardPressed: {
    opacity: 0.72,
  },
  artwork: {
    width: 58,
    height: 58,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: '#F3DED5',
  },
  content: {
    flex: 1,
    gap: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  title: {
    flex: 1,
    color: colors.text,
    fontSize: 14,
    fontWeight: '900',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  status: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '900',
  },
  ratingBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#F7E8D2',
  },
  ratingText: {
    color: '#9B6717',
    fontSize: 9,
    fontWeight: '900',
  },
  category: {
    flex: 1,
    color: colors.text,
    fontSize: 10,
    fontWeight: '700',
  },
  location: {
    color: colors.muted,
    fontSize: 10,
  },
  notes: {
    marginTop: 1,
    color: colors.primary,
    fontSize: 9,
    fontStyle: 'italic',
  },
});
