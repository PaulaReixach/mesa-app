import { router } from 'expo-router';
import { useState } from 'react';

import { AuthStep, isOfflineError } from '../../components/AuthStep';
import { Button } from '../../components/ui/Button';
import { TextField } from '../../components/ui/TextField';
import { getErrorMessage } from '../../lib/api';
import { lookupAccount } from '../../services/auth-service';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** «Entrar» 2 · Tu correo: one field; Mesa decides between signing in and creating the account. */
export default function EmailStepScreen() {
  const [identifier, setIdentifier] = useState('');
  const [loading, setLoading] = useState(false);
  const [offline, setOffline] = useState(false);
  const [error, setError] = useState<string>();
  const value = identifier.trim();

  const submit = async () => {
    if (!value || loading) return;
    setLoading(true);
    setError(undefined);
    try {
      const account = await lookupAccount(value);
      setOffline(false);
      if (account.exists) {
        router.push({ pathname: '/password', params: { identifier: value, name: account.name ?? '' } });
      } else if (EMAIL_PATTERN.test(value)) {
        router.push({ pathname: '/register', params: { email: value } });
      } else {
        setError('No hay ninguna cuenta con ese usuario. Escribe tu correo para crear una.');
      }
    } catch (caught) {
      if (isOfflineError(caught)) setOffline(true);
      else setError(getErrorMessage(caught));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthStep
      title="¿Cuál es tu correo?"
      subtitle="Si ya tienes cuenta, entrarás. Si no, la creamos en un momento."
      offline={offline}
      footer={(
        <Button title={offline ? 'Reintentar' : 'Continuar'} onPress={submit} size="lg"
          loading={loading} disabled={!value} />
      )}
    >
      <TextField
        label="Correo"
        value={identifier}
        onChangeText={(text) => { setIdentifier(text); setError(undefined); }}
        error={error}
        help="También puedes escribir tu nombre de usuario."
        placeholder="nombre@correo.com"
        keyboardType="email-address"
        autoComplete="email"
        textContentType="emailAddress"
        autoCapitalize="none"
        autoCorrect={false}
        autoFocus
        returnKeyType="go"
        onSubmitEditing={submit}
      />
    </AuthStep>
  );
}
