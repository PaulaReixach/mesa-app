CREATE TABLE user_privacy_preferences (
    user_id UUID PRIMARY KEY,

    group_invitations_enabled BOOLEAN NOT NULL DEFAULT TRUE,

    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,

    CONSTRAINT fk_user_privacy_preferences_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

INSERT INTO user_privacy_preferences (
    user_id,
    group_invitations_enabled,
    updated_at
)
SELECT
    id,
    TRUE,
    CURRENT_TIMESTAMP
FROM users
ON CONFLICT (user_id) DO NOTHING;