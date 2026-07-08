import { apiRequest } from '../lib/api';
import type {
  CreateGroupInvitationPayload,
  GroupInvitation,
} from '../types/group-invitation';

export function createGroupInvitation(
  groupId: string,
  payload: CreateGroupInvitationPayload,
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

export function getGroupInvitations(
  groupId: string,
  accessToken: string,
): Promise<GroupInvitation[]> {
  return apiRequest<GroupInvitation[]>(
    `/groups/${groupId}/invitations`,
    {
      method: 'GET',
    },
    accessToken,
  );
}

export function cancelGroupInvitation(
  groupId: string,
  invitationId: string,
  accessToken: string,
): Promise<void> {
  return apiRequest<void>(
    `/groups/${groupId}/invitations/${invitationId}`,
    {
      method: 'DELETE',
    },
    accessToken,
  );
}

export function getMyGroupInvitations(
  accessToken: string,
): Promise<GroupInvitation[]> {
  return apiRequest<GroupInvitation[]>(
    '/group-invitations/me',
    {
      method: 'GET',
    },
    accessToken,
  );
}

export function acceptGroupInvitation(
  invitationId: string,
  accessToken: string,
): Promise<GroupInvitation> {
  return apiRequest<GroupInvitation>(
    `/group-invitations/${invitationId}/accept`,
    {
      method: 'POST',
    },
    accessToken,
  );
}

export function rejectGroupInvitation(
  invitationId: string,
  accessToken: string,
): Promise<GroupInvitation> {
  return apiRequest<GroupInvitation>(
    `/group-invitations/${invitationId}/reject`,
    {
      method: 'POST',
    },
    accessToken,
  );
}
