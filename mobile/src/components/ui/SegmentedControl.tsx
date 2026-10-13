import { Pressable, View, type StyleProp, type ViewStyle } from 'react-native';

import { AppText } from './AppText';
import { createThemedStyles, radius, space, touchTarget, useTheme } from '../../theme';

export type SegmentOption<T extends string> = {
  value: T;
  label: string;
  /** Small accent dot for news («Actividad»). */
  badge?: boolean;
};

type SegmentedControlProps<T extends string> = {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  accessibilityLabel: string;
  style?: StyleProp<ViewStyle>;
};

/**
 * Segmented tabs (Sitios · Actividad · Miembros, Privado · Público). Drawn in React Native
 * instead of the @expo/ui Picker so it can show the news dot and the dark-mode tones of
 * DESIGN.md › Detalle de grupo. Exposed as a radio group.
 */
export function SegmentedControl<T extends string>({
  options, value, onChange, accessibilityLabel, style,
}: SegmentedControlProps<T>) {
  const styles = useStyles();
  const { colors } = useTheme();
  return (
    <View accessibilityRole="radiogroup" accessibilityLabel={accessibilityLabel} style={[styles.track, style]}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => !selected && onChange(option.value)}
            accessibilityRole="radio"
            accessibilityState={{ checked: selected }}
            accessibilityLabel={option.badge ? `${option.label}, con novedades` : option.label}
            style={[styles.segment, selected && styles.selected]}
          >
            <AppText variant={selected ? 'buttonSmall' : 'secondaryStrong'} numberOfLines={1}
              maxFontSizeMultiplier={1.4} style={{ color: selected ? colors.textPrimary : colors.textSecondary }}>
              {option.label}
            </AppText>
            {option.badge && <View style={styles.dot} />}
          </Pressable>
        );
      })}
    </View>
  );
}

const useStyles = createThemedStyles(({ colors, scheme, elevation }) => ({
  track: {
    flexDirection: 'row',
    padding: 3,
    gap: 3,
    borderRadius: radius.md,
    borderCurve: 'continuous',
    backgroundColor: colors.surfaceSecondary,
  },
  segment: {
    flex: 1,
    minHeight: touchTarget - 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.s1,
    paddingHorizontal: space.s2,
    borderRadius: radius.sm,
    borderCurve: 'continuous',
  },
  selected: {
    backgroundColor: scheme === 'dark' ? colors.separator : colors.surface,
    boxShadow: scheme === 'dark' ? undefined : elevation.feature,
  },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.accent },
}));
