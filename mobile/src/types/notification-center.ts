export type NotificationFilter =
  | 'ALL'
  | 'INVITATIONS'
  | 'ACTIVITY';

export type NotificationType =
  | 'GROUP_INVITATION'
  | 'NEW_RESTAURANT'
  | 'RESTAURANT_STATUS_CHANGED'
  | 'RESTAURANT_RATED'
  | 'GROUP_ACTIVITY';

export type NotificationCategory =
  | 'INVITATIONS'
  | 'ACTIVITY';

export type AppNotification = {
  id: string;
  type: NotificationType;
  category: NotificationCategory;
  title: string;
  message: string;
  actorUserId: string | null;
  actorName: string | null;
  actorAvatarUrl: string | null;
  targetUrl: string | null;
  read: boolean;
  readAt: string | null;
  createdAt: string;
};

export type NotificationPage = {
  items: AppNotification[];
  page: number;
  size: number;
  hasMore: boolean;
  unreadCount: number;
};

export type UnreadNotificationCount = {
  unreadCount: number;
};

export type PushPlatform =
  | 'ANDROID'
  | 'IOS';

export type RegisterPushDevicePayload = {
  expoPushToken: string;
  platform: PushPlatform;
  deviceName: string | null;
};

export type UnregisterPushDevicePayload = {
  expoPushToken: string;
};