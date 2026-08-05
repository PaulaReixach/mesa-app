import { LinearGradient } from 'expo-linear-gradient';
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
              Grupos
            </Text>
            <Text style={styles.subtitle}>
              Tus listas, tu gente y los sitios que queréis probar.
            </Text>
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={() => {
              router.push('/groups/create');
            }}
            style={({ pressed }) => [
              styles.createButton,
              pressed ? styles.createButtonPressed : null,
            ]}
          >
            <LinearGradient
              colors={['#B93825', '#D65339', '#C8442D']}
              end={{ x: 1, y: 1 }}
              start={{ x: 0, y: 0 }}
              style={styles.createButtonFill}
            >
              <View style={styles.createButtonIcon}>
                <SymbolView
                  name={{
                    ios: 'plus',
                    android: 'add',
                    web: 'add',
                  }}
                  size={18}
                  tintColor={colors.white}
                />
              </View>
              <Text style={styles.createButtonText}>
                Nuevo grupo
              </Text>
            </LinearGradient>
          </Pressable>
        </View>

        <View style={styles.tabs}>
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              router.replace('/groups');
            }}
            style={({ pressed }) => [
              styles.tab,
              pressed ? styles.tabPressed : null,
            ]}
          >
            <Text style={styles.tabText}>
              Mis grupos
            </Text>
          </Pressable>

          <View style={styles.tab}>
            <Text style={styles.tabTextActive}>
              Explorar
            </Text>
            <View style={styles.tabIndicator} />
          </View>
        </View>

        <View style={styles.searchBar}>
          <SymbolView
            name={{
              ios: 'magnifyingglass',
              android: 'search',
              web: 'search',
            }}
            size={23}
            tintColor={colors.muted}
          />

          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            onChangeText={setQuery}
            placeholder="Buscar por nombre, ciudad o creador"
            placeholderTextColor={colors.muted}
            style={styles.searchInput}
            value={query}
          />

          {query ? (
            <Pressable
              accessibilityLabel="Limpiar búsqueda"
              onPress={() => setQuery('')}
              style={styles.clearSearchButton}
            >
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
              No hemos podido cargar los grupos públicos
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
        && query.trim()
        && visibleGroups.length === 0 ? (
          <View style={styles.messageCard}>
            <Text style={styles.messageTitle}>
              No encontramos coincidencias
            </Text>
            <Text style={styles.messageText}>
              Prueba con otro nombre, creador o ciudad.
            </Text>
          </View>
        ) : null}

        {!loading
        && !error
        && !query.trim()
        && visibleGroups.length === 0 ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
              <SymbolView
                name={{
                  ios: 'globe.europe.africa',
                  android: 'public',
                  web: 'public',
                }}
                size={28}
                tintColor={colors.primary}
              />
            </View>
            <Text style={styles.emptyTitle}>
              Todavía no hay grupos públicos
            </Text>
            <Text style={styles.emptyText}>
              Cuando haya listas públicas disponibles, aparecerán aquí para que puedas descubrirlas.
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
                {visibleGroups.length}{' '}
                {visibleGroups.length === 1 ? 'grupo' : 'grupos'}
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
    gap: 20,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 128,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  headerText: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    color: colors.text,
    fontSize: 32,
    lineHeight: 39,
    fontFamily: fonts.bold,
    letterSpacing: -1,
  },
  subtitle: {
    marginTop: 9,
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 20,
  },
  createButton: {
    width: 114,
    height: 40,
    marginTop: 10,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 255, 255, 0.24)',
    borderRadius: 10,
  },
  createButtonPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.99 }],
  },
  createButtonFill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 7,
  },
  createButtonIcon: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
  },
  createButtonText: {
    color: colors.white,
    fontFamily: fonts.semiBold,
    fontSize: 11,
  },
  tabs: {
    minHeight: 50,
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderStrong,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabPressed: {
    opacity: 0.55,
  },
  tabIndicator: {
    position: 'absolute',
    bottom: -1,
    width: 58,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#C64A32',
  },
  tabText: {
    color: colors.muted,
    fontSize: 13,
    fontFamily: fonts.medium,
  },
  tabTextActive: {
    color: colors.primary,
    fontSize: 13,
    fontFamily: fonts.semiBold,
  },
  searchBar: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingLeft: 16,
    paddingRight: 8,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: 10,
    backgroundColor: colors.surface,
  },
  searchInput: {
    flex: 1,
    minHeight: 50,
    color: colors.text,
    fontFamily: fonts.regular,
    fontSize: 13,
  },
  clearSearchButton: {
    width: 34,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
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
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 19,
    fontFamily: fonts.bold,
    letterSpacing: -0.35,
  },
  count: {
    color: colors.muted,
    fontSize: 12,
    fontFamily: fonts.regular,
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
  emptyCard: {
    alignItems: 'center',
    gap: 14,
    padding: 28,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.xl,
    backgroundColor: colors.surface,
    ...shadows.card,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    backgroundColor: colors.primarySoft,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 19,
    fontFamily: fonts.bold,
    textAlign: 'center',
  },
  emptyText: {
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
  },
});
