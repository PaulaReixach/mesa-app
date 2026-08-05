import {
  Directory,
  File,
  Paths,
} from 'expo-file-system';

import {
  apiMultipartRequest,
  apiRequest,
  resolveApiUrl,
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

const photoCacheDirectory = new Directory(
  Paths.cache,
  'mesa-restaurant-photos',
);

function cachedRestaurantPhotoFile(photoId: string): File {
  return new File(
    photoCacheDirectory,
    `${photoId}.image`,
  );
}

export function clearCachedRestaurantPhoto(photoId: string): void {
  const cachedPhoto = cachedRestaurantPhotoFile(photoId);

  if (cachedPhoto.exists) {
    cachedPhoto.delete();
  }
}

export async function getCachedRestaurantPhotoUri(
  photoId: string,
  imageUrl: string,
  accessToken: string,
): Promise<string> {
  photoCacheDirectory.create({
    idempotent: true,
    intermediates: true,
  });

  const cachedPhoto = cachedRestaurantPhotoFile(photoId);

  if (cachedPhoto.exists && cachedPhoto.size > 0) {
    return cachedPhoto.uri;
  }

  if (cachedPhoto.exists) {
    cachedPhoto.delete();
  }

  try {
    const downloadedPhoto = await File.downloadFileAsync(
      resolveApiUrl(imageUrl),
      cachedPhoto,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        idempotent: true,
      },
    );

    if (!downloadedPhoto.exists || downloadedPhoto.size <= 0) {
      throw new Error('La foto descargada está vacía.');
    }

    return downloadedPhoto.uri;
  } catch (error) {
    if (cachedPhoto.exists) {
      cachedPhoto.delete();
    }

    throw error;
  }
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
