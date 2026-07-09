import * as Location from 'expo-location';
import { router, useFocusEffect } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import type { ComponentProps } from 'react';
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
  Animated,
  FlatList,
  Linking,
  Modal,
  PanResponder,
  Platform,
  Pressable,
  Text,
  TextInput,
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
import { styles } from './MapScreen.styles';

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

type SymbolName = ComponentProps<typeof SymbolView>['name'];

type FilterChipProps = {
  active?: boolean;
  chevron?: boolean;
  disabled?: boolean;
  icon: SymbolName;
  label: string;
  onPress: () => void;
};

type RestaurantRowProps = {
  onFavoritePress: () => void;
  onPress: () => void;
  restaurant: MapRestaurantItem;
  selected: boolean;
  updating: boolean;
};

const DEFAULT_REGION = {
  latitude: 41.9794,
  longitude: 2.8214,
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
  label: string;
  value: StatusFilter;
}> = [
  {
    label: 'Todos',
    value: 'ALL',
  },
  {
    label: 'Pendiente de ir',
    value: 'WANT_TO_GO',
  },
  {
    label: 'Visitado',
    value: 'VISITED',
  },
  {
    label: 'Queremos repetir',
    value: 'WANT_TO_REPEAT',
  },
  {
    label: 'No repetir',
    value: 'DO_NOT_REPEAT',
  },
  {
    label: 'Archivado',
    value: 'ARCHIVED',
  },
];

const STATUS_PRESENTATION: Record<
  GroupRestaurantStatus,
  {
    backgroundColor: string;
    label: string;
    markerColor: string;
    textColor: string;
  }
> = {
  WANT_TO_GO: {
    backgroundColor: '#FBE8E0',
    label: 'Pendiente',
    markerColor: '#D56A4A',
    textColor: '#B95135',
  },
  VISITED: {
    backgroundColor: '#F1E7D8',
    label: 'Visitado',
    markerColor: '#A47A46',
    textColor: '#805D34',
  },
  FAVORITE: {
    backgroundColor: '#E8EEDD',
    label: 'Favorito',
    markerColor: '#62794D',
    textColor: '#52673F',
  },
  WANT_TO_REPEAT: {
    backgroundColor: '#E8EEDD',
    label: 'Repetir',
    markerColor: '#62794D',
    textColor: '#52673F',
  },
  DO_NOT_REPEAT: {
    backgroundColor: '#F0ECE9',
    label: 'No repetir',
    markerColor: '#817B76',
    textColor: '#625D59',
  },
  ARCHIVED: {
    backgroundColor: '#F0ECE9',
    label: 'Archivado',
    markerColor: '#817B76',
    textColor: '#625D59',
  },
};

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
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#4E4743' }],
  },
  {
    featureType: 'poi',
    elementType: 'geometry',
    stylers: [{ color: '#ECE7D8' }],
  },
  {
    featureType: 'poi.business',
    stylers: [{ visibility: 'off' }],
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
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#F0E4D6' }],
  },
  {
    featureType: 'transit',
    stylers: [{ visibility: 'off' }],
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

function toRadians(degrees: number): number {
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
  const firstLatitude = toRadians(first.latitude);
  const secondLatitude = toRadians(second.latitude);
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

function normalizeSearch(value: string): string {
  return value
    .trim()
    .toLocaleLowerCase('es')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function FilterChip({
  active = false,
  chevron = false,
  disabled = false,
  icon,
  label,
  onPress,
}: FilterChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{
        disabled,
        selected: active,
      }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.filterChip,
        active ? styles.filterChipActive : null,
        disabled ? styles.filterChipDisabled : null,
        pressed && !disabled ? styles.pressed : null,
      ]}
    >
      <SymbolView
        name={icon}
        size={16}
        tintColor={
          active
            ? colors.primary
            : colors.muted
        }
      />

      <Text
        numberOfLines={1}
        style={[
          styles.filterText,
          active ? styles.filterTextActive : null,
        ]}
      >
        {label}
      </Text>

      {chevron ? (
        <SymbolView
          name={{
            android: 'keyboard_arrow_down',
            ios: 'chevron.down',
            web: 'keyboard_arrow_down',
          }}
          size={12}
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
  onPress,
  restaurant,
  selected,
}: {
  onPress: () => void;
  restaurant: MapRestaurantItem;
  selected: boolean;
}) {
  const presentation =
    STATUS_PRESENTATION[restaurant.status];

  return (
    <Marker
      coordinate={{
        latitude: restaurant.latitude,
        longitude: restaurant.longitude,
      }}
      onPress={onPress}
      zIndex={selected ? 2 : 1}
    >
      <View style={styles.markerWrapper}>
        {selected ? (
          <View style={styles.markerHalo} />
        ) : null}

        <View
          style={[
            styles.markerBubble,
            {
              backgroundColor:
                presentation.markerColor,
            },
            selected
              ? styles.markerBubbleSelected
              : null,
          ]}
        >
          <SymbolView
            name={{
              android: 'restaurant',
              ios: 'fork.knife',
              web: 'restaurant',
            }}
            size={selected ? 19 : 16}
            tintColor={colors.white}
          />
        </View>

        <View
          style={[
            styles.markerPoint,
            {
              borderTopColor:
                presentation.markerColor,
            },
          ]}
        />
      </View>
    </Marker>
  );
}

function RestaurantRow({
  onFavoritePress,
  onPress,
  restaurant,
  selected,
  updating,
}: RestaurantRowProps) {
  const favorite =
    restaurant.status === 'FAVORITE';
  const presentation =
    STATUS_PRESENTATION[restaurant.status];

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.restaurantRow,
        selected
          ? styles.restaurantRowSelected
          : null,
        pressed ? styles.pressed : null,
      ]}
    >
      <View
        style={[
          styles.restaurantThumbnail,
          {
            backgroundColor:
              presentation.backgroundColor,
          },
        ]}
      >
        <SymbolView
          name={{
            android: 'restaurant',
            ios: 'fork.knife',
            web: 'restaurant',
          }}
          size={21}
          tintColor={presentation.markerColor}
        />
      </View>

      <View style={styles.restaurantCopy}>
        <Text
          numberOfLines={1}
          style={styles.restaurantName}
        >
          {restaurant.name}
        </Text>

        <Text
          numberOfLines={1}
          style={styles.restaurantMeta}
        >
          {restaurant.category ?? 'Restaurante'}
          {' · '}
          {restaurant.groupName}
        </Text>

        <View style={styles.restaurantFooter}>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor:
                  presentation.backgroundColor,
              },
            ]}
          >
            <Text
              style={[
                styles.statusBadgeText,
                {
                  color: presentation.textColor,
                },
              ]}
            >
              {presentation.label}
            </Text>
          </View>

          {restaurant.distanceKm !== null ? (
            <Text style={styles.restaurantDistance}>
              {formatDistance(restaurant.distanceKm)}
            </Text>
          ) : null}
        </View>
      </View>

      <Pressable
        accessibilityLabel={
          favorite
            ? 'Quitar de favoritos'
            : 'Añadir a favoritos'
        }
        accessibilityRole="button"
        disabled={updating}
        hitSlop={8}
        onPress={event => {
          event.stopPropagation();
          onFavoritePress();
        }}
        style={({ pressed }) => [
          styles.rowFavoriteButton,
          pressed
            ? styles.rowFavoriteButtonPressed
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
              android: favorite
                ? 'favorite'
                : 'favorite_border',
              ios: favorite
                ? 'heart.fill'
                : 'heart',
              web: favorite
                ? 'favorite'
                : 'favorite_border',
            }}
            size={21}
            tintColor={
              favorite
                ? colors.primary
                : colors.muted
            }
          />
        )}
      </Pressable>
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
  const currentSheetTopRef = useRef(0);
  const panStartTopRef = useRef(0);
  const sheetWasPositionedRef = useRef(false);

  const [restaurants, setRestaurants] =
    useState<MapRestaurant[]>([]);
  const [userLocation, setUserLocation] =
    useState<Coordinates | null>(null);
  const [locationGranted, setLocationGranted] =
    useState(false);
  const [selectedRestaurantId,
    setSelectedRestaurantId] =
    useState<string | null>(null);
  const [searchQuery, setSearchQuery] =
    useState('');
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
        collapsed: 0,
        expanded: 0,
        middle: 0,
      };
    }

    const expanded = 14;
    const middle = Math.round(mapHeight * 0.5);
    const collapsedHeight = selectedRestaurantId
      ? 194
      : 112;
    const collapsed = Math.max(
      middle + 70,
      mapHeight - collapsedHeight,
    );

    return {
      collapsed,
      expanded,
      middle,
    };
  }, [mapHeight, selectedRestaurantId]);

  const animateSheetTo = useCallback(
    (value: number) => {
      Animated.spring(sheetTop, {
        damping: 25,
        mass: 0.82,
        stiffness: 220,
        toValue: value,
        useNativeDriver: false,
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
        (nearest, point) => (
          Math.abs(point - value)
            < Math.abs(nearest - value)
            ? point
            : nearest
        ),
        points[0],
      );
    },
    [snapPoints],
  );

  const panResponder = useMemo(() => (
    PanResponder.create({
      onMoveShouldSetPanResponder: (
        _,
        gestureState,
      ) => Math.abs(gestureState.dy) > 4,
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
          animateSheetTo(
            currentTop < snapPoints.middle
              ? snapPoints.middle
              : snapPoints.collapsed,
          );
          return;
        }

        if (gestureState.vy < -0.75) {
          animateSheetTo(
            currentTop > snapPoints.middle
              ? snapPoints.middle
              : snapPoints.expanded,
          );
          return;
        }

        animateSheetTo(
          nearestSnapPoint(currentTop),
        );
      },
      onStartShouldSetPanResponder: () => true,
    })
  ), [
    animateSheetTo,
    nearestSnapPoint,
    sheetTop,
    snapPoints,
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
    if (mapHeight <= 0) {
      return;
    }

    if (!sheetWasPositionedRef.current) {
      sheetTop.setValue(snapPoints.collapsed);
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

  useEffect(() => {
    if (
      mapHeight <= 0
      || !sheetWasPositionedRef.current
    ) {
      return;
    }

    animateSheetTo(snapPoints.collapsed);
  }, [
    animateSheetTo,
    mapHeight,
    selectedRestaurantId,
    snapPoints.collapsed,
  ]);

  const requestCurrentLocation = useCallback(
    async (): Promise<Coordinates | null> => {
      try {
        const permission = await Location
          .requestForegroundPermissionsAsync();
        const granted =
          permission.status === 'granted';

        setLocationGranted(granted);

        if (!granted) {
          return null;
        }

        const location = await Location
          .getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });

        return {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        };
      } catch {
        setLocationGranted(false);
        return null;
      }
    },
    [],
  );

  const restaurantsWithDistance =
    useMemo<MapRestaurantItem[]>(() => (
      restaurants.map(restaurant => ({
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
      }))
    ), [restaurants, userLocation]);

  const visibleRestaurants = useMemo(() => {
    const normalizedQuery =
      normalizeSearch(searchQuery);

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

        if (normalizedQuery) {
          const searchableText = normalizeSearch([
            restaurant.name,
            restaurant.category,
            restaurant.address,
            restaurant.city,
            restaurant.country,
            restaurant.groupName,
          ]
            .filter(Boolean)
            .join(' '));

          if (!searchableText.includes(normalizedQuery)) {
            return false;
          }
        }

        return true;
      })
      .sort((first, second) => {
        if (
          first.distanceKm !== null
          && second.distanceKm !== null
        ) {
          return first.distanceKm
            - second.distanceKm;
        }

        return first.name.localeCompare(
          second.name,
          'es',
        );
      });
  }, [
    distance,
    favoritesOnly,
    restaurantsWithDistance,
    searchQuery,
    statusFilter,
    userLocation,
  ]);

  const selectedRestaurant = useMemo(() => (
    visibleRestaurants.find(
      restaurant =>
        restaurant.groupRestaurantId
        === selectedRestaurantId,
    ) ?? null
  ), [selectedRestaurantId, visibleRestaurants]);

  useEffect(() => {
    if (
      selectedRestaurantId
      && !selectedRestaurant
    ) {
      setSelectedRestaurantId(null);
    }
  }, [selectedRestaurant, selectedRestaurantId]);

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
        const locationPromise =
          requestCurrentLocation();
        const [response, currentLocation] =
          await Promise.all([
            restaurantsPromise,
            locationPromise,
          ]);

        setRestaurants(response);
        setUserLocation(currentLocation);
      } catch (error) {
        setErrorMessage(getErrorMessage(error));
      } finally {
        setIsLoading(false);
      }
    }, [accessToken, requestCurrentLocation]);

  useFocusEffect(
    useCallback(() => {
      void loadMap();
    }, [loadMap]),
  );

  useEffect(() => {
    if (
      !isMapReady
      || selectedRestaurantId
    ) {
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

    const timeoutId = setTimeout(() => {
      if (coordinates.length === 1) {
        mapRef.current?.animateToRegion(
          {
            ...coordinates[0],
            latitudeDelta: 0.035,
            longitudeDelta: 0.035,
          },
          380,
        );
        return;
      }

      mapRef.current?.fitToCoordinates(
        coordinates,
        {
          animated: true,
          edgePadding: {
            bottom: 150,
            left: 45,
            right: 45,
            top: 55,
          },
        },
      );
    }, 220);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [
    isMapReady,
    selectedRestaurantId,
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

  function closeFilterModal(): void {
    setFilterModalVisible(false);
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
    setFavoritesOnly(false);
    setSearchQuery('');
    setStatusFilter('ALL');
  }

  function openRestaurant(
    restaurant: MapRestaurantItem,
  ): void {
    router.push({
      params: {
        groupId: restaurant.groupId,
        groupRestaurantId:
          restaurant.groupRestaurantId,
      },
      pathname:
        '/groups/[groupId]/restaurants/[groupRestaurantId]',
    });
  }

  function focusRestaurant(
    restaurant: MapRestaurantItem,
  ): void {
    setSelectedRestaurantId(
      restaurant.groupRestaurantId,
    );

    mapRef.current?.animateToRegion(
      {
        latitude: restaurant.latitude,
        latitudeDelta: 0.025,
        longitude: restaurant.longitude,
        longitudeDelta: 0.025,
      },
      360,
    );
  }

  function clearRestaurantSelection(): void {
    setSelectedRestaurantId(null);
  }

  async function centerOnUser(): Promise<void> {
    const location = userLocation
      ?? await requestCurrentLocation();

    if (!location) {
      Alert.alert(
        'Ubicación no disponible',
        'Activa el permiso de ubicación para centrar el mapa y calcular distancias.',
      );
      return;
    }

    setUserLocation(location);
    mapRef.current?.animateToRegion(
      {
        ...location,
        latitudeDelta: 0.025,
        longitudeDelta: 0.025,
      },
      380,
    );
  }

  async function openDirections(
    restaurant: MapRestaurantItem,
  ): Promise<void> {
    const destination =
      `${restaurant.latitude},${restaurant.longitude}`;
    const fallbackUrl =
      `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
    const nativeUrl = Platform.select({
      android: `google.navigation:q=${destination}`,
      ios: `http://maps.apple.com/?daddr=${destination}`,
    });

    try {
      if (
        nativeUrl
        && await Linking.canOpenURL(nativeUrl)
      ) {
        await Linking.openURL(nativeUrl);
        return;
      }

      await Linking.openURL(fallbackUrl);
    } catch {
      Alert.alert(
        'No se ha podido abrir el mapa',
        'Prueba de nuevo dentro de unos segundos.',
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
  const mapLocationButtonBottom =
    selectedRestaurant ? 210 : 126;

  return (
    <SafeAreaView
      edges={['top', 'right', 'left']}
      style={styles.safeArea}
    >
      <View style={styles.topPanel}>
        <View style={styles.headingRow}>
          <View style={styles.headingCopy}>
            <Text style={styles.title}>
              Mapa
            </Text>
            <Text style={styles.subtitle}>
              Encuentra tus restaurantes guardados
            </Text>
          </View>

          <Pressable
            accessibilityLabel="Abrir filtros"
            accessibilityRole="button"
            onPress={openFilterModal}
            style={({ pressed }) => [
              styles.filterButton,
              pressed ? styles.pressed : null,
            ]}
          >
            <SymbolView
              name={{
                android: 'tune',
                ios: 'slider.horizontal.3',
                web: 'tune',
              }}
              size={21}
              tintColor={colors.primary}
            />

            {filtersActive ? (
              <View style={styles.filterDot} />
            ) : null}
          </Pressable>
        </View>

        <View style={styles.searchBar}>
          <SymbolView
            name={{
              android: 'search',
              ios: 'magnifyingglass',
              web: 'search',
            }}
            size={20}
            tintColor={colors.muted}
          />

          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            onChangeText={setSearchQuery}
            placeholder="Buscar restaurante o zona"
            placeholderTextColor="#9B918B"
            returnKeyType="search"
            style={styles.searchInput}
            value={searchQuery}
          />

          {searchQuery ? (
            <Pressable
              accessibilityLabel="Borrar búsqueda"
              accessibilityRole="button"
              hitSlop={8}
              onPress={() => setSearchQuery('')}
            >
              <SymbolView
                name={{
                  android: 'cancel',
                  ios: 'xmark.circle.fill',
                  web: 'cancel',
                }}
                size={19}
                tintColor="#B5AAA4"
              />
            </Pressable>
          ) : null}
        </View>

        <View style={styles.filtersRow}>
          <FilterChip
            active={distance !== null}
            chevron
            disabled={!locationGranted}
            icon={{
              android: 'near_me',
              ios: 'location',
              web: 'near_me',
            }}
            label={
              locationGranted
                ? distanceLabel
                : 'Sin ubicación'
            }
            onPress={openFilterModal}
          />

          <FilterChip
            active={statusFilter !== 'ALL'}
            chevron
            icon={{
              android: 'check_circle_outline',
              ios: 'checkmark.circle',
              web: 'check_circle_outline',
            }}
            label={statusLabel}
            onPress={openFilterModal}
          />

          <FilterChip
            active={favoritesOnly}
            icon={{
              android: favoritesOnly
                ? 'favorite'
                : 'favorite_border',
              ios: favoritesOnly
                ? 'heart.fill'
                : 'heart',
              web: favoritesOnly
                ? 'favorite'
                : 'favorite_border',
            }}
            label="Favoritos"
            onPress={toggleFavorites}
          />
        </View>
      </View>

      <View
        onLayout={handleMapLayout}
        style={styles.mapContainer}
      >
        <MapView
          customMapStyle={MAP_STYLE}
          initialRegion={DEFAULT_REGION}
          mapPadding={{
            bottom: 125,
            left: 18,
            right: 18,
            top: 28,
          }}
          onMapReady={() => {
            setIsMapReady(true);
          }}
          onPress={clearRestaurantSelection}
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
          style={styles.map}
          toolbarEnabled={false}
        >
          {visibleRestaurants.map(
            restaurant => (
              <RestaurantMarker
                key={restaurant.groupRestaurantId}
                onPress={() => {
                  focusRestaurant(restaurant);
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

        {!isLoading && !errorMessage ? (
          <View style={styles.mapResultBadge}>
            <SymbolView
              name={{
                android: 'restaurant',
                ios: 'fork.knife',
                web: 'restaurant',
              }}
              size={13}
              tintColor={colors.primary}
            />
            <Text style={styles.mapResultText}>
              {visibleRestaurants.length}
              {' '}
              {visibleRestaurants.length === 1
                ? 'restaurante'
                : 'restaurantes'}
            </Text>
          </View>
        ) : null}

        <Pressable
          accessibilityLabel="Centrar en mi ubicación"
          accessibilityRole="button"
          onPress={() => {
            void centerOnUser();
          }}
          style={({ pressed }) => [
            styles.locationButton,
            {
              bottom: mapLocationButtonBottom,
            },
            pressed ? styles.pressed : null,
          ]}
        >
          <SymbolView
            name={{
              android: 'my_location',
              ios: 'location.fill',
              web: 'my_location',
            }}
            size={21}
            tintColor={colors.primary}
          />
        </Pressable>

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

            {selectedRestaurant ? (
              <View style={styles.selectedSummary}>
                <View style={styles.selectedTopRow}>
                  <View
                    style={[
                      styles.selectedThumbnail,
                      {
                        backgroundColor:
                          STATUS_PRESENTATION[
                            selectedRestaurant.status
                          ].backgroundColor,
                      },
                    ]}
                  >
                    <SymbolView
                      name={{
                        android: 'restaurant',
                        ios: 'fork.knife',
                        web: 'restaurant',
                      }}
                      size={25}
                      tintColor={
                        STATUS_PRESENTATION[
                          selectedRestaurant.status
                        ].markerColor
                      }
                    />
                  </View>

                  <View style={styles.selectedCopy}>
                    <View style={styles.selectedNameRow}>
                      <Text
                        numberOfLines={1}
                        style={styles.selectedName}
                      >
                        {selectedRestaurant.name}
                      </Text>

                      <Pressable
                        accessibilityLabel="Cerrar restaurante seleccionado"
                        accessibilityRole="button"
                        hitSlop={8}
                        onPress={clearRestaurantSelection}
                        style={styles.clearSelectionButton}
                      >
                        <SymbolView
                          name={{
                            android: 'close',
                            ios: 'xmark',
                            web: 'close',
                          }}
                          size={15}
                          tintColor={colors.muted}
                        />
                      </Pressable>
                    </View>

                    <Text
                      numberOfLines={1}
                      style={styles.selectedMeta}
                    >
                      {selectedRestaurant.category
                        ?? 'Restaurante'}
                      {' · '}
                      {selectedRestaurant.groupName}
                    </Text>

                    <View style={styles.selectedContextRow}>
                      <View
                        style={[
                          styles.statusBadge,
                          {
                            backgroundColor:
                              STATUS_PRESENTATION[
                                selectedRestaurant.status
                              ].backgroundColor,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusBadgeText,
                            {
                              color:
                                STATUS_PRESENTATION[
                                  selectedRestaurant.status
                                ].textColor,
                            },
                          ]}
                        >
                          {
                            STATUS_PRESENTATION[
                              selectedRestaurant.status
                            ].label
                          }
                        </Text>
                      </View>

                      {selectedRestaurant.distanceKm !== null ? (
                        <Text style={styles.selectedDistance}>
                          {formatDistance(
                            selectedRestaurant.distanceKm,
                          )}
                        </Text>
                      ) : null}
                    </View>
                  </View>
                </View>

                <View style={styles.selectedActions}>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => {
                      openRestaurant(selectedRestaurant);
                    }}
                    style={({ pressed }) => [
                      styles.detailButton,
                      pressed
                        ? styles.detailButtonPressed
                        : null,
                    ]}
                  >
                    <Text style={styles.detailButtonText}>
                      Ver detalle
                    </Text>
                  </Pressable>

                  <Pressable
                    accessibilityLabel="Abrir indicaciones"
                    accessibilityRole="button"
                    onPress={() => {
                      void openDirections(selectedRestaurant);
                    }}
                    style={({ pressed }) => [
                      styles.secondaryActionButton,
                      pressed ? styles.pressed : null,
                    ]}
                  >
                    <SymbolView
                      name={{
                        android: 'navigation',
                        ios: 'location.north.line',
                        web: 'navigation',
                      }}
                      size={19}
                      tintColor={colors.primary}
                    />
                  </Pressable>

                  <Pressable
                    accessibilityLabel={
                      selectedRestaurant.status === 'FAVORITE'
                        ? 'Quitar de favoritos'
                        : 'Añadir a favoritos'
                    }
                    accessibilityRole="button"
                    disabled={
                      updatingRestaurantId
                      === selectedRestaurant.groupRestaurantId
                    }
                    onPress={() => {
                      void toggleFavorite(selectedRestaurant);
                    }}
                    style={({ pressed }) => [
                      styles.secondaryActionButton,
                      pressed ? styles.pressed : null,
                    ]}
                  >
                    {updatingRestaurantId
                    === selectedRestaurant.groupRestaurantId ? (
                      <ActivityIndicator
                        color={colors.primary}
                        size="small"
                      />
                    ) : (
                      <SymbolView
                        name={{
                          android:
                            selectedRestaurant.status
                            === 'FAVORITE'
                              ? 'favorite'
                              : 'favorite_border',
                          ios:
                            selectedRestaurant.status
                            === 'FAVORITE'
                              ? 'heart.fill'
                              : 'heart',
                          web:
                            selectedRestaurant.status
                            === 'FAVORITE'
                              ? 'favorite'
                              : 'favorite_border',
                        }}
                        size={20}
                        tintColor={colors.primary}
                      />
                    )}
                  </Pressable>
                </View>
              </View>
            ) : (
              <View style={styles.sheetHeader}>
                <View style={styles.sheetHeadingCopy}>
                  <Text style={styles.sheetTitle}>
                    {userLocation
                      ? 'Cerca de ti'
                      : 'Tus restaurantes'}
                  </Text>
                  <Text style={styles.sheetSubtitle}>
                    {visibleRestaurants.length}
                    {' '}
                    {visibleRestaurants.length === 1
                      ? 'restaurante guardado'
                      : 'restaurantes guardados'}
                  </Text>
                  {!locationGranted ? (
                    <Text style={styles.locationHint}>
                      Activa la ubicación para ordenarlos por cercanía
                    </Text>
                  ) : (
                    <Text style={styles.sheetHint}>
                      Desliza hacia arriba para ver la lista
                    </Text>
                  )}
                </View>

                {filtersActive || searchQuery ? (
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
            )}
          </View>

          {isLoading ? (
            <View style={styles.state}>
              <ActivityIndicator
                color={colors.primary}
                size="large"
              />
              <Text style={styles.stateText}>
                Cargando tus restaurantes...
              </Text>
            </View>
          ) : errorMessage ? (
            <View style={styles.state}>
              <View style={styles.stateIcon}>
                <SymbolView
                  name={{
                    android: 'wifi_off',
                    ios: 'wifi.slash',
                    web: 'wifi_off',
                  }}
                  size={22}
                  tintColor={colors.primary}
                />
              </View>
              <Text style={styles.stateTitle}>
                No hemos podido cargar el mapa
              </Text>
              <Text style={styles.stateText}>
                {errorMessage}
              </Text>
              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  void loadMap();
                }}
                style={styles.retryButton}
              >
                <Text style={styles.retryButtonText}>
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
              ListEmptyComponent={(
                <View style={styles.state}>
                  <View style={styles.stateIcon}>
                    <SymbolView
                      name={{
                        android: 'location_off',
                        ios: 'mappin.slash',
                        web: 'location_off',
                      }}
                      size={22}
                      tintColor={colors.primary}
                    />
                  </View>
                  <Text style={styles.stateTitle}>
                    No hay restaurantes aquí
                  </Text>
                  <Text style={styles.stateText}>
                    Prueba con otra búsqueda o cambia los filtros.
                  </Text>
                  <Pressable
                    accessibilityRole="button"
                    onPress={resetFilters}
                    style={styles.retryButton}
                  >
                    <Text style={styles.retryButtonText}>
                      Ver todos
                    </Text>
                  </Pressable>
                </View>
              )}
              renderItem={({ item }) => (
                <RestaurantRow
                  onFavoritePress={() => {
                    void toggleFavorite(item);
                  }}
                  onPress={() => {
                    focusRestaurant(item);
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
        animationType="slide"
        onRequestClose={closeFilterModal}
        transparent
        visible={filterModalVisible}
      >
        <Pressable
          onPress={closeFilterModal}
          style={styles.modalOverlay}
        >
          <Pressable
            onPress={event => {
              event.stopPropagation();
            }}
            style={[
              styles.modalContent,
              {
                paddingBottom:
                  Math.max(insets.bottom, 18) + 18,
              },
            ]}
          >
            <View style={styles.modalHandle} />

            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>
                  Filtrar mapa
                </Text>
                <Text style={styles.modalSubtitle}>
                  Ajusta los resultados que quieres ver
                </Text>
              </View>

              <Pressable
                accessibilityLabel="Cerrar filtros"
                accessibilityRole="button"
                hitSlop={8}
                onPress={closeFilterModal}
                style={styles.modalCloseButton}
              >
                <SymbolView
                  name={{
                    android: 'close',
                    ios: 'xmark',
                    web: 'close',
                  }}
                  size={17}
                  tintColor={colors.text}
                />
              </Pressable>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.modalSection}>
                <Text style={styles.modalLabel}>
                  Distancia
                </Text>

                {!locationGranted ? (
                  <View style={styles.locationWarning}>
                    <SymbolView
                      name={{
                        android: 'location_off',
                        ios: 'location.slash',
                        web: 'location_off',
                      }}
                      size={18}
                      tintColor={colors.primary}
                    />
                    <Text style={styles.locationWarningText}>
                      Activa tu ubicación para usar este filtro.
                    </Text>
                  </View>
                ) : (
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
                )}
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

            <View style={styles.modalFooter}>
              <Pressable
                accessibilityRole="button"
                onPress={resetFilters}
                style={({ pressed }) => [
                  styles.modalResetButton,
                  pressed ? styles.pressed : null,
                ]}
              >
                <Text style={styles.modalResetText}>
                  Restablecer
                </Text>
              </Pressable>

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
                <Text style={styles.applyButtonText}>
                  Ver {visibleRestaurants.length}
                  {' '}
                  {visibleRestaurants.length === 1
                    ? 'restaurante'
                    : 'restaurantes'}
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}
