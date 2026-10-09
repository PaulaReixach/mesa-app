import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SymbolView } from 'expo-symbols';
import { useEffect, useRef, useState } from 'react';
import {
  Alert, Keyboard, KeyboardAvoidingView, Platform, Pressable,
  ScrollView, StyleSheet, Text, TextInput, useWindowDimensions, View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { FormField } from '../../components/FormField';
import { PrimaryButton } from '../../components/PrimaryButton';
import { useAuth } from '../../contexts/auth-context';
import { getErrorMessage } from '../../lib/api';
import { colors, loginColors } from '../../theme/colors';
import { fonts } from '../../theme/fonts';
import { radii, spacing } from '../../theme/layout';

const MAX_SCREEN_WIDTH = 430;
const serifFont = Platform.select({ ios: 'Georgia', android: 'serif', default: 'Georgia' });
type FieldName = 'name' | 'username' | 'email' | 'password';
type FieldErrors = Partial<Record<FieldName, string>>;

export default function RegisterScreen() {
  const { signUp } = useAuth();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const horizontalPadding = width - insets.left - insets.right < 360 ? spacing.lg : spacing.xl;
  const nameInputRef = useRef<TextInput>(null);
  const usernameInputRef = useRef<TextInput>(null);
  const emailInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);
  const scrollRef = useRef<ScrollView>(null);
  const requestInFlight = useRef(false);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [usernameFocused, setUsernameFocused] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [termsError, setTermsError] = useState<string | null>(null);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const show = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow', () => setKeyboardVisible(true));
    const hide = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide', () => setKeyboardVisible(false));
    return () => { show.remove(); hide.remove(); };
  }, []);

  function clearFieldError(field: FieldName) {
    setFieldErrors(current => ({ ...current, [field]: undefined }));
    setRequestError(null);
  }

  async function handleRegister() {
    // Prevent simultaneous submissions from the keyboard and the button.
    if (requestInFlight.current) return;
    setRequestError(null);
    const errors: FieldErrors = {};
    if (!name.trim()) errors.name = 'Introduce tu nombre.';
    if (!username.trim()) errors.username = 'Introduce un nombre de usuario.';
    else if (username.trim().length < 3 || username.trim().length > 50) {
      errors.username = 'El nombre de usuario debe tener entre 3 y 50 caracteres.';
    }
    if (!email.trim()) errors.email = 'Introduce tu email.';
    if (!password) errors.password = 'Introduce una contraseña.';
    else if (password.length < 8) errors.password = 'La contraseña debe tener al menos 8 caracteres.';
    setFieldErrors(errors);
    setTermsError(acceptedTerms ? null : 'Acepta los términos de uso y la política de privacidad para continuar.');

    if (errors.name) { nameInputRef.current?.focus(); return; }
    if (errors.username) { usernameInputRef.current?.focus(); return; }
    if (errors.email) { emailInputRef.current?.focus(); return; }
    if (errors.password) { passwordInputRef.current?.focus(); return; }
    if (!acceptedTerms) {
      Keyboard.dismiss();
      scrollRef.current?.scrollToEnd({ animated: false });
      return;
    }

    requestInFlight.current = true;
    setIsSubmitting(true);
    try {
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
      requestInFlight.current = false;
      setIsSubmitting(false);
    }
  }

  function handleLegalPress(documentName: string) {
    Alert.alert(
      documentName,
      `El documento de ${documentName.toLowerCase()} estará disponible próximamente.`,
      [{ text: 'Entendido' }],
    );
  }

  function handleBack() {
    if (router.canGoBack()) { router.back(); return; }
    router.replace('/login');
  }

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.screen}>
      <StatusBar style="light" />
      <View style={[styles.statusBarInset, { height: insets.top }]} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
        <ScrollView
          ref={scrollRef}
          bounces={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => {
            if (requestError || (termsError && Object.values(fieldErrors).every(error => !error))) {
              scrollRef.current?.scrollToEnd({ animated: false });
            }
          }}
        >
          <View style={styles.content}>
            <View style={[styles.hero, { paddingHorizontal: horizontalPadding }]}>
              <View style={styles.navigation}>
                <Pressable
                  accessibilityRole="button" accessibilityLabel="Volver"
                  accessibilityState={{ disabled: isSubmitting }} disabled={isSubmitting}
                  onPress={handleBack}
                  style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
                >
                  <View style={styles.backCircle}>
                    <SymbolView name={{ android: 'arrow_back', ios: 'arrow.left', web: 'arrow_back' }} size={22} tintColor={loginColors.cream} />
                  </View>
                </Pressable>
                <View accessible accessibilityLabel="Mesa" style={styles.brand}>
                  <View style={styles.brandIcon}><Text maxFontSizeMultiplier={1} style={styles.brandLetter}>M</Text></View>
                  <Text maxFontSizeMultiplier={1.2} style={styles.wordmark}>Mesa</Text>
                </View>
                <View style={styles.navigationSpacer} />
              </View>
              <View style={styles.heading}>
                <Text accessibilityRole="header" style={styles.title}>Crea tu cuenta</Text>
                {!keyboardVisible && <Text style={styles.subtitle}>Guarda restaurantes y comparte planes.</Text>}
              </View>
            </View>

            <View style={[styles.form, { paddingHorizontal: horizontalPadding }]}>
              <View style={styles.fields}>
                <FormField
                  variant="login" label="Nombre" inputRef={nameInputRef}
                  value={name} error={fieldErrors.name} placeholder="Tu nombre"
                  editable={!isSubmitting} autoCapitalize="words" autoComplete="name"
                  importantForAutofill="yes" returnKeyType="next" submitBehavior="submit"
                  onChangeText={value => { setName(value); clearFieldError('name'); }}
                  onSubmitEditing={() => usernameInputRef.current?.focus()}
                />
                <View>
                  <FormField
                    variant="login" label="Nombre de usuario" inputRef={usernameInputRef}
                    value={username} error={fieldErrors.username} placeholder="Elige un nombre de usuario"
                    accessibilityHint="Entre 3 y 50 caracteres"
                    editable={!isSubmitting} autoCapitalize="none" autoComplete="username"
                    autoCorrect={false} maxLength={50} importantForAutofill="yes"
                    returnKeyType="next" submitBehavior="submit"
                    onFocus={() => setUsernameFocused(true)} onBlur={() => setUsernameFocused(false)}
                    onChangeText={value => { setUsername(value); clearFieldError('username'); }}
                    onSubmitEditing={() => emailInputRef.current?.focus()}
                  />
                  {usernameFocused && !fieldErrors.username && <Text style={styles.hint}>Entre 3 y 50 caracteres</Text>}
                </View>
                <FormField
                  variant="login" label="Email" inputRef={emailInputRef}
                  value={email} error={fieldErrors.email} placeholder="tu@email.com"
                  editable={!isSubmitting} autoCapitalize="none" autoComplete="email"
                  autoCorrect={false} keyboardType="email-address" importantForAutofill="yes"
                  returnKeyType="next" submitBehavior="submit"
                  onChangeText={value => { setEmail(value); clearFieldError('email'); }}
                  onSubmitEditing={() => passwordInputRef.current?.focus()}
                />
                <View>
                  <FormField
                    variant="login" label="Contraseña" inputRef={passwordInputRef}
                    value={password} error={fieldErrors.password} placeholder="Crea una contraseña"
                    accessibilityHint="Mínimo 8 caracteres"
                    editable={!isSubmitting} autoCapitalize="none" autoComplete="new-password"
                    autoCorrect={false} importantForAutofill="yes" secureTextEntry={!showPassword}
                    returnKeyType="go" submitBehavior="submit"
                    onChangeText={value => { setPassword(value); clearFieldError('password'); }}
                    onSubmitEditing={() => void handleRegister()}
                    rightAccessory={(
                      <Pressable
                        accessibilityRole="button" accessibilityLabel={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                        accessibilityState={{ disabled: isSubmitting }} disabled={isSubmitting}
                        onPress={() => setShowPassword(current => !current)}
                        style={({ pressed }) => [styles.eyeButton, pressed && styles.pressed]}
                      >
                        <SymbolView
                          name={{ android: showPassword ? 'visibility_off' : 'visibility', ios: showPassword ? 'eye.slash' : 'eye', web: showPassword ? 'visibility_off' : 'visibility' }}
                          size={24} tintColor={loginColors.text}
                        />
                      </Pressable>
                    )}
                  />
                  {!fieldErrors.password && <Text style={styles.hint}>Mínimo 8 caracteres</Text>}
                </View>
              </View>

              <View style={styles.termsRow}>
                <Pressable
                  accessibilityRole="checkbox" accessibilityLabel="Aceptar los términos de uso y la política de privacidad"
                  accessibilityState={{ checked: acceptedTerms, disabled: isSubmitting }}
                  accessibilityHint={termsError ?? undefined} aria-checked={acceptedTerms}
                  disabled={isSubmitting}
                  onPress={() => { setAcceptedTerms(current => !current); setTermsError(null); }}
                  style={({ pressed }) => [styles.checkboxTarget, pressed && styles.pressed]}
                >
                  <View style={[styles.checkbox, acceptedTerms && styles.checkboxSelected, !!termsError && styles.checkboxError]}>
                    {acceptedTerms && <SymbolView name={{ android: 'check', ios: 'checkmark', web: 'check' }} size={18} tintColor={colors.white} />}
                  </View>
                </Pressable>
                <Text style={styles.termsText}>
                  Acepto los{' '}
                  <Text accessibilityRole="link" accessibilityState={{ disabled: isSubmitting }} disabled={isSubmitting} onPress={() => handleLegalPress('Términos de uso')} style={styles.termsLink}>Términos de uso</Text>
                  {' '}y la{' '}
                  <Text accessibilityRole="link" accessibilityState={{ disabled: isSubmitting }} disabled={isSubmitting} onPress={() => handleLegalPress('Política de privacidad')} style={styles.termsLink}>Política de privacidad</Text>.
                </Text>
              </View>
              {termsError && <Text accessibilityLiveRegion="polite" style={styles.fieldError}>{termsError}</Text>}
              {requestError && (
                <View style={styles.errorContainer}>
                  <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={styles.fieldError}>{requestError}</Text>
                </View>
              )}
              <View style={styles.submit}>
                <PrimaryButton variant="login" title="Crear mi cuenta" loadingTitle="Creando cuenta…" loading={isSubmitting} onPress={() => void handleRegister()} />
              </View>
              <Pressable
                accessibilityRole="button" accessibilityLabel="¿Ya tienes cuenta? Inicia sesión"
                accessibilityState={{ disabled: isSubmitting }} disabled={isSubmitting}
                onPress={() => router.replace('/login')}
                style={({ pressed }) => [styles.loginButton, pressed && styles.pressed]}
              >
                <Text style={styles.loginText}>¿Ya tienes cuenta? <Text style={styles.loginStrong}>Inicia sesión</Text></Text>
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
  hero: { paddingTop: spacing.xs, paddingBottom: spacing.section, backgroundColor: loginColors.hero },
  navigation: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backButton: { width: 48, height: 48, justifyContent: 'center', alignItems: 'flex-start' },
  backCircle: { width: 34, height: 34, borderWidth: 1, borderColor: loginColors.cream, borderRadius: radii.round, alignItems: 'center', justifyContent: 'center' },
  navigationSpacer: { width: 48 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  brandIcon: { width: 24, height: 24, borderRadius: 7, backgroundColor: loginColors.cream, alignItems: 'center', justifyContent: 'center' },
  brandLetter: { fontFamily: serifFont, fontSize: 20, lineHeight: 24, fontStyle: 'italic', color: loginColors.primary, includeFontPadding: false },
  wordmark: { fontFamily: serifFont, fontSize: 25, color: loginColors.cream },
  heading: { marginTop: spacing.sm, gap: 6 },
  title: { fontFamily: fonts.bold, fontSize: 28, lineHeight: 34, letterSpacing: -0.5, color: loginColors.cream },
  subtitle: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 22, color: loginColors.cream },
  form: { flexGrow: 1, marginTop: -24, borderTopLeftRadius: radii.xl, borderTopRightRadius: radii.xl, backgroundColor: loginColors.surface, paddingTop: spacing.xl, paddingBottom: spacing.xl },
  fields: { gap: spacing.md },
  hint: { marginTop: spacing.xs, fontFamily: fonts.regular, fontSize: 14, lineHeight: 20, color: loginColors.muted },
  eyeButton: { width: 48, minHeight: 48, alignItems: 'center', justifyContent: 'center' },
  termsRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.xs, marginTop: spacing.md },
  checkboxTarget: { width: 48, minHeight: 48, alignItems: 'flex-start', justifyContent: 'flex-start', paddingTop: spacing.sm },
  checkbox: { width: 24, height: 24, borderWidth: 1, borderColor: loginColors.inputBorder, borderRadius: 6, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  checkboxSelected: { backgroundColor: loginColors.primary, borderColor: loginColors.primary },
  checkboxError: { borderColor: colors.danger },
  termsText: { flex: 1, paddingVertical: spacing.sm, fontFamily: fonts.regular, fontSize: 14, lineHeight: 20, color: loginColors.muted },
  termsLink: { fontFamily: fonts.medium, color: loginColors.primary, textDecorationLine: 'underline' },
  fieldError: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 20, color: colors.danger },
  errorContainer: { marginTop: spacing.sm, padding: spacing.sm, borderWidth: 1, borderColor: colors.danger, borderRadius: radii.sm, backgroundColor: colors.dangerSoft },
  submit: { marginTop: spacing.md },
  loginButton: { minHeight: 48, marginTop: spacing.sm, paddingVertical: spacing.sm, justifyContent: 'center' },
  loginText: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 22, color: loginColors.muted, textAlign: 'center' },
  loginStrong: { fontFamily: fonts.semiBold, color: loginColors.primary },
  pressed: { opacity: 0.7 },
});
