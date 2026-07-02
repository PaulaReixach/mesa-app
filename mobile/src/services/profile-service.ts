import { File } from 'expo-file-system';

import {
  apiMultipartRequest,
  apiRequest,
} from '../lib/api';
import { User } from '../types/auth';
import {
  AvatarUploadFile,
  UpdateUserProfilePayload,
  UserProfileStats,
} from '../types/profile';

export function getCurrentUserProfileStats(
  accessToken: string,
): Promise<UserProfileStats> {
  return apiRequest<UserProfileStats>(
    '/users/me/stats',
    {
      method: 'GET',
    },
    accessToken,
  );
}

export function updateCurrentUserProfile(
  payload: UpdateUserProfilePayload,
  accessToken: string,
): Promise<User> {
  return apiRequest<User>(
    '/users/me',
    {
      method: 'PUT',
      body: JSON.stringify(payload),
    },
    accessToken,
  );
}

export function uploadCurrentUserAvatar(
  file: AvatarUploadFile,
  accessToken: string,
): Promise<User> {
  const avatarFile =
    new File(file.uri);

  if (!avatarFile.exists) {
    throw new Error(
      'No se ha podido acceder a la imagen seleccionada.',
    );
  }

  const formData = new FormData();

  formData.append(
    'file',
    avatarFile,
  );

  return apiMultipartRequest<User>(
    '/users/me/avatar',
    formData,
    accessToken,
    'PUT',
  );
}

export function deleteCurrentUserAvatar(
  accessToken: string,
): Promise<User> {
  return apiRequest<User>(
    '/users/me/avatar',
    {
      method: 'DELETE',
    },
    accessToken,
  );
}