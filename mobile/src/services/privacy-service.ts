import { apiRequest } from '../lib/api';
import {
  PrivacyPreferences,
  UpdatePrivacyPreferencesPayload,
} from '../types/privacy';

export function getCurrentUserPrivacyPreferences(
  accessToken: string,
): Promise<PrivacyPreferences> {
  return apiRequest<PrivacyPreferences>(
    '/users/me/privacy-preferences',
    {
      method: 'GET',
    },
    accessToken,
  );
}

export function updateCurrentUserPrivacyPreferences(
  payload: UpdatePrivacyPreferencesPayload,
  accessToken: string,
): Promise<PrivacyPreferences> {
  return apiRequest<PrivacyPreferences>(
    '/users/me/privacy-preferences',
    {
      method: 'PUT',
      body: JSON.stringify(payload),
    },
    accessToken,
  );
}