CREATE TABLE group_activity_events (
    id BIGSERIAL PRIMARY KEY,
    group_id UUID NOT NULL,
    type VARCHAR(40) NOT NULL,
    actor_user_id UUID,
    actor_name VARCHAR(100),
    actor_avatar_url VARCHAR(500),
    subject_user_id UUID,
    subject_name VARCHAR(100),
    subject_avatar_url VARCHAR(500),
    restaurant_name VARCHAR(200),
    score INTEGER,
    restaurant_status VARCHAR(30),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT fk_group_activity_events_group
        FOREIGN KEY (group_id)
        REFERENCES restaurant_groups(id)
        ON DELETE CASCADE
);

CREATE INDEX idx_group_activity_events_group_created
    ON group_activity_events(group_id, created_at DESC, id DESC);

ALTER TABLE group_restaurants
    ADD COLUMN status_updated_by_user_id UUID;

ALTER TABLE group_restaurants
    ADD CONSTRAINT fk_group_restaurants_status_updated_by
        FOREIGN KEY (status_updated_by_user_id)
        REFERENCES users(id)
        ON DELETE SET NULL;

INSERT INTO group_activity_events (
    group_id,
    type,
    actor_user_id,
    actor_name,
    actor_avatar_url,
    created_at
)
SELECT
    restaurant_group.id,
    'GROUP_CREATED',
    restaurant_group.owner_user_id,
    owner_user.name,
    owner_user.avatar_url,
    restaurant_group.created_at
FROM restaurant_groups restaurant_group
LEFT JOIN users owner_user
    ON owner_user.id = restaurant_group.owner_user_id;

INSERT INTO group_activity_events (
    group_id,
    type,
    actor_user_id,
    actor_name,
    actor_avatar_url,
    subject_user_id,
    subject_name,
    subject_avatar_url,
    created_at
)
SELECT
    group_member.group_id,
    'MEMBER_JOINED',
    group_member.user_id,
    member_user.name,
    member_user.avatar_url,
    group_member.user_id,
    member_user.name,
    member_user.avatar_url,
    group_member.joined_at
FROM group_members group_member
LEFT JOIN users member_user
    ON member_user.id = group_member.user_id
WHERE group_member.role <> 'OWNER';

INSERT INTO group_activity_events (
    group_id,
    type,
    actor_user_id,
    actor_name,
    actor_avatar_url,
    restaurant_name,
    created_at
)
SELECT
    group_restaurant.group_id,
    'RESTAURANT_ADDED',
    group_restaurant.proposed_by_user_id,
    actor_user.name,
    actor_user.avatar_url,
    restaurant.name,
    group_restaurant.created_at
FROM group_restaurants group_restaurant
JOIN restaurants restaurant
    ON restaurant.id = group_restaurant.restaurant_id
LEFT JOIN users actor_user
    ON actor_user.id = group_restaurant.proposed_by_user_id;

INSERT INTO group_activity_events (
    group_id,
    type,
    actor_user_id,
    actor_name,
    actor_avatar_url,
    subject_user_id,
    subject_name,
    subject_avatar_url,
    created_at
)
SELECT
    invitation.group_id,
    'MEMBER_INVITED',
    invitation.invited_by_user_id,
    inviter.name,
    inviter.avatar_url,
    invitation.invited_user_id,
    invited.name,
    invited.avatar_url,
    invitation.created_at
FROM group_invitations invitation
LEFT JOIN users inviter
    ON inviter.id = invitation.invited_by_user_id
LEFT JOIN users invited
    ON invited.id = invitation.invited_user_id;

INSERT INTO group_activity_events (
    group_id,
    type,
    actor_user_id,
    actor_name,
    actor_avatar_url,
    restaurant_name,
    score,
    created_at
)
SELECT
    group_restaurant.group_id,
    'RESTAURANT_RATED',
    rating.user_id,
    actor_user.name,
    actor_user.avatar_url,
    restaurant.name,
    rating.score,
    rating.updated_at
FROM restaurant_ratings rating
JOIN group_restaurants group_restaurant
    ON group_restaurant.id = rating.group_restaurant_id
JOIN restaurants restaurant
    ON restaurant.id = group_restaurant.restaurant_id
LEFT JOIN users actor_user
    ON actor_user.id = rating.user_id;

INSERT INTO group_activity_events (
    group_id,
    type,
    actor_user_id,
    actor_name,
    actor_avatar_url,
    subject_user_id,
    subject_name,
    subject_avatar_url,
    created_at
)
SELECT
    collaboration_request.group_id,
    'MEMBER_LEFT',
    collaboration_request.user_id,
    collaborator.name,
    collaborator.avatar_url,
    collaboration_request.user_id,
    collaborator.name,
    collaborator.avatar_url,
    collaboration_request.updated_at
FROM group_collaboration_requests collaboration_request
LEFT JOIN users collaborator
    ON collaborator.id = collaboration_request.user_id
WHERE collaboration_request.status = 'LEFT';

INSERT INTO group_activity_events (
    group_id,
    type,
    restaurant_name,
    restaurant_status,
    created_at
)
SELECT
    group_restaurant.group_id,
    'RESTAURANT_STATUS_CHANGED',
    restaurant.name,
    group_restaurant.status,
    group_restaurant.updated_at
FROM group_restaurants group_restaurant
JOIN restaurants restaurant
    ON restaurant.id = group_restaurant.restaurant_id
WHERE group_restaurant.status <> 'WANT_TO_GO'
  AND group_restaurant.updated_at > group_restaurant.created_at;
