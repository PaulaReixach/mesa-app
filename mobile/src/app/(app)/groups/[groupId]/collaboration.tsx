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

import { RestaurantCard } from '../../../../components/RestaurantCard';
import { useAuth } from '../../../../contexts/auth-context';
import { getErrorMessage } from '../../../../lib/api';
import {
  getGroup,
  getPublicGroup,
} from '../../../../services/group-service';
import { colors } from '../../../../theme/colors';
import type { RestaurantGroup } from '../../../../types/group';
import type { GroupRestaurant } from '../../../../types/restaurant';

export default function CollaborationWorkspaceScreen() {
  const { groupId } = useLocalSearchParams<{
    groupId: string;
  }>();
  const { accessToken } = useAuth();

  const [group, setGroup] = useState<RestaurantGroup | null>(null);
  const [restaurants, setRestaurants] = useState<GroupRestaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (isRefresh = false) => {
    if (!accessToken || !groupId) {
      setError('No se ha podido recuperar el espacio de colaboración.');
      setLoading(false);
      return;
    }

    try {
      setError(null);
      isRefresh ? setRefreshing(true) : setLoading(true);

      const [groupResponse, publicGroupResponse] = await Promise.all([
        getGroup(groupId, accessToken),
        getPublicGroup(groupId, accessToken),
      ]);

      setGroup(groupResponse);
      setRestaurants(publicGroupResponse.restaurants);
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

  return (
    <SafeAreaView
      edges={['top', 'right', 'bottom', 'left']}
      style={styles.safeArea}
    >
      <View style={styles.header}>
        <Pressable
          accessibilityLabel="Volver"
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

        <Text style={styles.headerTitle}>
          Colaboración
        </Text>

        <View style={styles.iconButton} />
      </View>

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
        {loading ? (
          <View style={styles.loading}>
            <ActivityIndicator
              color={colors.primary}
              size="large"
            />
          </View>
        ) : null}

        {!loading && group ? (
          <>
            <View style={styles.introCard}>
              <View style={styles.introIcon}>
                <SymbolView
                  name={{
                    ios: 'person.2.fill',
                    android: 'groups',
                    web: 'groups',
                  }}
                  size={24}
                  tintColor={colors.primary}
                />
              </View>

              <View style={styles.introText}>
                <Text style={styles.eyebrow}>
                  COLABORAS EN
                </Text>
                <Text style={styles.groupName}>
                  {group.name}
                </Text>
                <Text style={styles.description}>
                  Abre un restaurante para consultar las valoraciones y añadir la tuya.
                </Text>
              </View>
            </View>

            <View style={styles.notice}>
              <SymbolView
                name={{
                  ios: 'info.circle.fill',
                  android: 'info',
                  web: 'info',
                }}
                size={17}
                tintColor="#8C6726"
              />
              <Text style={styles.noticeText}>
                Como colaboradora puedes valorar. Los cambios en la lista pública siguen dependiendo de la persona creadora.
              </Text>
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                  Restaurantes
                </Text>
                <Text style={styles.sectionCount}>
                  {restaurants.length}
                </Text>
              </View>

              {restaurants.length === 0 ? (
                <View style={styles.emptyCard}>
                  <Text style={styles.emptyTitle}>
                    Todavía no hay restaurantes
                  </Text>
                  <Text style={styles.emptyText}>
                    Cuando la persona creadora añada alguno, aparecerá aquí para poder valorarlo.
                  </Text>
                </View>
              ) : (
                <View style={styles.list}>
                  {restaurants.map(item => (
                    <RestaurantCard
                      key={item.id}
                      groupRestaurant={item}
                      presentation="rating"
                    />
                  ))}
                </View>
              )}
            </View>
          </>
        ) : null}

        {!loading && error ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorTitle}>
              No hemos podido abrir la colaboración
            </Text>
            <Text style={styles.errorText}>{error}</Text>
            <Pressable onPress={() => void load()}>
              <Text style={styles.retryText}>
                Volver a intentar
              </Text>
            </Pressable>
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
  header: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
  },
  iconButton: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 19,
  },
  headerTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '900',
  },
  content: {
    flexGrow: 1,
    gap: 20,
    paddingHorizontal: 18,
    paddingBottom: 36,
  },
  loading: {
    alignItems: 'center',
    paddingVertical: 100,
  },
  introCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 22,
    backgroundColor: colors.surface,
  },
  introIcon: {
    width: 54,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: '#FBE9E2',
  },
  introText: {
    flex: 1,
    gap: 4,
  },
  eyebrow: {
    color: colors.primary,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },
  groupName: {
    color: colors.text,
    fontSize: 21,
    fontWeight: '900',
  },
  description: {
    color: colors.muted,
    fontSize: 11,
    lineHeight: 17,
  },
  notice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 9,
    padding: 14,
    borderRadius: 17,
    backgroundColor: '#FFF1D9',
  },
  noticeText: {
    flex: 1,
    color: '#7A5A20',
    fontSize: 11,
    lineHeight: 17,
    fontWeight: '700',
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
    fontSize: 18,
    fontWeight: '900',
  },
  sectionCount: {
    minWidth: 28,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#FBE9E2',
    color: colors.primary,
    fontSize: 10,
    fontWeight: '900',
    textAlign: 'center',
  },
  list: {
    gap: 10,
  },
  emptyCard: {
    gap: 5,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    backgroundColor: colors.surface,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '900',
  },
  emptyText: {
    color: colors.muted,
    fontSize: 11,
    lineHeight: 17,
  },
  errorCard: {
    gap: 7,
    padding: 18,
    borderWidth: 1,
    borderColor: '#F3C5BC',
    borderRadius: 18,
    backgroundColor: '#FFF1EE',
  },
  errorTitle: {
    color: colors.danger,
    fontSize: 15,
    fontWeight: '900',
  },
  errorText: {
    color: colors.muted,
    fontSize: 11,
    lineHeight: 17,
  },
  retryText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '900',
  },
});
