type RestaurantRowProps = {
  onFavoritePress: () => void;
  onPress: () => void;
  restaurant: import('./map').MapRestaurant & {
    distanceKm: number | null;
  };
  selected: boolean;
  updating: boolean;
};
