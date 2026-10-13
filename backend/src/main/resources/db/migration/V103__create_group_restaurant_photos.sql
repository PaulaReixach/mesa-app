UPDATE group_restaurants
SET status = 'VISITED'
WHERE status = 'WANT_TO_GO'
  AND EXISTS (
      SELECT 1
      FROM restaurant_ratings
      WHERE restaurant_ratings.group_restaurant_id = group_restaurants.id
  );

CREATE TABLE group_restaurant_photos (
    id UUID PRIMARY KEY,
    group_restaurant_id UUID NOT NULL,
    uploaded_by_user_id UUID,
    content_type VARCHAR(100) NOT NULL,
    image_data BYTEA NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT fk_group_restaurant_photos_group_restaurant
        FOREIGN KEY (group_restaurant_id)
        REFERENCES group_restaurants (id)
        ON DELETE CASCADE,
    CONSTRAINT fk_group_restaurant_photos_uploaded_by_user
        FOREIGN KEY (uploaded_by_user_id)
        REFERENCES users (id)
        ON DELETE SET NULL
);

CREATE INDEX idx_group_restaurant_photos_restaurant_created
    ON group_restaurant_photos (group_restaurant_id, created_at DESC);
