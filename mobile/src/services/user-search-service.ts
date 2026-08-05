import { apiRequest } from '../lib/api';
import type { UserSearchResult } from '../types/user-search';

export function searchInvitableUsers(
  query: string,
  accessToken: string,
): Promise<UserSearchResult[]> {
  return apiRequest<UserSearchResult[]>(
    `/users/search?query=${encodeURIComponent(query.trim())}`,
    {
      method: 'GET',
    },
    accessToken,
  );
}
