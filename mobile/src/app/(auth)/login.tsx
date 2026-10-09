import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SymbolView } from 'expo-symbols';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Image,
  Keyboard,
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
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { FormField } from '../../components/FormField';
import { PrimaryButton } from '../../components/PrimaryButton';
import { useAuth } from '../../contexts/auth-context';
import { getErrorMessage } from '../../lib/api';
import { colors, loginColors } from '../../theme/colors';
import { fonts } from '../../theme/fonts';
import { radii } from '../../theme/layout';

const MAX_SCREEN_WIDTH = 430;
const serifFont = Platform.select({
  ios: 'Georgia',
  android: 'serif',
  default: 'Georgia',
});

export default function LoginScreen() {
  const { signIn } = useAuth();
  const insets = useSafeAreaInsets();
  const { width, height, fontScale } = useWindowDimensions();
  const emailInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);
  const scrollRef = useRef<ScrollView>(null);
  const requestInFlight = useRef(false);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [rememberSession, setRememberSession] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [identifierError, setIdentifierError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const contentWidth = Math.min(width - insets.left - insets.right, MAX_SCREEN_WIDTH);
  const compact = height - insets.top - insets.bottom < 700;
  const horizontalPadding = contentWidth < 360 ? 20 : 24;
  const showIllustration = !keyboardVisible && fontScale <= 1.2 && contentWidth >= 350;

  useEffect(() => {
    const show = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => setKeyboardVisible(true),
    );
    const hide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setKeyboardVisible(false),
    );
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  async function handleLogin() {
    // A ref also prevents simultaneous keyboard and button submissions.
    if (requestInFlight.current) return;

    setRequestError(null);
    setIdentifierError(identifier.trim() ? null : 'Introduce tu email.');
    setPasswordError(password ? null : 'Introduce tu contraseña.');

    if (!identifier.trim() || !password) {
      if (!identifier.trim()) {
        emailInputRef.current?.focus();
      } else {
        passwordInputRef.current?.focus();
      }
      return;
    }

    requestInFlight.current = true;
    setIsSubmitting(true);
    try {
      await signIn({ identifier: identifier.trim(), password }, rememberSession);
      router.replace('/home');
    } catch (error) {
      setRequestError(getErrorMessage(error));
    } finally {
      requestInFlight.current = false;
      setIsSubmitting(false);
    }
  }

  function handleForgotPassword() {
    Alert.alert(
      'Recuperar contraseña',
      'La recuperación de contraseña estará disponible próximamente.',
      [{ text: 'Entendido' }],
    );
  }

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.screen}>
      <StatusBar style="light" />
      <View style={[styles.statusBarInset, { height: insets.top }]} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          ref={scrollRef}
          bounces={false}
          contentContainerStyle={styles.scrollContent}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => {
            // Keep the error and retry action visible when feedback expands the form.
            if (requestError) scrollRef.current?.scrollToEnd({ animated: false });
          }}
        >
          <View style={styles.content}>
            <View style={[
              styles.hero,
              {
                paddingTop: keyboardVisible ? 12 : compact ? 16 : 20,
                paddingHorizontal: horizontalPadding,
              },
              compact && styles.compactHero,
              keyboardVisible && styles.keyboardHero,
            ]}>
              {showIllustration && (
                <View pointerEvents="none" style={StyleSheet.absoluteFill}>
                  <Image
                    accessible={false}
                    importantForAccessibility="no"
                    resizeMode="contain"
                    source={require('../../../assets/images/login-header-table.png')}
                    style={[styles.heroImage, {
                      width: contentWidth,
                      height: contentWidth / 2,
                      right: -contentWidth * 0.1,
                    }]}
                  />
                </View>
              )}
              <View accessible accessibilityLabel="Mesa" style={styles.brand}>
                <View style={styles.logo}>
                  <Text maxFontSizeMultiplier={1} style={styles.logoLetter}>M</Text>
                </View>
                <Text maxFontSizeMultiplier={1.2} style={styles.brandName}>Mesa</Text>
              </View>
              {!keyboardVisible && (
                <Text style={[
                  styles.tagline,
                  showIllustration && styles.taglineWithIllustration,
                  showIllustration && { width: 180 * fontScale },
                ]}>
                  Los mejores planes empiezan alrededor de una mesa.
                </Text>
              )}
            </View>

            <View style={[styles.card, { paddingHorizontal: horizontalPadding }]}>
              <View style={styles.heading}>
                <Text accessibilityRole="header" style={styles.title}>Qué bien verte</Text>
                <Text style={styles.subtitle}>Tus planes te esperan.</Text>
              </View>

              <View style={styles.fields}>
                <FormField
                  variant="login"
                  label="Email"
                  inputRef={emailInputRef}
                  error={identifierError}
                  value={identifier}
                  placeholder="tu@email.com"
                  editable={!isSubmitting}
                  autoCapitalize="none"
                  autoComplete="username"
                  autoCorrect={false}
                  importantForAutofill="yes"
                  keyboardType="email-address"
                  returnKeyType="next"
                  submitBehavior="submit"
                  onChangeText={value => {
                    setIdentifier(value);
                    setIdentifierError(null);
                    setRequestError(null);
                  }}
                  onSubmitEditing={() => passwordInputRef.current?.focus()}
                />
                <FormField
                  variant="login"
                  label="Contraseña"
                  inputRef={passwordInputRef}
                  error={passwordError}
                  value={password}
                  placeholder="Tu contraseña"
                  editable={!isSubmitting}
                  autoCapitalize="none"
                  autoComplete="current-password"
                  autoCorrect={false}
                  importantForAutofill="yes"
                  secureTextEntry={!showPassword}
                  returnKeyType="go"
                  submitBehavior="submit"
                  onChangeText={value => {
                    setPassword(value);
                    setPasswordError(null);
                    setRequestError(null);
                  }}
                  onSubmitEditing={() => void handleLogin()}
                  rightAccessory={(
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                      accessibilityState={{ disabled: isSubmitting }}
                      disabled={isSubmitting}
                      onPress={() => setShowPassword(value => !value)}
                      style={({ pressed }) => [styles.eyeButton, pressed && styles.pressed]}
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
                  )}
                />
              </View>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Recuperar contraseña"
                accessibilityState={{ disabled: isSubmitting }}
                disabled={isSubmitting}
                onPress={handleForgotPassword}
                style={({ pressed }) => [styles.forgotButton, pressed && styles.pressed]}
              >
                <Text style={styles.forgotText}>¿Has olvidado tu contraseña?</Text>
              </Pressable>

              <Pressable
                accessibilityRole="checkbox"
                accessibilityLabel="Mantener sesión"
                accessibilityState={{ checked: rememberSession, disabled: isSubmitting }}
                aria-checked={rememberSession}
                aria-disabled={isSubmitting}
                disabled={isSubmitting}
                onPress={() => setRememberSession(value => !value)}
                style={({ pressed }) => [styles.rememberButton, pressed && styles.pressed]}
              >
                <View style={[styles.checkbox, rememberSession && styles.checkboxSelected]}>
                  {rememberSession && (
                    <SymbolView
                      name={{ android: 'check', ios: 'checkmark', web: 'check' }}
                      size={18}
                      tintColor={colors.white}
                    />
                  )}
                </View>
                <Text style={styles.rememberText}>Mantener sesión</Text>
              </Pressable>

              {requestError && (
                <View style={styles.errorContainer}>
                  <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={styles.errorText}>
                    {requestError}
                  </Text>
                </View>
              )}

              <View style={styles.loginButton}>
                <PrimaryButton
                  variant="login"
                  title="Entrar"
                  loading={isSubmitting}
                  onPress={() => void handleLogin()}
                />
              </View>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="¿Aún no tienes cuenta? Crear cuenta"
                accessibilityState={{ disabled: isSubmitting }}
                disabled={isSubmitting}
                onPress={() => router.push('/register')}
                style={({ pressed }) => [styles.registerButton, pressed && styles.pressed]}
              >
                <Text style={styles.registerText}>
                  ¿Aún no tienes cuenta?{' '}
                  <Text style={styles.registerStrong}>Crear cuenta</Text>
                </Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: loginColors.surface },
  statusBarInset: { backgroundColor: loginColors.hero },
  keyboardView: { flex: 1 },
  scrollContent: { flexGrow: 1, alignItems: 'center' },
  content: { flexGrow: 1, width: '100%', maxWidth: MAX_SCREEN_WIDTH },
  hero: { paddingBottom: 48, backgroundColor: loginColors.hero, overflow: 'hidden' },
  heroImage: { position: 'absolute', bottom: 12 },
  compactHero: { paddingBottom: 40 },
  keyboardHero: { paddingBottom: 36 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10, alignSelf: 'flex-start' },
  logo: {
    width: 40, height: 40, borderRadius: 12, backgroundColor: loginColors.cream,
    alignItems: 'center', justifyContent: 'center',
  },
  logoLetter: {
    fontFamily: serifFont, fontStyle: 'italic', fontSize: 32, lineHeight: 38,
    color: loginColors.primary, includeFontPadding: false,
  },
  brandName: { fontFamily: serifFont, fontSize: 32, color: loginColors.cream },
  tagline: {
    marginTop: 16, fontFamily: serifFont, fontSize: 18, lineHeight: 24,
    color: loginColors.cream,
  },
  taglineWithIllustration: { maxWidth: '64%' },
  card: {
    flexGrow: 1, marginTop: -24, borderTopLeftRadius: radii.xl, borderTopRightRadius: radii.xl,
    paddingTop: 24, paddingBottom: 24, backgroundColor: loginColors.surface,
  },
  heading: { gap: 8 },
  title: { fontFamily: fonts.bold, fontSize: 28, lineHeight: 34, letterSpacing: -0.5, color: loginColors.text },
  subtitle: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 22, color: loginColors.muted },
  fields: { marginTop: 24, gap: 20 },
  forgotButton: { minHeight: 48, paddingVertical: 12, alignSelf: 'flex-end', justifyContent: 'center', maxWidth: '100%' },
  forgotText: { fontFamily: fonts.medium, fontSize: 14, lineHeight: 20, color: loginColors.primary, textAlign: 'right' },
  eyeButton: { width: 48, minHeight: 48, alignItems: 'center', justifyContent: 'center' },
  rememberButton: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 12 },
  checkbox: {
    width: 24, height: 24, borderWidth: 1, borderColor: loginColors.inputBorder,
    borderRadius: 6, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center',
  },
  checkboxSelected: { borderColor: loginColors.primary, backgroundColor: loginColors.primary },
  rememberText: { flexShrink: 1, fontFamily: fonts.regular, fontSize: 15, lineHeight: 22, color: loginColors.muted },
  errorContainer: {
    marginTop: 12, padding: 12, borderRadius: radii.sm, borderWidth: 1,
    borderColor: colors.danger, backgroundColor: colors.dangerSoft,
  },
  errorText: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 21, color: colors.danger },
  loginButton: { marginTop: 12 },
  registerButton: { minHeight: 48, justifyContent: 'center', marginTop: 12, paddingVertical: 12 },
  registerText: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 22, color: loginColors.muted, textAlign: 'center' },
  registerStrong: { fontFamily: fonts.semiBold, color: loginColors.primary },
  pressed: { opacity: 0.7 },
});
