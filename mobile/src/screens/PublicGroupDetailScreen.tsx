import { SymbolView } from 'expo-symbols';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
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
} from '../components/GroupDetailPrimitives';
import { PublicGroupCollaborationActions } from '../components/PublicGroupCollaborationActions';
import { useAuth } from '../contexts/auth-context';
import { getErrorMessage, resolveApiUrl } from '../lib/api';
import {
  followPublicGroup,
  getPublicGroup,
  unfollowPublicGroup,
} from '../services/group-service';
import { colors } from '../theme/colors';
import type { PublicGroupDetail } from '../types/group';
import type { GroupRestaurant } from '../types/restaurant';

type PublicTab = 'restaurants' | 'collaboration' | 'activity';

const tabs = [
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
  const avatarUri = ownerAvatar
    ? resolveApiUrl(ownerAvatar)
    : null;

  return (
    <View style={styles.communityCard}>
      <View style={styles.communityHeader}>
        <Text style={styles.communityTitle}>Colaboradores destacados</Text>
        <Text style={styles.communityAction}>
          Ver todos ({collaborators}) ›
        </Text>
      </View>

      <View style={styles.communityRow}>
        <View style={styles.communityOwner}>
          <View style={styles.communityAvatar}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.communityAvatarImage} />
            ) : (
              <Text style={styles.communityAvatarText}>
                {ownerName.charAt(0).toUpperCase()}
              </Text>
            )}
          </View>
          <Text numberOfLines={1} style={styles.communityName}>
            {ownerName}
          </Text>
          <Text style={styles.communityRole}>Creadora</Text>
        </View>

        <View style={styles.communityMetric}>
          <View style={styles.communityMetricGreen}>
            <SymbolView
              name={{
                ios: 'person.3.fill',
                android: 'groups',
                web: 'groups',
              }}
              size={17}
              tintColor="#607349"
            />
          </View>
          <Text style={styles.communityMetricValue}>{collaborators}</Text>
          <Text style={styles.communityMetricLabel}>colaboran</Text>
        </View>

        <View style={styles.communityMetric}>
          <View style={styles.communityMetricWarm}>
            <SymbolView
              name={{
                ios: 'heart.fill',
                android: 'favorite',
                web: 'favorite',
              }}
              size={17}
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

  async function updateFollow(shouldFollow: boolean): Promise<void> {
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

  function followPress(): void {
    if (!detail?.group.following) {
      void updateFollow(true);
      return;
    }

    Alert.alert(
      'Dejar de seguir',
      'El grupo dejará de aparecer entre tus grupos seguidos.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Dejar de seguir',
          style: 'destructive',
          onPress: () => void updateFollow(false),
        },
      ],
    );
  }

  function openCopy(): void {
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
    } catch (shareError) {
      Alert.alert('No se ha podido compartir', getErrorMessage(shareError));
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
          ? [{ text: 'Copiar restaurantes', onPress: openCopy }]
          : []),
        { text: 'Compartir grupo', onPress: () => void shareGroup() },
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
  const imageUri = group?.imageUrl
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
          <View style={styles.loadingWrap}>
            <ActivityIndicator color={colors.primary} size="large" />
          </View>
        ) : null}

        {!loading && error && !detail ? (
          <View style={styles.errorWrap}>
            <Text style={styles.errorTitle}>No hemos podido abrir este grupo</Text>
            <Text style={styles.errorText}>{error}</Text>
            <Pressable onPress={() => void load()}>
              <Text style={styles.retryText}>Volver a intentar</Text>
            </Pressable>
          </View>
        ) : null}

        {!loading && group && detail ? (
          <>
            <GroupHero
              fallbackInitial={group.name.charAt(0).toUpperCase()}
              imageUri={imageUri}
              onBack={() => router.back()}
              onMenu={openMenu}
              onShare={() => void shareGroup()}
            />

            <View style={styles.sheet}>
              <View style={styles.summary}>
                <GroupHeading
                  city={group.city}
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

                <View style={styles.actionsRow}>
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
                        : followPress}
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
                tabs={tabs}
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
                        text="Vuelve pronto para descubrir los primeros restaurantes."
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
                      subtitle="Valoran, recomiendan y proponen nuevos restaurantes."
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
                      subtitle="Valora, recomienda y ayuda a construir la lista."
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
                        onPress={openCopy}
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
                            size={18}
                            tintColor={colors.primary}
                          />
                        </View>
                        <View style={styles.copyText}>
                          <Text style={styles.copyTitle}>Copiar restaurantes</Text>
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
                          size={16}
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
                    text="Aquí aparecerán valoraciones, propuestas y novedades."
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
    paddingBottom: 18,
  },
  loadingWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 100,
  },
  errorWrap: {
    gap: 7,
    margin: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F3C5BC',
    borderRadius: 17,
    backgroundColor: '#FFF1EE',
  },
  errorTitle: {
    color: colors.danger,
    fontSize: 14,
    fontWeight: '900',
  },
  errorText: {
    color: colors.muted,
    fontSize: 11,
    lineHeight: 16,
  },
  retryText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '900',
  },
  sheet: {
    minHeight: 540,
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
    alignItems: 'flex-start',
    gap: 8,
  },
  followAction: {
    flex: 0.9,
  },
  collaborationAction: {
    flex: 1.1,
  },
  tabContent: {
    gap: 10,
    paddingHorizontal: 18,
    paddingTop: 12,
  },
  restaurantList: {
    gap: 6,
  },
  communityCard: {
    gap: 11,
    padding: 13,
    borderRadius: 18,
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
    fontSize: 11,
    fontWeight: '900',
  },
  communityAction: {
    color: '#607349',
    fontSize: 9,
    fontWeight: '900',
  },
  communityRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 24,
  },
  communityOwner: {
    width: 58,
    alignItems: 'center',
  },
  communityAvatar: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: 21,
    backgroundColor: '#FBE9E2',
  },
  communityAvatarImage: {
    width: '100%',
    height: '100%',
  },
  communityAvatarText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '900',
  },
  communityName: {
    maxWidth: '100%',
    marginTop: 4,
    color: colors.text,
    fontSize: 8,
    fontWeight: '800',
  },
  communityRole: {
    color: colors.primary,
    fontSize: 7,
    fontWeight: '800',
  },
  communityMetric: {
    alignItems: 'center',
    gap: 2,
  },
  communityMetricGreen: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 13,
    backgroundColor: '#E0E9CF',
  },
  communityMetricWarm: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 13,
    backgroundColor: '#FBE9E2',
  },
  communityMetricValue: {
    color: colors.text,
    fontSize: 9,
    fontWeight: '900',
  },
  communityMetricLabel: {
    color: colors.muted,
    fontSize: 7,
  },
  copyAction: {
    minHeight: 62,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 17,
    backgroundColor: colors.surface,
  },
  copyIcon: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: '#FBE9E2',
  },
  copyText: {
    flex: 1,
    gap: 2,
  },
  copyTitle: {
    color: colors.text,
    fontSize: 11,
    fontWeight: '900',
  },
  copySubtitle: {
    color: colors.muted,
    fontSize: 8,
    lineHeight: 12,
  },
  inlineError: {
    padding: 10,
    borderRadius: 13,
    backgroundColor: '#FFF1EE',
  },
  inlineErrorText: {
    color: colors.danger,
    fontSize: 9,
    lineHeight: 13,
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.72,
  },
});
