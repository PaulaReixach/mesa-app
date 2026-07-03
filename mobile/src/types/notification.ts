export type NotificationPreferences = {
  notificationsEnabled: boolean;
  newRestaurantsEnabled: boolean;
  restaurantStatusEnabled: boolean;
  ratingsEnabled: boolean;
  groupActivityEnabled: boolean;
  updatedAt: string;
};

export type UpdateNotificationPreferencesPayload = {
  notificationsEnabled: boolean;
  newRestaurantsEnabled: boolean;
  restaurantStatusEnabled: boolean;
  ratingsEnabled: boolean;
  groupActivityEnabled: boolean;
};