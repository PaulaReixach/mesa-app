import { ReactNode, Ref, useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  useWindowDimensions,
  View,
} from 'react-native';

import { colors, loginColors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import { radii } from '../theme/layout';

type FormFieldProps = TextInputProps & {
  label: string;
  error?: string | null;
  rightAccessory?: ReactNode;
  labelAccessory?: ReactNode;
  inputRef?: Ref<TextInput>;
  variant?: 'default' | 'login';
};

export function FormField({
  label,
  error,
  rightAccessory,
  labelAccessory,
  inputRef,
  variant = 'default',
  style,
  ...textInputProps
}: FormFieldProps) {
  const [isFocused, setIsFocused] = useState(false);
  const { fontScale, width } = useWindowDimensions();
  const isLogin = variant === 'login';
  const inputHeight = Math.max(52, 24 * fontScale + 24);

  return (
    <View style={[styles.container, isLogin && styles.loginContainer]}>
      <View style={[
        styles.labelRow,
        isLogin && styles.loginLabelRow,
        isLogin && (fontScale > 1.2 || width < 340)
          && styles.stackedLabelRow,
      ]}>
        <Text
          maxFontSizeMultiplier={isLogin ? undefined : 1.15}
          style={[styles.label, isLogin && styles.loginLabel]}
        >
          {label}
        </Text>
        {labelAccessory}
      </View>

      <View
        style={[
          styles.inputContainer,
          isLogin && styles.loginInputContainer,
          isFocused ? styles.inputFocused : null,
          isLogin && isFocused && styles.loginInputFocused,
          error ? styles.inputError : null,
          isLogin && textInputProps.editable === false && styles.loginInputDisabled,
        ]}
      >
        <TextInput
          {...textInputProps}
          ref={inputRef}
          accessibilityLabel={textInputProps.accessibilityLabel ?? label}
          accessibilityHint={isLogin && error ? error : textInputProps.accessibilityHint}
          aria-invalid={isLogin ? Boolean(error) : undefined}
          maxFontSizeMultiplier={isLogin ? undefined : 1.15}
          onBlur={event => {
            setIsFocused(false);
            textInputProps.onBlur?.(event);
          }}
          onFocus={event => {
            setIsFocused(true);
            textInputProps.onFocus?.(event);
          }}
          placeholderTextColor={isLogin ? loginColors.muted : colors.muted}
          selectionColor={isLogin ? loginColors.primary : textInputProps.selectionColor}
          style={[
            styles.input,
            isLogin && styles.loginInput,
            isLogin && textInputProps.editable === false && styles.loginInputTextDisabled,
            isLogin && { minHeight: inputHeight },
            rightAccessory
              ? styles.inputWithAccessory
              : null,
            style,
          ]}
        />

        {rightAccessory ? (
          <View style={[styles.accessory, isLogin && styles.loginAccessory]}>
            {rightAccessory}
          </View>
        ) : null}
      </View>

      {error ? (
        <Text
          accessibilityLiveRegion="polite"
          maxFontSizeMultiplier={isLogin ? undefined : 1.15}
          style={[styles.error, isLogin && styles.loginError]}
        >
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 7,
  },
  loginContainer: {
    gap: 8,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  loginLabelRow: {
    minHeight: 24,
    columnGap: 12,
  },
  stackedLabelRow: {
    alignItems: 'flex-start',
    flexDirection: 'column',
  },
  loginLabel: {
    flexShrink: 1,
    color: loginColors.text,
    fontFamily: fonts.semiBold,
    fontSize: 15,
    lineHeight: 22,
  },
  loginInputContainer: {
    minHeight: 56,
    borderColor: loginColors.inputBorder,
    // Reserve the extra focus stroke so the input never moves on focus.
    padding: 1,
    borderRadius: radii.sm,
    backgroundColor: loginColors.inputBackground,
  },
  loginInputFocused: {
    borderColor: loginColors.primary,
    borderWidth: 2,
    padding: 0,
  },
  loginInputDisabled: {
    backgroundColor: loginColors.inputDisabled,
  },
  loginInputTextDisabled: {
    color: loginColors.muted,
  },
  loginError: {
    fontSize: 14,
    lineHeight: 20,
  },
  loginInput: {
    minWidth: 0,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    lineHeight: 24,
    color: loginColors.text,
  },
  loginAccessory: {
    width: 52,
    minHeight: 52,
  },
  label: {
    color: colors.text,
    fontSize: 13,
    fontFamily: fonts.bold,
  },
  inputContainer: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    backgroundColor: colors.inputBackground,
  },
  inputFocused: {
    borderColor: colors.primary,
    backgroundColor: colors.surfaceElevated,
  },
  inputError: {
    borderColor: colors.danger,
  },
  input: {
    flex: 1,
    minHeight: 50,
    paddingHorizontal: 15,
    color: colors.text,
    fontFamily: fonts.regular,
    fontSize: 14,
  },
  inputWithAccessory: {
    paddingRight: 4,
  },
  accessory: {
    width: 48,
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  error: {
    color: colors.danger,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 17,
  },
});
