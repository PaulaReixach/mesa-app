export type GroupRestaurantStatus =
  | 'WANT_TO_GO'
  | 'VISITED'
  | 'FAVORITE'
  | 'WANT_TO_REPEAT'
  | 'DO_NOT_REPEAT'
  | 'ARCHIVED';

export type Restaurant = {
  id: string;
  provider: string | null;
  externalPlaceId: string | null;
  name: string;
  address: string | null;
  city: string | null;
  country: string | null;
  latitude: number | null;
  longitude: number | null;
  category: string | null;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

export type GroupRestaurant = {
  id: string;
  groupId: string;
  status: GroupRestaurantStatus;
  favorite: boolean;
  proposedByUserId: string;
  groupNotes: string | null;
  createdAt: string;
  updatedAt: string;
  averageScore: number | null;
  ratingsCount: number;
  restaurant: Restaurant;
};

export type CreateGroupRestaurantPayload = {
  provider: string | null;
  externalPlaceId: string | null;
  name: string;
  address: string | null;
  city: string | null;
  country: string | null;
  latitude: number | null;
  longitude: number | null;
  category: string | null;
  groupNotes: string | null;
};

export type UpdateGroupRestaurantPayload = {
  name: string;
  address: string | null;
  city: string | null;
  country: string | null;
  category: string | null;
  groupNotes: string | null;
};

export type RestaurantSearchResult = {
  provider: string;
  externalPlaceId: string;
  name: string;
  address: string | null;
  city: string | null;
  country: string | null;
  latitude: number;
  longitude: number;
  category: string | null;
};

export type RestaurantLocationResult = {
  label: string;
  address: string | null;
  city: string | null;
  country: string | null;
  latitude: number;
  longitude: number;
};

export type RestaurantImageUploadFile = {
  uri: string;
};

export type UpdateGroupRestaurantStatusPayload = {
  status: GroupRestaurantStatus;
};

export type UpdateGroupRestaurantFavoritePayload = {
  favorite: boolean;
};
