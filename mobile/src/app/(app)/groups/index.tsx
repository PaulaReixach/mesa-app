import { SymbolView } from 'expo-symbols';
import {
  router,
  useFocusEffect,
  useLocalSearchParams,
} from 'expo-router';
import { useCallback, useState } from 'react';
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
  const { addMode: addModeParam } = useLocalSearchParams<{
    addMode?: string;
  }>();
  const { accessToken } = useAuth();

  const [groups, setGroups] = useState<RestaurantGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addMode: AddMode | null =
    addModeParam === 'SEARCH' || addModeParam === 'MANUAL'
      ? addModeParam
      : null;
  const selectingGroup = addMode !== null;

  const load = useCallback(async (isRefresh = false) => {
    if (!accessToken) {
      setLoading(false);
      return;
    }

    try {
      setError(null);
      isRefresh ? setRefreshing(true) : setLoading(true);
      setGroups(await getGroups(accessToken));
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [accessToken]);

  useFocusEffect(useCallback(() => {
    void load();
  }, [load]));

  function openGroup(groupId: string): void {
    if (addMode) {
      router.push({
        pathname: '/groups/[groupId]/restaurants/create',
        params: { groupId, mode: addMode },
      });
      return;
    }

    router.push({
      pathname: '/groups/[groupId]',
      params: { groupId },
    });
  }

  return (
    <SafeAreaView edges={['top', 'right', 'left']} style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => void load(true)}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {selectingGroup ? (
          <View style={styles.selectionHeader}>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.back()}
              style={styles.iconButton}
            >
              <SymbolView
                name={{ ios: 'chevron.left', android: 'arrow_back', web: 'arrow_back' }}
                size={20}
                tintColor={colors.text}
              />
            </Pressable>
            <Text style={styles.selectionTitle}>Elegir grupo</Text>
            <View style={styles.iconButton} />
          </View>
        ) : null}

        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.title}>
              {selectingGroup ? '¿Dónde lo guardamos?' : 'Grupos'}
            </Text>
            <Text style={styles.subtitle}>
              {selectingGroup
                ? addMode === 'MANUAL'
                  ? 'Selecciona el grupo donde quieres crear el restaurante.'
                  : 'Selecciona el grupo donde quieres añadir el restaurante.'
                : 'Guarda, comparte y descubre restaurantes.'}
            </Text>
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/groups/create')}
            style={styles.createButton}
          >
            <SymbolView
              name={{ ios: 'plus', android: 'add', web: 'add' }}
              size={23}
              tintColor={colors.white}
            />
          </Pressable>
        </View>

        {!selectingGroup ? (
          <View style={styles.tabs}>
            <View style={[styles.tab, styles.tabActive]}>
              <Text style={styles.tabTextActive}>Mis grupos</Text>
            </View>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push('/groups/explore')}
              style={styles.tab}
            >
              <Text style={styles.tabText}>Explorar</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.modeBadge}>
            <SymbolView
              name={{
                ios: addMode === 'MANUAL' ? 'square.and.pencil' : 'magnifyingglass',
                android: addMode === 'MANUAL' ? 'edit' : 'search',
                web: addMode === 'MANUAL' ? 'edit' : 'search',
              }}
              size={16}
              tintColor={colors.primary}
            />
            <Text style={styles.modeText}>
              {addMode === 'MANUAL' ? 'Añadir manualmente' : 'Buscar restaurante'}
            </Text>
          </View>
        )}

        {!selectingGroup ? (
          <View style={styles.summary}>
            <Text style={styles.summaryValue}>{groups.length}</Text>
            <Text style={styles.summaryLabel}>
              {groups.length === 1 ? 'grupo activo' : 'grupos activos'}
            </Text>
          </View>
        ) : null}

        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator color={colors.primary} size="large" />
          </View>
        ) : null}

        {!loading && error ? (
          <View style={styles.messageCard}>
            <Text style={styles.messageTitle}>No hemos podido cargar tus grupos</Text>
            <Text style={styles.messageText}>{error}</Text>
            <Pressable onPress={() => void load()}>
              <Text style={styles.retryText}>Volver a intentar</Text>
            </Pressable>
          </View>
        ) : null}

        {!loading && !error && groups.length === 0 ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
              <SymbolView
                name={{ ios: 'person.2.fill', android: 'group', web: 'group' }}
                size={30}
                tintColor={colors.primary}
              />
            </View>
            <Text style={styles.emptyTitle}>Crea tu primer grupo</Text>
            <Text style={styles.emptyText}>
              Organiza restaurantes con tus amigos o crea una lista pública para compartirla.
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push('/groups/create')}
              style={styles.primaryButton}
            >
              <Text style={styles.primaryButtonText}>Crear grupo</Text>
            </Pressable>
          </View>
        ) : null}

        {!loading && !error && groups.length > 0 ? (
          <View style={styles.list}>
            {groups.map(group => (
              <GroupCard
                key={group.id}
                group={group}
                onPress={() => openGroup(group.id)}
              />
            ))}
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  content: {
    flexGrow: 1,
    gap: 20,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 34,
  },
  selectionHeader: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconButton: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 19,
  },
  selectionTitle: { color: colors.text, fontSize: 15, fontWeight: '900' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  headerText: { flex: 1, gap: 5 },
  title: { color: colors.text, fontSize: 27, fontWeight: '900' },
  subtitle: { color: colors.muted, fontSize: 13, lineHeight: 19 },
  createButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    backgroundColor: colors.primary,
  },
  tabs: {
    minHeight: 42,
    flexDirection: 'row',
    padding: 4,
    borderRadius: 16,
    backgroundColor: '#F1E9E4',
  },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 13 },
  tabActive: { backgroundColor: colors.primary },
  tabText: { color: colors.muted, fontSize: 12, fontWeight: '800' },
  tabTextActive: { color: colors.white, fontSize: 12, fontWeight: '900' },
  modeBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: '#FBE9E2',
  },
  modeText: { color: colors.primary, fontSize: 11, fontWeight: '900' },
  summary: { flexDirection: 'row', alignItems: 'baseline', gap: 7 },
  summaryValue: { color: colors.primary, fontSize: 25, fontWeight: '900' },
  summaryLabel: { color: colors.muted, fontSize: 13 },
  centered: { alignItems: 'center', paddingVertical: 80 },
  list: { gap: 13 },
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
  emptyTitle: { color: colors.text, fontSize: 19, fontWeight: '900' },
  emptyText: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
  },
  primaryButton: {
    minHeight: 48,
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
    backgroundColor: colors.primary,
  },
  primaryButtonText: { color: colors.white, fontSize: 14, fontWeight: '800' },
  messageCard: {
    gap: 8,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    backgroundColor: colors.surface,
  },
  messageTitle: { color: colors.text, fontSize: 16, fontWeight: '900' },
  messageText: { color: colors.muted, fontSize: 12, lineHeight: 18 },
  retryText: { color: colors.primary, fontSize: 12, fontWeight: '900' },
});
