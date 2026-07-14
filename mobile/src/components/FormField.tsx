import { ReactNode, useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';

import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import { radii } from '../theme/layout';

type FormFieldProps = TextInputProps & {
  label: string;
  error?: string | null;
  rightAccessory?: ReactNode;
};

export function FormField({
  label,
  error,
  rightAccessory,
  style,
  ...textInputProps
}: FormFieldProps) {
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
          {...textInputProps}
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
            rightAccessory
              ? styles.inputWithAccessory
              : null,
            style,
          ]}
        />

        {rightAccessory ? (
          <View style={styles.accessory}>
            {rightAccessory}
          </View>
        ) : null}
      </View>

      {error ? (
        <Text
          maxFontSizeMultiplier={1.15}
          style={styles.error}
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
