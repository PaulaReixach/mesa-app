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

import { PrimaryButton } from '../../../components/PrimaryButton';
import { RestaurantCard } from '../../../components/RestaurantCard';
import { useAuth } from '../../../contexts/auth-context';
import { getErrorMessage } from '../../../lib/api';
import { getGroup } from '../../../services/group-service';
import { getGroupRestaurants } from '../../../services/restaurant-service';
import { colors } from '../../../theme/colors';
import { RestaurantGroup } from '../../../types/group';
import { GroupRestaurant } from '../../../types/restaurant';

export default function GroupDetailScreen() {
  const { groupId } = useLocalSearchParams<{
    groupId: string;
  }>();

  const { accessToken } = useAuth();

  const [group, setGroup] =
    useState<RestaurantGroup | null>(null);
  const [restaurants, setRestaurants] =
    useState<GroupRestaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] =
    useState(false);
  const [loadError, setLoadError] =
    useState<string | null>(null);

  const loadGroupData = useCallback(
    async (refreshing = false) => {
      if (!accessToken || !groupId) {
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

        const [
          groupResponse,
          restaurantsResponse,
        ] = await Promise.all([
          getGroup(groupId, accessToken),
          getGroupRestaurants(groupId, accessToken),
        ]);

        setGroup(groupResponse);
        setRestaurants(restaurantsResponse);
      } catch (error) {
        setLoadError(getErrorMessage(error));
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [accessToken, groupId],
  );

  useFocusEffect(
    useCallback(() => {
      void loadGroupData();
    }, [loadGroupData]),
  );

  function openCreateRestaurant() {
    router.push({
      pathname:
        '/groups/[groupId]/restaurants/create',
      params: {
        groupId,
      },
    });
  }

  return (
    <SafeAreaView
      edges={['top', 'right', 'bottom', 'left']}
      style={styles.safeArea}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            onRefresh={() => loadGroupData(true)}
            refreshing={isRefreshing}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Text style={styles.backText}>‹</Text>
          </Pressable>

          <Text style={styles.headerTitle}>
            Grupo
          </Text>

          <View style={styles.headerSpacer} />
        </View>

        {isLoading ? (
          <View style={styles.loading}>
            <ActivityIndicator
              color={colors.primary}
              size="large"
            />
          </View>
        ) : null}

        {!isLoading && loadError ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorTitle}>
              No hemos podido abrir el grupo
            </Text>

            <Text style={styles.errorText}>
              {loadError}
            </Text>

            <Pressable
              onPress={() => loadGroupData()}
            >
              <Text style={styles.retryText}>
                Volver a intentar
              </Text>
            </Pressable>
          </View>
        ) : null}

        {!isLoading && !loadError && group ? (
          <>
            <View style={styles.groupHeader}>
              <View style={styles.groupIcon}>
                <Text style={styles.groupIconText}>
                  {group.name.charAt(0).toUpperCase()}
                </Text>
              </View>

              <Text style={styles.groupName}>
                {group.name}
              </Text>

              {group.description ? (
                <Text style={styles.groupDescription}>
                  {group.description}
                </Text>
              ) : null}

              <View style={styles.metadata}>
                <View style={styles.metadataItem}>
                  <Text style={styles.metadataLabel}>
                    Ciudad
                  </Text>

                  <Text style={styles.metadataValue}>
                    {group.city ?? 'Sin ubicación'}
                  </Text>
                </View>

                <View style={styles.metadataItem}>
                  <Text style={styles.metadataLabel}>
                    Privacidad
                  </Text>

                  <Text style={styles.metadataValue}>
                    {group.privacy === 'PRIVATE'
                      ? 'Privado'
                      : 'Público'}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleRow}>
                  <Text style={styles.sectionTitle}>
                    Restaurantes
                  </Text>

                  <Text style={styles.sectionCount}>
                    {restaurants.length}
                  </Text>
                </View>

                <Pressable
                  accessibilityRole="button"
                  onPress={openCreateRestaurant}
                  style={({ pressed }) => [
                    styles.addButton,
                    pressed
                      ? styles.addButtonPressed
                      : null,
                  ]}
                >
                  <Text style={styles.addButtonText}>
                    + Añadir
                  </Text>
                </Pressable>
              </View>

              {restaurants.length === 0 ? (
                <View style={styles.emptyRestaurants}>
                  <Text style={styles.emptyEmoji}>
                    📍
                  </Text>

                  <Text style={styles.emptyTitle}>
                    Todavía no hay restaurantes
                  </Text>

                  <Text style={styles.emptyText}>
                    Añade el primer sitio pendiente
                    del grupo.
                  </Text>

                  <View style={styles.emptyButton}>
                    <PrimaryButton
                      onPress={openCreateRestaurant}
                      title="Añadir restaurante"
                    />
                  </View>
                </View>
              ) : (
                <View style={styles.restaurantList}>
                  {restaurants.map(
                    (groupRestaurant) => (
                      <RestaurantCard
                        groupRestaurant={
                          groupRestaurant
                        }
                        key={groupRestaurant.id}
                      />
                    ),
                  )}
                </View>
              )}
            </View>
          </>
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
    gap: 26,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: colors.surface,
  },
  backText: {
    color: colors.text,
    fontSize: 34,
    lineHeight: 36,
  },
  headerTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '800',
  },
  headerSpacer: {
    width: 44,
  },
  loading: {
    alignItems: 'center',
    paddingVertical: 80,
  },
  groupHeader: {
    alignItems: 'center',
    gap: 12,
  },
  groupIcon: {
    width: 78,
    height: 78,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 26,
    backgroundColor: colors.primary,
  },
  groupIconText: {
    color: colors.white,
    fontSize: 32,
    fontWeight: '800',
  },
  groupName: {
    color: colors.text,
    fontSize: 29,
    fontWeight: '800',
    textAlign: 'center',
  },
  groupDescription: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  metadata: {
    width: '100%',
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  metadataItem: {
    flex: 1,
    gap: 4,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    backgroundColor: colors.surface,
    padding: 14,
  },
  metadataLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '600',
  },
  metadataValue: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  section: {
    gap: 14,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 21,
    fontWeight: '800',
  },
  sectionCount: {
    color: colors.muted,
    fontSize: 15,
    fontWeight: '700',
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
  restaurantList: {
    gap: 12,
  },
  emptyRestaurants: {
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 22,
    backgroundColor: colors.surface,
    padding: 26,
  },
  emptyEmoji: {
    fontSize: 32,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
  },
  emptyText: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
  },
  emptyButton: {
    width: '100%',
    marginTop: 4,
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