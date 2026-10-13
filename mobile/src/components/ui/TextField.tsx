import { SymbolView } from 'expo-symbols';
import { useState, type ReactNode, type Ref } from 'react';
import { Pressable, TextInput, View, type TextInputProps } from 'react-native';

import { AppText } from './AppText';
import {
  createThemedStyles, iconSize, radius, space, touchTarget, typography, useTheme,
} from '../../theme';

type TextFieldProps = Omit<TextInputProps, 'style' | 'secureTextEntry'> & {
  label: string;
  /** Second part of the label in regular weight («· opcional»). */
  labelHint?: string;
  /** Help under the field; replaced by the error when there is one. */
  help?: ReactNode;
  error?: string;
  /** Fixed text before the value («@»). */
  prefix?: string;
  /** Password field with a 44 pt show/hide button. */
  secure?: boolean;
  ref?: Ref<TextInput>;
};

/**
 * Labelled field (DESIGN.md › Entrar · Crear un grupo): visible label, 52 pt box with
 * `borderInput`, olive border while focused, error announced under the field.
 */
export function TextField({
  label, labelHint, help, error, prefix, secure = false, ref, onFocus, onBlur, ...input
}: TextFieldProps) {
  const styles = useStyles();
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(true);
  const borderColor = error ? colors.danger : focused ? colors.secondary : colors.borderInput;

  return (
    <View style={styles.wrapper}>
      <AppText variant="secondaryStrong" tone={error ? 'danger' : 'muted'} importantForAccessibility="no">
        {label}
        {labelHint && <AppText variant="secondary" tone="muted">{` · ${labelHint}`}</AppText>}
      </AppText>
      <View style={[styles.box, { borderColor, borderWidth: focused || error ? 1.5 : 1 }]}>
        {prefix && <AppText variant="body" tone="olive" importantForAccessibility="no">{prefix}</AppText>}
        <TextInput
          ref={ref}
          {...input}
          secureTextEntry={secure && hidden}
          placeholderTextColor={colors.textTertiary}
          accessibilityLabel={label}
          accessibilityHint={error}
          onFocus={(event) => { setFocused(true); onFocus?.(event); }}
          onBlur={(event) => { setFocused(false); onBlur?.(event); }}
          style={[styles.input, input.multiline && styles.multiline]}
        />
        {secure && (
          <Pressable onPress={() => setHidden((value) => !value)} accessibilityRole="button"
            accessibilityLabel={hidden ? 'Mostrar contraseña' : 'Ocultar contraseña'} style={styles.eye}>
            <SymbolView
              name={hidden
                ? { ios: 'eye', android: 'visibility', web: 'visibility' }
                : { ios: 'eye.slash', android: 'visibility_off', web: 'visibility_off' }}
              size={iconSize.search} tintColor={colors.iconMuted}
            />
          </Pressable>
        )}
      </View>
      {error ? (
        <AppText variant="secondary" tone="danger" accessibilityLiveRegion="polite">{error}</AppText>
      ) : typeof help === 'string' ? (
        <AppText variant="secondary" tone="muted">{help}</AppText>
      ) : help}
    </View>
  );
}

const useStyles = createThemedStyles(({ colors }) => ({
  wrapper: { gap: 6 },
  box: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingLeft: 14,
    borderRadius: radius.md + 2,
    borderCurve: 'continuous',
    backgroundColor: colors.surface,
  },
  input: {
    ...typography.body,
    fontSize: 16,
    flex: 1,
    minWidth: 0,
    minHeight: 50,
    paddingRight: 14,
    paddingVertical: space.s3,
    color: colors.textPrimary,
  },
  multiline: { minHeight: 96, textAlignVertical: 'top' },
  eye: { width: touchTarget, height: touchTarget, alignItems: 'center', justifyContent: 'center' },
}));
