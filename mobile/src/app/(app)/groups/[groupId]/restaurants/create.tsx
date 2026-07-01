import {
  router,
  useLocalSearchParams,
} from 'expo-router';
import { useState } from 'react';
import {
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
import { PrimaryButton } from '../../../../../components/PrimaryButton';
import { useAuth } from '../../../../../contexts/auth-context';
import { getErrorMessage } from '../../../../../lib/api';
import { createGroupRestaurant } from '../../../../../services/restaurant-service';
import { colors } from '../../../../../theme/colors';

export default function CreateRestaurantScreen() {
  const { groupId } = useLocalSearchParams<{
    groupId: string;
  }>();

  const { accessToken } = useAuth();

  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [category, setCategory] = useState('');
  const [groupNotes, setGroupNotes] = useState('');
  const [requestError, setRequestError] =
    useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] =
    useState(false);

  async function handleCreateRestaurant() {
    setRequestError(null);

    if (!name.trim()) {
      setRequestError(
        'Introduce el nombre del restaurante.',
      );
      return;
    }

    if (!accessToken || !groupId) {
      setRequestError(
        'No se ha podido recuperar tu sesión o el grupo.',
      );
      return;
    }

    try {
      setIsSubmitting(true);

      await createGroupRestaurant(
        groupId,
        {
          provider: null,
          externalPlaceId: null,
          name: name.trim(),
          address: address.trim() || null,
          city: city.trim() || null,
          country: null,
          latitude: null,
          longitude: null,
          category: category.trim() || null,
          groupNotes: groupNotes.trim() || null,
        },
        accessToken,
      );

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
              Por ahora puedes añadirlo manualmente.
              Después conectaremos la búsqueda por mapa.
            </Text>
          </View>

          <View style={styles.form}>
            <FormField
              autoCapitalize="words"
              label="Nombre del restaurante"
              maxLength={150}
              onChangeText={setName}
              placeholder="Kaizen Sushi"
              value={name}
            />

            <FormField
              autoCapitalize="sentences"
              label="Dirección"
              maxLength={300}
              onChangeText={setAddress}
              placeholder="Carrer de Exemple, 10"
              value={address}
            />

            <FormField
              autoCapitalize="words"
              label="Ciudad"
              maxLength={100}
              onChangeText={setCity}
              placeholder="Girona"
              value={city}
            />

            <FormField
              autoCapitalize="words"
              label="Categoría"
              maxLength={100}
              onChangeText={setCategory}
              placeholder="Japonés"
              value={category}
            />

            <FormField
              label="Notas para el grupo"
              maxLength={1000}
              multiline
              onChangeText={setGroupNotes}
              placeholder="Nos lo han recomendado"
              style={styles.notesInput}
              textAlignVertical="top"
              value={groupNotes}
            />

            {requestError ? (
              <Text style={styles.error}>
                {requestError}
              </Text>
            ) : null}

            <PrimaryButton
              loading={isSubmitting}
              onPress={handleCreateRestaurant}
              title="Guardar restaurante"
            />
          </View>
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
    paddingBottom: 32,
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
    marginBottom: 28,
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
  form: {
    gap: 20,
  },
  notesInput: {
    minHeight: 105,
    paddingTop: 15,
  },
  error: {
    color: colors.danger,
    fontSize: 14,
    lineHeight: 20,
  },
});