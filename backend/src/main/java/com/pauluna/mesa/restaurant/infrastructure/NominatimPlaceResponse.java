package com.pauluna.mesa.restaurant.infrastructure;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public record NominatimPlaceResponse(

        @JsonProperty("osm_type")
        String osmType,

        @JsonProperty("osm_id")
        Long osmId,

        String name,

        @JsonProperty("display_name")
        String displayName,

        String lat,

        String lon,

        @JsonAlias("class")
        String category,

        String type,

        Address address
) {

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Address(

            @JsonProperty("house_number")
            String houseNumber,

            String road,

            String pedestrian,

            String city,

            String town,

            String village,

            String municipality,

            String county,

            String country
    ) {
    }
}