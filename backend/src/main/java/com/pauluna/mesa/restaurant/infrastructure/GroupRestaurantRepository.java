package com.pauluna.mesa.restaurant.infrastructure;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.pauluna.mesa.restaurant.domain.GroupRestaurant;

public interface GroupRestaurantRepository
        extends JpaRepository<GroupRestaurant, UUID> {

    List<GroupRestaurant>
    findAllByGroupIdOrderByCreatedAtDesc(
            UUID groupId
    );

    List<GroupRestaurant>
    findAllByGroupIdInOrderByCreatedAtDesc(
            Collection<UUID> groupIds
    );

    List<GroupRestaurant> findAllByIdInAndGroupId(
            Collection<UUID> ids,
            UUID groupId
    );

    Optional<GroupRestaurant> findByIdAndGroupId(
            UUID id,
            UUID groupId
    );

    boolean existsByGroupIdAndRestaurantId(
            UUID groupId,
            UUID restaurantId
    );

    long countByGroupId(UUID groupId);

    long countByProposedByUserId(
            UUID proposedByUserId
    );

    List<GroupRestaurant> findAllByProposedByUserId(
            UUID proposedByUserId
    );

    @Query("""
            SELECT COUNT(groupRestaurant)
            FROM GroupRestaurant groupRestaurant,
                 Restaurant restaurant
            WHERE groupRestaurant.groupId = :groupId
              AND groupRestaurant.restaurantId = restaurant.id
              AND LOWER(restaurant.name) = LOWER(:name)
              AND (
                    (:address IS NULL AND restaurant.address IS NULL)
                    OR (
                        :address IS NOT NULL
                        AND LOWER(restaurant.address) = LOWER(:address)
                    )
                  )
              AND (
                    (:city IS NULL AND restaurant.city IS NULL)
                    OR (
                        :city IS NOT NULL
                        AND LOWER(restaurant.city) = LOWER(:city)
                    )
                  )
            """)
    long countEquivalentManualRestaurantInGroup(
            @Param("groupId")
            UUID groupId,

            @Param("name")
            String name,

            @Param("address")
            String address,

            @Param("city")
            String city
    );
}
