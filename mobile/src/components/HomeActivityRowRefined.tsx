import { SymbolView } from 'expo-symbols';
import type { ComponentProps } from 'react';
import { Image, Text, View } from 'react-native';

import { activityStyles as styles } from './HomeActivityRowRefined.styles';
import { resolveApiUrl } from '../lib/api';
import { colors } from '../theme/colors';
import type {
  GroupActivityItem,
  GroupActivityType,
} from '../types/group-activity';

type SymbolName = ComponentProps<typeof SymbolView>['name'];

export type HomeActivityEntry = {
  activity: GroupActivityItem;
  groupId: string;
  groupName: string;
};

function timeLabel(value: string): string {
  const diff = Date.now() - new Date(value).getTime();
  const minutes = Math.max(1, Math.floor(diff / 60_000));
  const hours = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);

  if (minutes < 60) return `hace ${minutes} min`;
  if (hours < 24) return `hace ${hours} h`;
  if (days === 1) return 'ayer';

  return new Date(value).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
  });
}

function badge(type: GroupActivityType): {
  backgroundColor: string;
  icon: SymbolName;
  tintColor: string;
} {
  switch (type) {
    case 'GROUP_CREATED':
      return { backgroundColor: colors.primary, icon: { ios: 'flag.fill', android: 'flag', web: 'flag' }, tintColor: '#FFFFFF' };
    case 'MEMBER_INVITED':
      return { backgroundColor: '#E3EACF', icon: { ios: 'person.badge.plus', android: 'person_add', web: 'person_add' }, tintColor: '#5F7845' };
    case 'MEMBER_JOINED':
      return { backgroundColor: '#DDE7D3', icon: { ios: 'person.2.fill', android: 'group', web: 'group' }, tintColor: '#5D7544' };
    case 'MEMBER_LEFT':
      return { backgroundColor: '#F7DDD8', icon: { ios: 'person.fill.xmark', android: 'person_remove', web: 'person_remove' }, tintColor: colors.danger };
    case 'RESTAURANT_ADDED':
      return { backgroundColor: colors.primary, icon: { ios: 'fork.knife', android: 'restaurant', web: 'restaurant' }, tintColor: '#FFFFFF' };
    case 'RESTAURANT_RATED':
      return { backgroundColor: '#F2B23C', icon: { ios: 'star.fill', android: 'star', web: 'star' }, tintColor: '#FFFFFF' };
    case 'RESTAURANT_STATUS_CHANGED':
      return { backgroundColor: '#F6E2C2', icon: { ios: 'arrow.triangle.2.circlepath', android: 'sync', web: 'sync' }, tintColor: '#A36B18' };
  }
}

function ActivityText({ entry }: { entry: HomeActivityEntry }) {
  const { activity, groupName } = entry;
  const actor = activity.actorName ?? activity.subjectName ?? 'Alguien';
  const restaurant = activity.restaurantName ?? 'un restaurante';
  const subject = activity.subjectName ?? 'una persona';

  switch (activity.type) {
    case 'MEMBER_INVITED':
      return <Text style={styles.sentence}><Text style={styles.actor}>{actor} </Text>invitó a <Text style={styles.strong}>{subject}</Text> al grupo <Text style={styles.group}>{groupName}</Text></Text>;
    case 'RESTAURANT_ADDED':
      return <Text style={styles.sentence}><Text style={styles.actor}>{actor} </Text>añadió <Text style={styles.strong}>“{restaurant}”</Text> al grupo <Text style={styles.group}>{groupName}</Text></Text>;
    case 'RESTAURANT_RATED':
      return <Text style={styles.sentence}><Text style={styles.actor}>{actor} </Text>valoró <Text style={styles.strong}>“{restaurant}”</Text> con <Text style={styles.strong}>{activity.score?.toFixed(1).replace('.', ',') ?? '—'}</Text></Text>;
    case 'RESTAURANT_STATUS_CHANGED':
      return <Text style={styles.sentence}><Text style={styles.actor}>{actor} </Text>cambió el estado de <Text style={styles.strong}>“{restaurant}”</Text></Text>;
    case 'MEMBER_JOINED':
      return <Text style={styles.sentence}><Text style={styles.actor}>{actor} </Text>se unió al grupo <Text style={styles.group}>{groupName}</Text></Text>;
    case 'MEMBER_LEFT':
      return <Text style={styles.sentence}><Text style={styles.actor}>{actor} </Text>salió del grupo <Text style={styles.group}>{groupName}</Text></Text>;
    case 'GROUP_CREATED':
      return <Text style={styles.sentence}><Text style={styles.actor}>{actor} </Text>creó el grupo <Text style={styles.group}>{groupName}</Text></Text>;
  }
}

export function HomeActivityRowRefined({ entry }: { entry: HomeActivityEntry }) {
  const { activity } = entry;
  const avatarUrl = activity.actorAvatarUrl ?? activity.subjectAvatarUrl;
  const avatar = avatarUrl ? resolveApiUrl(avatarUrl) : null;
  const displayName = activity.actorName ?? activity.subjectName ?? '?';
  const activityBadge = badge(activity.type);

  return (
    <View style={styles.row}>
      <View style={styles.avatarWrap}>
        <View style={styles.avatar}>
          {avatar ? (
            <Image source={{ uri: avatar }} style={styles.avatarImage} />
          ) : (
            <Text style={styles.avatarInitial}>{displayName.charAt(0).toUpperCase()}</Text>
          )}
        </View>
        <View style={[styles.badge, { backgroundColor: activityBadge.backgroundColor }]}>
          <SymbolView name={activityBadge.icon} size={8} tintColor={activityBadge.tintColor} />
        </View>
      </View>

      <View style={styles.copy}><ActivityText entry={entry} /></View>

      <View style={styles.trailing}>
        <Text style={styles.time}>{timeLabel(activity.createdAt)}</Text>
        {activity.type === 'RESTAURANT_RATED' && activity.score != null ? (
          <View style={styles.scorePill}>
            <SymbolView name={{ ios: 'star.fill', android: 'star', web: 'star' }} size={9} tintColor="#EAA72D" />
            <Text style={styles.scoreText}>{activity.score.toFixed(1).replace('.', ',')}</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}
