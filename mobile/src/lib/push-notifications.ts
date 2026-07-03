import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import {
  registerPushDevice,
  unregisterPushDevice,
} from '../services/notification-center-service';

const EXPO_PUSH_TOKEN_KEY =
  'mesa.expo-push-token';

export const ANDROID_NOTIFICATION_CHANNEL_ID =
  'mesa-activity-v2';

/*
 * Cuando Mesa está abierta no mostramos el banner
 * nativo, porque utilizamos nuestro propio banner
 * dentro de la aplicación.
 *
 * En segundo plano, Android sigue mostrando
 * la notificación del sistema normalmente.
 */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: false,
    shouldSetBadge: true,
    shouldShowBanner: false,
    shouldShowList: false,
  }),
});

export async function registerPushNotifications(
  accessToken: string,
): Promise<string | null> {
  if (Platform.OS === 'web') {
    return null;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(
      ANDROID_NOTIFICATION_CHANNEL_ID,
      {
        name: 'Actividad de Mesa',
        description:
          'Invitaciones y novedades de tus grupos.',

        importance:
          Notifications.AndroidImportance.HIGH,

        vibrationPattern: [
          0,
          250,
          200,
          250,
        ],

        lightColor: '#D56A4A',
        enableVibrate: true,
        showBadge: true,
      },
    );
  }

  const existingPermissions =
    await Notifications.getPermissionsAsync();

  let finalStatus =
    existingPermissions.status;

  if (finalStatus !== 'granted') {
    const requestedPermissions =
      await Notifications.requestPermissionsAsync({
        ios: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
        },
      });

    finalStatus =
      requestedPermissions.status;
  }

  if (finalStatus !== 'granted') {
    return null;
  }

  const projectId =
    Constants.expoConfig
      ?.extra
      ?.eas
      ?.projectId
    ?? Constants.easConfig
      ?.projectId;

  if (!projectId) {
    throw new Error(
      'No se ha encontrado el projectId de EAS.',
    );
  }

  const expoPushToken = (
    await Notifications.getExpoPushTokenAsync({
      projectId,
    })
  ).data;

  await registerPushDevice(
    {
      expoPushToken,

      platform:
        Platform.OS === 'ios'
          ? 'IOS'
          : 'ANDROID',

      deviceName:
        Device.modelName ?? null,
    },
    accessToken,
  );

  await SecureStore.setItemAsync(
    EXPO_PUSH_TOKEN_KEY,
    expoPushToken,
  );

  return expoPushToken;
}

export async function unregisterStoredPushDevice(
  accessToken: string,
): Promise<void> {
  const expoPushToken =
    await SecureStore.getItemAsync(
      EXPO_PUSH_TOKEN_KEY,
    );

  if (!expoPushToken) {
    return;
  }

  try {
    await unregisterPushDevice(
      {
        expoPushToken,
      },
      accessToken,
    );
  } finally {
    await SecureStore.deleteItemAsync(
      EXPO_PUSH_TOKEN_KEY,
    );
  }
}