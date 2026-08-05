package com.pauluna.mesa.restaurant.application;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.server.ResponseStatusException;

import com.pauluna.mesa.group.application.GroupService;
import com.pauluna.mesa.group.domain.GroupMember;
import com.pauluna.mesa.group.domain.GroupRole;
import com.pauluna.mesa.group.infrastructure.GroupMemberRepository;
import com.pauluna.mesa.restaurant.api.RestaurantPhotoResponse;
import com.pauluna.mesa.restaurant.domain.GroupRestaurant;
import com.pauluna.mesa.restaurant.domain.GroupRestaurantStatus;
import com.pauluna.mesa.restaurant.domain.RestaurantPhoto;
import com.pauluna.mesa.restaurant.infrastructure.GroupRestaurantRepository;
import com.pauluna.mesa.restaurant.infrastructure.RestaurantPhotoRepository;
import com.pauluna.mesa.user.domain.User;
import com.pauluna.mesa.user.infrastructure.UserRepository;

@ExtendWith(MockitoExtension.class)
class RestaurantPhotoServiceTest {

    private static final UUID GROUP_ID = UUID.randomUUID();
    private static final UUID GROUP_RESTAURANT_ID = UUID.randomUUID();
    private static final UUID PHOTO_ID = UUID.randomUUID();
    private static final UUID USER_ID = UUID.randomUUID();
    private static final UUID OTHER_USER_ID = UUID.randomUUID();

    @Mock
    private GroupService groupService;

    @Mock
    private GroupMemberRepository groupMemberRepository;

    @Mock
    private GroupRestaurantRepository groupRestaurantRepository;

    @Mock
    private RestaurantPhotoRepository restaurantPhotoRepository;

    @Mock
    private UserRepository userRepository;

    private RestaurantPhotoService service;

    @BeforeEach
    void setUp() {
        service = new RestaurantPhotoService(
                groupService,
                groupMemberRepository,
                groupRestaurantRepository,
                restaurantPhotoRepository,
                userRepository
        );
    }

    @Test
    void savesPhotoForVisitedRestaurant() {
        GroupRestaurant groupRestaurant = mock(GroupRestaurant.class);
        RestaurantPhoto savedPhoto = mock(RestaurantPhoto.class);
        User uploader = mock(User.class);
        GroupMember membership = mock(GroupMember.class);
        Instant createdAt = Instant.parse("2026-08-05T10:00:00Z");

        when(groupRestaurant.getStatus())
                .thenReturn(GroupRestaurantStatus.VISITED);
        when(groupRestaurantRepository.findByIdAndGroupId(
                GROUP_RESTAURANT_ID,
                GROUP_ID
        )).thenReturn(Optional.of(groupRestaurant));
        when(restaurantPhotoRepository.countByGroupRestaurantId(
                GROUP_RESTAURANT_ID
        )).thenReturn(0L);
        when(restaurantPhotoRepository.saveAndFlush(any(RestaurantPhoto.class)))
                .thenReturn(savedPhoto);
        when(savedPhoto.getId()).thenReturn(PHOTO_ID);
        when(savedPhoto.getUploadedByUserId()).thenReturn(USER_ID);
        when(savedPhoto.getCreatedAt()).thenReturn(createdAt);
        when(userRepository.findById(USER_ID)).thenReturn(Optional.of(uploader));
        when(uploader.getName()).thenReturn("Paula");
        when(uploader.getUsername()).thenReturn("paula");
        when(groupMemberRepository.findByGroupIdAndUserId(GROUP_ID, USER_ID))
                .thenReturn(Optional.of(membership));
        when(membership.getRole()).thenReturn(GroupRole.MEMBER);

        RestaurantPhotoResponse response = service.savePhoto(
                GROUP_ID,
                GROUP_RESTAURANT_ID,
                USER_ID,
                imageFile()
        );

        assertEquals(PHOTO_ID, response.id());
        assertEquals("Paula", response.uploadedByName());
        assertEquals(true, response.uploadedByCurrentUser());
        assertEquals(true, response.canDelete());
        verify(groupService).validateRestaurantManagementAccess(
                GROUP_ID,
                USER_ID
        );
    }

    @Test
    void rejectsPhotoWhileRestaurantIsPending() {
        GroupRestaurant groupRestaurant = mock(GroupRestaurant.class);

        when(groupRestaurant.getStatus())
                .thenReturn(GroupRestaurantStatus.WANT_TO_GO);
        when(groupRestaurantRepository.findByIdAndGroupId(
                GROUP_RESTAURANT_ID,
                GROUP_ID
        )).thenReturn(Optional.of(groupRestaurant));

        assertThrows(
                ResponseStatusException.class,
                () -> service.savePhoto(
                        GROUP_ID,
                        GROUP_RESTAURANT_ID,
                        USER_ID,
                        imageFile()
                )
        );

        verify(restaurantPhotoRepository, never())
                .saveAndFlush(any(RestaurantPhoto.class));
    }

    @Test
    void ownerCanDeleteAnotherMembersPhoto() {
        GroupRestaurant groupRestaurant = mock(GroupRestaurant.class);
        RestaurantPhoto photo = mock(RestaurantPhoto.class);

        when(groupRestaurantRepository.findByIdAndGroupId(
                GROUP_RESTAURANT_ID,
                GROUP_ID
        )).thenReturn(Optional.of(groupRestaurant));
        when(restaurantPhotoRepository.findByIdAndGroupRestaurantId(
                PHOTO_ID,
                GROUP_RESTAURANT_ID
        )).thenReturn(Optional.of(photo));
        when(photo.getUploadedByUserId()).thenReturn(OTHER_USER_ID);

        service.deletePhoto(
                GROUP_ID,
                GROUP_RESTAURANT_ID,
                PHOTO_ID,
                USER_ID
        );

        verify(groupService).validateOwnerAccess(GROUP_ID, USER_ID);
        verify(restaurantPhotoRepository).delete(photo);
        verify(restaurantPhotoRepository).flush();
    }

    private MockMultipartFile imageFile() {
        return new MockMultipartFile(
                "file",
                "dish.jpg",
                "image/jpeg",
                new byte[]{1, 2, 3}
        );
    }
}
