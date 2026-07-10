import { apiRequest } from '../lib/api';
import {
  CreateGroupRestaurantPayload,
  GroupRestaurant,
  RestaurantLocationResult,
  RestaurantSearchResult,
  UpdateGroupRestaurantFavoritePayload,
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

export function updateGroupRestaurantFavorite(
  groupId: string,
  groupRestaurantId: string,
  payload: UpdateGroupRestaurantFavoritePayload,
  accessToken: string,
): Promise<GroupRestaurant> {
  return apiRequest<GroupRestaurant>(
    `/groups/${groupId}/restaurants/${groupRestaurantId}/favorite`,
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

export function searchRestaurantLocations(
  address: string,
  city: string,
  country: string,
  accessToken: string,
): Promise<RestaurantLocationResult[]> {
  const parameters = new URLSearchParams();
  const normalizedAddress = address.trim();
  const normalizedCity = city.trim();
  const normalizedCountry = country.trim();

  if (normalizedAddress) {
    parameters.set('address', normalizedAddress);
  }

  if (normalizedCity) {
    parameters.set('city', normalizedCity);
  }

  if (normalizedCountry) {
    parameters.set('country', normalizedCountry);
  }

  return apiRequest<RestaurantLocationResult[]>(
    `/restaurants/geocode?${parameters.toString()}`,
    {
      method: 'GET',
    },
    accessToken,
  );
}
