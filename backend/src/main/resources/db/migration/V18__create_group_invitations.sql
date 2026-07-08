CREATE TABLE group_invitations (
    id UUID PRIMARY KEY,
    group_id UUID NOT NULL,
    invited_user_id UUID NOT NULL,
    invited_by_user_id UUID NOT NULL,
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT fk_group_invitations_group
        FOREIGN KEY (group_id)
        REFERENCES restaurant_groups(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_group_invitations_invited_user
        FOREIGN KEY (invited_user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_group_invitations_invited_by_user
        FOREIGN KEY (invited_by_user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,
    CONSTRAINT ck_group_invitations_status
        CHECK (status IN ('PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED'))
);

CREATE UNIQUE INDEX uk_group_invitations_pending
    ON group_invitations(group_id, invited_user_id)
    WHERE status = 'PENDING';

CREATE INDEX idx_group_invitations_group_status
    ON group_invitations(group_id, status, created_at DESC);

CREATE INDEX idx_group_invitations_invited_user
    ON group_invitations(invited_user_id, created_at DESC);
