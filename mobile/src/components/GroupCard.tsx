import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { colors } from '../theme/colors';
import { RestaurantGroup } from '../types/group';

type GroupCardProps = {
  group: RestaurantGroup;
  onPress: () => void;
};

export function GroupCard({
  group,
  onPress,
}: GroupCardProps) {
  const initial = group.name.charAt(0).toUpperCase();

  const privacyLabel =
    group.privacy === 'PRIVATE' ? 'Privado' : 'Público';

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        pressed ? styles.cardPressed : null,
      ]}
    >
      <View style={styles.icon}>
        <Text style={styles.iconText}>{initial}</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text numberOfLines={1} style={styles.title}>
            {group.name}
          </Text>

          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {privacyLabel}
            </Text>
          </View>
        </View>

        {group.description ? (
          <Text numberOfLines={2} style={styles.description}>
            {group.description}
          </Text>
        ) : null}

        <Text style={styles.location}>
          {group.city ?? 'Sin ubicación'}
        </Text>
      </View>

      <Text style={styles.arrow}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    backgroundColor: colors.surface,
    padding: 16,
  },
  cardPressed: {
    opacity: 0.75,
  },
  icon: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 17,
    backgroundColor: '#F7D9CF',
  },
  iconText: {
    color: colors.primary,
    fontSize: 21,
    fontWeight: '800',
  },
  content: {
    flex: 1,
    gap: 5,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    flex: 1,
    color: colors.text,
    fontSize: 17,
    fontWeight: '800',
  },
  badge: {
    borderRadius: 999,
    backgroundColor: '#E8F1EB',
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  badgeText: {
    color: colors.success,
    fontSize: 11,
    fontWeight: '700',
  },
  description: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 19,
  },
  location: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '600',
  },
  arrow: {
    color: colors.muted,
    fontSize: 28,
    fontWeight: '300',
  },
});