import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import type { Href } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  Share,
  StyleSheet,
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
} from '../components/GroupDetailPrimitivesTuned';
import { useAuth } from '../contexts/auth-context';
import { getErrorMessage, resolveApiUrl } from '../lib/api';
import { getGroupInvitations } from '../services/group-invitation-service';
import { getGroupMembers } from '../services/group-member-service';
import { getGroup } from '../services/group-service';
import { getRestaurantProposalPendingCount } from '../services/restaurant-proposal-service';
import { getGroupRestaurants } from '../services/restaurant-service';
import { colors } from '../theme/colors';
import type { RestaurantGroup } from '../types/group';
import type { GroupMember } from '../types/group-member';
import type { GroupRestaurant } from '../types/restaurant';

type DetailTab = 'restaurants' | 'members' | 'activity';

const tabs = [
  { key: 'restaurants' as const, label: 'Restaurantes' },
  { key: 'members' as const, label: 'Miembros' },
  { key: 'activity' as const, label: 'Actividad' },
];

export default function PrivateGroupDetailScreen() {
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const { accessToken, user } = useAuth();

  const [group, setGroup] = useState<RestaurantGroup | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [restaurants, setRestaurants] = useState<GroupRestaurant[]>([]);
  const [pendingInvitationCount, setPendingInvitationCount] = useState(0);
  const [pendingProposalCount, setPendingProposalCount] = useState(0);
  const [activeTab, setActiveTab] = useState<DetailTab>('restaurants');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (
    isRefresh = false,
  ): Promise<void> => {
    if (!accessToken || !groupId) {
      setLoading(false);
      return;
    }

    try {
      setError(null);
      isRefresh ? setRefreshing(true) : setLoading(true);

      const [groupResponse, memberResponse, restaurantResponse] =
        await Promise.all([
          getGroup(groupId, accessToken),
          getGroupMembers(groupId, accessToken),
          getGroupRestaurants(groupId, accessToken),
        ]);

      let invitationCount = 0;
      let proposalCount = 0;

      if (groupResponse.currentUserRole === 'OWNER') {
        const invitations = await getGroupInvitations(groupId, accessToken);
        invitationCount = invitations.filter(
          invitation => invitation.status === 'PENDING',
        ).length;

        if (groupResponse.privacy === 'PUBLIC') {
          proposalCount = (
            await getRestaurantProposalPendingCount(groupId, accessToken)
          ).pendingCount;
        }
      }

      setGroup(groupResponse);
      setMembers(memberResponse);
      setRestaurants(restaurantResponse);
      setPendingInvitationCount(invitationCount);
      setPendingProposalCount(proposalCount);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [accessToken, groupId]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
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
  const groupImageUri = group?.imageUrl
    ? resolveApiUrl(group.imageUrl)
    : null;
  const previewRestaurants = restaurants.slice(0, 3);

  const thirdStat = useMemo(() => {
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
  }, [isOwner, members.length, pendingInvitationCount]);

  function openCreateRestaurant(): void {
    router.push({
      pathname: '/groups/[groupId]/restaurants/create',
      params: { groupId },
    });
  }

  function openInvitations(): void {
    router.push({
      pathname: '/groups/[groupId]/members/add',
      params: { groupId },
    });
  }

  function openEdit(): void {
    router.push({
      pathname: '/groups/[groupId]/edit',
      params: { groupId },
    });
  }

  function openProposals(): void {
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
    } catch (shareError) {
      Alert.alert('No se ha podido compartir', getErrorMessage(shareError));
    }
  }

  function openMenu(): void {
    if (!group) {
      return;
    }

    Alert.alert(
      group.name,
      undefined,
      isOwner
        ? [
            { text: 'Editar grupo', onPress: openEdit },
            { text: 'Invitar personas', onPress: openInvitations },
            { text: 'Cancelar', style: 'cancel' },
          ]
        : [
            { text: 'Compartir grupo', onPress: () => void shareGroup() },
            { text: 'Cancelar', style: 'cancel' },
          ],
    );
  }

  if (group
    && group.privacy === 'PUBLIC'
    && group.currentUserRole !== 'OWNER') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingWrap}>
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
            onRefresh={() => void load(true)}
            refreshing={refreshing}
            tintColor={colors.primary}
          />
        )}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator color={colors.primary} size="large" />
          </View>
        ) : null}

        {!loading && !error && group ? (
          <>
            <GroupHero
              fallbackInitial={group.name.charAt(0).toUpperCase()}
              imageUri={groupImageUri}
              onBack={() => router.back()}
              onMenu={openMenu}
              onShare={() => void shareGroup()}
            />

            <View style={styles.sheet}>
              <View style={styles.summary}>
                <GroupHeading
                  city={group.city}
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
                  <GroupStat
                    kind={thirdStat.kind}
                    label={thirdStat.label}
                    value={thirdStat.value}
                  />
                </View>

                {isOwner ? (
                  <View style={styles.actionsRow}>
                    <View style={styles.mainAction}>
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
                    <View style={styles.secondaryAction}>
                      <PrimaryGroupAction
                        icon={{
                          ios: 'person.badge.plus',
                          android: 'person_add',
                          web: 'person_add',
                        }}
                        onPress={openInvitations}
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
                tabs={tabs}
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
                        onPress={openInvitations}
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
                        onPress={openProposals}
                        subtitle="Restaurantes propuestos por colaboradores."
                        title={`${pendingProposalCount} ${pendingProposalCount === 1
                          ? 'propuesta pendiente'
                          : 'propuestas pendientes'}`}
                      />
                    ) : null}

                    {previewRestaurants.length === 0 ? (
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
                        {previewRestaurants.map(item => (
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
                    <GroupInfoBanner
                      actionLabel="Invitar"
                      icon={{
                        ios: 'person.badge.plus',
                        android: 'person_add',
                        web: 'person_add',
                      }}
                      onPress={openInvitations}
                      subtitle="Entrarán en el grupo cuando acepten."
                      title="Haz crecer vuestro grupo"
                    />

                    <MemberPreview
                      actionLabel={`Ver todos (${members.length})`}
                      members={members}
                      onAction={openInvitations}
                      title="Miembros del grupo"
                    />
                  </>
                ) : null}

                {activeTab === 'activity' ? (
                  <EmptyTab
                    icon={{
                      ios: 'clock.arrow.circlepath',
                      android: 'history',
                      web: 'history',
                    }}
                    text="Aquí aparecerán valoraciones, restaurantes e invitaciones."
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
    paddingBottom: 18,
  },
  loadingWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 100,
  },
  sheet: {
    minHeight: 520,
    marginTop: -22,
    overflow: 'hidden',
    borderTopLeftRadius: 27,
    borderTopRightRadius: 27,
    backgroundColor: colors.background,
  },
  summary: {
    gap: 13,
    paddingHorizontal: 18,
    paddingTop: 20,
    paddingBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  mainAction: {
    flex: 1.5,
  },
  secondaryAction: {
    flex: 1,
  },
  tabContent: {
    gap: 10,
    paddingHorizontal: 18,
    paddingTop: 12,
  },
  restaurantList: {
    gap: 6,
  },
});
