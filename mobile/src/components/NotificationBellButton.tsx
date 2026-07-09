import { SymbolView } from 'expo-symbols';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useNotifications } from '../contexts/notification-context';
import { colors } from '../theme/colors';

export function NotificationBellButton() {
  const { unreadCount } = useNotifications();
  const badgeText = unreadCount > 9 ? '9+' : String(unreadCount);

  return (
    <Pressable
      accessibilityLabel={
        unreadCount > 0
          ? `${unreadCount} notificaciones sin leer`
          : 'Notificaciones'
      }
      accessibilityRole="button"
      onPress={() => router.push('/notifications')}
      style={({ pressed }) => [styles.button, pressed ? styles.buttonPressed : null]}
    >
      <SymbolView
        name={{
          ios: unreadCount > 0 ? 'bell.fill' : 'bell',
          android: 'notifications',
          web: 'notifications',
        }}
        size={20}
        tintColor={colors.text}
      />

      {unreadCount > 0 ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badgeText}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E4D8D0',
    borderRadius: 21,
    backgroundColor: '#FDF9F8',
  },
  buttonPressed: { opacity: 0.7 },
  badge: {
    position: 'absolute',
    top: -3,
    right: -4,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FBF7F4',
    borderRadius: 9,
    backgroundColor: colors.primary,
    paddingHorizontal: 4,
  },
  badgeText: {
    color: colors.white,
    fontSize: 8,
    fontWeight: '800',
  },
});
