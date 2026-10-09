import { SymbolView } from 'expo-symbols';
import { View } from 'react-native';

import { AppText } from './AppText';
import { Button } from './Button';
import { createThemedStyles, iconSize, radius, space, useTheme } from '../../theme';

/** Inline notice (e.g. a failed refresh that keeps previous content) with an optional action. */
export function InlineBanner({ title, message, actionLabel, onAction, actionLoading = false }: {
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  actionLoading?: boolean;
}) {
  const { colors } = useTheme();
  const styles = useStyles();

  return (
    <View style={styles.banner} accessibilityLiveRegion="polite">
      <SymbolView accessible={false} name={{ ios: 'exclamationmark.circle', android: 'error', web: 'error' }}
        size={iconSize.link} tintColor={colors.danger} />
      <View style={styles.copy}>
        <AppText variant="bodyStrong" tone="danger">{title}</AppText>
        {message && <AppText variant="secondary" tone="muted">{message}</AppText>}
        {actionLabel && onAction && (
          <Button variant="text" tone="accent" title={actionLabel} onPress={onAction} loading={actionLoading}
            style={styles.action} />
        )}
      </View>
    </View>
  );
}

const useStyles = createThemedStyles(({ colors }) => ({
  banner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: space.s3,
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderRadius: radius.md,
    borderCurve: 'continuous',
    backgroundColor: colors.dangerSoft,
  },
  copy: { flex: 1, gap: space.s1 },
  action: { marginTop: space.s1 },
}));
