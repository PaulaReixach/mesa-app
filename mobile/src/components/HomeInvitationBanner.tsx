import { SymbolView } from 'expo-symbols';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { colors } from '../theme/colors';

export function HomeInvitationBanner({
  count,
  onPress,
}: {
  count: number;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.banner,
        pressed ? styles.pressed : null,
      ]}
    >
      <View style={styles.iconWrap}>
        <SymbolView
          name={{ ios: 'envelope.fill', android: 'mail', web: 'mail' }}
          size={19}
          tintColor={colors.primary}
        />
      </View>

      <View style={styles.copy}>
        <Text style={styles.title}>
          {count} {count === 1 ? 'invitación pendiente' : 'invitaciones pendientes'}
        </Text>
        <Text numberOfLines={1} style={styles.subtitle}>
          Revisa invitaciones y solicitudes de tus grupos.
        </Text>
      </View>

      <Text style={styles.action}>Gestionar</Text>
      <SymbolView
        name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
        size={17}
        tintColor="#5D7444"
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  banner: {
    minHeight: 62,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#EDE3DD',
    borderRadius: 17,
    backgroundColor: colors.surface,
  },
  iconWrap: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: '#FBE9E2',
  },
  copy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  title: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '900',
  },
  subtitle: {
    color: colors.muted,
    fontSize: 8,
  },
  action: {
    color: '#5D7444',
    fontSize: 10,
    fontWeight: '900',
  },
  pressed: {
    opacity: 0.74,
  },
});
