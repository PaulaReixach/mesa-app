import {
  GroupRestaurantStatus,
} from './restaurant';

export type MapRestaurant = {
  groupRestaurantId: string;
  groupId: string;
  groupName: string;

  status: GroupRestaurantStatus;
  favorite: boolean;

  restaurantId: string;
  name: string;
  address: string | null;
  city: string | null;
  country: string | null;

  latitude: number;
  longitude: number;

  category: string | null;
};
