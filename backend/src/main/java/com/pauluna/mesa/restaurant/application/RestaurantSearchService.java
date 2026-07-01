package com.pauluna.mesa.restaurant.application;

import java.math.BigDecimal;
import java.util.List;
import java.util.Locale;
import java.util.Objects;
import java.util.Set;

import org.springframework.stereotype.Service;

import com.pauluna.mesa.restaurant.api.RestaurantSearchResponse;
import com.pauluna.mesa.restaurant.infrastructure.NominatimPlaceResponse;
import com.pauluna.mesa.restaurant.infrastructure.NominatimRestaurantSearchClient;

@Service
public class RestaurantSearchService {

    private static final String PROVIDER =
            "OPENSTREETMAP";

    private static final int MAX_QUERY_LENGTH = 150;
    private static final int MAX_CITY_LENGTH = 100;

    private static final Set<String> FOOD_PLACE_TYPES =
            Set.of(
                    "restaurant",
                    "cafe",
                    "fast_food",
                    "bar",
                    "pub",
                    "food_court",
                    "ice_cream",
                    "biergarten",
                    "bakery",
                    "deli",
                    "pastry"
            );

    private final NominatimRestaurantSearchClient searchClient;

    public RestaurantSearchService(
            NominatimRestaurantSearchClient searchClient
    ) {
        this.searchClient = searchClient;
    }

    public List<RestaurantSearchResponse> search(
            String query,
            String city
    ) {
        String normalizedQuery =
                normalizeRequiredQuery(query);

        String normalizedCity =
                normalizeOptionalCity(city);

        String searchTerm = normalizedCity == null
                ? normalizedQuery
                : normalizedQuery
                        + ", "
                        + normalizedCity;

        return searchClient
                .search(searchTerm)
                .stream()
                .filter(this::isFoodPlace)
                .map(this::toResponse)
                .filter(Objects::nonNull)
                .distinct()
                .limit(8)
                .toList();
    }

    private RestaurantSearchResponse toResponse(
            NominatimPlaceResponse place
    ) {
        String externalPlaceId =
                buildExternalPlaceId(place);

        BigDecimal latitude =
                parseCoordinate(place.lat());

        BigDecimal longitude =
                parseCoordinate(place.lon());

        String name = firstNonBlank(
                place.name(),
                firstDisplayNamePart(place.displayName())
        );

        if (externalPlaceId == null
                || latitude == null
                || longitude == null
                || name == null) {
            return null;
        }

        NominatimPlaceResponse.Address address =
                place.address();

        String road = address == null
                ? null
                : firstNonBlank(
                        address.road(),
                        address.pedestrian()
                );

        String houseNumber = address == null
                ? null
                : normalizeOptional(
                        address.houseNumber()
                );

        String streetAddress =
                buildStreetAddress(
                        road,
                        houseNumber
                );

        String city = address == null
                ? null
                : firstNonBlank(
                        address.city(),
                        address.town(),
                        address.village(),
                        address.municipality(),
                        address.county()
                );

        String country = address == null
                ? null
                : normalizeOptional(
                        address.country()
                );

        return new RestaurantSearchResponse(
                PROVIDER,
                externalPlaceId,
                truncate(name, 150),
                truncate(streetAddress, 300),
                truncate(city, 100),
                truncate(country, 100),
                latitude,
                longitude,
                categoryLabel(place.type())
        );
    }

    private boolean isFoodPlace(
            NominatimPlaceResponse place
    ) {
        String type = normalizeOptional(place.type());

        return type != null
                && FOOD_PLACE_TYPES.contains(
                        type.toLowerCase(Locale.ROOT)
                );
    }

    private String buildExternalPlaceId(
            NominatimPlaceResponse place
    ) {
        if (place.osmType() == null
                || place.osmId() == null) {
            return null;
        }

        String prefix = switch (
                place.osmType()
                        .toLowerCase(Locale.ROOT)
        ) {
            case "node" -> "N";
            case "way" -> "W";
            case "relation" -> "R";
            default -> null;
        };

        return prefix == null
                ? null
                : prefix + place.osmId();
    }

    private String buildStreetAddress(
            String road,
            String houseNumber
    ) {
        if (road == null) {
            return null;
        }

        return houseNumber == null
                ? road
                : road + ", " + houseNumber;
    }

    private String categoryLabel(String type) {
        if (type == null) {
            return null;
        }

        return switch (
                type.toLowerCase(Locale.ROOT)
        ) {
            case "restaurant" -> "Restaurante";
            case "cafe" -> "Cafetería";
            case "fast_food" -> "Comida rápida";
            case "bar" -> "Bar";
            case "pub" -> "Pub";
            case "food_court" -> "Zona de restauración";
            case "ice_cream" -> "Heladería";
            case "biergarten" -> "Cervecería";
            case "bakery" -> "Panadería";
            case "deli" -> "Delicatessen";
            case "pastry" -> "Pastelería";
            default -> "Restauración";
        };
    }

    private String normalizeRequiredQuery(String query) {
        if (query == null || query.isBlank()) {
            throw new InvalidRestaurantSearchException(
                    "Introduce el nombre del restaurante."
            );
        }

        String normalizedQuery = query.trim();

        if (normalizedQuery.length() < 2) {
            throw new InvalidRestaurantSearchException(
                    "La búsqueda debe contener al menos "
                            + "dos caracteres."
            );
        }

        if (normalizedQuery.length()
                > MAX_QUERY_LENGTH) {
            throw new InvalidRestaurantSearchException(
                    "La búsqueda no puede superar los "
                            + MAX_QUERY_LENGTH
                            + " caracteres."
            );
        }

        return normalizedQuery;
    }

    private String normalizeOptionalCity(String city) {
        String normalizedCity =
                normalizeOptional(city);

        if (normalizedCity != null
                && normalizedCity.length()
                > MAX_CITY_LENGTH) {
            throw new InvalidRestaurantSearchException(
                    "La ciudad no puede superar los "
                            + MAX_CITY_LENGTH
                            + " caracteres."
            );
        }

        return normalizedCity;
    }

    private String normalizeOptional(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }

        return value.trim();
    }

    private String firstNonBlank(String... values) {
        for (String value : values) {
            String normalizedValue =
                    normalizeOptional(value);

            if (normalizedValue != null) {
                return normalizedValue;
            }
        }

        return null;
    }

    private String firstDisplayNamePart(
            String displayName
    ) {
        String normalizedDisplayName =
                normalizeOptional(displayName);

        if (normalizedDisplayName == null) {
            return null;
        }

        int commaPosition =
                normalizedDisplayName.indexOf(',');

        if (commaPosition < 0) {
            return normalizedDisplayName;
        }

        return normalizedDisplayName
                .substring(0, commaPosition)
                .trim();
    }

    private BigDecimal parseCoordinate(String value) {
        String normalizedValue =
                normalizeOptional(value);

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
        if (value == null
                || value.length() <= maximumLength) {
            return value;
        }

        return value
                .substring(0, maximumLength)
                .trim();
    }
}