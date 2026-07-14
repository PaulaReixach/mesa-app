import { MaterialIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { router, useFocusEffect } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import type { ComponentProps, ReactNode } from 'react';
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
  Image,
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
import { getErrorMessage, resolveApiUrl } from '../lib/api';
import { getRestaurantFallbackImage } from '../lib/restaurant-images';
import { getGroups } from '../services/group-service';
import { getMapRestaurants } from '../services/map-service';
import { updateGroupRestaurantFavorite } from '../services/restaurant-service';
import { groupFilterStyles } from '../styles/map-group-filter.styles';
import { styles } from '../styles/map-screen-enhanced.styles';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import type { RestaurantGroup } from '../types/group';
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

type RestaurantMembership = {
  favorite: boolean;
  groupId: string;
  groupName: string;
  groupRestaurantId: string;
  status: GroupRestaurantStatus;
};

type MapRestaurantItem = Omit<
  MapRestaurant,
  'favorite' | 'groupId' | 'groupName' | 'groupRestaurantId' | 'status'
> & {
  allMemberships: RestaurantMembership[];
  distanceKm: number | null;
  favorite: boolean;
  groupId: string;
  groupName: string;
  groupRestaurantId: string;
  hasMixedStatuses: boolean;
  memberships: RestaurantMembership[];
  status: GroupRestaurantStatus;
};

type SymbolName = ComponentProps<typeof SymbolView>['name'];
type MembershipModalMode = 'GROUP' | 'RESTAURANT';
type GroupThumbnailVariant = 'filter' | 'link' | 'membership';

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

const USER_DELTA = 0.025;
const RESTAURANT_DELTA = 0.022;

const STATUS_OPTIONS: Array<{
  chipLabel: string;
  label: string;
  value: StatusFilter;
}> = [
  { chipLabel: 'Estado', label: 'Todos los estados', value: 'ALL' },
  { chipLabel: 'Pendiente', label: 'Pendiente de ir', value: 'WANT_TO_GO' },
  { chipLabel: 'Visitado', label: 'Visitado', value: 'VISITED' },
  { chipLabel: 'Repetir', label: 'Queremos repetir', value: 'WANT_TO_REPEAT' },
  { chipLabel: 'No repetir', label: 'No repetir', value: 'DO_NOT_REPEAT' },
  { chipLabel: 'Archivado', label: 'Archivado', value: 'ARCHIVED' },
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

const MIXED_STATUS_PRESENTATION: Presentation = {
  backgroundColor: '#EFEAE6',
  label: 'Varios estados',
  markerColor: '#846F64',
  textColor: '#66564E',
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

function getPresentation(restaurant: MapRestaurantItem): Presentation {
  return restaurant.hasMixedStatuses
    ? MIXED_STATUS_PRESENTATION
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

function BottomModal({
  children,
  onClose,
  subtitle,
  title,
  visible,
}: {
  children: ReactNode;
  onClose: () => void;
  subtitle: string;
  title: string;
  visible: boolean;
}) {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      animationType="slide"
      onRequestClose={onClose}
      transparent
      visible={visible}
    >
      <Pressable onPress={onClose} style={styles.modalOverlay}>
        <Pressable
          onPress={event => event.stopPropagation()}
          style={[
            styles.groupsModalContent,
            groupFilterStyles.modalContent,
            { paddingBottom: Math.max(insets.bottom, 18) + 18 },
          ]}
        >
          <View style={styles.modalHandle} />
          <View style={styles.modalHeader}>
            <View style={styles.groupsModalHeading}>
              <Text maxFontSizeMultiplier={1.15} style={styles.modalTitle}>
                {title}
              </Text>
              <Text
                maxFontSizeMultiplier={1.2}
                numberOfLines={3}
                style={styles.modalSubtitle}
              >
                {subtitle}
              </Text>
            </View>
            <Pressable
              accessibilityLabel="Cerrar"
              accessibilityRole="button"
              onPress={onClose}
              style={styles.modalClose}
            >
              <SymbolView
                name={{ android: 'close', ios: 'xmark', web: 'close' }}
                size={16}
                tintColor={colors.text}
              />
            </Pressable>
          </View>
          {children}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function QuickFilter({
  active,
  constrainLabel = false,
  dropdown = false,
  icon,
  label,
  onPress,
}: {
  active: boolean;
  constrainLabel?: boolean;
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
      <SymbolView name={icon} size={13} tintColor={tintColor} />
      <Text
        maxFontSizeMultiplier={1.15}
        numberOfLines={1}
        style={[
          styles.quickChipText,
          active ? styles.quickChipTextActive : null,
          constrainLabel ? groupFilterStyles.constrainedChipLabel : null,
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
          size={11}
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

function GroupThumbnail({
  group,
  selected = false,
  variant,
}: {
  group: RestaurantGroup | null;
  selected?: boolean;
  variant: GroupThumbnailVariant;
}) {
  const imageUri = group?.imageUrl ? resolveApiUrl(group.imageUrl) : null;
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [imageUri]);

  const filterVariant = variant === 'filter';
  const linkVariant = variant === 'link';
  const containerStyle = filterVariant
    ? groupFilterStyles.groupIcon
    : linkVariant
      ? styles.groupLinkIcon
      : styles.groupRowIcon;
  const imageStyle = filterVariant
    ? groupFilterStyles.groupImage
    : linkVariant
      ? [styles.groupRowImage, { borderRadius: 11 }]
      : styles.groupRowImage;

  return (
    <View
      style={[
        containerStyle,
        filterVariant && selected
          ? groupFilterStyles.groupIconSelected
          : null,
      ]}
    >
      {imageUri && !imageFailed ? (
        <Image
          accessibilityIgnoresInvertColors
          onError={() => setImageFailed(true)}
          resizeMode="cover"
          source={{ uri: imageUri }}
          style={imageStyle}
        />
      ) : (
        <SymbolView
          name={group?.privacy === 'PUBLIC'
            ? { android: 'public', ios: 'globe', web: 'public' }
            : { android: 'groups', ios: 'person.2', web: 'groups' }}
          size={18}
          tintColor={selected ? colors.primary : '#62794D'}
        />
      )}
    </View>
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
  onFavoritePress,
  onPress,
  restaurant,
  selected,
  updating,
}: {
  onFavoritePress: () => void;
  onPress: () => void;
  restaurant: MapRestaurantItem;
  selected: boolean;
  updating: boolean;
}) {
  const presentation = getPresentation(restaurant);
  const groupContext = restaurant.memberships.length > 1
    ? `${restaurant.memberships.length} grupos`
    : restaurant.memberships[0]?.groupName ?? 'Sin grupo';

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
      <Image
        accessibilityIgnoresInvertColors
        resizeMode="cover"
        source={{ uri: getRestaurantFallbackImage(restaurant.name) }}
        style={styles.rowImage}
      />

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

function GroupFilterRow({
  group,
  onPress,
  restaurantCount,
  selected,
}: {
  group: RestaurantGroup | null;
  onPress: () => void;
  restaurantCount: number;
  selected: boolean;
}) {
  const title = group?.name ?? 'Todos los grupos';
  const privacy = group?.privacy === 'PUBLIC' ? 'Público' : 'Privado';
  const meta = group
    ? [
        privacy,
        group.city,
        `${restaurantCount} ${restaurantCount === 1 ? 'restaurante' : 'restaurantes'}`,
      ]
        .filter(Boolean)
        .join(' · ')
    : `${restaurantCount} ${restaurantCount === 1 ? 'restaurante' : 'restaurantes'} en total`;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        groupFilterStyles.groupRow,
        selected ? groupFilterStyles.groupRowSelected : null,
        pressed ? groupFilterStyles.groupRowPressed : null,
      ]}
    >
      <GroupThumbnail group={group} selected={selected} variant="filter" />
      <View style={groupFilterStyles.groupCopy}>
        <Text
          maxFontSizeMultiplier={1.15}
          numberOfLines={1}
          style={groupFilterStyles.groupName}
        >
          {title}
        </Text>
        <Text
          maxFontSizeMultiplier={1.15}
          numberOfLines={1}
          style={groupFilterStyles.groupMeta}
        >
          {meta}
        </Text>
      </View>
      {selected ? (
        <View style={groupFilterStyles.check}>
          <SymbolView
            name={{ android: 'check', ios: 'checkmark', web: 'check' }}
            size={14}
            tintColor={colors.primary}
          />
        </View>
      ) : (
        <SymbolView
          name={{
            android: 'chevron_right',
            ios: 'chevron.right',
            web: 'chevron_right',
          }}
          size={17}
          tintColor={colors.muted}
        />
      )}
    </Pressable>
  );
}

export default function MapScreenPolished() {
  const insets = useSafeAreaInsets();
  const { accessToken } = useAuth();
  const mapRef = useRef<MapView | null>(null);
  const sheetTop = useRef(new Animated.Value(1000)).current;
  const currentSheetTopRef = useRef(1000);
  const panStartTopRef = useRef(1000);
  const sheetWasPositionedRef = useRef(false);
  const hasPositionedInitialCameraRef = useRef(false);
  const previousFilterSignatureRef = useRef<string | null>(null);

  const [restaurants, setRestaurants] = useState<MapRestaurant[]>([]);
  const [groups, setGroups] = useState<RestaurantGroup[]>([]);
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [locationGranted, setLocationGranted] = useState(false);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [groupFilterModalVisible, setGroupFilterModalVisible] = useState(false);
  const [groupSearchQuery, setGroupSearchQuery] = useState('');
  const [membershipModalVisible, setMembershipModalVisible] = useState(false);
  const [membershipModalMode, setMembershipModalMode] = useState<MembershipModalMode>('GROUP');
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
    const collapsedHeight = selectedRestaurantId ? 216 : 94;

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

  const groupRestaurantCounts = useMemo(() => {
    const restaurantIdsByGroup = new Map<string, Set<string>>();

    restaurants.forEach(restaurant => {
      const restaurantIds = restaurantIdsByGroup.get(restaurant.groupId)
        ?? new Set<string>();
      restaurantIds.add(restaurant.restaurantId);
      restaurantIdsByGroup.set(restaurant.groupId, restaurantIds);
    });

    return new Map(
      [...restaurantIdsByGroup.entries()].map(([groupId, restaurantIds]) => [
        groupId,
        restaurantIds.size,
      ]),
    );
  }, [restaurants]);

  const groupsById = useMemo(() => (
    new Map(groups.map(group => [group.id, group]))
  ), [groups]);

  const totalRestaurantCount = useMemo(() => (
    new Set(restaurants.map(restaurant => restaurant.restaurantId)).size
  ), [restaurants]);

  const selectedGroup = useMemo(() => (
    groupsById.get(selectedGroupId ?? '') ?? null
  ), [groupsById, selectedGroupId]);

  const filteredGroups = useMemo(() => {
    const query = normalizeSearch(groupSearchQuery);

    return groups
      .filter(group => {
        if (!query) {
          return true;
        }

        return normalizeSearch([
          group.name,
          group.city,
          group.privacy === 'PUBLIC' ? 'público' : 'privado',
        ].filter(Boolean).join(' ')).includes(query);
      })
      .sort((first, second) => first.name.localeCompare(second.name, 'es'));
  }, [groupSearchQuery, groups]);

  const aggregatedRestaurants = useMemo<MapRestaurantItem[]>(() => {
    const groupedRestaurants = new Map<string, MapRestaurant[]>();

    restaurants.forEach(restaurant => {
      const current = groupedRestaurants.get(restaurant.restaurantId) ?? [];
      current.push(restaurant);
      groupedRestaurants.set(restaurant.restaurantId, current);
    });

    return [...groupedRestaurants.values()].flatMap(group => {
      const allMemberships: RestaurantMembership[] = group.map(item => ({
        favorite: item.favorite,
        groupId: item.groupId,
        groupName: item.groupName,
        groupRestaurantId: item.groupRestaurantId,
        status: item.status,
      }));
      const memberships = selectedGroupId
        ? allMemberships.filter(item => item.groupId === selectedGroupId)
        : allMemberships;

      if (memberships.length === 0) {
        return [];
      }

      const representative = group.find(item => (
        item.groupRestaurantId === memberships[0].groupRestaurantId
      )) ?? group[0];
      const statuses = new Set(memberships.map(item => item.status));

      return [{
        ...representative,
        allMemberships,
        distanceKm: userLocation
          ? calculateDistanceKm(userLocation, {
              latitude: representative.latitude,
              longitude: representative.longitude,
            })
          : null,
        favorite: memberships.some(item => item.favorite),
        groupId: memberships[0].groupId,
        groupName: memberships[0].groupName,
        groupRestaurantId: memberships[0].groupRestaurantId,
        hasMixedStatuses: statuses.size > 1,
        memberships,
        status: memberships[0].status,
      }];
    });
  }, [restaurants, selectedGroupId, userLocation]);

  const visibleRestaurants = useMemo(() => {
    const normalizedQuery = normalizeSearch(searchQuery);

    return aggregatedRestaurants
      .filter(restaurant => {
        if (
          statusFilter !== 'ALL'
          && !restaurant.memberships.some(item => item.status === statusFilter)
        ) {
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
          ...restaurant.allMemberships.map(item => item.groupName),
        ].filter(Boolean).join(' '));

        return searchable.includes(normalizedQuery);
      })
      .sort((first, second) => {
        if (first.distanceKm !== null && second.distanceKm !== null) {
          return first.distanceKm - second.distanceKm;
        }

        return first.name.localeCompare(second.name, 'es');
      });
  }, [aggregatedRestaurants, favoritesOnly, searchQuery, statusFilter]);

  const selectedRestaurant = useMemo(() => (
    visibleRestaurants.find(item => item.restaurantId === selectedRestaurantId)
      ?? null
  ), [selectedRestaurantId, visibleRestaurants]);

  useEffect(() => {
    if (selectedRestaurantId && !selectedRestaurant) {
      setSelectedRestaurantId(null);
      setMembershipModalVisible(false);
    }
  }, [selectedRestaurant, selectedRestaurantId]);

  const centerCamera = useCallback((location: Coordinates, duration = 420): void => {
    mapRef.current?.animateToRegion({
      ...location,
      latitudeDelta: USER_DELTA,
      longitudeDelta: USER_DELTA,
    }, duration);
  }, []);

  const fitRestaurants = useCallback((items: MapRestaurantItem[]): void => {
    if (items.length === 0) {
      return;
    }

    if (items.length === 1) {
      mapRef.current?.animateToRegion({
        latitude: items[0].latitude,
        longitude: items[0].longitude,
        latitudeDelta: RESTAURANT_DELTA,
        longitudeDelta: RESTAURANT_DELTA,
      }, 380);
      return;
    }

    mapRef.current?.fitToCoordinates(
      items.map(item => ({
        latitude: item.latitude,
        longitude: item.longitude,
      })),
      {
        animated: true,
        edgePadding: { bottom: 130, left: 44, right: 44, top: 54 },
      },
    );
  }, []);

  const loadMap = useCallback(async (): Promise<void> => {
    if (!accessToken) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage(null);
      hasPositionedInitialCameraRef.current = false;
      previousFilterSignatureRef.current = null;

      const [restaurantResponse, groupResponse, currentLocation] = await Promise.all([
        getMapRestaurants(accessToken),
        getGroups(accessToken),
        requestCurrentLocation(),
      ]);

      setRestaurants(restaurantResponse);
      setGroups(groupResponse);
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

    const timeoutId = setTimeout(() => {
      if (userLocation) {
        centerCamera(userLocation, 460);
      } else {
        fitRestaurants(visibleRestaurants);
      }

      hasPositionedInitialCameraRef.current = true;
    }, 180);

    return () => clearTimeout(timeoutId);
  }, [centerCamera, fitRestaurants, isLoading, isMapReady, userLocation, visibleRestaurants]);

  const normalizedSearchQuery = normalizeSearch(searchQuery);
  const hasActiveViewFilter = selectedGroupId !== null
    || statusFilter !== 'ALL'
    || favoritesOnly
    || normalizedSearchQuery.length > 0;
  const filterSignature = `${selectedGroupId ?? 'ALL'}:${statusFilter}:${favoritesOnly}:${normalizedSearchQuery}`;

  useEffect(() => {
    if (!isMapReady || isLoading || !hasPositionedInitialCameraRef.current) {
      previousFilterSignatureRef.current = filterSignature;
      return;
    }

    if (previousFilterSignatureRef.current === null) {
      previousFilterSignatureRef.current = filterSignature;
      return;
    }

    if (previousFilterSignatureRef.current === filterSignature) {
      return;
    }

    previousFilterSignatureRef.current = filterSignature;
    const timeoutId = setTimeout(() => {
      if (!hasActiveViewFilter && userLocation) {
        centerCamera(userLocation);
        return;
      }

      fitRestaurants(visibleRestaurants);
    }, 150);

    return () => clearTimeout(timeoutId);
  }, [
    centerCamera,
    filterSignature,
    fitRestaurants,
    hasActiveViewFilter,
    isLoading,
    isMapReady,
    userLocation,
    visibleRestaurants,
  ]);

  function resetFilters(): void {
    setSelectedRestaurantId(null);
    setFavoritesOnly(false);
    setSearchQuery('');
    setSelectedGroupId(null);
    setStatusFilter('ALL');
  }

  function showAll(): void {
    resetFilters();
  }

  function toggleFavorites(): void {
    setSelectedRestaurantId(null);
    setFavoritesOnly(current => !current);
  }

  function openGroup(groupId: string): void {
    setMembershipModalVisible(false);
    router.push({
      pathname: '/groups/[groupId]',
      params: { groupId },
    });
  }

  function openRestaurantMembership(membership: RestaurantMembership): void {
    setMembershipModalVisible(false);
    router.push({
      pathname: '/groups/[groupId]/restaurants/[groupRestaurantId]',
      params: {
        groupId: membership.groupId,
        groupRestaurantId: membership.groupRestaurantId,
      },
    });
  }

  function openRestaurant(restaurant: MapRestaurantItem): void {
    if (restaurant.memberships.length === 1) {
      openRestaurantMembership(restaurant.memberships[0]);
      return;
    }

    setMembershipModalMode('RESTAURANT');
    setMembershipModalVisible(true);
  }

  function handleGroupsPress(): void {
    if (!selectedRestaurant) {
      return;
    }

    if (selectedRestaurant.memberships.length === 1) {
      openGroup(selectedRestaurant.memberships[0].groupId);
      return;
    }

    setMembershipModalMode('GROUP');
    setMembershipModalVisible(true);
  }

  function focusRestaurant(restaurant: MapRestaurantItem): void {
    setSelectedRestaurantId(restaurant.restaurantId);
    setMembershipModalVisible(false);
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
    centerCamera(location, 360);
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

    const nextFavorite = !restaurant.favorite;

    try {
      setUpdatingRestaurantId(restaurant.restaurantId);

      await Promise.all(restaurant.allMemberships.map(membership => (
        updateGroupRestaurantFavorite(
          membership.groupId,
          membership.groupRestaurantId,
          { favorite: nextFavorite },
          accessToken,
        )
      )));

      setRestaurants(current => current.map(item => (
        item.restaurantId === restaurant.restaurantId
          ? { ...item, favorite: nextFavorite }
          : item
      )));
    } catch (error) {
      await loadMap();
      Alert.alert('No se ha podido actualizar', getErrorMessage(error));
    } finally {
      setUpdatingRestaurantId(null);
    }
  }

  function openGroupFilter(): void {
    setGroupSearchQuery('');
    setGroupFilterModalVisible(true);
  }

  function selectGroup(groupId: string | null): void {
    setSelectedRestaurantId(null);
    setSelectedGroupId(groupId);
    setGroupFilterModalVisible(false);
  }

  const allActive = !hasActiveViewFilter;
  const statusActive = statusFilter !== 'ALL';
  const groupActive = selectedGroupId !== null;
  const statusChipLabel = STATUS_OPTIONS.find(option => option.value === statusFilter)
    ?.chipLabel ?? 'Estado';
  const groupChipLabel = selectedGroup?.name ?? 'Grupo';
  const locationButtonBottom = selectedRestaurant ? 232 : 110;
  const selectedPresentation = selectedRestaurant
    ? getPresentation(selectedRestaurant)
    : null;
  const groupLabel = selectedRestaurant && selectedRestaurant.memberships.length > 1
    ? `Guardado en ${selectedRestaurant.memberships.length} grupos`
    : selectedRestaurant?.memberships[0]?.groupName ?? 'Ver grupo';
  const groupCaption = selectedRestaurant && selectedRestaurant.memberships.length > 1
    ? 'Ver todos los grupos y estados'
    : 'Abrir grupo';
  const membershipModalTitle = membershipModalMode === 'RESTAURANT'
    ? 'Elige un grupo'
    : 'Grupos del restaurante';
  const membershipModalSubtitle = membershipModalMode === 'RESTAURANT'
    ? `Selecciona desde qué grupo quieres abrir ${selectedRestaurant?.name ?? 'el restaurante'}`
    : `${selectedRestaurant?.name ?? 'Este restaurante'} está guardado en estos grupos`;
  const statusModalSubtitle = selectedGroup
    ? `Filtra los restaurantes de ${selectedGroup.name} por su estado dentro del grupo`
    : 'Un restaurante aparece si tiene ese estado en al menos uno de tus grupos';
  const primaryMembership = selectedRestaurant?.memberships[0] ?? null;
  const primaryGroup = primaryMembership
    ? groupsById.get(primaryMembership.groupId) ?? null
    : null;
  const additionalGroupCount = Math.max(
    (selectedRestaurant?.memberships.length ?? 0) - 1,
    0,
  );

  return (
    <SafeAreaView edges={['top', 'right', 'left']} style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerCopy}>
            <Text
              maxFontSizeMultiplier={1.15}
              style={styles.title}
            >
              Mapa
            </Text>
            <Text
              maxFontSizeMultiplier={1.2}
              style={[styles.subtitle, { fontFamily: fonts.regular }]}
            >
              Todos tus restaurantes, situados y listos para elegir.
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
          contentContainerStyle={styles.quickFiltersContent}
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
            label={statusChipLabel}
            onPress={() => setStatusModalVisible(true)}
          />
          <QuickFilter
            active={groupActive}
            constrainLabel
            dropdown
            icon={{ android: 'groups', ios: 'person.2', web: 'groups' }}
            label={groupChipLabel}
            onPress={openGroupFilter}
          />
          <QuickFilter
            active={favoritesOnly}
            icon={{
              android: favoritesOnly ? 'favorite' : 'favorite_border',
              ios: favoritesOnly ? 'heart.fill' : 'heart',
              web: favoritesOnly ? 'favorite' : 'favorite_border',
            }}
            label="Favoritos"
            onPress={toggleFavorites}
          />
        </ScrollView>
      </View>

      <View
        onLayout={(event: LayoutChangeEvent) => setMapHeight(event.nativeEvent.layout.height)}
        style={[
          styles.mapContainer,
          { marginBottom: Math.max(insets.bottom, 10) + 78 },
        ]}
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
              key={`${restaurant.restaurantId}:${restaurant.status}:${restaurant.hasMixedStatuses}:${restaurant.favorite}:${restaurant.restaurantId === selectedRestaurantId}`}
              onPress={() => focusRestaurant(restaurant)}
              restaurant={restaurant}
              selected={selectedRestaurantId === restaurant.restaurantId}
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
                  <Image
                    accessibilityIgnoresInvertColors
                    resizeMode="cover"
                    source={{ uri: getRestaurantFallbackImage(selectedRestaurant.name) }}
                    style={styles.selectedImage}
                  />
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
                          setMembershipModalVisible(false);
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

                <Pressable
                  accessibilityRole="button"
                  onPress={handleGroupsPress}
                  style={({ pressed }) => [
                    styles.groupLink,
                    pressed ? styles.groupLinkPressed : null,
                  ]}
                >
                  <View style={{ position: 'relative' }}>
                    <GroupThumbnail group={primaryGroup} variant="link" />
                    {additionalGroupCount > 0 ? (
                      <View
                        style={{
                          position: 'absolute',
                          right: -6,
                          bottom: -5,
                          minWidth: 18,
                          height: 18,
                          alignItems: 'center',
                          justifyContent: 'center',
                          paddingHorizontal: 4,
                          borderWidth: 2,
                          borderColor: '#FAFCF7',
                          borderRadius: 9,
                          backgroundColor: '#62794D',
                        }}
                      >
                        <Text
                          style={{
                            color: colors.white,
                            fontFamily: fonts.semiBold,
                            fontSize: 8,
                            lineHeight: 10,
                          }}
                        >
                          +{additionalGroupCount}
                        </Text>
                      </View>
                    ) : null}
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
                    name={{
                      android: 'chevron_right',
                      ios: 'chevron.right',
                      web: 'chevron_right',
                    }}
                    size={16}
                    tintColor={colors.muted}
                  />
                </Pressable>

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
                    style={({ pressed }) => [
                      styles.iconButton,
                      pressed ? styles.pressed : null,
                    ]}
                  >
                    <SymbolView
                      name={{
                        android: 'navigation',
                        ios: 'location.north.line',
                        web: 'navigation',
                      }}
                      size={18}
                      tintColor={colors.primary}
                    />
                  </Pressable>
                  <Pressable
                    accessibilityLabel="Cambiar favorito"
                    accessibilityRole="button"
                    disabled={updatingRestaurantId === selectedRestaurant.restaurantId}
                    onPress={() => void toggleFavorite(selectedRestaurant)}
                    style={({ pressed }) => [
                      styles.iconButton,
                      pressed ? styles.pressed : null,
                    ]}
                  >
                    {updatingRestaurantId === selectedRestaurant.restaurantId ? (
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
                    {selectedGroup
                      ? selectedGroup.name
                      : userLocation
                        ? 'Cerca de ti'
                        : 'Tus restaurantes'}
                  </Text>
                  <Text maxFontSizeMultiplier={1.2} style={styles.collapsedSubtitle}>
                    {visibleRestaurants.length} {visibleRestaurants.length === 1 ? 'restaurante' : 'restaurantes'}
                    {selectedGroup ? ' en este grupo' : ' guardados'}
                  </Text>
                </View>
                <View style={styles.listButton}>
                  <Text maxFontSizeMultiplier={1.15} style={styles.listButtonText}>
                    Ver lista
                  </Text>
                  <SymbolView
                    name={{
                      android: 'keyboard_arrow_up',
                      ios: 'chevron.up',
                      web: 'keyboard_arrow_up',
                    }}
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
              keyExtractor={item => item.restaurantId}
              ListEmptyComponent={(
                <View style={styles.state}>
                  <View style={styles.stateIcon}>
                    <SymbolView
                      name={{
                        android: 'location_off',
                        ios: 'mappin.slash',
                        web: 'location_off',
                      }}
                      size={21}
                      tintColor={colors.primary}
                    />
                  </View>
                  <Text style={styles.stateTitle}>No hay restaurantes aquí</Text>
                  <Text style={styles.stateText}>
                    Prueba con otra búsqueda o cambia los filtros.
                  </Text>
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
                  onFavoritePress={() => void toggleFavorite(item)}
                  onPress={() => focusRestaurant(item)}
                  restaurant={item}
                  selected={selectedRestaurantId === item.restaurantId}
                  updating={updatingRestaurantId === item.restaurantId}
                />
              )}
              showsVerticalScrollIndicator={false}
              style={styles.list}
            />
          )}
        </Animated.View>
      </View>

      <BottomModal
        onClose={() => setStatusModalVisible(false)}
        subtitle={statusModalSubtitle}
        title="Filtrar por estado"
        visible={statusModalVisible}
      >
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
                      setStatusModalVisible(false);
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
      </BottomModal>

      <BottomModal
        onClose={() => setGroupFilterModalVisible(false)}
        subtitle="Busca y selecciona uno de los grupos a los que perteneces"
        title="Filtrar por grupo"
        visible={groupFilterModalVisible}
      >
        <View style={groupFilterStyles.searchBar}>
          <SymbolView
            name={{ android: 'search', ios: 'magnifyingglass', web: 'search' }}
            size={18}
            tintColor={colors.muted}
          />
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            maxFontSizeMultiplier={1.2}
            onChangeText={setGroupSearchQuery}
            placeholder="Buscar un grupo"
            placeholderTextColor="#9B918B"
            returnKeyType="search"
            style={groupFilterStyles.searchInput}
            value={groupSearchQuery}
          />
          {groupSearchQuery ? (
            <Pressable
              accessibilityLabel="Borrar búsqueda de grupos"
              accessibilityRole="button"
              hitSlop={8}
              onPress={() => setGroupSearchQuery('')}
            >
              <SymbolView
                name={{ android: 'cancel', ios: 'xmark.circle.fill', web: 'cancel' }}
                size={18}
                tintColor="#B5AAA4"
              />
            </Pressable>
          ) : null}
        </View>

        {!groupSearchQuery ? (
          <View style={groupFilterStyles.allGroupsRow}>
            <GroupFilterRow
              group={null}
              onPress={() => selectGroup(null)}
              restaurantCount={totalRestaurantCount}
              selected={selectedGroupId === null}
            />
          </View>
        ) : null}

        <FlatList
          contentContainerStyle={groupFilterStyles.listContent}
          data={filteredGroups}
          keyExtractor={group => group.id}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={(
            <View style={groupFilterStyles.emptyState}>
              <View style={groupFilterStyles.emptyIcon}>
                <SymbolView
                  name={{ android: 'search_off', ios: 'magnifyingglass', web: 'search_off' }}
                  size={21}
                  tintColor={colors.primary}
                />
              </View>
              <Text style={groupFilterStyles.emptyTitle}>
                No hemos encontrado ese grupo
              </Text>
              <Text style={groupFilterStyles.emptyText}>
                Prueba con otro nombre o borra la búsqueda para verlos todos.
              </Text>
            </View>
          )}
          renderItem={({ item }) => (
            <GroupFilterRow
              group={item}
              onPress={() => selectGroup(item.id)}
              restaurantCount={groupRestaurantCounts.get(item.id) ?? 0}
              selected={selectedGroupId === item.id}
            />
          )}
          showsVerticalScrollIndicator={false}
          style={groupFilterStyles.list}
        />
      </BottomModal>

      <BottomModal
        onClose={() => setMembershipModalVisible(false)}
        subtitle={membershipModalSubtitle}
        title={membershipModalTitle}
        visible={membershipModalVisible}
      >
        <View style={styles.groupsList}>
          {selectedRestaurant?.memberships.map(membership => {
            const presentation = STATUS_PRESENTATION[membership.status];
            const membershipGroup = groupsById.get(membership.groupId) ?? null;

            return (
              <Pressable
                key={membership.groupId}
                accessibilityRole="button"
                onPress={() => {
                  if (membershipModalMode === 'RESTAURANT') {
                    openRestaurantMembership(membership);
                  } else {
                    openGroup(membership.groupId);
                  }
                }}
                style={({ pressed }) => [
                  styles.groupRow,
                  pressed ? styles.groupRowPressed : null,
                ]}
              >
                <GroupThumbnail group={membershipGroup} variant="membership" />
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
                    style={[
                      styles.groupRowStatus,
                      { color: presentation.textColor },
                    ]}
                  >
                    {presentation.label} en este grupo
                  </Text>
                </View>
                <SymbolView
                  name={{
                    android: 'chevron_right',
                    ios: 'chevron.right',
                    web: 'chevron_right',
                  }}
                  size={18}
                  tintColor={colors.muted}
                />
              </Pressable>
            );
          })}
        </View>
      </BottomModal>
    </SafeAreaView>
  );
}
