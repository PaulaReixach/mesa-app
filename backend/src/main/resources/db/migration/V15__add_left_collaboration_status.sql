ALTER TABLE group_collaboration_requests
    DROP CONSTRAINT ck_group_collaboration_requests_status;

ALTER TABLE group_collaboration_requests
    ADD CONSTRAINT ck_group_collaboration_requests_status
        CHECK (status IN (
            'PENDING',
            'ACCEPTED',
            'REJECTED',
            'CANCELLED',
            'LEFT'
        ));
