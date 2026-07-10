import { ReactNode } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';

import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';

type FormFieldProps = TextInputProps & {
  label: string;
  error?: string | null;
  rightAccessory?: ReactNode;
  compact?: boolean;
};

export function FormField({
  label,
  error,
  rightAccessory,
  compact = false,
  style,
  ...textInputProps
}: FormFieldProps) {
  return (
    <View
      style={[
        styles.container,
        compact ? styles.compactContainer : null,
      ]}
    >
      <Text
        maxFontSizeMultiplier={1.15}
        style={[
          styles.label,
          compact ? styles.compactLabel : null,
        ]}
      >
        {label}
      </Text>

      <View
        style={[
          styles.inputContainer,
          compact ? styles.compactInputContainer : null,
          error ? styles.inputError : null,
        ]}
      >
        <TextInput
          {...textInputProps}
          maxFontSizeMultiplier={1.15}
          placeholderTextColor={colors.muted}
          style={[
            styles.input,
            compact ? styles.compactInput : null,
            rightAccessory
              ? styles.inputWithAccessory
              : null,
            style,
          ]}
        />

        {rightAccessory ? (
          <View
            style={[
              styles.accessory,
              compact ? styles.compactAccessory : null,
            ]}
          >
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
  compactContainer: {
    gap: 5,
  },
  label: {
    color: colors.text,
    fontFamily: fonts.semiBold,
    fontSize: 13,
  },
  compactLabel: {
    fontSize: 12,
  },
  inputContainer: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 13,
    backgroundColor: colors.inputBackground,
  },
  compactInputContainer: {
    minHeight: 46,
    borderRadius: 12,
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
  compactInput: {
    minHeight: 44,
    paddingHorizontal: 13,
    fontSize: 13,
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
  compactAccessory: {
    width: 42,
    minHeight: 44,
  },
  error: {
    color: colors.danger,
    fontFamily: fonts.medium,
    fontSize: 12,
    lineHeight: 17,
  },
});
