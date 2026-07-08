import { apiRequest } from '../lib/api';
import type {
  CreateRestaurantProposalPayload,
  RestaurantProposal,
  RestaurantProposalPendingCount,
} from '../types/restaurant-proposal';

export function createRestaurantProposal(
  groupId: string,
  payload: CreateRestaurantProposalPayload,
  accessToken: string,
): Promise<RestaurantProposal> {
  return apiRequest<RestaurantProposal>(
    `/groups/public/${groupId}/restaurant-proposals`,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
    accessToken,
  );
}

export function getMyRestaurantProposals(
  groupId: string,
  accessToken: string,
): Promise<RestaurantProposal[]> {
  return apiRequest<RestaurantProposal[]>(
    `/groups/public/${groupId}/restaurant-proposals/me`,
    { method: 'GET' },
    accessToken,
  );
}

export function cancelRestaurantProposal(
  groupId: string,
  proposalId: string,
  accessToken: string,
): Promise<RestaurantProposal> {
  return apiRequest<RestaurantProposal>(
    `/groups/public/${groupId}/restaurant-proposals/${proposalId}`,
    { method: 'DELETE' },
    accessToken,
  );
}

export function getRestaurantProposals(
  groupId: string,
  accessToken: string,
): Promise<RestaurantProposal[]> {
  return apiRequest<RestaurantProposal[]>(
    `/groups/public/${groupId}/restaurant-proposals`,
    { method: 'GET' },
    accessToken,
  );
}

export function getRestaurantProposalPendingCount(
  groupId: string,
  accessToken: string,
): Promise<RestaurantProposalPendingCount> {
  return apiRequest<RestaurantProposalPendingCount>(
    `/groups/public/${groupId}/restaurant-proposals/pending-count`,
    { method: 'GET' },
    accessToken,
  );
}

export function acceptRestaurantProposal(
  groupId: string,
  proposalId: string,
  accessToken: string,
): Promise<RestaurantProposal> {
  return apiRequest<RestaurantProposal>(
    `/groups/public/${groupId}/restaurant-proposals/${proposalId}/accept`,
    { method: 'POST' },
    accessToken,
  );
}

export function rejectRestaurantProposal(
  groupId: string,
  proposalId: string,
  accessToken: string,
): Promise<RestaurantProposal> {
  return apiRequest<RestaurantProposal>(
    `/groups/public/${groupId}/restaurant-proposals/${proposalId}/reject`,
    { method: 'POST' },
    accessToken,
  );
}
