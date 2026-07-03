import { SymbolView } from 'expo-symbols';
import {
  useEffect,
  useRef,
} from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useNotifications } from '../contexts/notification-context';
import { colors } from '../theme/colors';

const AUTO_DISMISS_TIME_MS = 4500;

export function InAppNotificationBanner() {
  const insets =
    useSafeAreaInsets();

  const {
    foregroundNotification,
    dismissForegroundNotification,
    openForegroundNotification,
  } = useNotifications();

  const opacity =
    useRef(
      new Animated.Value(0),
    ).current;

  const translateY =
    useRef(
      new Animated.Value(-24),
    ).current;

  useEffect(() => {
    if (!foregroundNotification) {
      opacity.setValue(0);
      translateY.setValue(-24);
      return;
    }

    opacity.setValue(0);
    translateY.setValue(-24);

    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),

      Animated.spring(translateY, {
        toValue: 0,
        damping: 17,
        stiffness: 180,
        mass: 0.8,
        useNativeDriver: true,
      }),
    ]).start();

    const timeoutId =
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 0,
            duration: 180,
            useNativeDriver: true,
          }),

          Animated.timing(translateY, {
            toValue: -18,
            duration: 180,
            useNativeDriver: true,
          }),
        ]).start(({ finished }) => {
          if (finished) {
            dismissForegroundNotification();
          }
        });
      }, AUTO_DISMISS_TIME_MS);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [
    dismissForegroundNotification,
    foregroundNotification,
    opacity,
    translateY,
  ]);

  if (!foregroundNotification) {
    return null;
  }

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.overlay,
        {
          top: insets.top + 8,
        },
      ]}
    >
      <Animated.View
        style={[
          styles.banner,
          {
            opacity,
            transform: [
              {
                translateY,
              },
            ],
          },
        ]}
      >
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            void openForegroundNotification();
          }}
          style={({ pressed }) => [
            styles.bannerContent,

            pressed
              ? styles.bannerPressed
              : null,
          ]}
        >
          <View style={styles.iconContainer}>
            <SymbolView
              name={{
                ios: 'bell.fill',
                android: 'notifications',
                web: 'notifications',
              }}
              size={20}
              tintColor={colors.white}
            />
          </View>

          <View style={styles.textContainer}>
            <View style={styles.titleRow}>
              <Text
                numberOfLines={1}
                style={styles.appName}
              >
                Mesa
              </Text>

              <Text style={styles.timeText}>
                Ahora
              </Text>
            </View>

            <Text
              numberOfLines={1}
              style={styles.title}
            >
              {
                foregroundNotification
                  .title
              }
            </Text>

            <Text
              numberOfLines={2}
              style={styles.body}
            >
              {
                foregroundNotification
                  .body
              }
            </Text>
          </View>
        </Pressable>

        <Pressable
          accessibilityLabel="Cerrar notificación"
          accessibilityRole="button"
          hitSlop={10}
          onPress={
            dismissForegroundNotification
          }
          style={({ pressed }) => [
            styles.closeButton,

            pressed
              ? styles.closeButtonPressed
              : null,
          ]}
        >
          <SymbolView
            name={{
              ios: 'xmark',
              android: 'close',
              web: 'close',
            }}
            size={14}
            tintColor={colors.muted}
          />
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    left: 14,
    right: 14,
    zIndex: 9999,
    elevation: 9999,
  },

  banner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: '#EAD7CF',
    borderRadius: 20,
    backgroundColor: colors.surface,

    shadowColor: '#2B2421',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.16,
    shadowRadius: 13,

    elevation: 12,
  },

  bannerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 20,
    paddingLeft: 12,
    paddingRight: 8,
    paddingVertical: 12,
  },

  bannerPressed: {
    opacity: 0.72,
  },

  iconContainer: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 21,
    backgroundColor: colors.primary,
  },

  textContainer: {
    flex: 1,
  },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 2,
  },

  appName: {
    flex: 1,
    color: colors.primary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },

  timeText: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: '600',
  },

  title: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 19,
  },

  body: {
    marginTop: 2,
    color: colors.muted,
    fontSize: 12,
    lineHeight: 17,
  },

  closeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 7,
    marginRight: 6,
    borderRadius: 16,
  },

  closeButtonPressed: {
    backgroundColor: '#F4ECE7',
  },
});