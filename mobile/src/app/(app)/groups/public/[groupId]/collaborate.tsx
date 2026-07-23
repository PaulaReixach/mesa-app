import { SymbolView } from 'expo-symbols';
import {
  router,
  useLocalSearchParams,
} from 'expo-router';
import {
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '../../../../../contexts/auth-context';
import { getErrorMessage } from '../../../../../lib/api';
import {
  getPublicGroup,
  requestPublicGroupCollaboration,
} from '../../../../../services/group-service';
import { colors } from '../../../../../theme/colors';
import type { PublicGroupDetail } from '../../../../../types/group';
import { fonts } from '../../../../../theme/fonts';

const MAX_MESSAGE_LENGTH = 300;

export default function CollaboratePublicGroupScreen() {
  const { groupId } = useLocalSearchParams<{
    groupId: string;
  }>();
  const { accessToken } = useAuth();

  const [detail, setDetail] =
    useState<PublicGroupDetail | null>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load(): Promise<void> {
      if (!accessToken || !groupId) {
        setError('No se ha podido recuperar el grupo.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        setDetail(await getPublicGroup(groupId, accessToken));
      } catch (requestError) {
        setError(getErrorMessage(requestError));
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [accessToken, groupId]);

  const remainingCharacters = useMemo(
    () => MAX_MESSAGE_LENGTH - message.length,
    [message],
  );

  async function handleSubmit(): Promise<void> {
    if (!accessToken || !groupId || submitting) {
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await requestPublicGroupCollaboration(
        groupId,
        message.trim() || null,
        accessToken,
      );
      setSent(true);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SafeAreaView
      edges={['top', 'right', 'bottom', 'left']}
      style={styles.safeArea}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            disabled={submitting}
            onPress={() => router.back()}
            style={styles.iconButton}
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
            Solicitar colaboración
          </Text>

          <View style={styles.iconButton} />
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {loading ? (
            <View style={styles.centered}>
              <ActivityIndicator color={colors.primary} size="large" />
            </View>
          ) : null}

          {!loading && sent ? (
            <View style={styles.successCard}>
              <View style={styles.successIcon}>
                <SymbolView
                  name={{
                    ios: 'paperplane.fill',
                    android: 'send',
                    web: 'send',
                  }}
                  size={28}
                  tintColor="#607349"
                />
              </View>

              <Text style={styles.successTitle}>
                Solicitud enviada
              </Text>

              <Text style={styles.successText}>
                La persona creadora podrá aceptarla o rechazarla. Mientras tanto verás el estado pendiente en el grupo.
              </Text>

              <Pressable
                accessibilityRole="button"
                onPress={() => router.back()}
                style={styles.primaryButton}
              >
                <Text style={styles.primaryButtonText}>
                  Volver al grupo
                </Text>
              </Pressable>
            </View>
          ) : null}

          {!loading && detail && !sent ? (
            <>
              <View style={styles.introCard}>
                <Text style={styles.eyebrow}>
                  Quieres colaborar en
                </Text>
                <Text style={styles.groupName}>
                  {detail.group.name}
                </Text>
                <Text style={styles.introText}>
                  Si te aceptan, podrás participar como colaboradora y proponer restaurantes en la siguiente fase.
                </Text>
              </View>

              <View style={styles.formCard}>
                <View style={styles.labelRow}>
                  <Text style={styles.label}>
                    Mensaje opcional
                  </Text>
                  <Text style={styles.counter}>
                    {remainingCharacters}
                  </Text>
                </View>

                <TextInput
                  maxLength={MAX_MESSAGE_LENGTH}
                  multiline
                  onChangeText={setMessage}
                  placeholder="Cuéntale por qué te gustaría colaborar..."
                  placeholderTextColor={colors.muted}
                  selectionColor={colors.primary}
                  style={styles.input}
                  textAlignVertical="top"
                  value={message}
                />

                <Text style={styles.hint}>
                  Solo se permite una solicitud pendiente por grupo.
                </Text>
              </View>

              {error ? (
                <View style={styles.errorCard}>
                  <Text style={styles.errorText}>
                    {error}
                  </Text>
                </View>
              ) : null}

              <Pressable
                accessibilityRole="button"
                disabled={submitting}
                onPress={() => void handleSubmit()}
                style={({ pressed }) => [
                  styles.primaryButton,
                  submitting ? styles.buttonDisabled : null,
                  pressed ? styles.buttonPressed : null,
                ]}
              >
                {submitting ? (
                  <ActivityIndicator color={colors.white} size="small" />
                ) : (
                  <Text style={styles.primaryButtonText}>
                    Enviar solicitud
                  </Text>
                )}
              </Pressable>
            </>
          ) : null}

          {!loading && error && !detail ? (
            <View style={styles.errorCard}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}
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
  header: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
  },
  iconButton: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 19,
  },
  headerTitle: {
    color: colors.text,
    fontSize: 15,
    fontFamily: fonts.bold,
  },
  content: {
    flexGrow: 1,
    gap: 18,
    paddingHorizontal: 18,
    paddingBottom: 36,
  },
  centered: {
    alignItems: 'center',
    paddingVertical: 90,
  },
  introCard: {
    gap: 8,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 22,
    backgroundColor: colors.surface,
  },
  eyebrow: {
    color: colors.primary,
    fontSize: 10,
    fontFamily: fonts.bold,
    textTransform: 'uppercase',
  },
  groupName: {
    color: colors.text,
    fontSize: 22,
    lineHeight: 28,
    fontFamily: fonts.bold,
  },
  introText: {
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 18,
  },
  formCard: {
    gap: 10,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    backgroundColor: colors.surface,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    color: colors.text,
    fontSize: 13,
    fontFamily: fonts.bold,
  },
  counter: {
    color: colors.muted,
    fontSize: 11,
    fontFamily: fonts.bold,
  },
  input: {
    minHeight: 140,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    backgroundColor: colors.inputBackground,
    color: colors.text,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 19,
  },
  hint: {
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 10,
    lineHeight: 15,
  },
  primaryButton: {
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
    borderRadius: 18,
    backgroundColor: colors.primary,
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: 14,
    fontFamily: fonts.bold,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonPressed: {
    opacity: 0.75,
  },
  errorCard: {
    padding: 14,
    borderRadius: 15,
    backgroundColor: '#FFF1EE',
  },
  errorText: {
    color: colors.danger,
    fontFamily: fonts.regular,
    fontSize: 11,
    lineHeight: 16,
  },
  successCard: {
    alignItems: 'center',
    gap: 14,
    padding: 26,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 24,
    backgroundColor: colors.surface,
  },
  successIcon: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    backgroundColor: '#E8EEDD',
  },
  successTitle: {
    color: colors.text,
    fontSize: 21,
    fontFamily: fonts.bold,
    textAlign: 'center',
  },
  successText: {
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
  },
});
