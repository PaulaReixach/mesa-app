import { apiRequest } from '../lib/api';
import {
  CreateGroupRestaurantPayload,
  GroupRestaurant,
  RestaurantSearchResult,
  UpdateGroupRestaurantPayload,
  UpdateGroupRestaurantStatusPayload,
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

export function updateGroupRestaurant(
  groupId: string,
  groupRestaurantId: string,
  payload: UpdateGroupRestaurantPayload,
  accessToken: string,
): Promise<GroupRestaurant> {
  return apiRequest<GroupRestaurant>(
    `/groups/${groupId}/restaurants/${groupRestaurantId}`,
    {
      method: 'PUT',
      body: JSON.stringify(payload),
    },
    accessToken,
  );
}

export function updateGroupRestaurantStatus(
  groupId: string,
  groupRestaurantId: string,
  payload: UpdateGroupRestaurantStatusPayload,
  accessToken: string,
): Promise<GroupRestaurant> {
  return apiRequest<GroupRestaurant>(
    `/groups/${groupId}/restaurants/${groupRestaurantId}/status`,
    {
      method: 'PATCH',
      body: JSON.stringify(payload),
    },
    accessToken,
  );
}

export function searchRestaurants(
  query: string,
  city: string,
  accessToken: string,
): Promise<RestaurantSearchResult[]> {
  const queryParameter = encodeURIComponent(query.trim());
  const normalizedCity = city.trim();

  const cityParameter = normalizedCity
    ? `&city=${encodeURIComponent(normalizedCity)}`
    : '';

  return apiRequest<RestaurantSearchResult[]>(
    `/restaurants/search?query=${queryParameter}${cityParameter}`,
    {
      method: 'GET',
    },
    accessToken,
  );
}
