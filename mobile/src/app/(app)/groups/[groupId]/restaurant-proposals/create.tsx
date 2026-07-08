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
import { createRestaurantProposal } from '../../../../../services/restaurant-proposal-service';
import { searchRestaurants } from '../../../../../services/restaurant-service';
import { colors } from '../../../../../theme/colors';
import type { RestaurantSearchResult } from '../../../../../types/restaurant';

type CreationMode = 'SEARCH' | 'MANUAL';

export default function CreateRestaurantProposalScreen() {
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const { accessToken } = useAuth();

  const [creationMode, setCreationMode] =
    useState<CreationMode>('SEARCH');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCity, setSearchCity] = useState('');
  const [searchResults, setSearchResults] =
    useState<RestaurantSearchResult[]>([]);
  const [selectedResult, setSelectedResult] =
    useState<RestaurantSearchResult | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const [manualName, setManualName] = useState('');
  const [manualAddress, setManualAddress] = useState('');
  const [manualCity, setManualCity] = useState('');
  const [manualCountry, setManualCountry] = useState('');
  const [manualCategory, setManualCategory] = useState('');
  const [message, setMessage] = useState('');

  const [requestError, setRequestError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function changeMode(mode: CreationMode): void {
    setCreationMode(mode);
    setRequestError(null);
  }

  function openManualMode(): void {
    setManualName(current => current || searchQuery.trim());
    setManualCity(current => current || searchCity.trim());
    changeMode('MANUAL');
  }

  async function handleSearch(): Promise<void> {
    const normalizedQuery = searchQuery.trim();

    setSearchError(null);
    setRequestError(null);
    setSelectedResult(null);
    setSearchResults([]);

    if (normalizedQuery.length < 2) {
      setSearchError('Introduce al menos dos caracteres para buscar.');
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

  async function handleSubmit(): Promise<void> {
    setRequestError(null);

    if (!accessToken || !groupId) {
      setRequestError('No se ha podido recuperar tu sesión o el grupo.');
      return;
    }

    if (creationMode === 'SEARCH' && !selectedResult) {
      setRequestError('Selecciona uno de los restaurantes encontrados.');
      return;
    }

    if (creationMode === 'MANUAL' && !manualName.trim()) {
      setRequestError('Introduce el nombre del restaurante.');
      return;
    }

    try {
      setIsSubmitting(true);

      if (creationMode === 'SEARCH' && selectedResult) {
        await createRestaurantProposal(
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
            message: message.trim() || null,
          },
          accessToken,
        );
      }

      if (creationMode === 'MANUAL') {
        await createRestaurantProposal(
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
            category: manualCategory.trim() || null,
            message: message.trim() || null,
          },
          accessToken,
        );
      }

      router.replace({
        pathname: '/groups/[groupId]/collaboration',
        params: { groupId },
      });
    } catch (error) {
      setRequestError(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  const submitDisabled = creationMode === 'SEARCH'
    ? selectedResult === null
    : !manualName.trim();

  return (
    <SafeAreaView
      edges={['top', 'right', 'bottom', 'left']}
      style={styles.safeArea}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
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
            <Text style={styles.headerTitle}>Proponer restaurante</Text>
            <View style={styles.headerSpacer} />
          </View>

          <View style={styles.heading}>
            <Text style={styles.title}>¿Qué sitio añadirías?</Text>
            <Text style={styles.subtitle}>
              La persona creadora revisará la propuesta antes de publicarla en el grupo.
            </Text>
          </View>

          <View style={styles.modeSelector}>
            <Pressable
              accessibilityRole="button"
              onPress={() => changeMode('SEARCH')}
              style={[
                styles.modeButton,
                creationMode === 'SEARCH' ? styles.activeModeButton : null,
              ]}
            >
              <Text
                style={[
                  styles.modeText,
                  creationMode === 'SEARCH' ? styles.activeModeText : null,
                ]}
              >
                Buscar
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => changeMode('MANUAL')}
              style={[
                styles.modeButton,
                creationMode === 'MANUAL' ? styles.activeModeButton : null,
              ]}
            >
              <Text
                style={[
                  styles.modeText,
                  creationMode === 'MANUAL' ? styles.activeModeText : null,
                ]}
              >
                Manual
              </Text>
            </Pressable>
          </View>

          {creationMode === 'SEARCH' ? (
            <View style={styles.section}>
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
                placeholder="Girona"
                returnKeyType="search"
                value={searchCity}
              />

              {searchError ? <Text style={styles.error}>{searchError}</Text> : null}

              <PrimaryButton
                disabled={searchQuery.trim().length < 2}
                loading={isSearching}
                onPress={handleSearch}
                title="Buscar restaurantes"
              />

              {hasSearched
              && !isSearching
              && !searchError
              && searchResults.length === 0 ? (
                <View style={styles.emptyCard}>
                  <Text style={styles.emptyTitle}>No encontramos resultados</Text>
                  <Text style={styles.emptyText}>
                    Prueba con otro nombre o introdúcelo manualmente.
                  </Text>
                </View>
              ) : null}

              {searchResults.length > 0 ? (
                <View style={styles.results}>
                  <Text style={styles.resultsTitle}>Resultados</Text>
                  {searchResults.map(result => (
                    <RestaurantSearchResultCard
                      key={`${result.provider}-${result.externalPlaceId}`}
                      onPress={() => setSelectedResult(result)}
                      result={result}
                      selected={
                        selectedResult?.provider === result.provider
                        && selectedResult?.externalPlaceId
                          === result.externalPlaceId
                      }
                    />
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

              <Pressable
                accessibilityRole="button"
                onPress={openManualMode}
                style={styles.manualShortcut}
              >
                <Text style={styles.manualShortcutTitle}>¿No aparece?</Text>
                <Text style={styles.manualShortcutText}>
                  Proponer manualmente
                </Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.section}>
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
                placeholder="Girona"
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
                placeholder="Sushi"
                value={manualCategory}
              />
            </View>
          )}

          <View style={styles.messageSection}>
            <FormField
              autoCapitalize="sentences"
              label="¿Por qué lo propones? (opcional)"
              maxLength={500}
              multiline
              onChangeText={setMessage}
              placeholder="Creo que encaja mucho con esta lista..."
              value={message}
            />
            <Text style={styles.counter}>{message.length}/500</Text>
          </View>

          {requestError ? <Text style={styles.error}>{requestError}</Text> : null}

          <PrimaryButton
            disabled={submitDisabled}
            loading={isSubmitting}
            onPress={handleSubmit}
            title="Enviar propuesta"
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  keyboardView: { flex: 1 },
  content: {
    flexGrow: 1,
    gap: 20,
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 36,
  },
  header: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: { color: colors.text, fontSize: 31, fontWeight: '300' },
  headerTitle: { color: colors.text, fontSize: 15, fontWeight: '900' },
  headerSpacer: { width: 38 },
  heading: { gap: 7 },
  title: { color: colors.text, fontSize: 25, fontWeight: '900' },
  subtitle: { color: colors.muted, fontSize: 12, lineHeight: 18 },
  modeSelector: {
    flexDirection: 'row',
    gap: 7,
    padding: 5,
    borderRadius: 17,
    backgroundColor: '#EEE8E4',
  },
  modeButton: {
    minHeight: 42,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 13,
  },
  activeModeButton: { backgroundColor: colors.surface },
  modeText: { color: colors.muted, fontSize: 11, fontWeight: '800' },
  activeModeText: { color: colors.primary },
  section: { gap: 14 },
  results: { gap: 9 },
  resultsTitle: { color: colors.text, fontSize: 16, fontWeight: '900' },
  attribution: { color: colors.muted, fontSize: 8, textAlign: 'center' },
  emptyCard: {
    gap: 5,
    padding: 17,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 17,
    backgroundColor: colors.surface,
  },
  emptyTitle: { color: colors.text, fontSize: 13, fontWeight: '900' },
  emptyText: { color: colors.muted, fontSize: 10, lineHeight: 15 },
  manualShortcut: {
    gap: 3,
    padding: 15,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 17,
    backgroundColor: '#FFF8F3',
  },
  manualShortcutTitle: { color: colors.text, fontSize: 12, fontWeight: '900' },
  manualShortcutText: { color: colors.primary, fontSize: 10, fontWeight: '800' },
  messageSection: { gap: 5 },
  counter: { color: colors.muted, fontSize: 9, textAlign: 'right' },
  error: { color: colors.danger, fontSize: 11, lineHeight: 16 },
});
