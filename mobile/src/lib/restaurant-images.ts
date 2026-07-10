import { restaurantFallbackImages } from '../constants/restaurant-fallback-images';

export function getRestaurantFallbackImage(name: string): string {
  const normalizedName = name.trim() || 'restaurant';
  const imageCount = restaurantFallbackImages.length;

  if (imageCount === 0) {
    return '';
  }

  const index = Array.from(normalizedName).reduce(
    (total, character) => total + character.charCodeAt(0),
    0,
  ) % imageCount;

  return restaurantFallbackImages[index];
}
