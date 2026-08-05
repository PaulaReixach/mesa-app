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
import type { RestaurantGroup } from '../types/group';
import { fonts } from '../theme/fonts';

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
          <Text
            numberOfLines={1}
            style={styles.title}
          >
            {group.name}
          </Text>

          {group.description ? (
            <Text
              numberOfLines={2}
              style={styles.description}
            >
              {group.description}
            </Text>
          ) : null}

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <SymbolView
                name={{
                  ios: collaborating ? 'person.2' : group.privacy === 'PRIVATE' ? 'lock' : 'globe',
                  android: collaborating ? 'group' : group.privacy === 'PRIVATE' ? 'lock' : 'public',
                  web: collaborating ? 'group' : group.privacy === 'PRIVATE' ? 'lock' : 'public',
                }}
                size={12}
                tintColor={colors.mutedStrong}
              />
              <Text style={styles.metaText}>
                {collaborating ? 'Colaboras' : privacyLabel}
              </Text>
            </View>

            <View style={styles.metaDot} />

            <View style={[styles.metaItem, styles.locationItem]}>
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
        </View>

        <SymbolView
          name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
          size={17}
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
            size={14}
            tintColor={colors.primary}
          />
          <Text style={styles.manageButtonText}>
            Gestionar colaboración
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  card: {
    minHeight: 96,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 11,
  },
  cardPressed: {
    opacity: 0.72,
  },
  icon: {
    width: 72,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: 14,
    backgroundColor: colors.primarySoft,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  iconText: {
    color: colors.primary,
    fontSize: 25,
    fontFamily: fonts.bold,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    minWidth: 0,
    gap: 5,
  },
  title: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 19,
    fontFamily: fonts.bold,
  },
  description: {
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 10.5,
    lineHeight: 15,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationItem: {
    flex: 1,
    minWidth: 0,
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.borderStrong,
  },
  metaText: {
    color: colors.mutedStrong,
    fontFamily: fonts.medium,
    fontSize: 9.5,
  },
  location: {
    flex: 1,
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 9.5,
  },
  manageButton: {
    minHeight: 30,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginLeft: 84,
    marginBottom: 8,
  },
  manageButtonPressed: {
    opacity: 0.72,
  },
  manageButtonText: {
    color: colors.primary,
    fontSize: 10.5,
    fontFamily: fonts.semiBold,
  },
});
