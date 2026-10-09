import { SymbolView } from 'expo-symbols';
import { useState, type ComponentProps } from 'react';
import { Pressable, Text, View } from 'react-native';

import { quickActionStyles as styles } from './HomeQuickActionCardRefined.styles';
import { homeFocusStyle } from './HomeDashboardStyles';
import { colors, loginColors } from '../theme/colors';

type Props = {
  icon: ComponentProps<typeof SymbolView>['name'];
  onPress: () => void;
  subtitle: string;
  title: string;
  tone?: 'terracotta' | 'sage';
  stacked?: boolean;
};

export function HomeQuickActionCardRefined({ icon, onPress, subtitle, title, tone = 'terracotta', stacked = false }: Props) {
  const [focused, setFocused] = useState(false);
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`${title}, ${subtitle}`}
      onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} onPress={onPress}
      style={({ pressed }) => [styles.card, stacked && styles.stacked, pressed && styles.pressed, focused && homeFocusStyle]}>
      <View style={styles.iconWrap} accessible={false} importantForAccessibility="no-hide-descendants">
        <SymbolView name={icon} size={24} tintColor={tone === 'sage' ? colors.olivePressed : loginColors.primary} />
      </View>
      <View style={styles.copy}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
    </Pressable>
  );
}
