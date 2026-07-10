ALTER TABLE restaurants
    ADD COLUMN image_url VARCHAR(500);

CREATE TABLE restaurant_images (
    restaurant_id UUID PRIMARY KEY,
    content_type VARCHAR(100) NOT NULL,
    image_data BYTEA NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT fk_restaurant_images_restaurant
        FOREIGN KEY (restaurant_id)
        REFERENCES restaurants (id)
        ON DELETE CASCADE
);
