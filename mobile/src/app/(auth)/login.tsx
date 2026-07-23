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
  Image,
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

import { loginHeroImage } from '../../assets/LoginHeroImage';
import { useAuth } from '../../contexts/auth-context';
import { getErrorMessage } from '../../lib/api';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/fonts';

const HERO_SOURCE_WIDTH = 852;
const HERO_SOURCE_HEIGHT = 830;
const HERO_SOURCE_TOP_INSET = 70;
const HERO_CARD_TOP = 789;
const MAX_SCREEN_WIDTH = 430;

const loginColors = {
  background: '#C65336',
  cardTop: '#F9F5F2',
  cardMiddle: '#FFFCF9',
  cardBottom: '#FFFFFF',
  primary: '#C64A2E',
  primaryPressed: '#A93B25',
  buttonStart: '#C94E30',
  buttonEnd: '#BE4028',
  inputBorder: '#BEB5AF',
  inputBorderFocused: '#C9684E',
  inputBackground: 'rgba(255, 255, 255, 0.62)',
  text: '#222222',
  muted: '#67615E',
  errorBackground: colors.dangerSoft,
  errorBorder: '#E7B7AE',
};

type FocusedField = 'identifier' | 'password' | null;

export default function LoginScreen() {
  const { signIn } = useAuth();
  const insets = useSafeAreaInsets();
  const {
    height: windowHeight,
    width: windowWidth,
  } = useWindowDimensions();
  const passwordInputRef = useRef<TextInput>(null);

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [rememberSession, setRememberSession] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<FocusedField>(null);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const contentWidth = Math.min(windowWidth, MAX_SCREEN_WIDTH);
  const heroScale = contentWidth / HERO_SOURCE_WIDTH;
  const heroTop = Math.max(
    insets.top,
    HERO_SOURCE_TOP_INSET * heroScale,
  );
  const cardTop = heroTop
    + (HERO_CARD_TOP - HERO_SOURCE_TOP_INSET) * heroScale;
  const cardRadius = 96 * heroScale;
  const horizontalPadding = contentWidth < 360 ? 24 : 32;
  const cardMinHeight = Math.max(windowHeight - cardTop, 484);
  const cardBottomPadding = Math.max(insets.bottom + 10, 34);

  async function handleLogin() {
    setRequestError(null);

    if (!identifier.trim() || !password) {
      setRequestError('Introduce tu email y la contraseña.');
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
    <View style={styles.screen}>
      <StatusBar style="light" />

      <View
        pointerEvents="none"
        style={[
          styles.heroCanvas,
          {
            left: (windowWidth - contentWidth) / 2,
            width: contentWidth,
          },
        ]}
      >
        <Image
          accessible={false}
          resizeMode="contain"
          source={loginHeroImage}
          style={[
            styles.heroImage,
            {
              height: HERO_SOURCE_HEIGHT * heroScale,
              top: heroTop,
              width: contentWidth,
            },
          ]}
        />
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
              paddingTop: cardTop,
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
                loginColors.cardTop,
                loginColors.cardMiddle,
                loginColors.cardBottom,
              ]}
              end={{
                x: 0.72,
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
                },
              ]}
            >
              <View style={styles.heading}>
                <Text
                  allowFontScaling={false}
                  style={styles.title}
                >
                  Qué bien verte
                </Text>

                <Text
                  allowFontScaling={false}
                  style={styles.subtitle}
                >
                  Entra y vuelve a compartir buenos planes.
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

                  <View
                    style={[
                      styles.inputContainer,
                      focusedField === 'identifier'
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
                        size={22}
                        tintColor={loginColors.text}
                      />
                    </View>

                    <TextInput
                      allowFontScaling={false}
                      autoCapitalize="none"
                      autoComplete="email"
                      autoCorrect={false}
                      keyboardType="email-address"
                      onBlur={() => {
                        setFocusedField(null);
                      }}
                      onChangeText={setIdentifier}
                      onFocus={() => {
                        setFocusedField('identifier');
                      }}
                      onSubmitEditing={() => {
                        passwordInputRef.current?.focus();
                      }}
                      placeholder="tu@email.com"
                      placeholderTextColor={loginColors.muted}
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

                  <View
                    style={[
                      styles.inputContainer,
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
                        size={22}
                        tintColor={loginColors.text}
                      />
                    </View>

                    <TextInput
                      ref={passwordInputRef}
                      allowFontScaling={false}
                      autoCapitalize="none"
                      autoComplete="password"
                      onBlur={() => {
                        setFocusedField(null);
                      }}
                      onChangeText={setPassword}
                      onFocus={() => {
                        setFocusedField('password');
                      }}
                      onSubmitEditing={() => {
                        void handleLogin();
                      }}
                      placeholder="••••••••"
                      placeholderTextColor={loginColors.muted}
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
                          android: showPassword ? 'visibility_off' : 'visibility',
                          ios: showPassword ? 'eye.slash' : 'eye',
                          web: showPassword ? 'visibility_off' : 'visibility',
                        }}
                        size={24}
                        tintColor={loginColors.text}
                      />
                    </Pressable>
                  </View>
                </View>
              </View>

              <View style={styles.optionsRow}>
                <Pressable
                  accessibilityRole="checkbox"
                  accessibilityState={{
                    checked: rememberSession,
                  }}
                  hitSlop={8}
                  onPress={() => {
                    setRememberSession((currentValue) => !currentValue);
                  }}
                  style={({ pressed }) => [
                    styles.rememberButton,
                    pressed ? styles.controlPressed : null,
                  ]}
                >
                  <View
                    style={[
                      styles.checkbox,
                      rememberSession ? styles.checkboxSelected : null,
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
                    numberOfLines={1}
                    style={styles.rememberText}
                  >
                    Recordarme
                  </Text>
                </Pressable>

                <Pressable
                  accessibilityRole="button"
                  hitSlop={8}
                  onPress={handleForgotPassword}
                  style={({ pressed }) => [
                    styles.forgotButton,
                    pressed ? styles.controlPressed : null,
                  ]}
                >
                  <Text
                    adjustsFontSizeToFit
                    allowFontScaling={false}
                    minimumFontScale={0.86}
                    numberOfLines={1}
                    style={styles.forgotText}
                  >
                    ¿Has olvidado tu contraseña?
                  </Text>
                </Pressable>
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
                  void handleLogin();
                }}
                style={({ pressed }) => [
                  styles.loginButton,
                  pressed && !isSubmitting ? styles.loginButtonPressed : null,
                  isSubmitting ? styles.loginButtonDisabled : null,
                ]}
              >
                <LinearGradient
                  colors={[
                    loginColors.buttonStart,
                    loginColors.buttonEnd,
                  ]}
                  end={{
                    x: 1,
                    y: 0.8,
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
                    style={styles.loginButtonText}
                  >
                    Entrar
                  </Text>
                )}
              </Pressable>

              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  router.push('/register');
                }}
                style={({ pressed }) => [
                  styles.registerButton,
                  pressed ? styles.controlPressed : null,
                ]}
              >
                <Text
                  allowFontScaling={false}
                  style={styles.registerText}
                >
                  ¿Aún no tienes cuenta?{' '}
                  <Text style={styles.registerStrong}>
                    Crear cuenta
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
    backgroundColor: loginColors.background,
  },
  heroCanvas: {
    position: 'absolute',
    top: 0,
    bottom: 0,
  },
  heroImage: {
    position: 'absolute',
    left: 0,
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
    paddingTop: 54,
  },
  heading: {
    width: '100%',
  },
  title: {
    color: loginColors.text,
    fontFamily: fonts.bold,
    fontSize: 30,
    letterSpacing: -0.7,
    lineHeight: 38,
  },
  subtitle: {
    marginTop: 5,
    color: loginColors.muted,
    fontFamily: fonts.regular,
    fontSize: 14.5,
    letterSpacing: 0.05,
    lineHeight: 21,
  },
  fields: {
    gap: 15,
    marginTop: 14,
  },
  field: {
    gap: 7,
  },
  label: {
    color: loginColors.text,
    fontFamily: fonts.semiBold,
    fontSize: 14.5,
    lineHeight: 18,
  },
  inputContainer: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: loginColors.inputBorder,
    borderRadius: 10,
    backgroundColor: loginColors.inputBackground,
  },
  inputContainerFocused: {
    borderWidth: 1.4,
    borderColor: loginColors.inputBorderFocused,
  },
  leadingIcon: {
    width: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    height: 50,
    paddingHorizontal: 0,
    paddingVertical: 0,
    color: loginColors.text,
    fontFamily: fonts.regular,
    fontSize: 14.5,
  },
  eyeButton: {
    width: 52,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionsRow: {
    minHeight: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 17,
  },
  rememberButton: {
    minHeight: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.2,
    borderColor: loginColors.inputBorder,
    borderRadius: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.72)',
  },
  checkboxSelected: {
    borderColor: loginColors.primary,
    backgroundColor: loginColors.primary,
  },
  checkmark: {
    marginTop: -1,
    color: colors.white,
    fontFamily: fonts.semiBold,
    fontSize: 15,
    lineHeight: 17,
  },
  rememberText: {
    color: loginColors.text,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
  },
  forgotButton: {
    minHeight: 20,
    maxWidth: '62%',
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  forgotText: {
    color: loginColors.primary,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'right',
  },
  controlPressed: {
    opacity: 0.58,
  },
  errorContainer: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: loginColors.errorBorder,
    borderRadius: 9,
    backgroundColor: loginColors.errorBackground,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  errorText: {
    color: colors.danger,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 17,
  },
  loginButton: {
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
    overflow: 'hidden',
    borderRadius: 9,
  },
  loginButtonPressed: {
    opacity: 0.86,
  },
  loginButtonDisabled: {
    opacity: 0.64,
  },
  loginButtonText: {
    color: colors.white,
    fontFamily: fonts.semiBold,
    fontSize: 16,
    lineHeight: 20,
  },
  registerButton: {
    alignItems: 'center',
    marginTop: 23,
    paddingVertical: 1,
  },
  registerText: {
    color: loginColors.text,
    fontFamily: fonts.regular,
    fontSize: 13.5,
    lineHeight: 22,
    textAlign: 'center',
  },
  registerStrong: {
    color: loginColors.primary,
    fontFamily: fonts.semiBold,
  },
});
