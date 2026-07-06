import { SymbolView } from 'expo-symbols';
import {
  router,
  useFocusEffect,
  useLocalSearchParams,
} from 'expo-router';
import {
  useCallback,
  useMemo,
  useState,
} from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '../../../../../contexts/auth-context';
import { getErrorMessage } from '../../../../../lib/api';
import {
  copyPublicGroupRestaurants,
  getPublicGroup,
  getPublicGroupCopyDestinations,
} from '../../../../../services/group-service';
import { colors } from '../../../../../theme/colors';
import type {
  CopyPublicRestaurantsResult,
  PublicGroupDetail,
  RestaurantGroup,
} from '../../../../../types/group';
import type { GroupRestaurant } from '../../../../../types/restaurant';

function SelectableRestaurant({
  item,
  selected,
  onPress,
}: {
  item: GroupRestaurant;
  selected: boolean;
  onPress: () => void;
}) {
  const location = [
    item.restaurant.address,
    item.restaurant.city,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.selectableCard,
        selected ? styles.selectableCardActive : null,
        pressed ? styles.pressed : null,
      ]}
    >
      <View style={styles.restaurantIcon}>
        <SymbolView
          name={{
            ios: 'fork.knife',
            android: 'restaurant',
            web: 'restaurant',
          }}
          size={20}
          tintColor={colors.primary}
        />
      </View>

      <View style={styles.restaurantText}>
        <Text
          numberOfLines={1}
          style={styles.restaurantName}
        >
          {item.restaurant.name}
        </Text>
        <Text
          numberOfLines={1}
          style={styles.restaurantMeta}
        >
          {item.restaurant.category ?? 'Restaurante'}
          {location ? ` · ${location}` : ''}
        </Text>
      </View>

      <SymbolView
        name={{
          ios: selected
            ? 'checkmark.circle.fill'
            : 'circle',
          android: selected
            ? 'check_circle'
            : 'radio_button_unchecked',
          web: selected
            ? 'check_circle'
            : 'radio_button_unchecked',
        }}
        size={23}
        tintColor={
          selected ? colors.primary : colors.border
        }
      />
    </Pressable>
  );
}

function DestinationCard({
  group,
  selected,
  onPress,
}: {
  group: RestaurantGroup;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.destinationCard,
        selected ? styles.destinationCardActive : null,
        pressed ? styles.pressed : null,
      ]}
    >
      <View style={styles.destinationInitial}>
        <Text style={styles.destinationInitialText}>
          {group.name.charAt(0).toUpperCase()}
        </Text>
      </View>

      <View style={styles.destinationText}>
        <Text
          numberOfLines={1}
          style={styles.destinationName}
        >
          {group.name}
        </Text>
        <Text style={styles.destinationMeta}>
          {group.privacy === 'PRIVATE'
            ? 'Grupo privado'
            : 'Tu grupo público'}
          {group.city ? ` · ${group.city}` : ''}
        </Text>
      </View>

      <SymbolView
        name={{
          ios: selected
            ? 'largecircle.fill.circle'
            : 'circle',
          android: selected
            ? 'radio_button_checked'
            : 'radio_button_unchecked',
          web: selected
            ? 'radio_button_checked'
            : 'radio_button_unchecked',
        }}
        size={22}
        tintColor={
          selected ? colors.primary : colors.border
        }
      />
    </Pressable>
  );
}

export default function CopyPublicRestaurantsScreen() {
  const { groupId } = useLocalSearchParams<{
    groupId: string;
  }>();
  const { accessToken } = useAuth();

  const [detail, setDetail] =
    useState<PublicGroupDetail | null>(null);
  const [destinations, setDestinations] =
    useState<RestaurantGroup[]>([]);
  const [selectedIds, setSelectedIds] =
    useState<Set<string>>(new Set());
  const [destinationId, setDestinationId] =
    useState<string | null>(null);
  const [result, setResult] =
    useState<CopyPublicRestaurantsResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] =
    useState<string | null>(null);

  const load = useCallback(async () => {
    if (!accessToken || !groupId) {
      setError('No se ha podido preparar la copia.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const [publicGroup, availableDestinations] =
        await Promise.all([
          getPublicGroup(groupId, accessToken),
          getPublicGroupCopyDestinations(
            groupId,
            accessToken,
          ),
        ]);

      setDetail(publicGroup);
      setDestinations(availableDestinations);

      if (availableDestinations.length === 1) {
        setDestinationId(availableDestinations[0].id);
      }
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, [accessToken, groupId]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const allSelected = useMemo(() => {
    if (!detail || detail.restaurants.length === 0) {
      return false;
    }

    return selectedIds.size === detail.restaurants.length;
  }, [detail, selectedIds]);

  function toggleRestaurant(id: string): void {
    setSelectedIds(current => {
      const next = new Set(current);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  }

  function toggleAll(): void {
    if (!detail) {
      return;
    }

    if (allSelected) {
      setSelectedIds(new Set());
      return;
    }

    setSelectedIds(
      new Set(detail.restaurants.map(item => item.id)),
    );
  }

  async function handleCopy(): Promise<void> {
    if (
      !accessToken
      || !groupId
      || !destinationId
      || selectedIds.size === 0
      || submitting
    ) {
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const copyResult =
        await copyPublicGroupRestaurants(
          groupId,
          {
            destinationGroupId: destinationId,
            groupRestaurantIds: Array.from(selectedIds),
          },
          accessToken,
        );

      setResult(copyResult);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setSubmitting(false);
    }
  }

  function openDestination(): void {
    if (!result) {
      return;
    }

    router.replace({
      pathname: '/groups/[groupId]',
      params: {
        groupId: result.destinationGroupId,
      },
    });
  }

  const selectedDestination = destinations.find(
    destination => destination.id === destinationId,
  );

  return (
    <SafeAreaView
      edges={['top', 'right', 'bottom', 'left']}
      style={styles.safeArea}
    >
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            router.back();
          }}
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
          Copiar restaurantes
        </Text>

        <View style={styles.iconButton} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator
              color={colors.primary}
              size="large"
            />
            <Text style={styles.loadingText}>
              Preparando tus grupos...
            </Text>
          </View>
        ) : null}

        {!loading && error && !detail ? (
          <View style={styles.messageCard}>
            <Text style={styles.messageTitle}>
              No hemos podido preparar la copia
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

        {!loading && detail && result ? (
          <View style={styles.resultCard}>
            <View style={styles.resultIcon}>
              <SymbolView
                name={{
                  ios: 'checkmark',
                  android: 'check',
                  web: 'check',
                }}
                size={28}
                tintColor="#607349"
              />
            </View>

            <Text style={styles.resultTitle}>
              Restaurantes guardados
            </Text>

            <Text style={styles.resultText}>
              {result.copiedCount}{' '}
              {result.copiedCount === 1
                ? 'restaurante copiado'
                : 'restaurantes copiados'}
              {result.skippedCount > 0
                ? ` · ${result.skippedCount} ya estaba${result.skippedCount === 1 ? '' : 'n'} en el grupo`
                : ''}
            </Text>

            {selectedDestination ? (
              <Text style={styles.destinationSummary}>
                Destino: {selectedDestination.name}
              </Text>
            ) : null}

            <Pressable
              accessibilityRole="button"
              onPress={openDestination}
              style={styles.primaryButton}
            >
              <Text style={styles.primaryButtonText}>
                Abrir grupo de destino
              </Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              onPress={() => {
                router.back();
              }}
              style={styles.secondaryButton}
            >
              <Text style={styles.secondaryButtonText}>
                Volver al grupo público
              </Text>
            </Pressable>
          </View>
        ) : null}

        {!loading && detail && !result ? (
          <>
            <View style={styles.introCard}>
              <Text style={styles.eyebrow}>
                Desde
              </Text>
              <Text style={styles.introTitle}>
                {detail.group.name}
              </Text>
              <Text style={styles.introText}>
                Se copiarán como «Pendiente de ir». Las notas y valoraciones del grupo público no se trasladan.
              </Text>
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View>
                  <Text style={styles.sectionTitle}>
                    1. Elige restaurantes
                  </Text>
                  <Text style={styles.sectionSubtitle}>
                    {selectedIds.size} seleccionados
                  </Text>
                </View>

                {detail.restaurants.length > 0 ? (
                  <Pressable
                    accessibilityRole="button"
                    onPress={toggleAll}
                  >
                    <Text style={styles.selectAllText}>
                      {allSelected
                        ? 'Quitar todos'
                        : 'Seleccionar todos'}
                    </Text>
                  </Pressable>
                ) : null}
              </View>

              {detail.restaurants.length === 0 ? (
                <View style={styles.messageCard}>
                  <Text style={styles.messageTitle}>
                    No hay restaurantes para copiar
                  </Text>
                  <Text style={styles.messageText}>
                    Esta lista pública todavía está vacía.
                  </Text>
                </View>
              ) : (
                <View style={styles.list}>
                  {detail.restaurants.map(item => (
                    <SelectableRestaurant
                      item={item}
                      key={item.id}
                      onPress={() => {
                        toggleRestaurant(item.id);
                      }}
                      selected={selectedIds.has(item.id)}
                    />
                  ))}
                </View>
              )}
            </View>

            <View style={styles.section}>
              <View>
                <Text style={styles.sectionTitle}>
                  2. Elige destino
                </Text>
                <Text style={styles.sectionSubtitle}>
                  Tus grupos privados y tus grupos públicos
                </Text>
              </View>

              {destinations.length === 0 ? (
                <View style={styles.messageCard}>
                  <Text style={styles.messageTitle}>
                    Necesitas un grupo de destino
                  </Text>
                  <Text style={styles.messageText}>
                    Crea un grupo propio para guardar estos restaurantes.
                  </Text>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => {
                      router.push('/groups/create');
                    }}
                    style={styles.secondaryButton}
                  >
                    <Text style={styles.secondaryButtonText}>
                      Crear grupo
                    </Text>
                  </Pressable>
                </View>
              ) : (
                <View style={styles.list}>
                  {destinations.map(destination => (
                    <DestinationCard
                      group={destination}
                      key={destination.id}
                      onPress={() => {
                        setDestinationId(destination.id);
                      }}
                      selected={
                        destination.id === destinationId
                      }
                    />
                  ))}
                </View>
              )}
            </View>

            {error ? (
              <View style={styles.errorCard}>
                <Text style={styles.errorText}>
                  {error}
                </Text>
              </View>
            ) : null}

            <Pressable
              accessibilityRole="button"
              disabled={
                selectedIds.size === 0
                || !destinationId
                || submitting
              }
              onPress={() => {
                void handleCopy();
              }}
              style={({ pressed }) => [
                styles.primaryButton,
                selectedIds.size === 0 || !destinationId
                  ? styles.primaryButtonDisabled
                  : null,
                pressed ? styles.pressed : null,
              ]}
            >
              {submitting ? (
                <ActivityIndicator
                  color={colors.white}
                  size="small"
                />
              ) : (
                <Text style={styles.primaryButtonText}>
                  Copiar {selectedIds.size || ''}{' '}
                  {selectedIds.size === 1
                    ? 'restaurante'
                    : 'restaurantes'}
                </Text>
              )}
            </Pressable>
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
    gap: 22,
    paddingHorizontal: 18,
    paddingBottom: 36,
  },
  centered: {
    alignItems: 'center',
    gap: 12,
    paddingVertical: 100,
  },
  loadingText: {
    color: colors.muted,
    fontSize: 12,
  },
  introCard: {
    gap: 7,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 21,
    backgroundColor: colors.surface,
  },
  eyebrow: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  introTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '900',
  },
  introText: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 18,
  },
  section: {
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 12,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '900',
  },
  sectionSubtitle: {
    marginTop: 3,
    color: colors.muted,
    fontSize: 10,
  },
  selectAllText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '900',
  },
  list: {
    gap: 9,
  },
  selectableCard: {
    minHeight: 76,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    padding: 11,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    backgroundColor: colors.surface,
  },
  selectableCardActive: {
    borderColor: colors.primary,
    backgroundColor: '#FFF4EF',
  },
  restaurantIcon: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
    backgroundColor: '#F3DED5',
  },
  restaurantText: {
    flex: 1,
    gap: 4,
  },
  restaurantName: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '900',
  },
  restaurantMeta: {
    color: colors.muted,
    fontSize: 9,
  },
  destinationCard: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    padding: 11,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    backgroundColor: colors.surface,
  },
  destinationCardActive: {
    borderColor: colors.primary,
    backgroundColor: '#FFF4EF',
  },
  destinationInitial: {
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
    backgroundColor: '#FBE9E2',
  },
  destinationInitialText: {
    color: colors.primary,
    fontSize: 17,
    fontWeight: '900',
  },
  destinationText: {
    flex: 1,
    gap: 4,
  },
  destinationName: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '900',
  },
  destinationMeta: {
    color: colors.muted,
    fontSize: 9,
  },
  primaryButton: {
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
    borderRadius: 18,
    backgroundColor: colors.primary,
  },
  primaryButtonDisabled: {
    opacity: 0.45,
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '900',
  },
  secondaryButton: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 17,
    backgroundColor: colors.inputBackground,
  },
  secondaryButtonText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '900',
  },
  messageCard: {
    gap: 9,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 19,
    backgroundColor: colors.surface,
  },
  messageTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '900',
  },
  messageText: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 18,
  },
  retryText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '900',
  },
  errorCard: {
    padding: 14,
    borderRadius: 15,
    backgroundColor: '#FFF1EE',
  },
  errorText: {
    color: colors.danger,
    fontSize: 11,
    lineHeight: 16,
  },
  resultCard: {
    alignItems: 'center',
    gap: 13,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 24,
    backgroundColor: colors.surface,
  },
  resultIcon: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    backgroundColor: '#E8EEDD',
  },
  resultTitle: {
    color: colors.text,
    fontSize: 21,
    fontWeight: '900',
    textAlign: 'center',
  },
  resultText: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
  },
  destinationSummary: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '900',
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.72,
  },
});
