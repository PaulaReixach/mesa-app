import { useBottomTabBarHeight } from 'expo-router/js-tabs';
import { useFocusEffect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useMemo, useRef, useState } from 'react';
import { AccessibilityInfo, RefreshControl, ScrollView, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { HomeActivityEntry } from '../components/HomeActivityRow';
import { HomeCityPicker } from '../components/HomeCityPicker';
import { HomeDashboardContent, type RecommendationState } from '../components/HomeDashboardContent';
import { HomeFirstTable } from '../components/HomeFirstTable';
import { HomeCityLine, HomeSearchTrigger, HomeTopBar } from '../components/HomeHeader';
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
import { getGroupRestaurants } from '../services/restaurant-service';
import { createThemedStyles, radius, screenGutter, space, useTheme } from '../theme';
import type { RestaurantGroup } from '../types/group';
import type { GroupInvitation } from '../types/group-invitation';
import type { GroupMember } from '../types/group-member';
import type { GroupRestaurant } from '../types/restaurant';

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
  const { width } = useWindowDimensions();
  const gutter = screenGutter(width - insets.left - insets.right);
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
          paddingTop: insets.top,
          paddingBottom: tabBarHeight + space.s6,
          paddingLeft: insets.left + gutter,
          paddingRight: insets.right + gutter,
        }}
        refreshControl={<RefreshControl onRefresh={retry} refreshing={isRefreshing}
          tintColor={colors.accent} colors={[colors.accent]} progressBackgroundColor={colors.surfaceElevated} />}
        showsVerticalScrollIndicator={false}>
        <HomeTopBar avatarUri={avatarUri} userName={user?.name ?? ''} />

        <AppText accessibilityRole="header" variant="screenTitle" maxFontSizeMultiplier={1.6} style={styles.title}>
          Hola, {userFirstName}
        </AppText>

        {!isLoading && hasLoaded.current && !hasGroups ? (
          <AppText variant="body" tone="muted" style={styles.subtitle}>Tus sitios, con los tuyos.</AppText>
        ) : city ? (
          <HomeCityLine city={city} canChange={cities.length > 1} onPress={() => setCityPickerOpen(true)} />
        ) : null}

        {(isLoading || hasGroups || loadError) && (
          <View style={styles.search}><HomeSearchTrigger /></View>
        )}

        {invitation && !isLoading && (
          <View style={styles.invitation}>
            <HomeInvitationMessage invitation={invitation} count={pendingInvitations.length} onAccepted={retry} />
          </View>
        )}

        <View style={styles.body}>
          {isLoading && <DashboardSkeleton />}

          {!isLoading && loadError && !hasLoaded.current && (
            <EmptyState icon={{ ios: 'exclamationmark.circle', android: 'error', web: 'error' }}
              title="No hemos podido cargar esta pantalla"
              message="Comprueba tu conexión y vuelve a intentarlo."
              actions={<Button size="lg" title="Reintentar" loading={isRefreshing} onPress={retry} />} />
          )}

          {!isLoading && loadError && hasLoaded.current && (
            <View style={styles.banner}>
              <InlineBanner title="No hemos podido actualizar tu inicio"
                message="Conservamos el contenido anterior. Puedes volver a intentarlo."
                actionLabel="Reintentar" actionLoading={isRefreshing} onAction={retry} />
            </View>
          )}

          {!isLoading && hasLoaded.current && (hasGroups ? (
            <HomeDashboardContent groups={groups} membersByGroup={membersByGroup} restaurantsByGroup={restaurantsByGroup}
              recommendation={recommendation} onPickAnother={pickAnotherPlace}
              activity={activity} activityUnavailable={unavailable.activity} onRetry={retry} />
          ) : (
            <HomeFirstTable />
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

// Vertical rhythm from the prototype (DESIGN.md › Layout).
const useStyles = createThemedStyles(({ colors }) => ({
  screen: { flex: 1, backgroundColor: colors.background },
  title: { marginTop: 6 },
  subtitle: { marginTop: 6 },
  search: { marginTop: space.s2 },
  invitation: { marginTop: space.s4 },
  body: { marginTop: 28 },
  banner: { marginBottom: 28 },
}));
