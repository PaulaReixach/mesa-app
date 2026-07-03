import * as Location from 'expo-location';
import { SymbolView } from 'expo-symbols';
import {
  router,
  useFocusEffect,
} from 'expo-router';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import MapView, {
  Marker,
  PROVIDER_GOOGLE,
} from 'react-native-maps';
import {
  SafeAreaView,
} from 'react-native-safe-area-context';

import { useAuth } from '../../contexts/auth-context';
import { getErrorMessage } from '../../lib/api';
import {
  getMapRestaurants,
} from '../../services/map-service';
import {
  updateGroupRestaurantStatus,
} from '../../services/restaurant-service';
import { colors } from '../../theme/colors';
import {
  MapRestaurant,
} from '../../types/map';
import {
  GroupRestaurantStatus,
} from '../../types/restaurant';

type Coordinates = {
  latitude: number;
  longitude: number;
};

type DistanceOption =
  | 2
  | 5
  | 10
  | null;

type StatusFilter =
  | 'ALL'
  | 'PENDING'
  | 'FAVORITES';

type MapRestaurantItem =
  MapRestaurant & {
    distanceKm: number | null;
  };

type FilterChipProps = {
  label: string;
  active?: boolean;
  chevron?: boolean;
  onPress: () => void;
};

type RestaurantRowProps = {
  restaurant: MapRestaurantItem;
  selected: boolean;
  updating: boolean;
  onPress: () => void;
  onFavoritePress: () => void;
};

const DEFAULT_REGION = {
  latitude: 39.5696,
  longitude: 2.6502,
  latitudeDelta: 0.08,
  longitudeDelta: 0.08,
};

const DISTANCE_OPTIONS: DistanceOption[] = [
  2,
  5,
  10,
  null,
];

const MAP_STYLE = [
  {
    elementType: 'geometry',
    stylers: [
      {
        color: '#F5EFE6',
      },
    ],
  },
  {
    elementType: 'labels.text.fill',
    stylers: [
      {
        color: '#746A65',
      },
    ],
  },
  {
    elementType: 'labels.text.stroke',
    stylers: [
      {
        color: '#FFF8F3',
      },
    ],
  },
  {
    featureType: 'poi',
    elementType: 'geometry',
    stylers: [
      {
        color: '#ECE7D8',
      },
    ],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [
      {
        color: '#DDE6CD',
      },
    ],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [
      {
        color: '#FFFFFF',
      },
    ],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [
      {
        color: '#E7DDD3',
      },
    ],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [
      {
        color: '#BBDCE4',
      },
    ],
  },
];

function toRadians(
  degrees: number,
): number {
  return degrees * Math.PI / 180;
}

function calculateDistanceKm(
  first: Coordinates,
  second: Coordinates,
): number {
  const earthRadiusKm = 6371;

  const latitudeDifference =
    toRadians(
      second.latitude
      - first.latitude,
    );

  const longitudeDifference =
    toRadians(
      second.longitude
      - first.longitude,
    );

  const firstLatitude =
    toRadians(first.latitude);

  const secondLatitude =
    toRadians(second.latitude);

  const value =
    Math.sin(
      latitudeDifference / 2,
    ) ** 2
    + Math.cos(firstLatitude)
    * Math.cos(secondLatitude)
    * Math.sin(
      longitudeDifference / 2,
    ) ** 2;

  return (
    earthRadiusKm
    * 2
    * Math.atan2(
      Math.sqrt(value),
      Math.sqrt(1 - value),
    )
  );
}

function formatDistance(
  distanceKm: number | null,
): string {
  if (distanceKm === null) {
    return '';
  }

  if (distanceKm < 1) {
    return `${Math.round(
      distanceKm * 1000,
    )} m`;
  }

  return `${
    distanceKm
      .toFixed(1)
      .replace('.', ',')
  } km`;
}

function getMarkerColor(
  status: GroupRestaurantStatus,
): string {
  switch (status) {
    case 'FAVORITE':
    case 'WANT_TO_REPEAT':
      return '#62794D';

    case 'VISITED':
      return '#A47A46';

    case 'DO_NOT_REPEAT':
    case 'ARCHIVED':
      return '#817B76';

    case 'WANT_TO_GO':
    default:
      return colors.primary;
  }
}

function FilterChip({
  label,
  active = false,
  chevron = false,
  onPress,
}: FilterChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.filterChip,

        active
          ? styles.filterChipActive
          : null,

        pressed
          ? styles.pressed
          : null,
      ]}
    >
      <Text
        numberOfLines={1}
        style={[
          styles.filterText,

          active
            ? styles.filterTextActive
            : null,
        ]}
      >
        {label}
      </Text>

      {chevron ? (
        <SymbolView
          name={{
            ios: 'chevron.down',
            android:
              'keyboard_arrow_down',
            web:
              'keyboard_arrow_down',
          }}
          size={14}
          tintColor={
            active
              ? colors.primary
              : colors.muted
          }
        />
      ) : null}
    </Pressable>
  );
}

function RestaurantMarker({
  restaurant,
  selected,
  onPress,
}: {
  restaurant: MapRestaurantItem;
  selected: boolean;
  onPress: () => void;
}) {
  const markerColor =
    getMarkerColor(
      restaurant.status,
    );

  return (
    <Marker
      coordinate={{
        latitude:
          restaurant.latitude,

        longitude:
          restaurant.longitude,
      }}
      onPress={onPress}
    >
      <View style={styles.marker}>
        <View
          style={[
            styles.markerCircle,

            {
              backgroundColor:
                markerColor,
            },

            selected
              ? styles.markerCircleSelected
              : null,
          ]}
        >
          <SymbolView
            name={{
              ios: 'fork.knife',
              android: 'restaurant',
              web: 'restaurant',
            }}
            size={
              selected
                ? 18
                : 16
            }
            tintColor={colors.white}
          />
        </View>

        <View
          style={[
            styles.markerPoint,

            {
              borderTopColor:
                markerColor,
            },
          ]}
        />
      </View>
    </Marker>
  );
}

function RestaurantRow({
  restaurant,
  selected,
  updating,
  onPress,
  onFavoritePress,
}: RestaurantRowProps) {
  const favorite =
    restaurant.status === 'FAVORITE';

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.restaurantRow,

        selected
          ? styles.restaurantRowSelected
          : null,

        pressed
          ? styles.pressed
          : null,
      ]}
    >
      <View style={styles.thumbnail}>
        <SymbolView
          name={{
            ios: 'fork.knife',
            android: 'restaurant',
            web: 'restaurant',
          }}
          size={22}
          tintColor={colors.primary}
        />
      </View>

      <View style={styles.restaurantText}>
        <Text
          numberOfLines={1}
          style={styles.restaurantName}
        >
          {restaurant.name}
        </Text>

        <Text
          numberOfLines={1}
          style={styles.restaurantInfo}
        >
          {restaurant.category
            ?? 'Restaurante'}
          {' · '}
          {restaurant.groupName}
        </Text>
      </View>

      <View style={styles.restaurantEnd}>
        <Text style={styles.distance}>
          {formatDistance(
            restaurant.distanceKm,
          )}
        </Text>

        <Pressable
          accessibilityLabel={
            favorite
              ? 'Quitar de favoritos'
              : 'Añadir a favoritos'
          }
          accessibilityRole="button"
          disabled={updating}
          hitSlop={10}
          onPress={event => {
            event.stopPropagation();
            onFavoritePress();
          }}
          style={({ pressed }) => [
            styles.favoriteButton,

            pressed
              ? styles.favoriteButtonPressed
              : null,
          ]}
        >
          {updating ? (
            <ActivityIndicator
              color={colors.primary}
              size="small"
            />
          ) : (
            <SymbolView
              name={{
                ios: favorite
                  ? 'bookmark.fill'
                  : 'bookmark',

                android: favorite
                  ? 'bookmark'
                  : 'bookmark_border',

                web: favorite
                  ? 'bookmark'
                  : 'bookmark_border',
              }}
              size={21}
              tintColor={colors.primary}
            />
          )}
        </Pressable>
      </View>
    </Pressable>
  );
}

export default function MapScreen() {
  const {
    accessToken,
  } = useAuth();

  const {
    height: screenHeight,
  } = useWindowDimensions();

  const mapRef =
    useRef<MapView | null>(null);

  const [
    restaurants,
    setRestaurants,
  ] =
    useState<MapRestaurant[]>([]);

  const [
    userLocation,
    setUserLocation,
  ] =
    useState<Coordinates | null>(
      null,
    );

  const [
    locationGranted,
    setLocationGranted,
  ] = useState(false);

  const [
    selectedRestaurantId,
    setSelectedRestaurantId,
  ] = useState<string | null>(
    null,
  );

  const [
    category,
    setCategory,
  ] = useState<string | null>(
    null,
  );

  const [
    distance,
    setDistance,
  ] =
    useState<DistanceOption>(2);

  const [
    statusFilter,
    setStatusFilter,
  ] =
    useState<StatusFilter>(
      'PENDING',
    );

  const [
    filterModalVisible,
    setFilterModalVisible,
  ] = useState(false);

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [
    isMapReady,
    setIsMapReady,
  ] = useState(false);

  const [
    updatingRestaurantId,
    setUpdatingRestaurantId,
  ] = useState<string | null>(
    null,
  );

  const [
    errorMessage,
    setErrorMessage,
  ] = useState<string | null>(
    null,
  );

  const sheetHeight =
    Math.min(
      320,
      Math.max(
        275,
        screenHeight * 0.37,
      ),
    );

  const categories = useMemo(() => {
    return Array.from(
      new Set(
        restaurants
          .map(item =>
            item.category?.trim(),
          )
          .filter(
            (
              value,
            ): value is string =>
              Boolean(value),
          ),
      ),
    ).sort(
      (first, second) =>
        first.localeCompare(
          second,
          'es',
        ),
    );
  }, [restaurants]);

  const restaurantsWithDistance =
    useMemo<MapRestaurantItem[]>(
      () => {
        return restaurants.map(
          restaurant => ({
            ...restaurant,

            distanceKm:
              userLocation
                ? calculateDistanceKm(
                    userLocation,
                    {
                      latitude:
                        restaurant.latitude,

                      longitude:
                        restaurant.longitude,
                    },
                  )
                : null,
          }),
        );
      },
      [
        restaurants,
        userLocation,
      ],
    );

  const visibleRestaurants =
    useMemo(() => {
      return restaurantsWithDistance
        .filter(restaurant => {
          if (
            category
            && restaurant.category
              !== category
          ) {
            return false;
          }

          if (
            statusFilter === 'PENDING'
            && restaurant.status
              !== 'WANT_TO_GO'
          ) {
            return false;
          }

          if (
            statusFilter
              === 'FAVORITES'
            && restaurant.status
              !== 'FAVORITE'
          ) {
            return false;
          }

          if (
            userLocation
            && distance !== null
            && restaurant.distanceKm
              !== null
            && restaurant.distanceKm
              > distance
          ) {
            return false;
          }

          return true;
        })
        .sort((first, second) => {
          if (
            first.groupRestaurantId
            === selectedRestaurantId
          ) {
            return -1;
          }

          if (
            second.groupRestaurantId
            === selectedRestaurantId
          ) {
            return 1;
          }

          if (
            first.distanceKm === null
            || second.distanceKm === null
          ) {
            return first.name.localeCompare(
              second.name,
              'es',
            );
          }

          return (
            first.distanceKm
            - second.distanceKm
          );
        });
    }, [
      category,
      distance,
      restaurantsWithDistance,
      selectedRestaurantId,
      statusFilter,
      userLocation,
    ]);

  const loadMap =
    useCallback(async (): Promise<void> => {
      if (!accessToken) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setErrorMessage(null);

        const restaurantsPromise =
          getMapRestaurants(
            accessToken,
          );

        let currentLocation:
          Coordinates | null = null;

        try {
          const permission =
            await Location
              .requestForegroundPermissionsAsync();

          const granted =
            permission.status
            === 'granted';

          setLocationGranted(
            granted,
          );

          if (granted) {
            const location =
              await Location
                .getCurrentPositionAsync({
                  accuracy:
                    Location
                      .Accuracy
                      .Balanced,
                });

            currentLocation = {
              latitude:
                location.coords.latitude,

              longitude:
                location.coords.longitude,
            };
          }
        } catch {
          setLocationGranted(false);
        }

        const response =
          await restaurantsPromise;

        setRestaurants(response);
        setUserLocation(
          currentLocation,
        );
      } catch (error) {
        setErrorMessage(
          getErrorMessage(error),
        );
      } finally {
        setIsLoading(false);
      }
    }, [accessToken]);

  useFocusEffect(
    useCallback(() => {
      void loadMap();
    }, [loadMap]),
  );

  useEffect(() => {
    if (!isMapReady) {
      return;
    }

    const coordinates =
      visibleRestaurants.map(
        restaurant => ({
          latitude:
            restaurant.latitude,

          longitude:
            restaurant.longitude,
        }),
      );

    if (userLocation) {
      coordinates.push(
        userLocation,
      );
    }

    if (coordinates.length === 0) {
      return;
    }

    const timeout =
      setTimeout(() => {
        if (coordinates.length === 1) {
          mapRef.current
            ?.animateToRegion(
              {
                ...coordinates[0],
                latitudeDelta: 0.035,
                longitudeDelta: 0.035,
              },
              400,
            );

          return;
        }

        mapRef.current
          ?.fitToCoordinates(
            coordinates,
            {
              animated: true,

              edgePadding: {
                top: 55,
                right: 45,
                bottom:
                  sheetHeight + 15,
                left: 45,
              },
            },
          );
      }, 250);

    return () => {
      clearTimeout(timeout);
    };
  }, [
    isMapReady,
    sheetHeight,
    userLocation,
    visibleRestaurants,
  ]);

  function cycleDistance(): void {
    const index =
      DISTANCE_OPTIONS
        .findIndex(
          option =>
            option === distance,
        );

    const nextIndex =
      (
        index + 1
      )
      % DISTANCE_OPTIONS.length;

    setDistance(
      DISTANCE_OPTIONS[nextIndex],
    );
  }

  function togglePending(): void {
    setStatusFilter(current =>
      current === 'PENDING'
        ? 'ALL'
        : 'PENDING',
    );
  }

  function toggleFavorites(): void {
    setStatusFilter(current =>
      current === 'FAVORITES'
        ? 'ALL'
        : 'FAVORITES',
    );
  }

  function resetFilters(): void {
    setCategory(null);
    setDistance(2);
    setStatusFilter('PENDING');
  }

  function openRestaurant(
    restaurant: MapRestaurantItem,
  ): void {
    router.push({
      pathname:
        '/groups/[groupId]/restaurants/[groupRestaurantId]',

      params: {
        groupId:
          restaurant.groupId,

        groupRestaurantId:
          restaurant
            .groupRestaurantId,
      },
    });
  }

  async function toggleFavorite(
    restaurant: MapRestaurantItem,
  ): Promise<void> {
    if (
      !accessToken
      || updatingRestaurantId
    ) {
      return;
    }

    const nextStatus:
      GroupRestaurantStatus =
      restaurant.status
        === 'FAVORITE'
        ? 'VISITED'
        : 'FAVORITE';

    try {
      setUpdatingRestaurantId(
        restaurant
          .groupRestaurantId,
      );

      const response =
        await updateGroupRestaurantStatus(
          restaurant.groupId,
          restaurant.groupRestaurantId,
          {
            status: nextStatus,
          },
          accessToken,
        );

      setRestaurants(current =>
        current.map(item =>
          item.groupRestaurantId
            === restaurant
              .groupRestaurantId
            ? {
                ...item,
                status:
                  response.status,
              }
            : item,
        ),
      );
    } catch (error) {
      Alert.alert(
        'No se ha podido actualizar',
        getErrorMessage(error),
      );
    } finally {
      setUpdatingRestaurantId(
        null,
      );
    }
  }

  const distanceLabel =
    distance === null
      ? 'Distancia'
      : `A ${distance} km`;

  const categoryLabel =
    category ?? 'Tipo';

  const filtersActive =
    category !== null
    || distance !== null
    || statusFilter !== 'ALL';

  return (
    <SafeAreaView
      edges={[
        'top',
        'right',
        'left',
      ]}
      style={styles.safeArea}
    >
      <View style={styles.header}>
        <Text style={styles.title}>
          Mapa
        </Text>

        <Pressable
          accessibilityLabel="Filtros"
          accessibilityRole="button"
          onPress={() => {
            setFilterModalVisible(
              true,
            );
          }}
          style={({ pressed }) => [
            styles.filterIconButton,

            pressed
              ? styles.pressed
              : null,
          ]}
        >
          <SymbolView
            name={{
              ios:
                'slider.horizontal.3',

              android: 'tune',
              web: 'tune',
            }}
            size={21}
            tintColor={colors.text}
          />

          {filtersActive ? (
            <View
              style={styles.filterDot}
            />
          ) : null}
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={
          styles.filters
        }
        horizontal
        showsHorizontalScrollIndicator={
          false
        }
      >
        <FilterChip
          active={category !== null}
          chevron
          label={categoryLabel}
          onPress={() => {
            setFilterModalVisible(
              true,
            );
          }}
        />

        <FilterChip
          active={distance !== null}
          label={distanceLabel}
          onPress={cycleDistance}
        />

        <FilterChip
          active={
            statusFilter === 'PENDING'
          }
          chevron
          label="Pendientes"
          onPress={togglePending}
        />

        <FilterChip
          active={
            statusFilter
              === 'FAVORITES'
          }
          chevron
          label="Favoritos"
          onPress={toggleFavorites}
        />
      </ScrollView>

      <View style={styles.mapContainer}>
        <MapView
          customMapStyle={MAP_STYLE}
          initialRegion={DEFAULT_REGION}
          mapPadding={{
            top: 20,
            right: 15,
            bottom:
              sheetHeight - 5,
            left: 15,
          }}
          onMapReady={() => {
            setIsMapReady(true);
          }}
          provider={
            Platform.OS === 'android'
              ? PROVIDER_GOOGLE
              : undefined
          }
          ref={mapRef}
          rotateEnabled={false}
          showsCompass={false}
          showsMyLocationButton={false}
          showsUserLocation={
            locationGranted
          }
          style={
            StyleSheet.absoluteFill
          }
          toolbarEnabled={false}
        >
          {visibleRestaurants.map(
            restaurant => (
              <RestaurantMarker
                key={
                  restaurant
                    .groupRestaurantId
                }
                onPress={() => {
                  setSelectedRestaurantId(
                    restaurant
                      .groupRestaurantId,
                  );
                }}
                restaurant={restaurant}
                selected={
                  selectedRestaurantId
                  === restaurant
                    .groupRestaurantId
                }
              />
            ),
          )}
        </MapView>

        <View
          style={[
            styles.bottomSheet,
            {
              height: sheetHeight,
            },
          ]}
        >
          <View style={styles.handle} />

          <View style={styles.sheetHeader}>
            <View>
              <Text style={styles.sheetTitle}>
                {userLocation
                  ? 'Cerca de ti'
                  : 'Tus restaurantes'}
              </Text>

              <Text style={styles.sheetSubtitle}>
                {visibleRestaurants.length}
                {' '}
                {visibleRestaurants.length
                  === 1
                  ? 'restaurante'
                  : 'restaurantes'}
              </Text>
            </View>

            {filtersActive ? (
              <Pressable
                accessibilityRole="button"
                onPress={resetFilters}
              >
                <Text style={styles.resetText}>
                  Restablecer
                </Text>
              </Pressable>
            ) : null}
          </View>

          {isLoading ? (
            <View style={styles.state}>
              <ActivityIndicator
                color={colors.primary}
                size="large"
              />

              <Text style={styles.stateText}>
                Cargando restaurantes...
              </Text>
            </View>
          ) : errorMessage ? (
            <View style={styles.state}>
              <Text style={styles.stateTitle}>
                No se ha podido cargar el mapa
              </Text>

              <Text style={styles.stateText}>
                {errorMessage}
              </Text>

              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  void loadMap();
                }}
              >
                <Text style={styles.retryText}>
                  Volver a intentar
                </Text>
              </Pressable>
            </View>
          ) : (
            <FlatList
              contentContainerStyle={
                visibleRestaurants.length
                  === 0
                  ? styles.emptyList
                  : styles.restaurantList
              }
              data={visibleRestaurants}
              keyExtractor={item =>
                item.groupRestaurantId
              }
              ListEmptyComponent={
                <View style={styles.state}>
                  <View style={styles.emptyIcon}>
                    <SymbolView
                      name={{
                        ios:
                          'mappin.slash',

                        android:
                          'location_off',

                        web:
                          'location_off',
                      }}
                      size={24}
                      tintColor={
                        colors.primary
                      }
                    />
                  </View>

                  <Text style={styles.stateTitle}>
                    No hay resultados
                  </Text>

                  <Text style={styles.stateText}>
                    Amplía la distancia o cambia los filtros.
                  </Text>

                  <Pressable
                    accessibilityRole="button"
                    onPress={() => {
                      setDistance(null);
                      setStatusFilter('ALL');
                    }}
                  >
                    <Text style={styles.retryText}>
                      Ver todos
                    </Text>
                  </Pressable>
                </View>
              }
              renderItem={({ item }) => (
                <RestaurantRow
                  onFavoritePress={() => {
                    void toggleFavorite(
                      item,
                    );
                  }}
                  onPress={() => {
                    openRestaurant(item);
                  }}
                  restaurant={item}
                  selected={
                    selectedRestaurantId
                    === item
                      .groupRestaurantId
                  }
                  updating={
                    updatingRestaurantId
                    === item
                      .groupRestaurantId
                  }
                />
              )}
              showsVerticalScrollIndicator={
                false
              }
            />
          )}
        </View>
      </View>

      <Modal
        animationType="slide"
        onRequestClose={() => {
          setFilterModalVisible(
            false,
          );
        }}
        transparent
        visible={filterModalVisible}
      >
        <Pressable
          onPress={() => {
            setFilterModalVisible(
              false,
            );
          }}
          style={styles.modalOverlay}
        >
          <Pressable
            onPress={event => {
              event.stopPropagation();
            }}
            style={styles.modalContent}
          >
            <View style={styles.modalHandle} />

            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Filtrar mapa
              </Text>

              <Pressable
                accessibilityRole="button"
                onPress={resetFilters}
              >
                <Text style={styles.modalReset}>
                  Restablecer
                </Text>
              </Pressable>
            </View>

            <Text style={styles.modalLabel}>
              Distancia
            </Text>

            <View style={styles.modalOptions}>
              {DISTANCE_OPTIONS.map(
                option => {
                  const selected =
                    option === distance;

                  return (
                    <Pressable
                      key={
                        option
                        ?? 'all-distance'
                      }
                      accessibilityRole="button"
                      onPress={() => {
                        setDistance(option);
                      }}
                      style={[
                        styles.modalOption,

                        selected
                          ? styles.modalOptionSelected
                          : null,
                      ]}
                    >
                      <Text
                        style={[
                          styles.modalOptionText,

                          selected
                            ? styles.modalOptionTextSelected
                            : null,
                        ]}
                      >
                        {option === null
                          ? 'Todas'
                          : `${option} km`}
                      </Text>
                    </Pressable>
                  );
                },
              )}
            </View>

            <Text style={styles.modalLabel}>
              Estado
            </Text>

            <View style={styles.modalOptions}>
              {[
                {
                  value:
                    'ALL' as const,
                  label: 'Todos',
                },
                {
                  value:
                    'PENDING' as const,
                  label: 'Pendientes',
                },
                {
                  value:
                    'FAVORITES' as const,
                  label: 'Favoritos',
                },
              ].map(option => {
                const selected =
                  option.value
                  === statusFilter;

                return (
                  <Pressable
                    key={option.value}
                    accessibilityRole="button"
                    onPress={() => {
                      setStatusFilter(
                        option.value,
                      );
                    }}
                    style={[
                      styles.modalOption,

                      selected
                        ? styles.modalOptionSelected
                        : null,
                    ]}
                  >
                    <Text
                      style={[
                        styles.modalOptionText,

                        selected
                          ? styles.modalOptionTextSelected
                          : null,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={styles.modalLabel}>
              Tipo
            </Text>

            <ScrollView
              contentContainerStyle={
                styles.modalOptions
              }
              horizontal
              showsHorizontalScrollIndicator={
                false
              }
            >
              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  setCategory(null);
                }}
                style={[
                  styles.modalOption,

                  category === null
                    ? styles.modalOptionSelected
                    : null,
                ]}
              >
                <Text
                  style={[
                    styles.modalOptionText,

                    category === null
                      ? styles.modalOptionTextSelected
                      : null,
                  ]}
                >
                  Todos
                </Text>
              </Pressable>

              {categories.map(option => {
                const selected =
                  category === option;

                return (
                  <Pressable
                    key={option}
                    accessibilityRole="button"
                    onPress={() => {
                      setCategory(option);
                    }}
                    style={[
                      styles.modalOption,

                      selected
                        ? styles.modalOptionSelected
                        : null,
                    ]}
                  >
                    <Text
                      style={[
                        styles.modalOptionText,

                        selected
                          ? styles.modalOptionTextSelected
                          : null,
                      ]}
                    >
                      {option}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            <Pressable
              accessibilityRole="button"
              onPress={() => {
                setFilterModalVisible(
                  false,
                );
              }}
              style={({ pressed }) => [
                styles.applyButton,

                pressed
                  ? styles.applyButtonPressed
                  : null,
              ]}
            >
              <Text style={styles.applyText}>
                Ver
                {' '}
                {visibleRestaurants.length}
                {' '}
                {visibleRestaurants.length
                  === 1
                  ? 'restaurante'
                  : 'restaurantes'}
              </Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },

  header: {
    minHeight: 53,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
  },

  title: {
    color: colors.text,
    fontSize: 25,
    fontWeight: '800',
    letterSpacing: -0.4,
  },

  filterIconButton: {
    position: 'relative',
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 19,
  },

  filterDot: {
    position: 'absolute',
    top: 5,
    right: 4,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },

  filters: {
    gap: 8,
    paddingHorizontal: 18,
    paddingTop: 3,
    paddingBottom: 12,
  },

  filterChip: {
    minHeight: 35,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 13,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    backgroundColor: colors.surface,
  },

  filterChipActive: {
    borderColor: '#E7B1A0',
    backgroundColor: '#FFF0EB',
  },

  filterText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '600',
  },

  filterTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },

  mapContainer: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: '#F1ECE4',
  },

  marker: {
    alignItems: 'center',
  },

  markerCircle: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.white,
    borderRadius: 20,
    elevation: 5,
  },

  markerCircleSelected: {
    width: 44,
    height: 44,
    borderRadius: 23,
  },

  markerPoint: {
    width: 0,
    height: 0,
    marginTop: -3,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 9,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },

  bottomSheet: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    left: 0,
    overflow: 'hidden',
    borderTopLeftRadius: 27,
    borderTopRightRadius: 27,
    backgroundColor: colors.surface,
    elevation: 12,
  },

  handle: {
    width: 42,
    height: 4,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 7,
    borderRadius: 2,
    backgroundColor: '#D8D0CB',
  },

  sheetHeader: {
    minHeight: 49,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
  },

  sheetTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '800',
  },

  sheetSubtitle: {
    marginTop: 2,
    color: colors.muted,
    fontSize: 10,
    fontWeight: '600',
  },

  resetText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '700',
  },

  restaurantList: {
    paddingHorizontal: 14,
    paddingBottom: 15,
  },

  restaurantRow: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    paddingHorizontal: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#F0E7E1',
  },

  restaurantRowSelected: {
    backgroundColor: '#FFF7F2',
  },

  thumbnail: {
    width: 53,
    height: 53,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: '#F7E4DD',
  },

  restaurantText: {
    flex: 1,
  },

  restaurantName: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '800',
  },

  restaurantInfo: {
    marginTop: 4,
    color: colors.muted,
    fontSize: 10,
  },

  restaurantEnd: {
    minWidth: 55,
    alignItems: 'flex-end',
    gap: 6,
  },

  distance: {
    minHeight: 14,
    color: colors.muted,
    fontSize: 10,
    fontWeight: '600',
  },

  favoriteButton: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
  },

  favoriteButtonPressed: {
    backgroundColor: '#F7E8E2',
  },

  state: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
    paddingBottom: 16,
  },

  stateTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '800',
    textAlign: 'center',
  },

  stateText: {
    maxWidth: 280,
    marginTop: 7,
    color: colors.muted,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
  },

  retryText: {
    marginTop: 12,
    color: colors.primary,
    fontSize: 12,
    fontWeight: '800',
  },

  emptyList: {
    flexGrow: 1,
  },

  emptyIcon: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    borderRadius: 24,
    backgroundColor: '#F7E8E2',
  },

  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor:
      'rgba(43, 36, 33, 0.35)',
  },

  modalContent: {
    maxHeight: '72%',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 28,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: colors.background,
  },

  modalHandle: {
    width: 42,
    height: 4,
    alignSelf: 'center',
    marginBottom: 18,
    borderRadius: 2,
    backgroundColor: '#D8D0CB',
  },

  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 23,
  },

  modalTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '800',
  },

  modalReset: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },

  modalLabel: {
    marginBottom: 9,
    color: colors.text,
    fontSize: 13,
    fontWeight: '800',
  },

  modalOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 22,
  },

  modalOption: {
    minHeight: 36,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 13,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    backgroundColor: colors.surface,
  },

  modalOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },

  modalOptionText: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
  },

  modalOptionTextSelected: {
    color: colors.white,
  },

  applyButton: {
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: colors.primary,
  },

  applyButtonPressed: {
    backgroundColor: colors.primaryPressed,
  },

  applyText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '800',
  },

  pressed: {
    opacity: 0.68,
  },
});