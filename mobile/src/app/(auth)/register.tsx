import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SymbolView } from 'expo-symbols';
import {
  useRef,
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
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '../../contexts/auth-context';
import { getErrorMessage } from '../../lib/api';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/fonts';

const MAX_SCREEN_WIDTH = 430;

const registerColors = {
  heroStart: '#C74A2D',
  heroEnd: '#B83C25',
  cardTop: '#FAF7F4',
  cardMiddle: '#FFFCF9',
  cardBottom: '#FFFFFF',
  primary: '#C7482B',
  primaryEnd: '#D55636',
  primaryPressed: '#A93B25',
  inputBorder: '#C8BBB3',
  inputBorderFocused: '#C9684E',
  inputBackground: 'rgba(255, 255, 255, 0.64)',
  text: '#2A211D',
  muted: '#756A65',
  cream: '#FFF8F2',
  success: '#78896F',
  errorBackground: colors.dangerSoft,
  errorBorder: '#E7B7AE',
};

const serifFont = Platform.select({
  ios: 'Georgia',
  android: 'serif',
  default: 'serif',
});

type FocusedField = 'name' | 'username' | 'email' | 'password' | null;

export default function RegisterScreen() {
  const { signUp } = useAuth();
  const insets = useSafeAreaInsets();
  const {
    height: windowHeight,
    width: windowWidth,
  } = useWindowDimensions();

  const usernameInputRef = useRef<TextInput>(null);
  const emailInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<FocusedField>(null);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const contentWidth = Math.min(windowWidth, MAX_SCREEN_WIDTH);
  const widthScale = contentWidth / MAX_SCREEN_WIDTH;
  const heroHeight = Math.max(
    177 * widthScale,
    insets.top + 153 * widthScale,
  );
  const cardRadius = 34 * widthScale;
  const horizontalPadding = Math.max(29, 36 * widthScale);
  const fieldHeight = Math.max(52, 56 * widthScale);
  const cardMinHeight = Math.max(
    windowHeight - heroHeight,
    584 * widthScale,
  );
  const cardBottomPadding = Math.max(insets.bottom + 8, 18);

  const normalizedUsername = username.trim();
  const usernameHasValidLength = normalizedUsername.length >= 3
    && normalizedUsername.length <= 50;

  async function handleRegister() {
    setRequestError(null);

    if (
      !name.trim()
      || !username.trim()
      || !email.trim()
      || !password
    ) {
      setRequestError('Completa todos los campos para crear tu cuenta.');
      return;
    }

    if (!usernameHasValidLength) {
      setRequestError('El nombre de usuario debe tener entre 3 y 50 caracteres.');
      return;
    }

    if (password.length < 8) {
      setRequestError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }

    if (!acceptedTerms) {
      setRequestError(
        'Acepta los términos de uso y la política de privacidad para continuar.',
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

  function handleLegalPress(documentName: string) {
    Alert.alert(
      documentName,
      `El documento de ${documentName.toLowerCase()} estará disponible próximamente.`,
      [
        {
          text: 'Entendido',
        },
      ],
    );
  }

  function handleBack() {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace('/login');
  }

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />

      <View
        pointerEvents="box-none"
        style={[
          styles.hero,
          {
            height: heroHeight + 1,
            left: (windowWidth - contentWidth) / 2,
            width: contentWidth,
          },
        ]}
      >
        <LinearGradient
          colors={[
            registerColors.heroStart,
            registerColors.heroEnd,
          ]}
          end={{
            x: 0.95,
            y: 1,
          }}
          pointerEvents="none"
          start={{
            x: 0.08,
            y: 0,
          }}
          style={StyleSheet.absoluteFill}
        />

        <Pressable
          accessibilityLabel="Volver"
          accessibilityRole="button"
          hitSlop={8}
          onPress={handleBack}
          style={({ pressed }) => [
            styles.backButton,
            {
              height: 34 * widthScale,
              left: 23 * widthScale,
              top: insets.top + 18 * widthScale,
              width: 34 * widthScale,
            },
            pressed ? styles.heroControlPressed : null,
          ]}
        >
          <SymbolView
            name={{
              android: 'arrow_back',
              ios: 'arrow.left',
              web: 'arrow_back',
            }}
            size={22 * widthScale}
            tintColor={registerColors.cream}
          />
        </Pressable>

        <View
          accessibilityLabel="Mesa"
          accessibilityRole="image"
          pointerEvents="none"
          style={[
            styles.brand,
            {
              top: insets.top + 20 * widthScale,
            },
          ]}
        >
          <View
            style={[
              styles.brandIcon,
              {
                borderRadius: 7 * widthScale,
                height: 22 * widthScale,
                width: 22 * widthScale,
              },
            ]}
          >
            <Text
              allowFontScaling={false}
              style={[
                styles.brandLetter,
                {
                  fontSize: 16 * widthScale,
                  lineHeight: 19 * widthScale,
                },
              ]}
            >
              M
            </Text>
          </View>

          <Text
            allowFontScaling={false}
            style={[
              styles.wordmark,
              {
                fontSize: 21 * widthScale,
                lineHeight: 25 * widthScale,
              },
            ]}
          >
            Mesa
          </Text>
        </View>

        <View
          pointerEvents="none"
          style={[
            styles.heroHeading,
            {
              bottom: 23 * widthScale,
              paddingHorizontal: 26 * widthScale,
            },
          ]}
        >
          <Text
            allowFontScaling={false}
            style={[
              styles.title,
              {
                fontSize: 29 * widthScale,
                lineHeight: 35 * widthScale,
              },
            ]}
          >
            Crea tu cuenta
          </Text>

          <Text
            allowFontScaling={false}
            style={[
              styles.subtitle,
              {
                fontSize: 15 * widthScale,
                lineHeight: 20 * widthScale,
              },
            ]}
          >
            Tu próxima mesa está a un minuto.
          </Text>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          bounces={false}
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingTop: heroHeight,
            },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View
            style={[
              styles.card,
              {
                borderTopLeftRadius: cardRadius,
                borderTopRightRadius: cardRadius,
                minHeight: cardMinHeight,
                width: contentWidth,
              },
            ]}
          >
            <LinearGradient
              colors={[
                registerColors.cardTop,
                registerColors.cardMiddle,
                registerColors.cardBottom,
              ]}
              end={{
                x: 0.78,
                y: 1,
              }}
              pointerEvents="none"
              start={{
                x: 0.18,
                y: 0,
              }}
              style={StyleSheet.absoluteFill}
            />

            <View
              style={[
                styles.formContent,
                {
                  paddingBottom: cardBottomPadding,
                  paddingHorizontal: horizontalPadding,
                  paddingTop: 30,
                },
              ]}
            >
              <View style={styles.fields}>
                <View style={styles.field}>
                  <Text
                    allowFontScaling={false}
                    style={styles.label}
                  >
                    Nombre
                  </Text>

                  <View
                    style={[
                      styles.inputContainer,
                      {
                        height: fieldHeight,
                      },
                      focusedField === 'name'
                        ? styles.inputContainerFocused
                        : null,
                    ]}
                  >
                    <View style={styles.leadingIcon}>
                      <SymbolView
                        name={{
                          android: 'person',
                          ios: 'person',
                          web: 'person',
                        }}
                        size={24}
                        tintColor={registerColors.text}
                      />
                    </View>

                    <TextInput
                      allowFontScaling={false}
                      autoCapitalize="words"
                      autoComplete="name"
                      onBlur={() => {
                        setFocusedField(null);
                      }}
                      onChangeText={setName}
                      onFocus={() => {
                        setFocusedField('name');
                      }}
                      onSubmitEditing={() => {
                        usernameInputRef.current?.focus();
                      }}
                      placeholder="Paula García"
                      placeholderTextColor={registerColors.muted}
                      returnKeyType="next"
                      style={styles.input}
                      value={name}
                    />
                  </View>
                </View>

                <View style={styles.field}>
                  <Text
                    allowFontScaling={false}
                    style={styles.label}
                  >
                    Nombre de usuario
                  </Text>

                  <View
                    style={[
                      styles.inputContainer,
                      {
                        height: fieldHeight,
                      },
                      focusedField === 'username'
                        ? styles.inputContainerFocused
                        : null,
                    ]}
                  >
                    <View style={styles.leadingIcon}>
                      <SymbolView
                        name={{
                          android: 'alternate_email',
                          ios: 'at',
                          web: 'alternate_email',
                        }}
                        size={25}
                        tintColor={registerColors.text}
                      />
                    </View>

                    <TextInput
                      ref={usernameInputRef}
                      allowFontScaling={false}
                      autoCapitalize="none"
                      autoComplete="username"
                      autoCorrect={false}
                      maxLength={50}
                      onBlur={() => {
                        setFocusedField(null);
                      }}
                      onChangeText={setUsername}
                      onFocus={() => {
                        setFocusedField('username');
                      }}
                      onSubmitEditing={() => {
                        emailInputRef.current?.focus();
                      }}
                      placeholder="paulagarcia"
                      placeholderTextColor={registerColors.muted}
                      returnKeyType="next"
                      style={styles.input}
                      value={username}
                    />

                    {usernameHasValidLength ? (
                      <View
                        accessibilityLabel="Nombre de usuario con formato disponible"
                        style={styles.usernameCheck}
                      >
                        <SymbolView
                          name={{
                            android: 'check',
                            ios: 'checkmark',
                            web: 'check',
                          }}
                          size={18}
                          tintColor={colors.white}
                        />
                      </View>
                    ) : null}
                  </View>

                  <View style={styles.usernameStatusRow}>
                    {usernameHasValidLength ? (
                      <Text
                        allowFontScaling={false}
                        style={styles.usernameStatus}
                      >
                        Disponible
                      </Text>
                    ) : null}
                  </View>
                </View>

                <View style={styles.field}>
                  <Text
                    allowFontScaling={false}
                    style={styles.label}
                  >
                    Email
                  </Text>

                  <View
                    style={[
                      styles.inputContainer,
                      {
                        height: fieldHeight,
                      },
                      focusedField === 'email'
                        ? styles.inputContainerFocused
                        : null,
                    ]}
                  >
                    <View style={styles.leadingIcon}>
                      <SymbolView
                        name={{
                          android: 'mail',
                          ios: 'envelope',
                          web: 'mail',
                        }}
                        size={23}
                        tintColor={registerColors.text}
                      />
                    </View>

                    <TextInput
                      ref={emailInputRef}
                      allowFontScaling={false}
                      autoCapitalize="none"
                      autoComplete="email"
                      autoCorrect={false}
                      keyboardType="email-address"
                      onBlur={() => {
                        setFocusedField(null);
                      }}
                      onChangeText={setEmail}
                      onFocus={() => {
                        setFocusedField('email');
                      }}
                      onSubmitEditing={() => {
                        passwordInputRef.current?.focus();
                      }}
                      placeholder="paula@email.com"
                      placeholderTextColor={registerColors.muted}
                      returnKeyType="next"
                      style={styles.input}
                      value={email}
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

                  <View
                    style={[
                      styles.inputContainer,
                      {
                        height: fieldHeight,
                      },
                      focusedField === 'password'
                        ? styles.inputContainerFocused
                        : null,
                    ]}
                  >
                    <View style={styles.leadingIcon}>
                      <SymbolView
                        name={{
                          android: 'lock',
                          ios: 'lock',
                          web: 'lock',
                        }}
                        size={23}
                        tintColor={registerColors.text}
                      />
                    </View>

                    <TextInput
                      ref={passwordInputRef}
                      allowFontScaling={false}
                      autoCapitalize="none"
                      autoComplete="new-password"
                      onBlur={() => {
                        setFocusedField(null);
                      }}
                      onChangeText={setPassword}
                      onFocus={() => {
                        setFocusedField('password');
                      }}
                      onSubmitEditing={() => {
                        void handleRegister();
                      }}
                      placeholder="••••••••"
                      placeholderTextColor={registerColors.text}
                      returnKeyType="done"
                      secureTextEntry={!showPassword}
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
                      hitSlop={8}
                      onPress={() => {
                        setShowPassword((currentValue) => !currentValue);
                      }}
                      style={({ pressed }) => [
                        styles.eyeButton,
                        pressed ? styles.controlPressed : null,
                      ]}
                    >
                      <SymbolView
                        name={{
                          android: showPassword
                            ? 'visibility'
                            : 'visibility_off',
                          ios: showPassword
                            ? 'eye'
                            : 'eye.slash',
                          web: showPassword
                            ? 'visibility'
                            : 'visibility_off',
                        }}
                        size={24}
                        tintColor={registerColors.muted}
                      />
                    </Pressable>
                  </View>

                  <Text
                    allowFontScaling={false}
                    style={styles.passwordHint}
                  >
                    Mínimo 8 caracteres
                  </Text>
                </View>
              </View>

              <View style={styles.termsRow}>
                <Pressable
                  accessibilityRole="checkbox"
                  accessibilityState={{
                    checked: acceptedTerms,
                  }}
                  hitSlop={8}
                  onPress={() => {
                    setAcceptedTerms((currentValue) => !currentValue);
                  }}
                  style={({ pressed }) => [
                    styles.checkbox,
                    acceptedTerms ? styles.checkboxSelected : null,
                    pressed ? styles.controlPressed : null,
                  ]}
                >
                  {acceptedTerms ? (
                    <Text
                      allowFontScaling={false}
                      style={styles.checkmark}
                    >
                      ✓
                    </Text>
                  ) : null}
                </Pressable>

                <Text
                  allowFontScaling={false}
                  style={styles.termsText}
                >
                  Acepto los{' '}
                  <Text
                    accessibilityRole="link"
                    onPress={() => {
                      handleLegalPress('Términos de uso');
                    }}
                    style={styles.termsLink}
                  >
                    Términos de uso
                  </Text>
                  {' '}y la{' '}
                  <Text
                    accessibilityRole="link"
                    onPress={() => {
                      handleLegalPress('Política de privacidad');
                    }}
                    style={styles.termsLink}
                  >
                    Política de privacidad
                  </Text>
                  .
                </Text>
              </View>

              {requestError ? (
                <View
                  accessibilityLiveRegion="polite"
                  style={styles.errorContainer}
                >
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
                  isSubmitting ? styles.registerButtonDisabled : null,
                ]}
              >
                <LinearGradient
                  colors={[
                    registerColors.primary,
                    registerColors.primaryEnd,
                  ]}
                  end={{
                    x: 1,
                    y: 0.7,
                  }}
                  pointerEvents="none"
                  start={{
                    x: 0,
                    y: 0.2,
                  }}
                  style={StyleSheet.absoluteFill}
                />

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
                    Crear mi cuenta
                  </Text>
                )}
              </Pressable>

              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  router.replace('/login');
                }}
                style={({ pressed }) => [
                  styles.loginButton,
                  pressed ? styles.controlPressed : null,
                ]}
              >
                <Text
                  allowFontScaling={false}
                  style={styles.loginText}
                >
                  ¿Ya tienes cuenta?{' '}
                  <Text style={styles.loginStrong}>
                    Inicia sesión
                  </Text>
                </Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: registerColors.heroStart,
  },
  hero: {
    position: 'absolute',
    top: 0,
    overflow: 'hidden',
  },
  backButton: {
    position: 'absolute',
    zIndex: 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: registerColors.cream,
    borderRadius: 999,
  },
  heroControlPressed: {
    opacity: 0.62,
  },
  brand: {
    position: 'absolute',
    right: 0,
    left: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  brandIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: registerColors.cream,
  },
  brandLetter: {
    marginTop: -1,
    color: registerColors.primary,
    fontFamily: serifFont,
    fontStyle: 'italic',
    fontWeight: '500',
  },
  wordmark: {
    color: registerColors.cream,
    fontFamily: serifFont,
    fontWeight: '400',
    letterSpacing: -0.7,
  },
  heroHeading: {
    position: 'absolute',
    right: 0,
    left: 0,
  },
  title: {
    color: registerColors.cream,
    fontFamily: fonts.bold,
    letterSpacing: -0.8,
  },
  subtitle: {
    marginTop: 4,
    color: '#FFD9CB',
    fontFamily: fonts.medium,
    letterSpacing: -0.15,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
  },
  card: {
    position: 'relative',
    overflow: 'hidden',
  },
  formContent: {
    flexGrow: 1,
  },
  fields: {
    gap: 13,
  },
  field: {
    width: '100%',
  },
  label: {
    marginBottom: 0,
    paddingLeft: 14,
    color: registerColors.text,
    fontFamily: fonts.medium,
    fontSize: 13,
    lineHeight: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: registerColors.inputBorder,
    borderRadius: 10,
    backgroundColor: registerColors.inputBackground,
  },
  inputContainerFocused: {
    borderWidth: 1.4,
    borderColor: registerColors.inputBorderFocused,
  },
  leadingIcon: {
    width: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 0,
    paddingVertical: 0,
    color: registerColors.text,
    fontFamily: fonts.regular,
    fontSize: 16,
  },
  eyeButton: {
    width: 50,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  usernameCheck: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
    borderRadius: 12,
    backgroundColor: registerColors.success,
  },
  usernameStatusRow: {
    height: 19,
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingTop: 2,
    paddingRight: 8,
  },
  usernameStatus: {
    color: registerColors.success,
    fontFamily: fonts.semiBold,
    fontSize: 12.5,
    lineHeight: 16,
  },
  passwordHint: {
    marginTop: 5,
    paddingLeft: 14,
    color: registerColors.muted,
    fontFamily: fonts.regular,
    fontSize: 12.5,
    lineHeight: 17,
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 13,
    marginTop: 9,
    paddingHorizontal: 8,
  },
  checkbox: {
    width: 25,
    height: 25,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
    borderWidth: 1.2,
    borderColor: registerColors.inputBorder,
    borderRadius: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.74)',
  },
  checkboxSelected: {
    borderColor: registerColors.primary,
    backgroundColor: registerColors.primary,
  },
  checkmark: {
    marginTop: -1,
    color: colors.white,
    fontFamily: fonts.semiBold,
    fontSize: 18,
    lineHeight: 20,
  },
  termsText: {
    flex: 1,
    color: registerColors.text,
    fontFamily: fonts.regular,
    fontSize: 14.5,
    lineHeight: 20,
  },
  termsLink: {
    color: registerColors.primary,
    fontFamily: fonts.medium,
    textDecorationLine: 'underline',
  },
  controlPressed: {
    opacity: 0.58,
  },
  errorContainer: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: registerColors.errorBorder,
    borderRadius: 9,
    backgroundColor: registerColors.errorBackground,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  errorText: {
    color: colors.danger,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 17,
  },
  registerButton: {
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
    overflow: 'hidden',
    borderRadius: 8,
  },
  registerButtonPressed: {
    opacity: 0.86,
  },
  registerButtonDisabled: {
    opacity: 0.64,
  },
  registerButtonText: {
    color: colors.white,
    fontFamily: fonts.semiBold,
    fontSize: 17,
    lineHeight: 22,
  },
  loginButton: {
    alignItems: 'center',
    marginTop: 13,
    paddingVertical: 1,
  },
  loginText: {
    color: registerColors.text,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
  },
  loginStrong: {
    color: registerColors.primary,
    fontFamily: fonts.semiBold,
  },
});
