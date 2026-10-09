import { router, type Href } from 'expo-router';
import { View } from 'react-native';

import { HomeActivityRow, type HomeActivityEntry } from './HomeActivityRow';
import { HomeGroupCard } from './HomeGroupCard';
import { HomeRecommendationCard, type HomeRecommendation } from './HomeRecommendationCard';
import { AppText } from './ui/AppText';
import { Button } from './ui/Button';
import { EmptyState } from './ui/EmptyState';
import { SectionHeader } from './ui/SectionHeader';
import { createThemedStyles, space } from '../theme';
import type { RestaurantGroup } from '../types/group';
import type { GroupMember } from '../types/group-member';
import type { GroupRestaurant } from '../types/restaurant';

const MAX_GROUPS = 2;
const MAX_ACTIVITY = 3;

function openGroup(group: RestaurantGroup): void {
  if (group.privacy === 'PUBLIC') {
    router.push(`/groups/public/${group.id}` as Href);
    return;
  }
  router.push({ pathname: '/groups/[groupId]', params: { groupId: group.id } });
}

export type RecommendationState =
  | { kind: 'pick'; place: HomeRecommendation; canPickAnother: boolean }
  | { kind: 'no-places' }
  | { kind: 'none-in-city'; city: string }
  | { kind: 'none-eligible' }
  | { kind: 'unavailable' };

function RecommendationEmpty({ state, onRetry }: { state: Exclude<RecommendationState, { kind: 'pick' }>; onRetry: () => void }) {
  switch (state.kind) {
    case 'no-places':
      return (
        <EmptyState compact icon={{ ios: 'fork.knife', android: 'restaurant', web: 'restaurant' }}
          title="Guardad vuestro primer sitio"
          message="Añadid restaurantes a vuestros grupos y aquí os propondremos uno para hoy."
          actions={<Button variant="text" tone="accent" title="Añadir restaurante" onPress={() => router.push('/add')} />} />
      );
    case 'none-in-city':
      return (
        <EmptyState compact icon={{ ios: 'mappin', android: 'location_on', web: 'location_on' }}
          title={`Tu próxima lista en ${state.city}`}
          message="Todavía no tenéis restaurantes guardados en esta ciudad." />
      );
    case 'none-eligible':
      return (
        <EmptyState compact icon={{ ios: 'fork.knife', android: 'restaurant', web: 'restaurant' }}
          title="Nada pendiente por ahora"
          message="Los sitios que tenéis guardados están archivados o marcados como «No repetir»." />
      );
    case 'unavailable':
      return (
        <EmptyState compact icon={{ ios: 'exclamationmark.circle', android: 'error', web: 'error' }}
          title="No hemos podido cargar los restaurantes"
          message="Vuelve a intentarlo para ver una propuesta para hoy."
          actions={<Button variant="text" tone="accent" title="Reintentar" onPress={onRetry} />} />
      );
  }
}

export function HomeDashboardContent({
  groups,
  membersByGroup,
  restaurantsByGroup,
  recommendation,
  onPickAnother,
  activity,
  activityUnavailable,
  onRetry,
}: {
  groups: RestaurantGroup[];
  membersByGroup: Record<string, GroupMember[]>;
  /** Only groups whose restaurants loaded have an entry. */
  restaurantsByGroup: Record<string, GroupRestaurant[]>;
  recommendation: RecommendationState;
  onPickAnother: () => void;
  activity: HomeActivityEntry[];
  activityUnavailable: boolean;
  onRetry: () => void;
}) {
  const styles = useStyles();

  return (
    <View style={styles.dashboard}>
      <View>
        <SectionHeader title="Tus grupos" caption="Vuestros restaurantes, en un mismo sitio."
          action={{ label: 'Crear', tone: 'accent', accessibilityLabel: 'Crear grupo', onPress: () => router.push('/groups/create') }} />
        <View style={styles.cards}>
          {groups.slice(0, MAX_GROUPS).map(group => {
            const restaurants = restaurantsByGroup[group.id];
            return (
              <HomeGroupCard key={group.id} group={group} members={membersByGroup[group.id] ?? []}
                restaurantCount={restaurants ? restaurants.length : null}
                pendingCount={restaurants ? restaurants.filter(item => item.status === 'WANT_TO_GO').length : null}
                onPress={() => openGroup(group)} />
            );
          })}
        </View>
        {groups.length > MAX_GROUPS && (
          <Button variant="text" tone="olive" title="Ver todos los grupos" onPress={() => router.push('/groups')}
            style={styles.allGroups} />
        )}
      </View>

      <View>
        <SectionHeader title="Un sitio para hoy"
          action={recommendation.kind === 'pick' ? {
            label: 'Otro sitio', tone: 'accent', onPress: onPickAnother, disabled: !recommendation.canPickAnother,
            accessibilityLabel: recommendation.canPickAnother ? 'Proponer otro sitio' : 'No hay otro sitio para proponer',
          } : undefined} />
        <View style={styles.sectionBody}>
          {recommendation.kind === 'pick' ? (
            <>
              <HomeRecommendationCard recommendation={recommendation.place}
                members={membersByGroup[recommendation.place.group.id] ?? []}
                onOpen={() => router.push({
                  pathname: '/groups/[groupId]/restaurants/[groupRestaurantId]',
                  params: { groupId: recommendation.place.group.id, groupRestaurantId: recommendation.place.restaurant.id },
                })} />
              <AppText variant="caption" tone="muted" style={styles.source}>
                De vuestras listas, para vuestro próximo plan
              </AppText>
            </>
          ) : (
            <RecommendationEmpty state={recommendation} onRetry={onRetry} />
          )}
        </View>
      </View>

      <View>
        <SectionHeader title="Actividad reciente" caption="Lo que está compartiendo tu gente." />
        <View style={styles.sectionBody}>
          {activity.length > 0 ? (
            activity.slice(0, MAX_ACTIVITY).map((entry, index, shown) => (
              <HomeActivityRow key={entry.activity.id} entry={entry} isLast={index === shown.length - 1} />
            ))
          ) : activityUnavailable ? (
            <EmptyState compact icon={{ ios: 'exclamationmark.circle', android: 'error', web: 'error' }}
              title="No hemos podido cargar la actividad" message="Vuelve a intentarlo en un momento."
              actions={<Button variant="text" tone="accent" title="Reintentar" onPress={onRetry} />} />
          ) : (
            <EmptyState compact icon={{ ios: 'person.2', android: 'group', web: 'group' }}
              title="Todavía no hay actividad" message="Las aportaciones de tu gente aparecerán aquí." />
          )}
          {activityUnavailable && activity.length > 0 && (
            <AppText variant="caption" tone="muted">No se ha podido actualizar la actividad de todos los grupos.</AppText>
          )}
        </View>
      </View>
    </View>
  );
}

// Rhythm from the prototype (DESIGN.md › Layout): 28 between sections, 12 to content.
const useStyles = createThemedStyles(() => ({
  dashboard: { gap: 28 },
  cards: { gap: space.s2, marginTop: space.s3 },
  allGroups: { marginTop: space.s3 },
  sectionBody: { marginTop: space.s3 },
  source: { marginTop: 10 },
}));
