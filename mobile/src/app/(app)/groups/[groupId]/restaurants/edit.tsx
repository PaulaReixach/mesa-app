import { SymbolView } from 'expo-symbols';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FormField } from '../../../../../components/FormField';
import { useAuth } from '../../../../../contexts/auth-context';
import { getErrorMessage } from '../../../../../lib/api';
import {
  getGroupRestaurant,
  updateGroupRestaurant,
} from '../../../../../services/restaurant-service';
import { colors } from '../../../../../theme/colors';
import type { GroupRestaurant } from '../../../../../types/restaurant';
import { fonts } from '../../../../../theme/fonts';

export default function EditRestaurantScreen() {
  const { groupId, groupRestaurantId } =
    useLocalSearchParams<{
      groupId: string;
      groupRestaurantId: string;
    }>();
  const { accessToken } = useAuth();

  const [groupRestaurant, setGroupRestaurant] =
    useState<GroupRestaurant | null>(null);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [groupNotes, setGroupNotes] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [requestError, setRequestError] =
    useState<string | null>(null);

  const loadRestaurant = useCallback(async () => {
    if (!accessToken || !groupId || !groupRestaurantId) {
      setRequestError('No se ha podido recuperar el restaurante.');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setRequestError(null);
      const response = await getGroupRestaurant(
        groupId,
        groupRestaurantId,
        accessToken,
      );
      setGroupRestaurant(response);
      setName(response.restaurant.name);
      setCategory(response.restaurant.category ?? '');
      setAddress(response.restaurant.address ?? '');
      setCity(response.restaurant.city ?? '');
      setCountry(response.restaurant.country ?? '');
      setGroupNotes(response.groupNotes ?? '');
    } catch (error) {
      setRequestError(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, groupId, groupRestaurantId]);

  useEffect(() => {
    void loadRestaurant();
  }, [loadRestaurant]);

  const canSave =
    Boolean(groupRestaurant)
    && name.trim().length > 0
    && !isSaving;

  async function handleSave(): Promise<void> {
    if (!accessToken || !groupId || !groupRestaurantId || !canSave) {
      return;
    }

    try {
      setIsSaving(true);
      setRequestError(null);
      await updateGroupRestaurant(
        groupId,
        groupRestaurantId,
        {
          name: name.trim(),
          category: category.trim() || null,
          address: address.trim() || null,
          city: city.trim() || null,
          country: country.trim() || null,
          groupNotes: groupNotes.trim() || null,
        },
        accessToken,
      );
      router.back();
    } catch (error) {
      setRequestError(getErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <SafeAreaView edges={['top', 'right', 'bottom', 'left']} style={styles.safeArea}>
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
              accessibilityLabel="Volver"
              accessibilityRole="button"
              disabled={isSaving}
              onPress={() => router.back()}
              style={styles.headerButton}
            >
              <SymbolView
                name={{ ios: 'chevron.left', android: 'arrow_back', web: 'arrow_back' }}
                size={20}
                tintColor={colors.text}
              />
            </Pressable>
            <Text style={styles.headerTitle}>Editar restaurante</Text>
            <Pressable
              accessibilityRole="button"
              disabled={!canSave}
              onPress={() => void handleSave()}
            >
              <Text style={[styles.saveText, !canSave ? styles.disabledText : null]}>
                Guardar
              </Text>
            </Pressable>
          </View>

          {isLoading ? (
            <View style={styles.loading}>
              <ActivityIndicator color={colors.primary} size="large" />
            </View>
          ) : null}

          {!isLoading && groupRestaurant ? (
            <>
              <View style={styles.heroCard}>
                <View style={styles.heroIcon}>
                  <SymbolView
                    name={{ ios: 'fork.knife', android: 'restaurant', web: 'restaurant' }}
                    size={24}
                    tintColor={colors.primary}
                  />
                </View>
                <View style={styles.heroText}>
                  <Text style={styles.heroEyebrow}>INFORMACIÓN DEL GRUPO</Text>
                  <Text numberOfLines={2} style={styles.heroTitle}>
                    {groupRestaurant.restaurant.name}
                  </Text>
                  <Text style={styles.heroDescription}>
                    Todos los integrantes pueden actualizar estos datos.
                  </Text>
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Datos principales</Text>
                <View style={styles.formCard}>
                  <FormField
                    autoCapitalize="words"
                    label="Nombre del restaurante"
                    maxLength={150}
                    onChangeText={setName}
                    placeholder="Nombre del restaurante"
                    value={name}
                  />
                  <FormField
                    autoCapitalize="words"
                    label="Tipo de cocina"
                    maxLength={100}
                    onChangeText={setCategory}
                    placeholder="Italiana, japonesa, tapas..."
                    value={category}
                  />
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Ubicación</Text>
                <View style={styles.formCard}>
                  <FormField
                    autoCapitalize="sentences"
                    label="Dirección"
                    maxLength={300}
                    onChangeText={setAddress}
                    placeholder="Calle y número"
                    value={address}
                  />
                  <FormField
                    autoCapitalize="words"
                    label="Ciudad"
                    maxLength={100}
                    onChangeText={setCity}
                    placeholder="Barcelona"
                    value={city}
                  />
                  <FormField
                    autoCapitalize="words"
                    label="País"
                    maxLength={100}
                    onChangeText={setCountry}
                    placeholder="España"
                    value={country}
                  />
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Notas del grupo</Text>
                <View style={styles.formCard}>
                  <FormField
                    autoCapitalize="sentences"
                    label="Notas"
                    maxLength={1000}
                    multiline
                    onChangeText={setGroupNotes}
                    placeholder="Qué pedir, recomendaciones, detalles..."
                    style={styles.notesInput}
                    textAlignVertical="top"
                    value={groupNotes}
                  />
                </View>
              </View>

              {requestError ? (
                <View style={styles.errorCard}>
                  <Text style={styles.errorText}>{requestError}</Text>
                </View>
              ) : null}

              <Pressable
                accessibilityRole="button"
                disabled={!canSave}
                onPress={() => void handleSave()}
                style={({ pressed }) => [
                  styles.primaryButton,
                  pressed && canSave ? styles.primaryButtonPressed : null,
                  !canSave ? styles.primaryButtonDisabled : null,
                ]}
              >
                {isSaving ? (
                  <ActivityIndicator color={colors.white} size="small" />
                ) : (
                  <Text style={styles.primaryButtonText}>Guardar cambios</Text>
                )}
              </Pressable>
            </>
          ) : null}

          {!isLoading && !groupRestaurant && requestError ? (
            <View style={styles.errorCard}>
              <Text style={styles.errorText}>{requestError}</Text>
            </View>
          ) : null}
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
    gap: 22,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 34,
  },
  header: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerButton: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 19,
  },
  headerTitle: { color: colors.text, fontSize: 15, fontFamily: fonts.bold },
  saveText: { color: colors.primary, fontSize: 13, fontFamily: fonts.bold },
  disabledText: { opacity: 0.4 },
  loading: { alignItems: 'center', paddingVertical: 90 },
  heroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    padding: 16,
    borderRadius: 20,
    backgroundColor: '#FBE9E2',
  },
  heroIcon: {
    width: 54,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: colors.surface,
  },
  heroText: { flex: 1, gap: 4 },
  heroEyebrow: {
    color: colors.primary,
    fontSize: 9,
    fontFamily: fonts.bold,
    letterSpacing: 0.8,
  },
  heroTitle: { color: colors.text, fontSize: 17, fontFamily: fonts.bold },
  heroDescription: { color: colors.muted, fontSize: 10, lineHeight: 15 },
  section: { gap: 10 },
  sectionTitle: { color: colors.text, fontSize: 16, fontFamily: fonts.bold },
  formCard: {
    gap: 17,
    padding: 17,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    backgroundColor: colors.surface,
  },
  notesInput: { minHeight: 105, paddingTop: 14 },
  errorCard: {
    padding: 14,
    borderWidth: 1,
    borderColor: '#F3C5BC',
    borderRadius: 15,
    backgroundColor: '#FFF1EE',
  },
  errorText: { color: colors.danger, fontSize: 12, lineHeight: 18 },
  primaryButton: {
    minHeight: 54,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: colors.primary,
  },
  primaryButtonPressed: { backgroundColor: colors.primaryPressed },
  primaryButtonDisabled: { opacity: 0.45 },
  primaryButtonText: { color: colors.white, fontSize: 15, fontFamily: fonts.bold },
});
