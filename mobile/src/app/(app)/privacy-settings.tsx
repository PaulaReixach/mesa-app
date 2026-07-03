import { SymbolView } from 'expo-symbols';
import {
  router,
  useFocusEffect,
} from 'expo-router';
import {
  ComponentProps,
  ReactNode,
  useCallback,
  useState,
} from 'react';
import {
  ActivityIndicator,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import {
  SafeAreaView,
} from 'react-native-safe-area-context';

import {
  useAuth,
} from '../../contexts/auth-context';
import {
  getErrorMessage,
} from '../../lib/api';
import {
  getCurrentUserPrivacyPreferences,
  updateCurrentUserPrivacyPreferences,
} from '../../services/privacy-service';
import { colors } from '../../theme/colors';
import {
  PrivacyPreferences,
} from '../../types/privacy';

type SymbolName =
  ComponentProps<typeof SymbolView>['name'];

type SectionProps = {
  title: string;
  children: ReactNode;
};

type PrivacyToggleRowProps = {
  icon: SymbolName;
  title: string;
  subtitle: string;
  value: boolean;
  disabled?: boolean;
  onValueChange: (value: boolean) => void;
};

type PrivacyInfoRowProps = {
  icon: SymbolName;
  title: string;
  subtitle: string;
  isLast?: boolean;
  onPress?: () => void;
};

const switchColors = {
  disabledTrack: '#DDD4CE',
  enabledTrack: '#E8A18C',
  disabledThumb: '#F9F6F3',
  enabledThumb: colors.primary,
};

function Section({
  title,
  children,
}: SectionProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>
        {title}
      </Text>

      <View style={styles.sectionContent}>
        {children}
      </View>
    </View>
  );
}

function PrivacyToggleRow({
  icon,
  title,
  subtitle,
  value,
  disabled = false,
  onValueChange,
}: PrivacyToggleRowProps) {
  return (
    <View
      style={[
        styles.settingRow,
        disabled
          ? styles.settingRowDisabled
          : null,
      ]}
    >
      <View style={styles.settingIcon}>
        <SymbolView
          name={icon}
          size={19}
          tintColor={
            disabled
              ? colors.muted
              : colors.text
          }
        />
      </View>

      <View style={styles.settingText}>
        <Text
          style={[
            styles.settingTitle,
            disabled
              ? styles.disabledText
              : null,
          ]}
        >
          {title}
        </Text>

        <Text
          style={[
            styles.settingSubtitle,
            disabled
              ? styles.disabledText
              : null,
          ]}
        >
          {subtitle}
        </Text>
      </View>

      <Switch
        accessibilityLabel={title}
        disabled={disabled}
        ios_backgroundColor={
          switchColors.disabledTrack
        }
        onValueChange={onValueChange}
        thumbColor={
          value
            ? switchColors.enabledThumb
            : switchColors.disabledThumb
        }
        trackColor={{
          false:
            switchColors.disabledTrack,
          true:
            switchColors.enabledTrack,
        }}
        value={value}
      />
    </View>
  );
}

function PrivacyInfoRow({
  icon,
  title,
  subtitle,
  isLast = false,
  onPress,
}: PrivacyInfoRowProps) {
  return (
    <Pressable
      accessibilityRole={
        onPress
          ? 'button'
          : undefined
      }
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [
        styles.settingRow,

        !isLast
          ? styles.settingRowBorder
          : null,

        pressed && onPress
          ? styles.settingRowPressed
          : null,
      ]}
    >
      <View style={styles.settingIcon}>
        <SymbolView
          name={icon}
          size={19}
          tintColor={colors.text}
        />
      </View>

      <View style={styles.settingText}>
        <Text style={styles.settingTitle}>
          {title}
        </Text>

        <Text style={styles.settingSubtitle}>
          {subtitle}
        </Text>
      </View>

      {onPress ? (
        <SymbolView
          name={{
            ios: 'chevron.right',
            android: 'chevron_right',
            web: 'chevron_right',
          }}
          size={17}
          tintColor={colors.muted}
        />
      ) : null}
    </Pressable>
  );
}

export default function PrivacySettingsScreen() {
  const {
    accessToken,
  } = useAuth();

  const [
    preferences,
    setPreferences,
  ] =
    useState<PrivacyPreferences | null>(
      null,
    );

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [
    isSaving,
    setIsSaving,
  ] = useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState<string | null>(null);

  const loadPreferences =
    useCallback(async (): Promise<void> => {
      if (!accessToken) {
        setPreferences(null);

        setErrorMessage(
          'No se ha podido recuperar tu sesión.',
        );

        setIsLoading(false);

        return;
      }

      try {
        setIsLoading(true);
        setErrorMessage(null);

        const response =
          await getCurrentUserPrivacyPreferences(
            accessToken,
          );

        setPreferences(response);
      } catch (error) {
        setPreferences(null);

        setErrorMessage(
          getErrorMessage(error),
        );
      } finally {
        setIsLoading(false);
      }
    }, [accessToken]);

  useFocusEffect(
    useCallback(() => {
      void loadPreferences();
    }, [loadPreferences]),
  );

  async function updateGroupInvitations(
    value: boolean,
  ): Promise<void> {
    if (
      !preferences
      || !accessToken
      || isSaving
    ) {
      return;
    }

    const previousPreferences =
      preferences;

    const nextPreferences = {
      ...preferences,
      groupInvitationsEnabled: value,
    };

    setPreferences(nextPreferences);
    setErrorMessage(null);
    setIsSaving(true);

    try {
      const response =
        await updateCurrentUserPrivacyPreferences(
          {
            groupInvitationsEnabled:
              value,
          },
          accessToken,
        );

      setPreferences(response);
    } catch (error) {
      setPreferences(
        previousPreferences,
      );

      setErrorMessage(
        getErrorMessage(error),
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <SafeAreaView
      edges={[
        'top',
        'right',
        'bottom',
        'left',
      ]}
      style={styles.safeArea}
    >
      <ScrollView
        contentContainerStyle={
          styles.content
        }
        showsVerticalScrollIndicator={
          false
        }
      >
        <View style={styles.header}>
          <Pressable
            accessibilityLabel="Volver"
            accessibilityRole="button"
            onPress={() => {
              router.back();
            }}
            style={({ pressed }) => [
              styles.headerButton,

              pressed
                ? styles.headerButtonPressed
                : null,
            ]}
          >
            <SymbolView
              name={{
                ios: 'chevron.left',
                android: 'arrow_back',
                web: 'arrow_back',
              }}
              size={20}
              tintColor={colors.text}
            />
          </Pressable>

          <Text style={styles.headerTitle}>
            Privacidad
          </Text>

          <View
            style={styles.headerPlaceholder}
          />
        </View>

        <View style={styles.intro}>
          <View style={styles.introIcon}>
            <SymbolView
              name={{
                ios: 'lock.shield.fill',
                android: 'shield',
                web: 'shield',
              }}
              size={28}
              tintColor={colors.primary}
            />
          </View>

          <Text style={styles.introTitle}>
            Tú tienes el control
          </Text>

          <Text
            style={styles.introDescription}
          >
            Decide cómo pueden encontrarte y
            revisa qué información compartes
            dentro de Mesa.
          </Text>
        </View>

        {isLoading ? (
          <View
            style={styles.loadingContainer}
          >
            <ActivityIndicator
              color={colors.primary}
              size="large"
            />

            <Text style={styles.loadingText}>
              Cargando preferencias...
            </Text>
          </View>
        ) : null}

        {!isLoading && !preferences ? (
          <View style={styles.loadError}>
            <Text
              style={styles.loadErrorTitle}
            >
              No hemos podido cargar tus ajustes
            </Text>

            <Text
              style={styles.loadErrorText}
            >
              Revisa la conexión con el servidor
              y vuelve a intentarlo.
            </Text>

            <Pressable
              accessibilityRole="button"
              onPress={() => {
                void loadPreferences();
              }}
              style={({ pressed }) => [
                styles.retryButton,

                pressed
                  ? styles.retryButtonPressed
                  : null,
              ]}
            >
              <Text
                style={styles.retryButtonText}
              >
                Reintentar
              </Text>
            </Pressable>
          </View>
        ) : null}

        {!isLoading && preferences ? (
          <>
            <Section title="Invitaciones">
              <PrivacyToggleRow
                disabled={isSaving}
                icon={{
                  ios: 'person.2.badge.plus',
                  android: 'group_add',
                  web: 'group_add',
                }}
                onValueChange={value => {
                  void updateGroupInvitations(
                    value,
                  );
                }}
                subtitle="Permite que otros usuarios te añadan a sus grupos mediante tu nombre de usuario."
                title="Permitir invitaciones a grupos"
                value={
                  preferences
                    .groupInvitationsEnabled
                }
              />
            </Section>

            <Section title="Información compartida">
              <PrivacyInfoRow
                icon={{
                  ios: 'envelope',
                  android: 'mail',
                  web: 'mail',
                }}
                subtitle="Tu correo electrónico nunca se muestra a otros usuarios de Mesa."
                title="Correo electrónico privado"
              />

              <PrivacyInfoRow
                icon={{
                  ios: 'person.crop.circle',
                  android: 'account_circle',
                  web: 'account_circle',
                }}
                isLast
                subtitle="Los miembros de tus grupos pueden ver tu nombre, usuario, foto y actividad dentro del grupo."
                title="Perfil dentro de los grupos"
              />
            </Section>

            <Section title="Permisos y datos">
              <PrivacyInfoRow
                icon={{
                  ios: 'gearshape',
                  android: 'settings',
                  web: 'settings',
                }}
                onPress={() => {
                  void Linking.openSettings();
                }}
                subtitle="Gestiona desde el móvil los permisos concedidos a Mesa."
                title="Permisos del dispositivo"
              />

              <PrivacyInfoRow
                icon={{
                  ios: 'person.text.rectangle',
                  android: 'manage_accounts',
                  web: 'manage_accounts',
                }}
                isLast
                onPress={() => {
                  router.push(
                    '/account-settings',
                  );
                }}
                subtitle="Consulta tus datos, cambia tu contraseña o elimina tu cuenta."
                title="Gestionar cuenta y datos"
              />
            </Section>

            <View style={styles.saveStatus}>
              {isSaving ? (
                <>
                  <ActivityIndicator
                    color={colors.primary}
                    size="small"
                  />

                  <Text
                    style={
                      styles.saveStatusText
                    }
                  >
                    Guardando cambios...
                  </Text>
                </>
              ) : (
                <>
                  <SymbolView
                    name={{
                      ios: 'checkmark.circle',
                      android: 'check_circle',
                      web: 'check_circle',
                    }}
                    size={17}
                    tintColor={colors.success}
                  />

                  <Text
                    style={
                      styles.saveStatusText
                    }
                  >
                    Los cambios se guardan
                    automáticamente.
                  </Text>
                </>
              )}
            </View>
          </>
        ) : null}

        {errorMessage && preferences ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>
              {errorMessage}
            </Text>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },

  content: {
    flexGrow: 1,
    paddingHorizontal: 22,
    paddingTop: 8,
    paddingBottom: 34,
  },

  header: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 22,
  },

  headerButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
  },

  headerButtonPressed: {
    backgroundColor: '#F6EFE9',
  },

  headerPlaceholder: {
    width: 36,
    height: 36,
  },

  headerTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
  },

  intro: {
    alignItems: 'center',
    marginBottom: 34,
    paddingHorizontal: 18,
  },

  introIcon: {
    width: 68,
    height: 68,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    borderRadius: 34,
    backgroundColor: '#F7E8E2',
  },

  introTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
  },

  introDescription: {
    maxWidth: 310,
    marginTop: 7,
    color: colors.muted,
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
  },

  section: {
    marginBottom: 28,
  },

  sectionTitle: {
    marginBottom: 10,
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },

  sectionContent: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },

  settingRow: {
    minHeight: 76,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
  },

  settingRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  settingRowPressed: {
    backgroundColor: '#FBF6F2',
  },

  settingRowDisabled: {
    opacity: 0.58,
  },

  settingIcon: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 19,
    backgroundColor: '#F7EEE9',
  },

  settingText: {
    flex: 1,
    paddingVertical: 12,
  },

  settingTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },

  settingSubtitle: {
    marginTop: 4,
    color: colors.muted,
    fontSize: 12,
    lineHeight: 17,
  },

  disabledText: {
    color: colors.muted,
  },

  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 70,
  },

  loadingText: {
    marginTop: 13,
    color: colors.muted,
    fontSize: 13,
    fontWeight: '600',
  },

  loadError: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 45,
  },

  loadErrorTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '800',
    textAlign: 'center',
  },

  loadErrorText: {
    maxWidth: 290,
    marginTop: 8,
    color: colors.muted,
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
  },

  retryButton: {
    minHeight: 42,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
    paddingHorizontal: 24,
    borderRadius: 21,
    backgroundColor: colors.primary,
  },

  retryButtonPressed: {
    opacity: 0.74,
  },

  retryButtonText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '800',
  },

  saveStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    marginTop: -4,
    marginBottom: 18,
  },

  saveStatusText: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '600',
  },

  errorBox: {
    marginBottom: 20,
    padding: 13,
    borderWidth: 1,
    borderColor: '#F1C8C3',
    borderRadius: 14,
    backgroundColor: '#FFF0EE',
  },

  errorText: {
    color: colors.danger,
    fontSize: 12,
    lineHeight: 17,
    textAlign: 'center',
  },
});