import { SymbolView } from 'expo-symbols';
import { router } from 'expo-router';
import { Platform, Pressable, View } from 'react-native';

import { useNotifications } from '../contexts/notification-context';
import { createThemedStyles, iconSize, touchTarget, useTheme } from '../theme';

/** Bell with a terracotta dot when there is something unread (prototype header). */
export function NotificationBellButton() {
  const { unreadCount } = useNotifications();
  const { colors } = useTheme();
  const styles = useStyles();

  return (
    <Pressable
      accessibilityLabel={unreadCount > 0 ? `Notificaciones, ${unreadCount} sin leer` : 'Notificaciones'}
      accessibilityRole="button"
      onPress={() => router.push('/notifications')}
      android_ripple={{ color: colors.overlay, borderless: true, radius: touchTarget / 2 }}
      style={({ pressed }) => [styles.button, pressed && Platform.OS === 'ios' && styles.pressed]}
    >
      <SymbolView accessible={false} name={{ ios: 'bell', android: 'notifications', web: 'notifications' }}
        size={iconSize.nav} tintColor={colors.textPrimary} />
      {unreadCount > 0 && <View style={styles.dot} />}
    </Pressable>
  );
}

const useStyles = createThemedStyles(({ colors }) => ({
  button: {
    width: touchTarget,
    height: touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: touchTarget / 2,
  },
  pressed: { opacity: 0.6 },
  dot: {
    position: 'absolute',
    top: 10,
    right: 11,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    borderWidth: 1,
    borderColor: colors.background,
    backgroundColor: colors.accent,
  },
}));
