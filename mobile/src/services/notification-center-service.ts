import { apiRequest } from '../lib/api';
import {
  AppNotification,
  NotificationFilter,
  NotificationPage,
  RegisterPushDevicePayload,
  UnreadNotificationCount,
  UnregisterPushDevicePayload,
} from '../types/notification-center';

export function getNotifications(
  filter: NotificationFilter,
  page: number,
  size: number,
  accessToken: string,
): Promise<NotificationPage> {
  return apiRequest<NotificationPage>(
    `/notifications?filter=${filter}&page=${page}&size=${size}`,
    {
      method: 'GET',
    },
    accessToken,
  );
}

export function getUnreadNotificationCount(
  accessToken: string,
): Promise<UnreadNotificationCount> {
  return apiRequest<UnreadNotificationCount>(
    '/notifications/unread-count',
    {
      method: 'GET',
    },
    accessToken,
  );
}

export function markNotificationAsRead(
  notificationId: string,
  accessToken: string,
): Promise<AppNotification> {
  return apiRequest<AppNotification>(
    `/notifications/${notificationId}/read`,
    {
      method: 'PATCH',
    },
    accessToken,
  );
}

export function markAllNotificationsAsRead(
  accessToken: string,
): Promise<void> {
  return apiRequest<void>(
    '/notifications/read-all',
    {
      method: 'PATCH',
    },
    accessToken,
  );
}

export function registerPushDevice(
  payload: RegisterPushDevicePayload,
  accessToken: string,
): Promise<void> {
  return apiRequest<void>(
    '/users/me/push-devices',
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
    accessToken,
  );
}

export function unregisterPushDevice(
  payload: UnregisterPushDevicePayload,
  accessToken: string,
): Promise<void> {
  return apiRequest<void>(
    '/users/me/push-devices',
    {
      method: 'DELETE',
      body: JSON.stringify(payload),
    },
    accessToken,
  );
}