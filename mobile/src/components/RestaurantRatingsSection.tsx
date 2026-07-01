import {
  useCallback,
  useEffect,
  useState,
} from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { getErrorMessage } from '../lib/api';
import {
  deleteRestaurantRating,
  getRestaurantRatings,
  saveRestaurantRating,
} from '../services/restaurant-rating-service';
import { colors } from '../theme/colors';
import { RestaurantRatingsSummary } from '../types/restaurant-rating';

type RestaurantRatingsSectionProps = {
  groupId: string;
  groupRestaurantId: string;
  accessToken: string;
};

const scores = [1, 2, 3, 4, 5];

export function RestaurantRatingsSection({
  groupId,
  groupRestaurantId,
  accessToken,
}: RestaurantRatingsSectionProps) {
  const [summary, setSummary] =
    useState<RestaurantRatingsSummary | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  const [savingScore, setSavingScore] =
    useState<number | null>(null);

  const [isDeleting, setIsDeleting] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  const loadRatings = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      const response = await getRestaurantRatings(
        groupId,
        groupRestaurantId,
        accessToken,
      );

      setSummary(response);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, [
    accessToken,
    groupId,
    groupRestaurantId,
  ]);

  useEffect(() => {
    void loadRatings();
  }, [loadRatings]);

  async function handleSaveScore(score: number) {
    if (savingScore !== null || isDeleting) {
      return;
    }

    try {
      setSavingScore(score);
      setErrorMessage(null);

      const response = await saveRestaurantRating(
        groupId,
        groupRestaurantId,
        {
          score,
        },
        accessToken,
      );

      setSummary(response);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setSavingScore(null);
    }
  }

  async function handleDeleteRating() {
    try {
      setIsDeleting(true);
      setErrorMessage(null);

      const response = await deleteRestaurantRating(
        groupId,
        groupRestaurantId,
        accessToken,
      );

      setSummary(response);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsDeleting(false);
    }
  }

  function confirmDeleteRating() {
    Alert.alert(
      'Eliminar valoración',
      '¿Quieres borrar tu valoración de este restaurante?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            void handleDeleteRating();
          },
        },
      ],
    );
  }

  const currentUserScore =
    summary?.currentUserScore ?? null;

  const formattedAverage =
    summary?.averageScore == null
      ? null
      : summary.averageScore
          .toFixed(1)
          .replace('.', ',');

  return (
    <View style={styles.section}>
      <View style={styles.heading}>
        <Text style={styles.sectionTitle}>
          Valoraciones
        </Text>

        <Text style={styles.sectionDescription}>
          Cada miembro puede añadir su propia puntuación.
        </Text>
      </View>

      {isLoading ? (
        <View style={styles.loadingCard}>
          <ActivityIndicator
            color={colors.primary}
            size="small"
          />

          <Text style={styles.loadingText}>
            Cargando valoraciones...
          </Text>
        </View>
      ) : null}

      {!isLoading && summary ? (
        <>
          <View style={styles.averageCard}>
            <View style={styles.averageIcon}>
              <Text style={styles.averageIconText}>
                ★
              </Text>
            </View>

            <View style={styles.averageContent}>
              <Text style={styles.averageLabel}>
                Media del grupo
              </Text>

              {formattedAverage ? (
                <View style={styles.averageRow}>
                  <Text style={styles.averageScore}>
                    {formattedAverage}
                  </Text>

                  <Text style={styles.averageMaximum}>
                    / 5
                  </Text>
                </View>
              ) : (
                <Text style={styles.noRatings}>
                  Todavía no hay valoraciones
                </Text>
              )}

              {summary.ratingsCount > 0 ? (
                <Text style={styles.ratingsCount}>
                  {summary.ratingsCount}{' '}
                  {summary.ratingsCount === 1
                    ? 'valoración'
                    : 'valoraciones'}
                </Text>
              ) : null}
            </View>
          </View>

          <View style={styles.myRatingCard}>
            <View style={styles.myRatingHeading}>
              <View style={styles.myRatingTitleContainer}>
                <Text style={styles.myRatingTitle}>
                  Tu valoración
                </Text>

                <Text style={styles.myRatingDescription}>
                  Pulsa una estrella para guardar.
                </Text>
              </View>

              {currentUserScore !== null ? (
                <Text style={styles.myScore}>
                  {currentUserScore}/5
                </Text>
              ) : null}
            </View>

            <View style={styles.stars}>
              {scores.map((score) => {
                const selected =
                  currentUserScore !== null
                  && score <= currentUserScore;

                const isSaving =
                  savingScore === score;

                return (
                  <Pressable
                    accessibilityLabel={`Valorar con ${score} estrellas`}
                    accessibilityRole="button"
                    disabled={
                      savingScore !== null
                      || isDeleting
                    }
                    key={score}
                    onPress={() => {
                      void handleSaveScore(score);
                    }}
                    style={({ pressed }) => [
                      styles.starButton,
                      pressed
                        ? styles.starButtonPressed
                        : null,
                    ]}
                  >
                    {isSaving ? (
                      <ActivityIndicator
                        color={colors.primary}
                        size="small"
                      />
                    ) : (
                      <Text
                        style={[
                          styles.star,
                          selected
                            ? styles.selectedStar
                            : null,
                        ]}
                      >
                        {selected ? '★' : '☆'}
                      </Text>
                    )}
                  </Pressable>
                );
              })}
            </View>

            {currentUserScore !== null ? (
              <Pressable
                accessibilityRole="button"
                disabled={isDeleting}
                onPress={confirmDeleteRating}
              >
                {isDeleting ? (
                  <ActivityIndicator
                    color={colors.danger}
                    size="small"
                  />
                ) : (
                  <Text style={styles.deleteRatingText}>
                    Eliminar mi valoración
                  </Text>
                )}
              </Pressable>
            ) : null}
          </View>

          {summary.ratings.length > 0 ? (
            <View style={styles.memberRatings}>
              <Text style={styles.memberRatingsTitle}>
                Valoraciones del grupo
              </Text>

              <View style={styles.memberRatingsList}>
                {summary.ratings.map((rating) => (
                  <View
                    key={rating.id}
                    style={styles.memberRating}
                  >
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>
                        {rating.name
                          .charAt(0)
                          .toUpperCase()}
                      </Text>
                    </View>

                    <View style={styles.memberContent}>
                      <View style={styles.memberNameRow}>
                        <Text style={styles.memberName}>
                          {rating.name}
                        </Text>

                        {rating.currentUser ? (
                          <View style={styles.youBadge}>
                            <Text style={styles.youBadgeText}>
                              Tú
                            </Text>
                          </View>
                        ) : null}
                      </View>

                      <Text style={styles.username}>
                        @{rating.username}
                      </Text>
                    </View>

                    <View style={styles.memberScore}>
                      <Text style={styles.memberScoreStar}>
                        ★
                      </Text>

                      <Text style={styles.memberScoreText}>
                        {rating.score}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          ) : null}
        </>
      ) : null}

      {errorMessage ? (
        <View style={styles.errorCard}>
          <Text style={styles.errorText}>
            {errorMessage}
          </Text>

          {!summary ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                void loadRatings();
              }}
            >
              <Text style={styles.retryText}>
                Volver a intentar
              </Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 14,
  },
  heading: {
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
  loadingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    backgroundColor: colors.surface,
    padding: 20,
  },
  loadingText: {
    color: colors.muted,
    fontSize: 14,
  },
  averageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    backgroundColor: colors.surface,
    padding: 18,
  },
  averageIcon: {
    width: 58,
    height: 58,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 19,
    backgroundColor: '#F7E8D2',
  },
  averageIconText: {
    color: '#C6841C',
    fontSize: 29,
  },
  averageContent: {
    flex: 1,
    gap: 3,
  },
  averageLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  averageRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  averageScore: {
    color: colors.text,
    fontSize: 29,
    fontWeight: '800',
  },
  averageMaximum: {
    color: colors.muted,
    fontSize: 15,
    fontWeight: '700',
  },
  noRatings: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
  },
  ratingsCount: {
    color: colors.muted,
    fontSize: 13,
  },
  myRatingCard: {
    gap: 16,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    backgroundColor: colors.surface,
    padding: 18,
  },
  myRatingHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  myRatingTitleContainer: {
    flex: 1,
    gap: 4,
  },
  myRatingTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '800',
  },
  myRatingDescription: {
    color: colors.muted,
    fontSize: 12,
  },
  myScore: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '800',
  },
  stars: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 5,
  },
  starButton: {
    flex: 1,
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  starButtonPressed: {
    opacity: 0.65,
  },
  star: {
    color: '#C9BEB8',
    fontSize: 36,
    lineHeight: 42,
  },
  selectedStar: {
    color: '#E6A72E',
  },
  deleteRatingText: {
    color: colors.danger,
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  memberRatings: {
    gap: 11,
  },
  memberRatingsTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '800',
  },
  memberRatingsList: {
    gap: 9,
  },
  memberRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 17,
    backgroundColor: colors.surface,
    padding: 13,
  },
  avatar: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: '#F7D9CF',
  },
  avatarText: {
    color: colors.primary,
    fontSize: 17,
    fontWeight: '800',
  },
  memberContent: {
    flex: 1,
    gap: 2,
  },
  memberNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  memberName: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '800',
  },
  username: {
    color: colors.muted,
    fontSize: 12,
  },
  youBadge: {
    borderRadius: 999,
    backgroundColor: '#F7D9CF',
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  youBadgeText: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: '800',
  },
  memberScore: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  memberScoreStar: {
    color: '#E6A72E',
    fontSize: 18,
  },
  memberScoreText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  errorCard: {
    gap: 8,
    borderWidth: 1,
    borderColor: '#F3C5BC',
    borderRadius: 16,
    backgroundColor: '#FFF1EE',
    padding: 14,
  },
  errorText: {
    color: colors.danger,
    fontSize: 13,
    lineHeight: 19,
  },
  retryText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '800',
  },
});