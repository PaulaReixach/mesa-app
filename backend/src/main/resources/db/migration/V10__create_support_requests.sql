CREATE TABLE support_requests (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,

    category VARCHAR(30) NOT NULL,
    subject VARCHAR(120) NOT NULL,
    message VARCHAR(1500) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'OPEN',

    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,

    CONSTRAINT fk_support_requests_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT chk_support_requests_category
        CHECK (
            category IN (
                'TECHNICAL_PROBLEM',
                'ACCOUNT',
                'SUGGESTION',
                'OTHER'
            )
        ),

    CONSTRAINT chk_support_requests_status
        CHECK (
            status IN (
                'OPEN',
                'IN_PROGRESS',
                'RESOLVED',
                'CLOSED'
            )
        )
);

CREATE INDEX idx_support_requests_user_created_at
    ON support_requests(user_id, created_at DESC);

CREATE INDEX idx_support_requests_status_created_at
    ON support_requests(status, created_at DESC);