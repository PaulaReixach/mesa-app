import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import { radii, shadows } from '../theme/layout';

type PrimaryButtonProps = {
  title: string;
  loading?: boolean;
  loadingTitle?: string;
  disabled?: boolean;
  onPress: () => void;
};

export function PrimaryButton({
  title,
  loading = false,
  loadingTitle = 'Cargando...',
  disabled = false,
  onPress,
}: PrimaryButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{
        busy: loading,
        disabled: isDisabled,
      }}
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        pressed && !isDisabled
          ? styles.buttonPressed
          : null,
        isDisabled ? styles.buttonDisabled : null,
      ]}
    >
      {loading ? (
        <View style={styles.content}>
          <ActivityIndicator color={colors.white} size="small" />
          <Text style={styles.title}>{loadingTitle}</Text>
        </View>
      ) : (
        <Text
          style={[
            styles.title,
            isDisabled ? styles.titleDisabled : null,
          ]}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 54,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.md,
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    ...shadows.card,
  },
  buttonPressed: {
    backgroundColor: colors.primaryPressed,
    transform: [{ scale: 0.992 }],
  },
  buttonDisabled: {
    elevation: 0,
    backgroundColor: colors.primaryDisabled,
    shadowOpacity: 0,
  },
  title: {
    color: colors.white,
    fontSize: 16,
    fontFamily: fonts.bold,
  },
  titleDisabled: {
    color: colors.onPrimaryDisabled,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
});
