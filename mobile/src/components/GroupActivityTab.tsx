import { SymbolView } from 'expo-symbols';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { GroupActivityRow } from './GroupActivityRow';
import { useAuth } from '../contexts/auth-context';
import { getGroupActivity } from '../services/group-activity-service';
import { colors } from '../theme/colors';
import type { GroupMember } from '../types/group-member';
import type { GroupActivityItem } from '../types/group-activity';
import type { GroupRestaurant } from '../types/restaurant';
import { fonts } from '../theme/fonts';

type Props = {
  activity?: GroupActivityItem[];
  groupCreatedAt?: string;
  members?: GroupMember[];
  owner?: unknown;
  restaurants?: GroupRestaurant[];
};

function sectionLabel(value: string): string {
  const date = new Date(value);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return 'Hoy';
  if (date.toDateString() === yesterday.toDateString()) return 'Ayer';
  return 'Anteriores';
}

export function GroupActivityTab({
  activity: initialActivity = [],
  members,
  restaurants,
}: Props) {
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const { accessToken } = useAuth();
  const [activity, setActivity] = useState(initialActivity);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (): Promise<void> => {
    if (!accessToken || !groupId) {
      setLoading(false);
      return;
    }

    try {
      setError(null);
      setActivity(await getGroupActivity(groupId, accessToken));
    } catch {
      setError('No se ha podido actualizar la actividad.');
    } finally {
      setLoading(false);
    }
  }, [accessToken, groupId]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  useEffect(() => {
    if (!loading) {
      void load();
    }
  }, [members, restaurants]);

  const recentActivity = activity.slice(0, 12);
  const sections = recentActivity.reduce<Record<string, GroupActivityItem[]>>(
    (result, item) => {
      const label = sectionLabel(item.createdAt);
      result[label] = [...(result[label] ?? []), item];
      return result;
    },
    {},
  );

  return (
    <View style={styles.container}>
      <View style={styles.banner}>
        <View style={styles.bannerIcon}>
          <SymbolView
            name={{
              ios: 'waveform.path.ecg',
              android: 'monitor_heart',
              web: 'monitor_heart',
            }}
            size={19}
            tintColor={colors.primary}
          />
        </View>
        <View style={styles.bannerCopy}>
          <Text style={styles.bannerTitle}>Actividad reciente</Text>
          <Text style={styles.bannerText}>
            Todo lo que pasa en tu grupo, en un vistazo.
          </Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.primary} size="small" />
        </View>
      ) : null}

      {!loading && recentActivity.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>Todavía no hay actividad</Text>
          <Text style={styles.emptyText}>
            Invitaciones, incorporaciones, puntuaciones y cambios aparecerán aquí.
          </Text>
        </View>
      ) : null}

      {!loading
        ? ['Hoy', 'Ayer', 'Anteriores'].map(label => {
            const items = sections[label];
            if (!items?.length) return null;

            return (
              <View key={label} style={styles.section}>
                <Text style={styles.sectionTitle}>{label}</Text>
                <View style={styles.rows}>
                  {items.map(item => (
                    <GroupActivityRow item={item} key={item.id} />
                  ))}
                </View>
              </View>
            );
          })
        : null}

      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 13,
  },
  banner: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
    borderRadius: 16,
    backgroundColor: '#FFF8EE',
  },
  bannerIcon: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: '#FFE8C8',
  },
  bannerCopy: {
    flex: 1,
    gap: 2,
  },
  bannerTitle: {
    color: colors.text,
    fontSize: 11,
    fontFamily: fonts.bold,
  },
  bannerText: {
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 8,
  },
  loading: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 12,
    fontFamily: fonts.bold,
  },
  rows: {
    gap: 6,
  },
  empty: {
    gap: 5,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    backgroundColor: colors.surface,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 12,
    fontFamily: fonts.bold,
    textAlign: 'center',
  },
  emptyText: {
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 9,
    lineHeight: 14,
    textAlign: 'center',
  },
  error: {
    color: colors.danger,
    fontFamily: fonts.regular,
    fontSize: 8,
    textAlign: 'center',
  },
});
