import { SymbolView } from 'expo-symbols';
import { router } from 'expo-router';
import { useState } from 'react';
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
import { colors } from '../../theme/colors';

const loginColors = {
  primary: '#D85C3F',
  primaryPressed: '#BD4931',
  inputBorder: '#E4D9D2',
  inputBackground: '#FFFCFA',
  divider: '#E6DCD6',
  errorBackground: '#FFF1EE',
  errorBorder: '#F0BDB1',
};

const fonts = {
  regular:
    Platform.select({
      ios: 'System',
      android: 'sans-serif',
      default: 'sans-serif',
    }) ?? 'sans-serif',

  medium:
    Platform.select({
      ios: 'System',
      android: 'sans-serif-medium',
      default: 'sans-serif',
    }) ?? 'sans-serif',
};

export default function LoginScreen() {
  const { signIn } = useAuth();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  const [
    rememberSession,
    setRememberSession,
  ] = useState(true);

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

  async function handleLogin() {
    setRequestError(null);

    if (!identifier.trim() || !password) {
      setRequestError(
        'Introduce tu email y la contraseña.',
      );
      return;
    }

    try {
      setIsSubmitting(true);

      await signIn(
        {
          identifier: identifier.trim(),
          password,
        },
        rememberSession,
      );

      router.replace('/home');
    } catch (error) {
      setRequestError(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleForgotPassword() {
    Alert.alert(
      'Recuperar contraseña',
      'La recuperación de contraseña estará disponible próximamente.',
      [
        {
          text: 'Entendido',
        },
      ],
    );
  }

  return (
    <SafeAreaView
      edges={['top', 'right', 'bottom', 'left']}
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
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.container}>
            <View style={styles.heading}>
              <Text
                allowFontScaling={false}
                style={styles.title}
              >
                ¡Bienvenido de nuevo!
              </Text>

              <Text
                allowFontScaling={false}
                style={styles.subtitle}
              >
                Organiza y decide dónde comer
                {'\n'}
                con tu gente.
              </Text>
            </View>

            <View style={styles.fields}>
              <View style={styles.field}>
                <Text
                  allowFontScaling={false}
                  style={styles.label}
                >
                  Email
                </Text>

                <View style={styles.inputContainer}>
                  <TextInput
                    allowFontScaling={false}
                    autoCapitalize="none"
                    autoComplete="email"
                    autoCorrect={false}
                    keyboardType="email-address"
                    onChangeText={setIdentifier}
                    placeholder="tu@email.com"
                    placeholderTextColor={colors.muted}
                    returnKeyType="next"
                    style={styles.input}
                    value={identifier}
                  />
                </View>
              </View>

              <View style={styles.field}>
                <Text
                  allowFontScaling={false}
                  style={styles.label}
                >
                  Contraseña
                </Text>

                <View style={styles.inputContainer}>
                  <TextInput
                    allowFontScaling={false}
                    autoCapitalize="none"
                    autoComplete="password"
                    onChangeText={setPassword}
                    onSubmitEditing={() => {
                      void handleLogin();
                    }}
                    placeholder="••••••••"
                    placeholderTextColor={colors.muted}
                    returnKeyType="done"
                    secureTextEntry={!showPassword}
                    style={[
                      styles.input,
                      styles.passwordInput,
                    ]}
                    value={password}
                  />

                  <Pressable
                    accessibilityLabel={
                      showPassword
                        ? 'Ocultar contraseña'
                        : 'Mostrar contraseña'
                    }
                    accessibilityRole="button"
                    hitSlop={10}
                    onPress={() => {
                      setShowPassword(
                        (currentValue) =>
                          !currentValue,
                      );
                    }}
                    style={({ pressed }) => [
                      styles.eyeButton,
                      pressed
                        ? styles.eyeButtonPressed
                        : null,
                    ]}
                  >
                    <SymbolView
                      name={{
                        ios: showPassword
                          ? 'eye'
                          : 'eye.slash',
                        android: showPassword
                          ? 'visibility'
                          : 'visibility_off',
                        web: showPassword
                          ? 'visibility'
                          : 'visibility_off',
                      }}
                      size={23}
                      tintColor={colors.muted}
                    />
                  </Pressable>
                </View>
              </View>
            </View>

            <Pressable
              accessibilityRole="checkbox"
              accessibilityState={{
                checked: rememberSession,
              }}
              hitSlop={8}
              onPress={() => {
                setRememberSession(
                  (currentValue) =>
                    !currentValue,
                );
              }}
              style={styles.rememberRow}
            >
              <View
                style={[
                  styles.checkbox,
                  rememberSession
                    ? styles.checkboxSelected
                    : null,
                ]}
              >
                {rememberSession ? (
                  <Text
                    allowFontScaling={false}
                    style={styles.checkmark}
                  >
                    ✓
                  </Text>
                ) : null}
              </View>

              <Text
                allowFontScaling={false}
                style={styles.rememberText}
              >
                Recordarme
              </Text>
            </Pressable>

            {requestError ? (
              <View style={styles.errorContainer}>
                <Text
                  allowFontScaling={false}
                  style={styles.errorText}
                >
                  {requestError}
                </Text>
              </View>
            ) : null}

            <Pressable
              accessibilityRole="button"
              disabled={isSubmitting}
              onPress={() => {
                void handleLogin();
              }}
              style={({ pressed }) => [
                styles.loginButton,
                pressed && !isSubmitting
                  ? styles.loginButtonPressed
                  : null,
                isSubmitting
                  ? styles.loginButtonDisabled
                  : null,
              ]}
            >
              {isSubmitting ? (
                <ActivityIndicator
                  color={colors.white}
                  size="small"
                />
              ) : (
                <Text
                  allowFontScaling={false}
                  style={styles.loginButtonText}
                >
                  Entrar
                </Text>
              )}
            </Pressable>

            <Pressable
              accessibilityRole="button"
              onPress={handleForgotPassword}
              style={styles.forgotButton}
            >
              <Text
                allowFontScaling={false}
                style={styles.forgotText}
              >
                ¿Has olvidado tu contraseña?
              </Text>
            </Pressable>

            <View style={styles.divider} />

            <Pressable
              accessibilityRole="button"
              onPress={() => {
                router.push('/register');
              }}
              style={styles.registerButton}
            >
              <Text
                allowFontScaling={false}
                style={styles.registerText}
              >
                ¿No tienes cuenta?{' '}
                <Text style={styles.registerStrong}>
                  Crear cuenta
                </Text>
              </Text>
            </Pressable>
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
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 34,
  },
  container: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
    transform: [
      {
        translateY: 8,
      },
    ],
  },
  heading: {
    gap: 10,
    marginBottom: 42,
  },
  title: {
    color: colors.text,
    fontFamily: fonts.medium,
    fontSize: 30,
    fontWeight: '700',
    letterSpacing: -0.7,
    lineHeight: 33,
  },
  subtitle: {
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 22,
  },
  fields: {
    gap: 23,
  },
  field: {
    gap: 9,
  },
  label: {
    color: colors.text,
    fontFamily: fonts.medium,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 18,
  },
  inputContainer: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: loginColors.inputBorder,
    borderRadius: 12,
    backgroundColor:
      loginColors.inputBackground,
  },
  input: {
    flex: 1,
    height: 54,
    paddingHorizontal: 16,
    paddingVertical: 0,
    color: colors.text,
    fontFamily: fonts.regular,
    fontSize: 15,
    fontWeight: '400',
  },
  passwordInput: {
    paddingRight: 0,
  },
  eyeButton: {
    width: 52,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyeButtonPressed: {
    opacity: 0.55,
  },
  rememberRow: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    marginTop: 19,
  },
  checkbox: {
    width: 19,
    height: 19,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.3,
    borderColor: loginColors.inputBorder,
    borderRadius: 999,
    backgroundColor: colors.surface,
  },
  checkboxSelected: {
    borderColor: loginColors.primary,
    backgroundColor: loginColors.primary,
  },
  checkmark: {
    color: colors.white,
    fontFamily: fonts.medium,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 14,
  },
  rememberText: {
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
  errorContainer: {
    marginTop: 15,
    borderWidth: 1,
    borderColor: loginColors.errorBorder,
    borderRadius: 11,
    backgroundColor:
      loginColors.errorBackground,
    paddingHorizontal: 13,
    paddingVertical: 10,
  },
  errorText: {
    color: colors.danger,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 17,
  },
  loginButton: {
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 25,
    borderRadius: 28,
    backgroundColor: loginColors.primary,
    paddingHorizontal: 20,
  },
  loginButtonPressed: {
    backgroundColor:
      loginColors.primaryPressed,
  },
  loginButtonDisabled: {
    opacity: 0.65,
  },
  loginButtonText: {
    color: colors.white,
    fontFamily: fonts.medium,
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 20,
  },
  forgotButton: {
    alignItems: 'center',
    marginTop: 23,
    paddingVertical: 3,
  },
  forgotText: {
    color: loginColors.primary,
    fontFamily: fonts.medium,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  divider: {
    width: '100%',
    height: StyleSheet.hairlineWidth,
    marginTop: 30,
    backgroundColor: loginColors.divider,
  },
  registerButton: {
    alignItems: 'center',
    marginTop: 27,
    paddingVertical: 4,
  },
  registerText: {
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 18,
  },
  registerStrong: {
    color: loginColors.primary,
    fontFamily: fonts.medium,
    fontWeight: '600',
  },
});