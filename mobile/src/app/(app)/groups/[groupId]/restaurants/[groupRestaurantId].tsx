import { SymbolView } from 'expo-symbols';
import {
  router,
  useFocusEffect,
  useLocalSearchParams,
} from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RestaurantRatingsSection } from '../../../../../components/RestaurantRatingsSection';
import { RestaurantPhotosSection } from '../../../../../components/RestaurantPhotosSection';
import {
  RestaurantStatusSection,
  restaurantStatusPresentation,
} from '../../../../../components/RestaurantStatusSection';
import { useAuth } from '../../../../../contexts/auth-context';
import { getErrorMessage } from '../../../../../lib/api';
import { getRestaurantFallbackImage } from '../../../../../lib/restaurant-images';
import { getGroup } from '../../../../../services/group-service';
import {
  getGroupRestaurant,
  updateGroupRestaurantFavorite,
  updateGroupRestaurantStatus,
} from '../../../../../services/restaurant-service';
import { colors } from '../../../../../theme/colors';
import type { RestaurantGroup } from '../../../../../types/group';
import type { GroupRestaurant } from '../../../../../types/restaurant';
import { fonts } from '../../../../../theme/fonts';
import { shadows } from '../../../../../theme/layout';

type RestaurantDetailTab = 'summary' | 'photos' | 'ratings';

const privateRestaurantTabs: Array<{
  key: RestaurantDetailTab;
  label: string;
}> = [
  { key: 'summary', label: 'Resumen' },
  { key: 'photos', label: 'Fotos' },
  { key: 'ratings', label: 'Valoraciones' },
];

const publicRestaurantTabs = privateRestaurantTabs.filter(
  tab => tab.key !== 'photos',
);

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
  const [activeTab, setActiveTab] = useState<RestaurantDetailTab>('summary');
  const [isUpdatingFavorite, setIsUpdatingFavorite] = useState(false);

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
    group?.currentUserRole === 'OWNER'
    || group?.currentUserRole === 'MEMBER';
  const isVisited = item
    ? item.status === 'VISITED'
      || item.status === 'WANT_TO_REPEAT'
      || item.status === 'DO_NOT_REPEAT'
      || item.status === 'FAVORITE'
    : false;
  const detailTabs = group?.privacy === 'PRIVATE'
    ? privateRestaurantTabs
    : publicRestaurantTabs;

  const ensureRestaurantVisited = useCallback(async (): Promise<boolean> => {
    if (!accessToken || !item || !groupId || !groupRestaurantId) {
      return false;
    }

    if (
      item.status === 'VISITED'
      || item.status === 'WANT_TO_REPEAT'
      || item.status === 'DO_NOT_REPEAT'
      || item.status === 'FAVORITE'
    ) {
      return true;
    }

    if (item.status === 'ARCHIVED') {
      Alert.alert(
        'Restaurante archivado',
        'Restáuralo antes de añadir valoraciones o fotos.',
      );
      return false;
    }

    return new Promise(resolve => {
      Alert.alert(
        '¿Ya habéis ido?',
        'Para valorar o guardar fotos, marcaremos el restaurante como visitado.',
        [
          {
            text: 'Todavía no',
            style: 'cancel',
            onPress: () => resolve(false),
          },
          {
            text: 'Sí, ya hemos ido',
            onPress: () => {
              void (async () => {
                try {
                  const updated = await updateGroupRestaurantStatus(
                    groupId,
                    groupRestaurantId,
                    { status: 'VISITED' },
                    accessToken,
                  );
                  setItem(updated);
                  resolve(true);
                } catch (requestError) {
                  Alert.alert(
                    'No se ha podido actualizar',
                    getErrorMessage(requestError),
                  );
                  resolve(false);
                }
              })();
            },
          },
        ],
        {
          cancelable: false,
        },
      );
    });
  }, [accessToken, groupId, groupRestaurantId, item]);

  async function handleFavoriteChange() {
    if (
      !accessToken
      || !groupId
      || !groupRestaurantId
      || !item
      || isUpdatingFavorite
    ) {
      return;
    }

    try {
      setIsUpdatingFavorite(true);

      const updated = await updateGroupRestaurantFavorite(
        groupId,
        groupRestaurantId,
        { favorite: !item.favorite },
        accessToken,
      );

      setItem(updated);
    } catch (requestError) {
      Alert.alert(
        'No se ha podido actualizar',
        getErrorMessage(requestError),
      );
    } finally {
      setIsUpdatingFavorite(false);
    }
  }

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

          <View style={styles.headerActions}>
            {item && canManageRestaurant ? (
              <Pressable
                accessibilityLabel={
                  item.favorite
                    ? 'Quitar de favoritos'
                    : 'Añadir a favoritos'
                }
                accessibilityRole="button"
                accessibilityState={{ selected: item.favorite }}
                disabled={isUpdatingFavorite}
                hitSlop={6}
                onPress={() => void handleFavoriteChange()}
                style={({ pressed }) => [
                  styles.iconButton,
                  pressed ? styles.headerActionPressed : null,
                ]}
              >
                {isUpdatingFavorite ? (
                  <ActivityIndicator color={colors.primary} size="small" />
                ) : (
                  <SymbolView
                    name={{
                      ios: item.favorite ? 'heart.fill' : 'heart',
                      android: item.favorite ? 'favorite' : 'favorite_border',
                      web: item.favorite ? 'favorite' : 'favorite_border',
                    }}
                    size={19}
                    tintColor={item.favorite ? colors.primary : colors.mutedStrong}
                  />
                )}
              </Pressable>
            ) : item?.favorite ? (
              <View accessibilityLabel="Favorito" style={styles.iconButton}>
                <SymbolView
                  name={{
                    ios: 'heart.fill',
                    android: 'favorite',
                    web: 'favorite',
                  }}
                  size={19}
                  tintColor={colors.primary}
                />
              </View>
            ) : null}

            {canManageRestaurant ? (
              <Pressable
                accessibilityLabel="Editar restaurante"
                accessibilityRole="button"
                disabled={!item}
                hitSlop={6}
                onPress={() => router.push({
                  pathname: '/groups/[groupId]/restaurants/edit',
                  params: { groupId, groupRestaurantId },
                })}
                style={({ pressed }) => [
                  styles.iconButton,
                  pressed ? styles.headerActionPressed : null,
                ]}
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
            ) : null}
          </View>
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
              <View style={styles.artworkFrame}>
                <Image
                  accessibilityIgnoresInvertColors
                  resizeMode="cover"
                  source={{ uri: getRestaurantFallbackImage(restaurant.name) }}
                  style={styles.artwork}
                />
              </View>
              <View style={styles.heroBody}>
                <Text style={styles.eyebrow}>
                  {restaurant.category?.toUpperCase() ?? 'RESTAURANTE'}
                </Text>
                <Text
                  ellipsizeMode="tail"
                  numberOfLines={3}
                  style={styles.name}
                >
                  {restaurant.name}
                </Text>
                <View
                  style={[
                    styles.status,
                    { backgroundColor: status.backgroundColor },
                  ]}
                >
                  <Text style={[styles.statusText, { color: status.textColor }]}>
                    {status.label}
                  </Text>
                </View>
              </View>
            </View>

            <View
              accessibilityRole="tablist"
              style={styles.tabs}
            >
              {detailTabs.map(tab => {
                const selected = activeTab === tab.key;

                return (
                  <Pressable
                    accessibilityRole="tab"
                    accessibilityState={{ selected }}
                    key={tab.key}
                    onPress={() => setActiveTab(tab.key)}
                    style={({ pressed }) => [
                      styles.tab,
                      pressed ? styles.tabPressed : null,
                    ]}
                  >
                    <Text
                      style={[
                        styles.tabLabel,
                        selected ? styles.tabLabelSelected : null,
                      ]}
                    >
                      {tab.label}
                    </Text>
                    {selected ? <View style={styles.tabIndicator} /> : null}
                  </Pressable>
                );
              })}
            </View>

            {activeTab === 'summary' ? (
              <>
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>
                    Información
                  </Text>
                  <View style={styles.infoList}>
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
                        <Text
                          ellipsizeMode="tail"
                          numberOfLines={3}
                          style={styles.infoValue}
                        >
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
                          {item.groupNotes || 'Sin notas todavía.'}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>

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

            {activeTab === 'photos' && group.privacy === 'PRIVATE' ? (
              <RestaurantPhotosSection
                accessToken={accessToken}
                canAddPhotos={canManageRestaurant}
                groupId={groupId}
                groupRestaurantId={groupRestaurantId}
                onEnsureVisited={ensureRestaurantVisited}
              />
            ) : null}

            {activeTab === 'ratings' ? (
              <RestaurantRatingsSection
                accessToken={accessToken}
                groupId={groupId}
                groupRestaurantId={groupRestaurantId}
                onEnsureVisited={
                  group.privacy === 'PRIVATE' && canManageRestaurant && !isVisited
                    ? ensureRestaurantVisited
                    : undefined
                }
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
    gap: 16,
    paddingHorizontal: 18,
    paddingTop: 4,
    paddingBottom: 32,
  },
  header: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
  },
  iconButton: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 19,
  },
  headerTitle: {
    position: 'absolute',
    right: 80,
    left: 80,
    color: colors.text,
    fontSize: 15,
    fontFamily: fonts.bold,
    textAlign: 'center',
  },
  headerActions: {
    minWidth: 38,
    minHeight: 38,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  headerActionPressed: {
    opacity: 0.58,
  },
  loading: {
    alignItems: 'center',
    paddingVertical: 100,
  },
  hero: {
    minHeight: 142,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    padding: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    borderRadius: 22,
    backgroundColor: colors.surfaceElevated,
    ...shadows.card,
  },
  artworkFrame: {
    width: 122,
    height: 122,
    overflow: 'hidden',
    borderRadius: 16,
    backgroundColor: colors.surfaceMuted,
  },
  artwork: {
    width: '100%',
    height: '100%',
  },
  heroBody: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: 8,
    paddingTop: 5,
    paddingRight: 6,
    paddingBottom: 5,
  },
  eyebrow: {
    color: colors.muted,
    fontSize: 9,
    fontFamily: fonts.bold,
    letterSpacing: 0.8,
  },
  name: {
    color: colors.text,
    fontSize: 20,
    lineHeight: 24,
    fontFamily: fonts.bold,
    letterSpacing: -0.4,
  },
  status: {
    marginTop: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  statusText: {
    fontSize: 9,
    fontFamily: fonts.bold,
  },
  tabs: {
    minHeight: 43,
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  tab: {
    flex: 1,
    minHeight: 43,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  tabPressed: {
    opacity: 0.62,
  },
  tabLabel: {
    color: colors.muted,
    fontSize: 10,
    fontFamily: fonts.semiBold,
  },
  tabLabelSelected: {
    color: colors.primary,
    fontFamily: fonts.bold,
  },
  tabIndicator: {
    position: 'absolute',
    right: 13,
    bottom: -1,
    left: 13,
    height: 2,
    borderRadius: 2,
    backgroundColor: colors.primary,
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 17,
    fontFamily: fonts.bold,
  },
  infoList: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingVertical: 11,
  },
  infoText: {
    flex: 1,
    gap: 4,
  },
  infoLabel: {
    color: colors.muted,
    fontSize: 9,
    fontFamily: fonts.bold,
    textTransform: 'uppercase',
  },
  infoValue: {
    color: colors.text,
    fontFamily: fonts.regular,
    fontSize: 11,
    lineHeight: 16,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 29,
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
    fontFamily: fonts.bold,
  },
  errorText: {
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 18,
  },
  retry: {
    color: colors.primary,
    fontSize: 12,
    fontFamily: fonts.bold,
  },
});
