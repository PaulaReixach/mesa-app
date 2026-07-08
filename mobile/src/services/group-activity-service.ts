import { apiRequest } from '../lib/api';
import type { GroupActivityItem } from '../types/group-activity';

export function getGroupActivity(
  groupId: string,
  accessToken: string,
): Promise<GroupActivityItem[]> {
  return apiRequest<GroupActivityItem[]>(
    `/groups/${groupId}/activity`,
    { method: 'GET' },
    accessToken,
  );
}
