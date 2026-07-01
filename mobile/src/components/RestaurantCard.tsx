import { router } from 'expo-router';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { colors } from '../theme/colors';
import {
  GroupRestaurant,
  GroupRestaurantStatus,
} from '../types/restaurant';

type RestaurantCardProps = {
  groupRestaurant: GroupRestaurant;
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
    label: 'Queremos ir',
    backgroundColor: '#F7E8D2',
    textColor: '#8A5B17',
  },
  VISITED: {
    label: 'Visitado',
    backgroundColor: '#E5EDF7',
    textColor: '#365F91',
  },
  FAVORITE: {
    label: 'Favorito',
    backgroundColor: '#FBE4E7',
    textColor: '#A33B4A',
  },
  WANT_TO_REPEAT: {
    label: 'Queremos repetir',
    backgroundColor: '#E8F1EB',
    textColor: colors.success,
  },
  DO_NOT_REPEAT: {
    label: 'No repetir',
    backgroundColor: '#FBE9E5',
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

  function openRestaurant() {
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
      <View style={styles.icon}>
        <Text style={styles.iconText}>
          {restaurant.name.charAt(0).toUpperCase()}
        </Text>
      </View>

      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text
            numberOfLines={1}
            style={styles.title}
          >
            {restaurant.name}
          </Text>

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
        </View>

        {restaurant.category ? (
          <Text style={styles.category}>
            {restaurant.category}
          </Text>
        ) : null}

        <Text
          numberOfLines={2}
          style={styles.location}
        >
          {location || 'Sin ubicación'}
        </Text>

        {groupRestaurant.groupNotes ? (
          <Text
            numberOfLines={2}
            style={styles.notes}
          >
            {groupRestaurant.groupNotes}
          </Text>
        ) : null}
      </View>

      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    backgroundColor: colors.surface,
    padding: 16,
  },
  cardPressed: {
    opacity: 0.72,
  },
  icon: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 17,
    backgroundColor: '#F7D9CF',
  },
  iconText: {
    color: colors.primary,
    fontSize: 21,
    fontWeight: '800',
  },
  content: {
    flex: 1,
    gap: 5,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    flex: 1,
    color: colors.text,
    fontSize: 17,
    fontWeight: '800',
  },
  status: {
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  category: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  location: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18,
  },
  notes: {
    marginTop: 3,
    color: colors.text,
    fontSize: 13,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  chevron: {
    alignSelf: 'center',
    color: colors.muted,
    fontSize: 28,
    lineHeight: 30,
  },
});