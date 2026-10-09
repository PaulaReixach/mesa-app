import { SymbolView } from 'expo-symbols';
import type { ComponentProps, ReactNode } from 'react';
import { View } from 'react-native';

import { AppText } from './AppText';
import { createThemedStyles, iconSize, space, useTheme } from '../../theme';

/**
 * Screen state (empty or error) from the prototype: 72pt sage circle with an olive icon,
 * title, text and an optional primary action. `compact` drops the circle for a section
 * that is empty inside a screen.
 */
export function EmptyState({ icon, title, message, actions, compact = false }: {
  icon: ComponentProps<typeof SymbolView>['name'];
  title: string;
  message: string;
  actions?: ReactNode;
  compact?: boolean;
}) {
  const { colors } = useTheme();
  const styles = useStyles();

  if (compact) {
    return (
      <View style={styles.compact} accessibilityLiveRegion="polite">
        <View style={styles.compactIcon} accessible={false} importantForAccessibility="no-hide-descendants">
          <SymbolView name={icon} size={iconSize.link} tintColor={colors.secondary} />
        </View>
        <View style={styles.compactCopy}>
          <AppText variant="cardTitle">{title}</AppText>
          <AppText variant="secondary" tone="muted">{message}</AppText>
          {actions}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.panel} accessibilityLiveRegion="polite">
      <View style={styles.circle} accessible={false} importantForAccessibility="no-hide-descendants">
        <SymbolView name={icon} size={iconSize.state} tintColor={colors.secondary} />
      </View>
      <AppText accessibilityRole="header" variant="featureTitle" style={styles.center}>{title}</AppText>
      <AppText variant="body" tone="muted" style={[styles.center, styles.message]}>{message}</AppText>
      {actions && <View style={styles.actions}>{actions}</View>}
    </View>
  );
}

const useStyles = createThemedStyles(({ colors }) => ({
  panel: { alignItems: 'center', paddingTop: 48, paddingBottom: 18, paddingHorizontal: space.s1 },
  circle: {
    width: 72,
    height: 72,
    marginBottom: 22,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.secondarySoft,
  },
  center: { textAlign: 'center' },
  message: { maxWidth: 280, marginTop: 10 },
  actions: { alignSelf: 'stretch', marginTop: 25, gap: space.s1 },
  compact: { flexDirection: 'row', alignItems: 'flex-start', gap: space.s3, paddingVertical: space.s3 },
  compactIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.secondarySoft,
  },
  compactCopy: { flex: 1, gap: 2 },
}));
