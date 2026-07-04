import { File } from 'expo-file-system';

import {
  apiMultipartRequest,
  apiRequest,
} from '../lib/api';
import {
  CreateGroupPayload,
  GroupImageUploadFile,
  RestaurantGroup,
  UpdateGroupPayload,
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

export function updateGroup(
  groupId: string,
  payload: UpdateGroupPayload,
  accessToken: string,
): Promise<RestaurantGroup> {
  return apiRequest<RestaurantGroup>(
    `/groups/${groupId}`,
    {
      method: 'PUT',
      body: JSON.stringify(payload),
    },
    accessToken,
  );
}

export function uploadGroupImage(
  groupId: string,
  file: GroupImageUploadFile,
  accessToken: string,
): Promise<RestaurantGroup> {
  const groupImageFile =
    new File(file.uri);

  if (!groupImageFile.exists) {
    throw new Error(
      'No se ha podido acceder a la imagen seleccionada.',
    );
  }

  const formData = new FormData();

  formData.append(
    'file',
    groupImageFile,
  );

  return apiMultipartRequest<RestaurantGroup>(
    `/groups/${groupId}/image`,
    formData,
    accessToken,
    'PUT',
  );
}

export function deleteGroupImage(
  groupId: string,
  accessToken: string,
): Promise<RestaurantGroup> {
  return apiRequest<RestaurantGroup>(
    `/groups/${groupId}/image`,
    {
      method: 'DELETE',
    },
    accessToken,
  );
}
