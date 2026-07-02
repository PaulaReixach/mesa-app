import { SymbolView } from 'expo-symbols';
import { router } from 'expo-router';
import {
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
import { changeCurrentUserPassword } from '../../services/account-service';
import { colors } from '../../theme/colors';

type PasswordFieldProps = {
  label: string;
  value: string;
  visible: boolean;
  editable: boolean;
  onChangeText: (value: string) => void;
  onToggleVisible: () => void;
  returnKeyType?: 'next' | 'done';
  onSubmitEditing?: () => void;
};

function PasswordField({
  label,
  value,
  visible,
  editable,
  onChangeText,
  onToggleVisible,
  returnKeyType = 'next',
  onSubmitEditing,
}: PasswordFieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>
        {label}
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
          editable={editable}
          onChangeText={onChangeText}
          onSubmitEditing={onSubmitEditing}
          placeholder="••••••••"
          placeholderTextColor={colors.muted}
          returnKeyType={returnKeyType}
          secureTextEntry={!visible}
          selectionColor={colors.primary}
          style={styles.input}
          value={value}
        />

        <Pressable
          accessibilityLabel={
            visible
              ? 'Ocultar contraseña'
              : 'Mostrar contraseña'
          }
          accessibilityRole="button"
          onPress={onToggleVisible}
          style={styles.eyeButton}
        >
          <SymbolView
            name={{
              ios: visible
                ? 'eye.slash'
                : 'eye',
              android: visible
                ? 'visibility_off'
                : 'visibility',
              web: visible
                ? 'visibility_off'
                : 'visibility',
            }}
            size={19}
            tintColor={colors.muted}
          />
        </Pressable>
      </View>
    </View>
  );
}

export default function ChangePasswordScreen() {
  const {
    accessToken,
    signOut,
  } = useAuth();

  const [
    currentPassword,
    setCurrentPassword,
  ] = useState('');

  const [
    newPassword,
    setNewPassword,
  ] = useState('');

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState('');

  const [
    showCurrentPassword,
    setShowCurrentPassword,
  ] = useState(false);

  const [
    showNewPassword,
    setShowNewPassword,
  ] = useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const [
    requestError,
    setRequestError,
  ] = useState<string | null>(null);

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false);

  async function closeSession() {
    await signOut();
    router.replace('/login');
  }

  async function handleSave() {
    setRequestError(null);

    if (
      !currentPassword
      || !newPassword
      || !confirmPassword
    ) {
      setRequestError(
        'Completa los tres campos.',
      );
      return;
    }

    if (newPassword.length < 8) {
      setRequestError(
        'La nueva contraseña debe tener al menos 8 caracteres.',
      );
      return;
    }

    if (newPassword.length > 72) {
      setRequestError(
        'La nueva contraseña no puede superar los 72 caracteres.',
      );
      return;
    }

    if (
      newPassword
      !== confirmPassword
    ) {
      setRequestError(
        'Las contraseñas nuevas no coinciden.',
      );
      return;
    }

    if (
      currentPassword
      === newPassword
    ) {
      setRequestError(
        'La nueva contraseña debe ser diferente de la actual.',
      );
      return;
    }

    if (!accessToken) {
      setRequestError(
        'No se ha podido recuperar tu sesión.',
      );
      return;
    }

    try {
      setIsSubmitting(true);

      await changeCurrentUserPassword(
        {
          currentPassword,
          newPassword,
        },
        accessToken,
      );

      Alert.alert(
        'Contraseña actualizada',
        'Por seguridad, vuelve a iniciar sesión con tu nueva contraseña.',
        [
          {
            text: 'Aceptar',
            onPress: () => {
              void closeSession();
            },
          },
        ],
        {
          cancelable: false,
        },
      );
    } catch (error) {
      setRequestError(
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
              Cambiar contraseña
            </Text>

            <View style={styles.headerPlaceholder} />
          </View>

          <View style={styles.intro}>
            <View style={styles.introIcon}>
              <SymbolView
                name={{
                  ios: 'key.fill',
                  android: 'key',
                  web: 'key',
                }}
                size={28}
                tintColor={colors.primary}
              />
            </View>

            <Text style={styles.introTitle}>
              Protege tu cuenta
            </Text>

            <Text style={styles.introText}>
              Introduce tu contraseña actual y elige
              una nueva de al menos 8 caracteres.
            </Text>
          </View>

          <View style={styles.form}>
            <PasswordField
              editable={!isSubmitting}
              label="Contraseña actual"
              onChangeText={setCurrentPassword}
              onToggleVisible={() => {
                setShowCurrentPassword(
                  current => !current,
                );
              }}
              value={currentPassword}
              visible={showCurrentPassword}
            />

            <PasswordField
              editable={!isSubmitting}
              label="Nueva contraseña"
              onChangeText={setNewPassword}
              onToggleVisible={() => {
                setShowNewPassword(
                  current => !current,
                );
              }}
              value={newPassword}
              visible={showNewPassword}
            />

            <PasswordField
              editable={!isSubmitting}
              label="Repite la nueva contraseña"
              onChangeText={setConfirmPassword}
              onSubmitEditing={() => {
                void handleSave();
              }}
              onToggleVisible={() => {
                setShowConfirmPassword(
                  current => !current,
                );
              }}
              returnKeyType="done"
              value={confirmPassword}
              visible={showConfirmPassword}
            />
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
            disabled={isSubmitting}
            onPress={() => {
              void handleSave();
            }}
            style={({ pressed }) => [
              styles.saveButton,
              pressed && !isSubmitting
                ? styles.saveButtonPressed
                : null,
              isSubmitting
                ? styles.saveButtonDisabled
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
                    ios: 'checkmark',
                    android: 'check',
                    web: 'check',
                  }}
                  size={20}
                  tintColor={colors.white}
                />

                <Text style={styles.saveButtonText}>
                  Actualizar contraseña
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
  intro: {
    alignItems: 'center',
    marginBottom: 32,
  },
  introIcon: {
    width: 62,
    height: 62,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    borderRadius: 31,
    backgroundColor: '#F8E9E4',
  },
  introTitle: {
    color: colors.text,
    fontSize: 19,
    fontWeight: '800',
  },
  introText: {
    maxWidth: 310,
    marginTop: 7,
    color: colors.muted,
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
  },
  form: {
    gap: 20,
  },
  field: {
    gap: 8,
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
    marginTop: 20,
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
  saveButton: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 28,
    borderRadius: 27,
    backgroundColor: colors.primary,
  },
  saveButtonPressed: {
    backgroundColor: colors.primaryPressed,
  },
  saveButtonDisabled: {
    opacity: 0.65,
  },
  saveButtonText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
});