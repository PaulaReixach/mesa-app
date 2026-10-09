import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import type { Href } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GroupActivityTab } from '../components/GroupActivityTab';
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
import { GroupMembersTab } from '../components/GroupMembersTab';
import { FormField } from '../components/FormField';
import { PrimaryButton } from '../components/PrimaryButton';
import { restaurantStatusPresentation } from '../components/RestaurantStatusSection';
import { useAuth } from '../contexts/auth-context';
import { ApiError, getErrorMessage, resolveApiUrl } from '../lib/api';
import { getGroupInvitations } from '../services/group-invitation-service';
import {
  getGroupMembers,
  removeGroupMember,
} from '../services/group-member-service';
import { getGroup } from '../services/group-service';
import { getRestaurantProposalPendingCount } from '../services/restaurant-proposal-service';
import { getGroupRestaurants } from '../services/restaurant-service';
import { colors } from '../theme/colors';
import type {
  PublicGroupOwner,
  RestaurantGroup,
} from '../types/group';
import type { GroupMember } from '../types/group-member';
import type { GroupRestaurant, GroupRestaurantStatus } from '../types/restaurant';

type DetailTab = 'restaurants' | 'members' | 'activity';

const tabs = [
  { key: 'restaurants' as const, label: 'Restaurantes' },
  { key: 'members' as const, label: 'Miembros' },
  { key: 'activity' as const, label: 'Actividad' },
];

const selectableStatuses: GroupRestaurantStatus[] = ['WANT_TO_GO', 'VISITED', 'WANT_TO_REPEAT', 'DO_NOT_REPEAT', 'ARCHIVED'];

export default function PrivateGroupDetailScreen() {
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const { accessToken, user } = useAuth();
  const loadVersion = useRef(0);

  const [group, setGroup] = useState<RestaurantGroup | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [restaurants, setRestaurants] = useState<GroupRestaurant[]>([]);
  const [pendingInvitationCount, setPendingInvitationCount] = useState(0);
  const [pendingProposalCount, setPendingProposalCount] = useState(0);
  const [activeTab, setActiveTab] = useState<DetailTab>('restaurants');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [managementError, setManagementError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<GroupRestaurantStatus | null>(null);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [statusFilterVisible, setStatusFilterVisible] = useState(false);

  const filteredRestaurants = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase('es');
    return restaurants.filter(item => (
      (!statusFilter || item.status === statusFilter)
      && (!favoritesOnly || item.favorite)
      && (!query || [item.restaurant.name, item.restaurant.city, item.restaurant.category]
        .some(value => value?.toLocaleLowerCase('es').includes(query)))
    ));
  }, [restaurants, searchQuery, statusFilter, favoritesOnly]);

  const load = useCallback(async (
    isRefresh = false,
  ): Promise<void> => {
    if (!accessToken || !groupId) {
      setLoading(false);
      return;
    }

    const version = ++loadVersion.current;

    try {
      setError(null);
      setManagementError(null);
      isRefresh ? setRefreshing(true) : setLoading(true);

      const [groupResponse, memberResponse, restaurantResponse] =
        await Promise.all([
          getGroup(groupId, accessToken),
          getGroupMembers(groupId, accessToken),
          getGroupRestaurants(groupId, accessToken),
        ]);

      if (version !== loadVersion.current) return;

      let invitationCount = 0;
      let proposalCount = 0;

      if (groupResponse.currentUserRole === 'OWNER') {
        const [invitations, proposals] = await Promise.allSettled([
          getGroupInvitations(groupId, accessToken),
          groupResponse.privacy === 'PUBLIC'
            ? getRestaurantProposalPendingCount(groupId, accessToken)
            : Promise.resolve({ pendingCount: 0 }),
        ]);
        if (version !== loadVersion.current) return;
        if (invitations.status === 'fulfilled') {
          invitationCount = invitations.value.filter(
            invitation => invitation.status === 'PENDING',
          ).length;
        }
        if (proposals.status === 'fulfilled') {
          proposalCount = proposals.value.pendingCount;
        }
        if (invitations.status === 'rejected' || proposals.status === 'rejected') {
          setManagementError('No hemos podido comprobar las invitaciones o propuestas pendientes.');
        }
      }

      setGroup(groupResponse);
      setMembers(memberResponse);
      setRestaurants(restaurantResponse);
      setPendingInvitationCount(invitationCount);
      setPendingProposalCount(proposalCount);
    } catch (requestError) {
      if (version !== loadVersion.current) return;
      if (requestError instanceof ApiError && [401, 403, 404].includes(requestError.status)) {
        setGroup(null);
        setRestaurants([]);
        setMembers([]);
      }
      setError(getErrorMessage(requestError));
    } finally {
      if (version === loadVersion.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, [accessToken, groupId]);

  useFocusEffect(
    useCallback(() => {
      void load();
      return () => { loadVersion.current += 1; };
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
  const canAddRestaurant = Boolean(group && (
    isOwner || (group.privacy === 'PRIVATE' && group.currentUserRole === 'MEMBER')
  ));
  const ownerMember = members.find(member => member.role === 'OWNER');
  const activityOwner: PublicGroupOwner | null = group
    ? {
        id: group.ownerUserId,
        name: ownerMember?.name ?? 'Creadora',
        username: ownerMember?.username ?? '',
        avatarUrl: ownerMember?.avatarUrl ?? null,
      }
    : null;

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

  function openMember(member: GroupMember): void {
    const role = member.role === 'OWNER'
      ? 'Creadora'
      : group?.privacy === 'PUBLIC'
        ? 'Colaborador'
        : 'Miembro';

    if (!isOwner || member.role === 'OWNER') {
      Alert.alert(member.name, `@${member.username}\n${role}`);
      return;
    }

    Alert.alert(
      member.name,
      `@${member.username}\n${role}`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: group?.privacy === 'PUBLIC'
            ? 'Eliminar colaborador'
            : 'Eliminar miembro',
          style: 'destructive',
          onPress: () => void deleteMember(member),
        },
      ],
    );
  }

  async function deleteMember(member: GroupMember): Promise<void> {
    if (!accessToken || !groupId) {
      return;
    }

    try {
      await removeGroupMember(groupId, member.userId, accessToken);
      setMembers(current =>
        current.filter(item => item.userId !== member.userId),
      );
    } catch (removeError) {
      Alert.alert(
        'No se ha podido eliminar',
        getErrorMessage(removeError),
      );
    }
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
      <FlatList
        data={!loading && group && activeTab === 'restaurants' ? filteredRestaurants : []}
        keyboardShouldPersistTaps="handled"
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.restaurantRow}>
            <GroupRestaurantListCard
              item={item}
              mode="private"
              onPress={() => openRestaurant(item)}
            />
          </View>
        )}
        contentContainerStyle={styles.scrollContent}
        refreshControl={(
          <RefreshControl
            onRefresh={() => void load(true)}
            refreshing={refreshing}
            tintColor={colors.primary}
          />
        )}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={(
          <>
            {loading ? (
              <View style={styles.loadingWrap}>
                <ActivityIndicator color={colors.primary} size="large" />
              </View>
            ) : null}

            {!loading && error ? (
              <View style={styles.errorCard} accessibilityLiveRegion="polite">
                <Text style={styles.errorTitle}>
                  {group ? 'No hemos podido actualizar el grupo' : 'No hemos podido abrir el grupo'}
                </Text>
                <Text style={styles.errorText}>{error}</Text>
                {group ? <Text style={styles.errorText}>Mostramos los datos de la última carga.</Text> : null}
                <PrimaryButton title="Reintentar" onPress={() => void load(true)} loading={refreshing} />
                {!group ? <PrimaryGroupAction title="Volver" icon={{ ios: 'chevron.left', android: 'arrow_back', web: 'arrow_back' }} onPress={() => router.back()} outline /> : null}
              </View>
            ) : null}

            {!loading && group ? (
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
                      {isOwner && !managementError ? <GroupStat
                        kind="invitations"
                        label="invitaciones"
                        value={pendingInvitationCount}
                      /> : null}
                    </View>

                    {canAddRestaurant ? (
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
                        {isOwner ? <View style={styles.secondaryAction}>
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
                        </View> : null}
                      </View>
                    ) : null}
                  </View>

                  <GroupTabs
                    activeTab={activeTab}
                    onChange={setActiveTab}
                    tabs={tabs}
                  />

                  <View style={styles.tabContent}>
                    {managementError ? (
                      <View style={styles.errorCard} accessibilityLiveRegion="polite">
                        <Text style={styles.errorText}>{managementError}</Text>
                        <PrimaryButton title="Reintentar" onPress={() => void load(true)} loading={refreshing} />
                      </View>
                    ) : null}
                    {activeTab === 'restaurants' ? (
                      <>
                        {restaurants.length > 0 ? (
                          <View style={styles.filters}>
                            <FormField label="Buscar en este grupo" placeholder="Nombre, ciudad o cocina" value={searchQuery} onChangeText={setSearchQuery} returnKeyType="search" />
                            <View style={styles.filterActions}>
                              <Pressable accessibilityRole="button" onPress={() => setStatusFilterVisible(true)} style={styles.filterButton}>
                                <Text style={styles.filterText}>Estado: {statusFilter ? restaurantStatusPresentation[statusFilter].label : 'Todos'}</Text>
                              </Pressable>
                              <Pressable accessibilityRole="switch" accessibilityLabel="Solo favoritos" accessibilityState={{ checked: favoritesOnly }} onPress={() => setFavoritesOnly(value => !value)} style={[styles.filterButton, favoritesOnly && styles.activeFilter]}>
                                <Text style={styles.filterText}>{favoritesOnly ? '♥' : '♡'} Favoritos</Text>
                              </Pressable>
                            </View>
                            <Text style={styles.errorText}>{filteredRestaurants.length} de {restaurants.length} restaurantes</Text>
                          </View>
                        ) : null}
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
                        ) : null}
                        {restaurants.length > 0 && filteredRestaurants.length === 0 ? (
                          <>
                            <EmptyTab icon={{ ios: 'magnifyingglass', android: 'search', web: 'search' }} title="No hay coincidencias" text="Prueba otra búsqueda o elimina los filtros." />
                            <PrimaryButton title="Limpiar filtros" onPress={() => { setSearchQuery(''); setStatusFilter(null); setFavoritesOnly(false); }} />
                          </>
                        ) : null}
                      </>
                    ) : null}

                    {activeTab === 'members' ? (
                      <GroupMembersTab
                        canManageInvitations={isOwner}
                        members={members}
                        onManageInvitations={openInvitations}
                        onMemberPress={openMember}
                        pendingInvitationCount={pendingInvitationCount}
                        privacy={group.privacy}
                      />
                    ) : null}

                    {activeTab === 'activity' && activityOwner ? (
                      <GroupActivityTab
                        groupCreatedAt={group.createdAt}
                        members={members}
                        owner={activityOwner}
                        restaurants={restaurants}
                      />
                    ) : null}
                  </View>
                </View>
              </>
            ) : null}
          </>
        )}
        ListFooterComponent={!loading && group && activeTab === 'restaurants' && members.length > 0 ? (
          <View style={styles.tabContent}>
            <MemberPreview
              actionLabel={`Ver todos (${members.length})`}
              members={members}
              onAction={() => setActiveTab('members')}
              title="Miembros del grupo"
            />
          </View>
        ) : null}
      />
      <Modal visible={statusFilterVisible} transparent animationType="fade" onRequestClose={() => setStatusFilterVisible(false)}>
        <SafeAreaView style={styles.modalBackdrop}>
          <View style={styles.modalContent} accessibilityViewIsModal>
            <Text accessibilityRole="header" style={styles.errorTitle}>Filtrar por estado</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {([null, ...selectableStatuses] as (GroupRestaurantStatus | null)[]).map(status => (
                <Pressable
                  key={status ?? 'ALL'}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: statusFilter === status }}
                  onPress={() => { setStatusFilter(status); setStatusFilterVisible(false); }}
                  style={[styles.filterButton, statusFilter === status && styles.activeFilter]}
                >
                  <Text style={styles.filterText}>{status ? restaurantStatusPresentation[status].label : 'Todos'}</Text>
                </Pressable>
              ))}
            </ScrollView>
            <PrimaryButton title="Cancelar" onPress={() => setStatusFilterVisible(false)} />
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: colors.overlay,
  },
  modalContent: {
    maxHeight: '90%',
    gap: 16,
    padding: 20,
    borderRadius: 18,
    backgroundColor: colors.surface,
  },
  filters: {
    gap: 10,
    paddingBottom: 12,
  },
  filterActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterButton: {
    minHeight: 48,
    justifyContent: 'center',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  activeFilter: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  filterText: {
    color: colors.text,
    fontSize: 14,
  },
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
  restaurantRow: {
    paddingHorizontal: 18,
    paddingBottom: 6,
    backgroundColor: colors.background,
  },
  errorCard: {
    gap: 12,
    padding: 18,
    backgroundColor: colors.surface,
  },
  errorTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '600',
  },
  errorText: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22,
  },
});
