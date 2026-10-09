import { Text, type TextProps } from 'react-native';

import { typography, useTheme, type ThemeColors, type TypographyVariant } from '../../theme';

export type TextTone = 'primary' | 'muted' | 'accent' | 'olive' | 'danger' | 'onAccent';

const toneColor: Record<TextTone, keyof ThemeColors> = {
  primary: 'textPrimary',
  muted: 'textSecondary',
  accent: 'accent',
  olive: 'secondary',
  danger: 'danger',
  onAccent: 'onAccent',
};

export type AppTextProps = TextProps & {
  variant?: TypographyVariant;
  tone?: TextTone;
};

export function AppText({ variant = 'body', tone = 'primary', style, ...props }: AppTextProps) {
  const { colors } = useTheme();
  return <Text {...props} style={[typography[variant], { color: colors[toneColor[tone]] }, style]} />;
}
