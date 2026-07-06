import type { GroupRestaurant } from './restaurant';

export type GroupPrivacy = 'PRIVATE' | 'PUBLIC';

export type RestaurantGroup = {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  city: string | null;
  privacy: GroupPrivacy;
  ownerUserId: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateGroupPayload = {
  name: string;
  description: string | null;
  imageUrl: string | null;
  city: string | null;
  privacy: GroupPrivacy;
};

export type UpdateGroupPayload = {
  name: string;
  description: string | null;
  city: string | null;
  privacy: GroupPrivacy;
};

export type GroupImageUploadFile = {
  uri: string;
};

export type PublicGroupOwner = {
  id: string;
  name: string;
  username: string;
  avatarUrl: string | null;
};

export type PublicGroupSummary = {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  city: string | null;
  owner: PublicGroupOwner;
  restaurantCount: number;
  collaboratorCount: number;
  followerCount: number;
  following: boolean;
  ownedByCurrentUser: boolean;
  updatedAt: string;
};

export type PublicGroupDetail = {
  group: PublicGroupSummary;
  restaurants: GroupRestaurant[];
};

export type CopyPublicRestaurantsPayload = {
  destinationGroupId: string;
  groupRestaurantIds: string[];
};

export type CopyPublicRestaurantsResult = {
  destinationGroupId: string;
  copiedCount: number;
  skippedCount: number;
  copiedGroupRestaurantIds: string[];
  skippedSourceGroupRestaurantIds: string[];
};
