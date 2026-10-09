import type { ReactNode } from 'react';
import { Platform, Pressable, View, type StyleProp, type ViewStyle } from 'react-native';

import { createThemedStyles, radius, useTheme } from '../../theme';

/**
 * MESA card: white surface, hairline border, radius 15. `feature` is the highlighted card
 * (radius 18 + soft shadow). Pressed feedback is native per platform: ripple on Android,
 * dim and slight scale on iOS (DESIGN.md › Components).
 */
export function PressableCard({ children, onPress, accessibilityLabel, feature = false, style }: {
  children: ReactNode;
  onPress?: () => void;
  accessibilityLabel?: string;
  feature?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const { colors } = useTheme();
  const styles = useStyles();
  const base = [styles.card, feature && styles.feature, style];

  if (!onPress) {
    return <View style={base}>{children}</View>;
  }

  return (
    <Pressable accessibilityRole="button" accessibilityLabel={accessibilityLabel} onPress={onPress}
      android_ripple={{ color: colors.overlay, foreground: true }}
      style={({ pressed }) => [base, pressed && Platform.OS === 'ios' && styles.pressed]}>
      {children}
    </Pressable>
  );
}

const useStyles = createThemedStyles(({ colors, elevation }) => ({
  card: {
    // Clips the Android ripple to the rounded corners; the featured card skips it so its
    // shadow is not clipped (its children round their own corners).
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderCurve: 'continuous',
    backgroundColor: colors.surface,
  },
  feature: { overflow: 'visible', borderRadius: radius.xl, boxShadow: elevation.feature },
  pressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
}));
