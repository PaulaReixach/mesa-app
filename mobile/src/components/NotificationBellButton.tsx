import { SymbolView } from 'expo-symbols';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useNotifications } from '../contexts/notification-context';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';

export function NotificationBellButton({
  variant = 'default',
}: {
  variant?: 'default' | 'hero';
}) {
  const { unreadCount } = useNotifications();
  const badgeText = unreadCount > 9 ? '9+' : String(unreadCount);
  const hero = variant === 'hero';

  return (
    <Pressable
      accessibilityLabel={
        unreadCount > 0
          ? `${unreadCount} notificaciones sin leer`
          : 'Notificaciones'
      }
      accessibilityRole="button"
      onPress={() => router.push('/notifications')}
      style={({ pressed }) => [
        styles.button,
        hero ? styles.heroButton : null,
        pressed ? styles.buttonPressed : null,
      ]}
    >
      <SymbolView
        name={{
          ios: unreadCount > 0 ? 'bell.fill' : 'bell',
          android: 'notifications',
          web: 'notifications',
        }}
        size={hero ? 27 : 20}
        tintColor={hero ? '#FFF8F2' : colors.text}
      />

      {unreadCount > 0 ? (
        <View style={[styles.badge, hero ? styles.heroBadge : null]}>
          {hero ? null : <Text style={styles.badgeText}>{badgeText}</Text>}
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
  heroButton: {
    width: 36,
    height: 36,
    borderWidth: 0,
    borderRadius: 18,
    backgroundColor: 'transparent',
  },
  badge: {
    position: 'absolute',
    top: -3,
    right: -4,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FBF6F3',
    borderRadius: 9,
    backgroundColor: colors.primary,
    paddingHorizontal: 4,
  },
  badgeText: {
    color: colors.white,
    fontSize: 8,
    fontFamily: fonts.bold,
  },
  heroBadge: {
    top: 1,
    right: 0,
    minWidth: 7,
    width: 7,
    height: 7,
    paddingHorizontal: 0,
    borderWidth: 0,
    borderRadius: 4,
    backgroundColor: '#FFE5D1',
  },
});
