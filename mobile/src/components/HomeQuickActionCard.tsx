import { SymbolView } from 'expo-symbols';
import type { ComponentProps } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';

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
    minHeight: 112,
    gap: 5,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E3D6CE',
    borderRadius: 19,
    backgroundColor: '#FCF9F7',
  },
  iconWrap: {
    width: 39,
    height: 39,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 3,
    borderRadius: 14,
    backgroundColor: '#F7E7DF',
  },
  iconWrapSage: {
    backgroundColor: '#EBF0E0',
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
    backgroundColor: '#F8E3DA',
  },
  badgeText: {
    color: colors.primary,
    fontSize: 9,
    fontFamily: fonts.bold,
  },
  title: {
    color: colors.text,
    fontSize: 12,
    fontFamily: fonts.bold,
  },
  subtitle: {
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 9,
    lineHeight: 13,
  },
  pressed: {
    opacity: 0.74,
  },
});
