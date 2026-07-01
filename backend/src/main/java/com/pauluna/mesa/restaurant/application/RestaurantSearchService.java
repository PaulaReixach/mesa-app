package com.pauluna.mesa.restaurant.application;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
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
    private static final int MAX_RESULTS = 10;

    private static final Set<String> AMENITY_TYPES =
            Set.of(
                    "restaurant",
                    "cafe",
                    "fast_food",
                    "bar",
                    "pub",
                    "food_court",
                    "ice_cream",
                    "biergarten",
                    "canteen",
                    "cafeteria",
                    "juice_bar"
            );

    private static final Set<String> SHOP_TYPES =
            Set.of(
                    "bakery",
                    "deli",
                    "pastry",
                    "confectionery",
                    "coffee",
                    "tea",
                    "chocolate",
                    "cheese",
                    "seafood",
                    "food"
            );

    private static final Set<String> TOURISM_TYPES =
            Set.of(
                    "hotel",
                    "guest_house",
                    "hostel",
                    "resort"
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

        List<RestaurantSearchResponse> primaryResults =
                mapSearchResults(
                        searchClient.searchPointsOfInterest(
                                searchTerm
                        )
                );

        if (primaryResults.size() >= MAX_RESULTS) {
            return primaryResults
                    .stream()
                    .limit(MAX_RESULTS)
                    .toList();
        }

        List<RestaurantSearchResponse> flexibleResults =
                mapSearchResults(
                        searchClient.searchFlexible(
                                normalizedQuery,
                                normalizedCity
                        )
                );

        return mergeResults(
                primaryResults,
                flexibleResults
        );
    }

    private List<RestaurantSearchResponse> mapSearchResults(
            List<NominatimPlaceResponse> places
    ) {
        return places
                .stream()
                .filter(this::isFoodPlace)
                .map(this::toResponse)
                .filter(Objects::nonNull)
                .toList();
    }

    private List<RestaurantSearchResponse> mergeResults(
            List<RestaurantSearchResponse> primaryResults,
            List<RestaurantSearchResponse> flexibleResults
    ) {
        Map<String, RestaurantSearchResponse> uniqueResults =
                new LinkedHashMap<>();

        primaryResults.forEach(result ->
                uniqueResults.putIfAbsent(
                        buildResultKey(result),
                        result
                )
        );

        flexibleResults.forEach(result ->
                uniqueResults.putIfAbsent(
                        buildResultKey(result),
                        result
                )
        );

        return uniqueResults
                .values()
                .stream()
                .limit(MAX_RESULTS)
                .toList();
    }

    private String buildResultKey(
            RestaurantSearchResponse result
    ) {
        return result.provider()
                + ":"
                + result.externalPlaceId();
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
        String type =
                normalizeLowerCase(place.type());

        if (type == null) {
            return false;
        }

        String category =
                normalizeLowerCase(place.category());

        if ("amenity".equals(category)) {
            return AMENITY_TYPES.contains(type);
        }

        if ("shop".equals(category)) {
            return SHOP_TYPES.contains(type);
        }

        if ("tourism".equals(category)) {
            return TOURISM_TYPES.contains(type);
        }

        return AMENITY_TYPES.contains(type)
                || SHOP_TYPES.contains(type)
                || TOURISM_TYPES.contains(type);
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
        String normalizedType =
                normalizeLowerCase(type);

        if (normalizedType == null) {
            return null;
        }

        return switch (normalizedType) {
            case "restaurant" -> "Restaurante";
            case "cafe", "cafeteria" -> "Cafetería";
            case "fast_food" -> "Comida rápida";
            case "bar" -> "Bar";
            case "pub" -> "Pub";
            case "food_court" -> "Zona de restauración";
            case "ice_cream" -> "Heladería";
            case "biergarten" -> "Cervecería";
            case "canteen" -> "Comedor";
            case "juice_bar" -> "Bar de zumos";
            case "bakery" -> "Panadería";
            case "deli" -> "Delicatessen";
            case "pastry" -> "Pastelería";
            case "confectionery" -> "Confitería";
            case "coffee" -> "Café";
            case "tea" -> "Tienda de té";
            case "chocolate" -> "Chocolatería";
            case "cheese" -> "Quesería";
            case "seafood" -> "Marisquería";
            case "food" -> "Alimentación";
            case "hotel" -> "Hotel";
            case "guest_house" -> "Alojamiento";
            case "hostel" -> "Hostal";
            case "resort" -> "Resort";
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

    private String normalizeLowerCase(String value) {
        String normalizedValue =
                normalizeOptional(value);

        if (normalizedValue == null) {
            return null;
        }

        return normalizedValue.toLowerCase(
                Locale.ROOT
        );
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