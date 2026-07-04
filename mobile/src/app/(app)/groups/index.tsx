import { SymbolView } from 'expo-symbols';
import {
  router,
  useFocusEffect,
  useLocalSearchParams,
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
import type { RestaurantGroup } from '../../../types/group';

type AddMode = 'SEARCH' | 'MANUAL';

export default function GroupsScreen() {
  const { addMode: addModeParam } =
    useLocalSearchParams<{
      addMode?: string;
    }>();

  const { accessToken } = useAuth();

  const [groups, setGroups] =
    useState<RestaurantGroup[]>([]);
  const [isLoading, setIsLoading] =
    useState(true);
  const [isRefreshing, setIsRefreshing] =
    useState(false);
  const [loadError, setLoadError] =
    useState<string | null>(null);

  const addMode: AddMode | null =
    addModeParam === 'SEARCH'
    || addModeParam === 'MANUAL'
      ? addModeParam
      : null;

  const selectingGroup = addMode !== null;

  const loadGroups = useCallback(
    async (refreshing = false) => {
      if (!accessToken) {
        setIsLoading(false);
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

  function openGroup(groupId: string): void {
    if (addMode) {
      router.push({
        pathname:
          '/groups/[groupId]/restaurants/create',
        params: {
          groupId,
          mode: addMode,
        },
      });
      return;
    }

    router.push({
      pathname: '/groups/[groupId]',
      params: { groupId },
    });
  }

  function openCreateGroup(): void {
    router.push('/groups/create');
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
        {selectingGroup ? (
          <View style={styles.selectionNavigation}>
            <Pressable
              accessibilityLabel="Volver"
              accessibilityRole="button"
              hitSlop={8}
              onPress={() => {
                router.back();
              }}
              style={({ pressed }) => [
                styles.backButton,
                pressed
                  ? styles.backButtonPressed
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

            <Text style={styles.selectionNavigationTitle}>
              Elegir grupo
            </Text>

            <View style={styles.navigationSpacer} />
          </View>
        ) : null}

        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.title}>
              {selectingGroup
                ? '¿Dónde lo guardamos?'
                : 'Grupos'}
            </Text>

            <Text style={styles.subtitle}>
              {selectingGroup
                ? addMode === 'MANUAL'
                  ? 'Selecciona el grupo donde quieres crear el restaurante.'
                  : 'Selecciona el grupo donde quieres añadir el restaurante.'
                : 'Guarda y organiza restaurantes con tu gente.'}
            </Text>
          </View>

          <Pressable
            accessibilityLabel="Crear grupo"
            accessibilityRole="button"
            onPress={openCreateGroup}
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
              size={23}
              tintColor={colors.white}
            />
          </Pressable>
        </View>

        {selectingGroup ? (
          <View style={styles.selectionHint}>
            <View style={styles.selectionHintIcon}>
              <SymbolView
                name={{
                  ios: addMode === 'MANUAL'
                    ? 'square.and.pencil'
                    : 'magnifyingglass',
                  android: addMode === 'MANUAL'
                    ? 'edit'
                    : 'search',
                  web: addMode === 'MANUAL'
                    ? 'edit'
                    : 'search',
                }}
                size={18}
                tintColor={colors.primary}
              />
            </View>

            <Text style={styles.selectionHintText}>
              {addMode === 'MANUAL'
                ? 'Añadir manualmente'
                : 'Buscar restaurante'}
            </Text>
          </View>
        ) : (
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
        )}

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
                size={30}
                tintColor={colors.primary}
              />
            </View>

            <Text style={styles.emptyTitle}>
              Crea tu primer grupo
            </Text>

            <Text style={styles.emptyText}>
              Necesitas un grupo para guardar y organizar restaurantes con otras personas.
            </Text>

            <Pressable
              accessibilityRole="button"
              onPress={openCreateGroup}
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
            {groups.map(group => (
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
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 34,
  },

  selectionNavigation: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  backButton: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 19,
  },

  backButtonPressed: {
    backgroundColor: '#F4E9E3',
  },

  selectionNavigationTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '900',
  },

  navigationSpacer: {
    width: 38,
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
    fontSize: 27,
    fontWeight: '900',
    letterSpacing: -0.45,
  },

  subtitle: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 19,
  },

  createButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
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

  selectionHint: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: '#FBE9E2',
  },

  selectionHintIcon: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: colors.surface,
  },

  selectionHintText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '900',
  },

  summary: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 7,
  },

  summaryValue: {
    color: colors.primary,
    fontSize: 25,
    fontWeight: '900',
  },

  summaryLabel: {
    color: colors.muted,
    fontSize: 13,
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
    padding: 28,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 24,
    backgroundColor: colors.surface,
  },

  emptyIcon: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    backgroundColor: '#FBE9E2',
  },

  emptyTitle: {
    color: colors.text,
    fontSize: 19,
    fontWeight: '900',
  },

  emptyText: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
  },

  emptyButton: {
    minHeight: 48,
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    borderRadius: 24,
    backgroundColor: colors.primary,
  },

  emptyButtonPressed: {
    backgroundColor: colors.primaryPressed,
  },

  emptyButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '800',
  },

  errorCard: {
    gap: 10,
    padding: 20,
    borderWidth: 1,
    borderColor: '#F3C5BC',
    borderRadius: 20,
    backgroundColor: '#FFF1EE',
  },

  errorTitle: {
    color: colors.danger,
    fontSize: 16,
    fontWeight: '900',
  },

  errorText: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 19,
  },

  retryText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '900',
  },
});
