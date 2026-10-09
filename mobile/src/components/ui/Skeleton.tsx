import { useEffect } from 'react';
import type { DimensionValue, StyleProp, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { radius, useTheme } from '../../theme';

/** Placeholder block shaped like the real content. Pulses unless Reduce Motion is on. */
export function Skeleton({ width = '100%', height, borderRadius = radius.sm, style }: {
  width?: DimensionValue;
  height: number;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const { colors } = useTheme();
  const reduceMotion = useReducedMotion();
  const opacity = useSharedValue(1);

  useEffect(() => {
    if (reduceMotion) return;
    opacity.value = withRepeat(withTiming(0.5, { duration: 600 }), -1, true);
  }, [opacity, reduceMotion]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View accessible={false} importantForAccessibility="no"
      style={[{ width, height, borderRadius, borderCurve: 'continuous', backgroundColor: colors.surfaceSecondary },
        animatedStyle, style]} />
  );
}
