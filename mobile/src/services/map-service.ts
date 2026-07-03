import { apiRequest } from '../lib/api';
import { MapRestaurant } from '../types/map';

export function getMapRestaurants(
  accessToken: string,
): Promise<MapRestaurant[]> {
  return apiRequest<MapRestaurant[]>(
    '/restaurants/map',
    {
      method: 'GET',
    },
    accessToken,
  );
}