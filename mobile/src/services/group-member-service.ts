import { apiRequest } from '../lib/api';
import type { GroupInvitation } from '../types/group-invitation';
import type { GroupMember } from '../types/group-member';

export function getGroupMembers(
  groupId: string,
  accessToken: string,
): Promise<GroupMember[]> {
  return apiRequest<GroupMember[]>(
    `/groups/${groupId}/members`,
    {
      method: 'GET',
    },
    accessToken,
  );
}

export function addGroupMember(
  groupId: string,
  payload: {
    username: string;
  },
  accessToken: string,
): Promise<GroupInvitation> {
  return apiRequest<GroupInvitation>(
    `/groups/${groupId}/invitations`,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
    accessToken,
  );
}

export function leaveGroup(
  groupId: string,
  accessToken: string,
): Promise<void> {
  return apiRequest<void>(
    `/groups/${groupId}/members/me`,
    {
      method: 'DELETE',
    },
    accessToken,
  );
}

export function removeGroupMember(
  groupId: string,
  memberUserId: string,
  accessToken: string,
): Promise<void> {
  return apiRequest<void>(
    `/groups/${groupId}/members/${memberUserId}`,
    {
      method: 'DELETE',
    },
    accessToken,
  );
}
