import { router } from 'expo-router';
import { Fragment } from 'react';
import { Pressable, View } from 'react-native';

import { HomeActivityRow, type HomeActivityEntry } from './HomeActivityRow';
import { HomeGroupCircles, openGroup } from './HomeGroupCircles';
import { HomeRateCard } from './HomeRateCard';
import { HomeTodayCard } from './HomeTodayCard';
import { AppText } from './ui/AppText';
import { Button } from './ui/Button';
import { EmptyState } from './ui/EmptyState';
import type { SavedPlace } from '../lib/home-recommendation';
import { createThemedStyles, fonts, space, textActionHitSlop } from '../theme';
import type { RestaurantGroup } from '../types/group';
import type { GroupMember } from '../types/group-member';
import type { RestaurantRatingsSummary } from '../types/restaurant-rating';

const MAX_ACTIVITY = 3;
/** Side margins of the artboard: 20 for text, 16 for cards. */
export const TEXT_GUTTER = 20;
export const CARD_GUTTER = 16;

export type RecommendationState =
  | { kind: 'pick'; place: SavedPlace; canPickAnother: boolean }
  | { kind: 'no-places' }
  | { kind: 'none-in-city'; city: string }
  | { kind: 'none-eligible' }
  | { kind: 'unavailable' };

export type PendingRating = { place: SavedPlace; summary: RestaurantRatingsSummary };

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
          message="Los sitios que tenéis guardados ya están archivados." />
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

function SectionTitle({ title, link, onLink, linkLabel }: {
  title: string;
  link?: string;
  onLink?: () => void;
  linkLabel?: string;
}) {
  const styles = useStyles();
  return (
    <View style={styles.sectionTitle}>
      <AppText accessibilityRole="header" style={styles.h2} maxFontSizeMultiplier={1.6}>{title}</AppText>
      {link && onLink && (
        <Pressable onPress={onLink} hitSlop={textActionHitSlop} accessibilityRole="link" accessibilityLabel={linkLabel ?? link}>
          <AppText style={styles.link}>{link}</AppText>
        </Pressable>
      )}
    </View>
  );
}

export function HomeDashboardContent({
  groups, membersByGroup, recommendation, onPickAnother, pendingRating, onSaveRating, onDismissRating,
  activity, activityUnavailable, onRetry,
}: {
  groups: RestaurantGroup[];
  membersByGroup: Record<string, GroupMember[]>;
  recommendation: RecommendationState;
  onPickAnother: () => void;
  pendingRating: PendingRating | null;
  onSaveRating: (score: number) => Promise<void>;
  onDismissRating: () => void;
  activity: HomeActivityEntry[];
  activityUnavailable: boolean;
  onRetry: () => void;
}) {
  const styles = useStyles();
  const shownActivity = activity.slice(0, MAX_ACTIVITY);

  return (
    <View>
      <View style={styles.cardGutter}>
        {recommendation.kind === 'pick' ? (
          <HomeTodayCard place={recommendation.place} members={membersByGroup[recommendation.place.group.id] ?? []}
            canPickAnother={recommendation.canPickAnother} onPickAnother={onPickAnother}
            onOpen={() => router.push({
              pathname: '/groups/[groupId]/restaurants/[groupRestaurantId]',
              params: { groupId: recommendation.place.group.id, groupRestaurantId: recommendation.place.restaurant.id },
            })} />
        ) : (
          <View style={styles.emptyCard}><RecommendationEmpty state={recommendation} onRetry={onRetry} /></View>
        )}
      </View>

      <View style={styles.section}>
        <View style={styles.textGutter}>
          <SectionTitle title="Tus grupos" link={`Ver los ${groups.length}`} linkLabel="Ver todos tus grupos"
            onLink={() => router.push('/groups')} />
        </View>
        <View style={styles.circles}><HomeGroupCircles groups={groups} membersByGroup={membersByGroup} /></View>
      </View>

      {pendingRating && (
        <View style={[styles.cardGutter, styles.rate]}>
          <HomeRateCard key={pendingRating.place.restaurant.id} place={pendingRating.place}
            summary={pendingRating.summary} onSave={onSaveRating} onDismiss={onDismissRating} />
        </View>
      )}

      <View style={[styles.section, styles.cardGutter]}>
        <View style={styles.titleInset}>
          <SectionTitle title="Lo último de tu gente" link={shownActivity.length > 0 ? 'Ver todo' : undefined}
            linkLabel="Ver toda la actividad" onLink={() => router.push('/notifications')} />
        </View>
        {shownActivity.length > 0 ? (
          <View style={styles.block}>
            {shownActivity.map((entry, index) => (
              <Fragment key={entry.activity.id}>
                {index > 0 && <View style={styles.separator} />}
                <HomeActivityRow entry={entry} onPress={() => {
                  const group = groups.find(item => item.id === entry.groupId);
                  if (group) openGroup(group);
                }} />
              </Fragment>
            ))}
          </View>
        ) : activityUnavailable ? (
          <EmptyState compact icon={{ ios: 'exclamationmark.circle', android: 'error', web: 'error' }}
            title="No hemos podido cargar la actividad" message="Vuelve a intentarlo en un momento."
            actions={<Button variant="text" tone="accent" title="Reintentar" onPress={onRetry} />} />
        ) : (
          <EmptyState compact icon={{ ios: 'person.2', android: 'group', web: 'group' }}
            title="Todavía no hay actividad" message="Lo que guarde y valore tu gente aparecerá aquí." />
        )}
        {activityUnavailable && shownActivity.length > 0 && (
          <AppText variant="caption" tone="muted" style={styles.note}>
            No se ha podido actualizar la actividad de todos los grupos.
          </AppText>
        )}
      </View>
    </View>
  );
}

const useStyles = createThemedStyles(({ colors }) => ({
  textGutter: { paddingHorizontal: TEXT_GUTTER },
  cardGutter: { paddingHorizontal: CARD_GUTTER },
  titleInset: { paddingHorizontal: space.s1 },
  section: { marginTop: 40 },
  rate: { marginTop: 36 },
  circles: { marginTop: space.s3 },
  emptyCard: {
    padding: space.s5, borderRadius: 24, borderCurve: 'continuous', backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.border,
  },
  sectionTitle: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: space.s3 },
  h2: { flexShrink: 1, fontFamily: fonts.display, fontSize: 19, lineHeight: 24, letterSpacing: -0.4, color: colors.textPrimary },
  link: { fontFamily: fonts.semiBold, fontSize: 13, color: colors.accent },
  block: {
    marginTop: 14, paddingVertical: space.s1, borderRadius: 24, borderCurve: 'continuous', overflow: 'hidden',
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
  },
  separator: { height: 1, marginLeft: 90, backgroundColor: colors.separator },
  note: { marginTop: space.s2, paddingHorizontal: space.s1 },
}));
