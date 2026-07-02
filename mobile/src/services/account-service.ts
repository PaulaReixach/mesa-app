import { apiRequest } from '../lib/api';
import {
  ChangePasswordPayload,
  DeleteAccountPayload,
} from '../types/account';

export function changeCurrentUserPassword(
  payload: ChangePasswordPayload,
  accessToken: string,
): Promise<void> {
  return apiRequest<void>(
    '/users/me/password',
    {
      method: 'PUT',
      body: JSON.stringify(payload),
    },
    accessToken,
  );
}

export function deleteCurrentUserAccount(
  payload: DeleteAccountPayload,
  accessToken: string,
): Promise<void> {
  return apiRequest<void>(
    '/users/me',
    {
      method: 'DELETE',
      body: JSON.stringify(payload),
    },
    accessToken,
  );
}