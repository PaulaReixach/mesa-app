import { SymbolView } from 'expo-symbols';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import { radii, shadows } from '../theme/layout';

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
    minHeight: 76,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
    ...shadows.card,
  },
  iconWrap: {
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: colors.primarySoft,
  },
  copy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  title: {
    color: colors.text,
    fontSize: 13,
    fontFamily: fonts.semiBold,
  },
  subtitle: {
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 9,
  },
  action: {
    color: '#5D7444',
    fontSize: 9,
    fontFamily: fonts.semiBold,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.99 }],
  },
});
