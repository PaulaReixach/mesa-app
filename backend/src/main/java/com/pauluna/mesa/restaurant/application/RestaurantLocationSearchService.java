package com.pauluna.mesa.restaurant.application;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

import org.springframework.stereotype.Service;

import com.pauluna.mesa.restaurant.api.RestaurantLocationResponse;
import com.pauluna.mesa.restaurant.infrastructure.NominatimPlaceResponse;
import com.pauluna.mesa.restaurant.infrastructure.NominatimRestaurantSearchClient;

@Service
public class RestaurantLocationSearchService {

    private static final int MAX_ADDRESS_LENGTH = 300;
    private static final int MAX_CITY_LENGTH = 100;
    private static final int MAX_COUNTRY_LENGTH = 100;
    private static final int MAX_RESULTS = 5;

    private final NominatimRestaurantSearchClient searchClient;

    public RestaurantLocationSearchService(
            NominatimRestaurantSearchClient searchClient
    ) {
        this.searchClient = searchClient;
    }

    public List<RestaurantLocationResponse> search(
            String address,
            String city,
            String country
    ) {
        String normalizedAddress = normalizeOptional(
                address,
                MAX_ADDRESS_LENGTH,
                "La dirección"
        );
        String normalizedCity = normalizeOptional(
                city,
                MAX_CITY_LENGTH,
                "La ciudad"
        );
        String normalizedCountry = normalizeOptional(
                country,
                MAX_COUNTRY_LENGTH,
                "El país"
        );

        if (normalizedAddress == null
                && normalizedCity == null
                && normalizedCountry == null) {
            throw new InvalidRestaurantSearchException(
                    "Introduce una dirección o una ciudad para buscar la ubicación."
            );
        }

        String searchTerm = String.join(
                ", ",
                List.of(
                                normalizedAddress,
                                normalizedCity,
                                normalizedCountry
                        )
                        .stream()
                        .filter(Objects::nonNull)
                        .toList()
        );

        Map<String, RestaurantLocationResponse> uniqueResults =
                new LinkedHashMap<>();

        searchClient
                .searchLocations(searchTerm)
                .stream()
                .map(this::toResponse)
                .filter(Objects::nonNull)
                .forEach(result -> uniqueResults.putIfAbsent(
                        result.latitude() + ":" + result.longitude(),
                        result
                ));

        return uniqueResults
                .values()
                .stream()
                .limit(MAX_RESULTS)
                .toList();
    }

    private RestaurantLocationResponse toResponse(
            NominatimPlaceResponse place
    ) {
        BigDecimal latitude = parseCoordinate(place.lat());
        BigDecimal longitude = parseCoordinate(place.lon());
        String label = normalizeOptionalValue(place.displayName());

        if (latitude == null
                || longitude == null
                || label == null) {
            return null;
        }

        NominatimPlaceResponse.Address placeAddress = place.address();

        String road = placeAddress == null
                ? null
                : firstNonBlank(
                        placeAddress.road(),
                        placeAddress.pedestrian()
                );

        String streetAddress = buildStreetAddress(
                road,
                placeAddress == null
                        ? null
                        : placeAddress.houseNumber()
        );

        String city = placeAddress == null
                ? null
                : firstNonBlank(
                        placeAddress.city(),
                        placeAddress.town(),
                        placeAddress.village(),
                        placeAddress.municipality(),
                        placeAddress.county()
                );

        String country = placeAddress == null
                ? null
                : normalizeOptionalValue(placeAddress.country());

        return new RestaurantLocationResponse(
                truncate(label, 300),
                truncate(streetAddress, 300),
                truncate(city, 100),
                truncate(country, 100),
                latitude,
                longitude
        );
    }

    private String buildStreetAddress(
            String road,
            String houseNumber
    ) {
        String normalizedRoad = normalizeOptionalValue(road);
        String normalizedHouseNumber =
                normalizeOptionalValue(houseNumber);

        if (normalizedRoad == null) {
            return null;
        }

        return normalizedHouseNumber == null
                ? normalizedRoad
                : normalizedRoad + ", " + normalizedHouseNumber;
    }

    private String normalizeOptional(
            String value,
            int maximumLength,
            String fieldLabel
    ) {
        String normalizedValue = normalizeOptionalValue(value);

        if (normalizedValue != null
                && normalizedValue.length() > maximumLength) {
            throw new InvalidRestaurantSearchException(
                    fieldLabel
                            + " no puede superar los "
                            + maximumLength
                            + " caracteres."
            );
        }

        return normalizedValue;
    }

    private String normalizeOptionalValue(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }

        return value.trim();
    }

    private String firstNonBlank(String... values) {
        for (String value : values) {
            String normalizedValue = normalizeOptionalValue(value);

            if (normalizedValue != null) {
                return normalizedValue;
            }
        }

        return null;
    }

    private BigDecimal parseCoordinate(String value) {
        String normalizedValue = normalizeOptionalValue(value);

        if (normalizedValue == null) {
            return null;
        }

        try {
            return new BigDecimal(normalizedValue);
        } catch (NumberFormatException exception) {
            return null;
        }
    }

    private String truncate(
            String value,
            int maximumLength
    ) {
        if (value == null || value.length() <= maximumLength) {
            return value;
        }

        return value
                .substring(0, maximumLength)
                .trim();
    }
}
