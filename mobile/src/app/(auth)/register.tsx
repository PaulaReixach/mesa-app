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

export default function RegisterScreen() {
  const { signUp } = useAuth();

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] =
    useState('');
  const [requestError, setRequestError] =
    useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleRegister() {
    setRequestError(null);

    if (
      !name.trim() ||
      !username.trim() ||
      !email.trim() ||
      !password
    ) {
      setRequestError(
        'Completa todos los campos obligatorios.',
      );
      return;
    }

    if (password !== passwordConfirmation) {
      setRequestError('Las contraseñas no coinciden.');
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
    <AuthScreen
      title="Crea tu mesa"
      subtitle="Guarda restaurantes y compártelos con las personas con las que disfrutas comiendo."
    >
      <FormField
        autoCapitalize="words"
        label="Nombre"
        onChangeText={setName}
        placeholder="Paula"
        value={name}
      />

      <FormField
        autoCapitalize="none"
        autoCorrect={false}
        label="Nombre de usuario"
        onChangeText={setUsername}
        placeholder="paula"
        value={username}
      />

      <FormField
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        label="Email"
        onChangeText={setEmail}
        placeholder="paula@example.com"
        value={email}
      />

      <FormField
        autoCapitalize="none"
        label="Contraseña"
        onChangeText={setPassword}
        placeholder="Mínimo 8 caracteres"
        secureTextEntry
        value={password}
      />

      <FormField
        autoCapitalize="none"
        label="Repite la contraseña"
        onChangeText={setPasswordConfirmation}
        placeholder="Repite la contraseña"
        secureTextEntry
        value={passwordConfirmation}
      />

      {requestError ? (
        <Text style={styles.error}>{requestError}</Text>
      ) : null}

      <PrimaryButton
        loading={isSubmitting}
        onPress={handleRegister}
        title="Crear cuenta"
      />

      <Pressable
        onPress={() => router.back()}
        style={styles.linkContainer}
      >
        <Text style={styles.linkText}>
          ¿Ya tienes cuenta?{' '}
          <Text style={styles.linkStrong}>
            Iniciar sesión
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