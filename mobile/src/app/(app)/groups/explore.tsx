import { SymbolView } from 'expo-symbols';
import {
  router,
  useFocusEffect,
} from 'expo-router';
import type { Href } from 'expo-router';
import {
  useCallback,
  useMemo,
  useState,
} from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PublicGroupCard } from '../../../components/PublicGroupCard';
import { useAuth } from '../../../contexts/auth-context';
import { getErrorMessage } from '../../../lib/api';
import { getPublicGroups } from '../../../services/group-service';
import { colors } from '../../../theme/colors';
import type { PublicGroupSummary } from '../../../types/group';
import { fonts } from '../../../theme/fonts';
import { radii, shadows } from '../../../theme/layout';

export default function ExploreGroupsScreen() {
  const { accessToken } = useAuth();
  const [groups, setGroups] =
    useState<PublicGroupSummary[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] =
    useState<string | null>(null);

  const load = useCallback(
    async (isRefresh = false) => {
      if (!accessToken) {
        setLoading(false);
        return;
      }

      try {
        setError(null);

        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setGroups(
          await getPublicGroups(accessToken),
        );
      } catch (requestError) {
        setError(getErrorMessage(requestError));
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [accessToken],
  );

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const visibleGroups = useMemo(() => {
    const value = query
      .trim()
      .toLocaleLowerCase('es');

    if (!value) {
      return groups;
    }

    return groups.filter(group =>
      [
        group.name,
        group.description,
        group.city,
        group.owner.username,
      ]
        .filter(Boolean)
        .some(item =>
          item
            ?.toLocaleLowerCase('es')
            .includes(value),
        ),
    );
  }, [groups, query]);

  function openPublicGroup(groupId: string): void {
    router.push(
      `/groups/public/${groupId}` as Href,
    );
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
              void load(true);
            }}
            refreshing={refreshing}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.title}>
              Descubre grupos
            </Text>
            <Text style={styles.subtitle}>
              Encuentra listas públicas que encajen con tus próximos planes.
            </Text>
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={() => {
              router.push('/groups/create');
            }}
            style={styles.createButton}
          >
            <SymbolView
              name={{
                ios: 'plus',
                android: 'add',
                web: 'add',
              }}
              size={22}
              tintColor={colors.white}
            />
            <Text style={styles.createButtonText}>Nuevo</Text>
          </Pressable>
        </View>

        <View style={styles.tabs}>
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              router.replace('/groups');
            }}
            style={styles.tab}
          >
            <Text style={styles.tabText}>
              Mis grupos
            </Text>
          </Pressable>

          <View
            style={[
              styles.tab,
              styles.tabActive,
            ]}
          >
            <Text style={styles.tabTextActive}>
              Explorar
            </Text>
          </View>
        </View>

        <View style={styles.searchBar}>
          <SymbolView
            name={{
              ios: 'magnifyingglass',
              android: 'search',
              web: 'search',
            }}
            size={18}
            tintColor={colors.muted}
          />

          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            onChangeText={setQuery}
            placeholder="Buscar grupos, cocinas o zonas..."
            placeholderTextColor={colors.muted}
            style={styles.searchInput}
            value={query}
          />

          {query ? (
            <Pressable accessibilityLabel="Limpiar búsqueda" onPress={() => setQuery('')}>
              <SymbolView
                name={{ ios: 'xmark.circle.fill', android: 'cancel', web: 'cancel' }}
                size={18}
                tintColor={colors.muted}
              />
            </Pressable>
          ) : null}
        </View>

        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator
              color={colors.primary}
              size="large"
            />
          </View>
        ) : null}

        {!loading && error ? (
          <View style={styles.messageCard}>
            <Text style={styles.messageTitle}>
              No hemos podido cargar Explorar
            </Text>
            <Text style={styles.messageText}>
              {error}
            </Text>
            <Pressable
              onPress={() => {
                void load();
              }}
            >
              <Text style={styles.retryText}>
                Volver a intentar
              </Text>
            </Pressable>
          </View>
        ) : null}

        {!loading
        && !error
        && visibleGroups.length === 0 ? (
          <View style={styles.messageCard}>
            <Text style={styles.messageTitle}>
              {query.trim()
                ? 'No encontramos coincidencias'
                : 'Todavía no hay grupos públicos'}
            </Text>
            <Text style={styles.messageText}>
              {query.trim()
                ? 'Prueba con otro nombre, creador o ciudad.'
                : 'Los grupos públicos de la zona aparecerán aquí.'}
            </Text>
          </View>
        ) : null}

        {!loading
        && !error
        && visibleGroups.length > 0 ? (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                Grupos públicos
              </Text>
              <Text style={styles.count}>
                {visibleGroups.length}
              </Text>
            </View>

            <View style={styles.list}>
              {visibleGroups.map(group => (
                <PublicGroupCard
                  group={group}
                  key={group.id}
                  onPress={() => {
                    openPublicGroup(group.id);
                  }}
                />
              ))}
            </View>
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
    paddingBottom: 118,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  headerText: {
    flex: 1,
    gap: 5,
  },
  title: {
    color: colors.text,
    fontSize: 31,
    lineHeight: 37,
    fontFamily: fonts.bold,
    letterSpacing: -0.8,
  },
  subtitle: {
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 18,
  },
  createButton: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingHorizontal: 13,
    borderRadius: 16,
    backgroundColor: colors.primary,
    ...shadows.card,
  },
  createButtonText: {
    color: colors.white,
    fontFamily: fonts.semiBold,
    fontSize: 11,
  },
  tabs: {
    minHeight: 48,
    flexDirection: 'row',
    padding: 4,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    backgroundColor: colors.surfaceMuted,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.md,
  },
  tabActive: {
    backgroundColor: colors.surfaceElevated,
    ...shadows.card,
  },
  tabText: {
    color: colors.muted,
    fontSize: 12,
    fontFamily: fonts.medium,
  },
  tabTextActive: {
    color: colors.primary,
    fontSize: 12,
    fontFamily: fonts.semiBold,
  },
  searchBar: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
    ...shadows.card,
  },
  searchInput: {
    flex: 1,
    color: colors.text,
    fontFamily: fonts.regular,
    fontSize: 13,
  },
  centered: {
    alignItems: 'center',
    paddingVertical: 70,
  },
  section: {
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontFamily: fonts.bold,
    letterSpacing: -0.25,
  },
  count: {
    color: colors.primary,
    fontSize: 12,
    fontFamily: fonts.bold,
  },
  list: {
    gap: 11,
  },
  messageCard: {
    gap: 8,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
    ...shadows.card,
  },
  messageTitle: {
    color: colors.text,
    fontSize: 16,
    fontFamily: fonts.bold,
  },
  messageText: {
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 18,
  },
  retryText: {
    color: colors.primary,
    fontSize: 12,
    fontFamily: fonts.bold,
  },
});
