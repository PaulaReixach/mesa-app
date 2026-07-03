CREATE TABLE group_images (
    group_id UUID PRIMARY KEY,

    content_type VARCHAR(100) NOT NULL,
    image_data BYTEA NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,

    CONSTRAINT fk_group_images_group
        FOREIGN KEY (group_id)
        REFERENCES restaurant_groups(id)
        ON DELETE CASCADE
);