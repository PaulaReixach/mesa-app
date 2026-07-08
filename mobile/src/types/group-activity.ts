import type { GroupRestaurantStatus } from './restaurant';

export type GroupActivityType =
  | 'GROUP_CREATED'
  | 'MEMBER_INVITED'
  | 'MEMBER_JOINED'
  | 'MEMBER_LEFT'
  | 'RESTAURANT_ADDED'
  | 'RESTAURANT_RATED'
  | 'RESTAURANT_STATUS_CHANGED';

export type GroupActivityItem = {
  id: number;
  type: GroupActivityType;
  actorUserId: string | null;
  actorName: string | null;
  actorAvatarUrl: string | null;
  subjectUserId: string | null;
  subjectName: string | null;
  subjectAvatarUrl: string | null;
  restaurantName: string | null;
  score: number | null;
  restaurantStatus: GroupRestaurantStatus | null;
  createdAt: string;
};
