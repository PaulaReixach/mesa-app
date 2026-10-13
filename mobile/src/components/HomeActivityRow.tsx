import { SymbolView } from 'expo-symbols';
import type { ComponentProps, ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';

import { PlaceTile } from './HomeRateCard';
import { AppText } from './ui/AppText';
import { Avatar } from './ui/Avatar';
import { StatusChip } from './ui/StatusChip';
import { resolveApiUrl } from '../lib/api';
import { formatRelativeTime } from '../lib/relative-time';
import { createThemedStyles, fonts, formatScore, space, useTheme } from '../theme';
import type { GroupActivityItem, GroupActivityType } from '../types/group-activity';
import type { GroupRestaurantStatus } from '../types/restaurant';

export type HomeActivityEntry = {
  activity: GroupActivityItem;
  groupId: string;
  groupName: string;
};

type SymbolName = ComponentProps<typeof SymbolView>['name'];

// Shown instead of a restaurant tile when the event is about people or the group.
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
    case 'WANT_TO_GO': return <>guardó {restaurant}</>;
    case 'WANT_TO_REPEAT': return <>quiere repetir en {restaurant}</>;
    case 'DO_NOT_REPEAT': return <>no repetiría en {restaurant}</>;
    case 'ARCHIVED': return <>archivó {restaurant}</>;
    case null: return <>actualizó {restaurant}</>;
  }
}

/** Row of «Lo último de tu gente»: place tile with the person's face, sentence, group · time, detail. */
export function HomeActivityRow({ entry, onPress }: { entry: HomeActivityEntry; onPress: () => void }) {
  const { colors } = useTheme();
  const styles = useStyles();
  const { activity, groupName } = entry;
  const knownName = activity.actorName ?? activity.subjectName;
  const avatarUrl = activity.actorAvatarUrl ?? activity.subjectAvatarUrl;
  const strong = (text: string) => <Text style={styles.strong}>{text}</Text>;
  const restaurant = strong(activity.restaurantName ?? 'un restaurante');
  const group = strong(groupName);

  let sentence: ReactNode;
  switch (activity.type) {
    case 'MEMBER_INVITED': sentence = <>invitó a {strong(activity.subjectName ?? 'una persona')} a {group}</>; break;
    case 'RESTAURANT_ADDED': sentence = <>guardó {restaurant}</>; break;
    case 'RESTAURANT_RATED': sentence = <>valoró {restaurant}</>; break;
    case 'RESTAURANT_STATUS_CHANGED': sentence = statusSentence(activity.restaurantStatus, restaurant); break;
    case 'MEMBER_JOINED': sentence = <>se unió a {group}</>; break;
    case 'MEMBER_LEFT': sentence = <>salió de {group}</>; break;
    case 'GROUP_CREATED': sentence = <>creó {group}</>; break;
  }

  const detail = activity.type === 'RESTAURANT_RATED' && activity.score !== null ? (
    <View style={styles.score} accessibilityLabel={`Puntuación ${activity.score} de 5`}>
      <SymbolView name={{ ios: 'star.fill', android: 'star', web: 'star' }} size={13} tintColor={colors.rating} />
      <AppText style={styles.scoreText}>{formatScore(activity.score)}</AppText>
    </View>
  ) : activity.type === 'RESTAURANT_STATUS_CHANGED' && activity.restaurantStatus === 'FAVORITE' ? (
    <View style={styles.favorite} accessibilityLabel="Favorito">
      <SymbolView name={{ ios: 'heart.fill', android: 'favorite', web: 'favorite' }} size={14} tintColor={colors.accent} />
    </View>
  ) : (activity.type === 'RESTAURANT_ADDED' || activity.type === 'RESTAURANT_STATUS_CHANGED') && activity.restaurantStatus ? (
    <StatusChip status={activity.restaurantStatus} />
  ) : null;

  const time = formatRelativeTime(activity.createdAt);
  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      <View style={styles.thumb}>
        {activity.restaurantName ? (
          <PlaceTile name={activity.restaurantName} size={60} radius={16} />
        ) : (
          <View style={styles.iconTile}>
            <SymbolView name={typeIcon[activity.type]} size={22} tintColor={colors.secondary} />
          </View>
        )}
        {knownName && (
          <View style={styles.face}>
            <Avatar name={knownName} uri={avatarUrl ? resolveApiUrl(avatarUrl) : null} size={32} ringColor={colors.surface} />
          </View>
        )}
      </View>
      <View style={styles.copy}>
        <AppText style={styles.sentence}>{strong(knownName ?? 'Un miembro')} {sentence}</AppText>
        <AppText style={styles.meta} numberOfLines={1}>{groupName}, {time.charAt(0).toLowerCase() + time.slice(1)}</AppText>
      </View>
      {detail}
    </Pressable>
  );
}

const useStyles = createThemedStyles(({ colors }) => ({
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: space.s3, paddingHorizontal: space.s4 },
  pressed: { backgroundColor: colors.surfaceSecondary },
  thumb: { width: 60, height: 60 },
  iconTile: {
    width: 60, height: 60, borderRadius: 16, borderCurve: 'continuous', alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.secondarySoft,
  },
  face: { position: 'absolute', right: -8, bottom: -8 },
  copy: { flex: 1, minWidth: 0 },
  sentence: { fontFamily: fonts.regular, fontSize: 13.5, lineHeight: 19, color: colors.textPrimary },
  strong: { fontFamily: fonts.semiBold, color: colors.textPrimary },
  meta: { marginTop: 2, fontFamily: fonts.regular, fontSize: 12, lineHeight: 17, color: colors.textSecondary },
  score: {
    height: 30, paddingHorizontal: 10, borderRadius: 15, flexDirection: 'row', alignItems: 'center', gap: space.s1,
    backgroundColor: colors.secondarySoft,
  },
  scoreText: { fontFamily: fonts.bold, fontSize: 13, color: colors.rating, fontVariant: ['tabular-nums'] },
  favorite: {
    width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.accentSoft,
  },
}));
