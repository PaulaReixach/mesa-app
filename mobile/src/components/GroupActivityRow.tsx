import { SymbolView } from 'expo-symbols';
import { Image, StyleSheet, Text, View } from 'react-native';

import { resolveApiUrl } from '../lib/api';
import { colors } from '../theme/colors';
import type { GroupActivityItem } from '../types/group-activity';

const statusLabel: Record<
  NonNullable<GroupActivityItem['restaurantStatus']>,
  string
> = {
  WANT_TO_GO: 'Pendiente',
  VISITED: 'Visitado',
  FAVORITE: 'Favorito',
  WANT_TO_REPEAT: 'Repetir',
  DO_NOT_REPEAT: 'No repetir',
  ARCHIVED: 'Archivado',
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

function sentence(item: GroupActivityItem): string {
  const restaurant = item.restaurantName ?? 'un restaurante';
  const subject = item.subjectName ?? 'una persona';

  switch (item.type) {
    case 'GROUP_CREATED':
      return 'creó el grupo';
    case 'MEMBER_INVITED':
      return `invitó a ${subject} al grupo`;
    case 'MEMBER_JOINED':
      return 'se unió al grupo';
    case 'MEMBER_LEFT':
      return 'salió del grupo';
    case 'RESTAURANT_ADDED':
      return `añadió “${restaurant}”`;
    case 'RESTAURANT_RATED':
      return `puntuó “${restaurant}” con ${item.score ?? '—'}`;
    case 'RESTAURANT_STATUS_CHANGED':
      return item.actorName
        ? `marcó “${restaurant}” como ${item.restaurantStatus
          ? statusLabel[item.restaurantStatus].toLowerCase()
          : 'actualizado'}`
        : `“${restaurant}” cambió a ${item.restaurantStatus
          ? statusLabel[item.restaurantStatus].toLowerCase()
          : 'actualizado'}`;
  }
}

function fallbackIcon(item: GroupActivityItem) {
  if (
    item.type === 'RESTAURANT_ADDED'
    || item.type === 'RESTAURANT_RATED'
    || item.type === 'RESTAURANT_STATUS_CHANGED'
  ) {
    return { ios: 'fork.knife', android: 'restaurant', web: 'restaurant' } as const;
  }

  if (item.type === 'MEMBER_INVITED') {
    return { ios: 'envelope.fill', android: 'mail', web: 'mail' } as const;
  }

  return { ios: 'person.fill', android: 'person', web: 'person' } as const;
}

export function GroupActivityRow({ item }: { item: GroupActivityItem }) {
  const avatarUrl = item.actorAvatarUrl ?? item.subjectAvatarUrl;
  const avatar = avatarUrl ? resolveApiUrl(avatarUrl) : null;
  const displayName = item.actorName ?? item.subjectName;
  const showStatus = item.type === 'RESTAURANT_STATUS_CHANGED'
    && item.restaurantStatus;

  return (
    <View style={styles.card}>
      <View style={styles.avatar}>
        {avatar ? (
          <Image source={{ uri: avatar }} style={styles.avatarImage} />
        ) : (
          <SymbolView
            name={fallbackIcon(item)}
            size={19}
            tintColor={colors.primary}
          />
        )}
      </View>

      <View style={styles.copy}>
        <Text style={styles.sentence}>
          {displayName ? (
            <Text style={styles.actor}>{displayName} </Text>
          ) : null}
          {sentence(item)}
        </Text>
      </View>

      <View style={styles.trailing}>
        <Text style={styles.time}>{timeLabel(item.createdAt)}</Text>
        {showStatus ? (
          <View style={styles.statusPill}>
            <Text style={styles.statusText}>
              {statusLabel[item.restaurantStatus!]}
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 62,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    backgroundColor: colors.surface,
  },
  avatar: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: 21,
    backgroundColor: '#FBE9E2',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  copy: {
    flex: 1,
    minWidth: 0,
  },
  sentence: {
    color: colors.muted,
    fontSize: 10,
    lineHeight: 15,
  },
  actor: {
    color: colors.primary,
    fontWeight: '900',
  },
  trailing: {
    alignItems: 'flex-end',
    gap: 6,
  },
  time: {
    color: colors.muted,
    fontSize: 8,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#FFF0D9',
  },
  statusText: {
    color: '#A46B16',
    fontSize: 7,
    fontWeight: '900',
  },
});
