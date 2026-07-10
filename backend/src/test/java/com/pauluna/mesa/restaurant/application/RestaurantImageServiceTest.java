package com.pauluna.mesa.restaurant.application;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicReference;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.server.ResponseStatusException;

import com.pauluna.mesa.group.application.GroupService;
import com.pauluna.mesa.restaurant.api.GroupRestaurantResponse;
import com.pauluna.mesa.restaurant.domain.GroupRestaurant;
import com.pauluna.mesa.restaurant.domain.GroupRestaurantStatus;
import com.pauluna.mesa.restaurant.domain.Restaurant;
import com.pauluna.mesa.restaurant.domain.RestaurantImage;
import com.pauluna.mesa.restaurant.infrastructure.GroupRestaurantRepository;
import com.pauluna.mesa.restaurant.infrastructure.RestaurantImageRepository;
import com.pauluna.mesa.restaurant.infrastructure.RestaurantRepository;

@ExtendWith(MockitoExtension.class)
class RestaurantImageServiceTest {

    private static final UUID GROUP_ID = UUID.randomUUID();
    private static final UUID GROUP_RESTAURANT_ID = UUID.randomUUID();
    private static final UUID RESTAURANT_ID = UUID.randomUUID();
    private static final UUID USER_ID = UUID.randomUUID();

    @Mock
    private GroupService groupService;

    @Mock
    private GroupRestaurantRepository groupRestaurantRepository;

    @Mock
    private RestaurantRepository restaurantRepository;

    @Mock
    private RestaurantImageRepository restaurantImageRepository;

    private RestaurantImageService service;

    @BeforeEach
    void setUp() {
        service = new RestaurantImageService(
                groupService,
                groupRestaurantRepository,
                restaurantRepository,
                restaurantImageRepository
        );
    }

    @Test
    void savesCoverAndReturnsCacheBustedUrl() {
        GroupRestaurant groupRestaurant = mock(GroupRestaurant.class);
        Restaurant restaurant = mock(Restaurant.class);
        AtomicReference<String> imageUrl = new AtomicReference<>();

        when(groupRestaurantRepository.findByIdAndGroupId(
                GROUP_RESTAURANT_ID,
                GROUP_ID
        )).thenReturn(Optional.of(groupRestaurant));
        when(groupRestaurant.getId()).thenReturn(GROUP_RESTAURANT_ID);
        when(groupRestaurant.getGroupId()).thenReturn(GROUP_ID);
        when(groupRestaurant.getRestaurantId()).thenReturn(RESTAURANT_ID);
        when(groupRestaurant.getStatus()).thenReturn(
                GroupRestaurantStatus.WANT_TO_GO
        );

        when(restaurantRepository.findById(RESTAURANT_ID))
                .thenReturn(Optional.of(restaurant));
        when(restaurant.getId()).thenReturn(RESTAURANT_ID);
        when(restaurant.getName()).thenReturn("Kaizen Sushi");
        when(restaurant.getImageUrl()).thenAnswer(
                invocation -> imageUrl.get()
        );
        doAnswer(invocation -> {
            imageUrl.set(invocation.getArgument(0));
            return null;
        }).when(restaurant).updateImageUrl(any());
        when(restaurantRepository.saveAndFlush(restaurant))
                .thenReturn(restaurant);
        when(restaurantImageRepository.findById(RESTAURANT_ID))
                .thenReturn(Optional.empty());

        MockMultipartFile file = new MockMultipartFile(
                "file",
                "cover.jpg",
                "image/jpeg",
                new byte[]{1, 2, 3}
        );

        GroupRestaurantResponse response = service.saveImage(
                GROUP_ID,
                GROUP_RESTAURANT_ID,
                USER_ID,
                file
        );

        verify(groupService).validateRestaurantManagementAccess(
                GROUP_ID,
                USER_ID
        );
        verify(restaurantImageRepository).save(any(RestaurantImage.class));
        assertTrue(
                response.restaurant().imageUrl().startsWith(
                        "/restaurants/" + RESTAURANT_ID + "/image?v="
                )
        );
    }

    @Test
    void rejectsEmptyFilesBeforeReadingRestaurantData() {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "empty.jpg",
                "image/jpeg",
                new byte[0]
        );

        assertThrows(
                ResponseStatusException.class,
                () -> service.saveImage(
                        GROUP_ID,
                        GROUP_RESTAURANT_ID,
                        USER_ID,
                        file
                )
        );

        verify(groupService).validateRestaurantManagementAccess(
                GROUP_ID,
                USER_ID
        );
        verifyNoInteractions(
                groupRestaurantRepository,
                restaurantRepository,
                restaurantImageRepository
        );
    }
}
