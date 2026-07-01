import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { colors } from '../theme/colors';
import { RestaurantSearchResult } from '../types/restaurant';

type RestaurantSearchResultCardProps = {
  result: RestaurantSearchResult;
  selected: boolean;
  onPress: () => void;
};

export function RestaurantSearchResultCard({
  result,
  selected,
  onPress,
}: RestaurantSearchResultCardProps) {
  const location = [
    result.address,
    result.city,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        selected ? styles.selectedCard : null,
        pressed ? styles.pressedCard : null,
      ]}
    >
      <View
        style={[
          styles.icon,
          selected ? styles.selectedIcon : null,
        ]}
      >
        <Text
          style={[
            styles.iconText,
            selected ? styles.selectedIconText : null,
          ]}
        >
          {result.name.charAt(0).toUpperCase()}
        </Text>
      </View>

      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text
            numberOfLines={2}
            style={styles.title}
          >
            {result.name}
          </Text>

          {selected ? (
            <View style={styles.selectedBadge}>
              <Text style={styles.selectedBadgeText}>
                Elegido
              </Text>
            </View>
          ) : null}
        </View>

        {result.category ? (
          <Text style={styles.category}>
            {result.category}
          </Text>
        ) : null}

        <Text
          numberOfLines={2}
          style={styles.location}
        >
          {location || 'Sin dirección disponible'}
        </Text>

        {result.country ? (
          <Text style={styles.country}>
            {result.country}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 13,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    backgroundColor: colors.surface,
    padding: 15,
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: colors.primary,
    padding: 14,
  },
  pressedCard: {
    opacity: 0.75,
  },
  icon: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: '#F7D9CF',
  },
  selectedIcon: {
    backgroundColor: colors.primary,
  },
  iconText: {
    color: colors.primary,
    fontSize: 20,
    fontWeight: '800',
  },
  selectedIconText: {
    color: colors.white,
  },
  content: {
    flex: 1,
    gap: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  title: {
    flex: 1,
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 21,
  },
  selectedBadge: {
    borderRadius: 999,
    backgroundColor: '#F7D9CF',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  selectedBadgeText: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: '800',
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
  country: {
    color: colors.muted,
    fontSize: 12,
  },
});