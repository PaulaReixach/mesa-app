ALTER TABLE restaurant_groups
    ADD COLUMN accepting_collaborators BOOLEAN NOT NULL DEFAULT TRUE;

ALTER TABLE group_members
    DROP CONSTRAINT ck_group_members_role;

ALTER TABLE group_members
    ADD CONSTRAINT ck_group_members_role
        CHECK (role IN ('OWNER', 'MEMBER', 'CONTRIBUTOR'));

CREATE TABLE group_collaboration_requests (
    id UUID PRIMARY KEY,
    group_id UUID NOT NULL,
    user_id UUID NOT NULL,
    message VARCHAR(300),
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT fk_group_collaboration_requests_group FOREIGN KEY (group_id) REFERENCES restaurant_groups(id) ON DELETE CASCADE,
    CONSTRAINT fk_group_collaboration_requests_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT ck_group_collaboration_requests_status CHECK (status IN ('PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED'))
);

CREATE UNIQUE INDEX uk_group_collaboration_requests_pending
    ON group_collaboration_requests(group_id, user_id)
    WHERE status = 'PENDING';

CREATE INDEX idx_group_collaboration_requests_group_status
    ON group_collaboration_requests(group_id, status, created_at DESC);

CREATE INDEX idx_group_collaboration_requests_user
    ON group_collaboration_requests(user_id, created_at DESC);
