import { useBottomTabBarHeight } from 'expo-router/js-tabs';
import { useFocusEffect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useRef, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import type { HomeActivityEntry } from '../components/HomeActivityRow';
import { HomeDashboardContentRefined } from '../components/HomeDashboardContentRefined';
import { HomeHeader } from '../components/HomeHeader';
import { homeFocusStyle, homeStyles as styles } from '../components/HomeDashboardStyles';
import type { HomeRecommendation } from '../components/HomeRecommendationCard';
import { useAuth } from '../contexts/auth-context';
import { resolveApiUrl } from '../lib/api';
import { getGroupActivity } from '../services/group-activity-service';
import { getMyGroupInvitations } from '../services/group-invitation-service';
import { getGroupMembers } from '../services/group-member-service';
import { getGroups } from '../services/group-service';
import { getGroupRestaurants } from '../services/restaurant-service';
import { loginColors } from '../theme/colors';
import type { RestaurantGroup } from '../types/group';
import type { GroupActivityItem } from '../types/group-activity';
import type { GroupMember } from '../types/group-member';
import type { GroupRestaurant } from '../types/restaurant';

type GroupDashboardData = {
  activity: GroupActivityItem[];
  group: RestaurantGroup;
  members: GroupMember[];
  restaurants: GroupRestaurant[];
};

function sortGroups(groups: RestaurantGroup[]): RestaurantGroup[] {
  return [...groups].sort((left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime());
}

function pickRecommendation(data: GroupDashboardData[]): HomeRecommendation | null {
  const candidates = data.flatMap(({ group, restaurants }) => restaurants.map(restaurant => ({ group, restaurant })));
  if (candidates.length === 0) return null;
  return [...candidates].sort((left, right) => {
    const leftScore = left.restaurant.averageScore ?? -1;
    const rightScore = right.restaurant.averageScore ?? -1;
    if (rightScore !== leftScore) return rightScore - leftScore;
    if (right.restaurant.ratingsCount !== left.restaurant.ratingsCount) {
      return right.restaurant.ratingsCount - left.restaurant.ratingsCount;
    }
    return new Date(right.restaurant.updatedAt).getTime() - new Date(left.restaurant.updatedAt).getTime();
  })[0];
}

export default function HomeScreenRefined() {
  const { user, accessToken } = useAuth();
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const { width } = useWindowDimensions();
  const gutter = width - insets.left - insets.right < 360 ? 20 : 24;
  const hasLoaded = useRef(false);
  const requestInFlight = useRef(false);
  const [groups, setGroups] = useState<RestaurantGroup[]>([]);
  const [membersByGroup, setMembersByGroup] = useState<Record<string, GroupMember[]>>({});
  const [activity, setActivity] = useState<HomeActivityEntry[]>([]);
  const [recommendation, setRecommendation] = useState<HomeRecommendation | null>(null);
  const [pendingInvitationCount, setPendingInvitationCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [unavailable, setUnavailable] = useState({ invitations: false, activity: false, restaurants: false });
  const [retryFocused, setRetryFocused] = useState(false);

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
      // Keep the existing requests and selection; retain failures separately from empty results.
      const [groupsResult, invitationsResult] = await Promise.allSettled([
        getGroups(accessToken),
        getMyGroupInvitations(accessToken),
      ]);
      if (groupsResult.status === 'rejected') throw groupsResult.reason;
      const orderedGroups = sortGroups(groupsResult.value);
      const failures = { invitations: invitationsResult.status === 'rejected', activity: false, restaurants: false };
      const dashboardData = await Promise.all(orderedGroups.slice(0, 4).map(async group => {
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
          restaurants: restaurants.status === 'fulfilled' ? restaurants.value : [],
        } satisfies GroupDashboardData;
      }));
      const memberMap = dashboardData.reduce<Record<string, GroupMember[]>>((result, item) => {
        result[item.group.id] = item.members;
        return result;
      }, {});
      const recentActivity = dashboardData.flatMap(item => item.activity.map(activityItem => ({
        activity: activityItem, groupId: item.group.id, groupName: item.group.name,
      }))).sort((left, right) => new Date(right.activity.createdAt).getTime() - new Date(left.activity.createdAt).getTime()).slice(0, 3);

      setGroups(orderedGroups);
      setMembersByGroup(memberMap);
      setActivity(recentActivity);
      setRecommendation(pickRecommendation(dashboardData));
      setPendingInvitationCount(invitationsResult.status === 'fulfilled'
        ? invitationsResult.value.filter(invitation => invitation.status === 'PENDING').length : null);
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
  const avatarUri = user?.avatarUrl ? resolveApiUrl(user.avatarUrl) : null;
  const userInitial = user?.name?.charAt(0).toUpperCase() ?? '?';
  const userName = user?.name?.trim().split(/\s+/)[0] || 'de nuevo';
  const partialError = unavailable.invitations || unavailable.activity || unavailable.restaurants;

  return (
    <SafeAreaView edges={['left', 'right']} style={styles.safeArea}>
      <StatusBar style="light" />
      <View style={{ height: insets.top }} />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: tabBarHeight + 24 }]}
        refreshControl={<RefreshControl onRefresh={() => void loadHome()} refreshing={isRefreshing} tintColor={loginColors.primary} colors={[loginColors.primary]} />}
        showsVerticalScrollIndicator={false}>
        <HomeHeader avatarUri={avatarUri} pendingInvitationCount={pendingInvitationCount} topInset={0}
          userName={userName} userInitial={userInitial} gutter={gutter}
          showQuickActions={hasLoaded.current && groups.length > 0} />
        {isLoading && (
          <View style={styles.loadingCard} accessibilityLiveRegion="polite" accessibilityLabel="Cargando tu inicio" accessibilityState={{ busy: true }}>
            <Text style={styles.loadingText}>Preparando tu inicio…</Text>
            <View accessible={false} style={styles.skeletonTitle} />
            <View accessible={false} style={styles.skeletonCard} />
          </View>
        )}
        {!isLoading && (loadError || partialError) && (
          <View style={[styles.errorCard, { marginHorizontal: gutter }]} accessibilityLiveRegion="polite">
            <View style={styles.errorCopy}>
              <Text style={styles.errorTitle}>{loadError
                ? (hasLoaded.current ? 'No hemos podido actualizar tu inicio' : 'No hemos podido cargar tu inicio')
                : 'Parte de tu inicio no se ha podido actualizar'}</Text>
              <Text style={styles.errorText}>{loadError
                ? (hasLoaded.current ? 'Conservamos el contenido anterior. Puedes volver a intentarlo.' : 'Vuelve a intentarlo para ver tus grupos y restaurantes.')
                : unavailable.invitations ? 'No hemos podido comprobar tus invitaciones. El resto del contenido disponible sigue accesible.'
                  : 'Puedes seguir usando el contenido disponible y volver a intentar la carga.'}</Text>
              <Pressable accessibilityRole="button" accessibilityState={{ disabled: isRefreshing, busy: isRefreshing }}
                disabled={isRefreshing} onPress={() => void loadHome()} onFocus={() => setRetryFocused(true)} onBlur={() => setRetryFocused(false)}
                style={({ pressed }) => [styles.retryButton, pressed && styles.pressed, retryFocused && homeFocusStyle]}>
                <Text style={styles.retryText}>{isRefreshing ? 'Actualizando…' : 'Reintentar'}</Text>
              </Pressable>
            </View>
          </View>
        )}
        {!isLoading && hasLoaded.current && (
          <HomeDashboardContentRefined activity={activity} groups={groups} membersByGroup={membersByGroup}
            pendingInvitationCount={pendingInvitationCount} recommendation={recommendation} gutter={gutter}
            activityUnavailable={unavailable.activity} recommendationUnavailable={unavailable.restaurants} />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
