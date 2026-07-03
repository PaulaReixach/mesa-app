import { apiRequest } from '../lib/api';
import {
  NotificationPreferences,
  UpdateNotificationPreferencesPayload,
} from '../types/notification';

export function getCurrentUserNotificationPreferences(
  accessToken: string,
): Promise<NotificationPreferences> {
  return apiRequest<NotificationPreferences>(
    '/users/me/notification-preferences',
    {
      method: 'GET',
    },
    accessToken,
  );
}

export function updateCurrentUserNotificationPreferences(
  payload: UpdateNotificationPreferencesPayload,
  accessToken: string,
): Promise<NotificationPreferences> {
  return apiRequest<NotificationPreferences>(
    '/users/me/notification-preferences',
    {
      method: 'PUT',
      body: JSON.stringify(payload),
    },
    accessToken,
  );
}