import { SymbolView } from 'expo-symbols';
import {
  router,
  useFocusEffect,
  useLocalSearchParams,
} from 'expo-router';
import {
  useCallback,
  useState,
} from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RestaurantCard } from '../../../components/RestaurantCard';
import { useAuth } from '../../../contexts/auth-context';
import {
  getErrorMessage,
  resolveApiUrl,
} from '../../../lib/api';
import {
  getGroupMembers,
  removeGroupMember,
} from '../../../services/group-member-service';
import { getGroup } from '../../../services/group-service';
import { getGroupRestaurants } from '../../../services/restaurant-service';
import { colors } from '../../../theme/colors';
import type { RestaurantGroup } from '../../../types/group';
import type { GroupMember } from '../../../types/group-member';
import type { GroupRestaurant } from '../../../types/restaurant';

function MemberRow({
  member,
  canRemove,
  removing,
  onRemove,
}: {
  member: GroupMember;
  canRemove: boolean;
  removing: boolean;
  onRemove: () => void;
}) {
  const avatarUri = member.avatarUrl
    ? resolveApiUrl(member.avatarUrl)
    : null;

  return (
    <View style={styles.memberRow}>
      <View style={styles.memberAvatar}>
        {avatarUri ? (
          <Image
            source={{ uri: avatarUri }}
            style={styles.memberAvatarImage}
          />
        ) : (
          <Text style={styles.memberAvatarText}>
            {member.name.charAt(0).toUpperCase()}
          </Text>
        )}
      </View>

      <View style={styles.memberText}>
        <Text style={styles.memberName}>
          {member.name}
        </Text>
        <Text style={styles.memberUsername}>
          @{member.username}
        </Text>
      </View>

      <View
        style={[
          styles.roleBadge,
          member.role === 'OWNER'
            ? styles.ownerBadge
            : null,
        ]}
      >
        <Text
          style={[
            styles.roleText,
            member.role === 'OWNER'
              ? styles.ownerRoleText
              : null,
          ]}
        >
          {member.role === 'OWNER'
            ? 'Creadora'
            : 'Miembro'}
        </Text>
      </View>

      {canRemove ? (
        <Pressable
          accessibilityLabel={`Eliminar a ${member.name}`}
          accessibilityRole="button"
          disabled={removing}
          hitSlop={8}
          onPress={onRemove}
          style={({ pressed }) => [
            styles.removeMemberButton,
            pressed ? styles.pressed : null,
          ]}
        >
          {removing ? (
            <ActivityIndicator
              color={colors.danger}
              size="small"
            />
          ) : (
            <SymbolView
              name={{
                ios: 'trash',
                android: 'delete_outline',
                web: 'delete_outline',
              }}
              size={18}
              tintColor={colors.danger}
            />
          )}
        </Pressable>
      ) : null}
    </View>
  );
}

export default function GroupDetailScreen() {
  const { groupId } = useLocalSearchParams<{
    groupId: string;
  }>();

  const { accessToken, user } = useAuth();

  const [group, setGroup] =
    useState<RestaurantGroup | null>(null);
  const [members, setMembers] =
    useState<GroupMember[]>([]);
  const [restaurants, setRestaurants] =
    useState<GroupRestaurant[]>([]);
  const [removingUserId, setRemovingUserId] =
    useState<string | null>(null);
  const [isLoading, setIsLoading] =
    useState(true);
  const [isRefreshing, setIsRefreshing] =
    useState(false);
  const [loadError, setLoadError] =
    useState<string | null>(null);

  const loadGroupData = useCallback(
    async (refreshing = false) => {
      if (!accessToken || !groupId) {
        setIsLoading(false);
        return;
      }

      try {
        setLoadError(null);

        if (refreshing) {
          setIsRefreshing(true);
        } else {
          setIsLoading(true);
        }

        const [
          groupResponse,
          membersResponse,
          restaurantsResponse,
        ] = await Promise.all([
          getGroup(groupId, accessToken),
          getGroupMembers(groupId, accessToken),
          getGroupRestaurants(groupId, accessToken),
        ]);

        setGroup(groupResponse);
        setMembers(membersResponse);
        setRestaurants(restaurantsResponse);
      } catch (error) {
        setLoadError(getErrorMessage(error));
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [accessToken, groupId],
  );

  useFocusEffect(
    useCallback(() => {
      void loadGroupData();
    }, [loadGroupData]),
  );

  const isOwner =
    Boolean(group && user?.id === group.ownerUserId);

  function openCreateRestaurant(): void {
    router.push({
      pathname:
        '/groups/[groupId]/restaurants/create',
      params: { groupId },
    });
  }

  function openAddMember(): void {
    router.push({
      pathname: '/groups/[groupId]/members/add',
      params: { groupId },
    });
  }

  function openEditGroup(): void {
    router.push({
      pathname: '/groups/[groupId]/edit',
      params: { groupId },
    });
  }

  function confirmRemoveMember(
    member: GroupMember,
  ): void {
    Alert.alert(
      'Eliminar miembro',
      `¿Quieres eliminar a ${member.name} del grupo?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            void handleRemoveMember(member);
          },
        },
      ],
    );
  }

  async function handleRemoveMember(
    member: GroupMember,
  ): Promise<void> {
    if (!accessToken || !groupId) {
      return;
    }

    try {
      setRemovingUserId(member.userId);
      await removeGroupMember(
        groupId,
        member.userId,
        accessToken,
      );
      setMembers(current =>
        current.filter(item =>
          item.userId !== member.userId,
        ),
      );
    } catch (error) {
      Alert.alert(
        'No se ha podido eliminar',
        getErrorMessage(error),
      );
    } finally {
      setRemovingUserId(null);
    }
  }

  const groupImageUri = group?.imageUrl
    ? resolveApiUrl(group.imageUrl)
    : null;

  return (
    <SafeAreaView
      edges={['top', 'right', 'bottom', 'left']}
      style={styles.safeArea}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            onRefresh={() => {
              void loadGroupData(true);
            }}
            refreshing={isRefreshing}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Pressable
            accessibilityLabel="Volver"
            accessibilityRole="button"
            onPress={() => router.back()}
            style={({ pressed }) => [
              styles.headerButton,
              pressed ? styles.pressed : null,
            ]}
          >
            <SymbolView
              name={{
                ios: 'chevron.left',
                android: 'arrow_back',
                web: 'arrow_back',
              }}
              size={20}
              tintColor={colors.text}
            />
          </Pressable>

          <Text style={styles.headerTitle}>
            Grupo
          </Text>

          {isOwner ? (
            <Pressable
              accessibilityLabel="Editar grupo"
              accessibilityRole="button"
              onPress={openEditGroup}
              style={({ pressed }) => [
                styles.headerButton,
                pressed ? styles.pressed : null,
              ]}
            >
              <SymbolView
                name={{
                  ios: 'pencil',
                  android: 'edit',
                  web: 'edit',
                }}
                size={19}
                tintColor={colors.primary}
              />
            </Pressable>
          ) : (
            <View style={styles.headerSpacer} />
          )}
        </View>

        {isLoading ? (
          <View style={styles.loading}>
            <ActivityIndicator
              color={colors.primary}
              size="large"
            />
          </View>
        ) : null}

        {!isLoading && loadError ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorTitle}>
              No hemos podido abrir el grupo
            </Text>
            <Text style={styles.errorText}>
              {loadError}
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                void loadGroupData();
              }}
            >
              <Text style={styles.retryText}>
                Volver a intentar
              </Text>
            </Pressable>
          </View>
        ) : null}

        {!isLoading && !loadError && group ? (
          <>
            <View style={styles.heroCard}>
              <View style={styles.heroArtwork}>
                {groupImageUri ? (
                  <Image
                    source={{ uri: groupImageUri }}
                    style={styles.heroImage}
                  />
                ) : (
                  <View style={styles.heroFallback}>
                    <Text style={styles.heroInitial}>
                      {group.name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.heroContent}>
                <Text style={styles.heroEyebrow}>
                  VUESTRO ESPACIO
                </Text>
                <Text style={styles.groupName}>
                  {group.name}
                </Text>

                {group.description ? (
                  <Text style={styles.groupDescription}>
                    {group.description}
                  </Text>
                ) : null}

                <View style={styles.heroChips}>
                  <View style={styles.heroChip}>
                    <SymbolView
                      name={{
                        ios: 'mappin',
                        android: 'location_on',
                        web: 'location_on',
                      }}
                      size={13}
                      tintColor={colors.primary}
                    />
                    <Text style={styles.heroChipText}>
                      {group.city ?? 'Sin ciudad'}
                    </Text>
                  </View>

                  <View style={styles.heroChip}>
                    <SymbolView
                      name={{
                        ios: group.privacy === 'PRIVATE'
                          ? 'lock.fill'
                          : 'globe',
                        android: group.privacy === 'PRIVATE'
                          ? 'lock'
                          : 'public',
                        web: group.privacy === 'PRIVATE'
                          ? 'lock'
                          : 'public',
                      }}
                      size={13}
                      tintColor={colors.primary}
                    />
                    <Text style={styles.heroChipText}>
                      {group.privacy === 'PRIVATE'
                        ? 'Privado'
                        : 'Público'}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>
                  {restaurants.length}
                </Text>
                <Text style={styles.statLabel}>
                  Restaurantes
                </Text>
              </View>

              <View style={styles.statCard}>
                <Text style={styles.statValue}>
                  {members.length}
                </Text>
                <Text style={styles.statLabel}>
                  Miembros
                </Text>
              </View>
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View>
                  <Text style={styles.sectionTitle}>
                    Miembros
                  </Text>
                  <Text style={styles.sectionSubtitle}>
                    Las personas que comparten este grupo
                  </Text>
                </View>

                {isOwner ? (
                  <Pressable
                    accessibilityRole="button"
                    onPress={openAddMember}
                    style={({ pressed }) => [
                      styles.secondaryAction,
                      pressed ? styles.pressed : null,
                    ]}
                  >
                    <SymbolView
                      name={{
                        ios: 'person.badge.plus',
                        android: 'person_add',
                        web: 'person_add',
                      }}
                      size={17}
                      tintColor={colors.primary}
                    />
                    <Text style={styles.secondaryActionText}>
                      Invitar
                    </Text>
                  </Pressable>
                ) : null}
              </View>

              <View style={styles.memberList}>
                {members.map(member => (
                  <MemberRow
                    canRemove={
                      isOwner
                      && member.role !== 'OWNER'
                    }
                    key={member.id}
                    member={member}
                    onRemove={() => {
                      confirmRemoveMember(member);
                    }}
                    removing={
                      removingUserId === member.userId
                    }
                  />
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View>
                  <Text style={styles.sectionTitle}>
                    Restaurantes
                  </Text>
                  <Text style={styles.sectionSubtitle}>
                    Vuestras propuestas y sitios guardados
                  </Text>
                </View>

                <Pressable
                  accessibilityRole="button"
                  onPress={openCreateRestaurant}
                  style={({ pressed }) => [
                    styles.primaryAction,
                    pressed ? styles.primaryActionPressed : null,
                  ]}
                >
                  <SymbolView
                    name={{
                      ios: 'plus',
                      android: 'add',
                      web: 'add',
                    }}
                    size={18}
                    tintColor={colors.white}
                  />
                  <Text style={styles.primaryActionText}>
                    Añadir
                  </Text>
                </Pressable>
              </View>

              {restaurants.length === 0 ? (
                <Pressable
                  accessibilityRole="button"
                  onPress={openCreateRestaurant}
                  style={({ pressed }) => [
                    styles.emptyRestaurants,
                    pressed ? styles.pressed : null,
                  ]}
                >
                  <View style={styles.emptyIcon}>
                    <SymbolView
                      name={{
                        ios: 'fork.knife',
                        android: 'restaurant',
                        web: 'restaurant',
                      }}
                      size={25}
                      tintColor={colors.primary}
                    />
                  </View>
                  <Text style={styles.emptyTitle}>
                    Añadid vuestro primer restaurante
                  </Text>
                  <Text style={styles.emptyText}>
                    Guardad un sitio pendiente y empezad a decidir juntos.
                  </Text>
                </Pressable>
              ) : (
                <View style={styles.restaurantList}>
                  {restaurants.map(item => (
                    <RestaurantCard
                      groupRestaurant={item}
                      key={item.id}
                    />
                  ))}
                </View>
              )}
            </View>
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flexGrow: 1,
    gap: 22,
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 34,
  },
  header: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerButton: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 19,
  },
  headerTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '900',
  },
  headerSpacer: {
    width: 38,
  },
  loading: {
    alignItems: 'center',
    paddingVertical: 90,
  },
  heroCard: {
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 24,
    backgroundColor: colors.surface,
  },
  heroArtwork: {
    height: 160,
    backgroundColor: '#F2DED5',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroInitial: {
    color: colors.primary,
    fontSize: 58,
    fontWeight: '900',
  },
  heroContent: {
    gap: 8,
    padding: 18,
  },
  heroEyebrow: {
    color: colors.primary,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.1,
  },
  groupName: {
    color: colors.text,
    fontSize: 25,
    fontWeight: '900',
    letterSpacing: -0.45,
  },
  groupDescription: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 18,
  },
  heroChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 2,
  },
  heroChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#FBE9E2',
  },
  heroChipText: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: '800',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statCard: {
    flex: 1,
    gap: 2,
    padding: 15,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    backgroundColor: colors.surface,
  },
  statValue: {
    color: colors.primary,
    fontSize: 23,
    fontWeight: '900',
  },
  statLabel: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: '700',
  },
  section: {
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '900',
  },
  sectionSubtitle: {
    marginTop: 3,
    color: colors.muted,
    fontSize: 10,
  },
  secondaryAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: '#FBE9E2',
  },
  secondaryActionText: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: '900',
  },
  primaryAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 11,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: colors.primary,
  },
  primaryActionPressed: {
    backgroundColor: colors.primaryPressed,
  },
  primaryActionText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '900',
  },
  memberList: {
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 19,
    backgroundColor: colors.surface,
  },
  memberRow: {
    minHeight: 68,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  memberAvatar: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: 21,
    backgroundColor: '#F3DED5',
  },
  memberAvatarImage: {
    width: '100%',
    height: '100%',
  },
  memberAvatarText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '900',
  },
  memberText: {
    flex: 1,
    gap: 2,
  },
  memberName: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '900',
  },
  memberUsername: {
    color: colors.muted,
    fontSize: 10,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#EEEAE7',
  },
  ownerBadge: {
    backgroundColor: '#FBE4DA',
  },
  roleText: {
    color: colors.muted,
    fontSize: 8,
    fontWeight: '900',
  },
  ownerRoleText: {
    color: colors.primary,
  },
  removeMemberButton: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
  },
  restaurantList: {
    gap: 10,
  },
  emptyRestaurants: {
    alignItems: 'center',
    gap: 8,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    backgroundColor: colors.surface,
  },
  emptyIcon: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: '#FBE9E2',
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '900',
    textAlign: 'center',
  },
  emptyText: {
    maxWidth: 280,
    color: colors.muted,
    fontSize: 11,
    lineHeight: 17,
    textAlign: 'center',
  },
  errorCard: {
    gap: 8,
    padding: 18,
    borderWidth: 1,
    borderColor: '#F3C5BC',
    borderRadius: 18,
    backgroundColor: '#FFF1EE',
  },
  errorTitle: {
    color: colors.danger,
    fontSize: 15,
    fontWeight: '900',
  },
  errorText: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 18,
  },
  retryText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '900',
  },
  pressed: {
    opacity: 0.66,
  },
});
