ALTER TABLE group_restaurants
    ADD COLUMN copied_from_group_id UUID,
    ADD COLUMN copied_from_group_restaurant_id UUID;

ALTER TABLE group_restaurants
    ADD CONSTRAINT fk_group_restaurants_copied_from_group
        FOREIGN KEY (copied_from_group_id)
        REFERENCES restaurant_groups(id)
        ON DELETE SET NULL;

ALTER TABLE group_restaurants
    ADD CONSTRAINT fk_group_restaurants_copied_from_restaurant
        FOREIGN KEY (copied_from_group_restaurant_id)
        REFERENCES group_restaurants(id)
        ON DELETE SET NULL;

CREATE INDEX idx_group_restaurants_copied_from_group_id
    ON group_restaurants(copied_from_group_id);

CREATE INDEX idx_group_restaurants_copied_from_restaurant_id
    ON group_restaurants(copied_from_group_restaurant_id);
