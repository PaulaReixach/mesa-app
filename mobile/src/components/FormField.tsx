import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';

import { colors } from '../theme/colors';

type FormFieldProps = TextInputProps & {
  label: string;
  error?: string | null;
};

export function FormField({
  label,
  error,
  style,
  ...textInputProps
}: FormFieldProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      <TextInput
        {...textInputProps}
        placeholderTextColor={colors.muted}
        style={[
          styles.input,
          error ? styles.inputError : null,
          style,
        ]}
      />

      {error ? (
        <Text style={styles.error}>{error}</Text>
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
    fontSize: 14,
    fontWeight: '600',
  },
  input: {
    minHeight: 52,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    backgroundColor: colors.inputBackground,
    paddingHorizontal: 16,
    color: colors.text,
    fontSize: 16,
  },
  inputError: {
    borderColor: colors.danger,
  },
  error: {
    color: colors.danger,
    fontSize: 13,
  },
});