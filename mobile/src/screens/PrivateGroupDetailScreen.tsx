import { MaterialIcons } from '@expo/vector-icons';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import type { Href } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GroupActivityTab } from '../components/GroupActivityTab';
import {
  EmptyTab,
  GroupHeading,
  GroupHero,
  GroupInfoBanner,
  GroupStat,
  GroupTabs,
  PrimaryGroupAction,
} from '../components/GroupDetailPrimitivesTuned';
import { GroupMembersTab } from '../components/GroupMembersTab';
import { GroupRestaurantRowPolished } from '../components/GroupRestaurantRowPolished';
import { useAuth } from '../contexts/auth-context';
import { getErrorMessage, resolveApiUrl } from '../lib/api';
import { getGroupInvitations } from '../services/group-invitation-service';
import {
  getGroupMembers,
  removeGroupMember,
} from '../services/group-member-service';
import { getGroup } from '../services/group-service';
import { getRestaurantProposalPendingCount } from '../services/restaurant-proposal-service';
import {
  getGroupRestaurants,
  updateGroupRestaurantFavorite,
} from '../services/restaurant-service';
import { colors } from '../theme/colors';
import type {
  PublicGroupOwner,
  RestaurantGroup,
} from '../types/group';
import type { GroupMember } from '../types/group-member';
import type {
  GroupRestaurant,
  GroupRestaurantStatus,
} from '../types/restaurant';

type DetailTab = 'restaurants' | 'members' | 'activity';
type RestaurantFilter =
  | 'ALL'
  | 'FAVORITES'
  | 'WANT_TO_GO'
  | 'VISITED'
  | 'WANT_TO_REPEAT';

const tabs = [
  { key: 'restaurants' as const, label: 'Restaurantes' },
  { key: 'members' as const, label: 'Miembros' },
  { key: 'activity' as const, label: 'Actividad' },
];

const restaurantFilters: Array<{
  label: string;
  value: RestaurantFilter;
}> = [
  { label: 'Todos', value: 'ALL' },
  { label: 'Pendientes', value: 'WANT_TO_GO' },
  { label: 'Visitados', value: 'VISITED' },
  { label: 'Favoritos', value: 'FAVORITES' },
  { label: 'Repetir', value: 'WANT_TO_REPEAT' },
];

function normalizeSearch(value: string): string {
  return value
    .trim()
    .toLocaleLowerCase('es')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function isStatusFilter(value: RestaurantFilter): value is GroupRestaurantStatus {
  return value !== 'ALL' && value !== 'FAVORITES';
}

function friendlyErrorMessage(error: unknown): string {
  const message = getErrorMessage(error);

  if (
    message.toLocaleLowerCase('es').includes('fetch failed')
    || message.toLocaleLowerCase('es').includes('java.net')
    || message.toLocaleLowerCase('es').includes('failed to fetch')
  ) {
    return 'No se ha podido conectar con Mesa. Revisa que el backend esté iniciado y vuelve a intentarlo.';
  }

  return message;
}

export default function PrivateGroupDetailScreen() {
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const { accessToken, user } = useAuth();

  const [group, setGroup] = useState<RestaurantGroup | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [restaurants, setRestaurants] = useState<GroupRestaurant[]>([]);
  const [pendingInvitationCount, setPendingInvitationCount] = useState(0);
  const [pendingProposalCount, setPendingProposalCount] = useState(0);
  const [activeTab, setActiveTab] = useState<DetailTab>('restaurants');
  const [restaurantFilter, setRestaurantFilter] =
    useState<RestaurantFilter>('ALL');
  const [restaurantSearchQuery, setRestaurantSearchQuery] = useState('');
  const [updatingFavoriteId, setUpdatingFavoriteId] =
    useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (
    isRefresh = false,
  ): Promise<void> => {
    if (!accessToken || !groupId) {
      setLoading(false);
      setError('No se ha podido recuperar el grupo.');
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
      setError(friendlyErrorMessage(requestError));
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
  const ownerMember = members.find(member => member.role === 'OWNER');
  const activityOwner: PublicGroupOwner | null = group
    ? {
        id: group.ownerUserId,
        name: ownerMember?.name ?? 'Creadora',
        username: ownerMember?.username ?? '',
        avatarUrl: ownerMember?.avatarUrl ?? null,
      }
    : null;

  const filteredRestaurants = useMemo(() => {
    const query = normalizeSearch(restaurantSearchQuery);

    return restaurants
      .filter(item => {
        if (restaurantFilter === 'FAVORITES' && !item.favorite) {
          return false;
        }

        if (isStatusFilter(restaurantFilter) && item.status !== restaurantFilter) {
          return false;
        }

        if (!query) {
          return true;
        }

        const searchable = normalizeSearch([
          item.restaurant.name,
          item.restaurant.category,
          item.restaurant.address,
          item.restaurant.city,
          item.restaurant.country,
          item.groupNotes,
        ].filter(Boolean).join(' '));

        return searchable.includes(query);
      })
      .filter(item => item.status !== 'ARCHIVED')
      .sort((first, second) => (
        first.restaurant.name.localeCompare(second.restaurant.name, 'es')
      ));
  }, [restaurantFilter, restaurantSearchQuery, restaurants]);

  const favoriteCount = useMemo(() => (
    restaurants.filter(item => item.favorite).length
  ), [restaurants]);

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

  async function toggleFavorite(item: GroupRestaurant): Promise<void> {
    if (!accessToken || !groupId || updatingFavoriteId) {
      return;
    }

    const nextFavorite = !item.favorite;

    try {
      setUpdatingFavoriteId(item.id);
      const updated = await updateGroupRestaurantFavorite(
        groupId,
        item.id,
        { favorite: nextFavorite },
        accessToken,
      );

      setRestaurants(current => current.map(restaurant => (
        restaurant.id === item.id ? updated : restaurant
      )));
    } catch (favoriteError) {
      Alert.alert(
        'No se ha podido actualizar',
        friendlyErrorMessage(favoriteError),
      );
    } finally {
      setUpdatingFavoriteId(null);
    }
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
      Alert.alert('No se ha podido compartir', friendlyErrorMessage(shareError));
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
        friendlyErrorMessage(removeError),
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

        {!loading && error ? (
          <View style={styles.standaloneError}>
            <MaterialIcons
              color={colors.primary}
              name="wifi-off"
              size={28}
            />
            <Text style={styles.errorTitle}>
              No hemos podido cargar el grupo
            </Text>
            <Text style={styles.errorText}>
              {error}
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => void load()}
              style={({ pressed }) => [
                styles.retryButton,
                pressed ? styles.pressed : null,
              ]}
            >
              <Text style={styles.retryButtonText}>
                Volver a intentar
              </Text>
            </Pressable>
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
                    <View style={styles.restaurantTools}>
                      <View style={styles.searchBar}>
                        <MaterialIcons
                          color={colors.muted}
                          name="search"
                          size={18}
                        />
                        <TextInput
                          autoCapitalize="none"
                          autoCorrect={false}
                          onChangeText={setRestaurantSearchQuery}
                          placeholder="Buscar en el grupo"
                          placeholderTextColor={colors.muted}
                          returnKeyType="search"
                          style={styles.searchInput}
                          value={restaurantSearchQuery}
                        />
                        {restaurantSearchQuery ? (
                          <Pressable
                            accessibilityLabel="Borrar búsqueda"
                            accessibilityRole="button"
                            hitSlop={8}
                            onPress={() => setRestaurantSearchQuery('')}
                          >
                            <MaterialIcons
                              color={colors.muted}
                              name="cancel"
                              size={18}
                            />
                          </Pressable>
                        ) : null}
                      </View>

                      <ScrollView
                        contentContainerStyle={styles.filtersContent}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                      >
                        {restaurantFilters.map(filter => {
                          const active = restaurantFilter === filter.value;
                          const count = filter.value === 'FAVORITES'
                            ? favoriteCount
                            : null;

                          return (
                            <Pressable
                              accessibilityRole="button"
                              key={filter.value}
                              onPress={() => setRestaurantFilter(filter.value)}
                              style={({ pressed }) => [
                                styles.filterChip,
                                active ? styles.filterChipActive : null,
                                pressed ? styles.pressed : null,
                              ]}
                            >
                              <Text
                                style={[
                                  styles.filterChipText,
                                  active ? styles.filterChipTextActive : null,
                                ]}
                              >
                                {filter.label}{count !== null ? ` ${count}` : ''}
                              </Text>
                            </Pressable>
                          );
                        })}
                      </ScrollView>
                    </View>

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
                    ) : filteredRestaurants.length === 0 ? (
                      <EmptyTab
                        icon={{
                          ios: 'magnifyingglass',
                          android: 'search_off',
                          web: 'search_off',
                        }}
                        text="Prueba con otro nombre, categoría o filtro."
                        title="No hay restaurantes con esos filtros"
                      />
                    ) : (
                      <View style={styles.restaurantList}>
                        {filteredRestaurants.map(item => (
                          <GroupRestaurantRowPolished
                            item={item}
                            key={item.id}
                            onFavoritePress={updatingFavoriteId === item.id
                              ? undefined
                              : () => void toggleFavorite(item)}
                            onPress={() => openRestaurant(item)}
                          />
                        ))}
                      </View>
                    )}
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
    paddingBottom: 26,
  },
  loadingWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 100,
  },
  standaloneError: {
    alignItems: 'center',
    gap: 10,
    margin: 18,
    padding: 22,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 24,
    backgroundColor: colors.surface,
  },
  errorTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '900',
    textAlign: 'center',
  },
  errorText: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 6,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: colors.primary,
  },
  retryButtonText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '900',
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
    gap: 12,
    paddingHorizontal: 18,
    paddingTop: 12,
  },
  restaurantTools: {
    gap: 10,
  },
  searchBar: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 13,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    backgroundColor: colors.surface,
  },
  searchInput: {
    flex: 1,
    minHeight: 42,
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
  },
  filtersContent: {
    gap: 8,
    paddingRight: 18,
  },
  filterChip: {
    minHeight: 35,
    justifyContent: 'center',
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    backgroundColor: colors.surface,
  },
  filterChipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  filterChipText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '800',
  },
  filterChipTextActive: {
    color: colors.white,
  },
  restaurantList: {
    gap: 8,
  },
  pressed: {
    opacity: 0.72,
  },
});
