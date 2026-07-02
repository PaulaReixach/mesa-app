import { SymbolView } from 'expo-symbols';
import {
  router,
  useFocusEffect,
} from 'expo-router';
import {
  useCallback,
  useState,
} from 'react';
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

import { GroupCard } from '../../../components/GroupCard';
import { useAuth } from '../../../contexts/auth-context';
import { getErrorMessage } from '../../../lib/api';
import { getGroups } from '../../../services/group-service';
import { colors } from '../../../theme/colors';
import { RestaurantGroup } from '../../../types/group';

export default function GroupsScreen() {
  const { accessToken } = useAuth();

  const [
    groups,
    setGroups,
  ] = useState<RestaurantGroup[]>([]);

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [
    isRefreshing,
    setIsRefreshing,
  ] = useState(false);

  const [
    loadError,
    setLoadError,
  ] = useState<string | null>(null);

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

        const response =
          await getGroups(accessToken);

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

  function openGroup(groupId: string) {
    router.push({
      pathname: '/groups/[groupId]',
      params: {
        groupId,
      },
    });
  }

  return (
    <SafeAreaView
      edges={['top', 'right', 'left']}
      style={styles.safeArea}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            onRefresh={() => {
              void loadGroups(true);
            }}
            refreshing={isRefreshing}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.title}>
              Grupos
            </Text>

            <Text style={styles.subtitle}>
              Guarda y organiza restaurantes con tu gente.
            </Text>
          </View>

          <Pressable
            accessibilityLabel="Crear grupo"
            accessibilityRole="button"
            onPress={() => {
              router.push('/groups/create');
            }}
            style={({ pressed }) => [
              styles.createButton,
              pressed
                ? styles.createButtonPressed
                : null,
            ]}
          >
            <SymbolView
              name={{
                ios: 'plus',
                android: 'add',
                web: 'add',
              }}
              size={24}
              tintColor={colors.white}
            />
          </Pressable>
        </View>

        <View style={styles.summary}>
          <Text style={styles.summaryValue}>
            {groups.length}
          </Text>

          <Text style={styles.summaryLabel}>
            {groups.length === 1
              ? 'grupo activo'
              : 'grupos activos'}
          </Text>
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
              No hemos podido cargar tus grupos
            </Text>

            <Text style={styles.errorText}>
              {loadError}
            </Text>

            <Pressable
              accessibilityRole="button"
              onPress={() => {
                void loadGroups();
              }}
            >
              <Text style={styles.retryText}>
                Volver a intentar
              </Text>
            </Pressable>
          </View>
        ) : null}

        {!isLoading
        && !loadError
        && groups.length === 0 ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
              <SymbolView
                name={{
                  ios: 'person.2.fill',
                  android: 'group',
                  web: 'group',
                }}
                size={32}
                tintColor={colors.primary}
              />
            </View>

            <Text style={styles.emptyTitle}>
              Crea tu primer grupo
            </Text>

            <Text style={styles.emptyText}>
              Añade a tu pareja, amigos o familia y empezad
              a guardar restaurantes juntos.
            </Text>

            <Pressable
              accessibilityRole="button"
              onPress={() => {
                router.push('/groups/create');
              }}
              style={({ pressed }) => [
                styles.emptyButton,
                pressed
                  ? styles.emptyButtonPressed
                  : null,
              ]}
            >
              <Text style={styles.emptyButtonText}>
                Crear grupo
              </Text>
            </Pressable>
          </View>
        ) : null}

        {!isLoading
        && !loadError
        && groups.length > 0 ? (
          <View style={styles.groups}>
            {groups.map((group) => (
              <GroupCard
                group={group}
                key={group.id}
                onPress={() => {
                  openGroup(group.id);
                }}
              />
            ))}
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
    gap: 22,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 34,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  headerText: {
    flex: 1,
    gap: 5,
  },
  title: {
    color: colors.text,
    fontSize: 30,
    fontWeight: '800',
  },
  subtitle: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  createButton: {
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 23,
    backgroundColor: colors.primary,
  },
  createButtonPressed: {
    backgroundColor: colors.primaryPressed,
    transform: [
      {
        scale: 0.96,
      },
    ],
  },
  summary: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 7,
  },
  summaryValue: {
    color: colors.primary,
    fontSize: 26,
    fontWeight: '800',
  },
  summaryLabel: {
    color: colors.muted,
    fontSize: 14,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 80,
  },
  groups: {
    gap: 13,
  },
  emptyCard: {
    alignItems: 'center',
    gap: 14,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 24,
    backgroundColor: colors.surface,
    padding: 28,
  },
  emptyIcon: {
    width: 68,
    height: 68,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 23,
    backgroundColor: '#FBE9E2',
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '800',
  },
  emptyText: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
  },
  emptyButton: {
    minHeight: 50,
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    borderRadius: 25,
    backgroundColor: colors.primary,
  },
  emptyButtonPressed: {
    backgroundColor: colors.primaryPressed,
  },
  emptyButtonText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '700',
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
});