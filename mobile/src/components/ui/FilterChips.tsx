import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, ScrollView, View, type StyleProp, type ViewStyle } from 'react-native';

import { AppText } from './AppText';
import { createThemedStyles, radius, space, touchTarget, useTheme } from '../../theme';

export type FilterOption<T extends string> = {
  value: T;
  label: string;
  /** Number of items behind the filter, shown after the label. */
  count?: number;
};

type FilterChipsProps<T extends string> = {
  options: FilterOption<T>[];
  value: T;
  onChange: (value: T) => void;
  accessibilityLabel: string;
  /** Horizontal inset so the first chip lines up with the screen gutter. */
  inset?: number;
  style?: StyleProp<ViewStyle>;
};

/**
 * Single-choice filter row (Todos · Privados · Públicos, estados de un grupo). Scrolls
 * sideways with a fade on the right edge; the active chip is olive with cream text.
 */
export function FilterChips<T extends string>({
  options, value, onChange, accessibilityLabel, inset = 0, style,
}: FilterChipsProps<T>) {
  const styles = useStyles();
  const { colors } = useTheme();
  return (
    <View style={style}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        accessibilityRole="radiogroup"
        accessibilityLabel={accessibilityLabel}
        contentContainerStyle={[styles.row, { paddingHorizontal: inset }]}
      >
        {options.map((option) => {
          const selected = option.value === value;
          const text = option.count === undefined ? option.label : `${option.label} ${option.count}`;
          return (
            <Pressable
              key={option.value}
              onPress={() => onChange(option.value)}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected }}
              accessibilityLabel={text}
              hitSlop={{ top: 6, bottom: 6 }}
              style={({ pressed }) => [styles.chip, selected && styles.selected, pressed && !selected && styles.pressed]}
            >
              <AppText variant="secondaryStrong" numberOfLines={1}
                style={{ color: selected ? colors.background : colors.textPrimary }}>
                {option.label}
                {option.count !== undefined && (
                  <AppText variant="secondary" style={{ color: selected ? colors.background : colors.textSecondary }}>
                    {` ${option.count}`}
                  </AppText>
                )}
              </AppText>
            </Pressable>
          );
        })}
      </ScrollView>
      <LinearGradient
        colors={[`${colors.background}00`, colors.background]}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
        style={styles.fade} pointerEvents="none"
      />
    </View>
  );
}

const useStyles = createThemedStyles(({ colors }) => ({
  row: { gap: space.s2 },
  chip: {
    minHeight: touchTarget - 10,
    justifyContent: 'center',
    paddingHorizontal: 14,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceSecondary,
  },
  selected: { backgroundColor: colors.secondary },
  pressed: { backgroundColor: colors.separator },
  fade: { position: 'absolute', top: 0, right: 0, bottom: 0, width: space.s6 },
}));
