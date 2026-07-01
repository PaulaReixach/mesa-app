import { apiRequest } from '../lib/api';
import {
  CreateGroupPayload,
  RestaurantGroup,
} from '../types/group';

export function getGroups(
  accessToken: string,
): Promise<RestaurantGroup[]> {
  return apiRequest<RestaurantGroup[]>(
    '/groups',
    {
      method: 'GET',
    },
    accessToken,
  );
}

export function getGroup(
  groupId: string,
  accessToken: string,
): Promise<RestaurantGroup> {
  return apiRequest<RestaurantGroup>(
    `/groups/${groupId}`,
    {
      method: 'GET',
    },
    accessToken,
  );
}

export function createGroup(
  payload: CreateGroupPayload,
  accessToken: string,
): Promise<RestaurantGroup> {
  return apiRequest<RestaurantGroup>(
    '/groups',
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
    accessToken,
  );
}