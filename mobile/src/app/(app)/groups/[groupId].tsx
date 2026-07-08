import { SymbolView } from 'expo-symbols';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import type { Href } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  EmptyTab,
  GroupHeading,
  GroupHero,
  GroupInfoBanner,
  GroupRestaurantListCard,
  GroupStat,
  GroupTabs,
  MemberPreview,
  PrimaryGroupAction,
} from '../../../components/GroupDetailPrimitives';
import { useAuth } from '../../../contexts/auth-context';
import { getErrorMessage, resolveApiUrl } from '../../../lib/api';
import { getGroupInvitations } from '../../../services/group-invitation-service';
import { getGroupMembers, removeGroupMember } from '../../../services/group-member-service';
import { getGroup } from '../../../services/group-service';
import { getRestaurantProposalPendingCount } from '../../../services/restaurant-proposal-service';
import { getGroupRestaurants } from '../../../services/restaurant-service';
import { colors } from '../../../theme/colors';
import type { RestaurantGroup } from '../../../types/group';
import type { GroupMember } from '../../../types/group-member';
import type { GroupRestaurant } from '../../../types/restaurant';

type DetailTab = 'restaurants' | 'members' | 'activity';

const detailTabs = [
  { key: 'restaurants' as const, label: 'Restaurantes' },
  { key: 'members' as const, label: 'Miembros' },
  { key: 'activity' as const, label: 'Actividad' },
];

function roleLabel(member: GroupMember): string {
  if (member.role === 'OWNER') {
    return 'Creadora';
  }
  if (member.role === 'CONTRIBUTOR') {
    return 'Colaboradora';
  }
  return 'Miembro';
}

function MemberManagementRow({
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
  const owner = member.role === 'OWNER';
  const contributor = member.role === 'CONTRIBUTOR';

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
        <Text style={styles.memberName}>{member.name}</Text>
        <Text style={styles.memberUsername}>@{member.username}</Text>
      </View>

      <View
        style={[
          styles.roleBadge,
          owner ? styles.ownerBadge : null,
          contributor ? styles.contributorBadge : null,
        ]}
      >
        <Text
          style={[
            styles.roleText,
            owner ? styles.ownerRoleText : null,
            contributor ? styles.contributorRoleText : null,
          ]}
        >
          {roleLabel(member)}
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
            <ActivityIndicator color={colors.danger} size="small" />
          ) : (
            <SymbolView
              name={{
                ios: 'trash',
                android: 'delete_outline',
                web: 'delete_outline',
              }}
              size={17}
              tintColor={colors.danger}
            />
          )}
        </Pressable>
      ) : null}
    </View>
  );
}

export default function GroupDetailScreen() {
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const { accessToken, user } = useAuth();

  const [group, setGroup] = useState<RestaurantGroup | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [restaurants, setRestaurants] = useState<GroupRestaurant[]>([]);
  const [pendingInvitationCount, setPendingInvitationCount] = useState(0);
  const [pendingProposalCount, setPendingProposalCount] = useState(0);
  const [activeTab, setActiveTab] = useState<DetailTab>('restaurants');
  const [removingUserId, setRemovingUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadGroupData = useCallback(async (
    refreshing = false,
  ): Promise<void> => {
    if (!accessToken || !groupId) {
      setIsLoading(false);
      return;
    }

    try {
      setLoadError(null);
      refreshing ? setIsRefreshing(true) : setIsLoading(true);

      const [
        groupResponse,
        membersResponse,
        restaurantsResponse,
      ] = await Promise.all([
        getGroup(groupId, accessToken),
        getGroupMembers(groupId, accessToken),
        getGroupRestaurants(groupId, accessToken),
      ]);

      let invitationCount = 0;
      let proposalCount = 0;

      if (groupResponse.currentUserRole === 'OWNER') {
        const invitations = await getGroupInvitations(
          groupId,
          accessToken,
        );
        invitationCount = invitations.filter(
          invitation => invitation.status === 'PENDING',
        ).length;

        if (groupResponse.privacy === 'PUBLIC') {
          proposalCount = (
            await getRestaurantProposalPendingCount(
              groupId,
              accessToken,
            )
          ).pendingCount;
        }
      }

      setGroup(groupResponse);
      setMembers(membersResponse);
      setRestaurants(restaurantsResponse);
      setPendingInvitationCount(invitationCount);
      setPendingProposalCount(proposalCount);
    } catch (error) {
      setLoadError(getErrorMessage(error));
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [accessToken, groupId]);

  useFocusEffect(
    useCallback(() => {
      void loadGroupData();
    }, [loadGroupData]),
  );

  useEffect(() => {
    if (
      !groupId
      || group?.privacy !== 'PUBLIC'
      || group.currentUserRole === 'OWNER'
    ) {
      return;
    }

    router.replace(`/groups/public/${groupId}` as Href);
  }, [group?.currentUserRole, group?.privacy, groupId]);

  const isOwner = Boolean(group && user?.id === group.ownerUserId);
  const canManageRestaurants = Boolean(
    group
    && (
      group.privacy !== 'PUBLIC'
      || group.currentUserRole === 'OWNER'
    ),
  );
  const isRedirectingToPublicGroup = Boolean(
    group
    && group.privacy === 'PUBLIC'
    && group.currentUserRole !== 'OWNER',
  );
  const groupImageUri = group?.imageUrl
    ? resolveApiUrl(group.imageUrl)
    : null;

  const thirdStat = useMemo(() => {
    if (!group) {
      return null;
    }

    if (isOwner) {
      return {
        kind: 'invitations' as const,
        value: pendingInvitationCount,
        label: 'invitaciones',
      };
    }

    return {
      kind: 'members' as const,
      value: members.length,
      label: 'personas',
    };
  }, [group, isOwner, members.length, pendingInvitationCount]);

  function openCreateRestaurant(): void {
    router.push({
      pathname: '/groups/[groupId]/restaurants/create',
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

  function openRestaurantProposals(): void {
    router.push({
      pathname: '/groups/[groupId]/restaurant-proposals',
      params: { groupId },
    });
  }

  function openRestaurant(item: GroupRestaurant): void {
    router.push({
      pathname: '/groups/[groupId]/restaurants/[groupRestaurantId]',
      params: {
        groupId,
        groupRestaurantId: item.id,
      },
    });
  }

  async function shareGroup(): Promise<void> {
    if (!group) {
      return;
    }

    try {
      await Share.share({
        message: `Descubre “${group.name}” en Mesa.`,
      });
    } catch (error) {
      Alert.alert('No se ha podido compartir', getErrorMessage(error));
    }
  }

  function openMenu(): void {
    if (!group) {
      return;
    }

    const actions = isOwner
      ? [
          {
            text: 'Editar grupo',
            onPress: openEditGroup,
          },
          {
            text: 'Invitar personas',
            onPress: openAddMember,
          },
          {
            text: 'Cancelar',
            style: 'cancel' as const,
          },
        ]
      : [
          {
            text: 'Compartir grupo',
            onPress: () => void shareGroup(),
          },
          {
            text: 'Cancelar',
            style: 'cancel' as const,
          },
        ];

    Alert.alert(group.name, undefined, actions);
  }

  function confirmRemoveMember(member: GroupMember): void {
    Alert.alert(
      'Eliminar miembro',
      `¿Quieres eliminar a ${member.name} del grupo?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => void handleRemoveMember(member),
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
      await removeGroupMember(groupId, member.userId, accessToken);
      setMembers(current =>
        current.filter(item => item.userId !== member.userId),
      );
      await loadGroupData(true);
    } catch (error) {
      Alert.alert(
        'No se ha podido eliminar',
        getErrorMessage(error),
      );
    } finally {
      setRemovingUserId(null);
    }
  }

  if (isRedirectingToPublicGroup) {
    return (
      <SafeAreaView
        edges={['top', 'right', 'bottom', 'left']}
        style={styles.safeArea}
      >
        <View style={styles.loading}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      edges={['top', 'right', 'left']}
      style={styles.safeArea}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={(
          <RefreshControl
            onRefresh={() => void loadGroupData(true)}
            refreshing={isRefreshing}
            tintColor={colors.primary}
          />
        )}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <View style={styles.loading}>
            <ActivityIndicator color={colors.primary} size="large" />
          </View>
        ) : null}

        {!isLoading && loadError ? (
          <View style={styles.errorWrap}>
            <View style={styles.errorCard}>
              <Text style={styles.errorTitle}>
                No hemos podido abrir el grupo
              </Text>
              <Text style={styles.errorText}>{loadError}</Text>
              <Pressable onPress={() => void loadGroupData()}>
                <Text style={styles.retryText}>Volver a intentar</Text>
              </Pressable>
            </View>
          </View>
        ) : null}

        {!isLoading && !loadError && group ? (
          <>
            <GroupHero
              fallbackInitial={group.name.charAt(0).toUpperCase()}
              imageUri={groupImageUri}
              onBack={() => router.back()}
              onMenu={openMenu}
              onShare={() => void shareGroup()}
            />

            <View style={styles.sheet}>
              <View style={styles.topContent}>
                <GroupHeading
                  city={group.city}
                  description={group.description}
                  privacyLabel={group.privacy === 'PRIVATE'
                    ? 'Grupo privado'
                    : 'Grupo público'}
                  title={group.name}
                />

                <View style={styles.statsRow}>
                  <GroupStat
                    kind="restaurants"
                    label="restaurantes"
                    value={restaurants.length}
                  />
                  <GroupStat
                    kind="members"
                    label="miembros"
                    value={members.length}
                  />
                  {thirdStat ? (
                    <GroupStat
                      kind={thirdStat.kind}
                      label={thirdStat.label}
                      value={thirdStat.value}
                    />
                  ) : null}
                </View>

                {isOwner ? (
                  <View style={styles.actionRow}>
                    {canManageRestaurants ? (
                      <View style={styles.actionPrimary}>
                        <PrimaryGroupAction
                          icon={{
                            ios: 'plus',
                            android: 'add',
                            web: 'add',
                          }}
                          onPress={openCreateRestaurant}
                          title="Añadir restaurante"
                        />
                      </View>
                    ) : null}
                    <View style={styles.actionSecondary}>
                      <PrimaryGroupAction
                        icon={{
                          ios: 'person.badge.plus',
                          android: 'person_add',
                          web: 'person_add',
                        }}
                        onPress={openAddMember}
                        outline
                        title="Invitar"
                      />
                    </View>
                  </View>
                ) : null}
              </View>

              <GroupTabs
                activeTab={activeTab}
                onChange={setActiveTab}
                tabs={detailTabs}
              />

              <View style={styles.tabContent}>
                {activeTab === 'restaurants' ? (
                  <>
                    {isOwner && pendingInvitationCount > 0 ? (
                      <GroupInfoBanner
                        actionLabel="Gestionar"
                        icon={{
                          ios: 'envelope.fill',
                          android: 'mail',
                          web: 'mail',
                        }}
                        onPress={openAddMember}
                        subtitle="Personas pendientes de aceptar tu invitación."
                        title={`${pendingInvitationCount} ${pendingInvitationCount === 1
                          ? 'invitación pendiente'
                          : 'invitaciones pendientes'}`}
                      />
                    ) : null}

                    {isOwner
                    && group.privacy === 'PUBLIC'
                    && pendingProposalCount > 0 ? (
                      <GroupInfoBanner
                        actionLabel="Revisar"
                        icon={{
                          ios: 'tray.full.fill',
                          android: 'inbox',
                          web: 'inbox',
                        }}
                        onPress={openRestaurantProposals}
                        subtitle="Restaurantes propuestos por tus colaboradores."
                        title={`${pendingProposalCount} ${pendingProposalCount === 1
                          ? 'propuesta pendiente'
                          : 'propuestas pendientes'}`}
                      />
                    ) : null}

                    {restaurants.length === 0 ? (
                      <EmptyTab
                        icon={{
                          ios: 'fork.knife',
                          android: 'restaurant',
                          web: 'restaurant',
                        }}
                        text="Cuando añadáis vuestro primer sitio, aparecerá aquí."
                        title="Todavía no hay restaurantes"
                      />
                    ) : (
                      <View style={styles.restaurantList}>
                        {restaurants.map(item => (
                          <GroupRestaurantListCard
                            item={item}
                            key={item.id}
                            mode="private"
                            onPress={() => openRestaurant(item)}
                          />
                        ))}
                      </View>
                    )}

                    {members.length > 0 ? (
                      <MemberPreview
                        actionLabel={`Ver todos (${members.length})`}
                        members={members}
                        onAction={() => setActiveTab('members')}
                        title="Miembros del grupo"
                      />
                    ) : null}
                  </>
                ) : null}

                {activeTab === 'members' ? (
                  <>
                    {isOwner ? (
                      <GroupInfoBanner
                        actionLabel="Invitar"
                        icon={{
                          ios: 'person.badge.plus',
                          android: 'person_add',
                          web: 'person_add',
                        }}
                        onPress={openAddMember}
                        subtitle="Las nuevas personas entrarán cuando acepten su invitación."
                        title="Haz crecer vuestro grupo"
                      />
                    ) : null}

                    <View style={styles.memberList}>
                      {members.map(member => (
                        <MemberManagementRow
                          canRemove={isOwner && member.role !== 'OWNER'}
                          key={member.id}
                          member={member}
                          onRemove={() => confirmRemoveMember(member)}
                          removing={removingUserId === member.userId}
                        />
                      ))}
                    </View>
                  </>
                ) : null}

                {activeTab === 'activity' ? (
                  <EmptyTab
                    icon={{
                      ios: 'clock.arrow.circlepath',
                      android: 'history',
                      web: 'history',
                    }}
                    text="Aquí reuniremos nuevas valoraciones, restaurantes añadidos e invitaciones aceptadas."
                    title="La actividad está en camino"
                  />
                ) : null}
              </View>
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
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 32,
  },
  loading: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 120,
  },
  errorWrap: {
    paddingHorizontal: 18,
    paddingTop: 24,
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
  sheet: {
    minHeight: 520,
    marginTop: -30,
    overflow: 'hidden',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    backgroundColor: colors.background,
  },
  topContent: {
    gap: 22,
    paddingHorizontal: 18,
    paddingTop: 28,
    paddingBottom: 18,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 9,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  actionPrimary: {
    flex: 1.45,
  },
  actionSecondary: {
    flex: 1,
  },
  tabContent: {
    gap: 14,
    paddingHorizontal: 18,
    paddingTop: 18,
  },
  restaurantList: {
    gap: 9,
  },
  memberList: {
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    backgroundColor: colors.surface,
  },
  memberRow: {
    minHeight: 70,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  memberAvatar: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: 22,
    backgroundColor: '#FBE9E2',
  },
  memberAvatarImage: {
    width: '100%',
    height: '100%',
  },
  memberAvatarText: {
    color: colors.primary,
    fontWeight: '900',
  },
  memberText: {
    flex: 1,
    gap: 2,
  },
  memberName: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '900',
  },
  memberUsername: {
    color: colors.muted,
    fontSize: 10,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: '#ECE8E6',
  },
  ownerBadge: {
    backgroundColor: '#FBE9E2',
  },
  contributorBadge: {
    backgroundColor: '#E8EEDD',
  },
  roleText: {
    color: colors.muted,
    fontSize: 8,
    fontWeight: '900',
  },
  ownerRoleText: {
    color: colors.primary,
  },
  contributorRoleText: {
    color: '#607349',
  },
  removeMemberButton: {
    padding: 5,
  },
  pressed: {
    opacity: 0.72,
  },
});
