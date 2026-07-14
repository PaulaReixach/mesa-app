import { SymbolView } from 'expo-symbols';
import {
  router,
  useFocusEffect,
  useLocalSearchParams,
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
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GroupCard } from '../../../components/GroupCard';
import { PublicGroupCard } from '../../../components/PublicGroupCard';
import { useAuth } from '../../../contexts/auth-context';
import { getErrorMessage } from '../../../lib/api';
import {
  getFollowedPublicGroups,
  getGroups,
} from '../../../services/group-service';
import { colors } from '../../../theme/colors';
import type {
  PublicGroupSummary,
  RestaurantGroup,
} from '../../../types/group';
import { fonts } from '../../../theme/fonts';
import { radii, shadows } from '../../../theme/layout';

type AddMode = 'SEARCH' | 'MANUAL';

export default function GroupsScreen() {
  const { addMode: addModeParam } =
    useLocalSearchParams<{ addMode?: string }>();
  const { accessToken, user } = useAuth();

  const [groups, setGroups] =
    useState<RestaurantGroup[]>([]);
  const [followedGroups, setFollowedGroups] =
    useState<PublicGroupSummary[]>([]);
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

      if (selectingGroup) {
        setGroups(await getGroups(accessToken));
        setFollowedGroups([]);
      } else {
        const [memberGroups, following] = await Promise.all([
          getGroups(accessToken),
          getFollowedPublicGroups(accessToken),
        ]);

        setGroups(memberGroups);
        setFollowedGroups(following);
      }
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [accessToken, selectingGroup]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const collaboratingGroups = useMemo(
    () => groups.filter(group =>
      group.privacy === 'PUBLIC'
      && group.ownerUserId !== user?.id,
    ),
    [groups, user?.id],
  );

  const regularGroups = useMemo(
    () => groups.filter(group =>
      group.privacy === 'PRIVATE'
      || group.ownerUserId === user?.id,
    ),
    [groups, user?.id],
  );

  const selectableGroups = useMemo(
    () => groups.filter(group =>
      group.privacy === 'PRIVATE'
      || group.ownerUserId === user?.id,
    ),
    [groups, user?.id],
  );

  function openGroup(group: RestaurantGroup): void {
    if (addMode) {
      router.push({
        pathname: '/groups/[groupId]/restaurants/create',
        params: {
          groupId: group.id,
          mode: addMode,
        },
      });
      return;
    }

    if (
      group.privacy === 'PUBLIC'
      && group.ownerUserId !== user?.id
    ) {
      router.push(
        `/groups/public/${group.id}` as Href,
      );
      return;
    }

    router.push({
      pathname: '/groups/[groupId]',
      params: { groupId: group.id },
    });
  }

  function openPublicGroup(groupId: string): void {
    router.push(`/groups/public/${groupId}` as Href);
  }

  const displayedGroups = selectingGroup
    ? selectableGroups
    : regularGroups;
  const hasAnyGroup =
    regularGroups.length > 0
    || collaboratingGroups.length > 0
    || followedGroups.length > 0;

  return (
    <SafeAreaView
      edges={['top', 'right', 'left']}
      style={styles.safeArea}
    >
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
                name={{
                  ios: 'chevron.left',
                  android: 'arrow_back',
                  web: 'arrow_back',
                }}
                size={20}
                tintColor={colors.text}
              />
            </Pressable>
            <Text style={styles.selectionTitle}>
              Elegir grupo
            </Text>
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
              <Text style={styles.tabTextActive}>
                Mis grupos
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push('/groups/explore')}
              style={styles.tab}
            >
              <Text style={styles.tabText}>
                Explorar
              </Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.modeBadge}>
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
              size={16}
              tintColor={colors.primary}
            />
            <Text style={styles.modeText}>
              {addMode === 'MANUAL'
                ? 'Añadir manualmente'
                : 'Buscar restaurante'}
            </Text>
          </View>
        )}

        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator color={colors.primary} size="large" />
          </View>
        ) : null}

        {!loading && error ? (
          <View style={styles.messageCard}>
            <Text style={styles.messageTitle}>
              No hemos podido cargar tus grupos
            </Text>
            <Text style={styles.messageText}>{error}</Text>
            <Pressable onPress={() => void load()}>
              <Text style={styles.retryText}>
                Volver a intentar
              </Text>
            </Pressable>
          </View>
        ) : null}

        {!loading
        && !error
        && selectingGroup
        && displayedGroups.length === 0 ? (
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
              Necesitas un grupo propio
            </Text>
            <Text style={styles.emptyText}>
              Los grupos que sigues o donde colaboras no permiten añadir restaurantes directamente.
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push('/groups/create')}
              style={styles.primaryButton}
            >
              <Text style={styles.primaryButtonText}>
                Crear grupo
              </Text>
            </Pressable>
          </View>
        ) : null}

        {!loading
        && !error
        && !selectingGroup
        && !hasAnyGroup ? (
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
              Empieza tu colección de grupos
            </Text>
            <Text style={styles.emptyText}>
              Crea un grupo con tus amigos o sigue listas públicas que te inspiren.
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push('/groups/create')}
              style={styles.primaryButton}
            >
              <Text style={styles.primaryButtonText}>
                Crear grupo
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push('/groups/explore')}
              style={styles.secondaryButton}
            >
              <Text style={styles.secondaryButtonText}>
                Explorar grupos públicos
              </Text>
            </Pressable>
          </View>
        ) : null}

        {!loading && !error && displayedGroups.length > 0 ? (
          <View style={styles.section}>
            {!selectingGroup ? (
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                  Tus grupos
                </Text>
                <Text style={styles.sectionCount}>
                  {displayedGroups.length}
                </Text>
              </View>
            ) : null}

            <View style={styles.list}>
              {displayedGroups.map(group => (
                <GroupCard
                  key={group.id}
                  group={group}
                  onPress={() => openGroup(group)}
                />
              ))}
            </View>
          </View>
        ) : null}

        {!loading
        && !error
        && !selectingGroup
        && collaboratingGroups.length > 0 ? (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <Text style={styles.sectionTitle}>
                  Colaboras en
                </Text>
                <View style={styles.collaborationBadge}>
                  <Text style={styles.collaborationBadgeText}>
                    Públicos
                  </Text>
                </View>
              </View>
              <Text style={styles.sectionCount}>
                {collaboratingGroups.length}
              </Text>
            </View>

            <Text style={styles.sectionDescription}>
              Grupos públicos donde la persona creadora te ha aceptado como colaboradora.
            </Text>

            <View style={styles.list}>
              {collaboratingGroups.map(group => (
                <GroupCard
                  key={group.id}
                  group={group}
                  onPress={() => openGroup(group)}
                />
              ))}
            </View>
          </View>
        ) : null}

        {!loading
        && !error
        && !selectingGroup
        && followedGroups.length > 0 ? (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <Text style={styles.sectionTitle}>
                  Siguiendo
                </Text>
                <View style={styles.followingBadge}>
                  <Text style={styles.followingBadgeText}>
                    Públicos
                  </Text>
                </View>
              </View>
              <Text style={styles.sectionCount}>
                {followedGroups.length}
              </Text>
            </View>

            <Text style={styles.sectionDescription}>
              Listas públicas que has guardado para volver a consultarlas.
            </Text>

            <View style={styles.list}>
              {followedGroups.map(group => (
                <PublicGroupCard
                  key={group.id}
                  group={group}
                  onPress={() => openPublicGroup(group.id)}
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
  selectionTitle: {
    color: colors.text,
    fontSize: 15,
    fontFamily: fonts.bold,
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
    fontFamily: fonts.bold,
  },
  subtitle: {
    color: colors.muted,
    fontFamily: fonts.regular,
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
    ...shadows.card,
  },
  tabs: {
    minHeight: 42,
    flexDirection: 'row',
    padding: 4,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceMuted,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.sm,
  },
  tabActive: {
    backgroundColor: colors.primary,
  },
  tabText: {
    color: colors.muted,
    fontSize: 12,
    fontFamily: fonts.bold,
  },
  tabTextActive: {
    color: colors.white,
    fontSize: 12,
    fontFamily: fonts.bold,
  },
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
  modeText: {
    color: colors.primary,
    fontSize: 11,
    fontFamily: fonts.bold,
  },
  centered: {
    alignItems: 'center',
    paddingVertical: 80,
  },
  section: {
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 17,
    fontFamily: fonts.bold,
  },
  sectionCount: {
    color: colors.primary,
    fontSize: 12,
    fontFamily: fonts.bold,
  },
  sectionDescription: {
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 11,
    lineHeight: 16,
  },
  followingBadge: {
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#E8EEDD',
  },
  followingBadgeText: {
    color: '#607349',
    fontSize: 8,
    fontFamily: fonts.bold,
  },
  collaborationBadge: {
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#FBE9E2',
  },
  collaborationBadgeText: {
    color: colors.primary,
    fontSize: 8,
    fontFamily: fonts.bold,
  },
  list: {
    gap: 13,
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
    backgroundColor: '#FBE9E2',
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
  primaryButton: {
    minHeight: 48,
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
    backgroundColor: colors.primary,
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: 14,
    fontFamily: fonts.bold,
  },
  secondaryButton: {
    minHeight: 46,
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 23,
    backgroundColor: colors.inputBackground,
  },
  secondaryButtonText: {
    color: colors.primary,
    fontSize: 13,
    fontFamily: fonts.bold,
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
