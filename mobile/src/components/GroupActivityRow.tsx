import { SymbolView } from 'expo-symbols';
import type { ComponentProps } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import { resolveApiUrl } from '../lib/api';
import { colors } from '../theme/colors';
import type { GroupActivityItem } from '../types/group-activity';
import { fonts } from '../theme/fonts';

type SymbolName = ComponentProps<typeof SymbolView>['name'];

type ActivityBadge = {
  name: SymbolName;
  backgroundColor: string;
  tintColor: string;
};

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

  return 'actualizó el grupo';
}

function fallbackIcon(item: GroupActivityItem): SymbolName {
  if (
    item.type === 'RESTAURANT_ADDED'
    || item.type === 'RESTAURANT_RATED'
    || item.type === 'RESTAURANT_STATUS_CHANGED'
  ) {
    return {
      ios: 'fork.knife',
      android: 'restaurant',
      web: 'restaurant',
    };
  }

  if (item.type === 'MEMBER_INVITED') {
    return {
      ios: 'envelope.fill',
      android: 'mail',
      web: 'mail',
    };
  }

  return {
    ios: 'person.fill',
    android: 'person',
    web: 'person',
  };
}

function activityBadge(item: GroupActivityItem): ActivityBadge {
  switch (item.type) {
    case 'GROUP_CREATED':
      return {
        name: { ios: 'flag.fill', android: 'flag', web: 'flag' },
        backgroundColor: colors.primary,
        tintColor: '#FFFFFF',
      };
    case 'MEMBER_INVITED':
      return {
        name: { ios: 'envelope.fill', android: 'mail', web: 'mail' },
        backgroundColor: '#FFE5C2',
        tintColor: colors.primary,
      };
    case 'MEMBER_JOINED':
      return {
        name: {
          ios: 'person.badge.plus',
          android: 'person_add',
          web: 'person_add',
        },
        backgroundColor: '#DCE8CB',
        tintColor: '#607349',
      };
    case 'MEMBER_LEFT':
      return {
        name: {
          ios: 'person.fill.xmark',
          android: 'person_remove',
          web: 'person_remove',
        },
        backgroundColor: '#F7DDD8',
        tintColor: colors.danger,
      };
    case 'RESTAURANT_ADDED':
      return {
        name: {
          ios: 'fork.knife',
          android: 'restaurant',
          web: 'restaurant',
        },
        backgroundColor: colors.primary,
        tintColor: '#FFFFFF',
      };
    case 'RESTAURANT_RATED':
      return {
        name: { ios: 'star.fill', android: 'star', web: 'star' },
        backgroundColor: '#F4B13D',
        tintColor: '#FFFFFF',
      };
    case 'RESTAURANT_STATUS_CHANGED':
      return {
        name: {
          ios: 'arrow.triangle.2.circlepath',
          android: 'sync',
          web: 'sync',
        },
        backgroundColor: '#FFF0D9',
        tintColor: '#A46B16',
      };
  }

  return {
    name: { ios: 'circle.fill', android: 'circle', web: 'circle' },
    backgroundColor: '#FBE9E2',
    tintColor: colors.primary,
  };
}

export function GroupActivityRow({ item }: { item: GroupActivityItem }) {
  const avatarUrl = item.actorAvatarUrl ?? item.subjectAvatarUrl;
  const avatar = avatarUrl ? resolveApiUrl(avatarUrl) : null;
  const displayName = item.actorName ?? item.subjectName;
  const badge = activityBadge(item);
  const showStatus = item.type === 'RESTAURANT_STATUS_CHANGED'
    && item.restaurantStatus;

  return (
    <View style={styles.card}>
      <View style={styles.avatarWrap}>
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
        <View
          style={[
            styles.activityBadge,
            { backgroundColor: badge.backgroundColor },
          ]}
        >
          <SymbolView
            name={badge.name}
            size={10}
            tintColor={badge.tintColor}
          />
        </View>
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
  avatarWrap: {
    position: 'relative',
    width: 45,
    height: 45,
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
  activityBadge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 19,
    height: 19,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.surface,
    borderRadius: 10,
  },
  copy: {
    flex: 1,
    minWidth: 0,
  },
  sentence: {
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 10,
    lineHeight: 15,
  },
  actor: {
    color: colors.primary,
    fontFamily: fonts.bold,
  },
  trailing: {
    alignItems: 'flex-end',
    gap: 6,
  },
  time: {
    color: colors.muted,
    fontFamily: fonts.regular,
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
    fontFamily: fonts.bold,
  },
});
