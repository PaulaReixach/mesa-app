import { Image, Text, View } from 'react-native';

import { activityStyles as styles } from './HomeActivityRowRefined.styles';
import { resolveApiUrl } from '../lib/api';
import type { GroupActivityItem } from '../types/group-activity';

export type HomeActivityEntry = {
  activity: GroupActivityItem;
  groupId: string;
  groupName: string;
};

function timeLabel(value: string): string {
  const date = new Date(value);
  const diff = Date.now() - date.getTime();
  const minutes = Math.max(1, Math.floor(diff / 60_000));
  const hours = Math.floor(diff / 3_600_000);

  if (minutes < 60) return `hace ${minutes} min`;
  if (hours < 24) return `hace ${hours} h`;

  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
  });
}

function ActivityText({ entry }: { entry: HomeActivityEntry }) {
  const { activity, groupName } = entry;
  const actor = activity.actorName ?? activity.subjectName ?? 'Alguien';
  const restaurant = activity.restaurantName ?? 'un restaurante';
  const subject = activity.subjectName ?? 'una persona';

  switch (activity.type) {
    case 'MEMBER_INVITED':
      return <Text allowFontScaling={false} style={styles.sentence}><Text style={styles.actor}>{actor} </Text>invitó a <Text style={styles.strong}>{subject}</Text> a <Text style={styles.group}>{groupName}</Text></Text>;
    case 'RESTAURANT_ADDED':
      return <Text allowFontScaling={false} style={styles.sentence}><Text style={styles.actor}>{actor} </Text>añadió <Text style={styles.strong}>“{restaurant}”</Text> a <Text style={styles.group}>{groupName}</Text></Text>;
    case 'RESTAURANT_RATED':
      return <Text allowFontScaling={false} style={styles.sentence}><Text style={styles.actor}>{actor} </Text>valoró <Text style={styles.strong}>“{restaurant}”</Text> con <Text style={styles.strong}>{activity.score?.toFixed(1).replace('.', ',') ?? '—'}</Text></Text>;
    case 'RESTAURANT_STATUS_CHANGED':
      return <Text allowFontScaling={false} style={styles.sentence}><Text style={styles.actor}>{actor} </Text>actualizó <Text style={styles.strong}>“{restaurant}”</Text></Text>;
    case 'MEMBER_JOINED':
      return <Text allowFontScaling={false} style={styles.sentence}><Text style={styles.actor}>{actor} </Text>se unió a <Text style={styles.group}>{groupName}</Text></Text>;
    case 'MEMBER_LEFT':
      return <Text allowFontScaling={false} style={styles.sentence}><Text style={styles.actor}>{actor} </Text>salió de <Text style={styles.group}>{groupName}</Text></Text>;
    case 'GROUP_CREATED':
      return <Text allowFontScaling={false} style={styles.sentence}><Text style={styles.actor}>{actor} </Text>creó <Text style={styles.group}>{groupName}</Text></Text>;
  }
}

export function HomeActivityRowRefined({ entry }: { entry: HomeActivityEntry }) {
  const { activity } = entry;
  const avatarUrl = activity.actorAvatarUrl ?? activity.subjectAvatarUrl;
  const avatar = avatarUrl ? resolveApiUrl(avatarUrl) : null;
  const displayName = activity.actorName ?? activity.subjectName ?? '?';

  return (
    <View style={styles.row}>
      <View style={styles.avatar}>
        {avatar ? (
          <Image source={{ uri: avatar }} style={styles.avatarImage} />
        ) : (
          <Text allowFontScaling={false} style={styles.avatarInitial}>
            {displayName.charAt(0).toUpperCase()}
          </Text>
        )}
      </View>

      <View style={styles.copy}>
        <ActivityText entry={entry} />
      </View>

      <Text allowFontScaling={false} style={styles.time}>
        {timeLabel(activity.createdAt)}
      </Text>
    </View>
  );
}
