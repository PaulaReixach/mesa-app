import { SymbolView } from 'expo-symbols';
import { StyleSheet, Text, View } from 'react-native';

import { GroupActivityRow } from './GroupActivityRow';
import { colors } from '../theme/colors';
import type { GroupActivityItem } from '../types/group-activity';

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
  activity,
}: {
  activity: GroupActivityItem[];
}) {
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

      {recentActivity.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>Todavía no hay actividad</Text>
          <Text style={styles.emptyText}>
            Invitaciones, incorporaciones, puntuaciones y cambios aparecerán aquí.
          </Text>
        </View>
      ) : (
        ['Hoy', 'Ayer', 'Anteriores'].map(label => {
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
      )}
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
    fontWeight: '900',
  },
  bannerText: {
    color: colors.muted,
    fontSize: 8,
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '900',
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
    fontWeight: '900',
    textAlign: 'center',
  },
  emptyText: {
    color: colors.muted,
    fontSize: 9,
    lineHeight: 14,
    textAlign: 'center',
  },
});
