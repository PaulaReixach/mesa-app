import { SymbolView } from 'expo-symbols';
import {
  router,
  useLocalSearchParams,
} from 'expo-router';
import {
  useEffect,
  useState,
} from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
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
  searchRestaurants,
} from '../../../../../services/restaurant-service';
import { addRestaurantStyles as styles } from '../../../../../styles/add-restaurant-screen.styles';
import { colors } from '../../../../../theme/colors';
import type { RestaurantGroup } from '../../../../../types/group';
import type { RestaurantSearchResult } from '../../../../../types/restaurant';

type CreationMode = 'SEARCH' | 'MANUAL';

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

      if (creationMode === 'MANUAL') {
        await createGroupRestaurant(
          groupId,
          {
            provider: null,
            externalPlaceId: null,
            name: manualName.trim(),
            address: manualAddress.trim() || null,
            city: manualCity.trim() || null,
            country: manualCountry.trim() || null,
            latitude: null,
            longitude: null,
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
      : !manualName.trim();

  const showSaveSection =
    creationMode === 'MANUAL'
    || selectedResult !== null;

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
              accessibilityLabel="Volver"
              accessibilityRole="button"
              onPress={() => router.back()}
              style={({ pressed }) => [
                styles.headerButton,
                pressed ? styles.headerButtonPressed : null,
              ]}
            >
              <SymbolView
                name={{
                  ios: 'chevron.left',
                  android: 'arrow_back',
                  web: 'arrow_back',
                }}
                size={21}
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
                  size={23}
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
              size={20}
              tintColor={colors.muted}
            />
          </Pressable>

          <View style={styles.heading}>
            <Text style={styles.title}>
              ¿Qué sitio queréis probar?
            </Text>
            <Text style={styles.subtitle}>
              Busca un restaurante real o añádelo
              manualmente si todavía no aparece.
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
                      La ciudad es opcional, pero ayuda a afinar.
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
                    placeholder="Kaizen Sushi"
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
                    placeholder="Palma de Mallorca"
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
                    Prueba con otro nombre o crea el restaurante
                    manualmente con los datos que conozcas.
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
                    size={22}
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
                    Añadir manual
                  </Text>
                </Pressable>
              </View>
            </View>
          ) : (
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
                    Datos del restaurante
                  </Text>
                  <Text style={styles.sectionDescription}>
                    Solo el nombre es obligatorio.
                  </Text>
                </View>
              </View>

              <Text style={styles.manualIntro}>
                Completa lo que conozcas. Podrás editar estos
                datos más adelante desde el grupo.
              </Text>

              <View style={styles.formStack}>
                <FormField
                  autoCapitalize="words"
                  label="Nombre del restaurante"
                  maxLength={150}
                  onChangeText={(value) => {
                    setManualName(value);
                    setRequestError(null);
                  }}
                  placeholder="Kaizen Sushi"
                  value={manualName}
                />

                <FormField
                  autoCapitalize="sentences"
                  label="Dirección"
                  maxLength={300}
                  onChangeText={setManualAddress}
                  placeholder="Carrer de Exemple, 10"
                  value={manualAddress}
                />

                <FormField
                  autoCapitalize="words"
                  label="Ciudad"
                  maxLength={100}
                  onChangeText={setManualCity}
                  placeholder="Palma"
                  value={manualCity}
                />

                <FormField
                  autoCapitalize="words"
                  label="País"
                  maxLength={100}
                  onChangeText={setManualCountry}
                  placeholder="España"
                  value={manualCountry}
                />

                <FormField
                  autoCapitalize="words"
                  label="Categoría"
                  maxLength={100}
                  onChangeText={setManualCategory}
                  placeholder="Japonés"
                  value={manualCategory}
                />
              </View>
            </View>
          )}

          {showSaveSection ? (
            <View style={styles.saveSection}>
              {creationMode === 'SEARCH' && selectedResult ? (
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
                      {selectedResult.name}
                    </Text>
                  </View>
                </View>
              ) : null}

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
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
