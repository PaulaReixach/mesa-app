import { SymbolView } from 'expo-symbols';
import { router } from 'expo-router';
import type { Href } from 'expo-router';
import {
  Pressable,
  Text,
  View,
} from 'react-native';

import {
  HomeActivityRow,
  type HomeActivityEntry,
} from './HomeActivityRow';
import { HomeGroupCard } from './HomeGroupCard';
import { HomeInvitationBanner } from './HomeInvitationBanner';
import {
  HomeRecommendationCard,
  type HomeRecommendation,
} from './HomeRecommendationCard';
import { homeStyles as styles } from './HomeDashboardStyles';
import { colors } from '../theme/colors';
import type { RestaurantGroup } from '../types/group';
import type { GroupMember } from '../types/group-member';

export function HomeDashboardContent({
  activity,
  groups,
  membersByGroup,
  pendingInvitationCount,
  recommendation,
}: {
  activity: HomeActivityEntry[];
  groups: RestaurantGroup[];
  membersByGroup: Record<string, GroupMember[]>;
  pendingInvitationCount: number;
  recommendation: HomeRecommendation | null;
}) {
  const visibleGroups = groups.slice(0, 2);

  function openGroup(group: RestaurantGroup): void {
    if (group.privacy === 'PUBLIC') {
      router.push(`/groups/public/${group.id}` as Href);
      return;
    }

    router.push({
      pathname: '/groups/[groupId]',
      params: { groupId: group.id },
    });
  }

  function openRecommendation(): void {
    if (!recommendation) return;

    router.push({
      pathname: '/groups/[groupId]/restaurants/[groupRestaurantId]',
      params: {
        groupId: recommendation.group.id,
        groupRestaurantId: recommendation.restaurant.id,
      },
    });
  }

  return (
    <>
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Tus grupos</Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/groups')}
            style={styles.sectionAction}
          >
            <Text style={styles.sectionActionText}>
              Ver todos ({groups.length})
            </Text>
            <SymbolView
              name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
              size={14}
              tintColor="#5D7444"
            />
          </Pressable>
        </View>

        {visibleGroups.length > 0 ? (
          <View style={styles.groupGrid}>
            {visibleGroups.map(group => (
              <HomeGroupCard
                group={group}
                key={group.id}
                members={membersByGroup[group.id] ?? []}
                onPress={() => openGroup(group)}
              />
            ))}
          </View>
        ) : (
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/groups/create')}
            style={({ pressed }) => [
              styles.emptyCard,
              pressed ? styles.pressed : null,
            ]}
          >
            <View style={styles.emptyIcon}>
              <SymbolView
                name={{ ios: 'person.2.badge.plus', android: 'group_add', web: 'group_add' }}
                size={23}
                tintColor={colors.primary}
              />
            </View>
            <View style={styles.emptyCopy}>
              <Text style={styles.emptyTitle}>Crea tu primer grupo</Text>
              <Text style={styles.emptySubtitle}>
                Guarda restaurantes y organiza planes con tu gente.
              </Text>
            </View>
            <SymbolView
              name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
              size={18}
              tintColor={colors.muted}
            />
          </Pressable>
        )}
      </View>

      {pendingInvitationCount > 0 ? (
        <HomeInvitationBanner
          count={pendingInvitationCount}
          onPress={() => router.push('/group-invitations')}
        />
      ) : null}

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Actividad reciente</Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/notifications')}
            style={styles.sectionAction}
          >
            <Text style={styles.sectionActionText}>Ver toda</Text>
            <SymbolView
              name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
              size={14}
              tintColor="#5D7444"
            />
          </Pressable>
        </View>

        {activity.length > 0 ? (
          <View style={styles.activityList}>
            {activity.map(entry => (
              <HomeActivityRow entry={entry} key={entry.activity.id} />
            ))}
          </View>
        ) : (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
              <SymbolView
                name={{ ios: 'waveform.path.ecg', android: 'monitor_heart', web: 'monitor_heart' }}
                size={22}
                tintColor={colors.primary}
              />
            </View>
            <View style={styles.emptyCopy}>
              <Text style={styles.emptyTitle}>Todo tranquilo por aquí</Text>
              <Text style={styles.emptySubtitle}>
                La actividad de tus grupos aparecerá en este espacio.
              </Text>
            </View>
          </View>
        )}
      </View>

      {recommendation ? (
        <HomeRecommendationCard
          onPress={openRecommendation}
          recommendation={recommendation}
        />
      ) : null}
    </>
  );
}
