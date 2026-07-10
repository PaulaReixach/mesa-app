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
};

export function FormField({
  label,
  error,
  rightAccessory,
  style,
  ...textInputProps
}: FormFieldProps) {
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
          error ? styles.inputError : null,
        ]}
      >
        <TextInput
          {...textInputProps}
          maxFontSizeMultiplier={1.15}
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
    fontFamily: fonts.semiBold,
    fontSize: 13,
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
    fontFamily: fonts.medium,
    fontSize: 12,
    lineHeight: 17,
  },
});
