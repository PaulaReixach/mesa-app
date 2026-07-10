package com.pauluna.mesa.restaurant.application;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.pauluna.mesa.restaurant.api.RestaurantLocationResponse;
import com.pauluna.mesa.restaurant.infrastructure.NominatimPlaceResponse;
import com.pauluna.mesa.restaurant.infrastructure.NominatimRestaurantSearchClient;

@ExtendWith(MockitoExtension.class)
class RestaurantLocationSearchServiceTest {

    @Mock
    private NominatimRestaurantSearchClient searchClient;

    private RestaurantLocationSearchService service;

    @BeforeEach
    void setUp() {
        service = new RestaurantLocationSearchService(searchClient);
    }

    @Test
    void mapsAddressCandidateWithCoordinates() {
        when(searchClient.searchLocations(
                "Carrer Nou, 12, Girona, España"
        )).thenReturn(List.of(
                place(
                        "Carrer Nou, 12, Girona, Catalunya, España",
                        "41.983123",
                        "2.824456"
                )
        ));

        List<RestaurantLocationResponse> results = service.search(
                "Carrer Nou, 12",
                "Girona",
                "España"
        );

        assertEquals(1, results.size());
        assertEquals("Carrer Nou, 12", results.get(0).address());
        assertEquals("Girona", results.get(0).city());
        assertEquals("España", results.get(0).country());
        assertEquals("41.983123", results.get(0).latitude().toPlainString());
        assertEquals("2.824456", results.get(0).longitude().toPlainString());
    }

    @Test
    void rejectsSearchWithoutAddressCityOrCountry() {
        assertThrows(
                InvalidRestaurantSearchException.class,
                () -> service.search(" ", null, "")
        );
    }

    @Test
    void ignoresCandidatesWithoutValidCoordinates() {
        when(searchClient.searchLocations("Girona")).thenReturn(List.of(
                place(
                        "Girona, Catalunya, España",
                        "invalid",
                        "2.824456"
                )
        ));

        List<RestaurantLocationResponse> results = service.search(
                null,
                "Girona",
                null
        );

        assertEquals(List.of(), results);
    }

    private NominatimPlaceResponse place(
            String displayName,
            String latitude,
            String longitude
    ) {
        return new NominatimPlaceResponse(
                "node",
                123L,
                "Carrer Nou",
                displayName,
                latitude,
                longitude,
                "place",
                "house",
                new NominatimPlaceResponse.Address(
                        "12",
                        "Carrer Nou",
                        null,
                        "Girona",
                        null,
                        null,
                        null,
                        null,
                        "España"
                )
        );
    }
}
