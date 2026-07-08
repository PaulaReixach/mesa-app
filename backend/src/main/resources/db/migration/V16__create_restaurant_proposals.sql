CREATE TABLE restaurant_proposals (
    id UUID PRIMARY KEY,
    group_id UUID NOT NULL,
    proposed_by_user_id UUID NOT NULL,
    restaurant_identity_key VARCHAR(600) NOT NULL,
    provider VARCHAR(50),
    external_place_id VARCHAR(255),
    name VARCHAR(150) NOT NULL,
    address VARCHAR(300),
    city VARCHAR(100),
    country VARCHAR(100),
    latitude NUMERIC(9, 6),
    longitude NUMERIC(10, 6),
    category VARCHAR(100),
    message VARCHAR(500),
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    resolved_by_user_id UUID,
    created_group_restaurant_id UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_restaurant_proposals_group
        FOREIGN KEY (group_id)
        REFERENCES restaurant_groups (id)
        ON DELETE CASCADE,

    CONSTRAINT fk_restaurant_proposals_proposed_by
        FOREIGN KEY (proposed_by_user_id)
        REFERENCES users (id)
        ON DELETE CASCADE,

    CONSTRAINT fk_restaurant_proposals_resolved_by
        FOREIGN KEY (resolved_by_user_id)
        REFERENCES users (id)
        ON DELETE SET NULL,

    CONSTRAINT fk_restaurant_proposals_created_group_restaurant
        FOREIGN KEY (created_group_restaurant_id)
        REFERENCES group_restaurants (id)
        ON DELETE SET NULL,

    CONSTRAINT ck_restaurant_proposals_status
        CHECK (status IN (
            'PENDING',
            'ACCEPTED',
            'REJECTED',
            'CANCELLED',
            'DUPLICATE'
        )),

    CONSTRAINT ck_restaurant_proposals_external_reference
        CHECK (
            (provider IS NULL AND external_place_id IS NULL)
            OR
            (provider IS NOT NULL AND external_place_id IS NOT NULL)
        ),

    CONSTRAINT ck_restaurant_proposals_coordinates
        CHECK (
            (latitude IS NULL AND longitude IS NULL)
            OR
            (latitude IS NOT NULL AND longitude IS NOT NULL)
        )
);

CREATE UNIQUE INDEX uk_restaurant_proposals_pending_user_restaurant
    ON restaurant_proposals (
        group_id,
        proposed_by_user_id,
        restaurant_identity_key
    )
    WHERE status = 'PENDING';

CREATE INDEX idx_restaurant_proposals_group_status
    ON restaurant_proposals (group_id, status, created_at DESC);

CREATE INDEX idx_restaurant_proposals_user
    ON restaurant_proposals (proposed_by_user_id, created_at DESC);
