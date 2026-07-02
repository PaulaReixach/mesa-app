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
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '../../contexts/auth-context';
import { getErrorMessage } from '../../lib/api';
import { deleteCurrentUserAccount } from '../../services/account-service';
import { colors } from '../../theme/colors';

export default function DeleteAccountScreen() {
  const {
    accessToken,
    signOut,
  } = useAuth();

  const [
    password,
    setPassword,
  ] = useState('');

  const [
    confirmation,
    setConfirmation,
  ] = useState('');

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    requestError,
    setRequestError,
  ] = useState<string | null>(null);

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false);

  const canDelete = useMemo(() => {
    return (
      password.length > 0
      && confirmation
        .trim()
        .toUpperCase()
        === 'ELIMINAR'
    );
  }, [
    confirmation,
    password,
  ]);

  async function performDelete() {
    if (!accessToken) {
      setRequestError(
        'No se ha podido recuperar tu sesión.',
      );
      return;
    }

    try {
      setIsSubmitting(true);
      setRequestError(null);

      await deleteCurrentUserAccount(
        {
          password,
        },
        accessToken,
      );

      await signOut();

      router.replace('/login');
    } catch (error) {
      setRequestError(
        getErrorMessage(error),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function confirmDeletion() {
    setRequestError(null);

    if (!canDelete) {
      setRequestError(
        'Introduce tu contraseña y escribe ELIMINAR para continuar.',
      );
      return;
    }

    Alert.alert(
      'Eliminar cuenta definitivamente',
      'Esta acción no se puede deshacer. Se cerrará tu sesión y perderás el acceso a la cuenta.',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            void performDelete();
          },
        },
      ],
    );
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
              disabled={isSubmitting}
              onPress={() => router.back()}
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
              Eliminar cuenta
            </Text>

            <View style={styles.headerPlaceholder} />
          </View>

          <View style={styles.warningHeader}>
            <View style={styles.warningIcon}>
              <SymbolView
                name={{
                  ios: 'exclamationmark.triangle.fill',
                  android: 'warning',
                  web: 'warning',
                }}
                size={30}
                tintColor={colors.danger}
              />
            </View>

            <Text style={styles.warningTitle}>
              Esta acción es permanente
            </Text>

            <Text style={styles.warningText}>
              Tu perfil, foto, valoraciones y membresías
              se eliminarán. Los grupos que hayas creado
              también dejarán de estar disponibles.
            </Text>
          </View>

          <View style={styles.separator} />

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>
              Contraseña actual
            </Text>

            <View style={styles.inputContainer}>
              <SymbolView
                name={{
                  ios: 'lock',
                  android: 'lock',
                  web: 'lock',
                }}
                size={18}
                tintColor={colors.muted}
              />

              <TextInput
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isSubmitting}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor={colors.muted}
                secureTextEntry={!showPassword}
                selectionColor={colors.primary}
                style={styles.input}
                value={password}
              />

              <Pressable
                accessibilityLabel={
                  showPassword
                    ? 'Ocultar contraseña'
                    : 'Mostrar contraseña'
                }
                accessibilityRole="button"
                onPress={() => {
                  setShowPassword(
                    current => !current,
                  );
                }}
                style={styles.eyeButton}
              >
                <SymbolView
                  name={{
                    ios: showPassword
                      ? 'eye.slash'
                      : 'eye',
                    android: showPassword
                      ? 'visibility_off'
                      : 'visibility',
                    web: showPassword
                      ? 'visibility_off'
                      : 'visibility',
                  }}
                  size={19}
                  tintColor={colors.muted}
                />
              </Pressable>
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>
              Escribe ELIMINAR para confirmar
            </Text>

            <View style={styles.inputContainer}>
              <SymbolView
                name={{
                  ios: 'text.cursor',
                  android: 'text_fields',
                  web: 'text_fields',
                }}
                size={18}
                tintColor={colors.muted}
              />

              <TextInput
                autoCapitalize="characters"
                autoCorrect={false}
                editable={!isSubmitting}
                onChangeText={setConfirmation}
                onSubmitEditing={confirmDeletion}
                placeholder="ELIMINAR"
                placeholderTextColor={colors.muted}
                returnKeyType="done"
                selectionColor={colors.danger}
                style={styles.input}
                value={confirmation}
              />
            </View>
          </View>

          {requestError ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>
                {requestError}
              </Text>
            </View>
          ) : null}

          <Pressable
            accessibilityRole="button"
            disabled={
              !canDelete
              || isSubmitting
            }
            onPress={confirmDeletion}
            style={({ pressed }) => [
              styles.deleteButton,
              pressed
              && canDelete
              && !isSubmitting
                ? styles.deleteButtonPressed
                : null,
              !canDelete
              || isSubmitting
                ? styles.deleteButtonDisabled
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
                    ios: 'trash',
                    android: 'delete',
                    web: 'delete',
                  }}
                  size={19}
                  tintColor={colors.white}
                />

                <Text style={styles.deleteButtonText}>
                  Eliminar mi cuenta
                </Text>
              </>
            )}
          </Pressable>
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
    paddingHorizontal: 22,
    paddingTop: 8,
    paddingBottom: 34,
  },
  header: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 28,
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
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  warningHeader: {
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  warningIcon: {
    width: 68,
    height: 68,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
    borderRadius: 34,
    backgroundColor: '#FFF0ED',
  },
  warningTitle: {
    color: colors.danger,
    fontSize: 19,
    fontWeight: '800',
  },
  warningText: {
    maxWidth: 330,
    marginTop: 8,
    color: colors.muted,
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
  },
  separator: {
    height: 1,
    marginVertical: 27,
    backgroundColor: colors.border,
  },
  field: {
    gap: 8,
    marginBottom: 20,
  },
  fieldLabel: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  inputContainer: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 15,
    backgroundColor: colors.inputBackground,
    paddingLeft: 15,
  },
  input: {
    flex: 1,
    minHeight: 52,
    color: colors.text,
    fontSize: 15,
  },
  eyeButton: {
    width: 46,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorBox: {
    marginTop: 2,
    borderWidth: 1,
    borderColor: '#F0C2B8',
    borderRadius: 14,
    backgroundColor: '#FFF1EE',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  errorText: {
    color: colors.danger,
    fontSize: 13,
    lineHeight: 19,
  },
  deleteButton: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 28,
    borderRadius: 27,
    backgroundColor: colors.danger,
  },
  deleteButtonPressed: {
    opacity: 0.82,
  },
  deleteButtonDisabled: {
    opacity: 0.42,
  },
  deleteButtonText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
});