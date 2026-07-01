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
import { getGroupRestaurant } from '../../../../../services/restaurant-service';
import { colors } from '../../../../../theme/colors';
import { GroupRestaurant } from '../../../../../types/restaurant';

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

  const [isLoading, setIsLoading] =
    useState(true);

  const [loadError, setLoadError] =
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
    ? restaurantStatusPresentation[
        groupRestaurant.status
      ]
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
        && currentStatus
        && accessToken ? (
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
                  {currentStatus.label}
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

            <RestaurantRatingsSection
              accessToken={accessToken}
              groupId={groupId}
              groupRestaurantId={groupRestaurantId}
            />

            <RestaurantStatusSection
              accessToken={accessToken}
              groupId={groupId}
              groupRestaurant={groupRestaurant}
              onUpdated={setGroupRestaurant}
            />
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