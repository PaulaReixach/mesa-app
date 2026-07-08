import type { PublicGroupOwner } from './group';
import type { GroupMember } from './group-member';
import type { GroupRestaurant } from './restaurant';

export type GroupActivityKind =
  | 'GROUP_CREATED'
  | 'MEMBER_JOINED'
  | 'RESTAURANT_ADDED'
  | 'STATUS_UPDATED';

export type GroupActivityItem = {
  id: string;
  kind: GroupActivityKind;
  createdAt: string;
  actorName: string | null;
  actorAvatarUrl: string | null;
  restaurantName: string | null;
  status: GroupRestaurant['status'] | null;
};

export function buildGroupActivity({
  groupCreatedAt,
  owner,
  members,
  restaurants,
}: {
  groupCreatedAt: string;
  owner: PublicGroupOwner;
  members: GroupMember[];
  restaurants: GroupRestaurant[];
}): GroupActivityItem[] {
  const membersByUserId = new Map(
    members.map(member => [member.userId, member]),
  );

  const activity: GroupActivityItem[] = [
    {
      id: `group-created-${groupCreatedAt}`,
      kind: 'GROUP_CREATED',
      createdAt: groupCreatedAt,
      actorName: owner.name,
      actorAvatarUrl: owner.avatarUrl,
      restaurantName: null,
      status: null,
    },
  ];

  members
    .filter(member => member.role !== 'OWNER')
    .forEach(member => {
      activity.push({
        id: `member-joined-${member.id}`,
        kind: 'MEMBER_JOINED',
        createdAt: member.joinedAt,
        actorName: member.name,
        actorAvatarUrl: member.avatarUrl,
        restaurantName: null,
        status: null,
      });
    });

  restaurants.forEach(restaurant => {
    const actor = membersByUserId.get(restaurant.proposedByUserId);

    activity.push({
      id: `restaurant-added-${restaurant.id}`,
      kind: 'RESTAURANT_ADDED',
      createdAt: restaurant.createdAt,
      actorName: actor?.name ?? null,
      actorAvatarUrl: actor?.avatarUrl ?? null,
      restaurantName: restaurant.restaurant.name,
      status: null,
    });

    const createdAt = new Date(restaurant.createdAt).getTime();
    const updatedAt = new Date(restaurant.updatedAt).getTime();

    if (updatedAt - createdAt > 60_000) {
      activity.push({
        id: `restaurant-status-${restaurant.id}-${restaurant.updatedAt}`,
        kind: 'STATUS_UPDATED',
        createdAt: restaurant.updatedAt,
        actorName: null,
        actorAvatarUrl: null,
        restaurantName: restaurant.restaurant.name,
        status: restaurant.status,
      });
    }
  });

  return activity.sort(
    (left, right) =>
      new Date(right.createdAt).getTime()
      - new Date(left.createdAt).getTime(),
  );
}
