CREATE OR REPLACE FUNCTION track_group_member_left_activity()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.role <> 'OWNER'
       AND EXISTS (
           SELECT 1
           FROM restaurant_groups
           WHERE id = OLD.group_id
       ) THEN
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
        VALUES (
            OLD.group_id,
            'MEMBER_LEFT',
            OLD.user_id,
            (SELECT name FROM users WHERE id = OLD.user_id),
            (SELECT avatar_url FROM users WHERE id = OLD.user_id),
            OLD.user_id,
            (SELECT name FROM users WHERE id = OLD.user_id),
            (SELECT avatar_url FROM users WHERE id = OLD.user_id),
            CURRENT_TIMESTAMP
        );
    END IF;

    RETURN OLD;
END;
$$ LANGUAGE plpgsql;
