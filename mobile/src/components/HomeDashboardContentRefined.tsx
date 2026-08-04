import { SymbolView } from 'expo-symbols';
import { router } from 'expo-router';
import type { Href } from 'expo-router';
import {
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

import { HomeActivityRow, type HomeActivityEntry } from './HomeActivityRow';
import { HomeGroupCard } from './HomeGroupCard';
import { HomeRecommendationCard, type HomeRecommendation } from './HomeRecommendationCard';
import { homeStyles as styles } from './HomeDashboardStyles';
import { colors } from '../theme/colors';
import type { RestaurantGroup } from '../types/group';
import type { GroupMember } from '../types/group-member';

export const HOME_GROUP_PREVIEW_LIMIT = 6;

const DASHBOARD_HORIZONTAL_PADDING = 22;
const GROUP_CARD_GAP = 10;
const GROUP_CARD_PEEK = 18;

function SectionAction({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.sectionAction,
        pressed ? styles.pressed : null,
      ]}
    >
      <Text allowFontScaling={false} style={styles.sectionActionText}>{label}</Text>
      <SymbolView
        name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
        size={16}
        tintColor={colors.olive}
      />
    </Pressable>
  );
}

export function HomeDashboardContentRefined({
  activity,
  groups,
  membersByGroup,
  recommendation,
}: {
  activity: HomeActivityEntry[];
  groups: RestaurantGroup[];
  membersByGroup: Record<string, GroupMember[]>;
  pendingInvitationCount: number;
  recommendation: HomeRecommendation | null;
}) {
  const { width: windowWidth } = useWindowDimensions();
  const visibleGroups = groups.slice(0, HOME_GROUP_PREVIEW_LIMIT);
  const availableWidth = windowWidth - (DASHBOARD_HORIZONTAL_PADDING * 2);
  const hasScrollableGroups = visibleGroups.length > 2;
  const groupCardWidth = hasScrollableGroups
    ? (availableWidth - (GROUP_CARD_GAP * 2) - GROUP_CARD_PEEK) / 2
    : (availableWidth - GROUP_CARD_GAP) / 2;

  function openGroup(group: RestaurantGroup): void {
    if (group.privacy === 'PUBLIC') {
      router.push(`/groups/public/${group.id}` as Href);
      return;
    }

    router.push({ pathname: '/groups/[groupId]', params: { groupId: group.id } });
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
    <View style={styles.dashboard}>
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text allowFontScaling={false} style={styles.sectionTitle}>Tus grupos</Text>
          <SectionAction label="Ver todos" onPress={() => router.push('/groups')} />
        </View>

        {visibleGroups.length === 1 ? (
          <HomeGroupCard
            group={visibleGroups[0]}
            layout="wide"
            members={membersByGroup[visibleGroups[0].id] ?? []}
            onPress={() => openGroup(visibleGroups[0])}
          />
        ) : null}

        {visibleGroups.length > 1 ? (
          <ScrollView
            accessibilityLabel="Tus grupos"
            contentContainerStyle={styles.groupCarouselContent}
            decelerationRate="fast"
            disableIntervalMomentum={hasScrollableGroups}
            horizontal
            scrollEnabled={hasScrollableGroups}
            showsHorizontalScrollIndicator={false}
            snapToAlignment="start"
            snapToInterval={hasScrollableGroups
              ? groupCardWidth + GROUP_CARD_GAP
              : undefined}
            style={styles.groupCarousel}
          >
            {visibleGroups.map(group => (
              <HomeGroupCard
                cardWidth={groupCardWidth}
                group={group}
                key={group.id}
                layout="grid"
                members={membersByGroup[group.id] ?? []}
                onPress={() => openGroup(group)}
              />
            ))}
          </ScrollView>
        ) : null}

        {visibleGroups.length === 0 ? (
          <Pressable
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
              <Text allowFontScaling={false} style={styles.emptyTitle}>Crea tu primer grupo</Text>
              <Text allowFontScaling={false} style={styles.emptySubtitle}>
                Guarda restaurantes y organiza planes con tu gente.
              </Text>
            </View>
            <SymbolView
              name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
              size={18}
              tintColor={colors.muted}
            />
          </Pressable>
        ) : null}
      </View>

      {recommendation ? (
        <View style={styles.section}>
          <View style={styles.sectionIntro}>
            <Text allowFontScaling={false} style={styles.sectionTitle}>
              Para vuestro próximo plan
            </Text>
            <Text allowFontScaling={false} style={styles.sectionSubtitle}>
              Uno de vuestros restaurantes pendientes
            </Text>
          </View>
          <HomeRecommendationCard
            onPress={openRecommendation}
            recommendation={recommendation}
          />
        </View>
      ) : null}

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text allowFontScaling={false} style={styles.sectionTitle}>Actividad reciente</Text>
          <SectionAction label="Ver todo" onPress={() => router.push('/notifications')} />
        </View>

        {activity.length > 0 ? (
          <View style={styles.activityList}>
            {activity.slice(0, 2).map(entry => (
              <HomeActivityRow entry={entry} key={entry.activity.id} />
            ))}
          </View>
        ) : (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
              <SymbolView
                name={{ ios: 'waveform.path.ecg', android: 'monitor_heart', web: 'monitor_heart' }}
                size={21}
                tintColor={colors.primary}
              />
            </View>
            <View style={styles.emptyCopy}>
              <Text allowFontScaling={false} style={styles.emptyTitle}>Todo tranquilo por aquí</Text>
              <Text allowFontScaling={false} style={styles.emptySubtitle}>
                La actividad de tus grupos aparecerá en este espacio.
              </Text>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}
