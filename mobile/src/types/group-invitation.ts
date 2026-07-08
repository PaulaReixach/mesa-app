import type { GroupPrivacy } from './group';

export type GroupInvitationStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'CANCELLED';

export type GroupInvitationUser = {
  userId: string;
  name: string;
  username: string;
  avatarUrl: string | null;
};

export type GroupInvitation = {
  id: string;
  groupId: string;
  groupName: string;
  groupPrivacy: GroupPrivacy;
  invitedUser: GroupInvitationUser;
  invitedBy: GroupInvitationUser;
  status: GroupInvitationStatus;
  createdAt: string;
  updatedAt: string;
};

export type CreateGroupInvitationPayload = {
  username: string;
};
