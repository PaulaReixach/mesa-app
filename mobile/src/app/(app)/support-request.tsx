import { SymbolView } from 'expo-symbols';
import { router } from 'expo-router';
import {
  useMemo,
  useState,
} from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  SafeAreaView,
} from 'react-native-safe-area-context';

import {
  useAuth,
} from '../../contexts/auth-context';
import {
  getErrorMessage,
} from '../../lib/api';
import {
  createSupportRequest,
} from '../../services/support-service';
import { colors } from '../../theme/colors';
import {
  SupportRequestCategory,
} from '../../types/support';
import { fonts } from '../../theme/fonts';

type CategoryOption = {
  value: SupportRequestCategory;
  label: string;
};

const categoryOptions: CategoryOption[] = [
  {
    value: 'TECHNICAL_PROBLEM',
    label: 'Problema técnico',
  },
  {
    value: 'ACCOUNT',
    label: 'Mi cuenta',
  },
  {
    value: 'SUGGESTION',
    label: 'Sugerencia',
  },
  {
    value: 'OTHER',
    label: 'Otro',
  },
];

const SUBJECT_MAX_LENGTH = 120;
const MESSAGE_MAX_LENGTH = 1500;

export default function SupportRequestScreen() {
  const {
    accessToken,
  } = useAuth();

  const [
    category,
    setCategory,
  ] =
    useState<SupportRequestCategory>(
      'TECHNICAL_PROBLEM',
    );

  const [
    subject,
    setSubject,
  ] = useState('');

  const [
    message,
    setMessage,
  ] = useState('');

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    return (
      subject.trim().length >= 4
      && message.trim().length >= 10
      && !isSubmitting
      && Boolean(accessToken)
    );
  }, [
    accessToken,
    isSubmitting,
    message,
    subject,
  ]);

  async function handleSubmit():
  Promise<void> {
    if (
      !accessToken
      || !canSubmit
    ) {
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      await createSupportRequest(
        {
          category,
          subject: subject.trim(),
          message: message.trim(),
        },
        accessToken,
      );

      Alert.alert(
        'Solicitud enviada',
        'Tu solicitud ha quedado registrada correctamente.',
        [
          {
            text: 'Entendido',
            onPress: () => {
              router.back();
            },
          },
        ],
      );
    } catch (error) {
      setErrorMessage(
        getErrorMessage(error),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SafeAreaView
      edges={[
        'top',
        'right',
        'bottom',
        'left',
      ]}
      style={styles.safeArea}
    >
      <KeyboardAvoidingView
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : undefined
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
              accessibilityLabel="Volver"
              accessibilityRole="button"
              onPress={() => {
                router.back();
              }}
              style={({ pressed }) => [
                styles.headerButton,

                pressed
                  ? styles.headerButtonPressed
                  : null,
              ]}
            >
              <SymbolView
                name={{
                  ios: 'chevron.left',
                  android: 'arrow_back',
                  web: 'arrow_back',
                }}
                size={20}
                tintColor={colors.text}
              />
            </Pressable>

            <Text style={styles.headerTitle}>
              Contactar con soporte
            </Text>

            <View
              style={styles.headerPlaceholder}
            />
          </View>

          <Text style={styles.description}>
            Cuéntanos qué ha ocurrido con el
            máximo detalle posible.
          </Text>

          <View style={styles.field}>
            <Text style={styles.label}>
              Categoría
            </Text>

            <View style={styles.categories}>
              {categoryOptions.map(option => {
                const selected =
                  category === option.value;

                return (
                  <Pressable
                    key={option.value}
                    accessibilityRole="button"
                    onPress={() => {
                      setCategory(option.value);
                    }}
                    style={({ pressed }) => [
                      styles.categoryButton,

                      selected
                        ? styles.categoryButtonSelected
                        : null,

                      pressed
                        ? styles.categoryButtonPressed
                        : null,
                    ]}
                  >
                    <Text
                      style={[
                        styles.categoryText,

                        selected
                          ? styles.categoryTextSelected
                          : null,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.field}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>
                Asunto
              </Text>

              <Text style={styles.characterCount}>
                {subject.length}
                /
                {SUBJECT_MAX_LENGTH}
              </Text>
            </View>

            <TextInput
              autoCapitalize="sentences"
              maxLength={SUBJECT_MAX_LENGTH}
              onChangeText={setSubject}
              placeholder="Resume brevemente el problema"
              placeholderTextColor={colors.muted}
              returnKeyType="next"
              style={styles.input}
              value={subject}
            />
          </View>

          <View style={styles.field}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>
                Mensaje
              </Text>

              <Text style={styles.characterCount}>
                {message.length}
                /
                {MESSAGE_MAX_LENGTH}
              </Text>
            </View>

            <TextInput
              autoCapitalize="sentences"
              maxLength={MESSAGE_MAX_LENGTH}
              multiline
              onChangeText={setMessage}
              placeholder="Explica qué estabas haciendo, qué esperabas que ocurriera y qué sucedió finalmente."
              placeholderTextColor={colors.muted}
              style={[
                styles.input,
                styles.messageInput,
              ]}
              textAlignVertical="top"
              value={message}
            />
          </View>

          {errorMessage ? (
            <View style={styles.errorBox}>
              <SymbolView
                name={{
                  ios: 'exclamationmark.triangle.fill',
                  android: 'warning',
                  web: 'warning',
                }}
                size={18}
                tintColor={colors.danger}
              />

              <Text style={styles.errorText}>
                {errorMessage}
              </Text>
            </View>
          ) : null}

          <Pressable
            accessibilityRole="button"
            disabled={!canSubmit}
            onPress={() => {
              void handleSubmit();
            }}
            style={({ pressed }) => [
              styles.submitButton,

              !canSubmit
                ? styles.submitButtonDisabled
                : null,

              pressed && canSubmit
                ? styles.submitButtonPressed
                : null,
            ]}
          >
            {isSubmitting ? (
              <ActivityIndicator
                color={colors.white}
                size="small"
              />
            ) : (
              <>
                <SymbolView
                  name={{
                    ios: 'paperplane.fill',
                    android: 'send',
                    web: 'send',
                  }}
                  size={18}
                  tintColor={colors.white}
                />

                <Text
                  style={styles.submitButtonText}
                >
                  Enviar solicitud
                </Text>
              </>
            )}
          </Pressable>

          <Text style={styles.helperText}>
            La solicitud quedará asociada a tu
            cuenta para que podamos identificar
            correctamente el problema.
          </Text>
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
    paddingHorizontal: 22,
    paddingTop: 8,
    paddingBottom: 40,
  },

  header: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },

  headerButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
  },

  headerButtonPressed: {
    backgroundColor: '#F6EFE9',
  },

  headerPlaceholder: {
    width: 36,
    height: 36,
  },

  headerTitle: {
    color: colors.text,
    fontSize: 19,
    fontFamily: fonts.bold,
    letterSpacing: -0.3,
  },

  description: {
    maxWidth: 330,
    alignSelf: 'center',
    marginBottom: 30,
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
  },

  field: {
    marginBottom: 24,
  },

  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },

  label: {
    marginBottom: 8,
    color: colors.text,
    fontSize: 14,
    fontFamily: fonts.bold,
  },

  characterCount: {
    marginBottom: 8,
    color: colors.muted,
    fontSize: 11,
    fontFamily: fonts.semiBold,
  },

  categories: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 9,
  },

  categoryButton: {
    minHeight: 38,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 19,
    backgroundColor: colors.surface,
  },

  categoryButtonSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },

  categoryButtonPressed: {
    opacity: 0.74,
  },

  categoryText: {
    color: colors.muted,
    fontSize: 12,
    fontFamily: fonts.bold,
  },

  categoryTextSelected: {
    color: colors.white,
  },

  input: {
    minHeight: 52,
    paddingHorizontal: 15,
    paddingVertical: 13,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    backgroundColor: colors.surface,
    color: colors.text,
    fontFamily: fonts.regular,
    fontSize: 14,
  },

  messageInput: {
    minHeight: 170,
    lineHeight: 21,
  },

  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    marginBottom: 18,
    padding: 13,
    borderWidth: 1,
    borderColor: '#F1C8C3',
    borderRadius: 14,
    backgroundColor: '#FFF0EE',
  },

  errorText: {
    flex: 1,
    color: colors.danger,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 17,
  },

  submitButton: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    borderRadius: 26,
    backgroundColor: colors.primary,
  },

  submitButtonDisabled: {
    opacity: 0.45,
  },

  submitButtonPressed: {
    backgroundColor: colors.primaryPressed,
  },

  submitButtonText: {
    color: colors.white,
    fontSize: 15,
    fontFamily: fonts.bold,
  },

  helperText: {
    marginTop: 13,
    paddingHorizontal: 20,
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 11,
    lineHeight: 16,
    textAlign: 'center',
  },
});