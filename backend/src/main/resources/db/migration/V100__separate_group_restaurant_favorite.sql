ALTER TABLE group_restaurants
    ADD COLUMN favorite BOOLEAN NOT NULL DEFAULT FALSE;

UPDATE group_restaurants
SET favorite = TRUE,
    status = 'VISITED'
WHERE status = 'FAVORITE';
