package com.pauluna.mesa.user.application;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.pauluna.mesa.group.domain.RestaurantGroup;
import com.pauluna.mesa.group.infrastructure.GroupFollowerRepository;
import com.pauluna.mesa.group.infrastructure.GroupMemberRepository;
import com.pauluna.mesa.group.infrastructure.RestaurantGroupRepository;
import com.pauluna.mesa.restaurant.domain.GroupRestaurant;
import com.pauluna.mesa.restaurant.infrastructure.GroupRestaurantRepository;
import com.pauluna.mesa.restaurant.infrastructure.RestaurantRatingRepository;
import com.pauluna.mesa.user.api.ChangePasswordRequest;
import com.pauluna.mesa.user.api.DeleteAccountRequest;
import com.pauluna.mesa.user.domain.User;
import com.pauluna.mesa.user.infrastructure.UserAvatarRepository;
import com.pauluna.mesa.user.infrastructure.UserRepository;

@Service
@Transactional
public class UserAccountService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final RestaurantGroupRepository restaurantGroupRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final GroupFollowerRepository groupFollowerRepository;
    private final GroupRestaurantRepository groupRestaurantRepository;
    private final RestaurantRatingRepository restaurantRatingRepository;
    private final UserAvatarRepository userAvatarRepository;

    public UserAccountService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            RestaurantGroupRepository restaurantGroupRepository,
            GroupMemberRepository groupMemberRepository,
            GroupFollowerRepository groupFollowerRepository,
            GroupRestaurantRepository groupRestaurantRepository,
            RestaurantRatingRepository restaurantRatingRepository,
            UserAvatarRepository userAvatarRepository
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.restaurantGroupRepository = restaurantGroupRepository;
        this.groupMemberRepository = groupMemberRepository;
        this.groupFollowerRepository = groupFollowerRepository;
        this.groupRestaurantRepository = groupRestaurantRepository;
        this.restaurantRatingRepository = restaurantRatingRepository;
        this.userAvatarRepository = userAvatarRepository;
    }

    public void changePassword(
            UUID userId,
            ChangePasswordRequest request
    ) {
        User user = getUser(userId);

        validatePassword(
                user,
                request.currentPassword()
        );

        if (
                passwordEncoder.matches(
                        request.newPassword(),
                        user.getPasswordHash()
                )
        ) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "La nueva contraseña debe ser diferente de la actual."
            );
        }

        user.updatePasswordHash(
                passwordEncoder.encode(
                        request.newPassword()
                )
        );

        userRepository.saveAndFlush(user);
    }

    public void deleteAccount(
            UUID userId,
            DeleteAccountRequest request
    ) {
        User user = getUser(userId);

        validatePassword(
                user,
                request.password()
        );

        reassignRestaurantsProposedByUser(
                userId
        );

        List<UUID> ownedGroupIds =
                restaurantGroupRepository
                        .findAllByOwnerUserId(userId)
                        .stream()
                        .map(RestaurantGroup::getId)
                        .toList();

        if (!ownedGroupIds.isEmpty()) {
            groupFollowerRepository
                    .deleteAllByGroupIdIn(
                            ownedGroupIds
                    );
        }

        groupFollowerRepository
                .deleteAllByUserId(userId);

        restaurantGroupRepository
                .deleteAllByOwnerUserId(userId);

        restaurantRatingRepository
                .deleteAllByUserId(userId);

        groupMemberRepository
                .deleteAllByUserId(userId);

        userAvatarRepository
                .deleteById(userId);

        userRepository.delete(user);
        userRepository.flush();
    }

    private void reassignRestaurantsProposedByUser(
            UUID userId
    ) {
        List<GroupRestaurant> proposedRestaurants =
                groupRestaurantRepository
                        .findAllByProposedByUserId(
                                userId
                        );

        for (
                GroupRestaurant groupRestaurant
                : proposedRestaurants
        ) {
            RestaurantGroup restaurantGroup =
                    restaurantGroupRepository
                            .findById(
                                    groupRestaurant
                                            .getGroupId()
                            )
                            .orElse(null);

            if (
                    restaurantGroup != null
                    && !restaurantGroup
                            .getOwnerUserId()
                            .equals(userId)
            ) {
                groupRestaurant
                        .changeProposedByUserId(
                                restaurantGroup
                                        .getOwnerUserId()
                        );
            }
        }

        groupRestaurantRepository
                .saveAllAndFlush(
                        proposedRestaurants
                );
    }

    private User getUser(
            UUID userId
    ) {
        return userRepository
                .findById(userId)
                .orElseThrow(() ->
                        new UserNotFoundException(
                                userId
                        )
                );
    }

    private void validatePassword(
            User user,
            String rawPassword
    ) {
        if (
                !passwordEncoder.matches(
                        rawPassword,
                        user.getPasswordHash()
                )
        ) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "La contraseña actual no es correcta."
            );
        }
    }
}
