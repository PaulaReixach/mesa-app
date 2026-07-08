import { apiRequest } from '../lib/api';
import type { GroupMember } from '../types/group-member';

export function getPublicGroupCollaborators(
  groupId: string,
  accessToken: string,
): Promise<GroupMember[]> {
  return apiRequest<GroupMember[]>(
    `/groups/public/${groupId}/collaborators`,
    {
      method: 'GET',
    },
    accessToken,
  );
}
