import { SymbolView } from 'expo-symbols';
import {
  router,
  useFocusEffect,
  useLocalSearchParams,
} from 'expo-router';
import type { Href } from 'expo-router';
import {
  useCallback,
  useState,
} from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '../../../../contexts/auth-context';
import {
  getErrorMessage,
  resolveApiUrl,
} from '../../../../lib/api';
import {
  followPublicGroup,
  getPublicGroup,
} from '../../../../services/group-service';
import { colors } from '../../../../theme/colors';
import type { PublicGroupDetail } from '../../../../types/group';
import type { GroupRestaurant } from '../../../../types/restaurant';

function RestaurantRow({
  item,
}: {
  item: GroupRestaurant;
}) {
  const location = [
    item.restaurant.address,
    item.restaurant.city,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <View style={styles.restaurantRow}>
      <View style={styles.restaurantArtwork}>
        <SymbolView
          name={{
            ios: 'fork.knife',
            android: 'restaurant',
            web: 'restaurant',
          }}
          size={21}
          tintColor={colors.primary}
        />
      </View>

      <View style={styles.restaurantText}>
        <Text
          numberOfLines={1}
          style={styles.restaurantName}
        >
          {item.restaurant.name}
        </Text>

        <Text
          numberOfLines={1}
          style={styles.restaurantMeta}
        >
          {item.restaurant.category ?? 'Restaurante'}
          {location ? ` · ${location}` : ''}
        </Text>

        {item.groupNotes ? (
          <Text
            numberOfLines={2}
            style={styles.restaurantNote}
          >
            {item.groupNotes}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

export default function PublicGroupDetailScreen() {
  const { groupId } = useLocalSearchParams<{
    groupId: string;
  }>();
  const { accessToken } = useAuth();

  const [detail, setDetail] =
    useState<PublicGroupDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);
  const [error, setError] =
    useState<string | null>(null);

  const load = useCallback(async () => {
    if (!accessToken || !groupId) {
      setError(
        'No se ha podido recuperar el grupo público.',
      );
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setDetail(
        await getPublicGroup(
          groupId,
          accessToken,
        ),
      );
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, [accessToken, groupId]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  async function handleFollow(): Promise<void> {
    if (
      !accessToken
      || !groupId
      || !detail
      || following
    ) {
      return;
    }

    try {
      setFollowing(true);
      setError(null);

      const updatedGroup = await followPublicGroup(
        groupId,
        accessToken,
      );

      setDetail(current => current
        ? {
            ...current,
            group: updatedGroup,
          }
        : current);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setFollowing(false);
    }
  }

  function openCopyFlow(): void {
    router.push(
      `/groups/public/${groupId}/copy` as Href,
    );
  }

  const group = detail?.group;
  const groupImage = group?.imageUrl
    ? resolveApiUrl(group.imageUrl)
    : null;
  const ownerAvatar = group?.owner.avatarUrl
    ? resolveApiUrl(group.owner.avatarUrl)
    : null;

  return (
    <SafeAreaView
      edges={['top', 'right', 'bottom', 'left']}
      style={styles.safeArea}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              router.back();
            }}
            style={styles.iconButton}
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
            Grupo público
          </Text>

          <View style={styles.iconButton} />
        </View>

        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator
              color={colors.primary}
              size="large"
            />
          </View>
        ) : null}

        {!loading && error && !detail ? (
          <View style={styles.messageCard}>
            <Text style={styles.messageTitle}>
              No hemos podido abrir este grupo
            </Text>
            <Text style={styles.messageText}>
              {error}
            </Text>
            <Pressable
              onPress={() => {
                void load();
              }}
            >
              <Text style={styles.retryText}>
                Volver a intentar
              </Text>
            </Pressable>
          </View>
        ) : null}

        {!loading && group && detail ? (
          <>
            <View style={styles.heroCard}>
              <View style={styles.heroArtwork}>
                {groupImage ? (
                  <Image
                    source={{ uri: groupImage }}
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

              <View style={styles.heroBody}>
                <View style={styles.ownerRow}>
                  <View style={styles.ownerAvatar}>
                    {ownerAvatar ? (
                      <Image
                        source={{ uri: ownerAvatar }}
                        style={styles.ownerAvatarImage}
                      />
                    ) : (
                      <Text style={styles.ownerInitial}>
                        {group.owner.name
                          .charAt(0)
                          .toUpperCase()}
                      </Text>
                    )}
                  </View>

                  <View style={styles.ownerText}>
                    <Text style={styles.groupName}>
                      {group.name}
                    </Text>
                    <Text style={styles.ownerName}>
                      por @{group.owner.username}
                    </Text>
                  </View>
                </View>

                {group.description ? (
                  <Text style={styles.description}>
                    {group.description}
                  </Text>
                ) : null}

                <View style={styles.statsRow}>
                  <View style={styles.stat}>
                    <Text style={styles.statValue}>
                      {group.restaurantCount}
                    </Text>
                    <Text style={styles.statLabel}>
                      Restaurantes
                    </Text>
                  </View>

                  <View style={styles.stat}>
                    <Text style={styles.statValue}>
                      {group.followerCount}
                    </Text>
                    <Text style={styles.statLabel}>
                      Seguidores
                    </Text>
                  </View>

                  <View style={styles.stat}>
                    <Text style={styles.statValue}>
                      {group.collaboratorCount}
                    </Text>
                    <Text style={styles.statLabel}>
                      Colaboradores
                    </Text>
                  </View>
                </View>

                {group.ownedByCurrentUser ? (
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => {
                      router.push({
                        pathname: '/groups/[groupId]',
                        params: { groupId },
                      });
                    }}
                    style={styles.primaryButton}
                  >
                    <Text style={styles.primaryButtonText}>
                      Abrir mi grupo
                    </Text>
                  </Pressable>
                ) : (
                  <Pressable
                    accessibilityRole="button"
                    disabled={group.following || following}
                    onPress={() => {
                      void handleFollow();
                    }}
                    style={[
                      styles.primaryButton,
                      group.following
                        ? styles.followingButton
                        : null,
                    ]}
                  >
                    {following ? (
                      <ActivityIndicator
                        color={colors.white}
                        size="small"
                      />
                    ) : (
                      <Text
                        style={[
                          styles.primaryButtonText,
                          group.following
                            ? styles.followingButtonText
                            : null,
                        ]}
                      >
                        {group.following
                          ? 'Siguiendo'
                          : 'Seguir grupo'}
                      </Text>
                    )}
                  </Pressable>
                )}

                <View style={styles.secondaryActions}>
                  {!group.ownedByCurrentUser ? (
                    <View style={styles.disabledAction}>
                      <Text style={styles.disabledActionText}>
                        Solicitar colaborar · Próximamente
                      </Text>
                    </View>
                  ) : null}

                  {detail.restaurants.length > 0 ? (
                    <Pressable
                      accessibilityRole="button"
                      onPress={openCopyFlow}
                      style={({ pressed }) => [
                        styles.copyAction,
                        pressed ? styles.copyActionPressed : null,
                      ]}
                    >
                      <SymbolView
                        name={{
                          ios: 'square.on.square',
                          android: 'content_copy',
                          web: 'content_copy',
                        }}
                        size={16}
                        tintColor={colors.primary}
                      />
                      <Text style={styles.copyActionText}>
                        Copiar restaurantes
                      </Text>
                    </Pressable>
                  ) : null}
                </View>
              </View>
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                  Restaurantes
                </Text>
                <Text style={styles.sectionCount}>
                  {detail.restaurants.length}
                </Text>
              </View>

              {detail.restaurants.length === 0 ? (
                <View style={styles.messageCard}>
                  <Text style={styles.messageTitle}>
                    La lista está empezando
                  </Text>
                  <Text style={styles.messageText}>
                    Vuelve pronto para descubrir sus primeros restaurantes.
                  </Text>
                </View>
              ) : (
                <View style={styles.restaurantList}>
                  {detail.restaurants.map(item => (
                    <RestaurantRow
                      item={item}
                      key={item.id}
                    />
                  ))}
                </View>
              )}
            </View>

            {error ? (
              <View style={styles.inlineError}>
                <Text style={styles.inlineErrorText}>
                  {error}
                </Text>
              </View>
            ) : null}
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
    gap: 20,
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 36,
  },
  header: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconButton: {
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
  centered: {
    alignItems: 'center',
    paddingVertical: 100,
  },
  heroCard: {
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 24,
    backgroundColor: colors.surface,
  },
  heroArtwork: {
    height: 190,
    backgroundColor: '#F1DED5',
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
    fontSize: 64,
    fontWeight: '900',
  },
  heroBody: {
    gap: 15,
    padding: 18,
  },
  ownerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },
  ownerAvatar: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: 22,
    backgroundColor: '#FBE9E2',
  },
  ownerAvatarImage: {
    width: '100%',
    height: '100%',
  },
  ownerInitial: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '900',
  },
  ownerText: {
    flex: 1,
    gap: 3,
  },
  groupName: {
    color: colors.text,
    fontSize: 23,
    lineHeight: 28,
    fontWeight: '900',
  },
  ownerName: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '800',
  },
  description: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 18,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: '#FFF8F3',
  },
  statValue: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: '900',
  },
  statLabel: {
    color: colors.muted,
    fontSize: 8,
    fontWeight: '800',
    textAlign: 'center',
  },
  primaryButton: {
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 17,
    backgroundColor: colors.primary,
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '900',
  },
  followingButton: {
    backgroundColor: '#E8EEDD',
  },
  followingButtonText: {
    color: '#607349',
  },
  secondaryActions: {
    gap: 8,
  },
  disabledAction: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 15,
    backgroundColor: colors.inputBackground,
  },
  disabledActionText: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: '800',
  },
  copyAction: {
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 15,
    backgroundColor: '#FFF4EF',
  },
  copyActionPressed: {
    opacity: 0.72,
  },
  copyActionText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '900',
  },
  section: {
    gap: 11,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '900',
  },
  sectionCount: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '900',
  },
  restaurantList: {
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    backgroundColor: colors.surface,
  },
  restaurantRow: {
    minHeight: 80,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    padding: 11,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  restaurantArtwork: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: '#F3DED5',
  },
  restaurantText: {
    flex: 1,
    gap: 3,
  },
  restaurantName: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '900',
  },
  restaurantMeta: {
    color: colors.muted,
    fontSize: 9,
  },
  restaurantNote: {
    color: colors.primary,
    fontSize: 9,
    lineHeight: 13,
    fontStyle: 'italic',
  },
  messageCard: {
    gap: 8,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 19,
    backgroundColor: colors.surface,
  },
  messageTitle: {
    color: colors.text,
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
  inlineError: {
    padding: 13,
    borderRadius: 14,
    backgroundColor: '#FFF1EE',
  },
  inlineErrorText: {
    color: colors.danger,
    fontSize: 11,
    lineHeight: 16,
  },
});
