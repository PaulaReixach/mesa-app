import * as Location from 'expo-location';
import {
  router,
  useLocalSearchParams,
} from 'expo-router';
import { SymbolView } from 'expo-symbols';
import {
  useEffect,
  useState,
} from 'react';
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

import { FormField } from '../../../../../components/FormField';
import { PrimaryButton } from '../../../../../components/PrimaryButton';
import { RestaurantSearchResultCard } from '../../../../../components/RestaurantSearchResultCard';
import { useAuth } from '../../../../../contexts/auth-context';
import {
  getErrorMessage,
  resolveApiUrl,
} from '../../../../../lib/api';
import { getGroup } from '../../../../../services/group-service';
import {
  createGroupRestaurant,
  searchRestaurantLocations,
  searchRestaurants,
} from '../../../../../services/restaurant-service';
import { addRestaurantStyles as styles } from '../../../../../styles/add-restaurant-screen.styles';
import { colors } from '../../../../../theme/colors';
import type { RestaurantGroup } from '../../../../../types/group';
import type {
  RestaurantLocationResult,
  RestaurantSearchResult,
} from '../../../../../types/restaurant';

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
                pressed ? styles.headerButtonPressed : null,
              ]}
            >
              <SymbolView
                name={{
                  ios: 'xmark',
                  android: 'close',
                  web: 'close',
                }}
                size={20}
                tintColor={colors.text}
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
              onPress={onConfirm}
              title="Confirmar ubicación"
            />
          </View>
        </View>
      </SafeAreaView>
    </Modal>
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
  const [manualCategory, setManualCategory] =
    useState('');
  const [detailsExpanded, setDetailsExpanded] =
    useState(true);

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

    if (
      creationMode === 'SEARCH'
      && !selectedResult
    ) {
      setRequestError(
        'Selecciona uno de los restaurantes encontrados.',
      );
      return;
    }

    if (
      creationMode === 'MANUAL'
      && !manualName.trim()
    ) {
      setRequestError(
        'Introduce el nombre del restaurante.',
      );
      return;
    }

    if (
      creationMode === 'MANUAL'
      && !selectedLocation
    ) {
      setRequestError(
        'Confirma la ubicación del restaurante para que aparezca en el mapa.',
      );
      return;
    }

    try {
      setIsSubmitting(true);

      if (
        creationMode === 'SEARCH'
        && selectedResult
      ) {
        await createGroupRestaurant(
          groupId,
          {
            provider: selectedResult.provider,
            externalPlaceId:
              selectedResult.externalPlaceId,
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

      if (
        creationMode === 'MANUAL'
        && selectedLocation
      ) {
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
            category:
              manualCategory.trim() || null,
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

  const showSearchSaveSection =
    creationMode === 'SEARCH'
    && selectedResult !== null;

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
          contentContainerStyle={styles.content}
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
                pressed ? styles.headerButtonPressed : null,
              ]}
            >
              <SymbolView
                name={{
                  ios: 'xmark',
                  android: 'close',
                  web: 'close',
                }}
                size={20}
                tintColor={colors.text}
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
              pressed ? styles.groupCardPressed : null,
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
                <SymbolView
                  name={{
                    ios: 'person.2.fill',
                    android: 'group',
                    web: 'group',
                  }}
                  size={22}
                  tintColor="#66834A"
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

            <SymbolView
              name={{
                ios: 'chevron.right',
                android: 'chevron_right',
                web: 'chevron_right',
              }}
              size={19}
              tintColor={colors.muted}
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
              <View style={styles.sectionCard}>
                <View style={styles.sectionHeading}>
                  <View style={styles.sectionIcon}>
                    <SymbolView
                      name={{
                        ios: 'magnifyingglass',
                        android: 'search',
                        web: 'search',
                      }}
                      size={21}
                      tintColor={colors.primary}
                    />
                  </View>
                  <View style={styles.sectionHeadingCopy}>
                    <Text style={styles.sectionTitle}>
                      Busca el restaurante
                    </Text>
                    <Text style={styles.sectionDescription}>
                      La ciudad es opcional, pero ayuda a afinar los resultados.
                    </Text>
                  </View>
                </View>

                <View style={styles.formStack}>
                  <FormField
                    autoCapitalize="words"
                    autoCorrect={false}
                    label="Nombre del restaurante"
                    maxLength={150}
                    onChangeText={updateSearchQuery}
                    onSubmitEditing={() => void handleSearch()}
                    placeholder="Escribe el nombre del restaurante"
                    returnKeyType="search"
                    rightAccessory={
                      <SymbolView
                        name={{
                          ios: 'magnifyingglass',
                          android: 'search',
                          web: 'search',
                        }}
                        size={20}
                        tintColor={colors.primary}
                      />
                    }
                    value={searchQuery}
                  />

                  <FormField
                    autoCapitalize="words"
                    label="Ciudad"
                    maxLength={100}
                    onChangeText={updateSearchCity}
                    onSubmitEditing={() => void handleSearch()}
                    placeholder="Escribe una ciudad (opcional)"
                    returnKeyType="search"
                    rightAccessory={
                      <SymbolView
                        name={{
                          ios: 'location.circle',
                          android: 'my_location',
                          web: 'my_location',
                        }}
                        size={20}
                        tintColor={colors.primary}
                      />
                    }
                    value={searchCity}
                  />

                  {searchError ? (
                    <View style={styles.inlineError}>
                      <SymbolView
                        name={{
                          ios: 'exclamationmark.circle.fill',
                          android: 'error',
                          web: 'error',
                        }}
                        size={18}
                        tintColor={colors.danger}
                      />
                      <Text style={styles.inlineErrorText}>
                        {searchError}
                      </Text>
                    </View>
                  ) : null}

                  <PrimaryButton
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
                  <View style={styles.emptySearchIcon}>
                    <SymbolView
                      name={{
                        ios: 'magnifyingglass',
                        android: 'search_off',
                        web: 'search_off',
                      }}
                      size={24}
                      tintColor={colors.primary}
                    />
                  </View>
                  <Text style={styles.emptyTitle}>
                    No encontramos resultados
                  </Text>
                  <Text style={styles.emptyText}>
                    Prueba con otro nombre o crea el restaurante manualmente.
                  </Text>
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
                  <SymbolView
                    name={{
                      ios: 'questionmark.circle',
                      android: 'help_outline',
                      web: 'help_outline',
                    }}
                    size={21}
                    tintColor={colors.primary}
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
                    pressed
                      ? styles.manualShortcutButtonPressed
                      : null,
                  ]}
                >
                  <Text style={styles.manualShortcutButtonText}>
                    Añadir manualmente
                  </Text>
                </Pressable>
              </View>

              {showSearchSaveSection ? (
                <View style={styles.saveSection}>
                  <View style={styles.selectedSummary}>
                    <SymbolView
                      name={{
                        ios: 'checkmark.circle.fill',
                        android: 'check_circle',
                        web: 'check_circle',
                      }}
                      size={22}
                      tintColor="#557547"
                    />
                    <View style={styles.selectedSummaryCopy}>
                      <Text style={styles.selectedSummaryEyebrow}>
                        Restaurante seleccionado
                      </Text>
                      <Text
                        numberOfLines={1}
                        style={styles.selectedSummaryName}
                      >
                        {selectedResult?.name}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.notesCard}>
                    <View style={styles.notesHeader}>
                      <Text style={styles.notesTitle}>
                        Notas del grupo
                      </Text>
                      <Text style={styles.notesDescription}>
                        Estas notas solo pertenecen a este grupo.
                      </Text>
                    </View>

                    <FormField
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

                  {requestError ? (
                    <View style={styles.requestErrorCard}>
                      <SymbolView
                        name={{
                          ios: 'exclamationmark.triangle.fill',
                          android: 'warning',
                          web: 'warning',
                        }}
                        size={19}
                        tintColor={colors.danger}
                      />
                      <Text style={styles.requestErrorText}>
                        {requestError}
                      </Text>
                    </View>
                  ) : null}

                  <PrimaryButton
                    disabled={saveDisabled}
                    loading={isSubmitting}
                    onPress={handleSaveRestaurant}
                    title="Guardar restaurante"
                  />
                </View>
              ) : null}
            </View>
          ) : (
            <View style={styles.section}>
              <View style={styles.sectionCard}>
                <View style={styles.sectionHeading}>
                  <View style={styles.sectionIcon}>
                    <SymbolView
                      name={{
                        ios: 'square.and.pencil',
                        android: 'edit',
                        web: 'edit',
                      }}
                      size={21}
                      tintColor={colors.primary}
                    />
                  </View>
                  <View style={styles.sectionHeadingCopy}>
                    <Text style={styles.sectionTitle}>
                      Datos básicos
                    </Text>
                    <Text style={styles.sectionDescription}>
                      El nombre y la ubicación son necesarios.
                    </Text>
                  </View>
                </View>

                <View style={styles.formStack}>
                  <FormField
                    autoCapitalize="words"
                    label="Nombre del restaurante"
                    maxLength={150}
                    onChangeText={(value) => {
                      setManualName(value);
                      setRequestError(null);
                    }}
                    placeholder="Escribe el nombre del restaurante"
                    value={manualName}
                  />

                  <FormField
                    autoCapitalize="words"
                    label="Ciudad"
                    maxLength={100}
                    onChangeText={updateManualCity}
                    placeholder="Escribe una ciudad"
                    rightAccessory={
                      <SymbolView
                        name={{
                          ios: 'location.circle',
                          android: 'location_city',
                          web: 'location_city',
                        }}
                        size={20}
                        tintColor={colors.primary}
                      />
                    }
                    value={manualCity}
                  />
                </View>
              </View>

              <View style={styles.detailsCard}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{
                    expanded: detailsExpanded,
                  }}
                  onPress={() => {
                    setDetailsExpanded((current) => !current);
                  }}
                  style={styles.detailsHeader}
                >
                  <View style={styles.detailsHeaderContent}>
                    <View style={styles.greenSectionIcon}>
                      <SymbolView
                        name={{
                          ios: 'info.circle',
                          android: 'info_outline',
                          web: 'info_outline',
                        }}
                        size={20}
                        tintColor="#62794D"
                      />
                    </View>
                    <View style={styles.sectionHeadingCopy}>
                      <Text style={styles.sectionTitle}>
                        Más información
                      </Text>
                      <Text style={styles.sectionDescription}>
                        Opcional, pero mejora la ficha del restaurante.
                      </Text>
                    </View>
                  </View>

                  <SymbolView
                    name={{
                      ios: detailsExpanded
                        ? 'chevron.up'
                        : 'chevron.down',
                      android: detailsExpanded
                        ? 'expand_less'
                        : 'expand_more',
                      web: detailsExpanded
                        ? 'expand_less'
                        : 'expand_more',
                    }}
                    size={20}
                    tintColor={colors.muted}
                  />
                </Pressable>

                {detailsExpanded ? (
                  <View style={styles.detailsBody}>
                    <FormField
                      autoCapitalize="sentences"
                      label="Dirección"
                      maxLength={300}
                      onChangeText={updateManualAddress}
                      placeholder="Calle, número, etc."
                      value={manualAddress}
                    />

                    <FormField
                      autoCapitalize="words"
                      label="País"
                      maxLength={100}
                      onChangeText={updateManualCountry}
                      placeholder="España"
                      value={manualCountry}
                    />

                    <FormField
                      autoCapitalize="words"
                      label="Categoría"
                      maxLength={100}
                      onChangeText={setManualCategory}
                      placeholder="Japonés, cafetería, brunch…"
                      value={manualCategory}
                    />
                  </View>
                ) : null}
              </View>

              <View style={styles.locationCard}>
                <View style={styles.sectionHeading}>
                  <View style={styles.greenSectionIcon}>
                    <SymbolView
                      name={{
                        ios: 'map.fill',
                        android: 'map',
                        web: 'map',
                      }}
                      size={20}
                      tintColor="#62794D"
                    />
                  </View>
                  <View style={styles.sectionHeadingCopy}>
                    <Text style={styles.sectionTitle}>
                      Ubicación en el mapa
                    </Text>
                    <Text style={styles.sectionDescription}>
                      Confirma el punto exacto para que aparezca en Mapa.
                    </Text>
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

                    <View style={styles.mapPreviewHeader}>
                      <View style={styles.mapPreviewIcon}>
                        <SymbolView
                          name={{
                            ios: 'checkmark.circle.fill',
                            android: 'check_circle',
                            web: 'check_circle',
                          }}
                          size={21}
                          tintColor="#557547"
                        />
                      </View>

                      <View style={styles.mapPreviewCopy}>
                        <Text style={styles.mapPreviewTitle}>
                          Ubicación confirmada
                        </Text>
                        <Text
                          numberOfLines={2}
                          style={styles.mapPreviewText}
                        >
                          {selectedLocation.label}
                        </Text>
                      </View>

                      <Pressable
                        accessibilityRole="button"
                        onPress={() => void openMapPicker()}
                        style={({ pressed }) => [
                          styles.mapPreviewEdit,
                          pressed
                            ? styles.manualShortcutButtonPressed
                            : null,
                        ]}
                      >
                        <Text style={styles.mapPreviewEditText}>
                          Ajustar
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                ) : (
                  <View style={styles.locationEmpty}>
                    <Text style={styles.locationEmptyTitle}>
                      Todavía falta confirmar la ubicación
                    </Text>
                    <Text style={styles.locationEmptyText}>
                      Busca la dirección, usa tu posición actual o coloca el pin manualmente.
                    </Text>
                  </View>
                )}

                <View style={styles.locationActions}>
                  <Pressable
                    accessibilityRole="button"
                    disabled={
                      locationSearchDisabled
                      || isLocationSearching
                    }
                    onPress={handleLocationSearch}
                    style={({ pressed }) => [
                      styles.locationPrimaryAction,
                      locationSearchDisabled
                      || isLocationSearching
                        ? styles.locationPrimaryActionDisabled
                        : null,
                      pressed
                      && !locationSearchDisabled
                      && !isLocationSearching
                        ? styles.locationActionPressed
                        : null,
                    ]}
                  >
                    {isLocationSearching ? (
                      <ActivityIndicator
                        color={colors.white}
                        size="small"
                      />
                    ) : (
                      <SymbolView
                        name={{
                          ios: 'magnifyingglass',
                          android: 'search',
                          web: 'search',
                        }}
                        size={18}
                        tintColor={colors.white}
                      />
                    )}
                    <Text style={styles.locationPrimaryActionText}>
                      Buscar dirección
                    </Text>
                  </Pressable>

                  <View style={styles.locationSecondaryRow}>
                    <Pressable
                      accessibilityRole="button"
                      disabled={isUsingCurrentLocation}
                      onPress={useCurrentLocation}
                      style={({ pressed }) => [
                        styles.locationSecondaryAction,
                        pressed
                          ? styles.locationSecondaryActionPressed
                          : null,
                      ]}
                    >
                      {isUsingCurrentLocation ? (
                        <ActivityIndicator
                          color={colors.primary}
                          size="small"
                        />
                      ) : (
                        <SymbolView
                          name={{
                            ios: 'location.fill',
                            android: 'my_location',
                            web: 'my_location',
                          }}
                          size={17}
                          tintColor={colors.primary}
                        />
                      )}
                      <Text style={styles.locationSecondaryActionText}>
                        Mi ubicación
                      </Text>
                    </Pressable>

                    <Pressable
                      accessibilityRole="button"
                      onPress={() => void openMapPicker()}
                      style={({ pressed }) => [
                        styles.locationSecondaryAction,
                        pressed
                          ? styles.locationSecondaryActionPressed
                          : null,
                      ]}
                    >
                      <SymbolView
                        name={{
                          ios: 'mappin.and.ellipse',
                          android: 'add_location_alt',
                          web: 'add_location_alt',
                        }}
                        size={18}
                        tintColor={colors.primary}
                      />
                      <Text style={styles.locationSecondaryActionText}>
                        Elegir en mapa
                      </Text>
                    </Pressable>
                  </View>
                </View>

                {locationError ? (
                  <View style={styles.inlineError}>
                    <SymbolView
                      name={{
                        ios: 'exclamationmark.circle.fill',
                        android: 'error',
                        web: 'error',
                      }}
                      size={18}
                      tintColor={colors.danger}
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
                          pressed
                            ? styles.locationResultCardPressed
                            : null,
                        ]}
                      >
                        <View style={styles.locationResultIcon}>
                          <SymbolView
                            name={{
                              ios: 'mappin',
                              android: 'location_on',
                              web: 'location_on',
                            }}
                            size={19}
                            tintColor={colors.primary}
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

                        <SymbolView
                          name={{
                            ios: 'chevron.right',
                            android: 'chevron_right',
                            web: 'chevron_right',
                          }}
                          size={18}
                          tintColor={colors.muted}
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

              <View style={styles.notesCard}>
                <View style={styles.sectionHeading}>
                  <View style={styles.greenSectionIcon}>
                    <SymbolView
                      name={{
                        ios: 'person.2.fill',
                        android: 'group',
                        web: 'group',
                      }}
                      size={20}
                      tintColor="#62794D"
                    />
                  </View>
                  <View style={styles.sectionHeadingCopy}>
                    <Text style={styles.sectionTitle}>
                      Notas del grupo
                    </Text>
                    <Text style={styles.sectionDescription}>
                      Estas notas solo pertenecen a este grupo.
                    </Text>
                  </View>
                </View>

                <FormField
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

              {requestError ? (
                <View style={styles.requestErrorCard}>
                  <SymbolView
                    name={{
                      ios: 'exclamationmark.triangle.fill',
                      android: 'warning',
                      web: 'warning',
                    }}
                    size={19}
                    tintColor={colors.danger}
                  />
                  <Text style={styles.requestErrorText}>
                    {requestError}
                  </Text>
                </View>
              ) : null}

              {!selectedLocation ? (
                <Text style={styles.saveHint}>
                  Confirma la ubicación para activar el guardado y mostrar el restaurante en Mapa.
                </Text>
              ) : null}

              <PrimaryButton
                disabled={saveDisabled}
                loading={isSubmitting}
                onPress={handleSaveRestaurant}
                title="Guardar restaurante"
              />
            </View>
          )}
        </ScrollView>
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
