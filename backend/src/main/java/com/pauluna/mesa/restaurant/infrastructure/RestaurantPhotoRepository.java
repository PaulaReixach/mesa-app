package com.pauluna.mesa.restaurant.infrastructure;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.pauluna.mesa.restaurant.domain.RestaurantPhoto;
import com.pauluna.mesa.restaurant.domain.RestaurantPhotoMetadata;

public interface RestaurantPhotoRepository
        extends JpaRepository<RestaurantPhoto, UUID> {

    long countByGroupRestaurantId(UUID groupRestaurantId);

    Optional<RestaurantPhoto> findByIdAndGroupRestaurantId(
            UUID id,
            UUID groupRestaurantId
    );

    @Query("""
            SELECT new com.pauluna.mesa.restaurant.domain.RestaurantPhotoMetadata(
                    photo.id,
                    photo.uploadedByUserId,
                    photo.createdAt
            )
            FROM RestaurantPhoto photo
            WHERE photo.groupRestaurantId = :groupRestaurantId
            ORDER BY photo.createdAt DESC
            """)
    List<RestaurantPhotoMetadata> findMetadataByGroupRestaurantId(
            @Param("groupRestaurantId") UUID groupRestaurantId
    );
}
