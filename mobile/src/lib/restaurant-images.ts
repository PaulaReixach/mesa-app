import { restaurantFallbackImages } from '../constants/restaurant-fallback-images';

export function getRestaurantFallbackImage(name: string): string {
  const normalizedName = name.trim() || 'restaurant';
  const images: readonly string[] = restaurantFallbackImages;

  if (images.length === 0) {
    return '';
  }

  const index = Array.from(normalizedName).reduce(
    (total, character) => total + character.charCodeAt(0),
    0,
  ) % images.length;

  return images[index];
}
