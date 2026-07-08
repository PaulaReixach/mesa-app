export type RestaurantProposalStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'DUPLICATE';

export type RestaurantProposalUser = {
  id: string;
  name: string;
  username: string;
  avatarUrl: string | null;
};

export type RestaurantProposal = {
  id: string;
  groupId: string;
  proposedBy: RestaurantProposalUser;
  provider: string | null;
  externalPlaceId: string | null;
  name: string;
  address: string | null;
  city: string | null;
  country: string | null;
  latitude: number | null;
  longitude: number | null;
  category: string | null;
  message: string | null;
  status: RestaurantProposalStatus;
  createdGroupRestaurantId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateRestaurantProposalPayload = {
  provider: string | null;
  externalPlaceId: string | null;
  name: string;
  address: string | null;
  city: string | null;
  country: string | null;
  latitude: number | null;
  longitude: number | null;
  category: string | null;
  message: string | null;
};

export type RestaurantProposalPendingCount = {
  pendingCount: number;
};
