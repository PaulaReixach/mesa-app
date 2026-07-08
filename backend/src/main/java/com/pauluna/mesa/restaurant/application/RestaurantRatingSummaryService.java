package com.pauluna.mesa.restaurant.application;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.pauluna.mesa.restaurant.domain.RestaurantRating;
import com.pauluna.mesa.restaurant.infrastructure.RestaurantRatingRepository;

@Service
@Transactional(readOnly = true)
public class RestaurantRatingSummaryService {

    private final RestaurantRatingRepository ratingRepository;

    public RestaurantRatingSummaryService(
            RestaurantRatingRepository ratingRepository
    ) {
        this.ratingRepository = ratingRepository;
    }

    public Map<UUID, RatingSummary> getSummaries(
            Collection<UUID> groupRestaurantIds
    ) {
        if (groupRestaurantIds.isEmpty()) {
            return Map.of();
        }

        return ratingRepository
                .findAllByGroupRestaurantIdIn(groupRestaurantIds)
                .stream()
                .collect(Collectors.groupingBy(
                        RestaurantRating::getGroupRestaurantId
                ))
                .entrySet()
                .stream()
                .collect(Collectors.toMap(
                        Map.Entry::getKey,
                        entry -> RatingSummary.from(entry.getValue())
                ));
    }

    public RatingSummary getSummary(UUID groupRestaurantId) {
        List<RestaurantRating> ratings = ratingRepository
                .findAllByGroupRestaurantIdOrderByUpdatedAtDesc(
                        groupRestaurantId
                );

        return ratings.isEmpty()
                ? RatingSummary.empty()
                : RatingSummary.from(ratings);
    }

    public record RatingSummary(
            BigDecimal averageScore,
            long ratingsCount
    ) {

        private static RatingSummary from(
                List<RestaurantRating> ratings
        ) {
            double average = ratings
                    .stream()
                    .mapToInt(RestaurantRating::getScore)
                    .average()
                    .orElse(0);

            return new RatingSummary(
                    BigDecimal
                            .valueOf(average)
                            .setScale(1, RoundingMode.HALF_UP),
                    ratings.size()
            );
        }

        public static RatingSummary empty() {
            return new RatingSummary(null, 0);
        }
    }
}
