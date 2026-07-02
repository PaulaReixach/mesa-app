CREATE TABLE user_avatars (
    user_id UUID PRIMARY KEY,
    content_type VARCHAR(100) NOT NULL,
    image_data BYTEA NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,

    CONSTRAINT fk_user_avatars_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);