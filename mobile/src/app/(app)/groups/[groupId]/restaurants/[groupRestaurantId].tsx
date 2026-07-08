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
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RestaurantRatingsSection } from '../../../../../components/RestaurantRatingsSection';
import {
  RestaurantStatusSection,
  restaurantStatusPresentation,
} from '../../../../../components/RestaurantStatusSection';
import { useAuth } from '../../../../../contexts/auth-context';
import { getErrorMessage } from '../../../../../lib/api';
import { getGroup } from '../../../../../services/group-service';
import { getGroupRestaurant } from '../../../../../services/restaurant-service';
import { colors } from '../../../../../theme/colors';
import type { RestaurantGroup } from '../../../../../types/group';
import type { GroupRestaurant } from '../../../../../types/restaurant';

export default function RestaurantDetailScreen() {
  const { groupId, groupRestaurantId } = useLocalSearchParams<{
    groupId: string;
    groupRestaurantId: string;
  }>();
  const { accessToken } = useAuth();
  const [group, setGroup] = useState<RestaurantGroup | null>(null);
  const [item, setItem] = useState<GroupRestaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!accessToken || !groupId || !groupRestaurantId) {
      setError('No se ha podido recuperar el restaurante.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const [restaurantResponse, groupResponse] = await Promise.all([
        getGroupRestaurant(
          groupId,
          groupRestaurantId,
          accessToken,
        ),
        getGroup(groupId, accessToken),
      ]);

      setItem(restaurantResponse);
      setGroup(groupResponse);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, [accessToken, groupId, groupRestaurantId]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const restaurant = item?.restaurant;
  const status = item
    ? restaurantStatusPresentation[item.status]
    : null;
  const location = restaurant
    ? [
        restaurant.address,
        restaurant.city,
        restaurant.country,
      ]
        .filter(Boolean)
        .join(' · ')
    : '';
  const canManageRestaurant =
    group?.currentUserRole !== 'CONTRIBUTOR';

  return (
    <SafeAreaView
      edges={['top', 'right', 'bottom', 'left']}
      style={styles.safeArea}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Pressable
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
            Restaurante
          </Text>

          {canManageRestaurant ? (
            <Pressable
              accessibilityLabel="Editar restaurante"
              accessibilityRole="button"
              disabled={!item}
              onPress={() => router.push({
                pathname: '/groups/[groupId]/restaurants/edit',
                params: { groupId, groupRestaurantId },
              })}
              style={styles.iconButton}
            >
              <SymbolView
                name={{
                  ios: 'pencil',
                  android: 'edit',
                  web: 'edit',
                }}
                size={19}
                tintColor={colors.primary}
              />
            </Pressable>
          ) : (
            <View style={styles.iconButton} />
          )}
        </View>

        {loading ? (
          <View style={styles.loading}>
            <ActivityIndicator
              color={colors.primary}
              size="large"
            />
          </View>
        ) : null}

        {!loading && error ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorTitle}>
              No hemos podido abrir el restaurante
            </Text>
            <Text style={styles.errorText}>{error}</Text>
            <Pressable onPress={() => void load()}>
              <Text style={styles.retry}>
                Volver a intentar
              </Text>
            </Pressable>
          </View>
        ) : null}

        {!loading
        && !error
        && item
        && restaurant
        && status
        && accessToken
        && group ? (
          <>
            <View style={styles.hero}>
              <View style={styles.artwork}>
                <View style={styles.artworkIcon}>
                  <SymbolView
                    name={{
                      ios: 'fork.knife',
                      android: 'restaurant',
                      web: 'restaurant',
                    }}
                    size={38}
                    tintColor={colors.primary}
                  />
                </View>
              </View>

              <View style={styles.heroBody}>
                <Text style={styles.eyebrow}>
                  {restaurant.category?.toUpperCase()
                    ?? 'RESTAURANTE'}
                </Text>
                <Text style={styles.name}>
                  {restaurant.name}
                </Text>
                <View
                  style={[
                    styles.status,
                    { backgroundColor: status.backgroundColor },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      { color: status.textColor },
                    ]}
                  >
                    {status.label}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Información
              </Text>
              <View style={styles.infoCard}>
                <View style={styles.infoRow}>
                  <SymbolView
                    name={{
                      ios: 'mappin.and.ellipse',
                      android: 'location_on',
                      web: 'location_on',
                    }}
                    size={19}
                    tintColor={colors.primary}
                  />
                  <View style={styles.infoText}>
                    <Text style={styles.infoLabel}>
                      Ubicación
                    </Text>
                    <Text style={styles.infoValue}>
                      {location || 'Sin ubicación disponible'}
                    </Text>
                  </View>
                </View>
                <View style={styles.divider} />
                <View style={styles.infoRow}>
                  <SymbolView
                    name={{
                      ios: 'note.text',
                      android: 'notes',
                      web: 'notes',
                    }}
                    size={19}
                    tintColor={colors.primary}
                  />
                  <View style={styles.infoText}>
                    <Text style={styles.infoLabel}>
                      Notas del grupo
                    </Text>
                    <Text style={styles.infoValue}>
                      {item.groupNotes
                        || 'Todavía no habéis añadido notas.'}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            <RestaurantRatingsSection
              accessToken={accessToken}
              groupId={groupId}
              groupRestaurantId={groupRestaurantId}
            />

            {canManageRestaurant ? (
              <RestaurantStatusSection
                accessToken={accessToken}
                groupId={groupId}
                groupRestaurant={item}
                onUpdated={setItem}
              />
            ) : null}
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
    gap: 22,
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 36,
  },
  header: {
    minHeight: 48,
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
  headerTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '900',
  },
  loading: {
    alignItems: 'center',
    paddingVertical: 100,
  },
  hero: {
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 24,
    backgroundColor: colors.surface,
  },
  artwork: {
    height: 170,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1DED5',
  },
  artworkIcon: {
    width: 88,
    height: 88,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 44,
    backgroundColor: colors.background,
  },
  heroBody: {
    alignItems: 'flex-start',
    gap: 8,
    padding: 18,
  },
  eyebrow: {
    color: colors.primary,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },
  name: {
    color: colors.text,
    fontSize: 25,
    lineHeight: 31,
    fontWeight: '900',
  },
  status: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '900',
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '900',
  },
  infoCard: {
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    backgroundColor: colors.surface,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 15,
  },
  infoText: {
    flex: 1,
    gap: 4,
  },
  infoLabel: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  infoValue: {
    color: colors.text,
    fontSize: 12,
    lineHeight: 18,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 46,
    backgroundColor: colors.border,
  },
  errorCard: {
    gap: 8,
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
    fontSize: 12,
    lineHeight: 18,
  },
  retry: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '900',
  },
});
