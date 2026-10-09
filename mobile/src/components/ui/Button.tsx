import { SymbolView } from 'expo-symbols';
import type { ComponentProps } from 'react';
import { ActivityIndicator, Platform, Pressable, View, type StyleProp, type ViewStyle } from 'react-native';

import { AppText } from './AppText';
import {
  createThemedStyles, iconSize, radius, space, textActionHitSlop, touchTarget, useTheme, type ThemeColors,
} from '../../theme';

type Variant = 'primary' | 'secondary' | 'danger' | 'text';
type Size = 'md' | 'lg';
type SymbolName = ComponentProps<typeof SymbolView>['name'];

const filled: Record<Exclude<Variant, 'text'>, { background: keyof ThemeColors; pressed: keyof ThemeColors; foreground: keyof ThemeColors }> = {
  primary: { background: 'accent', pressed: 'accentPressed', foreground: 'onAccent' },
  secondary: { background: 'secondarySoft', pressed: 'tint', foreground: 'onSecondarySoft' },
  danger: { background: 'dangerSoft', pressed: 'dangerSoft', foreground: 'danger' },
};

/**
 * MESA buttons (DESIGN.md › Components). `text` buttons are terracotta when they create or
 * change something (`tone="accent"`) and olive when they navigate (`tone="olive"`).
 */
export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  tone = 'accent',
  icon,
  trailingIcon,
  loading = false,
  disabled = false,
  accessibilityLabel,
  style,
}: {
  title: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  tone?: 'accent' | 'olive';
  icon?: SymbolName;
  trailingIcon?: SymbolName;
  loading?: boolean;
  disabled?: boolean;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}) {
  const { colors } = useTheme();
  const styles = useStyles();
  const isDisabled = disabled || loading;
  const isText = variant === 'text';
  const palette = isText ? null : filled[variant];
  const foreground = isText
    ? colors[tone === 'olive' ? 'secondary' : 'accent']
    : colors[disabled && variant === 'primary' ? 'onAccentDisabled' : palette!.foreground];
  const iconNode = (name: SymbolName) => (
    <SymbolView accessible={false} name={name} size={isText ? iconSize.inline : iconSize.link} tintColor={foreground} />
  );

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      onPress={onPress}
      hitSlop={isText ? textActionHitSlop : undefined}
      android_ripple={isText ? undefined : { color: colors.overlay, foreground: true }}
      style={({ pressed }) => [
        isText ? styles.text : [styles.filled, size === 'lg' && styles.large],
        palette && {
          backgroundColor: disabled && variant === 'primary'
            ? colors.accentDisabled
            : colors[pressed && Platform.OS === 'ios' ? palette.pressed : palette.background],
        },
        pressed && (isText || Platform.OS === 'ios') && styles.pressed,
        disabled && variant !== 'primary' && styles.disabled,
        style,
      ]}
    >
      <View style={[styles.content, loading && styles.hidden]}>
        {icon && iconNode(icon)}
        <AppText variant={isText ? 'buttonSmall' : size === 'lg' ? 'button' : 'buttonSmall'}
          style={{ color: foreground }} maxFontSizeMultiplier={1.6}>
          {title}
        </AppText>
        {trailingIcon && iconNode(trailingIcon)}
      </View>
      {loading && <ActivityIndicator color={foreground} style={styles.spinner} />}
    </Pressable>
  );
}

const useStyles = createThemedStyles(() => ({
  filled: {
    minHeight: 46,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space.s3,
    borderRadius: radius.sm,
    borderCurve: 'continuous',
    overflow: 'hidden',
  },
  large: { minHeight: 52, paddingHorizontal: space.s4, borderRadius: radius.md },
  text: { minHeight: touchTarget - 20, justifyContent: 'center', alignSelf: 'flex-start' },
  pressed: { opacity: 0.7 },
  disabled: { opacity: 0.4 },
  content: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space.s2 },
  hidden: { opacity: 0 },
  spinner: { position: 'absolute', alignSelf: 'center' },
}));
