import * as Notifications from 'expo-notifications';
import {
  Href,
  router,
} from 'expo-router';
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  AppState,
  Vibration,
} from 'react-native';

import { useAuth } from './auth-context';
import { registerPushNotifications } from '../lib/push-notifications';
import {
  getUnreadNotificationCount,
  markNotificationAsRead,
} from '../services/notification-center-service';

export type ForegroundNotification = {
  requestIdentifier: string;
  notificationId: string | null;
  title: string;
  body: string;
  url: string | null;
};

type NotificationContextValue = {
  unreadCount: number;

  foregroundNotification:
    ForegroundNotification | null;

  refreshUnreadCount:
    () => Promise<void>;

  dismissForegroundNotification:
    () => void;

  openForegroundNotification:
    () => Promise<void>;
};

const NotificationContext =
  createContext<NotificationContextValue | null>(
    null,
  );

type NotificationProviderProps = {
  children: ReactNode;
};

export function NotificationProvider({
  children,
}: NotificationProviderProps) {
  const {
    accessToken,
    isAuthenticated,
  } = useAuth();

  const [
    unreadCount,
    setUnreadCount,
  ] = useState(0);

  const [
    foregroundNotification,
    setForegroundNotification,
  ] =
    useState<ForegroundNotification | null>(
      null,
    );

  const handledNotificationId =
    useRef<string | null>(null);

  const refreshUnreadCount =
    useCallback(async (): Promise<void> => {
      if (!accessToken) {
        setUnreadCount(0);
        return;
      }

      try {
        const response =
          await getUnreadNotificationCount(
            accessToken,
          );

        setUnreadCount(
          response.unreadCount,
        );

        await Notifications.setBadgeCountAsync(
          response.unreadCount,
        );
      } catch {
        // El badge no debe impedir utilizar la app.
      }
    }, [accessToken]);

  const processNotificationInteraction =
    useCallback(
      async (
        notificationId: string | null,
        url: string | null,
      ): Promise<void> => {
        if (
          notificationId
          && accessToken
        ) {
          try {
            await markNotificationAsRead(
              notificationId,
              accessToken,
            );
          } catch {
            // La navegación seguirá funcionando
            // aunque no pueda marcarse como leída.
          }
        }

        await refreshUnreadCount();

        if (url) {
          router.push(
            url as Href,
          );
        }
      },
      [
        accessToken,
        refreshUnreadCount,
      ],
    );

  const dismissForegroundNotification =
    useCallback(() => {
      setForegroundNotification(null);
    }, []);

  const openForegroundNotification =
    useCallback(async (): Promise<void> => {
      if (!foregroundNotification) {
        return;
      }

      const {
        notificationId,
        url,
      } = foregroundNotification;

      setForegroundNotification(null);

      await processNotificationInteraction(
        notificationId,
        url,
      );
    }, [
      foregroundNotification,
      processNotificationInteraction,
    ]);

  const handleNotificationResponse =
    useCallback(
      async (
        response:
          Notifications.NotificationResponse,
      ): Promise<void> => {
        const notification =
          response.notification;

        const requestIdentifier =
          notification.request.identifier;

        if (
          handledNotificationId.current
          === requestIdentifier
        ) {
          return;
        }

        handledNotificationId.current =
          requestIdentifier;

        const data =
          notification.request.content.data
          ?? {};

        const notificationId =
          typeof data.notificationId
            === 'string'
            ? data.notificationId
            : null;

        const url =
          typeof data.url === 'string'
            ? data.url
            : null;

        await processNotificationInteraction(
          notificationId,
          url,
        );
      },
      [processNotificationInteraction],
    );

  useEffect(() => {
    if (
      !isAuthenticated
      || !accessToken
    ) {
      setUnreadCount(0);
      setForegroundNotification(null);

      void Notifications.setBadgeCountAsync(
        0,
      );

      return;
    }

    void refreshUnreadCount();

    void registerPushNotifications(
      accessToken,
    ).catch(() => {
      /*
       * El centro de notificaciones interno
       * funciona aunque las push no estén
       * disponibles.
       */
    });

    const receivedSubscription =
      Notifications
        .addNotificationReceivedListener(
          notification => {
            void refreshUnreadCount();

            if (
              AppState.currentState
              !== 'active'
            ) {
              return;
            }

            const content =
              notification.request.content;

            const data =
              content.data ?? {};

            const notificationId =
              typeof data.notificationId
                === 'string'
                ? data.notificationId
                : null;

            const url =
              typeof data.url === 'string'
                ? data.url
                : null;

            setForegroundNotification({
              requestIdentifier:
                notification.request.identifier,

              notificationId,

              title:
                content.title
                ?? 'Mesa',

              body:
                content.body
                ?? 'Tienes una nueva notificación.',

              url,
            });

            /*
             * Vibración corta propia para cuando
             * la aplicación está abierta.
             */
            Vibration.vibrate(140);
          },
        );

    const responseSubscription =
      Notifications
        .addNotificationResponseReceivedListener(
          response => {
            void handleNotificationResponse(
              response,
            );
          },
        );

    const lastResponse =
      Notifications
        .getLastNotificationResponse();

    if (lastResponse) {
      void handleNotificationResponse(
        lastResponse,
      );
    }

    return () => {
      receivedSubscription.remove();
      responseSubscription.remove();
    };
  }, [
    accessToken,
    handleNotificationResponse,
    isAuthenticated,
    refreshUnreadCount,
  ]);

  const value =
    useMemo<NotificationContextValue>(
      () => ({
        unreadCount,

        foregroundNotification,

        refreshUnreadCount,

        dismissForegroundNotification,

        openForegroundNotification,
      }),
      [
        dismissForegroundNotification,
        foregroundNotification,
        openForegroundNotification,
        refreshUnreadCount,
        unreadCount,
      ],
    );

  return (
    <NotificationContext.Provider
      value={value}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications():
NotificationContextValue {
  const context =
    useContext(NotificationContext);

  if (!context) {
    throw new Error(
      'useNotifications debe utilizarse dentro de NotificationProvider.',
    );
  }

  return context;
}