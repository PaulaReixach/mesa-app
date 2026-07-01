import { apiRequest } from '../lib/api';
import {
  RestaurantRatingsSummary,
  SaveRestaurantRatingPayload,
} from '../types/restaurant-rating';

export function getRestaurantRatings(
  groupId: string,
  groupRestaurantId: string,
  accessToken: string,
): Promise<RestaurantRatingsSummary> {
  return apiRequest<RestaurantRatingsSummary>(
    `/groups/${groupId}/restaurants/${groupRestaurantId}/ratings`,
    {
      method: 'GET',
    },
    accessToken,
  );
}

export function saveRestaurantRating(
  groupId: string,
  groupRestaurantId: string,
  payload: SaveRestaurantRatingPayload,
  accessToken: string,
): Promise<RestaurantRatingsSummary> {
  return apiRequest<RestaurantRatingsSummary>(
    `/groups/${groupId}/restaurants/${groupRestaurantId}/ratings/me`,
    {
      method: 'PUT',
      body: JSON.stringify(payload),
    },
    accessToken,
  );
}

export function deleteRestaurantRating(
  groupId: string,
  groupRestaurantId: string,
  accessToken: string,
): Promise<RestaurantRatingsSummary> {
  return apiRequest<RestaurantRatingsSummary>(
    `/groups/${groupId}/restaurants/${groupRestaurantId}/ratings/me`,
    {
      method: 'DELETE',
    },
    accessToken,
  );
}