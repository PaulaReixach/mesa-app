import type { RestaurantGroup } from '../types/group';
import type { GroupRestaurant } from '../types/restaurant';

export type SavedPlace = { group: RestaurantGroup; restaurant: GroupRestaurant };

/** Places the group has ruled out are never suggested. */
export function eligiblePlaces(places: SavedPlace[]): SavedPlace[] {
  return places.filter(({ restaurant }) => restaurant.status !== 'DO_NOT_REPEAT' && restaurant.status !== 'ARCHIVED');
}

export function placeCity({ group, restaurant }: SavedPlace): string | null {
  return restaurant.restaurant.city?.trim() || group.city?.trim() || null;
}

/** Cities with eligible places, the one with most places first (ties alphabetically). */
export function listCities(places: SavedPlace[]): string[] {
  const counts = new Map<string, number>();
  for (const place of eligiblePlaces(places)) {
    const city = placeCity(place);
    if (city) counts.set(city, (counts.get(city) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort(([leftCity, left], [rightCity, right]) => right - left || leftCity.localeCompare(rightCity, 'es'))
    .map(([city]) => city);
}

export function candidatesIn(places: SavedPlace[], city: string | null): SavedPlace[] {
  const eligible = eligiblePlaces(places);
  return city === null ? eligible : eligible.filter(place => placeCity(place) === city);
}

function isFavorite({ restaurant }: SavedPlace): boolean {
  return restaurant.favorite || restaurant.status === 'FAVORITE';
}

function byScore(left: SavedPlace, right: SavedPlace): number {
  const leftScore = left.restaurant.averageScore ?? -1;
  const rightScore = right.restaurant.averageScore ?? -1;
  if (rightScore !== leftScore) return rightScore - leftScore;
  if (right.restaurant.ratingsCount !== left.restaurant.ratingsCount) {
    return right.restaurant.ratingsCount - left.restaurant.ratingsCount;
  }
  return new Date(right.restaurant.updatedAt).getTime() - new Date(left.restaurant.updatedAt).getTime();
}

/** First pick: a rated favourite if there is one, otherwise the best average. */
export function pickInitial(candidates: SavedPlace[]): SavedPlace | null {
  if (candidates.length === 0) return null;
  const ratedFavorites = candidates.filter(place => isFavorite(place) && place.restaurant.ratingsCount > 0);
  return [...(ratedFavorites.length > 0 ? ratedFavorites : candidates)].sort(byScore)[0];
}

/** "Otro sitio": a random different candidate, or null when there is no other. */
export function pickAnother(
  candidates: SavedPlace[],
  currentId: string | null,
  random: () => number = Math.random,
): SavedPlace | null {
  const others = candidates.filter(place => place.restaurant.id !== currentId);
  if (others.length === 0) return null;
  return others[Math.floor(random() * others.length)];
}
