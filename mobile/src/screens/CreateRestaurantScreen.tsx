import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import {
  router,
  useLocalSearchParams,
} from 'expo-router';
import type { ComponentProps } from 'react';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import MapView, {
  Marker,
  PROVIDER_GOOGLE,
} from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FormField } from '../components/FormField';
import { PrimaryButton } from '../components/PrimaryButton';
import { RestaurantSearchResultCard } from '../components/RestaurantSearchResultCard';
import { useAuth } from '../contexts/auth-context';
import {
  getErrorMessage,
  resolveApiUrl,
} from '../lib/api';
import { getGroup } from '../services/group-service';
import {
  createGroupRestaurant,
  searchRestaurantLocations,
  searchRestaurants,
  uploadRestaurantImage,
} from '../services/restaurant-service';
import { addRestaurantStyles as styles } from '../styles/add-restaurant-screen.styles';
import { colors } from '../theme/colors';
import type { RestaurantGroup } from '../types/group';
import type {
  GroupRestaurant,
  RestaurantLocationResult,
  RestaurantSearchResult,
} from '../types/restaurant';

type CreationMode = 'SEARCH' | 'MANUAL';
type MaterialIconName = ComponentProps<typeof MaterialIcons>['name'];

type Coordinates = {
  latitude: number;
  longitude: number;
};

const DEFAULT_PICKER_COORDINATE: Coordinates = {
  latitude: 41.9794,
  longitude: 2.8214,
};

const MAXIMUM_IMAGE_SIZE = 5 * 1024 * 1024;

function LocationPickerModal({
  coordinate,
  onChange,
  onClose,
  onConfirm,
  visible,
}: {
  coordinate: Coordinates;
  onChange: (coordinate: Coordinates) => void;
  onClose: () => void;
  onConfirm: () => void;
  visible: boolean;
}) {
  return (
    <Modal
      animationType="slide"
      onRequestClose={onClose}
      presentationStyle="fullScreen"
      visible={visible}
    >
      <SafeAreaView
        edges={['top', 'right', 'bottom', 'left']}
        style={styles.pickerSafeArea}
      >
        <View style={styles.pickerContainer}>
          <View style={styles.pickerHeader}>
            <Pressable
              accessibilityLabel="Cerrar mapa"
              accessibilityRole="button"
              onPress={onClose}
              style={({ pressed }) => [
                styles.pickerHeaderButton,
                pressed ? styles.pressed : null,
              ]}
            >
              <MaterialIcons
                color={colors.text}
                name="close"
                size={21}
              />
            </Pressable>
            <Text style={styles.pickerHeaderTitle}>
              Ajustar ubicación
            </Text>
            <View style={styles.pickerHeaderSpacer} />
          </View>

          {visible ? (
            <MapView
              initialRegion={{
                ...coordinate,
                latitudeDelta: 0.012,
                longitudeDelta: 0.012,
              }}
              onPress={(event) => onChange(event.nativeEvent.coordinate)}
              provider={
                Platform.OS === 'android'
                  ? PROVIDER_GOOGLE
                  : undefined
              }
              style={styles.pickerMap}
            >
              <Marker
                coordinate={coordinate}
                draggable
                onDragEnd={(event) => onChange(event.nativeEvent.coordinate)}
              />
            </MapView>
          ) : null}

          <View style={styles.pickerPanel}>
            <View style={styles.pickerPanelHandle} />
            <Text style={styles.pickerPanelTitle}>
              Coloca el pin en el restaurante
            </Text>
            <Text style={styles.pickerPanelText}>
              Toca el mapa o arrastra el marcador hasta la ubicación exacta.
            </Text>
            <Text style={styles.pickerCoordinates}>
              {coordinate.latitude.toFixed(6)}, {coordinate.longitude.toFixed(6)}
            </Text>
            <PrimaryButton
              compact
              onPress={onConfirm}
              title="Confirmar ubicación"
            />
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

function StepHeader({
  icon,
  step,
  subtitle,
  title,
}: {
  icon: MaterialIconName;
  step?: number;
  subtitle: string;
  title: string;
}) {
  return (
    <View style={styles.sectionHeading}>
      <View style={styles.sectionIcon}>
        <MaterialIcons
          color={colors.primary}
          name={icon}
          size={19}
        />
      </View>
      <View style={styles.sectionHeadingCopy}>
        <Text style={styles.sectionTitle}>
          {step ? `${step}. ` : ''}{title}
        </Text>
        <Text style={styles.sectionDescription}>
          {subtitle}
        </Text>
      </View>
    </View>
  );
}

function LocationAction({
  disabled = false,
  icon,
  loading = false,
  onPress,
  title,
}: {
  disabled?: boolean;
  icon: MaterialIconName;
  loading?: boolean;
  onPress: () => void;
  title: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.locationAction,
        disabled || loading
          ? styles.locationActionDisabled
          : null,
        pressed && !disabled && !loading
          ? styles.locationActionPressed
          : null,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={colors.primary}
          size="small"
        />
      ) : (
        <MaterialIcons
          color={colors.primary}
          name={icon}
          size={17}
        />
      )}
      <Text numberOfLines={1} style={styles.locationActionText}>
        {title}
      </Text>
    </Pressable>
  );
}

function PhotoPicker({
  imageUri,
  onPress,
}: {
  imageUri: string | null;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityHint="Abre las opciones para elegir o hacer una foto"
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.photoPicker,
        pressed ? styles.photoPickerPressed : null,
      ]}
    >
      <View style={styles.photoPreview}>
        {imageUri ? (
          <Image
            resizeMode="cover"
            source={{ uri: imageUri }}
            style={styles.photoImage}
          />
        ) : (
          <MaterialIcons
            color={colors.primary}
            name="add-a-photo"
            size={24}
          />
        )}
      </View>
      <View style={styles.photoCopy}>
        <Text style={styles.photoTitle}>
          Foto de portada
        </Text>
        <Text style={styles.photoSubtitle}>
          {imageUri
            ? 'Toca para cambiarla o eliminarla.'
            : 'Opcional · Se verá en tarjetas y en el mapa.'}
        </Text>
      </View>
      <View style={styles.photoAction}>
        <Text style={styles.photoActionText}>
          {imageUri ? 'Cambiar' : 'Añadir'}
        </Text>
      </View>
    </Pressable>
  );
}

export default function CreateRestaurantScreen() {
  const {
    groupId,
    mode: modeParam,
  } = useLocalSearchParams<{
    groupId: string;
    mode?: string;
  }>();
  const { accessToken } = useAuth();

  const [creationMode, setCreationMode] =
    useState<CreationMode>(
      modeParam === 'MANUAL' ? 'MANUAL' : 'SEARCH',
    );
  const [group, setGroup] = useState<RestaurantGroup | null>(null);
  const [isGroupLoading, setIsGroupLoading] = useState(true);
  const [groupLoadError, setGroupLoadError] =
    useState<string | null>(null);
  const [groupImageFailed, setGroupImageFailed] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchCity, setSearchCity] = useState('');
  const [searchResults, setSearchResults] =
    useState<RestaurantSearchResult[]>([]);
  const [selectedResult, setSelectedResult] =
    useState<RestaurantSearchResult | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] =
    useState<string | null>(null);

  const [manualName, setManualName] = useState('');
  const [manualAddress, setManualAddress] = useState('');
  const [manualCity, setManualCity] = useState('');
  const [manualCountry, setManualCountry] = useState('');
  const [manualCategory, setManualCategory] = useState('');

  const [locationResults, setLocationResults] =
    useState<RestaurantLocationResult[]>([]);
  const [selectedLocation, setSelectedLocation] =
    useState<RestaurantLocationResult | null>(null);
  const [isLocationSearching, setIsLocationSearching] =
    useState(false);
  const [isUsingCurrentLocation, setIsUsingCurrentLocation] =
    useState(false);
  const [locationError, setLocationError] =
    useState<string | null>(null);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [pickerCoordinate, setPickerCoordinate] =
    useState<Coordinates>(DEFAULT_PICKER_COORDINATE);

  const [selectedImage, setSelectedImage] =
    useState<ImagePicker.ImagePickerAsset | null>(null);
  const [groupNotes, setGroupNotes] = useState('');
  const [requestError, setRequestError] =
    useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadSelectedGroup() {
      if (!accessToken || !groupId) {
        if (active) {
          setGroupLoadError(
            'No se ha podido recuperar el grupo seleccionado.',
          );
          setIsGroupLoading(false);
        }
        return;
      }

      try {
        setIsGroupLoading(true);
        setGroupLoadError(null);
        const selectedGroup = await getGroup(groupId, accessToken);

        if (active) {
          setGroup(selectedGroup);
          setGroupImageFailed(false);
        }
      } catch (error) {
        if (active) {
          setGroupLoadError(getErrorMessage(error));
        }
      } finally {
        if (active) {
          setIsGroupLoading(false);
        }
      }
    }

    void loadSelectedGroup();

    return () => {
      active = false;
    };
  }, [accessToken, groupId]);

  function changeCreationMode(mode: CreationMode) {
    setCreationMode(mode);
    setRequestError(null);
  }

  function openManualModeFromSearch() {
    setManualName(current => current || searchQuery.trim());
    setManualCity(current => current || searchCity.trim());
    changeCreationMode('MANUAL');
  }

  function invalidateManualLocation() {
    setSelectedLocation(null);
    setLocationResults([]);
    setLocationError(null);
    setRequestError(null);
  }

  function validateImage(
    asset: ImagePicker.ImagePickerAsset,
  ): boolean {
    if (asset.fileSize && asset.fileSize > MAXIMUM_IMAGE_SIZE) {
      Alert.alert(
        'Imagen demasiado grande',
        'La foto no puede superar los 5 MB.',
      );
      return false;
    }
    return true;
  }

  async function selectPhotoFromGallery(): Promise<void> {
    const permission = await ImagePicker
      .requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        'Permiso necesario',
        'Mesa necesita acceder a tus fotos para elegir una portada.',
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.78,
    });

    if (
      !result.canceled
      && result.assets.length > 0
      && validateImage(result.assets[0])
    ) {
      setSelectedImage(result.assets[0]);
    }
  }

  async function takePhoto(): Promise<void> {
    const permission = await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        'Permiso necesario',
        'Mesa necesita acceder a la cámara para hacer una foto.',
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.78,
    });

    if (
      !result.canceled
      && result.assets.length > 0
      && validateImage(result.assets[0])
    ) {
      setSelectedImage(result.assets[0]);
    }
  }

  function openPhotoOptions(): void {
    Alert.alert(
      'Foto de portada',
      'Elige cómo quieres añadirla.',
      [
        {
          text: 'Elegir de la galería',
          onPress: () => void selectPhotoFromGallery(),
        },
        {
          text: 'Hacer una foto',
          onPress: () => void takePhoto(),
        },
        ...(selectedImage
          ? [{
              text: 'Eliminar foto',
              style: 'destructive' as const,
              onPress: () => setSelectedImage(null),
            }]
          : []),
        { text: 'Cancelar', style: 'cancel' as const },
      ],
    );
  }

  async function handleSearch() {
    setSearchError(null);
    setRequestError(null);
    setSelectedResult(null);
    setSearchResults([]);

    const normalizedQuery = searchQuery.trim();

    if (normalizedQuery.length < 2) {
      setSearchError(
        'Introduce al menos dos caracteres para buscar.',
      );
      return;
    }

    if (!accessToken) {
      setSearchError('No se ha podido recuperar tu sesión.');
      return;
    }

    try {
      setIsSearching(true);
      setHasSearched(true);
      setSearchResults(
        await searchRestaurants(
          normalizedQuery,
          searchCity,
          accessToken,
        ),
      );
    } catch (error) {
      setSearchError(getErrorMessage(error));
    } finally {
      setIsSearching(false);
    }
  }

  async function handleLocationSearch() {
    setLocationError(null);
    setRequestError(null);
    setLocationResults([]);
    setSelectedLocation(null);

    if (!accessToken) {
      setLocationError('No se ha podido recuperar tu sesión.');
      return;
    }

    if (!manualAddress.trim() && !manualCity.trim()) {
      setLocationError(
        'Introduce una dirección o una ciudad para buscarla.',
      );
      return;
    }

    try {
      setIsLocationSearching(true);
      const results = await searchRestaurantLocations(
        manualAddress,
        manualCity,
        manualCountry,
        accessToken,
      );
      setLocationResults(results);

      if (results.length === 0) {
        setLocationError(
          'No hemos encontrado esa ubicación. Puedes colocar el pin manualmente.',
        );
      }
    } catch (error) {
      setLocationError(getErrorMessage(error));
    } finally {
      setIsLocationSearching(false);
    }
  }

  function selectManualLocation(
    locationResult: RestaurantLocationResult,
  ) {
    setSelectedLocation(locationResult);
    setPickerCoordinate({
      latitude: locationResult.latitude,
      longitude: locationResult.longitude,
    });
    setLocationResults([]);
    setLocationError(null);
    setRequestError(null);
    setManualAddress(current =>
      current.trim() ? current : locationResult.address ?? '',
    );
    setManualCity(current =>
      current.trim() ? current : locationResult.city ?? '',
    );
    setManualCountry(current =>
      current.trim() ? current : locationResult.country ?? '',
    );
  }

  async function enrichAddressFromCoordinate(
    coordinate: Coordinates,
  ) {
    try {
      const [place] = await Location.reverseGeocodeAsync(coordinate);
      if (!place) {
        return;
      }

      const resolvedAddress = [place.street, place.streetNumber]
        .filter(Boolean)
        .join(', ');

      setManualAddress(current => current.trim()
        ? current
        : resolvedAddress);
      setManualCity(current => current.trim()
        ? current
        : place.city ?? place.subregion ?? '');
      setManualCountry(current => current.trim()
        ? current
        : place.country ?? '');
    } catch {
      // El punto sigue siendo válido aunque no pueda resolverse su dirección.
    }
  }

  async function useCurrentLocation() {
    setLocationError(null);
    setRequestError(null);

    try {
      setIsUsingCurrentLocation(true);
      const permission =
        await Location.requestForegroundPermissionsAsync();

      if (permission.status !== 'granted') {
        setLocationError(
          'Necesitamos permiso de ubicación para usar tu posición actual.',
        );
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const coordinate = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };

      setSelectedLocation({
        label: 'Ubicación actual',
        address: manualAddress.trim() || null,
        city: manualCity.trim() || null,
        country: manualCountry.trim() || null,
        ...coordinate,
      });
      setLocationResults([]);
      setPickerCoordinate(coordinate);
      await enrichAddressFromCoordinate(coordinate);
    } catch (error) {
      setLocationError(getErrorMessage(error));
    } finally {
      setIsUsingCurrentLocation(false);
    }
  }

  async function openMapPicker() {
    let coordinate = selectedLocation
      ? {
          latitude: selectedLocation.latitude,
          longitude: selectedLocation.longitude,
        }
      : DEFAULT_PICKER_COORDINATE;

    if (!selectedLocation) {
      try {
        const permission =
          await Location.getForegroundPermissionsAsync();
        if (permission.status === 'granted') {
          const lastPosition =
            await Location.getLastKnownPositionAsync();
          if (lastPosition) {
            coordinate = {
              latitude: lastPosition.coords.latitude,
              longitude: lastPosition.coords.longitude,
            };
          }
        }
      } catch {
        // El mapa puede abrirse con la región por defecto.
      }
    }

    setPickerCoordinate(coordinate);
    setPickerVisible(true);
  }

  function confirmPickerLocation() {
    setSelectedLocation({
      label: 'Punto elegido en el mapa',
      address: manualAddress.trim() || null,
      city: manualCity.trim() || null,
      country: manualCountry.trim() || null,
      ...pickerCoordinate,
    });
    setLocationResults([]);
    setLocationError(null);
    setRequestError(null);
    setPickerVisible(false);
    void enrichAddressFromCoordinate(pickerCoordinate);
  }

  async function uploadSelectedImage(
    createdRestaurant: GroupRestaurant,
  ): Promise<void> {
    if (!selectedImage || !accessToken || !groupId) {
      return;
    }

    try {
      await uploadRestaurantImage(
        groupId,
        createdRestaurant.id,
        { uri: selectedImage.uri },
        accessToken,
      );
    } catch (error) {
      Alert.alert(
        'Restaurante guardado',
        `Se ha creado correctamente, pero no hemos podido subir la foto. ${getErrorMessage(error)}`,
      );
    }
  }

  async function handleSaveRestaurant() {
    setRequestError(null);

    if (!accessToken || !groupId) {
      setRequestError(
        'No se ha podido recuperar tu sesión o el grupo.',
      );
      return;
    }

    if (creationMode === 'SEARCH' && !selectedResult) {
      setRequestError(
        'Selecciona uno de los restaurantes encontrados.',
      );
      return;
    }

    if (creationMode === 'MANUAL' && !manualName.trim()) {
      setRequestError('Introduce el nombre del restaurante.');
      return;
    }

    if (creationMode === 'MANUAL' && !selectedLocation) {
      setRequestError(
        'Confirma la ubicación del restaurante para que aparezca en el mapa.',
      );
      return;
    }

    try {
      setIsSubmitting(true);
      let createdRestaurant: GroupRestaurant;

      if (creationMode === 'SEARCH' && selectedResult) {
        createdRestaurant = await createGroupRestaurant(
          groupId,
          {
            provider: selectedResult.provider,
            externalPlaceId: selectedResult.externalPlaceId,
            name: selectedResult.name,
            address: selectedResult.address,
            city: selectedResult.city,
            country: selectedResult.country,
            latitude: selectedResult.latitude,
            longitude: selectedResult.longitude,
            category: selectedResult.category,
            groupNotes: groupNotes.trim() || null,
          },
          accessToken,
        );
      } else {
        createdRestaurant = await createGroupRestaurant(
          groupId,
          {
            provider: null,
            externalPlaceId: null,
            name: manualName.trim(),
            address: manualAddress.trim() || null,
            city: manualCity.trim() || null,
            country: manualCountry.trim() || null,
            latitude: selectedLocation!.latitude,
            longitude: selectedLocation!.longitude,
            category: manualCategory.trim() || null,
            groupNotes: groupNotes.trim() || null,
          },
          accessToken,
        );
      }

      await uploadSelectedImage(createdRestaurant);
      router.replace({
        pathname: '/groups/[groupId]',
        params: { groupId },
      });
    } catch (error) {
      setRequestError(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  const saveDisabled = creationMode === 'SEARCH'
    ? selectedResult === null
    : !manualName.trim() || selectedLocation === null;
  const showFooter = creationMode === 'MANUAL'
    || selectedResult !== null;
  const locationSearchDisabled =
    !manualAddress.trim() && !manualCity.trim();
  const groupImageUrl = group?.imageUrl && !groupImageFailed
    ? resolveApiUrl(group.imageUrl)
    : null;
  const selectedImageUri = selectedImage?.uri ?? null;

  return (
    <SafeAreaView
      edges={['top', 'right', 'left']}
      style={styles.safeArea}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={[
            styles.content,
            showFooter ? styles.contentWithFooter : null,
          ]}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Pressable
              accessibilityLabel="Cerrar"
              accessibilityRole="button"
              onPress={() => router.back()}
              style={({ pressed }) => [
                styles.headerButton,
                pressed ? styles.pressed : null,
              ]}
            >
              <MaterialIcons
                color={colors.text}
                name="close"
                size={21}
              />
            </Pressable>
            <Text style={styles.headerTitle}>
              Añadir restaurante
            </Text>
            <View style={styles.headerSpacer} />
          </View>

          <Pressable
            accessibilityHint="Vuelve a la selección de grupo"
            accessibilityRole="button"
            onPress={() => router.back()}
            style={({ pressed }) => [
              styles.groupCard,
              pressed ? styles.pressed : null,
            ]}
          >
            {groupImageUrl ? (
              <View style={styles.groupThumbnail}>
                <Image
                  onError={() => setGroupImageFailed(true)}
                  resizeMode="cover"
                  source={{ uri: groupImageUrl }}
                  style={styles.groupImage}
                />
              </View>
            ) : (
              <View style={styles.groupFallback}>
                <MaterialIcons
                  color="#66834A"
                  name="group"
                  size={21}
                />
              </View>
            )}
            <View style={styles.groupCopy}>
              <Text style={styles.groupEyebrow}>
                Se guardará en
              </Text>
              {isGroupLoading ? (
                <ActivityIndicator
                  color={colors.primary}
                  size="small"
                />
              ) : (
                <Text numberOfLines={1} style={styles.groupName}>
                  {group?.name
                    ?? groupLoadError
                    ?? 'Grupo seleccionado'}
                </Text>
              )}
            </View>
            <MaterialIcons
              color={colors.muted}
              name="chevron-right"
              size={21}
            />
          </Pressable>

          <View style={styles.heading}>
            <Text style={styles.title}>
              ¿Qué sitio queréis probar?
            </Text>
            <Text style={styles.subtitle}>
              Busca un restaurante real o añádelo manualmente si todavía no aparece.
            </Text>
          </View>

          <View style={styles.modeSelector}>
            {(['SEARCH', 'MANUAL'] as const).map(mode => (
              <Pressable
                accessibilityRole="tab"
                accessibilityState={{ selected: creationMode === mode }}
                key={mode}
                onPress={() => changeCreationMode(mode)}
                style={[
                  styles.modeButton,
                  creationMode === mode
                    ? styles.activeModeButton
                    : null,
                ]}
              >
                <Text
                  style={[
                    styles.modeButtonText,
                    creationMode === mode
                      ? styles.activeModeButtonText
                      : null,
                  ]}
                >
                  {mode === 'SEARCH' ? 'Buscar' : 'Manual'}
                </Text>
              </Pressable>
            ))}
          </View>

          {creationMode === 'SEARCH' ? (
            <View style={styles.section}>
              <View style={styles.sectionCard}>
                <StepHeader
                  icon="search"
                  subtitle="La ciudad es opcional, pero ayuda a afinar."
                  title="Busca el restaurante"
                />
                <FormField
                  compact
                  autoCapitalize="words"
                  autoCorrect={false}
                  label="Nombre del restaurante"
                  maxLength={150}
                  onChangeText={(value) => {
                    setSearchQuery(value);
                    setSelectedResult(null);
                  }}
                  onSubmitEditing={() => void handleSearch()}
                  placeholder="Ej. Kaizen Sushi"
                  returnKeyType="search"
                  rightAccessory={(
                    <MaterialIcons
                      color={colors.primary}
                      name="search"
                      size={20}
                    />
                  )}
                  value={searchQuery}
                />
                <FormField
                  compact
                  autoCapitalize="words"
                  label="Ciudad"
                  maxLength={100}
                  onChangeText={(value) => {
                    setSearchCity(value);
                    setSelectedResult(null);
                  }}
                  onSubmitEditing={() => void handleSearch()}
                  placeholder="Ej. Palma (opcional)"
                  returnKeyType="search"
                  rightAccessory={(
                    <MaterialIcons
                      color={colors.primary}
                      name="my-location"
                      size={19}
                    />
                  )}
                  value={searchCity}
                />
                {searchError ? (
                  <View style={styles.inlineError}>
                    <MaterialIcons
                      color={colors.danger}
                      name="error-outline"
                      size={18}
                    />
                    <Text style={styles.inlineErrorText}>
                      {searchError}
                    </Text>
                  </View>
                ) : null}
                <PrimaryButton
                  compact
                  disabled={searchQuery.trim().length < 2}
                  loading={isSearching}
                  onPress={handleSearch}
                  title="Buscar restaurantes"
                />
              </View>

              {hasSearched
              && !isSearching
              && !searchError
              && searchResults.length === 0 ? (
                <View style={styles.emptySearch}>
                  <MaterialIcons
                    color={colors.primary}
                    name="search-off"
                    size={24}
                  />
                  <View style={styles.emptySearchCopy}>
                    <Text style={styles.emptyTitle}>
                      No encontramos resultados
                    </Text>
                    <Text style={styles.emptyText}>
                      Prueba con otro nombre o créalo manualmente.
                    </Text>
                  </View>
                </View>
              ) : null}

              {searchResults.length > 0 ? (
                <View style={styles.resultsSection}>
                  <View style={styles.resultsHeader}>
                    <Text style={styles.resultsTitle}>
                      Resultados
                    </Text>
                    <Text style={styles.resultsCount}>
                      {searchResults.length}
                    </Text>
                  </View>
                  <View style={styles.resultsList}>
                    {searchResults.map(result => (
                      <RestaurantSearchResultCard
                        key={`${result.provider}-${result.externalPlaceId}`}
                        onPress={() => {
                          setSelectedResult(result);
                          setRequestError(null);
                        }}
                        result={result}
                        selected={
                          selectedResult?.provider === result.provider
                          && selectedResult?.externalPlaceId
                            === result.externalPlaceId
                        }
                      />
                    ))}
                  </View>
                  <Pressable
                    accessibilityRole="link"
                    onPress={() => void Linking.openURL(
                      'https://www.openstreetmap.org/copyright',
                    )}
                  >
                    <Text style={styles.attribution}>
                      Datos © colaboradores de OpenStreetMap
                    </Text>
                  </Pressable>
                </View>
              ) : null}

              <View style={styles.manualShortcut}>
                <MaterialIcons
                  color={colors.primary}
                  name="help-outline"
                  size={21}
                />
                <View style={styles.manualShortcutContent}>
                  <Text style={styles.manualShortcutTitle}>
                    ¿No aparece?
                  </Text>
                  <Text style={styles.manualShortcutText}>
                    Añádelo con tus propios datos.
                  </Text>
                </View>
                <Pressable
                  accessibilityRole="button"
                  onPress={openManualModeFromSearch}
                  style={styles.manualShortcutButton}
                >
                  <Text style={styles.manualShortcutButtonText}>
                    Añadir manual
                  </Text>
                </Pressable>
              </View>

              {selectedResult ? (
                <View style={styles.afterSelection}>
                  <View style={styles.selectedSummary}>
                    <MaterialIcons
                      color="#557547"
                      name="check-circle"
                      size={21}
                    />
                    <View style={styles.selectedSummaryCopy}>
                      <Text style={styles.selectedSummaryEyebrow}>
                        Restaurante seleccionado
                      </Text>
                      <Text numberOfLines={1} style={styles.selectedSummaryName}>
                        {selectedResult.name}
                      </Text>
                    </View>
                  </View>
                  <PhotoPicker
                    imageUri={selectedImageUri}
                    onPress={openPhotoOptions}
                  />
                  <View style={styles.notesCard}>
                    <StepHeader
                      icon="groups"
                      subtitle="Solo la verán las personas de este grupo."
                      title="Notas del grupo"
                    />
                    <FormField
                      compact
                      label="Notas opcionales"
                      maxLength={1000}
                      multiline
                      onChangeText={setGroupNotes}
                      placeholder="Nos lo han recomendado"
                      style={styles.notesInput}
                      textAlignVertical="top"
                      value={groupNotes}
                    />
                  </View>
                </View>
              ) : null}
            </View>
          ) : (
            <View style={styles.section}>
              <View style={styles.sectionCard}>
                <StepHeader
                  icon="edit"
                  step={1}
                  subtitle="Solo el nombre es obligatorio en este bloque."
                  title="Datos básicos"
                />
                <PhotoPicker
                  imageUri={selectedImageUri}
                  onPress={openPhotoOptions}
                />
                <FormField
                  compact
                  autoCapitalize="words"
                  label="Nombre del restaurante"
                  maxLength={150}
                  onChangeText={(value) => {
                    setManualName(value);
                    setRequestError(null);
                  }}
                  placeholder="Ej. Kaizen Sushi"
                  value={manualName}
                />
                <FormField
                  compact
                  autoCapitalize="words"
                  label="Categoría (opcional)"
                  maxLength={100}
                  onChangeText={setManualCategory}
                  placeholder="Japonesa, cafetería, brunch…"
                  value={manualCategory}
                />
              </View>

              <View style={styles.locationCard}>
                <StepHeader
                  icon="location-on"
                  step={2}
                  subtitle="Confirma el punto para que aparezca en Mapa."
                  title="Ubicación"
                />
                <FormField
                  compact
                  autoCapitalize="sentences"
                  label="Dirección"
                  maxLength={300}
                  onChangeText={(value) => {
                    setManualAddress(value);
                    invalidateManualLocation();
                  }}
                  placeholder="Calle, número, etc."
                  value={manualAddress}
                />
                <View style={styles.inlineFields}>
                  <View style={styles.inlineField}>
                    <FormField
                      compact
                      autoCapitalize="words"
                      label="Ciudad"
                      maxLength={100}
                      onChangeText={(value) => {
                        setManualCity(value);
                        invalidateManualLocation();
                      }}
                      placeholder="Ej. Palma"
                      value={manualCity}
                    />
                  </View>
                  <View style={styles.inlineField}>
                    <FormField
                      compact
                      autoCapitalize="words"
                      label="País"
                      maxLength={100}
                      onChangeText={(value) => {
                        setManualCountry(value);
                        invalidateManualLocation();
                      }}
                      placeholder="España"
                      value={manualCountry}
                    />
                  </View>
                </View>

                {selectedLocation ? (
                  <View style={styles.mapPreviewCard}>
                    <MapView
                      key={`${selectedLocation.latitude}:${selectedLocation.longitude}`}
                      initialRegion={{
                        latitude: selectedLocation.latitude,
                        longitude: selectedLocation.longitude,
                        latitudeDelta: 0.008,
                        longitudeDelta: 0.008,
                      }}
                      pointerEvents="none"
                      provider={
                        Platform.OS === 'android'
                          ? PROVIDER_GOOGLE
                          : undefined
                      }
                      style={styles.mapPreview}
                    >
                      <Marker
                        coordinate={{
                          latitude: selectedLocation.latitude,
                          longitude: selectedLocation.longitude,
                        }}
                      />
                    </MapView>
                    <View style={styles.mapConfirmed}>
                      <MaterialIcons
                        color="#557547"
                        name="check-circle"
                        size={18}
                      />
                      <Text numberOfLines={2} style={styles.mapConfirmedText}>
                        Ubicación confirmada · {selectedLocation.label}
                      </Text>
                    </View>
                  </View>
                ) : (
                  <View style={styles.locationEmpty}>
                    <Text style={styles.locationEmptyTitle}>
                      Todavía falta confirmar la ubicación
                    </Text>
                    <Text style={styles.locationEmptyText}>
                      Busca la dirección, usa tu posición o coloca el pin.
                    </Text>
                  </View>
                )}

                <View style={styles.locationActions}>
                  <LocationAction
                    disabled={locationSearchDisabled}
                    icon="search"
                    loading={isLocationSearching}
                    onPress={() => void handleLocationSearch()}
                    title="Buscar dirección"
                  />
                  <LocationAction
                    icon="my-location"
                    loading={isUsingCurrentLocation}
                    onPress={() => void useCurrentLocation()}
                    title="Mi ubicación"
                  />
                  <LocationAction
                    icon="map"
                    onPress={() => void openMapPicker()}
                    title="Elegir en mapa"
                  />
                </View>

                {locationError ? (
                  <View style={styles.inlineError}>
                    <MaterialIcons
                      color={colors.danger}
                      name="error-outline"
                      size={18}
                    />
                    <Text style={styles.inlineErrorText}>
                      {locationError}
                    </Text>
                  </View>
                ) : null}

                {locationResults.length > 0 ? (
                  <View style={styles.locationResults}>
                    <Text style={styles.locationResultsTitle}>
                      Elige la ubicación correcta
                    </Text>
                    {locationResults.map(result => (
                      <Pressable
                        accessibilityRole="button"
                        key={`${result.latitude}-${result.longitude}`}
                        onPress={() => selectManualLocation(result)}
                        style={styles.locationResultCard}
                      >
                        <MaterialIcons
                          color={colors.primary}
                          name="location-on"
                          size={19}
                        />
                        <Text
                          numberOfLines={2}
                          style={styles.locationResultLabel}
                        >
                          {result.label}
                        </Text>
                        <MaterialIcons
                          color={colors.muted}
                          name="chevron-right"
                          size={19}
                        />
                      </Pressable>
                    ))}
                    <Pressable
                      accessibilityRole="link"
                      onPress={() => void Linking.openURL(
                        'https://www.openstreetmap.org/copyright',
                      )}
                    >
                      <Text style={styles.attribution}>
                        Datos © colaboradores de OpenStreetMap
                      </Text>
                    </Pressable>
                  </View>
                ) : null}
              </View>

              <View style={styles.notesCard}>
                <StepHeader
                  icon="groups"
                  step={3}
                  subtitle="Estas notas solo pertenecen a este grupo."
                  title="Notas del grupo"
                />
                <FormField
                  compact
                  label="Notas opcionales"
                  maxLength={1000}
                  multiline
                  onChangeText={setGroupNotes}
                  placeholder="Nos lo han recomendado"
                  style={styles.notesInput}
                  textAlignVertical="top"
                  value={groupNotes}
                />
              </View>
            </View>
          )}

          {requestError ? (
            <View style={styles.requestErrorCard}>
              <MaterialIcons
                color={colors.danger}
                name="warning"
                size={19}
              />
              <Text style={styles.requestErrorText}>
                {requestError}
              </Text>
            </View>
          ) : null}
        </ScrollView>

        {showFooter ? (
          <View style={styles.stickyFooter}>
            <PrimaryButton
              compact
              disabled={saveDisabled}
              loading={isSubmitting}
              onPress={handleSaveRestaurant}
              title="Guardar restaurante"
            />
          </View>
        ) : null}
      </KeyboardAvoidingView>

      <LocationPickerModal
        coordinate={pickerCoordinate}
        onChange={setPickerCoordinate}
        onClose={() => setPickerVisible(false)}
        onConfirm={confirmPickerLocation}
        visible={pickerVisible}
      />
    </SafeAreaView>
  );
}
