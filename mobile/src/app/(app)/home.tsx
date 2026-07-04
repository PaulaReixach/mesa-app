import { SymbolView } from 'expo-symbols';
import {
  router,
  useFocusEffect,
} from 'expo-router';
import {
  useCallback,
  useMemo,
  useState,
} from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { NotificationBellButton } from '../../components/NotificationBellButton';
import { useAuth } from '../../contexts/auth-context';
import {
  getErrorMessage,
  resolveApiUrl,
} from '../../lib/api';
import { getGroups } from '../../services/group-service';
import { getMapRestaurants } from '../../services/map-service';
import { colors } from '../../theme/colors';
import type { RestaurantGroup } from '../../types/group';
import type { MapRestaurant } from '../../types/map';

const artworkBackgrounds = [
  '#F5DED5',
  '#E9E5CF',
  '#E2E9DC',
  '#F2E4D5',
];

function getArtworkBackground(value: string): string {
  const total = Array.from(value).reduce(
    (sum, character) => sum + character.charCodeAt(0),
    0,
  );

  return artworkBackgrounds[
    total % artworkBackgrounds.length
  ];
}

function getStatusLabel(
  status: MapRestaurant['status'],
): string {
  switch (status) {
    case 'WANT_TO_GO':
      return 'Pendiente';
    case 'VISITED':
      return 'Visitado';
    case 'FAVORITE':
      return 'Favorito';
    case 'WANT_TO_REPEAT':
      return 'Repetir';
    case 'DO_NOT_REPEAT':
      return 'No repetir';
    case 'ARCHIVED':
      return 'Archivado';
    default:
      return 'Guardado';
  }
}

function getStatusStyle(
  status: MapRestaurant['status'],
) {
  switch (status) {
    case 'WANT_TO_REPEAT':
    case 'FAVORITE':
      return {
        backgroundColor: '#E7EEDC',
        color: '#62794D',
      };
    case 'VISITED':
      return {
        backgroundColor: '#F0E4D1',
        color: '#8B673D',
      };
    case 'DO_NOT_REPEAT':
    case 'ARCHIVED':
      return {
        backgroundColor: '#EEEAE7',
        color: '#716B67',
      };
    case 'WANT_TO_GO':
    default:
      return {
        backgroundColor: '#FBE4DA',
        color: colors.primary,
      };
  }
}

function GroupPreviewCard({
  group,
  onPress,
}: {
  group: RestaurantGroup;
  onPress: () => void;
}) {
  const imageUri = group.imageUrl
    ? resolveApiUrl(group.imageUrl)
    : null;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.groupCard,
        pressed ? styles.cardPressed : null,
      ]}
    >
      <View style={styles.groupArtwork}>
        {imageUri ? (
          <Image
            source={{ uri: imageUri }}
            style={styles.groupImage}
          />
        ) : (
          <View style={styles.groupInitialContainer}>
            <Text style={styles.groupInitial}>
              {group.name.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.groupCardBody}>
        <Text
          numberOfLines={1}
          style={styles.groupCardTitle}
        >
          {group.name}
        </Text>

        <Text
          numberOfLines={1}
          style={styles.groupCardMeta}
        >
          {group.city ?? 'Sin ciudad'}
          {' · '}
          {group.privacy === 'PRIVATE'
            ? 'Privado'
            : 'Público'}
        </Text>
      </View>
    </Pressable>
  );
}

function RestaurantArtwork({
  name,
  size,
}: {
  name: string;
  size: number;
}) {
  return (
    <View
      style={[
        styles.restaurantArtwork,
        {
          width: size,
          height: size,
          backgroundColor:
            getArtworkBackground(name),
        },
      ]}
    >
      <SymbolView
        name={{
          ios: 'fork.knife',
          android: 'restaurant',
          web: 'restaurant',
        }}
        size={Math.round(size * 0.34)}
        tintColor={colors.primary}
      />
    </View>
  );
}

function PendingRestaurantCard({
  restaurant,
  onPress,
}: {
  restaurant: MapRestaurant;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.pendingCard,
        pressed ? styles.cardPressed : null,
      ]}
    >
      <RestaurantArtwork
        name={restaurant.name}
        size={118}
      />

      <Text
        numberOfLines={1}
        style={styles.pendingName}
      >
        {restaurant.name}
      </Text>

      <Text
        numberOfLines={1}
        style={styles.pendingMeta}
      >
        {restaurant.category ?? 'Restaurante'}
        {restaurant.city
          ? ` · ${restaurant.city}`
          : ''}
      </Text>
    </Pressable>
  );
}

function RestaurantListRow({
  restaurant,
  onPress,
}: {
  restaurant: MapRestaurant;
  onPress: () => void;
}) {
  const statusStyle = getStatusStyle(
    restaurant.status,
  );

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.restaurantRow,
        pressed ? styles.cardPressed : null,
      ]}
    >
      <RestaurantArtwork
        name={restaurant.name}
        size={54}
      />

      <View style={styles.restaurantRowText}>
        <Text
          numberOfLines={1}
          style={styles.restaurantRowName}
        >
          {restaurant.name}
        </Text>

        <Text
          numberOfLines={1}
          style={styles.restaurantRowMeta}
        >
          {restaurant.category ?? 'Restaurante'}
          {' · '}
          {restaurant.groupName}
        </Text>
      </View>

      <View
        style={[
          styles.statusBadge,
          {
            backgroundColor:
              statusStyle.backgroundColor,
          },
        ]}
      >
        <Text
          style={[
            styles.statusBadgeText,
            {
              color: statusStyle.color,
            },
          ]}
        >
          {getStatusLabel(restaurant.status)}
        </Text>
      </View>
    </Pressable>
  );
}

export default function HomeScreen() {
  const {
    user,
    accessToken,
  } = useAuth();

  const [groups, setGroups] =
    useState<RestaurantGroup[]>([]);
  const [restaurants, setRestaurants] =
    useState<MapRestaurant[]>([]);
  const [searchQuery, setSearchQuery] =
    useState('');
  const [isLoading, setIsLoading] =
    useState(true);
  const [isRefreshing, setIsRefreshing] =
    useState(false);
  const [loadError, setLoadError] =
    useState<string | null>(null);

  const loadHome = useCallback(
    async (refreshing = false) => {
      if (!accessToken) {
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

        const [groupsResponse, restaurantsResponse] =
          await Promise.all([
            getGroups(accessToken),
            getMapRestaurants(accessToken),
          ]);

        setGroups(groupsResponse);
        setRestaurants(restaurantsResponse);
      } catch (error) {
        setLoadError(getErrorMessage(error));
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [accessToken],
  );

  useFocusEffect(
    useCallback(() => {
      void loadHome();
    }, [loadHome]),
  );

  const normalizedSearch = searchQuery
    .trim()
    .toLocaleLowerCase('es');

  const filteredRestaurants = useMemo(() => {
    if (!normalizedSearch) {
      return restaurants;
    }

    return restaurants.filter(restaurant => {
      return [
        restaurant.name,
        restaurant.category,
        restaurant.city,
        restaurant.groupName,
      ]
        .filter(Boolean)
        .some(value =>
          value
            ?.toLocaleLowerCase('es')
            .includes(normalizedSearch),
        );
    });
  }, [normalizedSearch, restaurants]);

  const pendingRestaurants = useMemo(
    () => filteredRestaurants
      .filter(restaurant =>
        restaurant.status === 'WANT_TO_GO',
      )
      .slice(0, 6),
    [filteredRestaurants],
  );

  const favoriteRestaurants = useMemo(
    () => filteredRestaurants
      .filter(restaurant =>
        restaurant.status === 'FAVORITE'
        || restaurant.status === 'WANT_TO_REPEAT',
      )
      .slice(0, 4),
    [filteredRestaurants],
  );

  const recentRestaurants = useMemo(
    () => filteredRestaurants
      .filter(restaurant =>
        !favoriteRestaurants.some(favorite =>
          favorite.groupRestaurantId
          === restaurant.groupRestaurantId,
        ),
      )
      .slice(0, 3),
    [favoriteRestaurants, filteredRestaurants],
  );

  function openGroup(groupId: string): void {
    router.push({
      pathname: '/groups/[groupId]',
      params: { groupId },
    });
  }

  function openRestaurant(
    restaurant: MapRestaurant,
  ): void {
    router.push({
      pathname:
        '/groups/[groupId]/restaurants/[groupRestaurantId]',
      params: {
        groupId: restaurant.groupId,
        groupRestaurantId:
          restaurant.groupRestaurantId,
      },
    });
  }

  const userInitial = user?.name
    ?.charAt(0)
    .toUpperCase() ?? '?';

  const avatarUri = user?.avatarUrl
    ? resolveApiUrl(user.avatarUrl)
    : null;

  const noRestaurantResults =
    !isLoading
    && !loadError
    && normalizedSearch.length > 0
    && filteredRestaurants.length === 0;

  return (
    <SafeAreaView
      edges={['top', 'right', 'left']}
      style={styles.safeArea}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            onRefresh={() => {
              void loadHome(true);
            }}
            refreshing={isRefreshing}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.title}>
              ¿Qué te apetece hoy?
            </Text>

            <Text style={styles.welcomeText}>
              Hola, {user?.name ?? 'de nuevo'}
            </Text>
          </View>

          <View style={styles.headerActions}>
            <NotificationBellButton />

            <Pressable
              accessibilityLabel="Abrir perfil"
              accessibilityRole="button"
              onPress={() => {
                router.push('/profile');
              }}
              style={({ pressed }) => [
                styles.avatarButton,
                pressed ? styles.cardPressed : null,
              ]}
            >
              {avatarUri ? (
                <Image
                  source={{ uri: avatarUri }}
                  style={styles.avatarImage}
                />
              ) : (
                <Text style={styles.avatarText}>
                  {userInitial}
                </Text>
              )}
            </Pressable>
          </View>
        </View>

        <View style={styles.searchBar}>
          <SymbolView
            name={{
              ios: 'magnifyingglass',
              android: 'search',
              web: 'search',
            }}
            size={19}
            tintColor={colors.muted}
          />

          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            onChangeText={setSearchQuery}
            placeholder="Buscar restaurantes, cocinas, zonas..."
            placeholderTextColor={colors.muted}
            returnKeyType="search"
            style={styles.searchInput}
            value={searchQuery}
          />

          <Pressable
            accessibilityLabel="Abrir mapa y filtros"
            accessibilityRole="button"
            hitSlop={8}
            onPress={() => {
              router.push('/map');
            }}
            style={({ pressed }) => [
              styles.searchFilterButton,
              pressed ? styles.cardPressed : null,
            ]}
          >
            <SymbolView
              name={{
                ios: 'slider.horizontal.3',
                android: 'tune',
                web: 'tune',
              }}
              size={18}
              tintColor={colors.text}
            />
          </Pressable>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator
              color={colors.primary}
              size="large"
            />
            <Text style={styles.loadingText}>
              Preparando tus sitios...
            </Text>
          </View>
        ) : null}

        {!isLoading && loadError ? (
          <View style={styles.errorCard}>
            <View style={styles.errorIcon}>
              <SymbolView
                name={{
                  ios: 'exclamationmark.triangle',
                  android: 'warning',
                  web: 'warning',
                }}
                size={22}
                tintColor={colors.danger}
              />
            </View>

            <View style={styles.errorContent}>
              <Text style={styles.errorTitle}>
                No hemos podido cargar tu inicio
              </Text>

              <Text style={styles.errorText}>
                {loadError}
              </Text>

              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  void loadHome();
                }}
              >
                <Text style={styles.retryText}>
                  Volver a intentar
                </Text>
              </Pressable>
            </View>
          </View>
        ) : null}

        {!isLoading && !loadError ? (
          <>
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                  Tus grupos
                </Text>

                <Pressable
                  accessibilityRole="button"
                  onPress={() => {
                    router.push('/groups');
                  }}
                >
                  <Text style={styles.sectionAction}>
                    Ver todos
                  </Text>
                </Pressable>
              </View>

              {groups.length > 0 ? (
                <ScrollView
                  contentContainerStyle={
                    styles.horizontalContent
                  }
                  horizontal
                  showsHorizontalScrollIndicator={false}
                >
                  {groups.slice(0, 6).map(group => (
                    <GroupPreviewCard
                      group={group}
                      key={group.id}
                      onPress={() => {
                        openGroup(group.id);
                      }}
                    />
                  ))}
                </ScrollView>
              ) : (
                <Pressable
                  accessibilityRole="button"
                  onPress={() => {
                    router.push('/groups/create');
                  }}
                  style={({ pressed }) => [
                    styles.emptyGroupCard,
                    pressed ? styles.cardPressed : null,
                  ]}
                >
                  <View style={styles.emptyGroupIcon}>
                    <SymbolView
                      name={{
                        ios: 'person.2.badge.plus',
                        android: 'group_add',
                        web: 'group_add',
                      }}
                      size={24}
                      tintColor={colors.primary}
                    />
                  </View>

                  <View style={styles.emptyGroupText}>
                    <Text style={styles.emptyGroupTitle}>
                      Crea tu primer grupo
                    </Text>

                    <Text style={styles.emptyGroupDescription}>
                      Guarda restaurantes y organízate con tu gente.
                    </Text>
                  </View>

                  <SymbolView
                    name={{
                      ios: 'chevron.right',
                      android: 'chevron_right',
                      web: 'chevron_right',
                    }}
                    size={20}
                    tintColor={colors.muted}
                  />
                </Pressable>
              )}
            </View>

            {noRestaurantResults ? (
              <View style={styles.noResultsCard}>
                <SymbolView
                  name={{
                    ios: 'magnifyingglass',
                    android: 'search_off',
                    web: 'search_off',
                  }}
                  size={27}
                  tintColor={colors.primary}
                />

                <Text style={styles.noResultsTitle}>
                  No encontramos coincidencias
                </Text>

                <Text style={styles.noResultsText}>
                  Prueba con otro restaurante, cocina o ciudad.
                </Text>
              </View>
            ) : null}

            {!noRestaurantResults ? (
              <>
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>
                      Pendientes
                    </Text>

                    <Pressable
                      accessibilityRole="button"
                      onPress={() => {
                        router.push('/map');
                      }}
                    >
                      <Text style={styles.sectionAction}>
                        Ver mapa
                      </Text>
                    </Pressable>
                  </View>

                  {pendingRestaurants.length > 0 ? (
                    <ScrollView
                      contentContainerStyle={
                        styles.horizontalContent
                      }
                      horizontal
                      showsHorizontalScrollIndicator={false}
                    >
                      {pendingRestaurants.map(
                        restaurant => (
                          <PendingRestaurantCard
                            key={
                              restaurant.groupRestaurantId
                            }
                            onPress={() => {
                              openRestaurant(restaurant);
                            }}
                            restaurant={restaurant}
                          />
                        ),
                      )}
                    </ScrollView>
                  ) : (
                    <View style={styles.compactEmptyCard}>
                      <Text style={styles.compactEmptyTitle}>
                        No tienes sitios pendientes
                      </Text>

                      <Text style={styles.compactEmptyText}>
                        Añade uno y aparecerá aquí para tenerlo a mano.
                      </Text>
                    </View>
                  )}
                </View>

                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>
                      Favoritos
                    </Text>

                    <Pressable
                      accessibilityRole="button"
                      onPress={() => {
                        router.push('/map');
                      }}
                    >
                      <Text style={styles.sectionAction}>
                        Ver todos
                      </Text>
                    </Pressable>
                  </View>

                  {favoriteRestaurants.length > 0 ? (
                    <View style={styles.restaurantRows}>
                      {favoriteRestaurants.map(
                        restaurant => (
                          <RestaurantListRow
                            key={
                              restaurant.groupRestaurantId
                            }
                            onPress={() => {
                              openRestaurant(restaurant);
                            }}
                            restaurant={restaurant}
                          />
                        ),
                      )}
                    </View>
                  ) : (
                    <View style={styles.compactEmptyCard}>
                      <Text style={styles.compactEmptyTitle}>
                        Aún no tienes favoritos
                      </Text>

                      <Text style={styles.compactEmptyText}>
                        Marca los sitios que más te gusten para encontrarlos rápido.
                      </Text>
                    </View>
                  )}
                </View>

                {recentRestaurants.length > 0 ? (
                  <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                      <Text style={styles.sectionTitle}>
                        Actividad reciente
                      </Text>
                    </View>

                    <View style={styles.restaurantRows}>
                      {recentRestaurants.map(
                        restaurant => (
                          <RestaurantListRow
                            key={
                              restaurant.groupRestaurantId
                            }
                            onPress={() => {
                              openRestaurant(restaurant);
                            }}
                            restaurant={restaurant}
                          />
                        ),
                      )}
                    </View>
                  </View>
                ) : null}
              </>
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
    gap: 24,
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 30,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 14,
  },

  headerText: {
    flex: 1,
  },

  title: {
    color: colors.text,
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: -0.55,
  },

  welcomeText: {
    marginTop: 4,
    color: colors.muted,
    fontSize: 12,
    fontWeight: '600',
  },

  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  avatarButton: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: 19,
    backgroundColor: colors.primary,
  },

  avatarImage: {
    width: '100%',
    height: '100%',
  },

  avatarText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '900',
  },

  searchBar: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingLeft: 14,
    paddingRight: 5,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    backgroundColor: colors.inputBackground,
  },

  searchInput: {
    flex: 1,
    minHeight: 46,
    paddingVertical: 0,
    color: colors.text,
    fontSize: 13,
  },

  searchFilterButton: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 13,
    backgroundColor: '#F7E9E3',
  },

  loadingContainer: {
    alignItems: 'center',
    gap: 12,
    paddingVertical: 70,
  },

  loadingText: {
    color: colors.muted,
    fontSize: 13,
  },

  errorCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 13,
    padding: 17,
    borderWidth: 1,
    borderColor: '#F3C5BC',
    borderRadius: 19,
    backgroundColor: '#FFF1EE',
  },

  errorIcon: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: '#FBE2DD',
  },

  errorContent: {
    flex: 1,
    gap: 6,
  },

  errorTitle: {
    color: colors.danger,
    fontSize: 15,
    fontWeight: '800',
  },

  errorText: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 18,
  },

  retryText: {
    marginTop: 2,
    color: colors.primary,
    fontSize: 12,
    fontWeight: '800',
  },

  section: {
    gap: 12,
  },

  sectionHeader: {
    minHeight: 24,
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

  sectionAction: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '800',
  },

  horizontalContent: {
    gap: 10,
    paddingRight: 18,
  },

  groupCard: {
    width: 178,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    backgroundColor: colors.surface,
  },

  groupArtwork: {
    height: 90,
    backgroundColor: '#F2E2DA',
  },

  groupImage: {
    width: '100%',
    height: '100%',
  },

  groupInitialContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  groupInitial: {
    color: colors.primary,
    fontSize: 34,
    fontWeight: '900',
  },

  groupCardBody: {
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 11,
  },

  groupCardTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '900',
  },

  groupCardMeta: {
    color: colors.muted,
    fontSize: 10,
  },

  emptyGroupCard: {
    minHeight: 82,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    backgroundColor: colors.surface,
  },

  emptyGroupIcon: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: '#FBE9E2',
  },

  emptyGroupText: {
    flex: 1,
    gap: 3,
  },

  emptyGroupTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '900',
  },

  emptyGroupDescription: {
    color: colors.muted,
    fontSize: 11,
    lineHeight: 16,
  },

  pendingCard: {
    width: 132,
    gap: 5,
  },

  restaurantArtwork: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: 15,
  },

  pendingName: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '900',
  },

  pendingMeta: {
    color: colors.muted,
    fontSize: 9,
  },

  restaurantRows: {
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    backgroundColor: colors.surface,
  },

  restaurantRow: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    paddingHorizontal: 10,
    paddingVertical: 9,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },

  restaurantRowText: {
    flex: 1,
    gap: 4,
  },

  restaurantRowName: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '900',
  },

  restaurantRowMeta: {
    color: colors.muted,
    fontSize: 10,
  },

  statusBadge: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 999,
  },

  statusBadgeText: {
    fontSize: 9,
    fontWeight: '900',
  },

  compactEmptyCard: {
    gap: 5,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 17,
    backgroundColor: colors.surface,
  },

  compactEmptyTitle: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '900',
  },

  compactEmptyText: {
    color: colors.muted,
    fontSize: 11,
    lineHeight: 17,
  },

  noResultsCard: {
    alignItems: 'center',
    gap: 8,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    backgroundColor: colors.surface,
  },

  noResultsTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '900',
    textAlign: 'center',
  },

  noResultsText: {
    maxWidth: 270,
    color: colors.muted,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
  },

  cardPressed: {
    opacity: 0.72,
  },
});
