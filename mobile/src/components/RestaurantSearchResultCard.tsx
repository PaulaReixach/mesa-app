import { SymbolView } from 'expo-symbols';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { getRestaurantFallbackImage } from '../lib/restaurant-images';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';
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
      accessibilityLabel={`${result.name}${selected ? ', seleccionado' : ''}`}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        selected ? styles.selectedCard : null,
        pressed ? styles.pressedCard : null,
      ]}
    >
      <Image
        resizeMode="cover"
        source={{
          uri: getRestaurantFallbackImage(result.name),
        }}
        style={styles.image}
      />

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
              <SymbolView
                name={{
                  ios: 'checkmark.circle.fill',
                  android: 'check_circle',
                  web: 'check_circle',
                }}
                size={14}
                tintColor="#557547"
              />
              <Text style={styles.selectedBadgeText}>
                Elegido
              </Text>
            </View>
          ) : null}
        </View>

        {result.category ? (
          <Text numberOfLines={1} style={styles.category}>
            {result.category}
          </Text>
        ) : null}

        <View style={styles.locationRow}>
          <SymbolView
            name={{
              ios: 'mappin',
              android: 'location_on',
              web: 'location_on',
            }}
            size={15}
            tintColor={colors.muted}
          />
          <Text
            numberOfLines={2}
            style={styles.location}
          >
            {location || 'Sin dirección disponible'}
          </Text>
        </View>

        {result.country ? (
          <Text numberOfLines={1} style={styles.country}>
            {result.country}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 100,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    borderWidth: 1,
    borderColor: '#ECE4DE',
    borderRadius: 20,
    backgroundColor: colors.surface,
    padding: 11,
    shadowColor: '#3B241D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 1,
  },
  selectedCard: {
    borderColor: colors.primary,
    backgroundColor: '#FFF8F5',
  },
  pressedCard: {
    opacity: 0.78,
    transform: [{ scale: 0.995 }],
  },
  image: {
    width: 76,
    height: 76,
    borderRadius: 16,
    backgroundColor: '#F4ECE7',
  },
  content: {
    flex: 1,
    gap: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 7,
  },
  title: {
    flex: 1,
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 16,
    lineHeight: 20,
  },
  selectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 999,
    backgroundColor: '#EAF2E3',
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  selectedBadgeText: {
    color: '#557547',
    fontFamily: fonts.semiBold,
    fontSize: 10,
  },
  category: {
    color: colors.muted,
    fontFamily: fonts.medium,
    fontSize: 12,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 4,
  },
  location: {
    flex: 1,
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 17,
  },
  country: {
    color: '#958B86',
    fontFamily: fonts.regular,
    fontSize: 11,
  },
});
