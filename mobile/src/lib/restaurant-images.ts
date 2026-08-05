import { restaurantFallbackImages } from '../constants/restaurant-fallback-images';

function pickFallbackImage(name: string, images: readonly string[]): string {
  const normalizedName = name.trim() || 'restaurant';

  if (images.length === 0) {
    return '';
  }

  const index = Array.from(normalizedName).reduce(
    (total, character) => total + character.charCodeAt(0),
    0,
  ) % images.length;

  return images[index];
}

export function getRestaurantFallbackImage(name: string): string {
  return pickFallbackImage(name, restaurantFallbackImages);
}

export function getRestaurantInteriorFallbackImage(name: string): string {
  return pickFallbackImage(name, restaurantFallbackImages.slice(0, 2));
}
