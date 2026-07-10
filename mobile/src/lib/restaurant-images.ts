import { restaurantFallbackImages } from '../constants/restaurant-fallback-images';
import { resolveApiUrl } from './api';

type RestaurantImageSource = {
  name: string;
  imageUrl: string | null;
};

const coverImagesByName = new Map<string, string>();

function normalizeName(name: string): string {
  return name.trim().toLocaleLowerCase('es');
}

export function registerRestaurantCoverImages(
  restaurants: RestaurantImageSource[],
): void {
  coverImagesByName.clear();

  restaurants.forEach(restaurant => {
    if (restaurant.imageUrl) {
      coverImagesByName.set(
        normalizeName(restaurant.name),
        resolveApiUrl(restaurant.imageUrl),
      );
    }
  });
}

export function getRestaurantFallbackImage(name: string): string {
  const normalizedName = name.trim() || 'restaurant';
  const coverImage = coverImagesByName.get(
    normalizeName(normalizedName),
  );

  if (coverImage) {
    return coverImage;
  }

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
