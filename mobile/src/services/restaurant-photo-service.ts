import { File } from 'expo-file-system';

import {
  apiMultipartRequest,
  apiRequest,
} from '../lib/api';
import type {
  RestaurantPhoto,
  RestaurantPhotoUploadFile,
} from '../types/restaurant-photo';

function photoBasePath(
  groupId: string,
  groupRestaurantId: string,
): string {
  return `/groups/${groupId}/restaurants/${groupRestaurantId}/photos`;
}

export function getRestaurantPhotos(
  groupId: string,
  groupRestaurantId: string,
  accessToken: string,
): Promise<RestaurantPhoto[]> {
  return apiRequest<RestaurantPhoto[]>(
    photoBasePath(groupId, groupRestaurantId),
    { method: 'GET' },
    accessToken,
  );
}

export function uploadRestaurantPhoto(
  groupId: string,
  groupRestaurantId: string,
  photo: RestaurantPhotoUploadFile,
  accessToken: string,
): Promise<RestaurantPhoto> {
  const photoFile = new File(photo.uri);

  if (!photoFile.exists) {
    throw new Error('No se ha podido acceder a la imagen seleccionada.');
  }

  const formData = new FormData();
  formData.append('file', photoFile);

  return apiMultipartRequest<RestaurantPhoto>(
    photoBasePath(groupId, groupRestaurantId),
    formData,
    accessToken,
    'POST',
  );
}

export function deleteRestaurantPhoto(
  groupId: string,
  groupRestaurantId: string,
  photoId: string,
  accessToken: string,
): Promise<void> {
  return apiRequest<void>(
    `${photoBasePath(groupId, groupRestaurantId)}/${photoId}`,
    { method: 'DELETE' },
    accessToken,
  );
}
