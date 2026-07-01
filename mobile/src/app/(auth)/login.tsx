import { router } from 'expo-router';
import { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
} from 'react-native';

import { AuthScreen } from '../../components/AuthScreen';
import { FormField } from '../../components/FormField';
import { PrimaryButton } from '../../components/PrimaryButton';
import { useAuth } from '../../contexts/auth-context';
import { getErrorMessage } from '../../lib/api';
import { colors } from '../../theme/colors';

export default function LoginScreen() {
  const { signIn } = useAuth();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [requestError, setRequestError] =
    useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleLogin() {
    setRequestError(null);

    if (!identifier.trim() || !password) {
      setRequestError(
        'Introduce tu email o usuario y la contraseña.',
      );
      return;
    }

    try {
      setIsSubmitting(true);

      await signIn({
        identifier: identifier.trim(),
        password,
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
      title="Qué alegría verte"
      subtitle="Entra para consultar vuestros restaurantes pendientes y favoritos."
    >
      <FormField
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        label="Email o nombre de usuario"
        onChangeText={setIdentifier}
        placeholder="paula@example.com"
        value={identifier}
      />

      <FormField
        autoCapitalize="none"
        label="Contraseña"
        onChangeText={setPassword}
        placeholder="Tu contraseña"
        secureTextEntry
        value={password}
      />

      {requestError ? (
        <Text style={styles.error}>{requestError}</Text>
      ) : null}

      <PrimaryButton
        loading={isSubmitting}
        onPress={handleLogin}
        title="Entrar"
      />

      <Pressable
        onPress={() => router.push('/register')}
        style={styles.linkContainer}
      >
        <Text style={styles.linkText}>
          ¿Todavía no tienes cuenta?{' '}
          <Text style={styles.linkStrong}>
            Crear cuenta
          </Text>
        </Text>
      </Pressable>
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  error: {
    color: colors.danger,
    fontSize: 14,
    lineHeight: 20,
  },
  linkContainer: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  linkText: {
    color: colors.muted,
    fontSize: 14,
  },
  linkStrong: {
    color: colors.primary,
    fontWeight: '700',
  },
});