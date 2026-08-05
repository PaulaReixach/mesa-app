import {
  useCallback,
  useEffect,
  useState,
} from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { getErrorMessage, resolveApiUrl } from '../lib/api';
import {
  deleteRestaurantRating,
  getRestaurantRatings,
  saveRestaurantRating,
} from '../services/restaurant-rating-service';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import type { RestaurantRatingsSummary } from '../types/restaurant-rating';

type RestaurantRatingsSectionProps = {
  groupId: string;
  groupRestaurantId: string;
  accessToken: string;
  onEnsureVisited?: () => Promise<boolean>;
};

const scores = [1, 2, 3, 4, 5];

export function RestaurantRatingsSection({
  groupId,
  groupRestaurantId,
  accessToken,
  onEnsureVisited,
}: RestaurantRatingsSectionProps) {
  const [summary, setSummary] =
    useState<RestaurantRatingsSummary | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [savingScore, setSavingScore] =
    useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
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

      if (onEnsureVisited && !await onEnsureVisited()) {
        return;
      }

      const response = await saveRestaurantRating(
        groupId,
        groupRestaurantId,
        { score },
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

  const currentUserScore = summary?.currentUserScore ?? null;
  const formattedAverage = summary?.averageScore == null
    ? null
    : summary.averageScore.toFixed(1).replace('.', ',');

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>
        Valoraciones
      </Text>

      {isLoading ? (
        <View style={styles.loadingRow}>
          <ActivityIndicator color={colors.primary} size="small" />
          <Text style={styles.loadingText}>
            Cargando valoraciones...
          </Text>
        </View>
      ) : null}

      {!isLoading && summary ? (
        <>
          <View style={styles.summaryRow}>
            <View style={styles.summaryIcon}>
              <Text style={styles.summaryIconText}>★</Text>
            </View>
            <View style={styles.summaryCopy}>
              <Text style={styles.summaryLabel}>Media del grupo</Text>
              {formattedAverage ? (
                <View style={styles.summaryScoreRow}>
                  <Text style={styles.summaryScore}>{formattedAverage}</Text>
                  <Text style={styles.summaryMaximum}>/ 5</Text>
                  <Text style={styles.summaryCount}>
                    · {summary.ratingsCount}{' '}
                    {summary.ratingsCount === 1 ? 'valoración' : 'valoraciones'}
                  </Text>
                </View>
              ) : (
                <View style={styles.noRatingsCopy}>
                  <Text style={styles.noRatings}>
                    Sin valoraciones todavía
                  </Text>
                  <Text style={styles.noRatingsHint}>
                    Sé la primera persona del grupo en puntuarlo.
                  </Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.myRating}>
            <View style={styles.myRatingHeading}>
              <View style={styles.myRatingCopy}>
                <Text style={styles.myRatingTitle}>Tu valoración</Text>
                <Text style={styles.myRatingDescription}>
                  Pulsa una estrella para guardar.
                </Text>
              </View>
              {currentUserScore !== null ? (
                <Text style={styles.myScore}>{currentUserScore}/5</Text>
              ) : null}
            </View>

            <View style={styles.stars}>
              {scores.map(score => {
                const selected = currentUserScore !== null
                  && score <= currentUserScore;
                const isSaving = savingScore === score;

                return (
                  <Pressable
                    accessibilityLabel={`Valorar con ${score} estrellas`}
                    accessibilityRole="button"
                    disabled={savingScore !== null || isDeleting}
                    key={score}
                    onPress={() => void handleSaveScore(score)}
                    style={({ pressed }) => [
                      styles.starButton,
                      pressed ? styles.pressed : null,
                    ]}
                  >
                    {isSaving ? (
                      <ActivityIndicator color={colors.primary} size="small" />
                    ) : (
                      <Text
                        style={[
                          styles.star,
                          selected ? styles.selectedStar : null,
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
                style={({ pressed }) => pressed ? styles.pressed : null}
              >
                {isDeleting ? (
                  <ActivityIndicator color={colors.danger} size="small" />
                ) : (
                  <Text style={styles.deleteRatingText}>
                    Quitar mi valoración
                  </Text>
                )}
              </Pressable>
            ) : null}
          </View>

          {summary.ratings.length > 0 ? (
            <View style={styles.memberRatings}>
              <Text style={styles.memberRatingsTitle}>
                Opiniones del grupo
              </Text>

              <View style={styles.memberRatingsList}>
                {summary.ratings.map((rating, index) => {
                  const avatarUri = rating.avatarUrl
                    ? resolveApiUrl(rating.avatarUrl)
                    : null;

                  return (
                    <View key={rating.id}>
                      <View style={styles.memberRating}>
                        <View style={styles.avatar}>
                          {avatarUri ? (
                            <Image
                              source={{ uri: avatarUri }}
                              style={styles.avatarImage}
                            />
                          ) : (
                            <Text style={styles.avatarText}>
                              {rating.name.charAt(0).toUpperCase()}
                            </Text>
                          )}
                        </View>

                        <View style={styles.memberContent}>
                          <View style={styles.memberNameRow}>
                            <Text style={styles.memberName}>
                              {rating.name}
                            </Text>
                            {rating.currentUser ? (
                              <Text style={styles.youText}>Tú</Text>
                            ) : null}
                          </View>
                          <Text style={styles.username}>
                            @{rating.username}
                          </Text>
                        </View>

                        <View style={styles.memberScore}>
                          <Text style={styles.memberScoreStar}>★</Text>
                          <Text style={styles.memberScoreText}>
                            {rating.score}
                          </Text>
                        </View>
                      </View>

                      {index < summary.ratings.length - 1 ? (
                        <View style={styles.memberDivider} />
                      ) : null}
                    </View>
                  );
                })}
              </View>
            </View>
          ) : null}
        </>
      ) : null}

      {errorMessage ? (
        <View style={styles.errorCard}>
          <Text style={styles.errorText}>{errorMessage}</Text>
          {!summary ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => void loadRatings()}
            >
              <Text style={styles.retryText}>Volver a intentar</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 12,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 17,
    fontFamily: fonts.bold,
  },
  loadingRow: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  loadingText: {
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 11,
  },
  summaryRow: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    paddingVertical: 9,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  summaryIcon: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: '#F7E8D2',
  },
  summaryIconText: {
    color: '#C6841C',
    fontFamily: fonts.regular,
    fontSize: 21,
  },
  summaryCopy: {
    flex: 1,
    gap: 2,
  },
  summaryLabel: {
    color: colors.muted,
    fontSize: 9,
    fontFamily: fonts.bold,
    textTransform: 'uppercase',
  },
  summaryScoreRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    flexWrap: 'wrap',
    gap: 3,
  },
  summaryScore: {
    color: colors.text,
    fontSize: 21,
    fontFamily: fonts.bold,
  },
  summaryMaximum: {
    color: colors.muted,
    fontSize: 11,
    fontFamily: fonts.bold,
  },
  summaryCount: {
    color: colors.muted,
    fontSize: 10,
    fontFamily: fonts.regular,
  },
  noRatings: {
    color: colors.text,
    fontSize: 13,
    fontFamily: fonts.bold,
  },
  noRatingsCopy: {
    gap: 2,
  },
  noRatingsHint: {
    color: colors.muted,
    fontSize: 9,
    lineHeight: 13,
    fontFamily: fonts.regular,
  },
  myRating: {
    gap: 10,
    paddingVertical: 13,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  myRatingHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  myRatingCopy: {
    flex: 1,
    gap: 2,
  },
  myRatingTitle: {
    color: colors.text,
    fontSize: 13,
    fontFamily: fonts.bold,
  },
  myRatingDescription: {
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 10,
  },
  myScore: {
    color: colors.text,
    fontSize: 12,
    fontFamily: fonts.bold,
  },
  stars: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 3,
  },
  starButton: {
    flex: 1,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  star: {
    color: '#C9BEB8',
    fontFamily: fonts.regular,
    fontSize: 30,
    lineHeight: 34,
  },
  selectedStar: {
    color: '#E6A72E',
  },
  deleteRatingText: {
    color: colors.muted,
    fontSize: 9,
    fontFamily: fonts.regular,
    textAlign: 'center',
  },
  memberRatings: {
    gap: 7,
  },
  memberRatingsTitle: {
    color: colors.text,
    fontSize: 13,
    fontFamily: fonts.bold,
  },
  memberRatingsList: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  memberRating: {
    minHeight: 55,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
  },
  avatar: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: 18,
    backgroundColor: colors.surfaceMuted,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarText: {
    color: colors.mutedStrong,
    fontSize: 13,
    fontFamily: fonts.bold,
  },
  memberContent: {
    flex: 1,
    gap: 1,
  },
  memberNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  memberName: {
    color: colors.text,
    fontSize: 12,
    fontFamily: fonts.bold,
  },
  username: {
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 10,
  },
  youText: {
    color: colors.primary,
    fontSize: 9,
    fontFamily: fonts.bold,
  },
  memberScore: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  memberScoreStar: {
    color: '#E6A72E',
    fontFamily: fonts.regular,
    fontSize: 15,
  },
  memberScoreText: {
    color: colors.text,
    fontSize: 13,
    fontFamily: fonts.bold,
  },
  memberDivider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 46,
    backgroundColor: colors.border,
  },
  pressed: {
    opacity: 0.64,
  },
  errorCard: {
    gap: 7,
    borderWidth: 1,
    borderColor: '#F3C5BC',
    borderRadius: 14,
    backgroundColor: '#FFF1EE',
    padding: 12,
  },
  errorText: {
    color: colors.danger,
    fontFamily: fonts.regular,
    fontSize: 11,
    lineHeight: 16,
  },
  retryText: {
    color: colors.primary,
    fontSize: 11,
    fontFamily: fonts.bold,
  },
});
