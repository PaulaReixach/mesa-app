import { SymbolView } from 'expo-symbols';
import type { ComponentProps } from 'react';
import { Pressable, Text, View } from 'react-native';

import { quickActionStyles as styles } from './HomeQuickActionCardRefined.styles';
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

export function HomeQuickActionCardRefined({
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
      style={({ pressed }) => [styles.card, pressed ? styles.pressed : null]}
    >
      <View style={[styles.iconWrap, sage ? styles.iconWrapSage : null]}>
        <SymbolView
          name={icon}
          size={22}
          tintColor={sage ? '#5B7740' : colors.primary}
        />
      </View>

      {badge != null && badge > 0 ? (
        <View style={styles.badge}>
          <Text allowFontScaling={false} style={styles.badgeText}>
            {badge > 9 ? '9+' : badge}
          </Text>
        </View>
      ) : null}

      <View style={styles.copy}>
        <Text allowFontScaling={false} numberOfLines={1} style={styles.title}>
          {title}
        </Text>
        <Text allowFontScaling={false} numberOfLines={1} style={styles.subtitle}>
          {subtitle}
        </Text>
      </View>
    </Pressable>
  );
}
