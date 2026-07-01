import { apiRequest } from '../lib/api';
import {
  CreateGroupRestaurantPayload,
  GroupRestaurant,
} from '../types/restaurant';

export function getGroupRestaurants(
  groupId: string,
  accessToken: string,
): Promise<GroupRestaurant[]> {
  return apiRequest<GroupRestaurant[]>(
    `/groups/${groupId}/restaurants`,
    {
      method: 'GET',
    },
    accessToken,
  );
}

export function getGroupRestaurant(
  groupId: string,
  groupRestaurantId: string,
  accessToken: string,
): Promise<GroupRestaurant> {
  return apiRequest<GroupRestaurant>(
    `/groups/${groupId}/restaurants/${groupRestaurantId}`,
    {
      method: 'GET',
    },
    accessToken,
  );
}

export function createGroupRestaurant(
  groupId: string,
  payload: CreateGroupRestaurantPayload,
  accessToken: string,
): Promise<GroupRestaurant> {
  return apiRequest<GroupRestaurant>(
    `/groups/${groupId}/restaurants`,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
    accessToken,
  );
}