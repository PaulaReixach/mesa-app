import { router } from 'expo-router';
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

import { FormField } from '../../../components/FormField';
import { PrimaryButton } from '../../../components/PrimaryButton';
import { useAuth } from '../../../contexts/auth-context';
import { getErrorMessage } from '../../../lib/api';
import { createGroup } from '../../../services/group-service';
import { colors } from '../../../theme/colors';
import { GroupPrivacy } from '../../../types/group';

export default function CreateGroupScreen() {
  const { accessToken } = useAuth();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [city, setCity] = useState('');
  const [privacy, setPrivacy] =
    useState<GroupPrivacy>('PRIVATE');
  const [requestError, setRequestError] =
    useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleCreateGroup() {
    setRequestError(null);

    if (!name.trim()) {
      setRequestError(
        'Introduce un nombre para el grupo.',
      );
      return;
    }

    if (!accessToken) {
      setRequestError(
        'Tu sesión no está disponible. Inicia sesión de nuevo.',
      );
      return;
    }

    try {
      setIsSubmitting(true);

      await createGroup(
        {
          name: name.trim(),
          description: description.trim() || null,
          imageUrl: null,
          city: city.trim() || null,
          privacy,
        },
        accessToken,
      );

      router.replace('/home');
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
              Crear grupo
            </Text>

            <View style={styles.headerSpacer} />
          </View>

          <View style={styles.heading}>
            <Text style={styles.title}>
              ¿Con quién vas a compartir mesa?
            </Text>

            <Text style={styles.subtitle}>
              Podrás invitar a más personas después.
            </Text>
          </View>

          <View style={styles.form}>
            <FormField
              autoCapitalize="sentences"
              label="Nombre del grupo"
              maxLength={100}
              onChangeText={setName}
              placeholder="Paula y Angel"
              value={name}
            />

            <FormField
              label="Descripción"
              maxLength={500}
              multiline
              onChangeText={setDescription}
              placeholder="Restaurantes pendientes y favoritos"
              style={styles.descriptionInput}
              textAlignVertical="top"
              value={description}
            />

            <FormField
              autoCapitalize="words"
              label="Ciudad principal"
              maxLength={100}
              onChangeText={setCity}
              placeholder="Palma"
              value={city}
            />

            <View style={styles.privacySection}>
              <Text style={styles.label}>Privacidad</Text>

              <View style={styles.privacyOptions}>
                <PrivacyOption
                  active={privacy === 'PRIVATE'}
                  description="Solo podrán verlo sus miembros"
                  label="Privado"
                  onPress={() => setPrivacy('PRIVATE')}
                />

                <PrivacyOption
                  active={privacy === 'PUBLIC'}
                  description="Será visible públicamente"
                  label="Público"
                  onPress={() => setPrivacy('PUBLIC')}
                />
              </View>
            </View>

            {requestError ? (
              <Text style={styles.error}>
                {requestError}
              </Text>
            ) : null}

            <PrimaryButton
              loading={isSubmitting}
              onPress={handleCreateGroup}
              title="Crear grupo"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

type PrivacyOptionProps = {
  active: boolean;
  label: string;
  description: string;
  onPress: () => void;
};

function PrivacyOption({
  active,
  label,
  description,
  onPress,
}: PrivacyOptionProps) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={[
        styles.privacyOption,
        active ? styles.privacyOptionActive : null,
      ]}
    >
      <View
        style={[
          styles.radio,
          active ? styles.radioActive : null,
        ]}
      >
        {active ? <View style={styles.radioDot} /> : null}
      </View>

      <View style={styles.privacyText}>
        <Text style={styles.privacyLabel}>
          {label}
        </Text>

        <Text style={styles.privacyDescription}>
          {description}
        </Text>
      </View>
    </Pressable>
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
  descriptionInput: {
    minHeight: 105,
    paddingTop: 15,
  },
  privacySection: {
    gap: 8,
  },
  label: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  privacyOptions: {
    gap: 10,
  },
  privacyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    backgroundColor: colors.surface,
    padding: 15,
  },
  privacyOptionActive: {
    borderColor: colors.primary,
    backgroundColor: '#FFF1EC',
  },
  radio: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 999,
  },
  radioActive: {
    borderColor: colors.primary,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    backgroundColor: colors.primary,
  },
  privacyText: {
    flex: 1,
    gap: 3,
  },
  privacyLabel: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  privacyDescription: {
    color: colors.muted,
    fontSize: 13,
  },
  error: {
    color: colors.danger,
    fontSize: 14,
    lineHeight: 20,
  },
});