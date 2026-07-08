import { apiRequest } from '../lib/api';
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
