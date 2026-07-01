import {
  router,
  useLocalSearchParams,
} from 'expo-router';
import {
  useCallback,
  useEffect,
  useState,
} from 'react';
import {
  ActivityIndicator,
  Alert,
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
  getGroupRestaurant,
  updateGroupRestaurantStatus,
} from '../../../../../services/restaurant-service';
import { colors } from '../../../../../theme/colors';
import {
  GroupRestaurant,
  GroupRestaurantStatus,
} from '../../../../../types/restaurant';

type StatusOption = {
  status: GroupRestaurantStatus;
  label: string;
  description: string;
};

const statusOptions: StatusOption[] = [
  {
    status: 'WANT_TO_GO',
    label: 'Queremos ir',
    description: 'El grupo todavía tiene pendiente probarlo.',
  },
  {
    status: 'VISITED',
    label: 'Visitado',
    description: 'Ya habéis ido al restaurante.',
  },
  {
    status: 'FAVORITE',
    label: 'Favorito',
    description: 'Uno de los restaurantes favoritos del grupo.',
  },
  {
    status: 'WANT_TO_REPEAT',
    label: 'Queremos repetir',
    description: 'Os gustó y queréis volver.',
  },
  {
    status: 'DO_NOT_REPEAT',
    label: 'No repetir',
    description: 'No queréis volver a este restaurante.',
  },
];

const statusLabels: Record<
  GroupRestaurantStatus,
  string
> = {
  WANT_TO_GO: 'Queremos ir',
  VISITED: 'Visitado',
  FAVORITE: 'Favorito',
  WANT_TO_REPEAT: 'Queremos repetir',
  DO_NOT_REPEAT: 'No repetir',
  ARCHIVED: 'Archivado',
};

const statusColors: Record<
  GroupRestaurantStatus,
  {
    backgroundColor: string;
    textColor: string;
  }
> = {
  WANT_TO_GO: {
    backgroundColor: '#F7E8D2',
    textColor: '#8A5B17',
  },
  VISITED: {
    backgroundColor: '#E5EDF7',
    textColor: '#365F91',
  },
  FAVORITE: {
    backgroundColor: '#FBE4E7',
    textColor: '#A33B4A',
  },
  WANT_TO_REPEAT: {
    backgroundColor: '#E8F1EB',
    textColor: colors.success,
  },
  DO_NOT_REPEAT: {
    backgroundColor: '#FBE9E5',
    textColor: colors.danger,
  },
  ARCHIVED: {
    backgroundColor: '#ECE8E6',
    textColor: colors.muted,
  },
};

export default function RestaurantDetailScreen() {
  const {
    groupId,
    groupRestaurantId,
  } = useLocalSearchParams<{
    groupId: string;
    groupRestaurantId: string;
  }>();

  const { accessToken } = useAuth();

  const [
    groupRestaurant,
    setGroupRestaurant,
  ] = useState<GroupRestaurant | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  const [loadError, setLoadError] =
    useState<string | null>(null);

  const [
    updatingStatus,
    setUpdatingStatus,
  ] = useState<GroupRestaurantStatus | null>(null);

  const [updateError, setUpdateError] =
    useState<string | null>(null);

  const loadRestaurant = useCallback(async () => {
    if (
      !accessToken
      || !groupId
      || !groupRestaurantId
    ) {
      setLoadError(
        'No se ha podido recuperar el restaurante.',
      );
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setLoadError(null);

      const response = await getGroupRestaurant(
        groupId,
        groupRestaurantId,
        accessToken,
      );

      setGroupRestaurant(response);
    } catch (error) {
      setLoadError(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, [
    accessToken,
    groupId,
    groupRestaurantId,
  ]);

  useEffect(() => {
    void loadRestaurant();
  }, [loadRestaurant]);

  async function handleStatusChange(
    status: GroupRestaurantStatus,
  ) {
    if (
      !accessToken
      || !groupId
      || !groupRestaurantId
    ) {
      setUpdateError(
        'No se ha podido recuperar tu sesión o el restaurante.',
      );
      return;
    }

    if (groupRestaurant?.status === status) {
      return;
    }

    try {
      setUpdateError(null);
      setUpdatingStatus(status);

      const updatedRestaurant =
        await updateGroupRestaurantStatus(
          groupId,
          groupRestaurantId,
          {
            status,
          },
          accessToken,
        );

      setGroupRestaurant(updatedRestaurant);
    } catch (error) {
      setUpdateError(getErrorMessage(error));
    } finally {
      setUpdatingStatus(null);
    }
  }

  function confirmArchive() {
    Alert.alert(
      'Archivar restaurante',
      'El restaurante seguirá guardado, pero quedará marcado como archivado.',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Archivar',
          style: 'destructive',
          onPress: () => {
            void handleStatusChange('ARCHIVED');
          },
        },
      ],
    );
  }

  const restaurant = groupRestaurant?.restaurant;

  const location = restaurant
    ? [
        restaurant.address,
        restaurant.city,
        restaurant.country,
      ]
        .filter(Boolean)
        .join(' · ')
    : '';

  const currentStatus = groupRestaurant
    ? statusColors[groupRestaurant.status]
    : null;

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
            accessibilityRole="button"
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Text style={styles.backText}>‹</Text>
          </Pressable>

          <Text style={styles.headerTitle}>
            Restaurante
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
              No hemos podido abrir el restaurante
            </Text>

            <Text style={styles.errorText}>
              {loadError}
            </Text>

            <Pressable
              accessibilityRole="button"
              onPress={() => {
                void loadRestaurant();
              }}
            >
              <Text style={styles.retryText}>
                Volver a intentar
              </Text>
            </Pressable>
          </View>
        ) : null}

        {!isLoading
        && !loadError
        && groupRestaurant
        && restaurant
        && currentStatus ? (
          <>
            <View style={styles.hero}>
              <View style={styles.restaurantIcon}>
                <Text style={styles.restaurantIconText}>
                  {restaurant.name
                    .charAt(0)
                    .toUpperCase()}
                </Text>
              </View>

              <Text style={styles.restaurantName}>
                {restaurant.name}
              </Text>

              {restaurant.category ? (
                <Text style={styles.category}>
                  {restaurant.category}
                </Text>
              ) : null}

              <View
                style={[
                  styles.currentStatus,
                  {
                    backgroundColor:
                      currentStatus.backgroundColor,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.currentStatusText,
                    {
                      color: currentStatus.textColor,
                    },
                  ]}
                >
                  {statusLabels[groupRestaurant.status]}
                </Text>
              </View>
            </View>

            <View style={styles.informationCard}>
              <Text style={styles.cardLabel}>
                Ubicación
              </Text>

              <Text style={styles.cardValue}>
                {location || 'Sin ubicación disponible'}
              </Text>
            </View>

            <View style={styles.informationCard}>
              <Text style={styles.cardLabel}>
                Notas del grupo
              </Text>

              <Text style={styles.cardValue}>
                {groupRestaurant.groupNotes
                  || 'El grupo todavía no ha añadido notas.'}
              </Text>
            </View>

            <View style={styles.statusSection}>
              <View style={styles.statusHeading}>
                <Text style={styles.sectionTitle}>
                  Estado
                </Text>

                <Text style={styles.sectionDescription}>
                  Cualquier miembro del grupo puede cambiarlo.
                </Text>
              </View>

              <View style={styles.statusList}>
                {statusOptions.map((option) => {
                  const isSelected =
                    groupRestaurant.status
                    === option.status;

                  const isUpdating =
                    updatingStatus === option.status;

                  return (
                    <Pressable
                      accessibilityRole="button"
                      disabled={
                        updatingStatus !== null
                      }
                      key={option.status}
                      onPress={() => {
                        void handleStatusChange(
                          option.status,
                        );
                      }}
                      style={({ pressed }) => [
                        styles.statusOption,
                        isSelected
                          ? styles.selectedStatusOption
                          : null,
                        pressed && !isSelected
                          ? styles.statusOptionPressed
                          : null,
                      ]}
                    >
                      <View style={styles.statusOptionText}>
                        <Text
                          style={[
                            styles.statusOptionTitle,
                            isSelected
                              ? styles.selectedStatusOptionTitle
                              : null,
                          ]}
                        >
                          {option.label}
                        </Text>

                        <Text style={styles.statusOptionDescription}>
                          {option.description}
                        </Text>
                      </View>

                      {isUpdating ? (
                        <ActivityIndicator
                          color={colors.primary}
                          size="small"
                        />
                      ) : null}

                      {!isUpdating && isSelected ? (
                        <Text style={styles.checkmark}>
                          ✓
                        </Text>
                      ) : null}
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {updateError ? (
              <View style={styles.updateError}>
                <Text style={styles.updateErrorText}>
                  {updateError}
                </Text>
              </View>
            ) : null}

            {groupRestaurant.status === 'ARCHIVED' ? (
              <Pressable
                accessibilityRole="button"
                disabled={updatingStatus !== null}
                onPress={() => {
                  void handleStatusChange('WANT_TO_GO');
                }}
                style={({ pressed }) => [
                  styles.restoreButton,
                  pressed
                    ? styles.secondaryButtonPressed
                    : null,
                ]}
              >
                {updatingStatus === 'WANT_TO_GO' ? (
                  <ActivityIndicator
                    color={colors.primary}
                    size="small"
                  />
                ) : (
                  <Text style={styles.restoreButtonText}>
                    Restaurar como “Queremos ir”
                  </Text>
                )}
              </Pressable>
            ) : (
              <Pressable
                accessibilityRole="button"
                disabled={updatingStatus !== null}
                onPress={confirmArchive}
                style={({ pressed }) => [
                  styles.archiveButton,
                  pressed
                    ? styles.secondaryButtonPressed
                    : null,
                ]}
              >
                {updatingStatus === 'ARCHIVED' ? (
                  <ActivityIndicator
                    color={colors.danger}
                    size="small"
                  />
                ) : (
                  <Text style={styles.archiveButtonText}>
                    Archivar restaurante
                  </Text>
                )}
              </Pressable>
            )}
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
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 36,
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
    paddingVertical: 100,
  },
  hero: {
    alignItems: 'center',
    gap: 10,
    paddingTop: 12,
  },
  restaurantIcon: {
    width: 82,
    height: 82,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 27,
    backgroundColor: colors.primary,
  },
  restaurantIconText: {
    color: colors.white,
    fontSize: 34,
    fontWeight: '800',
  },
  restaurantName: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '800',
    lineHeight: 34,
    textAlign: 'center',
  },
  category: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  currentStatus: {
    borderRadius: 999,
    paddingHorizontal: 13,
    paddingVertical: 7,
  },
  currentStatusText: {
    fontSize: 13,
    fontWeight: '800',
  },
  informationCard: {
    gap: 7,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    backgroundColor: colors.surface,
    padding: 17,
  },
  cardLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  cardValue: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 22,
  },
  statusSection: {
    gap: 14,
  },
  statusHeading: {
    gap: 5,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 21,
    fontWeight: '800',
  },
  sectionDescription: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 19,
  },
  statusList: {
    gap: 10,
  },
  statusOption: {
    minHeight: 76,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    backgroundColor: colors.surface,
    padding: 15,
  },
  selectedStatusOption: {
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: '#FFF3EE',
    padding: 14,
  },
  statusOptionPressed: {
    opacity: 0.72,
  },
  statusOptionText: {
    flex: 1,
    gap: 4,
  },
  statusOptionTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  selectedStatusOptionTitle: {
    color: colors.primary,
  },
  statusOptionDescription: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 17,
  },
  checkmark: {
    color: colors.primary,
    fontSize: 20,
    fontWeight: '800',
  },
  updateError: {
    borderWidth: 1,
    borderColor: '#F3C5BC',
    borderRadius: 16,
    backgroundColor: '#FFF1EE',
    padding: 14,
  },
  updateErrorText: {
    color: colors.danger,
    fontSize: 14,
    lineHeight: 20,
  },
  archiveButton: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2B6AE',
    borderRadius: 15,
    backgroundColor: '#FFF1EE',
    paddingHorizontal: 16,
  },
  archiveButtonText: {
    color: colors.danger,
    fontSize: 14,
    fontWeight: '800',
  },
  restoreButton: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 15,
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
  },
  restoreButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '800',
  },
  secondaryButtonPressed: {
    opacity: 0.7,
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