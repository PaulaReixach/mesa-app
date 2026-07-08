CREATE OR REPLACE FUNCTION track_group_created_activity()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO group_activity_events (
        group_id,
        type,
        actor_user_id,
        actor_name,
        actor_avatar_url,
        created_at
    )
    VALUES (
        NEW.id,
        'GROUP_CREATED',
        NEW.owner_user_id,
        (SELECT name FROM users WHERE id = NEW.owner_user_id),
        (SELECT avatar_url FROM users WHERE id = NEW.owner_user_id),
        NEW.created_at
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_group_activity_group_created
AFTER INSERT ON restaurant_groups
FOR EACH ROW
EXECUTE FUNCTION track_group_created_activity();

CREATE OR REPLACE FUNCTION track_group_member_joined_activity()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.role <> 'OWNER' THEN
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
            NEW.group_id,
            'MEMBER_JOINED',
            NEW.user_id,
            (SELECT name FROM users WHERE id = NEW.user_id),
            (SELECT avatar_url FROM users WHERE id = NEW.user_id),
            NEW.user_id,
            (SELECT name FROM users WHERE id = NEW.user_id),
            (SELECT avatar_url FROM users WHERE id = NEW.user_id),
            NEW.joined_at
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_group_activity_member_joined
AFTER INSERT ON group_members
FOR EACH ROW
EXECUTE FUNCTION track_group_member_joined_activity();

CREATE OR REPLACE FUNCTION track_group_member_left_activity()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.role <> 'OWNER' THEN
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

CREATE TRIGGER trg_group_activity_member_left
AFTER DELETE ON group_members
FOR EACH ROW
EXECUTE FUNCTION track_group_member_left_activity();

CREATE OR REPLACE FUNCTION track_group_invitation_activity()
RETURNS TRIGGER AS $$
BEGIN
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
        NEW.group_id,
        'MEMBER_INVITED',
        NEW.invited_by_user_id,
        (SELECT name FROM users WHERE id = NEW.invited_by_user_id),
        (SELECT avatar_url FROM users WHERE id = NEW.invited_by_user_id),
        NEW.invited_user_id,
        (SELECT name FROM users WHERE id = NEW.invited_user_id),
        (SELECT avatar_url FROM users WHERE id = NEW.invited_user_id),
        NEW.created_at
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_group_activity_invitation_created
AFTER INSERT ON group_invitations
FOR EACH ROW
EXECUTE FUNCTION track_group_invitation_activity();

CREATE OR REPLACE FUNCTION track_group_restaurant_added_activity()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO group_activity_events (
        group_id,
        type,
        actor_user_id,
        actor_name,
        actor_avatar_url,
        restaurant_name,
        created_at
    )
    VALUES (
        NEW.group_id,
        'RESTAURANT_ADDED',
        NEW.proposed_by_user_id,
        (SELECT name FROM users WHERE id = NEW.proposed_by_user_id),
        (SELECT avatar_url FROM users WHERE id = NEW.proposed_by_user_id),
        (SELECT name FROM restaurants WHERE id = NEW.restaurant_id),
        NEW.created_at
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_group_activity_restaurant_added
AFTER INSERT ON group_restaurants
FOR EACH ROW
EXECUTE FUNCTION track_group_restaurant_added_activity();

CREATE OR REPLACE FUNCTION track_group_restaurant_status_activity()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status IS DISTINCT FROM OLD.status THEN
        INSERT INTO group_activity_events (
            group_id,
            type,
            actor_user_id,
            actor_name,
            actor_avatar_url,
            restaurant_name,
            restaurant_status,
            created_at
        )
        VALUES (
            NEW.group_id,
            'RESTAURANT_STATUS_CHANGED',
            NEW.status_updated_by_user_id,
            (SELECT name FROM users WHERE id = NEW.status_updated_by_user_id),
            (SELECT avatar_url FROM users WHERE id = NEW.status_updated_by_user_id),
            (SELECT name FROM restaurants WHERE id = NEW.restaurant_id),
            NEW.status,
            NEW.updated_at
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_group_activity_restaurant_status
AFTER UPDATE OF status ON group_restaurants
FOR EACH ROW
EXECUTE FUNCTION track_group_restaurant_status_activity();

CREATE OR REPLACE FUNCTION track_restaurant_rating_activity()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'UPDATE' AND NEW.score IS NOT DISTINCT FROM OLD.score THEN
        RETURN NEW;
    END IF;

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
        NEW.user_id,
        actor_user.name,
        actor_user.avatar_url,
        restaurant.name,
        NEW.score,
        NEW.updated_at
    FROM group_restaurants group_restaurant
    JOIN restaurants restaurant
        ON restaurant.id = group_restaurant.restaurant_id
    LEFT JOIN users actor_user
        ON actor_user.id = NEW.user_id
    WHERE group_restaurant.id = NEW.group_restaurant_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_group_activity_restaurant_rated
AFTER INSERT OR UPDATE OF score ON restaurant_ratings
FOR EACH ROW
EXECUTE FUNCTION track_restaurant_rating_activity();
