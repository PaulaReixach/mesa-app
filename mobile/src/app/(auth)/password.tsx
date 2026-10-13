import { router, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import { Alert, Pressable, TextInput, View } from 'react-native';

import { AuthStep, isOfflineError } from '../../components/AuthStep';
import { AppText } from '../../components/ui/AppText';
import { Button } from '../../components/ui/Button';
import { TextField } from '../../components/ui/TextField';
import { useAuth } from '../../contexts/auth-context';
import { ApiError, getErrorMessage } from '../../lib/api';
import {
  createThemedStyles, space, textActionHitSlop, touchTarget,
} from '../../theme';

/** «Entrar» 3a · Ya tienes cuenta: greeting, the identifier with «Cambiar» and the password. */
export default function PasswordStepScreen() {
  const styles = useStyles();
  const { signIn } = useAuth();
  const { identifier = '', name = '' } = useLocalSearchParams<{ identifier: string; name: string }>();
  const inputRef = useRef<TextInput>(null);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [offline, setOffline] = useState(false);
  const [error, setError] = useState<string>();
  const firstName = name.trim().split(/\s+/)[0];

  const submit = async () => {
    if (!password || loading) return;
    setLoading(true);
    setError(undefined);
    try {
      await signIn({ identifier, password });
      router.replace('/home');
    } catch (caught) {
      if (isOfflineError(caught)) {
        setOffline(true);
      } else {
        setOffline(false);
        setError(caught instanceof ApiError && caught.status === 401
          ? 'La contraseña no es correcta. Vuelve a intentarlo.'
          : getErrorMessage(caught));
        setPassword('');
        inputRef.current?.focus();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthStep
      title={firstName ? `Hola de nuevo, ${firstName}` : 'Hola de nuevo'}
      subtitle={(
        <View style={styles.who}>
          <View style={styles.initial} accessible={false}>
            <AppText variant="cardTitle" tone="accent">{(firstName || identifier).charAt(0).toUpperCase()}</AppText>
          </View>
          <AppText variant="body" tone="muted" numberOfLines={1} style={styles.identifier}>{identifier}</AppText>
          <Pressable onPress={() => router.back()} hitSlop={textActionHitSlop} accessibilityRole="button"
            accessibilityLabel="Cambiar correo">
            <AppText variant="bodyStrong" tone="olive">Cambiar</AppText>
          </Pressable>
        </View>
      )}
      offline={offline}
      footer={(
        <Button title={offline ? 'Reintentar' : 'Entrar'} onPress={submit} size="lg"
          loading={loading} disabled={!password} />
      )}
    >
      <View style={styles.fields}>
        <TextField
          ref={inputRef}
          label="Contraseña"
          value={password}
          onChangeText={(text) => { setPassword(text); setError(undefined); }}
          error={error}
          secure
          autoComplete="password"
          textContentType="password"
          autoCapitalize="none"
          autoCorrect={false}
          autoFocus
          returnKeyType="go"
          onSubmitEditing={submit}
        />
        <Pressable
          onPress={() => Alert.alert('Muy pronto', 'Aún no se puede recuperar la contraseña desde la app.')}
          accessibilityRole="button" style={styles.forgot}>
          <AppText variant="bodyStrong" tone="olive">¿Has olvidado tu contraseña?</AppText>
        </Pressable>
      </View>
    </AuthStep>
  );
}

const useStyles = createThemedStyles(({ colors }) => ({
  who: { flexDirection: 'row', alignItems: 'center', gap: space.s3, marginTop: space.s2 },
  initial: {
    width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.accentSoft,
  },
  identifier: { flexShrink: 1 },
  fields: { gap: space.s1 },
  forgot: { minHeight: touchTarget, justifyContent: 'center', alignSelf: 'flex-start' },
}));
