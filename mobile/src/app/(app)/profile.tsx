import { SymbolView } from 'expo-symbols';
import {
  router,
  useFocusEffect,
} from 'expo-router';
import {
  ComponentProps,
  useCallback,
  useMemo,
  useState,
} from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '../../contexts/auth-context';
import { resolveApiUrl } from '../../lib/api';
import { getCurrentUserProfileStats } from '../../services/profile-service';
import { colors } from '../../theme/colors';
import { UserProfileStats } from '../../types/profile';

type SymbolName =
  ComponentProps<typeof SymbolView>['name'];

type MenuRowProps = {
  icon: SymbolName;
  label: string;
  isLast?: boolean;
  onPress?: () => void;
};

type StatProps = {
  value: number | string;
  label: string;
  showDivider?: boolean;
};

const profilePalette = {
  line: '#E9DFD9',
  subtleText: '#7E746E',
  accent: '#D85C3F',
  logoutBorder: '#F0C8BE',
  logoutBackground: '#FFF9F7',
};

function StatItem({
  value,
  label,
  showDivider = true,
}: StatProps) {
  return (
    <View style={styles.statItem}>
      <Text
        allowFontScaling={false}
        style={styles.statValue}
      >
        {value}
      </Text>

      <Text
        allowFontScaling={false}
        style={styles.statLabel}
      >
        {label}
      </Text>

      {showDivider ? (
        <View style={styles.statDivider} />
      ) : null}
    </View>
  );
}

function MenuRow({
  icon,
  label,
  isLast = false,
  onPress,
}: MenuRowProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.menuRow,
        !isLast
          ? styles.menuRowBorder
          : null,
        pressed
          ? styles.menuRowPressed
          : null,
      ]}
    >
      <View style={styles.menuLeft}>
        <SymbolView
          name={icon}
          size={18}
          tintColor={colors.text}
        />

        <Text
          allowFontScaling={false}
          style={styles.menuLabel}
        >
          {label}
        </Text>
      </View>

      <SymbolView
        name={{
          ios: 'chevron.right',
          android: 'chevron_right',
          web: 'chevron_right',
        }}
        size={17}
        tintColor={colors.muted}
      />
    </Pressable>
  );
}

export default function ProfileScreen() {
  const {
    user,
    signOut,
    accessToken,
  } = useAuth();

  const [
    stats,
    setStats,
  ] = useState<UserProfileStats | null>(null);

  const [
    statsError,
    setStatsError,
  ] = useState(false);

  const loadStats = useCallback(async () => {
    if (!accessToken) {
      setStats(null);
      return;
    }

    try {
      setStatsError(false);

      const response =
        await getCurrentUserProfileStats(
          accessToken,
        );

      setStats(response);
    } catch {
      setStats(null);
      setStatsError(true);
    }
  }, [accessToken]);

  useFocusEffect(
    useCallback(() => {
      void loadStats();
    }, [loadStats]),
  );

  const displayName = useMemo(() => {
    return user?.name?.trim() || 'Tu perfil';
  }, [user?.name]);

  const displayUsername = useMemo(() => {
    if (user?.username?.trim()) {
      return `@${user.username}`;
    }

    return '@usuario';
  }, [user?.username]);

  const userInitial = useMemo(() => {
    return displayName
      .charAt(0)
      .toUpperCase();
  }, [displayName]);

  const avatarUri = useMemo(() => {
    if (!user?.avatarUrl) {
      return null;
    }

    return resolveApiUrl(user.avatarUrl);
  }, [user?.avatarUrl]);

  async function handleSignOut() {
    await signOut();
    router.replace('/login');
  }

  function handleBack() {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace('/home');
  }

  function handleEditProfile() {
    router.push('/profile-edit');
  }

  return (
    <SafeAreaView
      edges={[
        'top',
        'right',
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
            onPress={handleBack}
            style={({ pressed }) => [
              styles.iconButton,
              pressed
                ? styles.iconButtonPressed
                : null,
            ]}
          >
            <SymbolView
              name={{
                ios: 'chevron.left',
                android: 'arrow_back',
                web: 'arrow_back',
              }}
              size={19}
              tintColor={colors.text}
            />
          </Pressable>

          <Text
            allowFontScaling={false}
            style={styles.headerTitle}
          >
            Mi perfil
          </Text>

          <Pressable
            accessibilityLabel="Editar perfil"
            accessibilityRole="button"
            onPress={handleEditProfile}
            style={({ pressed }) => [
              styles.iconButton,
              pressed
                ? styles.iconButtonPressed
                : null,
            ]}
          >
            <SymbolView
              name={{
                ios: 'square.and.pencil',
                android: 'edit',
                web: 'edit',
              }}
              size={18}
              tintColor={colors.text}
            />
          </Pressable>
        </View>

        <View style={styles.profileSection}>
          <View style={styles.profileTop}>
            {avatarUri ? (
              <Image
                source={{
                  uri: avatarUri,
                }}
                style={styles.avatar}
              />
            ) : (
              <View style={styles.avatarFallback}>
                <Text
                  allowFontScaling={false}
                  style={styles.avatarFallbackText}
                >
                  {userInitial}
                </Text>
              </View>
            )}

            <View style={styles.profileInfo}>
              <Text
                allowFontScaling={false}
                numberOfLines={1}
                style={styles.name}
              >
                {displayName}
              </Text>

              <Text
                allowFontScaling={false}
                numberOfLines={1}
                style={styles.username}
              >
                {displayUsername}
              </Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <StatItem
              label="Restaurantes"
              value={
                stats?.restaurantsCount
                ?? '—'
              }
            />

            <StatItem
              label="Grupos"
              value={
                stats?.groupsCount
                ?? '—'
              }
            />

            <StatItem
              label="Valoraciones"
              showDivider={false}
              value={
                stats?.ratingsCount
                ?? '—'
              }
            />
          </View>

          {statsError ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                void loadStats();
              }}
              style={styles.statsError}
            >
              <Text
                allowFontScaling={false}
                style={styles.statsErrorText}
              >
                No se han podido actualizar las estadísticas.
                Pulsa para reintentar.
              </Text>
            </Pressable>
          ) : null}
        </View>

        <View style={styles.menuSection}>
          <MenuRow
            icon={{
              ios: 'square.and.pencil',
              android: 'edit',
              web: 'edit',
            }}
            label="Editar perfil"
            onPress={handleEditProfile}
          />

          <MenuRow
            icon={{
              ios: 'gearshape',
              android: 'settings',
              web: 'settings',
            }}
              label="Ajustes de cuenta"
              onPress={() => {
                router.push('/account-settings');
            }}
          />

          <MenuRow
            icon={{
              ios: 'bell',
              android: 'notifications',
              web: 'notifications',
            }}
            label="Notificaciones"
            onPress={() => {}}
          />

          <MenuRow
            icon={{
              ios: 'lock',
              android: 'lock',
              web: 'lock',
            }}
            label="Privacidad"
            onPress={() => {}}
          />

          <MenuRow
            icon={{
              ios: 'questionmark.circle',
              android: 'help',
              web: 'help',
            }}
            label="Ayuda y soporte"
            onPress={() => {}}
          />

          <MenuRow
            icon={{
              ios: 'info.circle',
              android: 'info',
              web: 'info',
            }}
            isLast
            label="Acerca de Mesa"
            onPress={() => {}}
          />
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => {
            void handleSignOut();
          }}
          style={({ pressed }) => [
            styles.logoutButton,
            pressed
              ? styles.logoutButtonPressed
              : null,
          ]}
        >
          <Text
            allowFontScaling={false}
            style={styles.logoutText}
          >
            Cerrar sesión
          </Text>
        </Pressable>
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
    paddingHorizontal: 22,
    paddingTop: 8,
    paddingBottom: 34,
  },

  header: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 28,
  },

  iconButton: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 17,
  },

  iconButtonPressed: {
    backgroundColor: '#F6EFE9',
  },

  headerTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
  },

  profileSection: {
    marginBottom: 24,
  },

  profileTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 22,
  },

  avatar: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: '#E8DDD6',
  },

  avatarFallback: {
    width: 74,
    height: 74,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 37,
    backgroundColor: colors.primary,
  },

  avatarFallbackText: {
    color: colors.white,
    fontSize: 29,
    fontWeight: '800',
  },

  profileInfo: {
    flex: 1,
    gap: 4,
  },

  name: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.2,
  },

  username: {
    color: profilePalette.subtleText,
    fontSize: 14,
    fontWeight: '600',
  },

  statsRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'space-between',
  },

  statItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
  },

  statValue: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '800',
    lineHeight: 32,
    marginBottom: 2,
  },

  statLabel: {
    color: colors.text,
    fontSize: 11,
    fontWeight: '600',
  },

  statDivider: {
    position: 'absolute',
    right: 0,
    top: 4,
    bottom: 4,
    width: 1,
    backgroundColor: profilePalette.line,
  },

  statsError: {
    marginTop: 14,
  },

  statsErrorText: {
    color: colors.danger,
    fontSize: 12,
    lineHeight: 17,
    textAlign: 'center',
  },

  menuSection: {
    borderTopWidth: 1,
    borderTopColor: profilePalette.line,
    marginBottom: 26,
  },

  menuRow: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  menuRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: profilePalette.line,
  },

  menuRowPressed: {
    backgroundColor: '#FBF6F2',
  },

  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },

  menuLabel: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '500',
  },

  logoutButton: {
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: profilePalette.logoutBorder,
    borderRadius: 26,
    backgroundColor: profilePalette.logoutBackground,
  },

  logoutButtonPressed: {
    backgroundColor: '#FFF3F0',
  },

  logoutText: {
    color: profilePalette.accent,
    fontSize: 16,
    fontWeight: '700',
  },
});