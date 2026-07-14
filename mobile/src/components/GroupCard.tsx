import { SymbolView } from 'expo-symbols';
import { router } from 'expo-router';
import type { Href } from 'expo-router';
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
import { fonts } from '../theme/fonts';
import { radii, shadows } from '../theme/layout';

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
  const ownedByCurrentUser = group.ownerUserId === user?.id;
  const canManageCollaboration =
    group.privacy === 'PUBLIC' && ownedByCurrentUser;
  const collaborating =
    group.currentUserRole === 'CONTRIBUTOR';

  function handlePress(): void {
    if (collaborating) {
      router.push(
        `/groups/public/${group.id}` as Href,
      );
      return;
    }

    onPress();
  }

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
        onPress={handlePress}
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

            <View
              style={[
                styles.badge,
                group.privacy === 'PUBLIC' ? styles.publicBadge : null,
                collaborating ? styles.collaborationBadge : null,
              ]}
            >
              <Text style={styles.badgeText}>
                {collaborating ? 'Colaboras' : privacyLabel}
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

          <View style={styles.locationRow}>
            <SymbolView
              name={{ ios: 'mappin', android: 'location_on', web: 'location_on' }}
              size={12}
              tintColor={colors.muted}
            />
            <Text numberOfLines={1} style={styles.location}>
              {group.city ?? 'Sin ubicación'}
            </Text>
          </View>
        </View>

        <SymbolView
          name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
          size={18}
          tintColor={colors.muted}
        />
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
    borderRadius: radii.xl,
    backgroundColor: colors.surface,
    ...shadows.card,
  },
  card: {
    minHeight: 116,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    padding: 12,
  },
  cardPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.995 }],
  },
  icon: {
    width: 86,
    height: 86,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: radii.lg,
    backgroundColor: colors.primarySoft,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  iconText: {
    color: colors.primary,
    fontSize: 28,
    fontFamily: fonts.bold,
  },
  content: {
    flex: 1,
    gap: 6,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    flex: 1,
    color: colors.text,
    fontSize: 15,
    fontFamily: fonts.bold,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: colors.primarySoft,
  },
  badgeText: {
    color: colors.primaryPressed,
    fontSize: 8,
    fontFamily: fonts.semiBold,
  },
  publicBadge: {
    backgroundColor: colors.oliveSoft,
  },
  collaborationBadge: {
    backgroundColor: colors.amberSoft,
  },
  description: {
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 10,
    lineHeight: 15,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  location: {
    flex: 1,
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 9,
  },
  manageButton: {
    minHeight: 43,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    backgroundColor: colors.surfaceMuted,
  },
  manageButtonPressed: {
    opacity: 0.72,
  },
  manageButtonText: {
    flex: 1,
    color: colors.primary,
    fontSize: 11,
    fontFamily: fonts.bold,
  },
  manageArrow: {
    color: colors.primary,
    fontSize: 19,
    fontFamily: fonts.regular,
  },
});
