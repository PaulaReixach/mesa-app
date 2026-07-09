import type { MapRestaurant } from './map';

declare global {
  type RestaurantRowProps = {
    onFavoritePress: () => void;
    onPress: () => void;
    restaurant: MapRestaurant & {
      distanceKm: number | null;
    };
    selected: boolean;
    updating: boolean;
  };
}

export {};
