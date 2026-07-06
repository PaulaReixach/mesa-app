CREATE TABLE group_followers (
    id UUID PRIMARY KEY,
    group_id UUID NOT NULL REFERENCES restaurant_groups(id),
    user_id UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT uk_group_followers_group_user UNIQUE (group_id, user_id)
);

CREATE INDEX idx_group_followers_group_id ON group_followers(group_id);
CREATE INDEX idx_group_followers_user_id ON group_followers(user_id);
