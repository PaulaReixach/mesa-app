import { LinearGradient } from 'expo-linear-gradient';
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
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
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
type GroupFilter = 'ALL' | 'PRIVATE' | 'PUBLIC';

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
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<GroupFilter>('ALL');
  const [filtersExpanded, setFiltersExpanded] = useState(false);

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

  const baseDisplayedGroups = selectingGroup
    ? selectableGroups
    : regularGroups;
  const privacyFilteredGroups = baseDisplayedGroups.filter(group =>
    selectingGroup || filter === 'ALL' || group.privacy === filter,
  );
  const normalizedQuery = query.trim().toLocaleLowerCase('es');
  const matchesQuery = useCallback((value: {
    city: string | null;
    description: string | null;
    name: string;
  }) => {
    if (!normalizedQuery) {
      return true;
    }

    return [value.name, value.description, value.city]
      .filter(Boolean)
      .some(field => field?.toLocaleLowerCase('es').includes(normalizedQuery));
  }, [normalizedQuery]);
  const displayedGroups = privacyFilteredGroups.filter(matchesQuery);
  const visibleCollaboratingGroups = filter === 'PRIVATE'
    ? []
    : collaboratingGroups.filter(matchesQuery);
  const visibleFollowedGroups = filter === 'PRIVATE'
    ? []
    : followedGroups.filter(matchesQuery);
  const hasAnyGroup =
    regularGroups.length > 0
    || collaboratingGroups.length > 0
    || followedGroups.length > 0;
  const hasSearchResults = displayedGroups.length > 0
    || visibleCollaboratingGroups.length > 0
    || visibleFollowedGroups.length > 0;

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

        <View
          style={[
            styles.hero,
            selectingGroup ? styles.selectionHero : null,
          ]}
        >
          <View style={styles.header}>
            <View style={styles.headerText}>
              <Text style={styles.title}>
                {selectingGroup ? '¿Dónde lo guardamos?' : 'Mis grupos'}
              </Text>
              <Text style={styles.subtitle}>
                {selectingGroup
                  ? addMode === 'MANUAL'
                    ? 'Selecciona el grupo donde quieres crear el restaurante.'
                    : 'Selecciona el grupo donde quieres añadir el restaurante.'
                  : 'Tus listas, tu gente y los sitios que queréis probar.'}
              </Text>
            </View>

            <Pressable
              accessibilityRole="button"
              onPress={() => router.push('/groups/create')}
              style={({ pressed }) => [
                styles.createButton,
                selectingGroup ? styles.createButtonCompact : null,
                !selectingGroup ? styles.createButtonLowered : null,
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
                    name={{ ios: 'plus', android: 'add', web: 'add' }}
                    size={18}
                    tintColor={colors.white}
                  />
                </View>
                {!selectingGroup ? (
                  <Text style={styles.createButtonText}>Nuevo grupo</Text>
                ) : null}
              </LinearGradient>
            </Pressable>
          </View>

          {!selectingGroup ? (
            <Image
              resizeMode="contain"
              source={require('../../../../assets/images/groups-header-illustration.png')}
              style={styles.heroIllustration}
            />
          ) : null}
        </View>

        {!selectingGroup ? (
          <View style={styles.tabs}>
            <View style={styles.tab}>
              <Text style={styles.tabTextActive}>
                Mis grupos
              </Text>
              <View style={styles.tabIndicator} />
            </View>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push('/groups/explore')}
              style={({ pressed }) => [
                styles.tab,
                pressed ? styles.tabPressed : null,
              ]}
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

        {!selectingGroup && hasAnyGroup ? (
          <View style={styles.searchBlock}>
            <View style={styles.searchBar}>
              <SymbolView
                name={{ ios: 'magnifyingglass', android: 'search', web: 'search' }}
                size={23}
                tintColor={colors.muted}
              />
              <TextInput
                autoCapitalize="none"
                autoCorrect={false}
                onChangeText={setQuery}
                placeholder="Buscar por nombre o ciudad"
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
              <View style={styles.searchDivider} />
              <Pressable
                accessibilityLabel="Filtrar grupos"
                accessibilityRole="button"
                accessibilityState={{ expanded: filtersExpanded }}
                onPress={() => setFiltersExpanded(value => !value)}
                style={({ pressed }) => [
                  styles.filterButton,
                  filter !== 'ALL' ? styles.filterButtonActive : null,
                  pressed ? styles.filterButtonPressed : null,
                ]}
              >
                <SymbolView
                  name={{
                    ios: 'slider.horizontal.3',
                    android: 'tune',
                    web: 'tune',
                  }}
                  size={22}
                  tintColor={filter === 'ALL' ? colors.muted : colors.primary}
                />
              </Pressable>
            </View>

            {filtersExpanded ? (
              <View style={styles.filterOptions}>
                {([
                  ['ALL', 'Todos'],
                  ['PRIVATE', 'Privados'],
                  ['PUBLIC', 'Públicos'],
                ] as const).map(([value, label]) => (
                  <Pressable
                    accessibilityRole="button"
                    key={value}
                    onPress={() => setFilter(value)}
                    style={[
                      styles.filterOption,
                      filter === value ? styles.filterOptionActive : null,
                    ]}
                  >
                    <Text
                      style={[
                        styles.filterOptionText,
                        filter === value ? styles.filterOptionTextActive : null,
                      ]}
                    >
                      {label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            ) : null}
          </View>
        ) : null}

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

        {!loading
        && !error
        && !selectingGroup
        && hasAnyGroup
        && query.trim()
        && !hasSearchResults ? (
          <View style={styles.messageCard}>
            <Text style={styles.messageTitle}>No encontramos ese grupo</Text>
            <Text style={styles.messageText}>
              Prueba con otro nombre o con la ciudad donde lo creaste.
            </Text>
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
                  {displayedGroups.length}{' '}
                  {displayedGroups.length === 1 ? 'grupo' : 'grupos'}
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
        && visibleCollaboratingGroups.length > 0 ? (
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
                {visibleCollaboratingGroups.length}{' '}
                {visibleCollaboratingGroups.length === 1 ? 'grupo' : 'grupos'}
              </Text>
            </View>

            <Text style={styles.sectionDescription}>
              Grupos públicos donde la persona creadora te ha aceptado como colaboradora.
            </Text>

            <View style={styles.list}>
              {visibleCollaboratingGroups.map(group => (
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
        && visibleFollowedGroups.length > 0 ? (
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
                {visibleFollowedGroups.length}{' '}
                {visibleFollowedGroups.length === 1 ? 'grupo' : 'grupos'}
              </Text>
            </View>

            <Text style={styles.sectionDescription}>
              Listas públicas que has guardado para volver a consultarlas.
            </Text>

            <View style={styles.list}>
              {visibleFollowedGroups.map(group => (
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
    paddingTop: 28,
    paddingBottom: 128,
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
  hero: {
    position: 'relative',
    minHeight: 142,
  },
  selectionHero: {
    minHeight: 0,
  },
  header: {
    zIndex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  headerText: {
    flex: 1,
    maxWidth: 224,
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
    width: 128,
    height: 44,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 255, 255, 0.24)',
    borderRadius: 12,
  },
  createButtonCompact: {
    width: 44,
  },
  createButtonLowered: {
    marginTop: 10,
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
    gap: 7,
    paddingHorizontal: 8,
  },
  createButtonIcon: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
  },
  createButtonText: {
    color: colors.white,
    fontFamily: fonts.semiBold,
    fontSize: 12,
  },
  heroIllustration: {
    position: 'absolute',
    right: -25,
    bottom: -28,
    width: 164,
    height: 115,
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
  searchBlock: {
    gap: 10,
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
    width: 28,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchDivider: {
    width: StyleSheet.hairlineWidth,
    height: 28,
    backgroundColor: colors.borderStrong,
  },
  filterButton: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  filterButtonActive: {
    backgroundColor: colors.primarySoft,
  },
  filterButtonPressed: {
    opacity: 0.58,
  },
  filterOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  filterOption: {
    minHeight: 34,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 17,
    backgroundColor: colors.surface,
  },
  filterOptionActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  filterOptionText: {
    color: colors.muted,
    fontFamily: fonts.medium,
    fontSize: 10,
  },
  filterOptionTextActive: {
    color: colors.primaryPressed,
    fontFamily: fonts.semiBold,
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
    fontSize: 19,
    fontFamily: fonts.bold,
    letterSpacing: -0.35,
  },
  sectionCount: {
    color: colors.muted,
    fontSize: 12,
    fontFamily: fonts.regular,
  },
  sectionDescription: {
    color: colors.muted,
    fontFamily: fonts.regular,
    maxWidth: 320,
    fontSize: 10,
    lineHeight: 15,
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
    gap: 10,
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
