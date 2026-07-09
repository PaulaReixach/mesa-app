import { SymbolView } from 'expo-symbols';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { HomeActivityEntry } from '../components/HomeActivityRow';
import { HomeDashboardContentRefined } from '../components/HomeDashboardContentRefined';
import { HomeHeader } from '../components/HomeHeader';
import { homeStyles as styles } from '../components/HomeDashboardStyles';
import { refinedHomeStyles as refined } from '../components/HomeRefinedStyles';
import type { HomeRecommendation } from '../components/HomeRecommendationCard';
import { useAuth } from '../contexts/auth-context';
import { getErrorMessage, resolveApiUrl } from '../lib/api';
import { getGroupActivity } from '../services/group-activity-service';
import { getMyGroupInvitations } from '../services/group-invitation-service';
import { getGroupMembers } from '../services/group-member-service';
import { getGroups } from '../services/group-service';
import { getGroupRestaurants } from '../services/restaurant-service';
import { colors } from '../theme/colors';
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
  return [...groups].sort((left, right) => (
    new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime()
  ));
}

function pickRecommendation(data: GroupDashboardData[]): HomeRecommendation | null {
  const candidates = data.flatMap(({ group, restaurants }) => (
    restaurants.map(restaurant => ({ group, restaurant }))
  ));

  if (candidates.length === 0) return null;

  return [...candidates].sort((left, right) => {
    const leftScore = left.restaurant.averageScore ?? -1;
    const rightScore = right.restaurant.averageScore ?? -1;

    if (rightScore !== leftScore) return rightScore - leftScore;
    if (right.restaurant.ratingsCount !== left.restaurant.ratingsCount) {
      return right.restaurant.ratingsCount - left.restaurant.ratingsCount;
    }

    return new Date(right.restaurant.updatedAt).getTime()
      - new Date(left.restaurant.updatedAt).getTime();
  })[0];
}

export default function HomeScreenRefined() {
  const { user, accessToken } = useAuth();
  const [groups, setGroups] = useState<RestaurantGroup[]>([]);
  const [membersByGroup, setMembersByGroup] = useState<Record<string, GroupMember[]>>({});
  const [activity, setActivity] = useState<HomeActivityEntry[]>([]);
  const [recommendation, setRecommendation] = useState<HomeRecommendation | null>(null);
  const [pendingInvitationCount, setPendingInvitationCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadHome = useCallback(async (refreshing = false): Promise<void> => {
    if (!accessToken) {
      setIsLoading(false);
      return;
    }

    try {
      setLoadError(null);
      refreshing ? setIsRefreshing(true) : setIsLoading(true);

      const [groupsResponse, invitationsResponse] = await Promise.all([
        getGroups(accessToken),
        getMyGroupInvitations(accessToken).catch(() => []),
      ]);

      const orderedGroups = sortGroups(groupsResponse);
      const groupsToEnrich = orderedGroups.slice(0, 4);
      const dashboardData = await Promise.all(
        groupsToEnrich.map(async group => {
          const [members, groupActivity, restaurants] = await Promise.all([
            getGroupMembers(group.id, accessToken).catch(() => []),
            getGroupActivity(group.id, accessToken).catch(() => []),
            getGroupRestaurants(group.id, accessToken).catch(() => []),
          ]);

          return { group, members, activity: groupActivity, restaurants } satisfies GroupDashboardData;
        }),
      );

      const memberMap = dashboardData.reduce<Record<string, GroupMember[]>>((result, item) => {
        result[item.group.id] = item.members;
        return result;
      }, {});

      const recentActivity = dashboardData
        .flatMap(item => item.activity.map(activityItem => ({
          activity: activityItem,
          groupId: item.group.id,
          groupName: item.group.name,
        })))
        .sort((left, right) => (
          new Date(right.activity.createdAt).getTime()
          - new Date(left.activity.createdAt).getTime()
        ))
        .slice(0, 3);

      setGroups(orderedGroups);
      setMembersByGroup(memberMap);
      setActivity(recentActivity);
      setRecommendation(pickRecommendation(dashboardData));
      setPendingInvitationCount(
        invitationsResponse.filter(invitation => invitation.status === 'PENDING').length,
      );
    } catch (error) {
      setLoadError(getErrorMessage(error));
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [accessToken]);

  useFocusEffect(useCallback(() => {
    void loadHome();
  }, [loadHome]));

  const avatarUri = user?.avatarUrl ? resolveApiUrl(user.avatarUrl) : null;
  const userInitial = user?.name?.charAt(0).toUpperCase() ?? '?';

  return (
    <SafeAreaView
      edges={['top', 'right', 'left']}
      style={[styles.safeArea, refined.safeArea]}
    >
      <ScrollView
        contentContainerStyle={[styles.content, refined.content]}
        refreshControl={(
          <RefreshControl
            onRefresh={() => void loadHome(true)}
            refreshing={isRefreshing}
            tintColor={colors.primary}
          />
        )}
        showsVerticalScrollIndicator={false}
      >
        <HomeHeader
          avatarUri={avatarUri}
          pendingInvitationCount={pendingInvitationCount}
          userInitial={userInitial}
        />

        {isLoading ? (
          <View style={[styles.loadingCard, refined.loadingCard]}>
            <ActivityIndicator color={colors.primary} size="large" />
            <Text style={[styles.loadingText, refined.loadingText]}>Preparando tu inicio...</Text>
          </View>
        ) : null}

        {!isLoading && loadError ? (
          <View style={styles.errorCard}>
            <View style={styles.errorIcon}>
              <SymbolView
                name={{ ios: 'exclamationmark.triangle.fill', android: 'warning', web: 'warning' }}
                size={20}
                tintColor={colors.danger}
              />
            </View>
            <View style={styles.errorCopy}>
              <Text style={styles.errorTitle}>No hemos podido cargar tu inicio</Text>
              <Text style={styles.errorText}>{loadError}</Text>
              <Pressable onPress={() => void loadHome()}>
                <Text style={styles.retryText}>Volver a intentar</Text>
              </Pressable>
            </View>
          </View>
        ) : null}

        {!isLoading && !loadError ? (
          <HomeDashboardContentRefined
            activity={activity}
            groups={groups}
            membersByGroup={membersByGroup}
            pendingInvitationCount={pendingInvitationCount}
            recommendation={recommendation}
          />
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
