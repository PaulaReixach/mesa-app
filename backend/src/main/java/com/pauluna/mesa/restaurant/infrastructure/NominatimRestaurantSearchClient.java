package com.pauluna.mesa.restaurant.infrastructure;

import java.net.URI;
import java.time.Duration;
import java.time.Instant;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;
import java.util.function.Function;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.util.UriBuilder;

import com.pauluna.mesa.restaurant.application.RestaurantSearchUnavailableException;

@Component
public class NominatimRestaurantSearchClient {

    private static final Duration CACHE_TTL =
            Duration.ofMinutes(30);

    private static final long MIN_REQUEST_INTERVAL_NANOS =
            Duration.ofSeconds(1).toNanos();

    private static final int MAX_CACHE_ENTRIES = 100;

    private static final int NOMINATIM_RESULT_LIMIT = 40;

    private final RestClient restClient;

    private final Map<String, CachedSearch> cache =
            new ConcurrentHashMap<>();

    private final Object rateLimitMonitor = new Object();

    private long lastRequestStartedAtNanos;

    public NominatimRestaurantSearchClient(
            @Value("${app.restaurant-search.base-url}")
            String baseUrl,
            @Value("${app.restaurant-search.user-agent}")
            String userAgent
    ) {
        this.restClient = RestClient
                .builder()
                .baseUrl(baseUrl)
                .defaultHeader(
                        HttpHeaders.USER_AGENT,
                        userAgent
                )
                .defaultHeader(
                        HttpHeaders.ACCEPT_LANGUAGE,
                        "es"
                )
                .build();
    }

    public List<NominatimPlaceResponse>
    searchPointsOfInterest(String searchTerm) {
        String cacheKey =
                "poi:" + normalizeCacheValue(searchTerm);

        return search(
                cacheKey,
                uriBuilder ->
                        uriBuilder
                                .path("/search")
                                .queryParam(
                                        "q",
                                        searchTerm
                                )
                                .queryParam(
                                        "format",
                                        "jsonv2"
                                )
                                .queryParam(
                                        "addressdetails",
                                        1
                                )
                                .queryParam(
                                        "layer",
                                        "poi"
                                )
                                .queryParam(
                                        "limit",
                                        NOMINATIM_RESULT_LIMIT
                                )
                                .queryParam(
                                        "dedupe",
                                        1
                                )
                                .build()
        );
    }

    public List<NominatimPlaceResponse> searchFlexible(
            String query,
            String city
    ) {
        String normalizedQuery = query.trim();

        String normalizedCity =
                normalizeOptionalValue(city);

        String cacheKey =
                "flexible:"
                        + normalizeCacheValue(normalizedQuery)
                        + ":"
                        + normalizeCacheValue(normalizedCity);

        return search(
                cacheKey,
                uriBuilder ->
                        buildFlexibleSearchUri(
                                uriBuilder,
                                normalizedQuery,
                                normalizedCity
                        )
        );
    }

    private URI buildFlexibleSearchUri(
            UriBuilder uriBuilder,
            String query,
            String city
    ) {
        UriBuilder searchUriBuilder = uriBuilder
                .path("/search")
                .queryParam(
                        "format",
                        "jsonv2"
                )
                .queryParam(
                        "addressdetails",
                        1
                )
                .queryParam(
                        "limit",
                        NOMINATIM_RESULT_LIMIT
                )
                .queryParam(
                        "dedupe",
                        1
                );

        if (city == null) {
            searchUriBuilder.queryParam(
                    "q",
                    query
            );
        } else {
            searchUriBuilder
                    .queryParam(
                            "amenity",
                            query
                    )
                    .queryParam(
                            "city",
                            city
                    );
        }

        return searchUriBuilder.build();
    }

    private List<NominatimPlaceResponse> search(
            String cacheKey,
            Function<UriBuilder, URI> uriFunction
    ) {
        CachedSearch cachedSearch = cache.get(cacheKey);

        if (cachedSearch != null
                && cachedSearch.expiresAt()
                .isAfter(Instant.now())) {
            return cachedSearch.results();
        }

        clearExpiredCacheEntries();
        respectRateLimit();

        try {
            NominatimPlaceResponse[] response = restClient
                    .get()
                    .uri(uriFunction)
                    .retrieve()
                    .body(NominatimPlaceResponse[].class);

            List<NominatimPlaceResponse> results =
                    response == null
                            ? List.of()
                            : List.copyOf(
                                    Arrays.asList(response)
                            );

            cache.put(
                    cacheKey,
                    new CachedSearch(
                            results,
                            Instant.now().plus(CACHE_TTL)
                    )
            );

            return results;
        } catch (RestClientException exception) {
            throw new RestaurantSearchUnavailableException(
                    exception
            );
        }
    }

    private void respectRateLimit() {
        synchronized (rateLimitMonitor) {
            if (lastRequestStartedAtNanos != 0) {
                long elapsedNanos =
                        System.nanoTime()
                                - lastRequestStartedAtNanos;

                long remainingNanos =
                        MIN_REQUEST_INTERVAL_NANOS
                                - elapsedNanos;

                if (remainingNanos > 0) {
                    sleep(remainingNanos);
                }
            }

            lastRequestStartedAtNanos =
                    System.nanoTime();
        }
    }

    private void sleep(long nanoseconds) {
        try {
            TimeUnit.NANOSECONDS.sleep(nanoseconds);
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();

            throw new RestaurantSearchUnavailableException(
                    exception
            );
        }
    }

    private void clearExpiredCacheEntries() {
        Instant now = Instant.now();

        cache.entrySet().removeIf(entry ->
                entry.getValue()
                        .expiresAt()
                        .isBefore(now)
        );

        if (cache.size() >= MAX_CACHE_ENTRIES) {
            cache.clear();
        }
    }

    private String normalizeCacheValue(String value) {
        if (value == null) {
            return "";
        }

        return value
                .trim()
                .toLowerCase(Locale.ROOT);
    }

    private String normalizeOptionalValue(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }

        return value.trim();
    }

    private record CachedSearch(
            List<NominatimPlaceResponse> results,
            Instant expiresAt
    ) {
    }
}