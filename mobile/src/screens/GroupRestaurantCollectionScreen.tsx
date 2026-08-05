import { SymbolView } from 'expo-symbols';
import {
  router,
  useFocusEffect,
  useLocalSearchParams,
} from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GroupRestaurantListCard } from '../components/GroupDetailPrimitivesTuned';
import { useAuth } from '../contexts/auth-context';
import { getErrorMessage } from '../lib/api';
import {
  getGroupRestaurantSectionItems,
  isGroupRestaurantSectionKey,
  matchesGroupRestaurantSearch,
} from '../lib/group-restaurant-list';
import { getGroup } from '../services/group-service';
import { getGroupRestaurants } from '../services/restaurant-service';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import type { RestaurantGroup } from '../types/group';
import type { GroupRestaurant } from '../types/restaurant';

const sectionCopy = {
  pending: {
    title: 'Pendientes',
    subtitle: 'Sitios que todavía tenéis por probar.',
  },
  visited: {
    title: 'Visitados',
    subtitle: 'Restaurantes por los que ya habéis pasado.',
  },
  archived: {
    title: 'Archivados',
    subtitle: 'Sitios que habéis apartado de la lista principal.',
  },
} as const;

export default function GroupRestaurantCollectionScreen() {
  const { groupId, section: sectionParam } = useLocalSearchParams<{
    groupId: string;
    section?: string;
  }>();
  const { accessToken } = useAuth();
  const section = isGroupRestaurantSectionKey(sectionParam)
    ? sectionParam
    : 'pending';
  const copy = sectionCopy[section];

  const [group, setGroup] = useState<RestaurantGroup | null>(null);
  const [restaurants, setRestaurants] = useState<GroupRestaurant[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (isRefresh = false): Promise<void> => {
    if (!accessToken || !groupId) {
      setLoading(false);
      return;
    }

    try {
      setError(null);
      isRefresh ? setRefreshing(true) : setLoading(true);

      const [groupResponse, restaurantResponse] = await Promise.all([
        getGroup(groupId, accessToken),
        getGroupRestaurants(groupId, accessToken),
      ]);

      setGroup(groupResponse);
      setRestaurants(restaurantResponse);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [accessToken, groupId]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const sectionItems = useMemo(
    () => getGroupRestaurantSectionItems(restaurants, section),
    [restaurants, section],
  );
  const visibleItems = useMemo(
    () => sectionItems.filter(item =>
      matchesGroupRestaurantSearch(item, query)
    ),
    [query, sectionItems],
  );

  function openRestaurant(item: GroupRestaurant): void {
    router.push({
      pathname: '/groups/[groupId]/restaurants/[groupRestaurantId]',
      params: {
        groupId,
        groupRestaurantId: item.id,
      },
    });
  }

  const resultLabel = query.trim()
    ? `${visibleItems.length} de ${sectionItems.length}`
    : `${sectionItems.length}`;

  return (
    <SafeAreaView
      edges={['top', 'right', 'bottom', 'left']}
      style={styles.safeArea}
    >
      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : (
        <FlatList
          contentContainerStyle={styles.content}
          data={visibleItems}
          keyExtractor={item => item.id}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={error ? null : (
            <View style={styles.empty}>
              <SymbolView
                name={{
                  ios: 'magnifyingglass',
                  android: 'search',
                  web: 'search',
                }}
                size={22}
                tintColor={colors.primary}
              />
              <Text style={styles.emptyTitle}>
                {query.trim()
                  ? 'No encontramos ese restaurante'
                  : `No hay restaurantes ${copy.title.toLowerCase()}`}
              </Text>
              <Text style={styles.emptyText}>
                {query.trim()
                  ? 'Prueba con otro nombre, dirección o ciudad.'
                  : 'Cuando haya alguno, aparecerá aquí.'}
              </Text>
            </View>
          )}
          ListHeaderComponent={(
            <>
              <View style={styles.header}>
                <Pressable
                  accessibilityLabel="Volver"
                  accessibilityRole="button"
                  hitSlop={8}
                  onPress={() => router.back()}
                  style={({ pressed }) => [
                    styles.backButton,
                    pressed ? styles.pressed : null,
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

                <Text numberOfLines={1} style={styles.groupName}>
                  {group?.name ?? 'Restaurantes'}
                </Text>
                <View style={styles.headerSpacer} />
              </View>

              <View style={styles.heading}>
                <View style={styles.titleRow}>
                  <Text style={styles.title}>{copy.title}</Text>
                  <Text style={styles.count}>{resultLabel}</Text>
                </View>
                <Text style={styles.subtitle}>{copy.subtitle}</Text>
              </View>

              <View style={styles.search}>
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
                  placeholder="Buscar por nombre o sitio"
                  placeholderTextColor={colors.muted}
                  returnKeyType="search"
                  style={styles.searchInput}
                  value={query}
                />
                {query ? (
                  <Pressable
                    accessibilityLabel="Limpiar búsqueda"
                    accessibilityRole="button"
                    hitSlop={8}
                    onPress={() => setQuery('')}
                  >
                    <SymbolView
                      name={{
                        ios: 'xmark.circle.fill',
                        android: 'cancel',
                        web: 'cancel',
                      }}
                      size={18}
                      tintColor={colors.muted}
                    />
                  </Pressable>
                ) : null}
              </View>

              {error ? (
                <View style={styles.errorCard}>
                  <Text style={styles.errorText}>{error}</Text>
                  <Pressable onPress={() => void load()}>
                    <Text style={styles.retry}>Volver a intentar</Text>
                  </Pressable>
                </View>
              ) : null}
            </>
          )}
          refreshControl={(
            <RefreshControl
              onRefresh={() => void load(true)}
              refreshing={refreshing}
              tintColor={colors.primary}
            />
          )}
          renderItem={({ item }) => (
            <GroupRestaurantListCard
              item={item}
              mode="private"
              onPress={() => openRestaurant(item)}
            />
          )}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 32,
  },
  header: {
    minHeight: 48,
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
  groupName: {
    maxWidth: '68%',
    color: colors.text,
    fontSize: 15,
    fontFamily: fonts.bold,
  },
  headerSpacer: {
    width: 38,
  },
  heading: {
    gap: 5,
    marginTop: 18,
    marginBottom: 18,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  title: {
    color: colors.text,
    fontSize: 28,
    lineHeight: 34,
    fontFamily: fonts.bold,
    letterSpacing: -0.7,
  },
  count: {
    color: colors.muted,
    fontSize: 12,
    fontFamily: fonts.semiBold,
  },
  subtitle: {
    color: colors.muted,
    fontSize: 11,
    lineHeight: 17,
    fontFamily: fonts.regular,
  },
  search: {
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    marginBottom: 18,
    paddingHorizontal: 14,
    borderRadius: 15,
    backgroundColor: colors.surfaceMuted,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 0,
    color: colors.text,
    fontSize: 12,
    fontFamily: fonts.regular,
  },
  empty: {
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 28,
    paddingVertical: 54,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 13,
    fontFamily: fonts.bold,
    textAlign: 'center',
  },
  emptyText: {
    color: colors.muted,
    fontSize: 10,
    lineHeight: 15,
    fontFamily: fonts.regular,
    textAlign: 'center',
  },
  errorCard: {
    gap: 6,
    marginBottom: 14,
    padding: 13,
    borderRadius: 14,
    backgroundColor: colors.dangerSoft,
  },
  errorText: {
    color: colors.danger,
    fontSize: 10,
    lineHeight: 15,
    fontFamily: fonts.regular,
  },
  retry: {
    color: colors.primary,
    fontSize: 10,
    fontFamily: fonts.bold,
  },
  pressed: {
    opacity: 0.64,
  },
});
