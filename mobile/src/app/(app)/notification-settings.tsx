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
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '../../contexts/auth-context';
import { getErrorMessage } from '../../lib/api';
import {
  getCurrentUserNotificationPreferences,
  updateCurrentUserNotificationPreferences,
} from '../../services/notification-service';
import { colors } from '../../theme/colors';
import { NotificationPreferences } from '../../types/notification';

type SymbolName =
  ComponentProps<typeof SymbolView>['name'];

type PreferenceKey =
  | 'notificationsEnabled'
  | 'newRestaurantsEnabled'
  | 'restaurantStatusEnabled'
  | 'ratingsEnabled'
  | 'groupActivityEnabled';

type SectionProps = {
  title: string;
  children: ReactNode;
};

type NotificationRowProps = {
  icon: SymbolName;
  title: string;
  subtitle: string;
  value: boolean;
  disabled?: boolean;
  isLast?: boolean;
  onValueChange: (value: boolean) => void;
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

function NotificationRow({
  icon,
  title,
  subtitle,
  value,
  disabled = false,
  isLast = false,
  onValueChange,
}: NotificationRowProps) {
  return (
    <View
      style={[
        styles.notificationRow,
        !isLast
          ? styles.notificationRowBorder
          : null,
        disabled
          ? styles.notificationRowDisabled
          : null,
      ]}
    >
      <View style={styles.notificationIcon}>
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

      <View style={styles.notificationText}>
        <Text
          style={[
            styles.notificationTitle,
            disabled
              ? styles.disabledText
              : null,
          ]}
        >
          {title}
        </Text>

        <Text
          style={[
            styles.notificationSubtitle,
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

export default function NotificationsScreen() {
  const {
    accessToken,
  } = useAuth();

  const [
    preferences,
    setPreferences,
  ] =
    useState<NotificationPreferences | null>(
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
    useCallback(async () => {
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
          await getCurrentUserNotificationPreferences(
            accessToken,
          );

        setPreferences(response);
      } catch (error) {
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

  async function updatePreference(
    key: PreferenceKey,
    value: boolean,
  ) {
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
      [key]: value,
    };

    setPreferences(nextPreferences);
    setErrorMessage(null);
    setIsSaving(true);

    try {
      const response =
        await updateCurrentUserNotificationPreferences(
          {
            notificationsEnabled:
              nextPreferences
                .notificationsEnabled,

            newRestaurantsEnabled:
              nextPreferences
                .newRestaurantsEnabled,

            restaurantStatusEnabled:
              nextPreferences
                .restaurantStatusEnabled,

            ratingsEnabled:
              nextPreferences
                .ratingsEnabled,

            groupActivityEnabled:
              nextPreferences
                .groupActivityEnabled,
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

  const secondaryOptionsDisabled =
    isSaving
    || !preferences?.notificationsEnabled;

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
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Pressable
            accessibilityLabel="Volver"
            accessibilityRole="button"
            onPress={() => router.back()}
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
            Notificaciones
          </Text>

          <View style={styles.headerPlaceholder} />
        </View>

        <View style={styles.intro}>
          <View style={styles.introIcon}>
            <SymbolView
              name={{
                ios: 'bell.fill',
                android: 'notifications',
                web: 'notifications',
              }}
              size={27}
              tintColor={colors.primary}
            />
          </View>

          <Text style={styles.introTitle}>
            Mantente al día
          </Text>

          <Text style={styles.introDescription}>
            Elige qué novedades quieres recibir
            sobre tus grupos y restaurantes.
          </Text>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
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
            <Text style={styles.loadErrorTitle}>
              No hemos podido cargar tus ajustes
            </Text>

            <Text style={styles.loadErrorText}>
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
              <Text style={styles.retryButtonText}>
                Reintentar
              </Text>
            </Pressable>
          </View>
        ) : null}

        {!isLoading && preferences ? (
          <>
            <Section title="General">
              <NotificationRow
                icon={{
                  ios: 'bell',
                  android: 'notifications',
                  web: 'notifications',
                }}
                isLast
                onValueChange={(value) => {
                  void updatePreference(
                    'notificationsEnabled',
                    value,
                  );
                }}
                subtitle="Activa o desactiva todas las notificaciones de Mesa."
                title="Permitir notificaciones"
                value={
                  preferences
                    .notificationsEnabled
                }
              />
            </Section>

            <Section title="Actividad">
              <NotificationRow
                disabled={
                  secondaryOptionsDisabled
                }
                icon={{
                  ios: 'fork.knife',
                  android: 'restaurant',
                  web: 'restaurant',
                }}
                onValueChange={(value) => {
                  void updatePreference(
                    'newRestaurantsEnabled',
                    value,
                  );
                }}
                subtitle="Cuando alguien añada un restaurante a uno de tus grupos."
                title="Nuevos restaurantes"
                value={
                  preferences
                    .newRestaurantsEnabled
                }
              />

              <NotificationRow
                disabled={
                  secondaryOptionsDisabled
                }
                icon={{
                  ios: 'arrow.triangle.2.circlepath',
                  android: 'sync',
                  web: 'sync',
                }}
                onValueChange={(value) => {
                  void updatePreference(
                    'restaurantStatusEnabled',
                    value,
                  );
                }}
                subtitle="Cuando un restaurante cambie de pendiente, visitado o descartado."
                title="Cambios de estado"
                value={
                  preferences
                    .restaurantStatusEnabled
                }
              />

              <NotificationRow
                disabled={
                  secondaryOptionsDisabled
                }
                icon={{
                  ios: 'star',
                  android: 'star',
                  web: 'star',
                }}
                onValueChange={(value) => {
                  void updatePreference(
                    'ratingsEnabled',
                    value,
                  );
                }}
                subtitle="Cuando haya nuevas valoraciones en tus grupos."
                title="Nuevas valoraciones"
                value={
                  preferences.ratingsEnabled
                }
              />

              <NotificationRow
                disabled={
                  secondaryOptionsDisabled
                }
                icon={{
                  ios: 'person.2',
                  android: 'group',
                  web: 'group',
                }}
                isLast
                onValueChange={(value) => {
                  void updatePreference(
                    'groupActivityEnabled',
                    value,
                  );
                }}
                subtitle="Novedades relacionadas con miembros y actividad del grupo."
                title="Actividad de los grupos"
                value={
                  preferences
                    .groupActivityEnabled
                }
              />
            </Section>

            <View style={styles.saveStatus}>
              {isSaving ? (
                <>
                  <ActivityIndicator
                    color={colors.primary}
                    size="small"
                  />

                  <Text style={styles.saveStatusText}>
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

                  <Text style={styles.saveStatusText}>
                    Los cambios se guardan automáticamente.
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
    marginBottom: 30,
  },

  introIcon: {
    width: 62,
    height: 62,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 13,
    borderRadius: 31,
    backgroundColor: '#F8E9E4',
  },

  introTitle: {
    color: colors.text,
    fontSize: 19,
    fontWeight: '800',
  },

  introDescription: {
    maxWidth: 310,
    marginTop: 6,
    color: colors.muted,
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
  },

  section: {
    marginBottom: 27,
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

  notificationRow: {
    minHeight: 76,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  notificationRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  notificationRowDisabled: {
    opacity: 0.48,
  },

  notificationIcon: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 19,
    backgroundColor: '#F7EEE9',
  },

  notificationText: {
    flex: 1,
    paddingVertical: 12,
  },

  notificationTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },

  notificationSubtitle: {
    marginTop: 3,
    color: colors.muted,
    fontSize: 12,
    lineHeight: 17,
  },

  disabledText: {
    color: colors.muted,
  },

  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 65,
  },

  loadingText: {
    marginTop: 13,
    color: colors.muted,
    fontSize: 13,
  },

  loadError: {
    alignItems: 'center',
    paddingVertical: 36,
  },

  loadErrorTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
  },

  loadErrorText: {
    marginTop: 7,
    color: colors.muted,
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
  },

  retryButton: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 22,
    paddingHorizontal: 24,
  },

  retryButtonPressed: {
    backgroundColor: '#FFF0EB',
  },

  retryButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },

  saveStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    marginTop: -5,
  },

  saveStatusText: {
    color: colors.muted,
    fontSize: 12,
  },

  errorBox: {
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#F0C2B8',
    borderRadius: 14,
    backgroundColor: '#FFF1EE',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },

  errorText: {
    color: colors.danger,
    fontSize: 13,
    lineHeight: 19,
  },
});