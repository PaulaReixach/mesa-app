import {
  router,
  useFocusEffect,
} from 'expo-router';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  useCallback,
  useState,
} from 'react';

import { GroupCard } from '../../components/GroupCard';
import { PrimaryButton } from '../../components/PrimaryButton';
import { useAuth } from '../../contexts/auth-context';
import { getErrorMessage } from '../../lib/api';
import { getGroups } from '../../services/group-service';
import { colors } from '../../theme/colors';
import { RestaurantGroup } from '../../types/group';
import { NotificationBellButton } from '../../components/NotificationBellButton';

export default function HomeScreen() {
  const {
    user,
    accessToken,
    signOut,
  } = useAuth();

  const [groups, setGroups] = useState<RestaurantGroup[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadError, setLoadError] =
    useState<string | null>(null);

  const loadGroups = useCallback(
    async (refreshing = false) => {
      if (!accessToken) {
        return;
      }

      try {
        setLoadError(null);

        if (refreshing) {
          setIsRefreshing(true);
        } else {
          setIsLoading(true);
        }

        const response = await getGroups(accessToken);
        setGroups(response);
      } catch (error) {
        setLoadError(getErrorMessage(error));
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [accessToken],
  );

  useFocusEffect(
    useCallback(() => {
      void loadGroups();
    }, [loadGroups]),
  );

  async function handleSignOut() {
    await signOut();
    router.replace('/login');
  }

  function openGroup(groupId: string) {
    router.push({
      pathname: '/groups/[groupId]',
      params: {
        groupId,
      },
    });
  }

  const userInitial =
    user?.name?.charAt(0).toUpperCase() ?? '?';

  return (
    <SafeAreaView
      edges={['top', 'right', 'bottom', 'left']}
      style={styles.safeArea}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            onRefresh={() => loadGroups(true)}
            refreshing={isRefreshing}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.greeting}>
              Hola, {user?.name} 👋
            </Text>

            <Text style={styles.subtitle}>
              ¿Qué os apetece descubrir hoy?
            </Text>
          </View>

          <View style={styles.headerActions}>
            <NotificationBellButton />

            <Pressable
              accessibilityLabel="Abrir perfil"
              accessibilityRole="button"
              onPress={() => {
                router.push('/profile');
              }}
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {userInitial}
                </Text>
              </View>
            </Pressable>
          </View>
        </View>

        <View style={styles.hero}>
          <Text style={styles.heroEyebrow}>
            VUESTROS PLANES
          </Text>

          <Text style={styles.heroTitle}>
            {groups.length === 0
              ? 'Cread vuestro primer grupo'
              : `${groups.length} ${
                  groups.length === 1 ? 'grupo' : 'grupos'
                } para seguir comiendo bien`}
          </Text>

          <Text style={styles.heroDescription}>
            Guarda restaurantes, comparte recomendaciones y
            decidid juntos dónde será la próxima comida.
          </Text>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Mis grupos
          </Text>

          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/groups/create')}
            style={({ pressed }) => [
              styles.addButton,
              pressed ? styles.addButtonPressed : null,
            ]}
          >
            <Text style={styles.addButtonText}>+ Crear</Text>
          </Pressable>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator
              color={colors.primary}
              size="large"
            />
          </View>
        ) : null}

        {!isLoading && loadError ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorTitle}>
              No hemos podido cargar los grupos
            </Text>

            <Text style={styles.errorText}>
              {loadError}
            </Text>

            <Pressable onPress={() => loadGroups()}>
              <Text style={styles.retryText}>
                Volver a intentar
              </Text>
            </Pressable>
          </View>
        ) : null}

        {!isLoading &&
        !loadError &&
        groups.length === 0 ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
              <Text style={styles.emptyIconText}>🍽️</Text>
            </View>

            <Text style={styles.emptyTitle}>
              Todavía no tienes ningún grupo
            </Text>

            <Text style={styles.emptyText}>
              Crea uno para empezar a guardar restaurantes
              con tu pareja, amigos o familia.
            </Text>

            <PrimaryButton
              onPress={() => router.push('/groups/create')}
              title="Crear mi primer grupo"
            />
          </View>
        ) : null}

        {!isLoading && !loadError && groups.length > 0 ? (
          <View style={styles.groups}>
            {groups.map((group) => (
              <GroupCard
                group={group}
                key={group.id}
                onPress={() => openGroup(group.id)}
              />
            ))}
          </View>
        ) : null}

        <Pressable
          accessibilityRole="button"
          onPress={handleSignOut}
          style={({ pressed }) => [
            styles.logoutButton,
            pressed ? styles.logoutButtonPressed : null,
          ]}
        >
          <Text style={styles.logoutText}>
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
    flexGrow: 1,
    gap: 24,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  headerText: {
    flex: 1,
  },
  greeting: {
    color: colors.text,
    fontSize: 26,
    fontWeight: '800',
  },
  subtitle: {
    marginTop: 5,
    color: colors.muted,
    fontSize: 15,
  },
  avatar: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: colors.primary,
  },
  avatarText: {
    color: colors.white,
    fontSize: 20,
    fontWeight: '800',
  },
  hero: {
    gap: 10,
    borderRadius: 24,
    backgroundColor: colors.primary,
    padding: 24,
  },
  heroEyebrow: {
    color: '#FFE2D8',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  heroTitle: {
    color: colors.white,
    fontSize: 25,
    fontWeight: '800',
    lineHeight: 32,
  },
  heroDescription: {
    color: '#FFF1EC',
    fontSize: 15,
    lineHeight: 22,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 21,
    fontWeight: '800',
  },
  addButton: {
    borderRadius: 999,
    backgroundColor: '#F7D9CF',
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  addButtonPressed: {
    opacity: 0.7,
  },
  addButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '800',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 50,
  },
  groups: {
    gap: 12,
  },
  emptyCard: {
    alignItems: 'center',
    gap: 14,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 22,
    backgroundColor: colors.surface,
    padding: 24,
  },
  emptyIcon: {
    width: 62,
    height: 62,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: '#FFF0EA',
  },
  emptyIconText: {
    fontSize: 28,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 19,
    fontWeight: '800',
    textAlign: 'center',
  },
  emptyText: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  errorCard: {
    gap: 10,
    borderWidth: 1,
    borderColor: '#F3C5BC',
    borderRadius: 20,
    backgroundColor: '#FFF1EE',
    padding: 20,
  },
  errorTitle: {
    color: colors.danger,
    fontSize: 17,
    fontWeight: '800',
  },
  errorText: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  retryText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '800',
  },
  logoutButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
    marginTop: 'auto',
    borderRadius: 16,
  },
  logoutButtonPressed: {
    backgroundColor: '#FCE8E3',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoutText: {
    color: colors.danger,
    fontSize: 15,
    fontWeight: '700',
  },
});