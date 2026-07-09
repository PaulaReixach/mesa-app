import { SymbolView } from 'expo-symbols';
import type { ComponentProps } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { colors } from '../theme/colors';

type SymbolName = ComponentProps<typeof SymbolView>['name'];

type Props = {
  badge?: number;
  icon: SymbolName;
  onPress: () => void;
  subtitle: string;
  title: string;
  tone?: 'terracotta' | 'sage';
};

export function HomeQuickActionCard({
  badge,
  icon,
  onPress,
  subtitle,
  title,
  tone = 'terracotta',
}: Props) {
  const sage = tone === 'sage';

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        pressed ? styles.pressed : null,
      ]}
    >
      <View style={[
        styles.iconWrap,
        sage ? styles.iconWrapSage : null,
      ]}>
        <SymbolView
          name={icon}
          size={21}
          tintColor={sage ? '#5B7740' : colors.primary}
        />
      </View>

      {badge != null && badge > 0 ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {badge > 9 ? '9+' : badge}
          </Text>
        </View>
      ) : null}

      <Text numberOfLines={1} style={styles.title}>
        {title}
      </Text>
      <Text numberOfLines={2} style={styles.subtitle}>
        {subtitle}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    position: 'relative',
    flex: 1,
    minWidth: 0,
    minHeight: 116,
    gap: 5,
    padding: 12,
    borderWidth: 1,
    borderColor: '#EDE3DD',
    borderRadius: 18,
    backgroundColor: colors.surface,
  },
  iconWrap: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 3,
    borderRadius: 13,
    backgroundColor: '#FBE9E2',
  },
  iconWrapSage: {
    backgroundColor: '#EDF1E3',
  },
  badge: {
    position: 'absolute',
    top: 10,
    right: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
    borderRadius: 10,
    backgroundColor: '#FBE7DE',
  },
  badgeText: {
    color: colors.primary,
    fontSize: 9,
    fontWeight: '900',
  },
  title: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '900',
  },
  subtitle: {
    color: colors.muted,
    fontSize: 9,
    lineHeight: 13,
  },
  pressed: {
    opacity: 0.74,
  },
});
