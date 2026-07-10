package com.pauluna.mesa.restaurant.domain;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

@Entity
@Table(name = "restaurants")
public class Restaurant {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "provider", length = 50)
    private String provider;

    @Column(name = "external_place_id", length = 255)
    private String externalPlaceId;

    @Column(name = "name", nullable = false, length = 150)
    private String name;

    @Column(name = "address", length = 300)
    private String address;

    @Column(name = "city", length = 100)
    private String city;

    @Column(name = "country", length = 100)
    private String country;

    @Column(name = "latitude", precision = 9, scale = 6)
    private BigDecimal latitude;

    @Column(name = "longitude", precision = 10, scale = 6)
    private BigDecimal longitude;

    @Column(name = "category", length = 100)
    private String category;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected Restaurant() {
        // Constructor requerido por JPA.
    }

    public Restaurant(
            String provider,
            String externalPlaceId,
            String name,
            String address,
            String city,
            String country,
            BigDecimal latitude,
            BigDecimal longitude,
            String category
    ) {
        this(
                provider,
                externalPlaceId,
                name,
                address,
                city,
                country,
                latitude,
                longitude,
                category,
                null
        );
    }

    public Restaurant(
            String provider,
            String externalPlaceId,
            String name,
            String address,
            String city,
            String country,
            BigDecimal latitude,
            BigDecimal longitude,
            String category,
            String imageUrl
    ) {
        this.provider = provider;
        this.externalPlaceId = externalPlaceId;
        this.name = name;
        this.address = address;
        this.city = city;
        this.country = country;
        this.latitude = latitude;
        this.longitude = longitude;
        this.category = category;
        this.imageUrl = imageUrl;
    }

    public void updateDetails(
            String name,
            String address,
            String city,
            String country,
            String category
    ) {
        this.name = Objects.requireNonNull(
                name,
                "El nombre del restaurante es obligatorio."
        );
        this.address = address;
        this.city = city;
        this.country = country;
        this.category = category;
    }

    public void updateImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    @PrePersist
    void onCreate() {
        Instant now = Instant.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    void onUpdate() {
        this.updatedAt = Instant.now();
    }

    public UUID getId() {
        return id;
    }

    public String getProvider() {
        return provider;
    }

    public String getExternalPlaceId() {
        return externalPlaceId;
    }

    public String getName() {
        return name;
    }

    public String getAddress() {
        return address;
    }

    public String getCity() {
        return city;
    }

    public String getCountry() {
        return country;
    }

    public BigDecimal getLatitude() {
        return latitude;
    }

    public BigDecimal getLongitude() {
        return longitude;
    }

    public String getCategory() {
        return category;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}
