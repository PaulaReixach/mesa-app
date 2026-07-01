CREATE TABLE restaurant_groups (
    id UUID PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(500),
    image_url VARCHAR(500),
    city VARCHAR(100),
    privacy VARCHAR(20) NOT NULL,
    owner_user_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,

    CONSTRAINT fk_restaurant_groups_owner
        FOREIGN KEY (owner_user_id)
        REFERENCES users(id),

    CONSTRAINT ck_restaurant_groups_privacy
        CHECK (privacy IN ('PRIVATE', 'PUBLIC'))
);

CREATE TABLE group_members (
    id UUID PRIMARY KEY,
    group_id UUID NOT NULL,
    user_id UUID NOT NULL,
    role VARCHAR(20) NOT NULL,
    joined_at TIMESTAMP WITH TIME ZONE NOT NULL,

    CONSTRAINT fk_group_members_group
        FOREIGN KEY (group_id)
        REFERENCES restaurant_groups(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_group_members_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT uk_group_members_group_user
        UNIQUE (group_id, user_id),

    CONSTRAINT ck_group_members_role
        CHECK (role IN ('OWNER', 'MEMBER'))
);

CREATE INDEX idx_group_members_user_id
    ON group_members(user_id);

CREATE INDEX idx_group_members_group_id
    ON group_members(group_id);