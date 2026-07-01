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