import { SymbolView } from 'expo-symbols';
import { Linking, Platform, View } from 'react-native';

import { AppText } from './ui/AppText';
import { AvatarStack } from './ui/Avatar';
import { Button } from './ui/Button';
import { PressableCard } from './ui/PressableCard';
import { RatingBadge } from './ui/RatingBadge';
import { RestaurantCover, restaurantCategoryLabel } from './ui/RestaurantCover';
import { resolveApiUrl } from '../lib/api';
import type { SavedPlace } from '../lib/home-recommendation';
import { createThemedStyles, fonts, formatScore, iconSize, space, useTheme } from '../theme';
import type { GroupMember } from '../types/group-member';

export type HomeRecommendation = SavedPlace;

function openInMaps(name: string, latitude: number, longitude: number): void {
  const label = encodeURIComponent(name);
  const url = Platform.select({
    ios: `maps:?ll=${latitude},${longitude}&q=${label}`,
    default: `geo:${latitude},${longitude}?q=${latitude},${longitude}(${label})`,
  });
  Linking.openURL(url).catch(() => {
    void Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`);
  });
}

/** "Un sitio para hoy": the featured card of Home (prototype `home-discovery-card`). */
export function HomeRecommendationCard({ recommendation, members, onOpen }: {
  recommendation: HomeRecommendation;
  members: GroupMember[];
  onOpen: () => void;
}) {
  const { colors } = useTheme();
  const styles = useStyles();
  const { group, restaurant: saved } = recommendation;
  const { restaurant, averageScore, ratingsCount, status } = saved;
  const city = restaurant.city ?? group.city;
  const subtitle = [restaurantCategoryLabel(restaurant.category), city].filter(Boolean).join(' · ');
  const hasLocation = restaurant.latitude !== null && restaurant.longitude !== null;
  const rating = averageScore !== null && ratingsCount > 0
    ? `media ${formatScore(averageScore)}, ${ratingsCount} ${ratingsCount === 1 ? 'valoración' : 'valoraciones'}`
    : status === 'WANT_TO_GO' ? 'pendiente de probar' : 'aún sin valoraciones';

  return (
    <PressableCard feature>
      <RestaurantCover name={restaurant.name} category={restaurant.category} />
      <View style={styles.body} accessible accessibilityLabel={`${restaurant.name}. ${subtitle}. ${rating}. De ${group.name}`}>
        <AppText variant="featureTitle">{restaurant.name}</AppText>
        {subtitle.length > 0 && <AppText variant="body" tone="muted" style={styles.subtitle}>{subtitle}</AppText>}
        <View style={styles.rating}>
          <RatingBadge score={averageScore} count={ratingsCount} countSuffix=" en este grupo"
            emptyLabel={status === 'WANT_TO_GO' ? 'Pendiente de probar' : 'Aún sin valoraciones'} />
        </View>
        <View style={styles.person}>
          <AvatarStack people={members} size={25} ringColor={colors.surface} resolveUri={resolveApiUrl} />
          <AppText variant="secondary" tone="muted" style={styles.flex}>
            De <AppText variant="secondary" tone="olive" style={styles.strong}>{group.name}</AppText>
          </AppText>
        </View>
      </View>
      <View style={styles.actions}>
        <Button title="Ver restaurante" trailingIcon={{ ios: 'arrow.right', android: 'arrow_forward', web: 'arrow_forward' }}
          accessibilityLabel={`Ver ${restaurant.name}`} onPress={onOpen} style={styles.primary} />
        {hasLocation ? (
          <Button variant="secondary" title="Ver mapa" icon={{ ios: 'map', android: 'map', web: 'map' }}
            accessibilityLabel={`Ver ${restaurant.name} en el mapa`}
            onPress={() => openInMaps(restaurant.name, restaurant.latitude as number, restaurant.longitude as number)}
            style={styles.secondary} />
        ) : (
          <View style={[styles.secondary, styles.locationNote]}>
            <SymbolView accessible={false} name={{ ios: 'mappin', android: 'location_on', web: 'location_on' }}
              size={iconSize.link} tintColor={colors.textSecondary} />
            <AppText variant="caption" tone="muted">Ubicación pendiente</AppText>
          </View>
        )}
      </View>
    </PressableCard>
  );
}

const useStyles = createThemedStyles(({ colors }) => ({
  body: { paddingHorizontal: 18, paddingTop: 18 },
  subtitle: { marginTop: 5 },
  rating: { marginTop: 10 },
  person: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 15,
    paddingVertical: 11,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.separator,
  },
  flex: { flex: 1 },
  strong: { fontFamily: fonts.medium },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, padding: 18, paddingTop: 15 },
  primary: { flexGrow: 1.45, flexBasis: 150 },
  secondary: { flexGrow: 1, flexBasis: 110 },
  locationNote: { minHeight: 46, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5 },
}));
