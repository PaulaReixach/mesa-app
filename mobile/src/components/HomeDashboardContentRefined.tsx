import { SymbolView } from 'expo-symbols';
import { router, type Href } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { HomeActivityRow, type HomeActivityEntry } from './HomeActivityRow';
import { HomeGroupCard } from './HomeGroupCard';
import { HomeRecommendationCard, type HomeRecommendation } from './HomeRecommendationCard';
import { PrimaryButton } from './PrimaryButton';
import { homeFocusStyle, homeStyles as styles } from './HomeDashboardStyles';
import { loginColors } from '../theme/colors';
import type { RestaurantGroup } from '../types/group';
import type { GroupMember } from '../types/group-member';

function SectionAction({ label, accessibilityLabel, onPress }: {
  label: string; accessibilityLabel: string; onPress: () => void;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={accessibilityLabel}
      onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} onPress={onPress}
      style={({ pressed }) => [styles.sectionAction, pressed && styles.pressed, focused && homeFocusStyle]}>
      <Text style={styles.sectionActionText}>{label}</Text>
      <SymbolView accessible={false} name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }} size={16} tintColor={loginColors.primary} />
    </Pressable>
  );
}

export function HomeDashboardContentRefined({
  activity, groups, membersByGroup, recommendation, pendingInvitationCount,
  gutter = 24, activityUnavailable = false, recommendationUnavailable = false,
}: {
  activity: HomeActivityEntry[];
  groups: RestaurantGroup[];
  membersByGroup: Record<string, GroupMember[]>;
  pendingInvitationCount: number | null;
  recommendation: HomeRecommendation | null;
  gutter?: number;
  activityUnavailable?: boolean;
  recommendationUnavailable?: boolean;
}) {
  const featuredGroup = groups[0] ?? null;
  const hasInvitation = (pendingInvitationCount ?? 0) > 0;

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
      params: { groupId: recommendation.group.id, groupRestaurantId: recommendation.restaurant.id },
    });
  }

  return (
    <View style={[styles.dashboard, { paddingHorizontal: gutter }]}>
      {featuredGroup ? (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text accessibilityRole="header" style={styles.sectionTitle}>Tus grupos</Text>
            {groups.length > 1 && <SectionAction label="Ver todos" accessibilityLabel="Ver todos tus grupos" onPress={() => router.push('/groups')} />}
          </View>
          <HomeGroupCard group={featuredGroup} members={membersByGroup[featuredGroup.id] ?? []} onPress={() => openGroup(featuredGroup)} />
        </View>
      ) : (
        <View style={styles.emptyCard}>
          <View style={styles.emptyIcon} accessible={false} importantForAccessibility="no-hide-descendants">
            <SymbolView name={hasInvitation
              ? { ios: 'envelope', android: 'mail', web: 'mail' }
              : { ios: 'person.2', android: 'group', web: 'group' }} size={26} tintColor={loginColors.primary} />
          </View>
          <View style={styles.emptyCopy}>
            <Text accessibilityRole="header" style={styles.emptyTitle}>
              {hasInvitation ? 'Te han guardado un sitio' : 'Los buenos planes empiezan en grupo'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {hasInvitation
                ? `Tienes ${pendingInvitationCount} ${pendingInvitationCount === 1 ? 'invitación pendiente' : 'invitaciones pendientes'}. Revisa los detalles para unirte a tu gente.`
                : 'Crea un grupo para guardar restaurantes y decidir con los tuyos.'}
            </Text>
          </View>
          <PrimaryButton variant="login"
            title={hasInvitation ? (pendingInvitationCount === 1 ? 'Ver invitación' : 'Ver invitaciones') : 'Crear mi primer grupo'}
            onPress={() => router.push(hasInvitation ? '/group-invitations' : '/groups/create')} />
          <SectionAction label={hasInvitation ? 'Crear un grupo' : 'Ver invitaciones'}
            accessibilityLabel={hasInvitation ? 'Crear un grupo' : 'Ver invitaciones'}
            onPress={() => router.push(hasInvitation ? '/groups/create' : '/group-invitations')} />
        </View>
      )}

      {recommendation ? (
        <View style={styles.section}>
          <Text accessibilityRole="header" style={styles.sectionTitle}>Una buena opción</Text>
          <HomeRecommendationCard onPress={openRecommendation} recommendation={recommendation} />
          {recommendationUnavailable && <Text style={styles.emptySubtitle}>Faltan restaurantes por cargar. Esta opción corresponde al contenido disponible.</Text>}
        </View>
      ) : recommendationUnavailable && featuredGroup ? (
        <View style={styles.section}>
          <Text accessibilityRole="header" style={styles.sectionTitle}>Una buena opción</Text>
          <Text style={styles.emptySubtitle}>No hemos podido cargar los restaurantes para esta sección.</Text>
        </View>
      ) : null}

      {featuredGroup && (
        <View style={styles.section}>
          <Text accessibilityRole="header" style={styles.sectionTitle}>Actividad reciente</Text>
          {activity.length > 0 ? (
            <View style={styles.activityList}>
              {activity.slice(0, 2).map(entry => <HomeActivityRow entry={entry} key={entry.activity.id} />)}
            </View>
          ) : (
            <Text style={styles.emptySubtitle}>
              {activityUnavailable ? 'No hemos podido cargar la actividad de tus grupos.'
                : 'Cuando compartáis restaurantes o valoraciones, aparecerán aquí.'}
            </Text>
          )}
          {activityUnavailable && activity.length > 0 && <Text style={styles.emptySubtitle}>No se ha podido actualizar la actividad de todos los grupos.</Text>}
        </View>
      )}
    </View>
  );
}
