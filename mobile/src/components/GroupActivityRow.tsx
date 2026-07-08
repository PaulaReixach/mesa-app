import { SymbolView } from 'expo-symbols';
import { Image, StyleSheet, Text, View } from 'react-native';

import { resolveApiUrl } from '../lib/api';
import { colors } from '../theme/colors';
import type { GroupActivityItem } from '../types/group-activity';

const statusLabel: Record<NonNullable<GroupActivityItem['status']>, string> = {
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
  if (item.kind === 'GROUP_CREATED') return 'creó el grupo';
  if (item.kind === 'MEMBER_JOINED') return 'se unió al grupo';
  if (item.kind === 'RESTAURANT_ADDED') {
    return `añadió “${item.restaurantName ?? 'un restaurante'}”`;
  }
  return `marcó “${item.restaurantName ?? 'un restaurante'}” como ${item.status ? statusLabel[item.status].toLowerCase() : 'actualizado'}`;
}

export function GroupActivityRow({ item }: { item: GroupActivityItem }) {
  const avatar = item.actorAvatarUrl
    ? resolveApiUrl(item.actorAvatarUrl)
    : null;
  const showStatus = item.kind === 'STATUS_UPDATED' && item.status;

  return (
    <View style={styles.card}>
      <View style={styles.avatar}>
        {avatar ? (
          <Image source={{ uri: avatar }} style={styles.avatarImage} />
        ) : (
          <SymbolView
            name={item.kind === 'RESTAURANT_ADDED' || item.kind === 'STATUS_UPDATED'
              ? { ios: 'fork.knife', android: 'restaurant', web: 'restaurant' }
              : { ios: 'person.fill', android: 'person', web: 'person' }}
            size={19}
            tintColor={colors.primary}
          />
        )}
      </View>

      <View style={styles.copy}>
        <Text style={styles.sentence}>
          {item.actorName ? (
            <Text style={styles.actor}>{item.actorName} </Text>
          ) : null}
          {sentence(item)}
        </Text>
      </View>

      <View style={styles.trailing}>
        <Text style={styles.time}>{timeLabel(item.createdAt)}</Text>
        {showStatus ? (
          <View style={styles.statusPill}>
            <Text style={styles.statusText}>{statusLabel[item.status!]}</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { minHeight: 62, flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, borderWidth: 1, borderColor: colors.border, borderRadius: 16, backgroundColor: colors.surface },
  avatar: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderRadius: 21, backgroundColor: '#FBE9E2' },
  avatarImage: { width: '100%', height: '100%' },
  copy: { flex: 1, minWidth: 0 },
  sentence: { color: colors.muted, fontSize: 10, lineHeight: 15 },
  actor: { color: colors.primary, fontWeight: '900' },
  trailing: { alignItems: 'flex-end', gap: 6 },
  time: { color: colors.muted, fontSize: 8 },
  statusPill: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999, backgroundColor: '#FFF0D9' },
  statusText: { color: '#A46B16', fontSize: 7, fontWeight: '900' },
});
