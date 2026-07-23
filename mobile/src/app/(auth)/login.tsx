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

type LoginField = 'identifier' | 'password';

type TouchedFields = Record<LoginField, boolean>;

const initialTouchedFields: TouchedFields = {
  identifier: false,
  password: false,
};

export default function LoginScreen() {
  const { signIn } = useAuth();
  const passwordInputRef = useRef<TextInput>(null);

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [rememberSession, setRememberSession] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState<TouchedFields>(
    initialTouchedFields,
  );
  const [requestError, setRequestError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const identifierError = touched.identifier && !identifier.trim()
    ? 'Introduce tu email o nombre de usuario.'
    : null;
  const passwordError = touched.password && !password
    ? 'Introduce tu contraseña.'
    : null;

  function markFieldTouched(field: LoginField) {
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

  async function handleLogin() {
    setTouched({
      identifier: true,
      password: true,
    });
    setRequestError(null);

    if (!identifier.trim() || !password) {
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

  return (
    <AuthScreen
      heroMessage="Tus restaurantes, tus grupos y el próximo buen plan."
      subtitle="Vuelve a tus grupos, favoritos y restaurantes pendientes."
      title="Qué bien verte"
    >
      <View style={styles.fields}>
        <FormField
          autoCapitalize="none"
          autoComplete="username"
          autoCorrect={false}
          editable={!isSubmitting}
          error={identifierError}
          keyboardType="email-address"
          label="Email o usuario"
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
          onBlur={() => markFieldTouched('identifier')}
          onChangeText={value => {
            setIdentifier(value);
            clearRequestError();
          }}
          onSubmitEditing={() => passwordInputRef.current?.focus()}
          placeholder="tu@email.com o @usuario"
          returnKeyType="next"
          textContentType="username"
          value={identifier}
        />

        <FormField
          ref={passwordInputRef}
          autoCapitalize="none"
          autoComplete="current-password"
          editable={!isSubmitting}
          error={passwordError}
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
          onBlur={() => markFieldTouched('password')}
          onChangeText={value => {
            setPassword(value);
            clearRequestError();
          }}
          onSubmitEditing={() => void handleLogin()}
          placeholder="Tu contraseña"
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
          textContentType="password"
          value={password}
        />
      </View>

      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: rememberSession }}
        disabled={isSubmitting}
        onPress={() => setRememberSession(current => !current)}
        style={({ pressed }) => [
          styles.rememberRow,
          pressed ? styles.pressed : null,
        ]}
      >
        <View
          style={[
            styles.checkbox,
            rememberSession ? styles.checkboxSelected : null,
          ]}
        >
          {rememberSession ? (
            <SymbolView
              name={{
                ios: 'checkmark',
                android: 'check',
                web: 'check',
              }}
              size={15}
              tintColor={colors.white}
            />
          ) : null}
        </View>

        <View style={styles.rememberCopy}>
          <Text style={styles.rememberTitle}>
            Recordar mi sesión
          </Text>
          <Text style={styles.rememberDescription}>
            No tendrás que volver a entrar en este dispositivo.
          </Text>
        </View>
      </Pressable>

      {requestError ? (
        <AuthErrorBanner message={requestError} />
      ) : null}

      <PrimaryButton
        disabled={!identifier.trim() || !password}
        loading={isSubmitting}
        loadingTitle="Entrando..."
        onPress={() => void handleLogin()}
        title="Entrar en Mesa"
      />

      <AuthSwitchPrompt
        action="Crear cuenta"
        onPress={() => router.push('/register')}
        prompt="¿Aún no tienes cuenta?"
      />
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  fields: {
    gap: spacing.md,
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
  rememberRow: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: 2,
  },
  checkbox: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    borderRadius: 8,
    backgroundColor: colors.surfaceElevated,
  },
  checkboxSelected: {
    borderColor: colors.olive,
    backgroundColor: colors.olive,
  },
  rememberCopy: {
    flex: 1,
    gap: 2,
  },
  rememberTitle: {
    color: colors.text,
    fontFamily: fonts.semiBold,
    fontSize: 13,
  },
  rememberDescription: {
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 10,
    lineHeight: 14,
  },
});
