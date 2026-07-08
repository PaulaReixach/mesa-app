package com.pauluna.mesa.restaurant.application;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.pauluna.mesa.restaurant.application.RestaurantRatingSummaryService.RatingSummary;
import com.pauluna.mesa.restaurant.domain.RestaurantRating;
import com.pauluna.mesa.restaurant.infrastructure.RestaurantRatingRepository;

@ExtendWith(MockitoExtension.class)
class RestaurantRatingSummaryServiceTest {

    private static final UUID FIRST_RESTAURANT_ID = UUID.randomUUID();
    private static final UUID SECOND_RESTAURANT_ID = UUID.randomUUID();

    @Mock
    private RestaurantRatingRepository ratingRepository;

    private RestaurantRatingSummaryService service;

    @BeforeEach
    void setUp() {
        service = new RestaurantRatingSummaryService(ratingRepository);
    }

    @Test
    void calculatesAverageAndCountForEveryRestaurant() {
        RestaurantRating firstRating = rating(FIRST_RESTAURANT_ID, 4);
        RestaurantRating secondRating = rating(FIRST_RESTAURANT_ID, 5);
        RestaurantRating thirdRating = rating(SECOND_RESTAURANT_ID, 3);

        when(ratingRepository.findAllByGroupRestaurantIdIn(
                List.of(FIRST_RESTAURANT_ID, SECOND_RESTAURANT_ID)
        )).thenReturn(List.of(firstRating, secondRating, thirdRating));

        Map<UUID, RatingSummary> summaries = service.getSummaries(
                List.of(FIRST_RESTAURANT_ID, SECOND_RESTAURANT_ID)
        );

        assertEquals(
                "4.5",
                summaries.get(FIRST_RESTAURANT_ID)
                        .averageScore()
                        .toPlainString()
        );
        assertEquals(
                2,
                summaries.get(FIRST_RESTAURANT_ID).ratingsCount()
        );
        assertEquals(
                "3.0",
                summaries.get(SECOND_RESTAURANT_ID)
                        .averageScore()
                        .toPlainString()
        );
        assertEquals(
                1,
                summaries.get(SECOND_RESTAURANT_ID).ratingsCount()
        );
    }

    @Test
    void returnsEmptySummaryWhenRestaurantHasNoRatings() {
        when(ratingRepository
                .findAllByGroupRestaurantIdOrderByUpdatedAtDesc(
                        FIRST_RESTAURANT_ID
                ))
                .thenReturn(List.of());

        RatingSummary summary = service.getSummary(FIRST_RESTAURANT_ID);

        assertNull(summary.averageScore());
        assertEquals(0, summary.ratingsCount());
    }

    private RestaurantRating rating(
            UUID groupRestaurantId,
            int score
    ) {
        RestaurantRating rating = mock(RestaurantRating.class);
        when(rating.getGroupRestaurantId()).thenReturn(groupRestaurantId);
        when(rating.getScore()).thenReturn(score);
        return rating;
    }
}
