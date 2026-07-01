CREATE TABLE restaurants (
    id UUID PRIMARY KEY,
    provider VARCHAR(50),
    external_place_id VARCHAR(255),
    name VARCHAR(150) NOT NULL,
    address VARCHAR(300),
    city VARCHAR(100),
    country VARCHAR(100),
    latitude NUMERIC(9, 6),
    longitude NUMERIC(10, 6),
    category VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,

    CONSTRAINT ck_restaurants_external_reference
        CHECK (
            (provider IS NULL AND external_place_id IS NULL)
            OR
            (provider IS NOT NULL AND external_place_id IS NOT NULL)
        ),

    CONSTRAINT ck_restaurants_coordinates
        CHECK (
            (latitude IS NULL AND longitude IS NULL)
            OR
            (latitude IS NOT NULL AND longitude IS NOT NULL)
        ),

    CONSTRAINT ck_restaurants_latitude
        CHECK (
            latitude IS NULL
            OR latitude BETWEEN -90 AND 90
        ),

    CONSTRAINT ck_restaurants_longitude
        CHECK (
            longitude IS NULL
            OR longitude BETWEEN -180 AND 180
        )
);

CREATE UNIQUE INDEX uk_restaurants_provider_external_place
    ON restaurants (LOWER(provider), external_place_id)
    WHERE provider IS NOT NULL
      AND external_place_id IS NOT NULL;

CREATE TABLE group_restaurants (
    id UUID PRIMARY KEY,
    group_id UUID NOT NULL,
    restaurant_id UUID NOT NULL,
    status VARCHAR(30) NOT NULL,
    proposed_by_user_id UUID NOT NULL,
    group_notes VARCHAR(1000),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,

    CONSTRAINT fk_group_restaurants_group
        FOREIGN KEY (group_id)
        REFERENCES restaurant_groups(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_group_restaurants_restaurant
        FOREIGN KEY (restaurant_id)
        REFERENCES restaurants(id),

    CONSTRAINT fk_group_restaurants_proposed_by
        FOREIGN KEY (proposed_by_user_id)
        REFERENCES users(id),

    CONSTRAINT uk_group_restaurants_group_restaurant
        UNIQUE (group_id, restaurant_id),

    CONSTRAINT ck_group_restaurants_status
        CHECK (
            status IN (
                'WANT_TO_GO',
                'VISITED',
                'FAVORITE',
                'WANT_TO_REPEAT',
                'DO_NOT_REPEAT',
                'ARCHIVED'
            )
        )
);

CREATE INDEX idx_group_restaurants_group_created_at
    ON group_restaurants(group_id, created_at DESC);

CREATE INDEX idx_group_restaurants_restaurant_id
    ON group_restaurants(restaurant_id);

CREATE INDEX idx_group_restaurants_proposed_by_user_id
    ON group_restaurants(proposed_by_user_id);