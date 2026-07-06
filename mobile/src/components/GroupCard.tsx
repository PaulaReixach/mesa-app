import { SymbolView } from 'expo-symbols';
import { router } from 'expo-router';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useAuth } from '../contexts/auth-context';
import { resolveApiUrl } from '../lib/api';
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
  const { user } = useAuth();
  const initial = group.name.charAt(0).toUpperCase();
  const privacyLabel = group.privacy === 'PRIVATE'
    ? 'Privado'
    : 'Público';
  const imageUri = group.imageUrl
    ? resolveApiUrl(group.imageUrl)
    : null;
  const canManageCollaboration =
    group.privacy === 'PUBLIC'
    && group.ownerUserId === user?.id;

  function openCollaborationManagement(): void {
    router.push({
      pathname: '/groups/[groupId]/collaboration-requests',
      params: { groupId: group.id },
    });
  }

  return (
    <View style={styles.wrapper}>
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed }) => [
          styles.card,
          pressed ? styles.cardPressed : null,
        ]}
      >
        <View style={styles.icon}>
          {imageUri ? (
            <Image
              source={{ uri: imageUri }}
              style={styles.image}
            />
          ) : (
            <Text style={styles.iconText}>
              {initial}
            </Text>
          )}
        </View>

        <View style={styles.content}>
          <View style={styles.titleRow}>
            <Text
              numberOfLines={1}
              style={styles.title}
            >
              {group.name}
            </Text>

            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {privacyLabel}
              </Text>
            </View>
          </View>

          {group.description ? (
            <Text
              numberOfLines={2}
              style={styles.description}
            >
              {group.description}
            </Text>
          ) : null}

          <Text style={styles.location}>
            {group.city ?? 'Sin ubicación'}
          </Text>
        </View>

        <Text style={styles.arrow}>›</Text>
      </Pressable>

      {canManageCollaboration ? (
        <Pressable
          accessibilityRole="button"
          onPress={openCollaborationManagement}
          style={({ pressed }) => [
            styles.manageButton,
            pressed ? styles.manageButtonPressed : null,
          ]}
        >
          <SymbolView
            name={{
              ios: 'person.2.badge.gearshape',
              android: 'manage_accounts',
              web: 'manage_accounts',
            }}
            size={16}
            tintColor={colors.primary}
          />
          <Text style={styles.manageButtonText}>
            Gestionar colaboración
          </Text>
          <Text style={styles.manageArrow}>›</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    backgroundColor: colors.surface,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
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
    overflow: 'hidden',
    borderRadius: 17,
    backgroundColor: '#F7D9CF',
  },
  image: {
    width: '100%',
    height: '100%',
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
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#E8F1EB',
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
  manageButton: {
    minHeight: 43,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    backgroundColor: '#FFF8F3',
  },
  manageButtonPressed: {
    opacity: 0.72,
  },
  manageButtonText: {
    flex: 1,
    color: colors.primary,
    fontSize: 11,
    fontWeight: '900',
  },
  manageArrow: {
    color: colors.primary,
    fontSize: 19,
    fontWeight: '400',
  },
});
