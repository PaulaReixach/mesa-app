import { MaterialIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import {
  router,
  useLocalSearchParams,
} from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
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
} from '../services/restaurant-service';
import { addRestaurantStyles as styles } from '../styles/add-restaurant-screen.styles';
import { colors } from '../theme/colors';
import type { RestaurantGroup } from '../types/group';
import type {
  RestaurantLocationResult,
  RestaurantSearchResult,
} from '../types/restaurant';

type CreationMode = 'SEARCH' | 'MANUAL';

type Coordinates = {
  latitude: number;
  longitude: number;
};

const DEFAULT_PICKER_COORDINATE: Coordinates = {
  latitude: 41.9794,
  longitude: 2.8214,
};

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
              onPress={(event) => {
                onChange(event.nativeEvent.coordinate);
              }}
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
                onDragEnd={(event) => {
                  onChange(event.nativeEvent.coordinate);
                }}
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
  icon: React.ComponentProps<typeof MaterialIcons>['name'];
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
  icon: React.ComponentProps<typeof MaterialIcons>['name'];
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
      <Text
        numberOfLines={1}
        style={styles.locationActionText}
      >
        {title}
      </Text>
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

  const initialMode: CreationMode =
    modeParam === 'MANUAL' ? 'MANUAL' : 'SEARCH';

  const [creationMode, setCreationMode] =
    useState<CreationMode>(initialMode);

  const [group, setGroup] =
    useState<RestaurantGroup | null>(null);
  const [isGroupLoading, setIsGroupLoading] =
    useState(true);
  const [groupLoadError, setGroupLoadError] =
    useState<string | null>(null);
  const [groupImageFailed, setGroupImageFailed] =
    useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchCity, setSearchCity] = useState('');
  const [searchResults, setSearchResults] = useState<
    RestaurantSearchResult[]
  >([]);
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

  const [locationResults, setLocationResults] = useState<
    RestaurantLocationResult[]
  >([]);
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

  const [groupNotes, setGroupNotes] = useState('');
  const [requestError, setRequestError] =
    useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] =
    useState(false);

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

        const selectedGroup = await getGroup(
          groupId,
          accessToken,
        );

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
    setManualName((currentName) =>
      currentName || searchQuery.trim()
    );
    setManualCity((currentCity) =>
      currentCity || searchCity.trim()
    );
    changeCreationMode('MANUAL');
  }

  function updateSearchQuery(value: string) {
    setSearchQuery(value);
    setSelectedResult(null);
    setRequestError(null);
  }

  function updateSearchCity(value: string) {
    setSearchCity(value);
    setSelectedResult(null);
    setRequestError(null);
  }

  function selectRestaurant(result: RestaurantSearchResult) {
    setSelectedResult(result);
    setRequestError(null);
  }

  function invalidateManualLocation() {
    setSelectedLocation(null);
    setLocationResults([]);
    setLocationError(null);
    setRequestError(null);
  }

  function updateManualAddress(value: string) {
    setManualAddress(value);
    invalidateManualLocation();
  }

  function updateManualCity(value: string) {
    setManualCity(value);
    invalidateManualLocation();
  }

  function updateManualCountry(value: string) {
    setManualCountry(value);
    invalidateManualLocation();
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
      setSearchError(
        'No se ha podido recuperar tu sesión.',
      );
      return;
    }

    try {
      setIsSearching(true);
      setHasSearched(true);

      const results = await searchRestaurants(
        normalizedQuery,
        searchCity,
        accessToken,
      );

      setSearchResults(results);
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
      setLocationError(
        'No se ha podido recuperar tu sesión.',
      );
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
    setLocationError(null);
    setRequestError(null);

    setManualAddress((currentAddress) =>
      currentAddress.trim()
        ? currentAddress
        : locationResult.address ?? ''
    );
    setManualCity((currentCity) =>
      currentCity.trim()
        ? currentCity
        : locationResult.city ?? ''
    );
    setManualCountry((currentCountry) =>
      currentCountry.trim()
        ? currentCountry
        : locationResult.country ?? ''
    );
  }

  async function enrichAddressFromCoordinate(
    coordinate: Coordinates,
  ) {
    try {
      const [place] = await Location.reverseGeocodeAsync(
        coordinate,
      );

      if (!place) {
        return;
      }

      const resolvedAddress = [
        place.street,
        place.streetNumber,
      ]
        .filter(Boolean)
        .join(', ');

      setManualAddress((currentAddress) =>
        currentAddress.trim()
          ? currentAddress
          : resolvedAddress
      );
      setManualCity((currentCity) =>
        currentCity.trim()
          ? currentCity
          : place.city
            ?? place.subregion
            ?? ''
      );
      setManualCountry((currentCountry) =>
        currentCountry.trim()
          ? currentCountry
          : place.country ?? ''
      );
    } catch {
      // La ubicación ya está confirmada aunque no pueda resolverse la dirección.
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

      const currentPosition =
        await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

      const coordinate = {
        latitude: currentPosition.coords.latitude,
        longitude: currentPosition.coords.longitude,
      };

      const currentLocationResult: RestaurantLocationResult = {
        label: 'Ubicación actual',
        address: manualAddress.trim() || null,
        city: manualCity.trim() || null,
        country: manualCountry.trim() || null,
        latitude: coordinate.latitude,
        longitude: coordinate.longitude,
      };

      setSelectedLocation(currentLocationResult);
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
          const lastKnownPosition =
            await Location.getLastKnownPositionAsync();

          if (lastKnownPosition) {
            coordinate = {
              latitude: lastKnownPosition.coords.latitude,
              longitude: lastKnownPosition.coords.longitude,
            };
          }
        }
      } catch {
        // El selector puede abrirse igualmente con la región por defecto.
      }
    }

    setPickerCoordinate(coordinate);
    setPickerVisible(true);
  }

  function confirmPickerLocation() {
    const locationResult: RestaurantLocationResult = {
      label: 'Punto elegido en el mapa',
      address: manualAddress.trim() || null,
      city: manualCity.trim() || null,
      country: manualCountry.trim() || null,
      latitude: pickerCoordinate.latitude,
      longitude: pickerCoordinate.longitude,
    };

    setSelectedLocation(locationResult);
    setLocationResults([]);
    setLocationError(null);
    setRequestError(null);
    setPickerVisible(false);

    void enrichAddressFromCoordinate(pickerCoordinate);
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
      setRequestError(
        'Introduce el nombre del restaurante.',
      );
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

      if (creationMode === 'SEARCH' && selectedResult) {
        await createGroupRestaurant(
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
      }

      if (creationMode === 'MANUAL' && selectedLocation) {
        await createGroupRestaurant(
          groupId,
          {
            provider: null,
            externalPlaceId: null,
            name: manualName.trim(),
            address: manualAddress.trim() || null,
            city: manualCity.trim() || null,
            country: manualCountry.trim() || null,
            latitude: selectedLocation.latitude,
            longitude: selectedLocation.longitude,
            category: manualCategory.trim() || null,
            groupNotes: groupNotes.trim() || null,
          },
          accessToken,
        );
      }

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

  const saveDisabled =
    creationMode === 'SEARCH'
      ? selectedResult === null
      : !manualName.trim() || selectedLocation === null;

  const footerVisible =
    creationMode === 'MANUAL' || selectedResult !== null;

  const locationSearchDisabled =
    !manualAddress.trim() && !manualCity.trim();

  const groupImageUrl =
    group?.imageUrl && !groupImageFailed
      ? resolveApiUrl(group.imageUrl)
      : null;

  return (
    <SafeAreaView
      edges={['top', 'right', 'left']}
      style={styles.safeArea}
    >
      <KeyboardAvoidingView
        behavior={
          Platform.OS === 'ios' ? 'padding' : undefined
        }
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={[
            styles.content,
            footerVisible ? styles.contentWithFooter : null,
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
              <Image
                onError={() => setGroupImageFailed(true)}
                resizeMode="cover"
                source={{ uri: groupImageUrl }}
                style={styles.groupThumbnail}
              />
            ) : (
              <View style={styles.groupFallback}>
                <MaterialIcons
                  color="#62794D"
                  name="group"
                  size={20}
                />
              </View>
            )}

            <View style={styles.groupCopy}>
              <Text style={styles.groupEyebrow}>
                Se guardará en
              </Text>

              {isGroupLoading ? (
                <View style={styles.groupLoading}>
                  <ActivityIndicator
                    color={colors.primary}
                    size="small"
                  />
                  <Text style={styles.groupLoadingText}>
                    Cargando grupo…
                  </Text>
                </View>
              ) : (
                <Text
                  numberOfLines={1}
                  style={styles.groupName}
                >
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
            <Pressable
              accessibilityRole="tab"
              accessibilityState={{
                selected: creationMode === 'SEARCH',
              }}
              onPress={() => changeCreationMode('SEARCH')}
              style={[
                styles.modeButton,
                creationMode === 'SEARCH'
                  ? styles.activeModeButton
                  : null,
              ]}
            >
              <Text
                style={[
                  styles.modeButtonText,
                  creationMode === 'SEARCH'
                    ? styles.activeModeButtonText
                    : null,
                ]}
              >
                Buscar
              </Text>
            </Pressable>

            <Pressable
              accessibilityRole="tab"
              accessibilityState={{
                selected: creationMode === 'MANUAL',
              }}
              onPress={() => changeCreationMode('MANUAL')}
              style={[
                styles.modeButton,
                creationMode === 'MANUAL'
                  ? styles.activeModeButton
                  : null,
              ]}
            >
              <Text
                style={[
                  styles.modeButtonText,
                  creationMode === 'MANUAL'
                    ? styles.activeModeButtonText
                    : null,
                ]}
              >
                Manual
              </Text>
            </Pressable>
          </View>

          {creationMode === 'SEARCH' ? (
            <View style={styles.section}>
              <View style={styles.card}>
                <StepHeader
                  icon="search"
                  subtitle="La ciudad es opcional y ayuda a afinar."
                  title="Busca el restaurante"
                />

                <View style={styles.formStack}>
                  <FormField
                    autoCapitalize="words"
                    autoCorrect={false}
                    compact
                    label="Nombre del restaurante"
                    maxLength={150}
                    onChangeText={updateSearchQuery}
                    onSubmitEditing={() => void handleSearch()}
                    placeholder="Ej. Kaizen Sushi"
                    returnKeyType="search"
                    rightAccessory={
                      <MaterialIcons
                        color={colors.primary}
                        name="search"
                        size={19}
                      />
                    }
                    value={searchQuery}
                  />

                  <FormField
                    autoCapitalize="words"
                    compact
                    label="Ciudad"
                    maxLength={100}
                    onChangeText={updateSearchCity}
                    onSubmitEditing={() => void handleSearch()}
                    placeholder="Ej. Palma (opcional)"
                    returnKeyType="search"
                    rightAccessory={
                      <MaterialIcons
                        color={colors.primary}
                        name="my-location"
                        size={18}
                      />
                    }
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
              </View>

              {hasSearched
              && !isSearching
              && !searchError
              && searchResults.length === 0 ? (
                <View style={styles.emptySearch}>
                  <MaterialIcons
                    color={colors.primary}
                    name="search-off"
                    size={22}
                  />
                  <View style={styles.emptySearchCopy}>
                    <Text style={styles.emptyTitle}>
                      No encontramos resultados
                    </Text>
                    <Text style={styles.emptyText}>
                      Prueba con otro nombre o añádelo manualmente.
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
                    <View style={styles.resultsCountBadge}>
                      <Text style={styles.resultsCount}>
                        {searchResults.length}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.resultsHelp}>
                    Selecciona el sitio correcto para continuar.
                  </Text>

                  <View style={styles.resultsList}>
                    {searchResults.map((result) => (
                      <RestaurantSearchResultCard
                        key={`${result.provider}-${result.externalPlaceId}`}
                        onPress={() => selectRestaurant(result)}
                        result={result}
                        selected={
                          selectedResult?.provider
                            === result.provider
                          && selectedResult?.externalPlaceId
                            === result.externalPlaceId
                        }
                      />
                    ))}
                  </View>

                  <Pressable
                    accessibilityRole="link"
                    onPress={() => {
                      void Linking.openURL(
                        'https://www.openstreetmap.org/copyright',
                      );
                    }}
                  >
                    <Text style={styles.attribution}>
                      Datos © colaboradores de OpenStreetMap
                    </Text>
                  </Pressable>
                </View>
              ) : null}

              <View style={styles.manualShortcut}>
                <View style={styles.manualShortcutIcon}>
                  <MaterialIcons
                    color={colors.primary}
                    name="help-outline"
                    size={20}
                  />
                </View>

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
                  style={({ pressed }) => [
                    styles.manualShortcutButton,
                    pressed ? styles.secondaryPressed : null,
                  ]}
                >
                  <Text style={styles.manualShortcutButtonText}>
                    Añadir manual
                  </Text>
                </Pressable>
              </View>

              {selectedResult ? (
                <View style={styles.selectedArea}>
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
                      <Text
                        numberOfLines={1}
                        style={styles.selectedSummaryName}
                      >
                        {selectedResult.name}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.card}>
                    <StepHeader
                      icon="notes"
                      subtitle="Solo se verán dentro de este grupo."
                      title="Notas del grupo"
                    />
                    <FormField
                      compact
                      label="Notas opcionales"
                      maxLength={1000}
                      multiline
                      onChangeText={setGroupNotes}
                      placeholder="Ej. Nos lo han recomendado"
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
              <View style={styles.card}>
                <StepHeader
                  icon="edit"
                  step={1}
                  subtitle="Solo el nombre es obligatorio."
                  title="Datos básicos"
                />

                <View style={styles.formStack}>
                  <FormField
                    autoCapitalize="words"
                    compact
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
                    autoCapitalize="words"
                    compact
                    label="Categoría (opcional)"
                    maxLength={100}
                    onChangeText={setManualCategory}
                    placeholder="Japonesa, cafetería, brunch…"
                    rightAccessory={
                      <MaterialIcons
                        color={colors.muted}
                        name="restaurant-menu"
                        size={18}
                      />
                    }
                    value={manualCategory}
                  />
                </View>
              </View>

              <View style={styles.locationCard}>
                <StepHeader
                  icon="place"
                  step={2}
                  subtitle="Confirma el punto exacto para mostrarlo en Mapa."
                  title="Ubicación"
                />

                <View style={styles.formStack}>
                  <FormField
                    autoCapitalize="sentences"
                    compact
                    label="Dirección"
                    maxLength={300}
                    onChangeText={updateManualAddress}
                    placeholder="Calle, número, etc."
                    value={manualAddress}
                  />

                  <View style={styles.twoColumns}>
                    <View style={styles.column}>
                      <FormField
                        autoCapitalize="words"
                        compact
                        label="Ciudad"
                        maxLength={100}
                        onChangeText={updateManualCity}
                        placeholder="Ej. Palma"
                        value={manualCity}
                      />
                    </View>

                    <View style={styles.column}>
                      <FormField
                        autoCapitalize="words"
                        compact
                        label="País"
                        maxLength={100}
                        onChangeText={updateManualCountry}
                        placeholder="España"
                        value={manualCountry}
                      />
                    </View>
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

                    <View style={styles.locationConfirmed}>
                      <MaterialIcons
                        color="#557547"
                        name="check-circle"
                        size={18}
                      />
                      <View style={styles.locationConfirmedCopy}>
                        <Text style={styles.locationConfirmedTitle}>
                          Ubicación confirmada
                        </Text>
                        <Text
                          numberOfLines={1}
                          style={styles.locationConfirmedText}
                        >
                          {selectedLocation.label}
                        </Text>
                      </View>
                      <Pressable
                        accessibilityRole="button"
                        onPress={() => void openMapPicker()}
                        style={({ pressed }) => [
                          styles.adjustButton,
                          pressed ? styles.secondaryPressed : null,
                        ]}
                      >
                        <Text style={styles.adjustButtonText}>
                          Ajustar
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                ) : (
                  <View style={styles.locationPending}>
                    <MaterialIcons
                      color="#62794D"
                      name="info-outline"
                      size={18}
                    />
                    <Text style={styles.locationPendingText}>
                      Confirma una ubicación para que el restaurante aparezca en Mapa.
                    </Text>
                  </View>
                )}

                <View style={styles.locationActionsRow}>
                  <LocationAction
                    disabled={locationSearchDisabled}
                    icon="search"
                    loading={isLocationSearching}
                    onPress={handleLocationSearch}
                    title="Buscar"
                  />
                  <LocationAction
                    icon="my-location"
                    loading={isUsingCurrentLocation}
                    onPress={useCurrentLocation}
                    title="Mi ubicación"
                  />
                  <LocationAction
                    icon="map"
                    onPress={() => void openMapPicker()}
                    title="Elegir mapa"
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

                    {locationResults.map((locationResult) => (
                      <Pressable
                        accessibilityRole="button"
                        key={`${locationResult.latitude}-${locationResult.longitude}`}
                        onPress={() => {
                          selectManualLocation(locationResult);
                        }}
                        style={({ pressed }) => [
                          styles.locationResultCard,
                          pressed ? styles.secondaryPressed : null,
                        ]}
                      >
                        <View style={styles.locationResultIcon}>
                          <MaterialIcons
                            color={colors.primary}
                            name="location-on"
                            size={18}
                          />
                        </View>

                        <View style={styles.locationResultCopy}>
                          <Text
                            numberOfLines={2}
                            style={styles.locationResultLabel}
                          >
                            {locationResult.label}
                          </Text>
                          <Text style={styles.locationResultMeta}>
                            Toca para confirmar este punto
                          </Text>
                        </View>

                        <MaterialIcons
                          color={colors.muted}
                          name="chevron-right"
                          size={19}
                        />
                      </Pressable>
                    ))}

                    <Pressable
                      accessibilityRole="link"
                      onPress={() => {
                        void Linking.openURL(
                          'https://www.openstreetmap.org/copyright',
                        );
                      }}
                    >
                      <Text style={styles.attribution}>
                        Datos © colaboradores de OpenStreetMap
                      </Text>
                    </Pressable>
                  </View>
                ) : null}
              </View>

              <View style={styles.card}>
                <StepHeader
                  icon="notes"
                  step={3}
                  subtitle="Solo se verán dentro de este grupo."
                  title="Notas del grupo"
                />

                <FormField
                  compact
                  label="Notas opcionales"
                  maxLength={1000}
                  multiline
                  onChangeText={setGroupNotes}
                  placeholder="Ej. Nos lo han recomendado"
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
                name="warning-amber"
                size={19}
              />
              <Text style={styles.requestErrorText}>
                {requestError}
              </Text>
            </View>
          ) : null}
        </ScrollView>

        {footerVisible ? (
          <View style={styles.footer}>
            {creationMode === 'MANUAL' && !selectedLocation ? (
              <Text style={styles.footerHint}>
                Confirma la ubicación para activar el guardado.
              </Text>
            ) : null}

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
