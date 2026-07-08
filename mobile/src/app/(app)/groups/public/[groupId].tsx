import { SymbolView } from 'expo-symbols';
import {
  router,
  useFocusEffect,
  useLocalSearchParams,
} from 'expo-router';
import type { Href } from 'expo-router';
import { useCallback, useState } from 'react';
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
  OwnerStrip,
  PrimaryGroupAction,
} from '../../../../components/GroupDetailPrimitives';
import { PublicGroupCollaborationActions } from '../../../../components/PublicGroupCollaborationActions';
import { useAuth } from '../../../../contexts/auth-context';
import { getErrorMessage, resolveApiUrl } from '../../../../lib/api';
import {
  followPublicGroup,
  getPublicGroup,
  unfollowPublicGroup,
} from '../../../../services/group-service';
import { colors } from '../../../../theme/colors';
import type { PublicGroupDetail } from '../../../../types/group';
import type { GroupRestaurant } from '../../../../types/restaurant';

type PublicTab = 'restaurants' | 'collaboration' | 'activity';

const publicTabs = [
  { key: 'restaurants' as const, label: 'Restaurantes' },
  { key: 'collaboration' as const, label: 'Colaboración' },
  { key: 'activity' as const, label: 'Actividad' },
];

function CommunitySummary({
  ownerName,
  ownerAvatar,
  collaborators,
  followers,
}: {
  ownerName: string;
  ownerAvatar: string | null;
  collaborators: number;
  followers: number;
}) {
  const resolvedAvatar = ownerAvatar
    ? resolveApiUrl(ownerAvatar)
    : null;

  return (
    <View style={styles.communityCard}>
      <View style={styles.communityHeader}>
        <Text style={styles.communityTitle}>Comunidad del grupo</Text>
        <Text style={styles.communityTotal}>
          {collaborators} colaboradores
        </Text>
      </View>

      <View style={styles.communityBody}>
        <View style={styles.communityOwner}>
          <View style={styles.communityAvatar}>
            {resolvedAvatar ? (
              <Image
                source={{ uri: resolvedAvatar }}
                style={styles.communityAvatarImage}
              />
            ) : (
              <Text style={styles.communityAvatarText}>
                {ownerName.charAt(0).toUpperCase()}
              </Text>
            )}
          </View>
          <View style={styles.communityOwnerText}>
            <Text style={styles.communityOwnerName}>{ownerName}</Text>
            <Text style={styles.communityOwnerRole}>Creadora</Text>
          </View>
        </View>

        <View style={styles.communityMetric}>
          <View style={styles.communityMetricIcon}>
            <SymbolView
              name={{
                ios: 'person.3.fill',
                android: 'groups',
                web: 'groups',
              }}
              size={18}
              tintColor="#60783D"
            />
          </View>
          <Text style={styles.communityMetricValue}>{collaborators}</Text>
          <Text style={styles.communityMetricLabel}>colaboran</Text>
        </View>

        <View style={styles.communityMetric}>
          <View style={styles.communityMetricIconWarm}>
            <SymbolView
              name={{
                ios: 'heart.fill',
                android: 'favorite',
                web: 'favorite',
              }}
              size={18}
              tintColor={colors.primary}
            />
          </View>
          <Text style={styles.communityMetricValue}>{followers}</Text>
          <Text style={styles.communityMetricLabel}>siguen</Text>
        </View>
      </View>
    </View>
  );
}

export default function PublicGroupDetailScreen() {
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const { accessToken } = useAuth();

  const [detail, setDetail] = useState<PublicGroupDetail | null>(null);
  const [activeTab, setActiveTab] = useState<PublicTab>('restaurants');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingFollow, setUpdatingFollow] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (
    isRefresh = false,
  ): Promise<void> => {
    if (!accessToken || !groupId) {
      setError('No se ha podido recuperar el grupo público.');
      setLoading(false);
      return;
    }

    try {
      setError(null);
      isRefresh ? setRefreshing(true) : setLoading(true);
      setDetail(await getPublicGroup(groupId, accessToken));
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

  async function updateFollowState(
    shouldFollow: boolean,
  ): Promise<void> {
    if (!accessToken || !groupId || !detail || updatingFollow) {
      return;
    }

    try {
      setUpdatingFollow(true);
      setError(null);

      const updatedGroup = shouldFollow
        ? await followPublicGroup(groupId, accessToken)
        : await unfollowPublicGroup(groupId, accessToken);

      setDetail(current => current
        ? { ...current, group: updatedGroup }
        : current);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setUpdatingFollow(false);
    }
  }

  function handleFollowPress(): void {
    if (!detail?.group.following) {
      void updateFollowState(true);
      return;
    }

    Alert.alert(
      'Dejar de seguir',
      'El grupo dejará de aparecer en tu sección de grupos seguidos. Si colaboras en él, seguirás siendo colaboradora.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Dejar de seguir',
          style: 'destructive',
          onPress: () => void updateFollowState(false),
        },
      ],
    );
  }

  function openCopyFlow(): void {
    router.push(`/groups/public/${groupId}/copy` as Href);
  }

  function openOwnedGroup(): void {
    router.push({
      pathname: '/groups/[groupId]',
      params: { groupId },
    });
  }

  async function shareGroup(): Promise<void> {
    if (!detail) {
      return;
    }

    try {
      await Share.share({
        message: `Descubre “${detail.group.name}” en Mesa.`,
      });
    } catch (requestError) {
      Alert.alert(
        'No se ha podido compartir',
        getErrorMessage(requestError),
      );
    }
  }

  function openMenu(): void {
    if (!detail) {
      return;
    }

    Alert.alert(
      detail.group.name,
      undefined,
      [
        ...(detail.group.ownedByCurrentUser
          ? [{ text: 'Abrir mi grupo', onPress: openOwnedGroup }]
          : []),
        ...(detail.restaurants.length > 0
          ? [{ text: 'Copiar restaurantes', onPress: openCopyFlow }]
          : []),
        {
          text: 'Compartir grupo',
          onPress: () => void shareGroup(),
        },
        { text: 'Cancelar', style: 'cancel' },
      ],
    );
  }

  function showRestaurant(item: GroupRestaurant): void {
    const location = [
      item.restaurant.address,
      item.restaurant.city,
    ]
      .filter(Boolean)
      .join(' · ');
    const average = item.averageScore == null
      ? 'Sin valorar'
      : `★ ${item.averageScore.toFixed(1).replace('.', ',')}`;

    Alert.alert(
      item.restaurant.name,
      [
        item.restaurant.category ?? 'Restaurante',
        location || 'Sin ubicación',
        `${average} · ${item.ratingsCount} valoraciones`,
        item.groupNotes,
      ]
        .filter(Boolean)
        .join('\n'),
    );
  }

  const group = detail?.group;
  const groupImage = group?.imageUrl
    ? resolveApiUrl(group.imageUrl)
    : null;

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
          <View style={styles.centered}>
            <ActivityIndicator color={colors.primary} size="large" />
          </View>
        ) : null}

        {!loading && error && !detail ? (
          <View style={styles.messageWrap}>
            <View style={styles.messageCard}>
              <Text style={styles.messageTitle}>
                No hemos podido abrir este grupo
              </Text>
              <Text style={styles.messageText}>{error}</Text>
              <Pressable onPress={() => void load()}>
                <Text style={styles.retryText}>Volver a intentar</Text>
              </Pressable>
            </View>
          </View>
        ) : null}

        {!loading && group && detail ? (
          <>
            <GroupHero
              fallbackInitial={group.name.charAt(0).toUpperCase()}
              imageUri={groupImage}
              onBack={() => router.back()}
              onMenu={openMenu}
              onShare={() => void shareGroup()}
            />

            <View style={styles.sheet}>
              <View style={styles.topContent}>
                <GroupHeading
                  city={group.city}
                  description={group.description}
                  privacyLabel="Grupo público"
                  title={group.name}
                />

                <View style={styles.statsRow}>
                  <GroupStat
                    kind="restaurants"
                    label="restaurantes"
                    value={group.restaurantCount}
                  />
                  <GroupStat
                    kind="collaborators"
                    label="colaboradores"
                    value={group.collaboratorCount}
                  />
                  <GroupStat
                    kind="followers"
                    label="seguidores"
                    value={group.followerCount}
                  />
                </View>

                <View style={styles.mainActions}>
                  <View style={styles.followAction}>
                    <PrimaryGroupAction
                      icon={{
                        ios: group.ownedByCurrentUser
                          ? 'arrow.up.right.square.fill'
                          : group.following
                            ? 'heart.fill'
                            : 'plus',
                        android: group.ownedByCurrentUser
                          ? 'open_in_new'
                          : group.following
                            ? 'favorite'
                            : 'add',
                        web: group.ownedByCurrentUser
                          ? 'open_in_new'
                          : group.following
                            ? 'favorite'
                            : 'add',
                      }}
                      loading={updatingFollow}
                      onPress={group.ownedByCurrentUser
                        ? openOwnedGroup
                        : handleFollowPress}
                      outline={group.following}
                      title={updatingFollow
                        ? 'Actualizando...'
                        : group.ownedByCurrentUser
                          ? 'Abrir mi grupo'
                          : group.following
                            ? 'Siguiendo'
                            : 'Seguir'}
                    />
                  </View>

                  <View style={styles.collaborationAction}>
                    <PublicGroupCollaborationActions
                      groupId={groupId}
                      ownedByCurrentUser={group.ownedByCurrentUser}
                    />
                  </View>
                </View>

                <OwnerStrip
                  avatarUrl={group.owner.avatarUrl}
                  name={group.owner.name}
                  username={group.owner.username}
                />
              </View>

              <GroupTabs
                activeTab={activeTab}
                onChange={setActiveTab}
                tabs={publicTabs}
              />

              <View style={styles.tabContent}>
                {activeTab === 'restaurants' ? (
                  <>
                    {detail.restaurants.length === 0 ? (
                      <EmptyTab
                        icon={{
                          ios: 'fork.knife',
                          android: 'restaurant',
                          web: 'restaurant',
                        }}
                        text="Vuelve pronto para descubrir los primeros restaurantes del grupo."
                        title="La lista está empezando"
                      />
                    ) : (
                      <View style={styles.restaurantList}>
                        {detail.restaurants.map(item => (
                          <GroupRestaurantListCard
                            item={item}
                            key={item.id}
                            mode="public"
                            onPress={() => showRestaurant(item)}
                          />
                        ))}
                      </View>
                    )}

                    <GroupInfoBanner
                      actionLabel="Cómo funciona"
                      icon={{
                        ios: 'person.3.fill',
                        android: 'groups',
                        web: 'groups',
                      }}
                      onPress={() => setActiveTab('collaboration')}
                      subtitle="Los colaboradores pueden valorar, recomendar y proponer nuevos restaurantes."
                      title="Colabora y descubre lo mejor juntos"
                      tone="green"
                    />

                    <CommunitySummary
                      collaborators={group.collaboratorCount}
                      followers={group.followerCount}
                      ownerAvatar={group.owner.avatarUrl}
                      ownerName={group.owner.name}
                    />
                  </>
                ) : null}

                {activeTab === 'collaboration' ? (
                  <>
                    <GroupInfoBanner
                      icon={{
                        ios: 'sparkles',
                        android: 'auto_awesome',
                        web: 'auto_awesome',
                      }}
                      subtitle="Valora restaurantes, comparte recomendaciones y ayuda a construir la lista."
                      title="Una lista hecha entre todos"
                      tone="green"
                    />

                    <PublicGroupCollaborationActions
                      groupId={groupId}
                      ownedByCurrentUser={group.ownedByCurrentUser}
                    />

                    {detail.restaurants.length > 0 ? (
                      <Pressable
                        accessibilityRole="button"
                        onPress={openCopyFlow}
                        style={({ pressed }) => [
                          styles.copyAction,
                          pressed ? styles.pressed : null,
                        ]}
                      >
                        <View style={styles.copyIcon}>
                          <SymbolView
                            name={{
                              ios: 'square.on.square',
                              android: 'content_copy',
                              web: 'content_copy',
                            }}
                            size={19}
                            tintColor={colors.primary}
                          />
                        </View>
                        <View style={styles.copyText}>
                          <Text style={styles.copyTitle}>
                            Copiar restaurantes
                          </Text>
                          <Text style={styles.copySubtitle}>
                            Guarda tus favoritos en uno de tus grupos.
                          </Text>
                        </View>
                        <SymbolView
                          name={{
                            ios: 'chevron.right',
                            android: 'chevron_right',
                            web: 'chevron_right',
                          }}
                          size={17}
                          tintColor={colors.muted}
                        />
                      </Pressable>
                    ) : null}

                    <CommunitySummary
                      collaborators={group.collaboratorCount}
                      followers={group.followerCount}
                      ownerAvatar={group.owner.avatarUrl}
                      ownerName={group.owner.name}
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
                    text="Pronto podrás descubrir nuevas valoraciones, propuestas y cambios del grupo."
                    title="La actividad está en camino"
                  />
                ) : null}

                {error ? (
                  <View style={styles.inlineError}>
                    <Text style={styles.inlineErrorText}>{error}</Text>
                  </View>
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
    paddingBottom: 34,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 120,
  },
  messageWrap: {
    paddingHorizontal: 18,
    paddingTop: 24,
  },
  messageCard: {
    gap: 8,
    padding: 18,
    borderWidth: 1,
    borderColor: '#F3C5BC',
    borderRadius: 18,
    backgroundColor: '#FFF1EE',
  },
  messageTitle: {
    color: colors.danger,
    fontSize: 15,
    fontWeight: '900',
  },
  messageText: {
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
    minHeight: 560,
    marginTop: -30,
    overflow: 'hidden',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    backgroundColor: colors.background,
  },
  topContent: {
    gap: 21,
    paddingHorizontal: 18,
    paddingTop: 28,
    paddingBottom: 18,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 9,
  },
  mainActions: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  followAction: {
    flex: 0.92,
  },
  collaborationAction: {
    flex: 1.08,
  },
  tabContent: {
    gap: 14,
    paddingHorizontal: 18,
    paddingTop: 18,
  },
  restaurantList: {
    gap: 9,
  },
  communityCard: {
    gap: 14,
    padding: 15,
    borderRadius: 20,
    backgroundColor: '#FFF8EE',
  },
  communityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  communityTitle: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '900',
  },
  communityTotal: {
    color: '#60783D',
    fontSize: 9,
    fontWeight: '900',
  },
  communityBody: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  communityOwner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  communityAvatar: {
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: 23,
    backgroundColor: '#FBE9E2',
  },
  communityAvatarImage: {
    width: '100%',
    height: '100%',
  },
  communityAvatarText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '900',
  },
  communityOwnerText: {
    flex: 1,
    gap: 2,
  },
  communityOwnerName: {
    color: colors.text,
    fontSize: 11,
    fontWeight: '900',
  },
  communityOwnerRole: {
    color: colors.primary,
    fontSize: 8,
    fontWeight: '800',
  },
  communityMetric: {
    alignItems: 'center',
    gap: 2,
  },
  communityMetricIcon: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 13,
    backgroundColor: '#E0E9CF',
  },
  communityMetricIconWarm: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 13,
    backgroundColor: '#FBE9E2',
  },
  communityMetricValue: {
    color: colors.text,
    fontSize: 10,
    fontWeight: '900',
  },
  communityMetricLabel: {
    color: colors.muted,
    fontSize: 7,
  },
  copyAction: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    padding: 13,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    backgroundColor: colors.surface,
  },
  copyIcon: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
    backgroundColor: '#FBE9E2',
  },
  copyText: {
    flex: 1,
    gap: 3,
  },
  copyTitle: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '900',
  },
  copySubtitle: {
    color: colors.muted,
    fontSize: 9,
    lineHeight: 14,
  },
  inlineError: {
    padding: 12,
    borderRadius: 14,
    backgroundColor: '#FFF1EE',
  },
  inlineErrorText: {
    color: colors.danger,
    fontSize: 10,
    lineHeight: 15,
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.72,
  },
});
