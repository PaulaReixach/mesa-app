import { SymbolView } from 'expo-symbols';
import type { ComponentProps, ReactNode } from 'react';
import { Text, View } from 'react-native';

import { AppText } from './ui/AppText';
import { Avatar } from './ui/Avatar';
import { resolveApiUrl } from '../lib/api';
import { formatRelativeTime } from '../lib/relative-time';
import { createThemedStyles, fonts, formatScore, iconSize, space, useTheme } from '../theme';
import type { GroupActivityItem, GroupActivityType } from '../types/group-activity';
import type { GroupRestaurantStatus } from '../types/restaurant';

export type HomeActivityEntry = {
  activity: GroupActivityItem;
  groupId: string;
  groupName: string;
};

type SymbolName = ComponentProps<typeof SymbolView>['name'];

// Shown instead of an avatar when the actor is unknown (never a "?").
const typeIcon: Record<GroupActivityType, SymbolName> = {
  GROUP_CREATED: { ios: 'sparkles', android: 'auto_awesome', web: 'auto_awesome' },
  MEMBER_INVITED: { ios: 'envelope', android: 'mail', web: 'mail' },
  MEMBER_JOINED: { ios: 'person.badge.plus', android: 'person_add', web: 'person_add' },
  MEMBER_LEFT: { ios: 'person.badge.minus', android: 'person_remove', web: 'person_remove' },
  RESTAURANT_ADDED: { ios: 'fork.knife', android: 'restaurant', web: 'restaurant' },
  RESTAURANT_RATED: { ios: 'star', android: 'star', web: 'star' },
  RESTAURANT_STATUS_CHANGED: { ios: 'arrow.triangle.2.circlepath', android: 'sync', web: 'sync' },
};

function statusSentence(status: GroupRestaurantStatus | null, restaurant: ReactNode): ReactNode {
  switch (status) {
    case 'VISITED': return <>marcó {restaurant} como visitado</>;
    case 'FAVORITE': return <>marcó {restaurant} como favorito</>;
    case 'WANT_TO_GO': return <>apuntó {restaurant} para ir</>;
    case 'WANT_TO_REPEAT': return <>quiere repetir en {restaurant}</>;
    case 'DO_NOT_REPEAT': return <>no repetiría en {restaurant}</>;
    case 'ARCHIVED': return <>archivó {restaurant}</>;
    case null: return <>actualizó {restaurant}</>;
  }
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** Activity entry on the page background, as in the prototype (no container). */
export function HomeActivityRow({ entry, isLast }: { entry: HomeActivityEntry; isLast: boolean }) {
  const { colors } = useTheme();
  const styles = useStyles();
  const { activity, groupName } = entry;
  const knownName = activity.actorName ?? activity.subjectName;
  const avatarUrl = activity.actorAvatarUrl ?? activity.subjectAvatarUrl;
  const actor = <Text style={styles.strong}>{knownName ?? 'Un miembro'}</Text>;
  const restaurant = <Text style={styles.strong}>{activity.restaurantName ?? 'un restaurante'}</Text>;
  const subject = <Text style={styles.strong}>{activity.subjectName ?? 'una persona'}</Text>;
  const group = <Text style={styles.strong}>{groupName}</Text>;

  let sentence: ReactNode;
  switch (activity.type) {
    case 'MEMBER_INVITED': sentence = <>invitó a {subject} a {group}</>; break;
    case 'RESTAURANT_ADDED': sentence = <>añadió {restaurant}</>; break;
    case 'RESTAURANT_RATED': sentence = <>valoró {restaurant}</>; break;
    case 'RESTAURANT_STATUS_CHANGED': sentence = statusSentence(activity.restaurantStatus, restaurant); break;
    case 'MEMBER_JOINED': sentence = <>se unió a {group}</>; break;
    case 'MEMBER_LEFT': sentence = <>salió de {group}</>; break;
    case 'GROUP_CREATED': sentence = <>creó {group}</>; break;
  }

  return (
    <View style={[styles.row, !isLast && styles.separated]} accessible>
      {knownName ? (
        <Avatar name={knownName} uri={avatarUrl ? resolveApiUrl(avatarUrl) : null} size={34} />
      ) : (
        <View style={styles.typeIcon}>
          <SymbolView name={typeIcon[activity.type]} size={iconSize.link} tintColor={colors.secondary} />
        </View>
      )}
      <View style={styles.copy}>
        <AppText variant="body" style={styles.sentence}>{actor} {sentence}</AppText>
        {activity.type === 'RESTAURANT_RATED' && activity.score !== null && (
          <View style={styles.score}>
            <SymbolView accessible={false} name={{ ios: 'star.fill', android: 'star', web: 'star' }}
              size={iconSize.status + 1} tintColor={colors.rating} />
            <AppText variant="score" style={{ color: colors.rating }}>{formatScore(activity.score)}</AppText>
          </View>
        )}
        <AppText variant="caption" tone="muted">{groupName} · {capitalize(formatRelativeTime(activity.createdAt))}</AppText>
      </View>
    </View>
  );
}

const useStyles = createThemedStyles(({ colors }) => ({
  row: { minHeight: 56, flexDirection: 'row', alignItems: 'flex-start', gap: space.s3, paddingVertical: 17 },
  separated: { borderBottomWidth: 1, borderBottomColor: colors.separator },
  typeIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.secondarySoft,
  },
  copy: { flex: 1, minWidth: 0, gap: space.s1 },
  sentence: { lineHeight: 22 },
  strong: { color: colors.textPrimary, fontFamily: fonts.semiBold },
  score: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 3 },
}));
