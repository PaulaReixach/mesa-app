import { SymbolView } from 'expo-symbols';
import { router } from 'expo-router';
import { useState } from 'react';
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

import { useAuth } from '../../contexts/auth-context';
import { getErrorMessage } from '../../lib/api';
import { colors } from '../../theme/colors';

const registerColors = {
  primary: '#D85C3F',
  primaryPressed: '#BE4930',
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

export default function RegisterScreen() {
  const { signUp } = useAuth();

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

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

  async function handleRegister() {
    setRequestError(null);

    if (
      !name.trim()
      || !username.trim()
      || !email.trim()
      || !password
    ) {
      setRequestError(
        'Completa todos los campos para crear tu cuenta.',
      );
      return;
    }

    if (password.length < 8) {
      setRequestError(
        'La contraseña debe tener al menos 8 caracteres.',
      );
      return;
    }

    try {
      setIsSubmitting(true);

      await signUp({
        name: name.trim(),
        username: username.trim(),
        email: email.trim(),
        password,
        avatarUrl: null,
      });

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
                Crear cuenta
              </Text>

              <Text
                allowFontScaling={false}
                style={styles.subtitle}
              >
                Únete a Mesa y empieza a{'\n'}
                organizar tus planes.
              </Text>
            </View>

            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <View style={styles.iconContainer}>
                  <SymbolView
                    name={{
                      ios: 'person',
                      android: 'person',
                      web: 'person',
                    }}
                    size={21}
                    tintColor={colors.muted}
                  />
                </View>

                <View style={styles.inputContent}>
                  <Text
                    allowFontScaling={false}
                    style={styles.inputLabel}
                  >
                    Nombre
                  </Text>

                  <TextInput
                    allowFontScaling={false}
                    autoCapitalize="words"
                    autoComplete="name"
                    onChangeText={setName}
                    placeholder="Ej. Paula García"
                    placeholderTextColor={colors.muted}
                    returnKeyType="next"
                    style={styles.input}
                    value={name}
                  />
                </View>
              </View>

              <View style={styles.inputContainer}>
                <View style={styles.iconContainer}>
                  <SymbolView
                    name={{
                      ios: 'at',
                      android: 'alternate_email',
                      web: 'alternate_email',
                    }}
                    size={21}
                    tintColor={colors.muted}
                  />
                </View>

                <View style={styles.inputContent}>
                  <Text
                    allowFontScaling={false}
                    style={styles.inputLabel}
                  >
                    Username
                  </Text>

                  <TextInput
                    allowFontScaling={false}
                    autoCapitalize="none"
                    autoComplete="username"
                    autoCorrect={false}
                    onChangeText={setUsername}
                    placeholder="ej. paulagarcia"
                    placeholderTextColor={colors.muted}
                    returnKeyType="next"
                    style={styles.input}
                    value={username}
                  />
                </View>
              </View>

              <View style={styles.inputContainer}>
                <View style={styles.iconContainer}>
                  <SymbolView
                    name={{
                      ios: 'envelope',
                      android: 'mail',
                      web: 'mail',
                    }}
                    size={21}
                    tintColor={colors.muted}
                  />
                </View>

                <View style={styles.inputContent}>
                  <Text
                    allowFontScaling={false}
                    style={styles.inputLabel}
                  >
                    Email
                  </Text>

                  <TextInput
                    allowFontScaling={false}
                    autoCapitalize="none"
                    autoComplete="email"
                    autoCorrect={false}
                    keyboardType="email-address"
                    onChangeText={setEmail}
                    placeholder="tu@email.com"
                    placeholderTextColor={colors.muted}
                    returnKeyType="next"
                    style={styles.input}
                    value={email}
                  />
                </View>
              </View>

              <View style={styles.inputContainer}>
                <View style={styles.iconContainer}>
                  <SymbolView
                    name={{
                      ios: 'lock',
                      android: 'lock',
                      web: 'lock',
                    }}
                    size={21}
                    tintColor={colors.muted}
                  />
                </View>

                <View style={styles.inputContent}>
                  <Text
                    allowFontScaling={false}
                    style={styles.inputLabel}
                  >
                    Contraseña
                  </Text>

                  <TextInput
                    allowFontScaling={false}
                    autoCapitalize="none"
                    autoComplete="new-password"
                    onChangeText={setPassword}
                    onSubmitEditing={() => {
                      void handleRegister();
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
                </View>

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
                void handleRegister();
              }}
              style={({ pressed }) => [
                styles.registerButton,
                pressed && !isSubmitting
                  ? styles.registerButtonPressed
                  : null,
                isSubmitting
                  ? styles.registerButtonDisabled
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
                  style={styles.registerButtonText}
                >
                  Crear cuenta
                </Text>
              )}
            </Pressable>

            <View style={styles.divider} />

            <Pressable
              accessibilityRole="button"
              onPress={() => {
                router.replace('/login');
              }}
              style={styles.loginButton}
            >
              <Text
                allowFontScaling={false}
                style={styles.loginText}
              >
                ¿Ya tienes cuenta?{' '}
                <Text style={styles.loginStrong}>
                  Entrar
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
    paddingVertical: 32,
  },
  container: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  heading: {
    gap: 11,
    marginBottom: 31,
  },
  title: {
    color: colors.text,
    fontFamily: fonts.medium,
    fontSize: 30,
    fontWeight: '700',
    letterSpacing: -0.7,
    lineHeight: 36,
  },
  subtitle: {
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 23,
  },
  form: {
    gap: 15,
  },
  inputContainer: {
    minHeight: 68,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: registerColors.inputBorder,
    borderRadius: 15,
    backgroundColor:
      registerColors.inputBackground,
    paddingRight: 6,
  },
  iconContainer: {
    width: 48,
    minHeight: 66,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputContent: {
    flex: 1,
    justifyContent: 'center',
    gap: 3,
    paddingVertical: 9,
  },
  inputLabel: {
    color: colors.muted,
    fontFamily: fonts.medium,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 15,
  },
  input: {
    minHeight: 30,
    padding: 0,
    color: colors.text,
    fontFamily: fonts.regular,
    fontSize: 15,
    fontWeight: '400',
  },
  passwordInput: {
    paddingRight: 4,
  },
  eyeButton: {
    width: 48,
    height: 62,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyeButtonPressed: {
    opacity: 0.55,
  },
  errorContainer: {
    marginTop: 15,
    borderWidth: 1,
    borderColor: registerColors.errorBorder,
    borderRadius: 13,
    backgroundColor:
      registerColors.errorBackground,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  errorText: {
    color: colors.danger,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
  },
  registerButton: {
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 23,
    borderRadius: 28,
    backgroundColor:
      registerColors.primary,
    paddingHorizontal: 20,
  },
  registerButtonPressed: {
    backgroundColor:
      registerColors.primaryPressed,
  },
  registerButtonDisabled: {
    opacity: 0.65,
  },
  registerButtonText: {
    color: colors.white,
    fontFamily: fonts.medium,
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 21,
  },
  divider: {
    width: '100%',
    height: StyleSheet.hairlineWidth,
    marginTop: 29,
    backgroundColor:
      registerColors.divider,
  },
  loginButton: {
    alignItems: 'center',
    marginTop: 26,
    paddingVertical: 5,
  },
  loginText: {
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  },
  loginStrong: {
    color: registerColors.primary,
    fontFamily: fonts.medium,
    fontWeight: '600',
  },
});