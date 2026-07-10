UPDATE group_restaurants AS current_membership
SET favorite = TRUE
WHERE EXISTS (
    SELECT 1
    FROM group_restaurants AS favorite_membership
    WHERE favorite_membership.restaurant_id = current_membership.restaurant_id
      AND favorite_membership.favorite = TRUE
);

ALTER TABLE group_restaurants
    ADD CONSTRAINT ck_group_restaurants_status_not_favorite
    CHECK (status <> 'FAVORITE');
