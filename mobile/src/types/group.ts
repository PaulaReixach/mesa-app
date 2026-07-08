import type { GroupRole } from './group-member';
import type { GroupRestaurant } from './restaurant';

export type GroupPrivacy = 'PRIVATE' | 'PUBLIC';

export type CollaborationRequestStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'CANCELLED';

export type RestaurantGroup = {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  city: string | null;
  privacy: GroupPrivacy;
  acceptingCollaborators: boolean;
  currentUserRole: GroupRole | null;
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
  acceptingCollaborators?: boolean;
};

export type UpdateGroupPayload = {
  name: string;
  description: string | null;
  city: string | null;
  privacy: GroupPrivacy;
  acceptingCollaborators?: boolean;
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

export type PublicGroupCollaborationState = {
  acceptingCollaborators: boolean;
  collaborating: boolean;
  requestStatus: CollaborationRequestStatus | null;
  retryAt: string | null;
  pendingRequestCount: number;
};

export type CollaborationRequester = {
  id: string;
  name: string;
  username: string;
  avatarUrl: string | null;
};

export type CollaborationRequest = {
  id: string;
  groupId: string;
  requester: CollaborationRequester;
  message: string | null;
  status: CollaborationRequestStatus;
  createdAt: string;
  updatedAt: string;
  retryAt: string | null;
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
