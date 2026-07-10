UPDATE group_restaurants
SET favorite = TRUE
WHERE restaurant_id IN (
    SELECT restaurant_id
    FROM group_restaurants
    WHERE favorite = TRUE
);

ALTER TABLE group_restaurants
    ADD CONSTRAINT ck_group_restaurants_status_not_favorite
    CHECK (status <> 'FAVORITE');
