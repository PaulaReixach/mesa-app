import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
} from 'react-native';

import { colors, loginColors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import { radii, shadows } from '../theme/layout';

type PrimaryButtonProps = {
  title: string;
  loading?: boolean;
  loadingTitle?: string;
  disabled?: boolean;
  onPress: () => void;
  variant?: 'default' | 'login';
};

export function PrimaryButton({
  title,
  loading = false,
  loadingTitle,
  disabled = false,
  onPress,
  variant = 'default',
}: PrimaryButtonProps) {
  const isDisabled = disabled || loading;
  const isLogin = variant === 'login';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={loading && isLogin ? loadingTitle ?? 'Entrando' : title}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      aria-busy={loading}
      aria-disabled={isDisabled}
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        isLogin && styles.loginButton,
        pressed && !isDisabled && !isLogin
          ? styles.buttonPressed
          : null,
        pressed && !isDisabled && isLogin && styles.loginButtonPressed,
        isDisabled && !(isLogin && loading) ? styles.buttonDisabled : null,
      ]}
    >
      {loading ? (
        <>
          <ActivityIndicator color={colors.white} />
          {isLogin && <Text style={styles.loginTitle}>{loadingTitle ?? 'Entrando…'}</Text>}
        </>
      ) : (
        <Text style={[styles.title, isLogin && styles.loginTitle]}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.lg,
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    ...shadows.card,
  },
  loginButton: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 16,
    borderRadius: radii.sm,
    backgroundColor: loginColors.primary,
    elevation: 0,
    shadowOpacity: 0,
  },
  loginButtonPressed: {
    backgroundColor: loginColors.primaryPressed,
  },
  loginTitle: {
    flexShrink: 1,
    color: colors.white,
    fontFamily: fonts.semiBold,
    fontSize: 17,
    lineHeight: 24,
    textAlign: 'center',
  },
  buttonPressed: {
    backgroundColor: colors.primaryPressed,
    transform: [{ scale: 0.992 }],
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  title: {
    color: colors.white,
    fontSize: 16,
    fontFamily: fonts.bold,
  },
});
