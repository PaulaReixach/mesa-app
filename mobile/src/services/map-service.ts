import { apiRequest } from '../lib/api';
import { registerRestaurantCoverImages } from '../lib/restaurant-images';
import { MapRestaurant } from '../types/map';

export async function getMapRestaurants(
  accessToken: string,
): Promise<MapRestaurant[]> {
  const restaurants = await apiRequest<MapRestaurant[]>(
    '/restaurants/map',
    { method: 'GET' },
    accessToken,
  );

  registerRestaurantCoverImages(restaurants);

  return restaurants;
}
