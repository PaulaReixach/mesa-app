import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import {
  useRef,
  useState,
} from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import {
  AuthErrorBanner,
  AuthScreen,
  AuthSwitchPrompt,
} from '../../components/AuthScreen';
import { FormField } from '../../components/FormField';
import { PrimaryButton } from '../../components/PrimaryButton';
import { useAuth } from '../../contexts/auth-context';
import { getErrorMessage } from '../../lib/api';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/fonts';
import {
  radii,
  spacing,
  touchTargets,
} from '../../theme/layout';

type RegisterField = 'name' | 'username' | 'email' | 'password';

type TouchedFields = Record<RegisterField, boolean>;

const initialTouchedFields: TouchedFields = {
  name: false,
  username: false,
  email: false,
  password: false,
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function RegisterScreen() {
  const { signUp } = useAuth();
  const usernameInputRef = useRef<TextInput>(null);
  const emailInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState<TouchedFields>(
    initialTouchedFields,
  );
  const [requestError, setRequestError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const normalizedName = name.trim();
  const normalizedUsername = username.trim().replace(/^@/, '');
  const normalizedEmail = email.trim();

  const nameError = touched.name
    ? !normalizedName
      ? 'Introduce tu nombre.'
      : normalizedName.length > 100
        ? 'El nombre no puede superar los 100 caracteres.'
        : null
    : null;
  const usernameError = touched.username
    ? normalizedUsername.length < 3 || normalizedUsername.length > 50
      ? 'Debe tener entre 3 y 50 caracteres.'
      : null
    : null;
  const emailError = touched.email
    ? !emailPattern.test(normalizedEmail)
      ? 'Introduce un email válido.'
      : normalizedEmail.length > 255
        ? 'El email no puede superar los 255 caracteres.'
        : null
    : null;
  const passwordError = touched.password
    ? password.length < 8 || password.length > 72
      ? 'Debe tener entre 8 y 72 caracteres.'
      : null
    : null;

  const formIsValid = Boolean(
    normalizedName
    && normalizedName.length <= 100
    && normalizedUsername.length >= 3
    && normalizedUsername.length <= 50
    && emailPattern.test(normalizedEmail)
    && normalizedEmail.length <= 255
    && password.length >= 8
    && password.length <= 72,
  );

  function markFieldTouched(field: RegisterField) {
    setTouched(current => ({
      ...current,
      [field]: true,
    }));
  }

  function clearRequestError() {
    if (requestError) {
      setRequestError(null);
    }
  }

  function handleBack() {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace('/login');
  }

  async function handleRegister() {
    setTouched({
      name: true,
      username: true,
      email: true,
      password: true,
    });
    setRequestError(null);

    if (!formIsValid) {
      return;
    }

    try {
      setIsSubmitting(true);

      await signUp({
        name: normalizedName,
        username: normalizedUsername,
        email: normalizedEmail,
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
    <AuthScreen
      compactHero
      heroMessage="Tu próxima mesa empieza aquí."
      onBack={handleBack}
      subtitle="Crea grupos, guarda restaurantes y decide con tu gente."
      title="Crea tu cuenta"
    >
      <View style={styles.fields}>
        <FormField
          autoCapitalize="words"
          autoComplete="name"
          editable={!isSubmitting}
          error={nameError}
          label="Nombre"
          leftAccessory={(
            <SymbolView
              name={{
                ios: 'person',
                android: 'person',
                web: 'person',
              }}
              size={20}
              tintColor={colors.mutedStrong}
            />
          )}
          maxLength={101}
          onBlur={() => markFieldTouched('name')}
          onChangeText={value => {
            setName(value);
            clearRequestError();
          }}
          onSubmitEditing={() => usernameInputRef.current?.focus()}
          placeholder="Cómo quieres que te llamemos"
          returnKeyType="next"
          textContentType="name"
          value={name}
        />

        <FormField
          ref={usernameInputRef}
          autoCapitalize="none"
          autoComplete="username"
          autoCorrect={false}
          editable={!isSubmitting}
          error={usernameError}
          helperText="Lo usarán para invitarte a sus grupos."
          label="Nombre de usuario"
          leftAccessory={(
            <Text style={styles.atSymbol}>@</Text>
          )}
          maxLength={51}
          onBlur={() => markFieldTouched('username')}
          onChangeText={value => {
            setUsername(value.replace(/^@/, ''));
            clearRequestError();
          }}
          onSubmitEditing={() => emailInputRef.current?.focus()}
          placeholder="paula"
          returnKeyType="next"
          textContentType="username"
          value={username}
        />

        <FormField
          ref={emailInputRef}
          autoCapitalize="none"
          autoComplete="email"
          autoCorrect={false}
          editable={!isSubmitting}
          error={emailError}
          keyboardType="email-address"
          label="Email"
          leftAccessory={(
            <SymbolView
              name={{
                ios: 'envelope',
                android: 'mail',
                web: 'mail',
              }}
              size={20}
              tintColor={colors.mutedStrong}
            />
          )}
          maxLength={256}
          onBlur={() => markFieldTouched('email')}
          onChangeText={value => {
            setEmail(value);
            clearRequestError();
          }}
          onSubmitEditing={() => passwordInputRef.current?.focus()}
          placeholder="tu@email.com"
          returnKeyType="next"
          textContentType="emailAddress"
          value={email}
        />

        <FormField
          ref={passwordInputRef}
          autoCapitalize="none"
          autoComplete="new-password"
          editable={!isSubmitting}
          error={passwordError}
          helperText="Entre 8 y 72 caracteres."
          label="Contraseña"
          leftAccessory={(
            <SymbolView
              name={{
                ios: 'lock',
                android: 'lock',
                web: 'lock',
              }}
              size={20}
              tintColor={colors.mutedStrong}
            />
          )}
          maxLength={73}
          onBlur={() => markFieldTouched('password')}
          onChangeText={value => {
            setPassword(value);
            clearRequestError();
          }}
          onSubmitEditing={() => void handleRegister()}
          placeholder="Crea una contraseña segura"
          returnKeyType="done"
          rightAccessory={(
            <Pressable
              accessibilityLabel={
                showPassword
                  ? 'Ocultar contraseña'
                  : 'Mostrar contraseña'
              }
              accessibilityRole="button"
              hitSlop={4}
              onPress={() => setShowPassword(current => !current)}
              style={({ pressed }) => [
                styles.visibilityButton,
                pressed ? styles.pressed : null,
              ]}
            >
              <SymbolView
                name={{
                  ios: showPassword ? 'eye.slash' : 'eye',
                  android: showPassword ? 'visibility_off' : 'visibility',
                  web: showPassword ? 'visibility_off' : 'visibility',
                }}
                size={20}
                tintColor={colors.mutedStrong}
              />
            </Pressable>
          )}
          secureTextEntry={!showPassword}
          textContentType="newPassword"
          value={password}
        />
      </View>

      {requestError ? (
        <AuthErrorBanner message={requestError} />
      ) : null}

      <PrimaryButton
        disabled={!formIsValid}
        loading={isSubmitting}
        loadingTitle="Creando tu cuenta..."
        onPress={() => void handleRegister()}
        title="Crear mi cuenta"
      />

      <View style={styles.legalNotice}>
        <SymbolView
          name={{
            ios: 'shield.checkered',
            android: 'verified_user',
            web: 'verified_user',
          }}
          size={17}
          tintColor={colors.olive}
        />
        <Text style={styles.legalText}>
          Al crear tu cuenta aceptas los Términos de uso y la Política de privacidad de Mesa.
        </Text>
      </View>

      <AuthSwitchPrompt
        action="Iniciar sesión"
        onPress={() => router.replace('/login')}
        prompt="¿Ya tienes cuenta?"
      />
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  fields: {
    gap: spacing.md,
  },
  atSymbol: {
    color: colors.mutedStrong,
    fontFamily: fonts.semiBold,
    fontSize: 19,
  },
  visibilityButton: {
    width: touchTargets.minimum,
    height: touchTargets.minimum,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.round,
  },
  pressed: {
    opacity: 0.66,
  },
  legalNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    paddingHorizontal: 2,
  },
  legalText: {
    flex: 1,
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 17,
  },
});
