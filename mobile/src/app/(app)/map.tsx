import * as Location from 'expo-location';
import { router, useFocusEffect } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import {
  ActivityIndicator,
  Alert,
  Animated,
  FlatList,
  Modal,
  PanResponder,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { LayoutChangeEvent } from 'react-native';
import MapView, {
  Marker,
  PROVIDER_GOOGLE,
} from 'react-native-maps';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { useAuth } from '../../contexts/auth-context';
import { getErrorMessage } from '../../lib/api';
import { getMapRestaurants } from '../../services/map-service';
import {
  updateGroupRestaurantStatus,
} from '../../services/restaurant-service';
import { colors } from '../../theme/colors';
import type { MapRestaurant } from '../../types/map';
import type {
  GroupRestaurantStatus,
} from '../../types/restaurant';

type Coordinates = {
  latitude: number;
  longitude: number;
};

type DistanceOption = 2 | 5 | 10 | null;

type StatusFilter =
  | 'ALL'
  | 'WANT_TO_GO'
  | 'VISITED'
  | 'WANT_TO_REPEAT'
  | 'DO_NOT_REPEAT'
  | 'ARCHIVED';

type MapRestaurantItem = MapRestaurant & {
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
  null,
  2,
  5,
  10,
];

const STATUS_OPTIONS: Array<{
  value: StatusFilter;
  label: string;
}> = [
  {
    value: 'ALL',
    label: 'Todos',
  },
  {
    value: 'WANT_TO_GO',
    label: 'Pendiente de ir',
  },
  {
    value: 'VISITED',
    label: 'Visitado',
  },
  {
    value: 'WANT_TO_REPEAT',
    label: 'Queremos repetir',
  },
  {
    value: 'DO_NOT_REPEAT',
    label: 'No repetir',
  },
  {
    value: 'ARCHIVED',
    label: 'Archivado',
  },
];

const FILTER_SHEET_COLLAPSED_TRANSLATE = 210;
const FILTER_SHEET_CLOSE_TRANSLATE = 360;

const MAP_STYLE = [
  {
    elementType: 'geometry',
    stylers: [{ color: '#F5EFE6' }],
  },
  {
    elementType: 'labels.text.fill',
    stylers: [{ color: '#746A65' }],
  },
  {
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#FFF8F3' }],
  },
  {
    featureType: 'poi',
    elementType: 'geometry',
    stylers: [{ color: '#ECE7D8' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#DDE6CD' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#FFFFFF' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#E7DDD3' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#BBDCE4' }],
  },
];

function clamp(
  value: number,
  minimum: number,
  maximum: number,
): number {
  return Math.min(
    Math.max(value, minimum),
    maximum,
  );
}

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

  const latitudeDifference = toRadians(
    second.latitude - first.latitude,
  );

  const longitudeDifference = toRadians(
    second.longitude - first.longitude,
  );

  const firstLatitude = toRadians(
    first.latitude,
  );

  const secondLatitude = toRadians(
    second.latitude,
  );

  const value =
    Math.sin(latitudeDifference / 2) ** 2
    + Math.cos(firstLatitude)
    * Math.cos(secondLatitude)
    * Math.sin(longitudeDifference / 2) ** 2;

  return earthRadiusKm
    * 2
    * Math.atan2(
      Math.sqrt(value),
      Math.sqrt(1 - value),
    );
}

function formatDistance(
  distanceKm: number | null,
): string {
  if (distanceKm === null) {
    return '';
  }

  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }

  return `${distanceKm
    .toFixed(1)
    .replace('.', ',')} km`;
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
            android: 'keyboard_arrow_down',
            web: 'keyboard_arrow_down',
          }}
          size={13}
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
  const markerColor = getMarkerColor(
    restaurant.status,
  );

  return (
    <Marker
      coordinate={{
        latitude: restaurant.latitude,
        longitude: restaurant.longitude,
      }}
      onPress={onPress}
    >
      <View style={styles.marker}>
        <View
          style={[
            styles.markerCircle,
            {
              backgroundColor: markerColor,
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
            size={selected ? 18 : 16}
            tintColor={colors.white}
          />
        </View>

        <View
          style={[
            styles.markerPoint,
            {
              borderTopColor: markerColor,
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
          {restaurant.category ?? 'Restaurante'}
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
  const { accessToken } = useAuth();
  const insets = useSafeAreaInsets();

  const mapRef = useRef<MapView | null>(null);
  const sheetTop = useRef(
    new Animated.Value(0),
  ).current;
  const filterSheetTranslateY = useRef(
    new Animated.Value(0),
  ).current;

  const currentSheetTopRef = useRef(0);
  const panStartTopRef = useRef(0);
  const sheetWasPositionedRef = useRef(false);
  const currentFilterSheetTranslateYRef =
    useRef(0);
  const filterSheetPanStartRef = useRef(0);

  const [restaurants, setRestaurants] =
    useState<MapRestaurant[]>([]);

  const [userLocation, setUserLocation] =
    useState<Coordinates | null>(null);

  const [locationGranted, setLocationGranted] =
    useState(false);

  const [selectedRestaurantId,
    setSelectedRestaurantId] =
    useState<string | null>(null);

  const [distance, setDistance] =
    useState<DistanceOption>(null);

  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>('ALL');

  const [favoritesOnly, setFavoritesOnly] =
    useState(false);

  const [filterModalVisible,
    setFilterModalVisible] =
    useState(false);

  const [isLoading, setIsLoading] =
    useState(true);

  const [isMapReady, setIsMapReady] =
    useState(false);

  const [updatingRestaurantId,
    setUpdatingRestaurantId] =
    useState<string | null>(null);

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  const [mapHeight, setMapHeight] =
    useState(0);

  const snapPoints = useMemo(() => {
    if (mapHeight <= 0) {
      return {
        expanded: 0,
        middle: 0,
        collapsed: 0,
      };
    }

    const expanded = 18;
    const middle = Math.round(
      mapHeight * 0.57,
    );
    const collapsed = Math.max(
      middle + 90,
      mapHeight - 90,
    );

    return {
      expanded,
      middle,
      collapsed,
    };
  }, [mapHeight]);

  const animateSheetTo = useCallback(
    (value: number) => {
      Animated.spring(sheetTop, {
        toValue: value,
        useNativeDriver: false,
        damping: 24,
        stiffness: 220,
        mass: 0.8,
      }).start();
    },
    [sheetTop],
  );

  const nearestSnapPoint = useCallback(
    (value: number): number => {
      const points = [
        snapPoints.expanded,
        snapPoints.middle,
        snapPoints.collapsed,
      ];

      return points.reduce(
        (nearest, point) => {
          return Math.abs(point - value)
            < Math.abs(nearest - value)
            ? point
            : nearest;
        },
        points[0],
      );
    },
    [snapPoints],
  );

  const panResponder = useMemo(() => {
    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (
        _,
        gestureState,
      ) => Math.abs(gestureState.dy) > 3,

      onPanResponderGrant: () => {
        panStartTopRef.current =
          currentSheetTopRef.current;
      },

      onPanResponderMove: (
        _,
        gestureState,
      ) => {
        const nextTop = clamp(
          panStartTopRef.current
            + gestureState.dy,
          snapPoints.expanded,
          snapPoints.collapsed,
        );

        sheetTop.setValue(nextTop);
      },

      onPanResponderRelease: (
        _,
        gestureState,
      ) => {
        const currentTop =
          currentSheetTopRef.current;

        if (gestureState.vy > 0.75) {
          if (currentTop
            < snapPoints.middle - 20) {
            animateSheetTo(
              snapPoints.middle,
            );
          } else {
            animateSheetTo(
              snapPoints.collapsed,
            );
          }

          return;
        }

        if (gestureState.vy < -0.75) {
          if (currentTop
            > snapPoints.middle + 20) {
            animateSheetTo(
              snapPoints.middle,
            );
          } else {
            animateSheetTo(
              snapPoints.expanded,
            );
          }

          return;
        }

        animateSheetTo(
          nearestSnapPoint(currentTop),
        );
      },
    });
  }, [
    animateSheetTo,
    nearestSnapPoint,
    sheetTop,
    snapPoints,
  ]);

  const animateFilterSheetTo = useCallback(
    (value: number) => {
      Animated.spring(filterSheetTranslateY, {
        toValue: value,
        useNativeDriver: true,
        damping: 24,
        stiffness: 230,
        mass: 0.8,
        overshootClamping: true,
      }).start();
    },
    [filterSheetTranslateY],
  );

  const closeFilterModal = useCallback(() => {
    Animated.timing(filterSheetTranslateY, {
      toValue: FILTER_SHEET_CLOSE_TRANSLATE,
      duration: 180,
      useNativeDriver: true,
    }).start(() => {
      setFilterModalVisible(false);
      filterSheetTranslateY.setValue(0);
      currentFilterSheetTranslateYRef.current = 0;
    });
  }, [filterSheetTranslateY]);

  const filterPanResponder = useMemo(() => {
    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (
        _,
        gestureState,
      ) => Math.abs(gestureState.dy) > 3,

      onPanResponderGrant: () => {
        filterSheetPanStartRef.current =
          currentFilterSheetTranslateYRef.current;
      },

      onPanResponderMove: (
        _,
        gestureState,
      ) => {
        const nextTranslateY = clamp(
          filterSheetPanStartRef.current
            + gestureState.dy,
          0,
          FILTER_SHEET_CLOSE_TRANSLATE,
        );

        filterSheetTranslateY.setValue(
          nextTranslateY,
        );
      },

      onPanResponderRelease: (
        _,
        gestureState,
      ) => {
        const currentTranslateY =
          currentFilterSheetTranslateYRef.current;

        if (
          gestureState.vy > 1
          || currentTranslateY > 300
        ) {
          closeFilterModal();
          return;
        }

        if (
          gestureState.vy > 0.45
          || currentTranslateY > 110
        ) {
          animateFilterSheetTo(
            FILTER_SHEET_COLLAPSED_TRANSLATE,
          );
          return;
        }

        animateFilterSheetTo(0);
      },
    });
  }, [
    animateFilterSheetTo,
    closeFilterModal,
    filterSheetTranslateY,
  ]);

  useEffect(() => {
    const listenerId = sheetTop.addListener(
      ({ value }) => {
        currentSheetTopRef.current = value;
      },
    );

    return () => {
      sheetTop.removeListener(listenerId);
    };
  }, [sheetTop]);

  useEffect(() => {
    const listenerId =
      filterSheetTranslateY.addListener(
        ({ value }) => {
          currentFilterSheetTranslateYRef.current =
            value;
        },
      );

    return () => {
      filterSheetTranslateY
        .removeListener(listenerId);
    };
  }, [filterSheetTranslateY]);

  useEffect(() => {
    if (filterModalVisible) {
      filterSheetTranslateY.setValue(0);
      currentFilterSheetTranslateYRef.current = 0;
    }
  }, [
    filterModalVisible,
    filterSheetTranslateY,
  ]);

  useEffect(() => {
    if (mapHeight <= 0) {
      return;
    }

    if (!sheetWasPositionedRef.current) {
      sheetTop.setValue(snapPoints.middle);
      sheetWasPositionedRef.current = true;
      return;
    }

    sheetTop.setValue(
      clamp(
        currentSheetTopRef.current,
        snapPoints.expanded,
        snapPoints.collapsed,
      ),
    );
  }, [mapHeight, sheetTop, snapPoints]);


  const restaurantsWithDistance =
    useMemo<MapRestaurantItem[]>(() => {
      return restaurants.map(restaurant => ({
        ...restaurant,
        distanceKm: userLocation
          ? calculateDistanceKm(
              userLocation,
              {
                latitude: restaurant.latitude,
                longitude: restaurant.longitude,
              },
            )
          : null,
      }));
    }, [restaurants, userLocation]);

  const visibleRestaurants = useMemo(() => {
    return restaurantsWithDistance
      .filter(restaurant => {
        if (
          statusFilter !== 'ALL'
          && restaurant.status !== statusFilter
        ) {
          return false;
        }

        if (
          favoritesOnly
          && restaurant.status !== 'FAVORITE'
        ) {
          return false;
        }

        if (
          userLocation
          && distance !== null
          && restaurant.distanceKm !== null
          && restaurant.distanceKm > distance
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

        return first.distanceKm
          - second.distanceKm;
      });
  }, [
    distance,
    favoritesOnly,
    restaurantsWithDistance,
    selectedRestaurantId,
    statusFilter,
    userLocation,
  ]);

  const loadMap = useCallback(
    async (): Promise<void> => {
      if (!accessToken) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setErrorMessage(null);

        const restaurantsPromise =
          getMapRestaurants(accessToken);

        let currentLocation:
          Coordinates | null = null;

        try {
          const permission = await Location
            .requestForegroundPermissionsAsync();

          const granted =
            permission.status === 'granted';

          setLocationGranted(granted);

          if (granted) {
            const location = await Location
              .getCurrentPositionAsync({
                accuracy:
                  Location.Accuracy.Balanced,
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
        setUserLocation(currentLocation);
      } catch (error) {
        setErrorMessage(
          getErrorMessage(error),
        );
      } finally {
        setIsLoading(false);
      }
    },
    [accessToken],
  );

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
      visibleRestaurants.map(restaurant => ({
        latitude: restaurant.latitude,
        longitude: restaurant.longitude,
      }));

    if (userLocation) {
      coordinates.push(userLocation);
    }

    if (coordinates.length === 0) {
      return;
    }

    const timeout = setTimeout(() => {
      if (coordinates.length === 1) {
        mapRef.current?.animateToRegion(
          {
            ...coordinates[0],
            latitudeDelta: 0.035,
            longitudeDelta: 0.035,
          },
          400,
        );

        return;
      }

      mapRef.current?.fitToCoordinates(
        coordinates,
        {
          animated: true,
          edgePadding: {
            top: 55,
            right: 45,
            bottom: 120,
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
    userLocation,
    visibleRestaurants,
  ]);

  function handleMapLayout(
    event: LayoutChangeEvent,
  ): void {
    setMapHeight(
      event.nativeEvent.layout.height,
    );
  }

  function openFilterModal(): void {
    setFilterModalVisible(true);
  }

  function selectDistance(
    nextDistance: DistanceOption,
  ): void {
    setDistance(nextDistance);
  }

  function selectStatus(
    nextStatus: StatusFilter,
  ): void {
    setStatusFilter(nextStatus);

    if (nextStatus !== 'ALL') {
      setFavoritesOnly(false);
    }
  }

  function toggleFavorites(): void {
    setFavoritesOnly(current => {
      const nextValue = !current;

      if (nextValue) {
        setStatusFilter('ALL');
      }

      return nextValue;
    });
  }

  function resetFilters(): void {
    setDistance(null);
    setStatusFilter('ALL');
    setFavoritesOnly(false);
  }

  function openRestaurant(
    restaurant: MapRestaurantItem,
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

  function selectMarker(
    restaurant: MapRestaurantItem,
  ): void {
    setSelectedRestaurantId(
      restaurant.groupRestaurantId,
    );

    if (
      currentSheetTopRef.current
      > snapPoints.middle + 20
    ) {
      animateSheetTo(
        snapPoints.middle,
      );
    }
  }

  async function toggleFavorite(
    restaurant: MapRestaurantItem,
  ): Promise<void> {
    if (!accessToken || updatingRestaurantId) {
      return;
    }

    const nextStatus: GroupRestaurantStatus =
      restaurant.status === 'FAVORITE'
        ? 'VISITED'
        : 'FAVORITE';

    try {
      setUpdatingRestaurantId(
        restaurant.groupRestaurantId,
      );

      const response =
        await updateGroupRestaurantStatus(
          restaurant.groupId,
          restaurant.groupRestaurantId,
          { status: nextStatus },
          accessToken,
        );

      setRestaurants(current =>
        current.map(item =>
          item.groupRestaurantId
            === restaurant.groupRestaurantId
            ? {
                ...item,
                status: response.status,
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
      setUpdatingRestaurantId(null);
    }
  }

  const distanceLabel =
    distance === null
      ? 'Distancia'
      : `A ${distance} km`;

  const statusLabel =
    STATUS_OPTIONS.find(
      option => option.value === statusFilter,
    )?.label ?? 'Estado';

  const filtersActive =
    distance !== null
    || statusFilter !== 'ALL'
    || favoritesOnly;

  return (
    <SafeAreaView
      edges={['top', 'right', 'left']}
      style={styles.safeArea}
    >
      <View style={styles.header}>
        <Text style={styles.title}>
          Mapa
        </Text>

        <Pressable
          accessibilityLabel="Filtros"
          accessibilityRole="button"
          onPress={openFilterModal}
          style={({ pressed }) => [
            styles.filterIconButton,
            pressed
              ? styles.pressed
              : null,
          ]}
        >
          <SymbolView
            name={{
              ios: 'slider.horizontal.3',
              android: 'tune',
              web: 'tune',
            }}
            size={21}
            tintColor={colors.text}
          />

          {filtersActive ? (
            <View style={styles.filterDot} />
          ) : null}
        </Pressable>
      </View>

      <View style={styles.filtersBar}>
        <FilterChip
          active={distance !== null}
          chevron
          label={distanceLabel}
          onPress={openFilterModal}
        />

        <FilterChip
          active={statusFilter !== 'ALL'}
          chevron
          label={statusLabel}
          onPress={openFilterModal}
        />

        <FilterChip
          active={favoritesOnly}
          label="Favoritos"
          onPress={toggleFavorites}
        />
      </View>

      <View
        onLayout={handleMapLayout}
        style={styles.mapContainer}
      >
        <MapView
          customMapStyle={MAP_STYLE}
          initialRegion={DEFAULT_REGION}
          mapPadding={{
            top: 18,
            right: 14,
            bottom: 84,
            left: 14,
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
          showsUserLocation={locationGranted}
          style={StyleSheet.absoluteFill}
          toolbarEnabled={false}
        >
          {visibleRestaurants.map(
            restaurant => (
              <RestaurantMarker
                key={
                  restaurant.groupRestaurantId
                }
                onPress={() => {
                  selectMarker(restaurant);
                }}
                restaurant={restaurant}
                selected={
                  selectedRestaurantId
                  === restaurant.groupRestaurantId
                }
              />
            ),
          )}
        </MapView>

        <Animated.View
          style={[
            styles.bottomSheet,
            {
              top: sheetTop,
            },
          ]}
        >
          <View
            {...panResponder.panHandlers}
            style={styles.dragArea}
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
                  {visibleRestaurants.length === 1
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
                visibleRestaurants.length === 0
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
                        ios: 'mappin.slash',
                        android: 'location_off',
                        web: 'location_off',
                      }}
                      size={24}
                      tintColor={colors.primary}
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
                    onPress={resetFilters}
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
                    void toggleFavorite(item);
                  }}
                  onPress={() => {
                    openRestaurant(item);
                  }}
                  restaurant={item}
                  selected={
                    selectedRestaurantId
                    === item.groupRestaurantId
                  }
                  updating={
                    updatingRestaurantId
                    === item.groupRestaurantId
                  }
                />
              )}
              showsVerticalScrollIndicator={false}
              style={styles.list}
            />
          )}
        </Animated.View>
      </View>

      <Modal
        animationType="fade"
        onRequestClose={closeFilterModal}
        transparent
        visible={filterModalVisible}
      >
        <Pressable
          onPress={closeFilterModal}
          style={styles.modalOverlay}
        >
          <Animated.View
            style={[
              styles.modalContent,
              {
                paddingBottom:
                  Math.max(insets.bottom, 18) + 22,
                transform: [
                  {
                    translateY:
                      filterSheetTranslateY,
                  },
                ],
              },
            ]}
          >
            <Pressable
              onPress={event => {
                event.stopPropagation();
              }}
              style={styles.modalInner}
            >
              <View
                {...filterPanResponder.panHandlers}
                style={styles.modalDragArea}
              >
                <View style={styles.modalHandle} />

                <View style={styles.modalHeader}>
                  <View>
                    <Text style={styles.modalTitle}>
                      Filtrar mapa
                    </Text>

                    <Text style={styles.modalSubtitle}>
                      Arrastra para subir o bajar
                    </Text>
                  </View>

                  <Pressable
                    accessibilityRole="button"
                    onPress={resetFilters}
                    hitSlop={10}
                  >
                    <Text style={styles.modalReset}>
                      Restablecer
                    </Text>
                  </Pressable>
                </View>
              </View>

              <View style={styles.modalBody}>
                <View style={styles.modalSection}>
                  <Text style={styles.modalLabel}>
                    Distancia
                  </Text>

                  <View style={styles.modalOptions}>
                    {DISTANCE_OPTIONS.map(option => {
                      const selected =
                        option === distance;

                      return (
                        <Pressable
                          key={option ?? 'all-distance'}
                          accessibilityRole="button"
                          onPress={() => {
                            selectDistance(option);
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
                              ? 'Cualquier distancia'
                              : `A ${option} km`}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>

                <View style={styles.modalSection}>
                  <Text style={styles.modalLabel}>
                    Estado
                  </Text>

                  <View style={styles.modalOptions}>
                    {STATUS_OPTIONS.map(option => {
                      const selected =
                        option.value === statusFilter;

                      return (
                        <Pressable
                          key={option.value}
                          accessibilityRole="button"
                          onPress={() => {
                            selectStatus(option.value);
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
                </View>
              </View>

              <Pressable
                accessibilityRole="button"
                onPress={closeFilterModal}
                style={({ pressed }) => [
                  styles.applyButton,
                  pressed
                    ? styles.applyButtonPressed
                    : null,
                ]}
              >
                <Text style={styles.applyText}>
                  Ver {visibleRestaurants.length}
                  {' '}
                  {visibleRestaurants.length === 1
                    ? 'restaurante'
                    : 'restaurantes'}
                </Text>
              </Pressable>
            </Pressable>
          </Animated.View>
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
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
  },

  title: {
    color: colors.text,
    fontSize: 26,
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

  filtersBar: {
    height: 66,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 18,
    paddingTop: 4,
    paddingBottom: 12,
  },

  filterChip: {
    height: 44,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 24,
    backgroundColor: colors.surface,
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },

  filterChipActive: {
    borderColor: colors.primary,
    backgroundColor: '#FFF0EB',
  },

  filterText: {
    flexShrink: 1,
    color: colors.text,
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'center',
  },

  filterTextActive: {
    color: colors.primary,
  },

  mapContainer: {
    flex: 1,
    minHeight: 0,
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
    elevation: 14,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.12,
    shadowRadius: 10,
  },

  dragArea: {
    paddingTop: 10,
    backgroundColor: colors.surface,
  },

  handle: {
    width: 42,
    height: 4,
    alignSelf: 'center',
    marginBottom: 7,
    borderRadius: 2,
    backgroundColor: '#D8D0CB',
  },

  sheetHeader: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingBottom: 6,
  },

  sheetTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
  },

  sheetSubtitle: {
    marginTop: 3,
    color: colors.muted,
    fontSize: 11,
    fontWeight: '600',
  },

  resetText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '700',
  },

  list: {
    flex: 1,
  },

  restaurantList: {
    paddingHorizontal: 14,
    paddingBottom: 20,
  },

  restaurantRow: {
    minHeight: 76,
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
    width: 54,
    height: 54,
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
    fontSize: 15,
    fontWeight: '800',
  },

  restaurantInfo: {
    marginTop: 4,
    color: colors.muted,
    fontSize: 11,
  },

  restaurantEnd: {
    minWidth: 57,
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
      'rgba(43, 36, 33, 0.36)',
  },

  modalContent: {
    maxHeight: '82%',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    backgroundColor: colors.background,
    elevation: 16,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.12,
    shadowRadius: 12,
  },

  modalInner: {
    paddingHorizontal: 22,
    paddingTop: 10,
  },

  modalDragArea: {
    paddingBottom: 18,
  },

  modalHandle: {
    width: 48,
    height: 5,
    alignSelf: 'center',
    marginBottom: 20,
    borderRadius: 3,
    backgroundColor: '#D8D0CB',
  },

  modalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 16,
  },

  modalTitle: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.45,
  },

  modalSubtitle: {
    marginTop: 5,
    color: colors.muted,
    fontSize: 13,
    fontWeight: '600',
  },

  modalReset: {
    marginTop: 5,
    color: colors.primary,
    fontSize: 14,
    fontWeight: '800',
  },

  modalBody: {
    gap: 30,
  },

  modalSection: {
    gap: 13,
  },

  modalLabel: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '900',
  },

  modalOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },

  modalOption: {
    minHeight: 42,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 25,
    backgroundColor: colors.surface,
  },

  modalOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },

  modalOptionText: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '800',
  },

  modalOptionTextSelected: {
    color: colors.white,
  },

  applyButton: {
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 34,
    borderRadius: 20,
    backgroundColor: colors.primary,
  },

  applyButtonPressed: {
    backgroundColor: colors.primaryPressed,
  },

  applyText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '900',
  },

  pressed: {
    opacity: 0.68,
  },
});
