import { MaterialIcons } from '@expo/vector-icons';
import {
  router,
  useFocusEffect,
  useLocalSearchParams,
} from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RestaurantRatingsSection } from '../components/RestaurantRatingsSection';
import {
  RestaurantStatusSection,
  restaurantStatusPresentation,
} from '../components/RestaurantStatusSection';
import { useAuth } from '../contexts/auth-context';
import { getErrorMessage, resolveApiUrl } from '../lib/api';
import { getRestaurantFallbackImage } from '../lib/restaurant-images';
import { getGroup } from '../services/group-service';
import {
  getGroupRestaurant,
  updateGroupRestaurantFavorite,
} from '../services/restaurant-service';
import { colors } from '../theme/colors';
import type { RestaurantGroup } from '../types/group';
import type { GroupRestaurant } from '../types/restaurant';

function friendlyErrorMessage(error: unknown): string {
  const message = getErrorMessage(error);

  if (
    message.toLocaleLowerCase('es').includes('fetch failed')
    || message.toLocaleLowerCase('es').includes('java.net')
    || message.toLocaleLowerCase('es').includes('failed to fetch')
  ) {
    return 'No se ha podido conectar con Mesa. Revisa que el backend esté iniciado y vuelve a intentarlo.';
  }

  return message;
}

function formatAverage(value: number | null): string | null {
  if (value == null) {
    return null;
  }

  return value.toFixed(1).replace('.', ',');
}

export default function RestaurantDetailScreenPolished() {
  const { groupId, groupRestaurantId } = useLocalSearchParams<{
    groupId: string;
    groupRestaurantId: string;
  }>();
  const { accessToken } = useAuth();
  const [group, setGroup] = useState<RestaurantGroup | null>(null);
  const [item, setItem] = useState<GroupRestaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingFavorite, setUpdatingFavorite] = useState(false);

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
      setError(friendlyErrorMessage(requestError));
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
  const canManageRestaurant = group?.currentUserRole !== 'CONTRIBUTOR';
  const average = formatAverage(item?.averageScore ?? null);

  const imageUri = useMemo(() => {
    if (!restaurant) {
      return null;
    }

    return restaurant.imageUrl
      ? resolveApiUrl(restaurant.imageUrl)
      : getRestaurantFallbackImage(restaurant.name);
  }, [restaurant]);

  const location = restaurant
    ? [
        restaurant.address,
        restaurant.city,
        restaurant.country,
      ]
        .filter(Boolean)
        .join(' · ')
    : '';

  async function toggleFavorite(): Promise<void> {
    if (!accessToken || !groupId || !item || updatingFavorite) {
      return;
    }

    try {
      setUpdatingFavorite(true);
      const updated = await updateGroupRestaurantFavorite(
        groupId,
        item.id,
        { favorite: !item.favorite },
        accessToken,
      );
      setItem(updated);
    } catch (favoriteError) {
      Alert.alert(
        'No se ha podido actualizar',
        friendlyErrorMessage(favoriteError),
      );
    } finally {
      setUpdatingFavorite(false);
    }
  }

  async function shareRestaurant(): Promise<void> {
    if (!restaurant || !group) {
      return;
    }

    try {
      await Share.share({
        message: `Mira “${restaurant.name}” en el grupo “${group.name}” de Mesa.`,
      });
    } catch (shareError) {
      Alert.alert('No se ha podido compartir', friendlyErrorMessage(shareError));
    }
  }

  return (
    <SafeAreaView
      edges={['top', 'right', 'left']}
      style={styles.safeArea}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loading}>
            <ActivityIndicator color={colors.primary} size="large" />
          </View>
        ) : null}

        {!loading && error ? (
          <View style={styles.errorCard}>
            <MaterialIcons
              color={colors.primary}
              name="wifi-off"
              size={30}
            />
            <Text style={styles.errorTitle}>
              No hemos podido abrir el restaurante
            </Text>
            <Text style={styles.errorText}>{error}</Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => void load()}
              style={({ pressed }) => [
                styles.retryButton,
                pressed ? styles.pressed : null,
              ]}
            >
              <Text style={styles.retryButtonText}>Volver a intentar</Text>
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
              {imageUri ? (
                <Image
                  accessibilityIgnoresInvertColors
                  resizeMode="cover"
                  source={{ uri: imageUri }}
                  style={styles.heroImage}
                />
              ) : null}
              <View style={styles.heroOverlay} />
              <View style={styles.heroTopBar}>
                <Pressable
                  accessibilityLabel="Volver"
                  accessibilityRole="button"
                  onPress={() => router.back()}
                  style={({ pressed }) => [
                    styles.roundButton,
                    pressed ? styles.pressed : null,
                  ]}
                >
                  <MaterialIcons color={colors.text} name="arrow-back" size={21} />
                </Pressable>
                <View style={styles.heroTopRight}>
                  <Pressable
                    accessibilityLabel="Compartir restaurante"
                    accessibilityRole="button"
                    onPress={() => void shareRestaurant()}
                    style={({ pressed }) => [
                      styles.roundButton,
                      pressed ? styles.pressed : null,
                    ]}
                  >
                    <MaterialIcons color={colors.text} name="share" size={20} />
                  </Pressable>
                  {canManageRestaurant ? (
                    <Pressable
                      accessibilityLabel="Editar restaurante"
                      accessibilityRole="button"
                      onPress={() => router.push({
                        pathname: '/groups/[groupId]/restaurants/edit',
                        params: { groupId, groupRestaurantId },
                      })}
                      style={({ pressed }) => [
                        styles.roundButton,
                        pressed ? styles.pressed : null,
                      ]}
                    >
                      <MaterialIcons color={colors.text} name="edit" size={20} />
                    </Pressable>
                  ) : null}
                </View>
              </View>
            </View>

            <View style={styles.sheet}>
              <View style={styles.titleBlock}>
                <View style={styles.titleCopy}>
                  <Text numberOfLines={2} style={styles.restaurantName}>
                    {restaurant.name}
                  </Text>
                  <Text numberOfLines={1} style={styles.restaurantMeta}>
                    {[restaurant.category ?? 'Restaurante', group.name]
                      .filter(Boolean)
                      .join(' · ')}
                  </Text>
                </View>
                <Pressable
                  accessibilityRole="button"
                  disabled={updatingFavorite}
                  onPress={() => void toggleFavorite()}
                  style={({ pressed }) => [
                    styles.favoriteButton,
                    item.favorite ? styles.favoriteButtonActive : null,
                    pressed ? styles.pressed : null,
                  ]}
                >
                  {updatingFavorite ? (
                    <ActivityIndicator color={colors.primary} size="small" />
                  ) : (
                    <MaterialIcons
                      color={item.favorite ? colors.primary : colors.muted}
                      name={item.favorite ? 'favorite' : 'favorite-border'}
                      size={24}
                    />
                  )}
                </Pressable>
              </View>

              <View style={styles.quickInfoRow}>
                <View
                  style={[
                    styles.statusPill,
                    { backgroundColor: status.backgroundColor },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusPillText,
                      { color: status.textColor },
                    ]}
                  >
                    {status.label}
                  </Text>
                </View>
                {average ? (
                  <View style={styles.ratingPill}>
                    <MaterialIcons color="#E1A22E" name="star" size={15} />
                    <Text style={styles.ratingText}>{average}</Text>
                    <Text style={styles.ratingMuted}>
                      ({item.ratingsCount})
                    </Text>
                  </View>
                ) : (
                  <View style={styles.ratingPill}>
                    <MaterialIcons color="#E1A22E" name="star-border" size={15} />
                    <Text style={styles.ratingMuted}>Sin valorar</Text>
                  </View>
                )}
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Información</Text>
                <View style={styles.infoCard}>
                  <View style={styles.infoRow}>
                    <View style={styles.infoIcon}>
                      <MaterialIcons
                        color={colors.primary}
                        name="place"
                        size={18}
                      />
                    </View>
                    <View style={styles.infoText}>
                      <Text style={styles.infoLabel}>Ubicación</Text>
                      <Text style={styles.infoValue}>
                        {location || 'Sin ubicación disponible'}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.divider} />
                  <View style={styles.infoRow}>
                    <View style={styles.infoIcon}>
                      <MaterialIcons
                        color={colors.primary}
                        name="notes"
                        size={18}
                      />
                    </View>
                    <View style={styles.infoText}>
                      <Text style={styles.infoLabel}>Notas del grupo</Text>
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
    paddingBottom: 32,
  },
  loading: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 120,
  },
  hero: {
    height: 238,
    overflow: 'hidden',
    backgroundColor: '#3C3029',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(33, 23, 18, 0.22)',
  },
  heroTopBar: {
    position: 'absolute',
    top: 14,
    right: 18,
    left: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroTopRight: {
    flexDirection: 'row',
    gap: 9,
  },
  roundButton: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.94)',
    shadowColor: '#2B211C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 3,
  },
  sheet: {
    gap: 20,
    marginTop: -30,
    paddingHorizontal: 18,
    paddingTop: 24,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: colors.background,
  },
  titleBlock: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  titleCopy: {
    flex: 1,
    gap: 4,
  },
  restaurantName: {
    color: colors.text,
    fontSize: 27,
    lineHeight: 33,
    fontWeight: '900',
    letterSpacing: -0.65,
  },
  restaurantMeta: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '700',
  },
  favoriteButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 24,
    backgroundColor: colors.surface,
  },
  favoriteButtonActive: {
    borderColor: '#F1C8B9',
    backgroundColor: '#FFF0E8',
  },
  quickInfoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusPill: {
    minHeight: 34,
    justifyContent: 'center',
    paddingHorizontal: 12,
    borderRadius: 999,
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: '900',
  },
  ratingPill: {
    minHeight: 34,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: '#FFF6E8',
  },
  ratingText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '900',
  },
  ratingMuted: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '700',
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '900',
  },
  infoCard: {
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 22,
    backgroundColor: colors.surface,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 15,
  },
  infoIcon: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: '#FFF0E8',
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
    fontSize: 13,
    lineHeight: 19,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 61,
    backgroundColor: colors.border,
  },
  errorCard: {
    alignItems: 'center',
    gap: 10,
    margin: 18,
    padding: 22,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 24,
    backgroundColor: colors.surface,
  },
  errorTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '900',
    textAlign: 'center',
  },
  errorText: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 6,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: colors.primary,
  },
  retryButtonText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '900',
  },
  pressed: {
    opacity: 0.72,
  },
});
