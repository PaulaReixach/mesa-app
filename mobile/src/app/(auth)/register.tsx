import { router, useLocalSearchParams } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Pressable, TextInput, View } from 'react-native';

import { AuthStep, isOfflineError } from '../../components/AuthStep';
import { AppText } from '../../components/ui/AppText';
import { Button } from '../../components/ui/Button';
import { TextField } from '../../components/ui/TextField';
import { useAuth } from '../../contexts/auth-context';
import { ApiError, getErrorMessage } from '../../lib/api';
import { checkUsername } from '../../services/auth-service';
import { createThemedStyles, radius, space, textActionHitSlop, useTheme } from '../../theme';

const MIN_PASSWORD = 8;
const MAX_PASSWORD = 72;

/** «nombre apellido» → «nombreapellido», without accents or symbols. */
function suggestUsername(name: string): string {
  return name.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
    .replace(/[^a-z0-9._]/g, '').slice(0, 50);
}

type UsernameState =
  | { kind: 'idle' }
  | { kind: 'checking' }
  | { kind: 'available' }
  | { kind: 'taken'; suggestions: string[] };

/** «Entrar» 3b · Cuenta nueva: name, username (suggested and checked) and password. */
export default function RegisterStepScreen() {
  const styles = useStyles();
  const { colors } = useTheme();
  const { signUp } = useAuth();
  const { email = '' } = useLocalSearchParams<{ email: string }>();
  const usernameRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [usernameEdited, setUsernameEdited] = useState(false);
  const [usernameState, setUsernameState] = useState<UsernameState>({ kind: 'idle' });
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string>();
  const [formError, setFormError] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [offline, setOffline] = useState(false);

  // Suggest the username from the name until the person edits it.
  useEffect(() => {
    if (!usernameEdited) setUsername(suggestUsername(name));
  }, [name, usernameEdited]);

  // Check availability shortly after typing stops.
  useEffect(() => {
    if (username.length < 3) { setUsernameState({ kind: 'idle' }); return; }
    setUsernameState({ kind: 'checking' });
    let active = true;
    const timer = setTimeout(() => {
      checkUsername(username)
        .then((result) => {
          if (!active) return;
          setUsernameState(result.available ? { kind: 'available' } : { kind: 'taken', suggestions: result.suggestions });
          if (!result.available) AccessibilityInfo.announceForAccessibility(`@${username} ya está en uso`);
        })
        .catch(() => active && setUsernameState({ kind: 'idle' }));
    }, 400);
    return () => { active = false; clearTimeout(timer); };
  }, [username]);

  const passwordProblem = (value: string) => (value.length < MIN_PASSWORD
    ? `Necesita al menos ${MIN_PASSWORD} caracteres. Llevas ${value.length}.`
    : undefined);

  const canSubmit = name.trim().length > 0 && username.length >= 3 && usernameState.kind !== 'taken'
    && password.length > 0 && !loading;

  const submit = async () => {
    if (!canSubmit) return;
    const problem = passwordProblem(password);
    if (problem) { setPasswordError(problem); passwordRef.current?.focus(); return; }
    setLoading(true);
    setFormError(undefined);
    try {
      await signUp({ name: name.trim(), username, email, password, avatarUrl: null });
      // «Tu primer grupo»: Inicio below, so closing the create screen is «Ahora no».
      router.replace('/home');
      router.push('/groups/create');
    } catch (caught) {
      if (isOfflineError(caught)) { setOffline(true); return; }
      setOffline(false);
      const fields = caught instanceof ApiError ? caught.validationErrors : {};
      if (fields.username) { usernameRef.current?.focus(); setUsernameState({ kind: 'taken', suggestions: [] }); }
      setFormError(getErrorMessage(caught));
    } finally {
      setLoading(false);
    }
  };

  const usernameHelp = (() => {
    switch (usernameState.kind) {
      case 'checking':
        return 'Comprobando…';
      case 'available':
        return (
          <View style={styles.inline}>
            <SymbolView name={{ ios: 'checkmark', android: 'check', web: 'check' }} size={13} tintColor={colors.secondary} />
            <AppText variant="secondaryStrong" tone="olive">Disponible</AppText>
            <AppText variant="secondary" tone="muted"> · Con él te encontrará e invitará tu gente.</AppText>
          </View>
        );
      case 'taken':
        return (
          <View style={styles.taken} accessibilityLiveRegion="polite">
            <AppText variant="secondary" tone="danger">
              {usernameState.suggestions.length ? `@${username} ya está en uso. Prueba con uno de estos:` : `@${username} ya está en uso.`}
            </AppText>
            <View style={styles.chips}>
              {usernameState.suggestions.map((suggestion) => (
                <Pressable key={suggestion} accessibilityRole="button" accessibilityLabel={`Usar @${suggestion}`}
                  hitSlop={textActionHitSlop}
                  onPress={() => { setUsernameEdited(true); setUsername(suggestion); }} style={styles.chip}>
                  <AppText variant="secondaryStrong" tone="olive">@{suggestion}</AppText>
                </Pressable>
              ))}
            </View>
          </View>
        );
      default:
        return 'Con él te encontrará e invitará tu gente.';
    }
  })();

  const longEnough = password.length >= MIN_PASSWORD;

  return (
    <AuthStep
      title="Crea tu cuenta"
      subtitle={(
        <AppText variant="body" tone="muted">
          Es tu primera vez con {email || 'este correo'}.{' '}
          <AppText variant="bodyStrong" tone="olive" accessibilityRole="button" onPress={() => router.back()}>
            Cambiar
          </AppText>
        </AppText>
      )}
      offline={offline}
      footer={(
        <View style={styles.footer}>
          {formError && !offline && <AppText variant="secondary" tone="danger" accessibilityLiveRegion="polite">{formError}</AppText>}
          <Button title={offline ? 'Reintentar' : 'Crear cuenta'} onPress={submit} size="lg"
            loading={loading} disabled={!canSubmit} />
        </View>
      )}
    >
      <TextField
        label="Nombre"
        value={name}
        onChangeText={setName}
        maxLength={100}
        autoComplete="name"
        textContentType="name"
        autoCapitalize="words"
        autoFocus
        returnKeyType="next"
        submitBehavior="submit"
        onSubmitEditing={() => usernameRef.current?.focus()}
      />
      <TextField
        ref={usernameRef}
        label="Nombre de usuario"
        prefix="@"
        value={username}
        onChangeText={(text) => { setUsernameEdited(true); setUsername(text.replace(/\s/g, '').toLowerCase()); }}
        help={usernameHelp}
        maxLength={50}
        autoComplete="username-new"
        textContentType="username"
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="next"
        submitBehavior="submit"
        onSubmitEditing={() => passwordRef.current?.focus()}
      />
      <TextField
        ref={passwordRef}
        label="Contraseña"
        value={password}
        onChangeText={(text) => { setPassword(text); setPasswordError(undefined); }}
        onBlur={() => password && setPasswordError(passwordProblem(password))}
        error={passwordError}
        help={(
          <View style={styles.inline}>
            {longEnough && <SymbolView name={{ ios: 'checkmark', android: 'check', web: 'check' }} size={13} tintColor={colors.secondary} />}
            <AppText variant="secondary" tone={longEnough ? 'olive' : 'muted'}>Al menos {MIN_PASSWORD} caracteres</AppText>
          </View>
        )}
        secure
        maxLength={MAX_PASSWORD}
        autoComplete="new-password"
        textContentType="newPassword"
        passwordRules={`minlength: ${MIN_PASSWORD}; maxlength: ${MAX_PASSWORD};`}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="done"
        onSubmitEditing={submit}
      />
    </AuthStep>
  );
}

const useStyles = createThemedStyles(({ colors }) => ({
  inline: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: space.s1 },
  taken: { gap: space.s2 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.s2 },
  chip: {
    paddingVertical: 6, paddingHorizontal: space.s3, borderRadius: radius.full, backgroundColor: colors.secondarySoft,
  },
  footer: { gap: space.s2 },
}));
