import { useBottomTabBarHeight } from 'expo-router/js-tabs';
import { useFocusEffect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useMemo, useRef, useState } from 'react';
import { AccessibilityInfo, RefreshControl, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { HomeActivityEntry } from '../components/HomeActivityRow';
import { HomeCityPicker } from '../components/HomeCityPicker';
import {
  CARD_GUTTER, HomeDashboardContent, TEXT_GUTTER, type PendingRating, type RecommendationState,
} from '../components/HomeDashboardContent';
import { HomeFirstTable } from '../components/HomeFirstTable';
import { HomeSearchRow, HomeTopBar } from '../components/HomeHeader';
import { HomeInvitationMessage } from '../components/HomeInvitationMessage';
import { AppText } from '../components/ui/AppText';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { InlineBanner } from '../components/ui/InlineBanner';
import { Skeleton } from '../components/ui/Skeleton';
import { useAuth } from '../contexts/auth-context';
import { dedupeActivity } from '../lib/activity';
import { resolveApiUrl } from '../lib/api';
import {
  candidatesIn, eligiblePlaces, listCities, pickAnother, pickInitial, placeCity, type SavedPlace,
} from '../lib/home-recommendation';
import { getGroupActivity } from '../services/group-activity-service';
import { getMyGroupInvitations } from '../services/group-invitation-service';
import { getGroupMembers } from '../services/group-member-service';
import { getGroups } from '../services/group-service';
import { getRestaurantRatings, saveRestaurantRating } from '../services/restaurant-rating-service';
import { getGroupRestaurants } from '../services/restaurant-service';
import { createThemedStyles, fonts, radius, space, useTheme } from '../theme';
import type { RestaurantGroup } from '../types/group';
import type { GroupInvitation } from '../types/group-invitation';
import type { GroupMember } from '../types/group-member';
import type { GroupRestaurant } from '../types/restaurant';

/** Places whose rating card was closed with «×»; they stay hidden until the app restarts. */
const dismissedRatings = new Set<string>();

/** Visited places checked for «Valorar después de ir». */
const RATING_CANDIDATES = 3;

/** Groups whose members, activity and restaurants are loaded for Home. */
const DETAILED_GROUPS = 4;

function sortGroups(groups: RestaurantGroup[]): RestaurantGroup[] {
  return [...groups].sort((left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime());
}

function DashboardSkeleton() {
  return (
    <View accessible accessibilityLabel="Cargando tu inicio" accessibilityState={{ busy: true }}
      accessibilityLiveRegion="polite" style={{ gap: 28 }}>
      <View style={{ gap: space.s3 }}>
        <Skeleton width="38%" height={24} />
        <Skeleton height={104} borderRadius={radius.lg} />
        <Skeleton height={104} borderRadius={radius.lg} />
      </View>
      <View style={{ gap: space.s3 }}>
        <Skeleton width="48%" height={24} />
        <Skeleton height={300} borderRadius={radius.xl} />
      </View>
    </View>
  );
}

export default function HomeScreen() {
  const { user, accessToken } = useAuth();
  const { colors, scheme } = useTheme();
  const styles = useStyles();
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const hasLoaded = useRef(false);
  const requestInFlight = useRef(false);
  const [groups, setGroups] = useState<RestaurantGroup[]>([]);
  const [membersByGroup, setMembersByGroup] = useState<Record<string, GroupMember[]>>({});
  const [restaurantsByGroup, setRestaurantsByGroup] = useState<Record<string, GroupRestaurant[]>>({});
  const [activity, setActivity] = useState<HomeActivityEntry[]>([]);
  const [pendingInvitations, setPendingInvitations] = useState<GroupInvitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [unavailable, setUnavailable] = useState({ activity: false, restaurants: false });
  const [chosenCity, setChosenCity] = useState<string | null>(null);
  const [pickedId, setPickedId] = useState<string | null>(null);
  const [cityPickerOpen, setCityPickerOpen] = useState(false);
  const [pendingRating, setPendingRating] = useState<PendingRating | null>(null);

  const loadHome = useCallback(async (): Promise<void> => {
    if (!accessToken) {
      setIsLoading(false);
      return;
    }
    if (requestInFlight.current) return;
    requestInFlight.current = true;
    setLoadError(false);
    hasLoaded.current ? setIsRefreshing(true) : setIsLoading(true);

    try {
      // Keep failures separate from empty results so each section can explain itself.
      const [groupsResult, invitationsResult] = await Promise.allSettled([
        getGroups(accessToken),
        getMyGroupInvitations(accessToken),
      ]);
      if (groupsResult.status === 'rejected') throw groupsResult.reason;
      // Home shows the groups you take part in; followed public groups live in Grupos.
      const participating = sortGroups(groupsResult.value).filter(group => group.currentUserRole !== null);
      const failures = { activity: false, restaurants: false };
      const detailed = await Promise.all(participating.slice(0, DETAILED_GROUPS).map(async group => {
        const [members, groupActivity, restaurants] = await Promise.allSettled([
          getGroupMembers(group.id, accessToken),
          getGroupActivity(group.id, accessToken),
          getGroupRestaurants(group.id, accessToken),
        ]);
        if (groupActivity.status === 'rejected') failures.activity = true;
        if (restaurants.status === 'rejected') failures.restaurants = true;
        return {
          group,
          members: members.status === 'fulfilled' ? members.value : [],
          activity: groupActivity.status === 'fulfilled' ? groupActivity.value : [],
          restaurants: restaurants.status === 'fulfilled' ? restaurants.value : null,
        };
      }));

      const memberMap: Record<string, GroupMember[]> = {};
      const restaurantMap: Record<string, GroupRestaurant[]> = {};
      for (const item of detailed) {
        memberMap[item.group.id] = item.members;
        if (item.restaurants) restaurantMap[item.group.id] = item.restaurants;
      }

      setGroups(participating);
      setMembersByGroup(memberMap);
      setRestaurantsByGroup(restaurantMap);
      // Dedupe before trimming so repeated ratings don't crowd out other events.
      setActivity(dedupeActivity(detailed.flatMap(item => item.activity.map(activityItem => ({
        activity: activityItem, groupId: item.group.id, groupName: item.group.name,
      })))).slice(0, 3));
      setPendingInvitations(invitationsResult.status === 'fulfilled'
        ? invitationsResult.value.filter(invitation => invitation.status === 'PENDING') : []);
      setUnavailable(failures);
      setPendingRating(await findPendingRating(detailed.flatMap(item => (item.restaurants ?? [])
        .map(restaurant => ({ group: item.group, restaurant }))), accessToken));
      hasLoaded.current = true;
    } catch {
      setLoadError(true);
    } finally {
      requestInFlight.current = false;
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [accessToken]);

  useFocusEffect(useCallback(() => { void loadHome(); }, [loadHome]));
  const retry = () => void loadHome();

  async function saveRating(score: number): Promise<void> {
    if (!pendingRating || !accessToken) return;
    const { group, restaurant } = pendingRating.place;
    await saveRestaurantRating(group.id, restaurant.id, { score }, accessToken);
    setPendingRating(null);
  }

  function dismissRating(): void {
    if (pendingRating) dismissedRatings.add(pendingRating.place.restaurant.id);
    setPendingRating(null);
  }

  // Saved places of the loaded groups drive the city line and "Un sitio para hoy".
  const places = useMemo<SavedPlace[]>(() => groups.flatMap(group =>
    (restaurantsByGroup[group.id] ?? []).map(restaurant => ({ group, restaurant }))), [groups, restaurantsByGroup]);
  const cities = useMemo(() => listCities(places), [places]);
  const city = chosenCity !== null && cities.includes(chosenCity) ? chosenCity : cities[0] ?? null;
  const placeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const place of eligiblePlaces(places)) {
      const placeCityName = placeCity(place);
      if (placeCityName) counts[placeCityName] = (counts[placeCityName] ?? 0) + 1;
    }
    return counts;
  }, [places]);
  const candidates = useMemo(() => candidatesIn(places, city), [places, city]);
  const picked = candidates.find(place => place.restaurant.id === pickedId) ?? pickInitial(candidates);

  const recommendation: RecommendationState = picked
    ? { kind: 'pick', place: picked, canPickAnother: candidates.length > 1 }
    : unavailable.restaurants && places.length === 0 ? { kind: 'unavailable' }
      : places.length === 0 ? { kind: 'no-places' }
        : city ? { kind: 'none-in-city', city }
          : { kind: 'none-eligible' };

  function pickAnotherPlace(): void {
    const next = pickAnother(candidates, picked?.restaurant.id ?? null);
    if (!next) return;
    setPickedId(next.restaurant.id);
    AccessibilityInfo.announceForAccessibility(`Otro sitio: ${next.restaurant.restaurant.name}`);
  }

  function selectCity(nextCity: string): void {
    setChosenCity(nextCity);
    setPickedId(null);
    setCityPickerOpen(false);
  }

  const avatarUri = user?.avatarUrl ? resolveApiUrl(user.avatarUrl) : null;
  const userFirstName = user?.name?.trim().split(/\s+/)[0] || 'de nuevo';
  const hasGroups = groups.length > 0;
  const invitation = pendingInvitations[0] ?? null;

  return (
    <View style={styles.screen}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + space.s2,
          paddingBottom: tabBarHeight + space.s6,
          paddingLeft: insets.left,
          paddingRight: insets.right,
        }}
        refreshControl={<RefreshControl onRefresh={retry} refreshing={isRefreshing}
          tintColor={colors.accent} colors={[colors.accent]} progressBackgroundColor={colors.surfaceElevated} />}
        showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <HomeTopBar avatarUri={avatarUri} userName={user?.name ?? ''} />
          <AppText accessibilityRole="header" maxFontSizeMultiplier={1.6} style={styles.title}>
            Hola, {userFirstName}
          </AppText>
          {!isLoading && hasLoaded.current && !hasGroups ? (
            <AppText variant="body" tone="muted" style={styles.subtitle}>Tus sitios, con los tuyos.</AppText>
          ) : (
            <View style={styles.search}>
              <HomeSearchRow city={city} canChangeCity={cities.length > 1} onCityPress={() => setCityPickerOpen(true)} />
            </View>
          )}
        </View>

        {invitation && !isLoading && (
          <View style={styles.invitation}>
            <HomeInvitationMessage invitation={invitation} count={pendingInvitations.length} onAccepted={retry} />
          </View>
        )}

        <View style={styles.body}>
          {isLoading && <View style={styles.gutter}><DashboardSkeleton /></View>}

          {!isLoading && loadError && !hasLoaded.current && (
            <View style={styles.gutter}>
              <EmptyState icon={{ ios: 'exclamationmark.circle', android: 'error', web: 'error' }}
                title="No hemos podido cargar esta pantalla"
                message="Comprueba tu conexión y vuelve a intentarlo."
                actions={<Button size="lg" title="Reintentar" loading={isRefreshing} onPress={retry} />} />
            </View>
          )}

          {!isLoading && loadError && hasLoaded.current && (
            <View style={[styles.gutter, styles.banner]}>
              <InlineBanner title="No hemos podido actualizar tu inicio"
                message="Conservamos el contenido anterior. Puedes volver a intentarlo."
                actionLabel="Reintentar" actionLoading={isRefreshing} onAction={retry} />
            </View>
          )}

          {!isLoading && hasLoaded.current && (hasGroups ? (
            <HomeDashboardContent groups={groups} membersByGroup={membersByGroup}
              recommendation={recommendation} onPickAnother={pickAnotherPlace}
              pendingRating={pendingRating} onSaveRating={saveRating} onDismissRating={dismissRating}
              activity={activity} activityUnavailable={unavailable.activity} onRetry={retry} />
          ) : (
            <View style={styles.gutter}><HomeFirstTable /></View>
          ))}
        </View>
      </ScrollView>

      {cities.length > 1 && (
        <HomeCityPicker isPresented={cityPickerOpen} cities={cities} selectedCity={city} placeCounts={placeCounts}
          onSelect={selectCity} onDismiss={() => setCityPickerOpen(false)} />
      )}
    </View>
  );
}

/** First recently visited place the current user has not rated yet. */
async function findPendingRating(places: SavedPlace[], accessToken: string): Promise<PendingRating | null> {
  const visited = places
    .filter(place => place.restaurant.status === 'VISITED' && !dismissedRatings.has(place.restaurant.id))
    .sort((left, right) => new Date(right.restaurant.updatedAt).getTime() - new Date(left.restaurant.updatedAt).getTime())
    .slice(0, RATING_CANDIDATES);
  for (const place of visited) {
    try {
      const summary = await getRestaurantRatings(place.group.id, place.restaurant.id, accessToken);
      if (summary.currentUserScore === null) return { place, summary };
    } catch {
      // Without ratings the card cannot explain the group average; skip it.
    }
  }
  return null;
}

// Vertical rhythm from the artboard: 20 for text, 16 for cards, 30 between sections.
const useStyles = createThemedStyles(({ colors }) => ({
  screen: { flex: 1, backgroundColor: colors.background },
  header: { paddingLeft: TEXT_GUTTER, paddingRight: 12 },
  title: {
    marginTop: space.s4, fontFamily: fonts.display, fontSize: 28, lineHeight: 32, letterSpacing: -0.8,
    color: colors.textPrimary,
  },
  subtitle: { marginTop: 6, fontSize: 15, lineHeight: 22 },
  search: { marginTop: space.s4, marginRight: space.s2 },
  invitation: { marginTop: space.s4, paddingHorizontal: CARD_GUTTER },
  gutter: { paddingHorizontal: CARD_GUTTER },
  body: { marginTop: space.s6 },
  banner: { marginBottom: space.s5 },
}));
