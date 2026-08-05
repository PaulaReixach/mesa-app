import {
  forwardRef,
  useState,
} from 'react';
import type { ReactNode } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { TextInputProps } from 'react-native';

import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import { radii } from '../theme/layout';

type FormFieldProps = TextInputProps & {
  label: string;
  error?: string | null;
  helperText?: string;
  leftAccessory?: ReactNode;
  rightAccessory?: ReactNode;
};

export const FormField = forwardRef<TextInput, FormFieldProps>(
  function FormField({
    label,
    error,
    helperText,
    leftAccessory,
    rightAccessory,
    style,
    ...textInputProps
  }, ref) {
    const [isFocused, setIsFocused] = useState(false);

    return (
      <View style={styles.container}>
        <Text
          maxFontSizeMultiplier={1.15}
          style={styles.label}
        >
          {label}
        </Text>

        <View
          style={[
            styles.inputContainer,
            isFocused ? styles.inputFocused : null,
            error ? styles.inputError : null,
          ]}
        >
          <TextInput
            ref={ref}
            {...textInputProps}
            accessibilityLabel={textInputProps.accessibilityLabel ?? label}
            maxFontSizeMultiplier={1.15}
            onBlur={event => {
              setIsFocused(false);
              textInputProps.onBlur?.(event);
            }}
            onFocus={event => {
              setIsFocused(true);
              textInputProps.onFocus?.(event);
            }}
            placeholderTextColor={colors.muted}
            style={[
              styles.input,
              leftAccessory
                ? styles.inputWithLeftAccessory
                : null,
              rightAccessory
                ? styles.inputWithAccessory
                : null,
              style,
            ]}
          />

          {leftAccessory ? (
            <View style={styles.leftAccessory}>
              {leftAccessory}
            </View>
          ) : null}

          {rightAccessory ? (
            <View style={styles.accessory}>
              {rightAccessory}
            </View>
          ) : null}
        </View>

        {error ? (
          <Text
            accessibilityLiveRegion="polite"
            maxFontSizeMultiplier={1.15}
            style={styles.error}
          >
            {error}
          </Text>
        ) : helperText ? (
          <Text
            maxFontSizeMultiplier={1.15}
            style={styles.helperText}
          >
            {helperText}
          </Text>
        ) : null}
      </View>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    gap: 7,
  },
  label: {
    color: colors.text,
    fontSize: 13,
    fontFamily: fonts.bold,
  },
  inputContainer: {
    minHeight: 54,
    position: 'relative',
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
    minHeight: 52,
    paddingHorizontal: 15,
    color: colors.text,
    fontFamily: fonts.regular,
    fontSize: 14,
  },
  inputWithAccessory: {
    paddingRight: 4,
  },
  inputWithLeftAccessory: {
    paddingLeft: 50,
  },
  leftAccessory: {
    position: 'absolute',
    left: 0,
    zIndex: 1,
    width: 48,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accessory: {
    width: 48,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  error: {
    color: colors.danger,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 17,
  },
  helperText: {
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 11,
    lineHeight: 16,
  },
});
