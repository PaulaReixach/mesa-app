import type { GroupRestaurant } from '../types/restaurant';

export type GroupRestaurantSectionKey =
  | 'pending'
  | 'visited'
  | 'archived';

const visitedRestaurantStatuses = new Set<GroupRestaurant['status']>([
  'VISITED',
  'FAVORITE',
  'WANT_TO_REPEAT',
  'DO_NOT_REPEAT',
]);

function sortFavoriteFirst(
  first: GroupRestaurant,
  second: GroupRestaurant,
): number {
  if (first.favorite !== second.favorite) {
    return first.favorite ? -1 : 1;
  }

  return 0;
}

function sortPendingRestaurants(
  first: GroupRestaurant,
  second: GroupRestaurant,
): number {
  const favoriteOrder = sortFavoriteFirst(first, second);

  if (favoriteOrder !== 0) {
    return favoriteOrder;
  }

  return second.createdAt.localeCompare(first.createdAt);
}

function sortVisitedRestaurants(
  first: GroupRestaurant,
  second: GroupRestaurant,
): number {
  const favoriteOrder = sortFavoriteFirst(first, second);

  if (favoriteOrder !== 0) {
    return favoriteOrder;
  }

  const firstScore = first.averageScore ?? -1;
  const secondScore = second.averageScore ?? -1;

  if (firstScore !== secondScore) {
    return secondScore - firstScore;
  }

  return second.updatedAt.localeCompare(first.updatedAt);
}

export function isGroupRestaurantSectionKey(
  value: string | undefined,
): value is GroupRestaurantSectionKey {
  return value === 'pending'
    || value === 'visited'
    || value === 'archived';
}

export function getGroupRestaurantSectionItems(
  restaurants: GroupRestaurant[],
  section: GroupRestaurantSectionKey,
): GroupRestaurant[] {
  if (section === 'pending') {
    return restaurants
      .filter(item => item.status === 'WANT_TO_GO')
      .sort(sortPendingRestaurants);
  }

  if (section === 'visited') {
    return restaurants
      .filter(item => visitedRestaurantStatuses.has(item.status))
      .sort(sortVisitedRestaurants);
  }

  return restaurants
    .filter(item => item.status === 'ARCHIVED')
    .sort((first, second) =>
      second.updatedAt.localeCompare(first.updatedAt)
    );
}

function normalizeSearchValue(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export function matchesGroupRestaurantSearch(
  item: GroupRestaurant,
  query: string,
): boolean {
  const normalizedQuery = normalizeSearchValue(query);

  if (!normalizedQuery) {
    return true;
  }

  const searchableValues = [
    item.restaurant.name,
    item.restaurant.category,
    item.restaurant.address,
    item.restaurant.city,
    item.restaurant.country,
  ];

  return searchableValues.some(value =>
    value
    && normalizeSearchValue(value).includes(normalizedQuery)
  );
}
