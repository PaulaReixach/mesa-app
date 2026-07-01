import {
  router,
  useLocalSearchParams,
} from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FormField } from '../../../../../components/FormField';
import { PrimaryButton } from '../../../../../components/PrimaryButton';
import { RestaurantSearchResultCard } from '../../../../../components/RestaurantSearchResultCard';
import { useAuth } from '../../../../../contexts/auth-context';
import { getErrorMessage } from '../../../../../lib/api';
import {
  createGroupRestaurant,
  searchRestaurants,
} from '../../../../../services/restaurant-service';
import { colors } from '../../../../../theme/colors';
import { RestaurantSearchResult } from '../../../../../types/restaurant';

type CreationMode = 'SEARCH' | 'MANUAL';

export default function CreateRestaurantScreen() {
  const { groupId } = useLocalSearchParams<{
    groupId: string;
  }>();

  const { accessToken } = useAuth();

  const [creationMode, setCreationMode] =
    useState<CreationMode>('SEARCH');

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
        params: {
          groupId,
        },
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

  return (
    <SafeAreaView
      edges={['top', 'right', 'bottom', 'left']}
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
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <Text style={styles.backText}>‹</Text>
            </Pressable>

            <Text style={styles.headerTitle}>
              Añadir restaurante
            </Text>

            <View style={styles.headerSpacer} />
          </View>

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
              accessibilityRole="button"
              onPress={() =>
                changeCreationMode('SEARCH')
              }
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
              accessibilityRole="button"
              onPress={() =>
                changeCreationMode('MANUAL')
              }
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
              <View style={styles.searchForm}>
                <FormField
                  autoCapitalize="words"
                  autoCorrect={false}
                  label="Nombre del restaurante"
                  maxLength={150}
                  onChangeText={setSearchQuery}
                  placeholder="Kaizen Sushi"
                  returnKeyType="search"
                  value={searchQuery}
                />

                <FormField
                  autoCapitalize="words"
                  label="Ciudad"
                  maxLength={100}
                  onChangeText={setSearchCity}
                  placeholder="Palma de Mallorca"
                  returnKeyType="search"
                  value={searchCity}
                />

                {searchError ? (
                  <Text style={styles.error}>
                    {searchError}
                  </Text>
                ) : null}

                <PrimaryButton
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
                  <Text style={styles.emptyEmoji}>
                    🔎
                  </Text>

                  <Text style={styles.emptyTitle}>
                    No encontramos resultados
                  </Text>

                  <Text style={styles.emptyText}>
                    Prueba con otro nombre o añádelo
                    manualmente.
                  </Text>
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

                  <Text style={styles.resultsHelp}>
                    Mostramos hasta 10 resultados. Pulsa uno
                    para seleccionarlo.
                  </Text>

                  <View style={styles.resultsList}>
                    {searchResults.map((result) => (
                      <RestaurantSearchResultCard
                        key={`${result.provider}-${result.externalPlaceId}`}
                        onPress={() =>
                          setSelectedResult(result)
                        }
                        result={result}
                        selected={
                          selectedResult?.provider
                            === result.provider
                          && selectedResult
                            ?.externalPlaceId
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
                <View style={styles.manualShortcutContent}>
                  <Text style={styles.manualShortcutTitle}>
                    ¿No aparece?
                  </Text>

                  <Text style={styles.manualShortcutText}>
                    Puedes guardar el restaurante aunque no
                    esté disponible en OpenStreetMap.
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
                  <Text
                    style={styles.manualShortcutButtonText}
                  >
                    Añádelo manualmente
                  </Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <View style={styles.manualForm}>
              <FormField
                autoCapitalize="words"
                label="Nombre del restaurante"
                maxLength={150}
                onChangeText={setManualName}
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
          )}

          <View style={styles.notesSection}>
            <Text style={styles.notesTitle}>
              Notas del grupo
            </Text>

            <Text style={styles.notesDescription}>
              Estas notas solo pertenecen a este grupo.
            </Text>

            <FormField
              label="Notas"
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
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 36,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: colors.surface,
  },
  backText: {
    color: colors.text,
    fontSize: 34,
    lineHeight: 36,
  },
  headerTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '800',
  },
  headerSpacer: {
    width: 44,
  },
  heading: {
    gap: 8,
    marginTop: 36,
    marginBottom: 24,
  },
  title: {
    color: colors.text,
    fontSize: 29,
    fontWeight: '800',
    lineHeight: 35,
  },
  subtitle: {
    color: colors.muted,
    fontSize: 16,
    lineHeight: 23,
  },
  modeSelector: {
    flexDirection: 'row',
    gap: 6,
    borderRadius: 17,
    backgroundColor: '#F0E8E3',
    padding: 5,
    marginBottom: 24,
  },
  modeButton: {
    flex: 1,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 13,
  },
  activeModeButton: {
    backgroundColor: colors.surface,
  },
  modeButtonText: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: '700',
  },
  activeModeButtonText: {
    color: colors.primary,
  },
  section: {
    gap: 24,
  },
  searchForm: {
    gap: 18,
  },
  manualForm: {
    gap: 18,
  },
  error: {
    color: colors.danger,
    fontSize: 14,
    lineHeight: 20,
  },
  emptySearch: {
    alignItems: 'center',
    gap: 9,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    backgroundColor: colors.surface,
    padding: 24,
  },
  emptyEmoji: {
    fontSize: 30,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '800',
  },
  emptyText: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  resultsSection: {
    gap: 12,
  },
  resultsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  resultsTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '800',
  },
  resultsCount: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: '700',
  },
  resultsHelp: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18,
  },
  resultsList: {
    gap: 11,
  },
  attribution: {
    color: colors.muted,
    fontSize: 11,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  manualShortcut: {
    gap: 14,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    backgroundColor: colors.surface,
    padding: 18,
  },
  manualShortcutContent: {
    gap: 5,
  },
  manualShortcutTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '800',
  },
  manualShortcutText: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 19,
  },
  manualShortcutButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 14,
    paddingHorizontal: 16,
  },
  manualShortcutButtonPressed: {
    backgroundColor: '#FFF1EC',
  },
  manualShortcutButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '800',
  },
  notesSection: {
    gap: 8,
    marginTop: 28,
    marginBottom: 22,
  },
  notesTitle: {
    color: colors.text,
    fontSize: 19,
    fontWeight: '800',
  },
  notesDescription: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8,
  },
  notesInput: {
    minHeight: 105,
    paddingTop: 15,
  },
  requestErrorCard: {
    borderWidth: 1,
    borderColor: '#F3C5BC',
    borderRadius: 15,
    backgroundColor: '#FFF1EE',
    padding: 14,
    marginBottom: 18,
  },
  requestErrorText: {
    color: colors.danger,
    fontSize: 14,
    lineHeight: 20,
  },
});