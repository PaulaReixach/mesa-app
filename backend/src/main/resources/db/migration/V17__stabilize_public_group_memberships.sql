UPDATE group_members AS member
SET role = 'CONTRIBUTOR'
FROM restaurant_groups AS restaurant_group
WHERE member.group_id = restaurant_group.id
  AND restaurant_group.privacy = 'PUBLIC'
  AND member.role = 'MEMBER';

UPDATE group_members AS member
SET role = 'MEMBER'
FROM restaurant_groups AS restaurant_group
WHERE member.group_id = restaurant_group.id
  AND restaurant_group.privacy = 'PRIVATE'
  AND member.role = 'CONTRIBUTOR';

UPDATE group_collaboration_requests AS request
SET status = 'CANCELLED',
    updated_at = CURRENT_TIMESTAMP
FROM restaurant_groups AS restaurant_group
WHERE request.group_id = restaurant_group.id
  AND restaurant_group.privacy = 'PRIVATE'
  AND request.status = 'PENDING';

UPDATE group_collaboration_requests AS request
SET status = 'LEFT',
    updated_at = CURRENT_TIMESTAMP
WHERE request.status = 'ACCEPTED'
  AND NOT EXISTS (
      SELECT 1
      FROM group_members AS member
      WHERE member.group_id = request.group_id
        AND member.user_id = request.user_id
  );
