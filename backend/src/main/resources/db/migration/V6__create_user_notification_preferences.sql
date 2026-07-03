CREATE TABLE user_notification_preferences (
    user_id UUID PRIMARY KEY,

    notifications_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    new_restaurants_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    restaurant_status_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    ratings_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    group_activity_enabled BOOLEAN NOT NULL DEFAULT TRUE,

    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,

    CONSTRAINT fk_user_notification_preferences_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

INSERT INTO user_notification_preferences (
    user_id,
    notifications_enabled,
    new_restaurants_enabled,
    restaurant_status_enabled,
    ratings_enabled,
    group_activity_enabled,
    updated_at
)
SELECT
    id,
    TRUE,
    TRUE,
    TRUE,
    TRUE,
    TRUE,
    CURRENT_TIMESTAMP
FROM users
ON CONFLICT (user_id) DO NOTHING;