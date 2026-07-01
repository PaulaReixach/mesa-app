export type GroupRole = 'OWNER' | 'MEMBER';

export type GroupMember = {
  id: string;
  userId: string;
  name: string;
  username: string;
  avatarUrl: string | null;
  role: GroupRole;
  joinedAt: string;
};

export type AddGroupMemberPayload = {
  username: string;
};