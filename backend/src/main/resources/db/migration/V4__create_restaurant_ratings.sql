CREATE TABLE restaurant_ratings (
    id UUID PRIMARY KEY,
    group_restaurant_id UUID NOT NULL,
    user_id UUID NOT NULL,
    score INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,

    CONSTRAINT fk_restaurant_ratings_group_restaurant
        FOREIGN KEY (group_restaurant_id)
        REFERENCES group_restaurants(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_restaurant_ratings_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT uk_restaurant_ratings_restaurant_user
        UNIQUE (group_restaurant_id, user_id),

    CONSTRAINT ck_restaurant_ratings_score
        CHECK (score BETWEEN 1 AND 5)
);

CREATE INDEX idx_restaurant_ratings_group_restaurant
    ON restaurant_ratings(group_restaurant_id);

CREATE INDEX idx_restaurant_ratings_user
    ON restaurant_ratings(user_id);