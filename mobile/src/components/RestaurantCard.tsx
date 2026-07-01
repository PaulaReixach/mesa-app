import {
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

const statusLabels: Record<
  GroupRestaurantStatus,
  string
> = {
  WANT_TO_GO: 'Queremos ir',
  VISITED: 'Visitado',
  FAVORITE: 'Favorito',
  WANT_TO_REPEAT: 'Queremos repetir',
  DO_NOT_REPEAT: 'No repetir',
  ARCHIVED: 'Archivado',
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

  return (
    <View style={styles.card}>
      <View style={styles.icon}>
        <Text style={styles.iconText}>
          {restaurant.name.charAt(0).toUpperCase()}
        </Text>
      </View>

      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text numberOfLines={1} style={styles.title}>
            {restaurant.name}
          </Text>

          <View style={styles.status}>
            <Text style={styles.statusText}>
              {statusLabels[groupRestaurant.status]}
            </Text>
          </View>
        </View>

        {restaurant.category ? (
          <Text style={styles.category}>
            {restaurant.category}
          </Text>
        ) : null}

        {location ? (
          <Text numberOfLines={2} style={styles.location}>
            {location}
          </Text>
        ) : (
          <Text style={styles.location}>
            Sin ubicación
          </Text>
        )}

        {groupRestaurant.groupNotes ? (
          <Text
            numberOfLines={2}
            style={styles.notes}
          >
            {groupRestaurant.groupNotes}
          </Text>
        ) : null}
      </View>
    </View>
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
    backgroundColor: '#E8F1EB',
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  statusText: {
    color: colors.success,
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
});