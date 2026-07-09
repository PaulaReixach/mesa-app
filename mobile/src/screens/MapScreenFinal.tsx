import { MaterialIcons } from '@expo/vector-icons';
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
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { LayoutChangeEvent } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import { useAuth } from '../contexts/auth-context';
import { getErrorMessage } from '../lib/api';
import { getMapRestaurants } from '../services/map-service';
import { updateGroupRestaurantFavorite } from '../services/restaurant-service';
import { styles } from '../styles/map-screen.styles';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import type { MapRestaurant } from '../types/map';
import type { GroupRestaurantStatus } from '../types/restaurant';

type Coordinates = {
  latitude: number;
  longitude: number;
};

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

type Membership = Pick<
  MapRestaurant,
  'groupId' | 'groupName' | 'groupRestaurantId' | 'status'
>;

type SymbolName = ComponentProps<typeof SymbolView>['name'];

type Presentation = {
  backgroundColor: string;
  label: string;
  markerColor: string;
  textColor: string;
};

const DEFAULT_REGION = {
  latitude: 41.9794,
  longitude: 2.8214,
  latitudeDelta: 0.08,
  longitudeDelta: 0.08,
};

const USER_DELTA = 0.035;
const RESTAURANT_DELTA = 0.022;

const STATUS_OPTIONS: Array<{ label: string; value: StatusFilter }> = [
  { label: 'Todos los estados', value: 'ALL' },
  { label: 'Pendiente de ir', value: 'WANT_TO_GO' },
  { label: 'Visitado', value: 'VISITED' },
  { label: 'Queremos repetir', value: 'WANT_TO_REPEAT' },
  { label: 'No repetir', value: 'DO_NOT_REPEAT' },
  { label: 'Archivado', value: 'ARCHIVED' },
];

const STATUS_PRESENTATION: Record<GroupRestaurantStatus, Presentation> = {
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

const FAVORITE_PRESENTATION: Presentation = {
  backgroundColor: '#E8EEDD',
  label: 'Favorito',
  markerColor: '#62794D',
  textColor: '#52673F',
};

const MAP_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#F5EFE6' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#746A65' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#FFF8F3' }] },
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
  { featureType: 'poi.business', stylers: [{ visibility: 'off' }] },
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
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#BBDCE4' }],
  },
];

function getPresentation(restaurant: MapRestaurant): Presentation {
  return restaurant.favorite
    ? FAVORITE_PRESENTATION
    : STATUS_PRESENTATION[restaurant.status];
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(Math.max(value, minimum), maximum);
}

function toRadians(degrees: number): number {
  return degrees * Math.PI / 180;
}

function calculateDistanceKm(first: Coordinates, second: Coordinates): number {
  const earthRadiusKm = 6371;
  const latitudeDifference = toRadians(second.latitude - first.latitude);
  const longitudeDifference = toRadians(second.longitude - first.longitude);
  const firstLatitude = toRadians(first.latitude);
  const secondLatitude = toRadians(second.latitude);
  const value =
    Math.sin(latitudeDifference / 2) ** 2
    + Math.cos(firstLatitude)
    * Math.cos(secondLatitude)
    * Math.sin(longitudeDifference / 2) ** 2;

  return earthRadiusKm
    * 2
    * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
}

function formatDistance(distanceKm: number | null): string {
  if (distanceKm === null) {
    return '';
  }

  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }

  return `${distanceKm.toFixed(1).replace('.', ',')} km`;
}

function normalizeSearch(value: string): string {
  return value
    .trim()
    .toLocaleLowerCase('es')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function QuickFilter({
  active,
  dropdown = false,
  icon,
  label,
  onPress,
}: {
  active: boolean;
  dropdown?: boolean;
  icon: SymbolName;
  label: string;
  onPress: () => void;
}) {
  const tintColor = active ? colors.white : colors.muted;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.quickChip,
        active ? styles.quickChipActive : null,
        pressed ? styles.pressed : null,
      ]}
    >
      <SymbolView
        name={icon}
        size={14}
        tintColor={tintColor}
      />
      <Text
        maxFontSizeMultiplier={1.15}
        numberOfLines={1}
        style={[
          styles.quickChipText,
          active ? styles.quickChipTextActive : null,
        ]}
      >
        {label}
      </Text>
      {dropdown ? (
        <SymbolView
          name={{
            android: 'keyboard_arrow_down',
            ios: 'chevron.down',
            web: 'keyboard_arrow_down',
          }}
          size={12}
          tintColor={tintColor}
        />
      ) : null}
    </Pressable>
  );
}

function FavoriteIcon({ favorite }: { favorite: boolean }) {
  return (
    <MaterialIcons
      color={favorite ? colors.primary : colors.muted}
      name={favorite ? 'favorite' : 'favorite-border'}
      size={22}
    />
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
  const presentation = getPresentation(restaurant);

  return (
    <Marker
      coordinate={{
        latitude: restaurant.latitude,
        longitude: restaurant.longitude,
      }}
      onPress={onPress}
      tracksViewChanges
      zIndex={selected ? 2 : 1}
    >
      <View style={styles.marker}>
        <View
          style={[
            styles.markerBubble,
            { backgroundColor: presentation.markerColor },
            selected ? styles.markerBubbleSelected : null,
          ]}
        >
          <SymbolView
            name={{
              android: 'restaurant',
              ios: 'fork.knife',
              web: 'restaurant',
            }}
            size={selected ? 18 : 15}
            tintColor={colors.white}
          />
        </View>
        <View
          style={[
            styles.markerPoint,
            { borderTopColor: presentation.markerColor },
          ]}
        />
      </View>
    </Marker>
  );
}

function RestaurantRow({
  groupCount,
  onFavoritePress,
  onPress,
  restaurant,
  selected,
  updating,
}: {
  groupCount: number;
  onFavoritePress: () => void;
  onPress: () => void;
  restaurant: MapRestaurantItem;
  selected: boolean;
  updating: boolean;
}) {
  const presentation = getPresentation(restaurant);
  const groupContext = groupCount > 1
    ? `${groupCount} grupos`
    : restaurant.groupName;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.restaurantRow,
        selected ? styles.restaurantRowSelected : null,
        pressed ? styles.pressed : null,
      ]}
    >
      <View
        style={[
          styles.rowIcon,
          { backgroundColor: presentation.backgroundColor },
        ]}
      >
        <SymbolView
          name={{ android: 'restaurant', ios: 'fork.knife', web: 'restaurant' }}
          size={18}
          tintColor={presentation.markerColor}
        />
      </View>

      <View style={styles.rowCopy}>
        <Text
          maxFontSizeMultiplier={1.2}
          numberOfLines={1}
          style={styles.rowName}
        >
          {restaurant.name}
        </Text>
        <Text
          maxFontSizeMultiplier={1.2}
          numberOfLines={1}
          style={styles.rowMeta}
        >
          {restaurant.category ?? 'Restaurante'} · {groupContext}
        </Text>
        <View style={styles.rowFooter}>
          <View
            style={[
              styles.statusPill,
              { backgroundColor: presentation.backgroundColor },
            ]}
          >
            <Text
              maxFontSizeMultiplier={1.15}
              style={[
                styles.statusPillText,
                { color: presentation.textColor },
              ]}
            >
              {presentation.label}
            </Text>
          </View>
          {restaurant.distanceKm !== null ? (
            <Text
              maxFontSizeMultiplier={1.15}
              style={styles.rowDistance}
            >
              {formatDistance(restaurant.distanceKm)}
            </Text>
          ) : null}
        </View>
      </View>

      <Pressable
        accessibilityLabel={restaurant.favorite
          ? 'Quitar de favoritos'
          : 'Añadir a favoritos'}
        accessibilityRole="button"
        disabled={updating}
        hitSlop={8}
        onPress={event => {
          event.stopPropagation();
          onFavoritePress();
        }}
        style={({ pressed }) => [
          styles.favoriteButton,
          pressed ? styles.pressed : null,
        ]}
      >
        {updating ? (
          <ActivityIndicator color={colors.primary} size="small" />
        ) : (
          <FavoriteIcon favorite={restaurant.favorite} />
        )}
      </Pressable>
    </Pressable>
  );
}

export default function MapScreenFinal() {
  const { accessToken } = useAuth();
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView | null>(null);
  const sheetTop = useRef(new Animated.Value(1000)).current;
  const currentSheetTopRef = useRef(1000);
  const panStartTopRef = useRef(1000);
  const sheetWasPositionedRef = useRef(false);
  const hasPositionedInitialCameraRef = useRef(false);

  const [restaurants, setRestaurants] = useState<MapRestaurant[]>([]);
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [locationGranted, setLocationGranted] = useState(false);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [groupsModalVisible, setGroupsModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isMapReady, setIsMapReady] = useState(false);
  const [updatingRestaurantId, setUpdatingRestaurantId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [mapHeight, setMapHeight] = useState(0);

  const snapPoints = useMemo(() => {
    if (mapHeight <= 0) {
      return { collapsed: 1000, expanded: 1000, middle: 1000 };
    }

    const expanded = 12;
    const middle = Math.round(mapHeight * 0.44);
    const collapsedHeight = selectedRestaurantId ? 210 : 94;

    return {
      collapsed: Math.max(middle + 64, mapHeight - collapsedHeight),
      expanded,
      middle,
    };
  }, [mapHeight, selectedRestaurantId]);

  const animateSheetTo = useCallback((value: number) => {
    Animated.spring(sheetTop, {
      damping: 26,
      mass: 0.82,
      stiffness: 230,
      toValue: value,
      useNativeDriver: false,
    }).start();
  }, [sheetTop]);

  const nearestSnapPoint = useCallback((value: number): number => {
    const points = [snapPoints.expanded, snapPoints.middle, snapPoints.collapsed];

    return points.reduce(
      (nearest, point) => (
        Math.abs(point - value) < Math.abs(nearest - value)
          ? point
          : nearest
      ),
      points[0],
    );
  }, [snapPoints]);

  const panResponder = useMemo(() => PanResponder.create({
    onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dy) > 4,
    onPanResponderGrant: () => {
      panStartTopRef.current = currentSheetTopRef.current;
    },
    onPanResponderMove: (_, gestureState) => {
      sheetTop.setValue(clamp(
        panStartTopRef.current + gestureState.dy,
        snapPoints.expanded,
        snapPoints.collapsed,
      ));
    },
    onPanResponderRelease: (_, gestureState) => {
      const currentTop = currentSheetTopRef.current;

      if (gestureState.vy > 0.7) {
        animateSheetTo(currentTop < snapPoints.middle
          ? snapPoints.middle
          : snapPoints.collapsed);
        return;
      }

      if (gestureState.vy < -0.7) {
        animateSheetTo(currentTop > snapPoints.middle
          ? snapPoints.middle
          : snapPoints.expanded);
        return;
      }

      animateSheetTo(nearestSnapPoint(currentTop));
    },
    onStartShouldSetPanResponder: () => true,
  }), [animateSheetTo, nearestSnapPoint, sheetTop, snapPoints]);

  useEffect(() => {
    const listenerId = sheetTop.addListener(({ value }) => {
      currentSheetTopRef.current = value;
    });

    return () => sheetTop.removeListener(listenerId);
  }, [sheetTop]);

  useEffect(() => {
    if (mapHeight <= 0) {
      return;
    }

    if (!sheetWasPositionedRef.current) {
      sheetTop.setValue(snapPoints.collapsed);
      currentSheetTopRef.current = snapPoints.collapsed;
      sheetWasPositionedRef.current = true;
      return;
    }

    sheetTop.setValue(clamp(
      currentSheetTopRef.current,
      snapPoints.expanded,
      snapPoints.collapsed,
    ));
  }, [mapHeight, sheetTop, snapPoints]);

  useEffect(() => {
    if (!sheetWasPositionedRef.current || mapHeight <= 0) {
      return;
    }

    animateSheetTo(snapPoints.collapsed);
  }, [animateSheetTo, mapHeight, selectedRestaurantId, snapPoints.collapsed]);

  const requestCurrentLocation = useCallback(async (): Promise<Coordinates | null> => {
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      const granted = permission.status === 'granted';
      setLocationGranted(granted);

      if (!granted) {
        return null;
      }

      const location = await Location.getCurrentPositionAsync({
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
  }, []);

  const restaurantsWithDistance = useMemo<MapRestaurantItem[]>(() => (
    restaurants.map(restaurant => ({
      ...restaurant,
      distanceKm: userLocation
        ? calculateDistanceKm(userLocation, {
            latitude: restaurant.latitude,
            longitude: restaurant.longitude,
          })
        : null,
    }))
  ), [restaurants, userLocation]);

  const groupCountByRestaurantId = useMemo(() => {
    const groups = new Map<string, Set<string>>();

    restaurants.forEach(restaurant => {
      const groupIds = groups.get(restaurant.restaurantId) ?? new Set<string>();
      groupIds.add(restaurant.groupId);
      groups.set(restaurant.restaurantId, groupIds);
    });

    return new Map([...groups.entries()].map(([restaurantId, groupIds]) => [
      restaurantId,
      groupIds.size,
    ]));
  }, [restaurants]);

  const visibleRestaurants = useMemo(() => {
    const normalizedQuery = normalizeSearch(searchQuery);

    return restaurantsWithDistance
      .filter(restaurant => {
        if (statusFilter !== 'ALL' && restaurant.status !== statusFilter) {
          return false;
        }
        if (favoritesOnly && !restaurant.favorite) {
          return false;
        }
        if (!normalizedQuery) {
          return true;
        }

        const searchable = normalizeSearch([
          restaurant.name,
          restaurant.category,
          restaurant.address,
          restaurant.city,
          restaurant.country,
          restaurant.groupName,
        ].filter(Boolean).join(' '));

        return searchable.includes(normalizedQuery);
      })
      .sort((first, second) => {
        if (first.distanceKm !== null && second.distanceKm !== null) {
          return first.distanceKm - second.distanceKm;
        }
        return first.name.localeCompare(second.name, 'es');
      });
  }, [
    favoritesOnly,
    restaurantsWithDistance,
    searchQuery,
    statusFilter,
  ]);

  const selectedRestaurant = useMemo(() => (
    visibleRestaurants.find(item => item.groupRestaurantId === selectedRestaurantId)
      ?? null
  ), [selectedRestaurantId, visibleRestaurants]);

  const selectedMemberships = useMemo<Membership[]>(() => {
    if (!selectedRestaurant) {
      return [];
    }

    const seen = new Set<string>();

    return restaurants
      .filter(item => item.restaurantId === selectedRestaurant.restaurantId)
      .filter(item => {
        if (seen.has(item.groupId)) {
          return false;
        }
        seen.add(item.groupId);
        return true;
      })
      .map(item => ({
        groupId: item.groupId,
        groupName: item.groupName,
        groupRestaurantId: item.groupRestaurantId,
        status: item.status,
      }))
      .sort((first, second) => first.groupName.localeCompare(second.groupName, 'es'));
  }, [restaurants, selectedRestaurant]);

  useEffect(() => {
    if (selectedRestaurantId && !selectedRestaurant) {
      setSelectedRestaurantId(null);
      setGroupsModalVisible(false);
    }
  }, [selectedRestaurant, selectedRestaurantId]);

  const loadMap = useCallback(async (): Promise<void> => {
    if (!accessToken) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage(null);
      hasPositionedInitialCameraRef.current = false;

      const [response, currentLocation] = await Promise.all([
        getMapRestaurants(accessToken),
        requestCurrentLocation(),
      ]);

      setRestaurants(response);
      setUserLocation(currentLocation);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, requestCurrentLocation]);

  useFocusEffect(useCallback(() => {
    void loadMap();
  }, [loadMap]));

  useEffect(() => {
    if (!isMapReady || isLoading || hasPositionedInitialCameraRef.current) {
      return;
    }

    if (userLocation) {
      mapRef.current?.animateToRegion({
        ...userLocation,
        latitudeDelta: USER_DELTA,
        longitudeDelta: USER_DELTA,
      }, 450);
      hasPositionedInitialCameraRef.current = true;
      return;
    }

    const coordinates = visibleRestaurants.map(item => ({
      latitude: item.latitude,
      longitude: item.longitude,
    }));

    if (coordinates.length === 1) {
      mapRef.current?.animateToRegion({
        ...coordinates[0],
        latitudeDelta: USER_DELTA,
        longitudeDelta: USER_DELTA,
      }, 450);
      hasPositionedInitialCameraRef.current = true;
    } else if (coordinates.length > 1) {
      mapRef.current?.fitToCoordinates(coordinates, {
        animated: true,
        edgePadding: { bottom: 125, left: 42, right: 42, top: 52 },
      });
      hasPositionedInitialCameraRef.current = true;
    }
  }, [isLoading, isMapReady, userLocation, visibleRestaurants]);

  function resetFilters(): void {
    setSelectedRestaurantId(null);
    setFavoritesOnly(false);
    setSearchQuery('');
    setStatusFilter('ALL');
  }

  function showAll(): void {
    setSelectedRestaurantId(null);
    setFavoritesOnly(false);
    setStatusFilter('ALL');
  }

  function showFavorites(): void {
    setSelectedRestaurantId(null);
    setStatusFilter('ALL');
    setFavoritesOnly(true);
  }

  function openRestaurant(restaurant: MapRestaurantItem): void {
    router.push({
      pathname: '/groups/[groupId]/restaurants/[groupRestaurantId]',
      params: {
        groupId: restaurant.groupId,
        groupRestaurantId: restaurant.groupRestaurantId,
      },
    });
  }

  function openGroup(groupId: string): void {
    setGroupsModalVisible(false);
    router.push({
      pathname: '/groups/[groupId]',
      params: { groupId },
    });
  }

  function handleGroupsPress(): void {
    if (selectedMemberships.length === 1) {
      openGroup(selectedMemberships[0].groupId);
    } else if (selectedMemberships.length > 1) {
      setGroupsModalVisible(true);
    }
  }

  function focusRestaurant(restaurant: MapRestaurantItem): void {
    setSelectedRestaurantId(restaurant.groupRestaurantId);
    setGroupsModalVisible(false);
    mapRef.current?.animateToRegion({
      latitude: restaurant.latitude,
      longitude: restaurant.longitude,
      latitudeDelta: RESTAURANT_DELTA,
      longitudeDelta: RESTAURANT_DELTA,
    }, 350);
  }

  async function centerOnUser(): Promise<void> {
    const location = userLocation ?? await requestCurrentLocation();

    if (!location) {
      Alert.alert(
        'Ubicación no disponible',
        'Activa el permiso de ubicación para centrar el mapa y calcular distancias.',
      );
      return;
    }

    setUserLocation(location);
    mapRef.current?.animateToRegion({
      ...location,
      latitudeDelta: USER_DELTA,
      longitudeDelta: USER_DELTA,
    }, 360);
  }

  async function openDirections(restaurant: MapRestaurantItem): Promise<void> {
    const destination = `${restaurant.latitude},${restaurant.longitude}`;
    const fallbackUrl = `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
    const nativeUrl = Platform.select({
      android: `google.navigation:q=${destination}`,
      ios: `http://maps.apple.com/?daddr=${destination}`,
    });

    try {
      if (nativeUrl && await Linking.canOpenURL(nativeUrl)) {
        await Linking.openURL(nativeUrl);
      } else {
        await Linking.openURL(fallbackUrl);
      }
    } catch {
      Alert.alert(
        'No se ha podido abrir el mapa',
        'Prueba de nuevo dentro de unos segundos.',
      );
    }
  }

  async function toggleFavorite(restaurant: MapRestaurantItem): Promise<void> {
    if (!accessToken || updatingRestaurantId) {
      return;
    }

    try {
      setUpdatingRestaurantId(restaurant.groupRestaurantId);
      const response = await updateGroupRestaurantFavorite(
        restaurant.groupId,
        restaurant.groupRestaurantId,
        { favorite: !restaurant.favorite },
        accessToken,
      );

      setRestaurants(current => current.map(item => (
        item.groupRestaurantId === restaurant.groupRestaurantId
          ? { ...item, favorite: response.favorite }
          : item
      )));
    } catch (error) {
      Alert.alert('No se ha podido actualizar', getErrorMessage(error));
    } finally {
      setUpdatingRestaurantId(null);
    }
  }

  const allActive = statusFilter === 'ALL' && !favoritesOnly;
  const statusActive = statusFilter !== 'ALL' && !favoritesOnly;
  const locationButtonBottom = selectedRestaurant ? 226 : 110;
  const selectedPresentation = selectedRestaurant
    ? getPresentation(selectedRestaurant)
    : null;
  const groupLabel = selectedMemberships.length > 1
    ? `Guardado en ${selectedMemberships.length} grupos`
    : selectedMemberships[0]?.groupName ?? 'Ver grupo';
  const groupCaption = selectedMemberships.length > 1
    ? 'Ver todos los grupos'
    : 'Abrir grupo';

  return (
    <SafeAreaView edges={['top', 'right', 'left']} style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerCopy}>
            <Text
              maxFontSizeMultiplier={1.15}
              style={[
                styles.title,
                {
                  fontFamily: fonts.semiBold,
                  fontSize: 27,
                  letterSpacing: -0.55,
                  lineHeight: 33,
                },
              ]}
            >
              Tus restaurantes
            </Text>
            <Text
              maxFontSizeMultiplier={1.2}
              style={[
                styles.subtitle,
                { fontFamily: fonts.regular },
              ]}
            >
              Explora y filtra tus sitios guardados en el mapa
            </Text>
          </View>
        </View>

        <View style={styles.searchBar}>
          <SymbolView
            name={{ android: 'search', ios: 'magnifyingglass', web: 'search' }}
            size={19}
            tintColor={colors.muted}
          />
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            maxFontSizeMultiplier={1.2}
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
                name={{ android: 'cancel', ios: 'xmark.circle.fill', web: 'cancel' }}
                size={18}
                tintColor="#B5AAA4"
              />
            </Pressable>
          ) : null}
        </View>

        <ScrollView
          contentContainerStyle={[
            styles.quickFiltersContent,
            {
              flexGrow: 1,
              justifyContent: 'center',
              paddingHorizontal: 4,
            },
          ]}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.quickFilters}
        >
          <QuickFilter
            active={allActive}
            icon={{ android: 'map', ios: 'map', web: 'map' }}
            label="Todos"
            onPress={showAll}
          />
          <QuickFilter
            active={statusActive}
            dropdown
            icon={{
              android: 'filter_alt',
              ios: 'line.3.horizontal.decrease.circle',
              web: 'filter_alt',
            }}
            label="Estado"
            onPress={() => setFilterModalVisible(true)}
          />
          <QuickFilter
            active={favoritesOnly}
            icon={{
              android: favoritesOnly ? 'favorite' : 'favorite_border',
              ios: favoritesOnly ? 'heart.fill' : 'heart',
              web: favoritesOnly ? 'favorite' : 'favorite_border',
            }}
            label="Favoritos"
            onPress={showFavorites}
          />
        </ScrollView>
      </View>

      <View
        onLayout={(event: LayoutChangeEvent) => setMapHeight(event.nativeEvent.layout.height)}
        style={styles.mapContainer}
      >
        <MapView
          customMapStyle={MAP_STYLE}
          initialRegion={DEFAULT_REGION}
          mapPadding={{ bottom: 112, left: 16, right: 16, top: 26 }}
          onMapReady={() => setIsMapReady(true)}
          provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
          ref={mapRef}
          rotateEnabled={false}
          showsCompass={false}
          showsMyLocationButton={false}
          showsUserLocation={locationGranted}
          style={styles.map}
          toolbarEnabled={false}
        >
          {visibleRestaurants.map(restaurant => (
            <RestaurantMarker
              key={`${restaurant.groupRestaurantId}:${restaurant.status}:${restaurant.favorite}:${restaurant.groupRestaurantId === selectedRestaurantId}`}
              onPress={() => focusRestaurant(restaurant)}
              restaurant={restaurant}
              selected={selectedRestaurantId === restaurant.groupRestaurantId}
            />
          ))}
        </MapView>

        {!isLoading && !errorMessage ? (
          <View style={styles.resultsPill}>
            <SymbolView
              name={{ android: 'restaurant', ios: 'fork.knife', web: 'restaurant' }}
              size={12}
              tintColor={colors.primary}
            />
            <Text maxFontSizeMultiplier={1.15} style={styles.resultsPillText}>
              {visibleRestaurants.length} {visibleRestaurants.length === 1 ? 'resultado' : 'resultados'}
            </Text>
          </View>
        ) : null}

        <Pressable
          accessibilityLabel="Centrar en mi ubicación"
          accessibilityRole="button"
          onPress={() => void centerOnUser()}
          style={({ pressed }) => [
            styles.locationButton,
            { bottom: locationButtonBottom },
            pressed ? styles.pressed : null,
          ]}
        >
          <SymbolView
            name={{ android: 'my_location', ios: 'location.fill', web: 'my_location' }}
            size={20}
            tintColor={colors.primary}
          />
        </Pressable>

        <Animated.View style={[styles.bottomSheet, { top: sheetTop }]}>
          <View {...panResponder.panHandlers} style={styles.dragZone}>
            <View style={styles.handle} />

            {selectedRestaurant && selectedPresentation ? (
              <View style={styles.selectedCard}>
                <View style={styles.selectedMain}>
                  <View
                    style={[
                      styles.selectedIcon,
                      { backgroundColor: selectedPresentation.backgroundColor },
                    ]}
                  >
                    <SymbolView
                      name={{ android: 'restaurant', ios: 'fork.knife', web: 'restaurant' }}
                      size={21}
                      tintColor={selectedPresentation.markerColor}
                    />
                  </View>
                  <View style={styles.selectedCopy}>
                    <View style={styles.selectedNameRow}>
                      <Text
                        maxFontSizeMultiplier={1.15}
                        numberOfLines={1}
                        style={styles.selectedName}
                      >
                        {selectedRestaurant.name}
                      </Text>
                      <Pressable
                        accessibilityLabel="Cerrar selección"
                        accessibilityRole="button"
                        hitSlop={8}
                        onPress={() => {
                          setSelectedRestaurantId(null);
                          setGroupsModalVisible(false);
                        }}
                        style={styles.closeSelection}
                      >
                        <SymbolView
                          name={{ android: 'close', ios: 'xmark', web: 'close' }}
                          size={14}
                          tintColor={colors.muted}
                        />
                      </Pressable>
                    </View>
                    <Text
                      maxFontSizeMultiplier={1.15}
                      numberOfLines={1}
                      style={styles.selectedMeta}
                    >
                      {selectedRestaurant.category ?? 'Restaurante'}
                    </Text>
                    <View style={styles.selectedStatusRow}>
                      <View
                        style={[
                          styles.statusPill,
                          { backgroundColor: selectedPresentation.backgroundColor },
                        ]}
                      >
                        <Text
                          maxFontSizeMultiplier={1.15}
                          style={[
                            styles.statusPillText,
                            { color: selectedPresentation.textColor },
                          ]}
                        >
                          {selectedPresentation.label}
                        </Text>
                      </View>
                      {selectedRestaurant.distanceKm !== null ? (
                        <Text
                          maxFontSizeMultiplier={1.15}
                          style={styles.selectedDistance}
                        >
                          {formatDistance(selectedRestaurant.distanceKm)}
                        </Text>
                      ) : null}
                    </View>
                  </View>
                </View>

                {selectedMemberships.length > 0 ? (
                  <Pressable
                    accessibilityRole="button"
                    onPress={handleGroupsPress}
                    style={({ pressed }) => [
                      styles.groupLink,
                      pressed ? styles.groupLinkPressed : null,
                    ]}
                  >
                    <View style={styles.groupLinkIcon}>
                      <SymbolView
                        name={{ android: 'groups', ios: 'person.2', web: 'groups' }}
                        size={17}
                        tintColor="#62794D"
                      />
                    </View>
                    <View style={styles.groupLinkCopy}>
                      <Text
                        maxFontSizeMultiplier={1.15}
                        numberOfLines={1}
                        style={styles.groupLinkTitle}
                      >
                        {groupLabel}
                      </Text>
                      <Text
                        maxFontSizeMultiplier={1.15}
                        numberOfLines={1}
                        style={styles.groupLinkCaption}
                      >
                        {groupCaption}
                      </Text>
                    </View>
                    <SymbolView
                      name={{ android: 'chevron_right', ios: 'chevron.right', web: 'chevron_right' }}
                      size={16}
                      tintColor={colors.muted}
                    />
                  </Pressable>
                ) : null}

                <View style={styles.selectedActions}>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => openRestaurant(selectedRestaurant)}
                    style={({ pressed }) => [
                      styles.primaryButton,
                      pressed ? styles.pressed : null,
                    ]}
                  >
                    <Text maxFontSizeMultiplier={1.15} style={styles.primaryButtonText}>
                      Ver detalle
                    </Text>
                  </Pressable>
                  <Pressable
                    accessibilityLabel="Abrir indicaciones"
                    accessibilityRole="button"
                    onPress={() => void openDirections(selectedRestaurant)}
                    style={({ pressed }) => [styles.iconButton, pressed ? styles.pressed : null]}
                  >
                    <SymbolView
                      name={{ android: 'navigation', ios: 'location.north.line', web: 'navigation' }}
                      size={18}
                      tintColor={colors.primary}
                    />
                  </Pressable>
                  <Pressable
                    accessibilityLabel="Cambiar favorito"
                    accessibilityRole="button"
                    disabled={updatingRestaurantId === selectedRestaurant.groupRestaurantId}
                    onPress={() => void toggleFavorite(selectedRestaurant)}
                    style={({ pressed }) => [styles.iconButton, pressed ? styles.pressed : null]}
                  >
                    {updatingRestaurantId === selectedRestaurant.groupRestaurantId ? (
                      <ActivityIndicator color={colors.primary} size="small" />
                    ) : (
                      <FavoriteIcon favorite={selectedRestaurant.favorite} />
                    )}
                  </Pressable>
                </View>
              </View>
            ) : (
              <Pressable
                accessibilityRole="button"
                onPress={() => animateSheetTo(snapPoints.middle)}
                style={({ pressed }) => [
                  styles.collapsedHeader,
                  pressed ? styles.pressed : null,
                ]}
              >
                <View style={styles.collapsedCopy}>
                  <Text maxFontSizeMultiplier={1.15} style={styles.collapsedTitle}>
                    {userLocation ? 'Cerca de ti' : 'Tus restaurantes'}
                  </Text>
                  <Text maxFontSizeMultiplier={1.2} style={styles.collapsedSubtitle}>
                    {visibleRestaurants.length} {visibleRestaurants.length === 1 ? 'restaurante guardado' : 'restaurantes guardados'}
                  </Text>
                </View>
                <View style={styles.listButton}>
                  <Text maxFontSizeMultiplier={1.15} style={styles.listButtonText}>
                    Ver lista
                  </Text>
                  <SymbolView
                    name={{ android: 'keyboard_arrow_up', ios: 'chevron.up', web: 'keyboard_arrow_up' }}
                    size={13}
                    tintColor={colors.primary}
                  />
                </View>
              </Pressable>
            )}
          </View>

          {isLoading ? (
            <View style={styles.state}>
              <ActivityIndicator color={colors.primary} size="large" />
              <Text style={styles.stateText}>Cargando tus restaurantes...</Text>
            </View>
          ) : errorMessage ? (
            <View style={styles.state}>
              <View style={styles.stateIcon}>
                <SymbolView
                  name={{ android: 'wifi_off', ios: 'wifi.slash', web: 'wifi_off' }}
                  size={21}
                  tintColor={colors.primary}
                />
              </View>
              <Text style={styles.stateTitle}>No hemos podido cargar el mapa</Text>
              <Text style={styles.stateText}>{errorMessage}</Text>
              <Pressable
                accessibilityRole="button"
                onPress={() => void loadMap()}
                style={styles.retryButton}
              >
                <Text style={styles.retryButtonText}>Volver a intentar</Text>
              </Pressable>
            </View>
          ) : (
            <FlatList
              contentContainerStyle={
                visibleRestaurants.length === 0
                  ? styles.emptyList
                  : styles.listContent
              }
              data={visibleRestaurants}
              keyExtractor={item => item.groupRestaurantId}
              ListEmptyComponent={(
                <View style={styles.state}>
                  <View style={styles.stateIcon}>
                    <SymbolView
                      name={{ android: 'location_off', ios: 'mappin.slash', web: 'location_off' }}
                      size={21}
                      tintColor={colors.primary}
                    />
                  </View>
                  <Text style={styles.stateTitle}>No hay restaurantes aquí</Text>
                  <Text style={styles.stateText}>Prueba con otra búsqueda o cambia los filtros.</Text>
                  <Pressable
                    accessibilityRole="button"
                    onPress={resetFilters}
                    style={styles.retryButton}
                  >
                    <Text style={styles.retryButtonText}>Ver todos</Text>
                  </Pressable>
                </View>
              )}
              renderItem={({ item }) => (
                <RestaurantRow
                  groupCount={groupCountByRestaurantId.get(item.restaurantId) ?? 1}
                  onFavoritePress={() => void toggleFavorite(item)}
                  onPress={() => focusRestaurant(item)}
                  restaurant={item}
                  selected={selectedRestaurantId === item.groupRestaurantId}
                  updating={updatingRestaurantId === item.groupRestaurantId}
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
        onRequestClose={() => setFilterModalVisible(false)}
        transparent
        visible={filterModalVisible}
      >
        <Pressable onPress={() => setFilterModalVisible(false)} style={styles.modalOverlay}>
          <Pressable
            onPress={event => event.stopPropagation()}
            style={[
              styles.groupsModalContent,
              { paddingBottom: Math.max(insets.bottom, 18) + 18 },
            ]}
          >
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <View style={styles.groupsModalHeading}>
                <Text maxFontSizeMultiplier={1.15} style={styles.modalTitle}>
                  Filtrar por estado
                </Text>
                <Text maxFontSizeMultiplier={1.2} style={styles.modalSubtitle}>
                  Elige qué restaurantes quieres mostrar en el mapa
                </Text>
              </View>
              <Pressable
                accessibilityLabel="Cerrar selector de estado"
                accessibilityRole="button"
                onPress={() => setFilterModalVisible(false)}
                style={styles.modalClose}
              >
                <SymbolView
                  name={{ android: 'close', ios: 'xmark', web: 'close' }}
                  size={16}
                  tintColor={colors.text}
                />
              </Pressable>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.modalSection}>
                <View style={styles.modalOptions}>
                  {STATUS_OPTIONS.map(option => {
                    const selected = option.value === statusFilter;

                    return (
                      <Pressable
                        key={option.value}
                        accessibilityRole="button"
                        onPress={() => {
                          setSelectedRestaurantId(null);
                          setStatusFilter(option.value);
                          setFavoritesOnly(false);
                          setFilterModalVisible(false);
                        }}
                        style={[
                          styles.modalOption,
                          selected ? styles.modalOptionSelected : null,
                        ]}
                      >
                        <Text
                          maxFontSizeMultiplier={1.15}
                          style={[
                            styles.modalOptionText,
                            selected ? styles.modalOptionTextSelected : null,
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
          </Pressable>
        </Pressable>
      </Modal>

      <Modal
        animationType="slide"
        onRequestClose={() => setGroupsModalVisible(false)}
        transparent
        visible={groupsModalVisible}
      >
        <Pressable onPress={() => setGroupsModalVisible(false)} style={styles.modalOverlay}>
          <Pressable
            onPress={event => event.stopPropagation()}
            style={[
              styles.groupsModalContent,
              { paddingBottom: Math.max(insets.bottom, 18) + 18 },
            ]}
          >
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <View style={styles.groupsModalHeading}>
                <Text maxFontSizeMultiplier={1.15} style={styles.modalTitle}>
                  Grupos del restaurante
                </Text>
                <Text
                  maxFontSizeMultiplier={1.2}
                  numberOfLines={2}
                  style={styles.modalSubtitle}
                >
                  {selectedRestaurant?.name} está guardado en estos grupos
                </Text>
              </View>
              <Pressable
                accessibilityLabel="Cerrar grupos"
                accessibilityRole="button"
                onPress={() => setGroupsModalVisible(false)}
                style={styles.modalClose}
              >
                <SymbolView
                  name={{ android: 'close', ios: 'xmark', web: 'close' }}
                  size={16}
                  tintColor={colors.text}
                />
              </Pressable>
            </View>

            <View style={styles.groupsList}>
              {selectedMemberships.map(membership => {
                const presentation = STATUS_PRESENTATION[membership.status];
                return (
                  <Pressable
                    key={membership.groupId}
                    accessibilityRole="button"
                    onPress={() => openGroup(membership.groupId)}
                    style={({ pressed }) => [
                      styles.groupRow,
                      pressed ? styles.groupRowPressed : null,
                    ]}
                  >
                    <View style={styles.groupRowIcon}>
                      <SymbolView
                        name={{ android: 'groups', ios: 'person.2', web: 'groups' }}
                        size={18}
                        tintColor="#62794D"
                      />
                    </View>
                    <View style={styles.groupRowCopy}>
                      <Text
                        maxFontSizeMultiplier={1.15}
                        numberOfLines={1}
                        style={styles.groupRowName}
                      >
                        {membership.groupName}
                      </Text>
                      <Text
                        maxFontSizeMultiplier={1.15}
                        style={[styles.groupRowStatus, { color: presentation.textColor }]}
                      >
                        {presentation.label} en este grupo
                      </Text>
                    </View>
                    <SymbolView
                      name={{ android: 'chevron_right', ios: 'chevron.right', web: 'chevron_right' }}
                      size={18}
                      tintColor={colors.muted}
                    />
                  </Pressable>
                );
              })}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}
