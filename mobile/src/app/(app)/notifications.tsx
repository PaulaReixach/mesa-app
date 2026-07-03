import { SymbolView } from 'expo-symbols';
import {
  Href,
  router,
  useFocusEffect,
} from 'expo-router';
import {
  ComponentProps,
  useCallback,
  useMemo,
  useState,
} from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  SafeAreaView,
} from 'react-native-safe-area-context';

import {
  useAuth,
} from '../../contexts/auth-context';
import {
  useNotifications,
} from '../../contexts/notification-context';
import {
  getErrorMessage,
  resolveApiUrl,
} from '../../lib/api';
import {
  deleteAllNotifications,
  deleteNotification,
  getNotifications,
  markAllNotificationsAsRead,
} from '../../services/notification-center-service';
import { colors } from '../../theme/colors';
import {
  AppNotification,
  NotificationFilter,
  NotificationType,
} from '../../types/notification-center';

type SymbolName =
  ComponentProps<typeof SymbolView>['name'];

type FilterOption = {
  value: NotificationFilter;
  label: string;
};

type NotificationSection = {
  title: string;
  items: AppNotification[];
};

type NotificationCardProps = {
  notification: AppNotification;
  deleting: boolean;
  onDelete: () => void;
  onPress: () => void;
};

const PAGE_SIZE = 8;

const filters: FilterOption[] = [
  {
    value: 'ALL',
    label: 'Todas',
  },
  {
    value: 'INVITATIONS',
    label: 'Invitaciones',
  },
  {
    value: 'ACTIVITY',
    label: 'Actividad',
  },
];

function getNotificationIcon(
  type: NotificationType,
): SymbolName {
  switch (type) {
    case 'GROUP_INVITATION':
      return {
        ios: 'person.2.fill',
        android: 'group_add',
        web: 'group_add',
      };

    case 'NEW_RESTAURANT':
      return {
        ios: 'fork.knife',
        android: 'restaurant',
        web: 'restaurant',
      };

    case 'RESTAURANT_STATUS_CHANGED':
      return {
        ios: 'arrow.triangle.2.circlepath',
        android: 'sync',
        web: 'sync',
      };

    case 'RESTAURANT_RATED':
      return {
        ios: 'star.fill',
        android: 'star',
        web: 'star',
      };

    case 'GROUP_ACTIVITY':
      return {
        ios: 'bell.fill',
        android: 'notifications',
        web: 'notifications',
      };
  }
}

function getSectionKey(
  dateValue: string,
): string {
  const date = new Date(dateValue);

  return [
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  ].join('-');
}

function isSameDay(
  first: Date,
  second: Date,
): boolean {
  return (
    first.getFullYear()
      === second.getFullYear()
    && first.getMonth()
      === second.getMonth()
    && first.getDate()
      === second.getDate()
  );
}

function getSectionTitle(
  dateValue: string,
): string {
  const date = new Date(dateValue);
  const today = new Date();

  const yesterday = new Date(today);

  yesterday.setDate(
    today.getDate() - 1,
  );

  if (isSameDay(date, today)) {
    return 'Hoy';
  }

  if (isSameDay(date, yesterday)) {
    return 'Ayer';
  }

  return date.toLocaleDateString(
    'es-ES',
    {
      day: 'numeric',
      month: 'long',
    },
  );
}

function formatRelativeTime(
  dateValue: string,
): string {
  const date = new Date(dateValue);

  const differenceMs =
    Date.now() - date.getTime();

  const minutes = Math.max(
    Math.floor(
      differenceMs / 60000,
    ),
    0,
  );

  if (minutes < 1) {
    return 'Ahora';
  }

  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours =
    Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours}h`;
  }

  return date.toLocaleDateString(
    'es-ES',
    {
      day: 'numeric',
      month: 'short',
    },
  );
}

function buildSections(
  notifications: AppNotification[],
): NotificationSection[] {
  const sections =
    new Map<
      string,
      NotificationSection
    >();

  notifications.forEach(
    notification => {
      const key =
        getSectionKey(
          notification.createdAt,
        );

      const existingSection =
        sections.get(key);

      if (existingSection) {
        existingSection.items.push(
          notification,
        );

        return;
      }

      sections.set(
        key,
        {
          title:
            getSectionTitle(
              notification.createdAt,
            ),
          items: [notification],
        },
      );
    },
  );

  return Array.from(
    sections.values(),
  );
}

function NotificationCard({
  notification,
  deleting,
  onDelete,
  onPress,
}: NotificationCardProps) {
  const avatarUri =
    notification.actorAvatarUrl
      ? resolveApiUrl(
          notification.actorAvatarUrl,
        )
      : null;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.notificationCard,

        !notification.read
          ? styles.notificationCardUnread
          : null,

        pressed
          ? styles.notificationCardPressed
          : null,
      ]}
    >
      <View style={styles.notificationAvatar}>
        {avatarUri ? (
          <Image
            source={{
              uri: avatarUri,
            }}
            style={styles.avatarImage}
          />
        ) : (
          <SymbolView
            name={getNotificationIcon(
              notification.type,
            )}
            size={21}
            tintColor={colors.primary}
          />
        )}

        {!notification.read ? (
          <View
            style={styles.unreadAvatarDot}
          />
        ) : null}
      </View>

      <View style={styles.notificationContent}>
        <Text
          numberOfLines={2}
          style={styles.notificationTitle}
        >
          {notification.title}
        </Text>

        <Text
          numberOfLines={3}
          style={styles.notificationMessage}
        >
          {notification.message}
        </Text>
      </View>

      <Pressable
        accessibilityLabel="Borrar notificación"
        accessibilityRole="button"
        disabled={deleting}
        hitSlop={10}
        onPress={event => {
          event.stopPropagation();
          onDelete();
        }}
        style={({ pressed }) => [
          styles.deleteNotificationButton,

          pressed
            ? styles.deleteNotificationButtonPressed
            : null,
        ]}
      >
        {deleting ? (
          <ActivityIndicator
            size={13}
            color={colors.muted}
          />
        ) : (
          <SymbolView
            name={{
              ios: 'xmark',
              android: 'close',
              web: 'close',
            }}
            size={13}
            tintColor={colors.muted}
          />
        )}
      </Pressable>

      <View style={styles.notificationTimeContainer}>
        {!notification.read ? (
          <View style={styles.unreadDot} />
        ) : null}

        <Text style={styles.notificationTime}>
          {formatRelativeTime(
            notification.createdAt,
          )}
        </Text>
      </View>
    </Pressable>
  );
}

export default function NotificationsScreen() {
  const {
    accessToken,
  } = useAuth();

  const {
    refreshUnreadCount,
  } = useNotifications();

  const [
    selectedFilter,
    setSelectedFilter,
  ] =
    useState<NotificationFilter>(
      'ALL',
    );

  const [
    notifications,
    setNotifications,
  ] =
    useState<AppNotification[]>(
      [],
    );

  const [
    currentPage,
    setCurrentPage,
  ] = useState(0);

  const [
    hasMore,
    setHasMore,
  ] = useState(false);

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [
    isRefreshing,
    setIsRefreshing,
  ] = useState(false);

  const [
    isLoadingMore,
    setIsLoadingMore,
  ] = useState(false);

  const [
    deletingNotificationId,
    setDeletingNotificationId,
  ] = useState<string | null>(null);

  const [
    isDeletingAll,
    setIsDeletingAll,
  ] = useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState<string | null>(null);

  const sections = useMemo(
    () =>
      buildSections(
        notifications,
      ),
    [notifications],
  );

  const loadFirstPage =
    useCallback(
      async (
        filter: NotificationFilter,
        refreshing = false,
      ): Promise<void> => {
        if (!accessToken) {
          return;
        }

        try {
          setErrorMessage(null);

          if (refreshing) {
            setIsRefreshing(true);
          } else {
            setIsLoading(true);
          }

          const response =
            await getNotifications(
              filter,
              0,
              PAGE_SIZE,
              accessToken,
            );

          setNotifications(
            response.items,
          );

          setCurrentPage(0);

          setHasMore(
            response.hasMore,
          );
        } catch (error) {
          setErrorMessage(
            getErrorMessage(error),
          );
        } finally {
          setIsLoading(false);
          setIsRefreshing(false);
        }
      },
      [accessToken],
    );

  useFocusEffect(
    useCallback(() => {
      let active = true;

      const openNotificationCenter =
        async (): Promise<void> => {
          if (!accessToken) {
            return;
          }

          setSelectedFilter('ALL');

          try {
            await markAllNotificationsAsRead(
              accessToken,
            );

            await refreshUnreadCount();
          } catch (error) {
            if (active) {
              setErrorMessage(
                getErrorMessage(error),
              );
            }
          }

          if (active) {
            await loadFirstPage('ALL');
          }
        };

      void openNotificationCenter();

      return () => {
        active = false;
      };
    }, [
      accessToken,
      loadFirstPage,
      refreshUnreadCount,
    ]),
  );

  async function handleFilterChange(
    filter: NotificationFilter,
  ): Promise<void> {
    if (filter === selectedFilter) {
      return;
    }

    setSelectedFilter(filter);
    setNotifications([]);
    setCurrentPage(0);
    setHasMore(false);

    await loadFirstPage(filter);
  }

  async function handleRefresh():
  Promise<void> {
    if (!accessToken) {
      return;
    }

    try {
      await markAllNotificationsAsRead(
        accessToken,
      );

      await refreshUnreadCount();
    } catch (error) {
      setErrorMessage(
        getErrorMessage(error),
      );
    }

    await loadFirstPage(
      selectedFilter,
      true,
    );
  }

  async function handleLoadMore():
  Promise<void> {
    if (
      !accessToken
      || !hasMore
      || isLoadingMore
    ) {
      return;
    }

    const nextPage =
      currentPage + 1;

    try {
      setIsLoadingMore(true);
      setErrorMessage(null);

      const response =
        await getNotifications(
          selectedFilter,
          nextPage,
          PAGE_SIZE,
          accessToken,
        );

      setNotifications(current => {
        const currentIds =
          new Set(
            current.map(
              notification =>
                notification.id,
            ),
          );

        const newItems =
          response.items.filter(
            notification =>
              !currentIds.has(
                notification.id,
              ),
          );

        return [
          ...current,
          ...newItems,
        ];
      });

      setCurrentPage(nextPage);

      setHasMore(
        response.hasMore,
      );
    } catch (error) {
      setErrorMessage(
        getErrorMessage(error),
      );
    } finally {
      setIsLoadingMore(false);
    }
  }

  function openNotification(
    notification: AppNotification,
  ): void {
    if (!notification.targetUrl) {
      return;
    }

    router.push(
      notification.targetUrl as Href,
    );
  }

  async function handleDeleteNotification(
    notificationId: string,
  ): Promise<void> {
    if (
      !accessToken
      || deletingNotificationId
    ) {
      return;
    }

    setDeletingNotificationId(
      notificationId,
    );

    try {
      await deleteNotification(
        notificationId,
        accessToken,
      );

      setNotifications(current =>
        current.filter(
          notification =>
            notification.id
            !== notificationId,
        ),
      );

      await refreshUnreadCount();
    } catch (error) {
      Alert.alert(
        'No se ha podido borrar',
        getErrorMessage(error),
      );
    } finally {
      setDeletingNotificationId(null);
    }
  }

  async function executeDeleteAll():
  Promise<void> {
    if (
      !accessToken
      || isDeletingAll
    ) {
      return;
    }

    setIsDeletingAll(true);

    try {
      await deleteAllNotifications(
        accessToken,
      );

      setNotifications([]);
      setCurrentPage(0);
      setHasMore(false);
      setErrorMessage(null);

      await refreshUnreadCount();
    } catch (error) {
      Alert.alert(
        'No se han podido borrar',
        getErrorMessage(error),
      );
    } finally {
      setIsDeletingAll(false);
    }
  }

  function confirmDeleteAll(): void {
    Alert.alert(
      'Borrar todas las notificaciones',
      'Se eliminarán todas tus notificaciones. Esta acción no se puede deshacer.',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Borrar todas',
          style: 'destructive',
          onPress: () => {
            void executeDeleteAll();
          },
        },
      ],
    );
  }

  return (
    <SafeAreaView
      edges={[
        'top',
        'right',
        'left',
      ]}
      style={styles.safeArea}
    >
      <ScrollView
        contentContainerStyle={
          styles.content
        }
        refreshControl={
          <RefreshControl
            onRefresh={() => {
              void handleRefresh();
            }}
            refreshing={isRefreshing}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Pressable
              accessibilityLabel="Volver"
              accessibilityRole="button"
              hitSlop={10}
              onPress={() => {
                router.back();
              }}
              style={({ pressed }) => [
                styles.headerButton,

                pressed
                  ? styles.headerButtonPressed
                  : null,
              ]}
            >
              <SymbolView
                name={{
                  ios: 'chevron.left',
                  android: 'arrow_back',
                  web: 'arrow_back',
                }}
                size={20}
                tintColor={colors.text}
              />
            </Pressable>
          </View>

          <Text style={styles.headerTitle}>
            Notificaciones
          </Text>

          <View style={styles.headerActions}>
            <Pressable
              accessibilityLabel="Borrar todas las notificaciones"
              accessibilityRole="button"
              disabled={
                notifications.length === 0
                || isDeletingAll
              }
              hitSlop={8}
              onPress={confirmDeleteAll}
              style={({ pressed }) => [
                styles.headerButton,

                notifications.length === 0
                  ? styles.headerButtonDisabled
                  : null,

                pressed
                  ? styles.headerButtonPressed
                  : null,
              ]}
            >
              {isDeletingAll ? (
                <ActivityIndicator
                  size="small"
                  color={colors.muted}
                />
              ) : (
                <SymbolView
                  name={{
                    ios: 'trash',
                    android: 'delete_outline',
                    web: 'delete',
                  }}
                  size={18}
                  tintColor={colors.muted}
                />
              )}
            </Pressable>

            <Pressable
              accessibilityLabel="Ajustes de notificaciones"
              accessibilityRole="button"
              hitSlop={8}
              onPress={() => {
                router.push(
                  '/notification-settings',
                );
              }}
              style={({ pressed }) => [
                styles.headerButton,

                pressed
                  ? styles.headerButtonPressed
                  : null,
              ]}
            >
              <SymbolView
                name={{
                  ios: 'gearshape',
                  android: 'settings',
                  web: 'settings',
                }}
                size={20}
                tintColor={colors.text}
              />
            </Pressable>
          </View>
        </View>

        <View style={styles.filters}>
          {filters.map(filter => {
            const selected =
              selectedFilter
              === filter.value;

            return (
              <Pressable
                key={filter.value}
                accessibilityRole="button"
                onPress={() => {
                  void handleFilterChange(
                    filter.value,
                  );
                }}
                style={({ pressed }) => [
                  styles.filterButton,

                  selected
                    ? styles.filterButtonSelected
                    : null,

                  pressed
                    ? styles.filterButtonPressed
                    : null,
                ]}
              >
                <Text
                  style={[
                    styles.filterText,

                    selected
                      ? styles.filterTextSelected
                      : null,
                  ]}
                >
                  {filter.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {isLoading ? (
          <View style={styles.loading}>
            <ActivityIndicator
              color={colors.primary}
              size="large"
            />
          </View>
        ) : null}

        {!isLoading
        && errorMessage
        && notifications.length === 0 ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorTitle}>
              No hemos podido cargar las notificaciones
            </Text>

            <Text style={styles.errorText}>
              {errorMessage}
            </Text>

            <Pressable
              accessibilityRole="button"
              onPress={() => {
                void loadFirstPage(
                  selectedFilter,
                );
              }}
            >
              <Text style={styles.retryText}>
                Volver a intentar
              </Text>
            </Pressable>
          </View>
        ) : null}

        {!isLoading
        && !errorMessage
        && notifications.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <SymbolView
                name={{
                  ios: 'bell.slash',
                  android:
                    'notifications_off',
                  web:
                    'notifications_off',
                }}
                size={30}
                tintColor={colors.primary}
              />
            </View>

            <Text style={styles.emptyTitle}>
              Todo al día
            </Text>

            <Text style={styles.emptyText}>
              Aquí aparecerán las invitaciones y
              novedades de tus grupos.
            </Text>
          </View>
        ) : null}

        {!isLoading
        && notifications.length > 0 ? (
          <View style={styles.sections}>
            {sections.map(section => (
              <View
                key={section.title}
                style={styles.section}
              >
                <Text style={styles.sectionTitle}>
                  {section.title}
                </Text>

                <View style={styles.sectionCards}>
                  {section.items.map(
                    notification => (
                      <NotificationCard
                        key={notification.id}
                        notification={
                          notification
                        }
                        deleting={
                          deletingNotificationId
                          === notification.id
                        }
                        onDelete={() => {
                          void handleDeleteNotification(
                            notification.id,
                          );
                        }}
                        onPress={() => {
                          openNotification(
                            notification,
                          );
                        }}
                      />
                    ),
                  )}
                </View>
              </View>
            ))}

            {hasMore ? (
              <Pressable
                accessibilityRole="button"
                disabled={isLoadingMore}
                onPress={() => {
                  void handleLoadMore();
                }}
                style={styles.loadMoreButton}
              >
                {isLoadingMore ? (
                  <ActivityIndicator
                    color={colors.primary}
                    size="small"
                  />
                ) : (
                  <Text style={styles.loadMoreText}>
                    Ver todas las notificaciones
                  </Text>
                )}
              </Pressable>
            ) : null}
          </View>
        ) : null}

        {errorMessage
        && notifications.length > 0 ? (
          <View style={styles.inlineError}>
            <Text style={styles.inlineErrorText}>
              {errorMessage}
            </Text>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },

  content: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 30,
  },

  header: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 22,
  },

  headerLeft: {
    width: 72,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },

  headerActions: {
    width: 72,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },

  headerButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
  },

  headerButtonPressed: {
    backgroundColor: '#F6EFE9',
  },

  headerButtonDisabled: {
    opacity: 0.3,
  },

  headerTitle: {
    flex: 1,
    color: colors.text,
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
    textAlign: 'center',
  },

  filters: {
    flexDirection: 'row',
    gap: 9,
    marginBottom: 25,
  },

  filterButton: {
    flex: 1,
    minHeight: 45,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    borderRadius: 30,
    backgroundColor: '#F3ECE7',
  },

  filterButtonSelected: {
    backgroundColor: colors.primary,
  },

  filterButtonPressed: {
    opacity: 0.78,
  },

  filterText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '700',
  },

  filterTextSelected: {
    color: colors.white,
  },

  loading: {
    alignItems: 'center',
    paddingVertical: 80,
  },

  sections: {
    gap: 25,
  },

  section: {
    gap: 10,
  },

  sectionTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '800',
  },

  sectionCards: {
    gap: 9,
  },

  notificationCard: {
    position: 'relative',
    minHeight: 86,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 12,
    paddingTop: 16,
    paddingBottom: 22,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    backgroundColor: colors.surface,
    shadowColor: '#2B2421',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.035,
    shadowRadius: 5,
    elevation: 1,
  },

  notificationCardUnread: {
    borderColor: '#E9B5A6',
    backgroundColor: '#FFFDFC',
  },

  notificationCardPressed: {
    opacity: 0.76,
  },

  notificationAvatar: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    backgroundColor: '#F8E9E4',
  },

  avatarImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },

  unreadAvatarDot: {
    position: 'absolute',
    right: 0,
    bottom: 1,
    width: 10,
    height: 10,
    borderWidth: 2,
    borderColor: colors.surface,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },

  notificationContent: {
    flex: 1,
    paddingRight: 24,
  },

  notificationTitle: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 18,
  },

  notificationMessage: {
    marginTop: 3,
    color: colors.muted,
    fontSize: 11,
    lineHeight: 16,
  },

  deleteNotificationButton: {
    position: 'absolute',
    top: 7,
    right: 7,
    zIndex: 2,
    width: 27,
    height: 27,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
  },

  deleteNotificationButtonPressed: {
    backgroundColor: '#F6EFE9',
  },

  notificationTimeContainer: {
    position: 'absolute',
    right: 13,
    bottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  notificationTime: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: '600',
  },

  unreadDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },

  loadMoreButton: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 3,
  },

  loadMoreText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '800',
  },

  emptyState: {
    alignItems: 'center',
    paddingVertical: 70,
  },

  emptyIcon: {
    width: 66,
    height: 66,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
    borderRadius: 33,
    backgroundColor: '#F8E9E4',
  },

  emptyTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
  },

  emptyText: {
    maxWidth: 280,
    marginTop: 7,
    color: colors.muted,
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
  },

  errorCard: {
    gap: 10,
    padding: 18,
    borderWidth: 1,
    borderColor: '#F0C2B8',
    borderRadius: 18,
    backgroundColor: '#FFF1EE',
  },

  errorTitle: {
    color: colors.danger,
    fontSize: 15,
    fontWeight: '800',
  },

  errorText: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 19,
  },

  retryText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '800',
  },

  inlineError: {
    marginTop: 20,
    padding: 13,
    borderRadius: 14,
    backgroundColor: '#FFF1EE',
  },

  inlineErrorText: {
    color: colors.danger,
    fontSize: 12,
    lineHeight: 17,
    textAlign: 'center',
  },
});