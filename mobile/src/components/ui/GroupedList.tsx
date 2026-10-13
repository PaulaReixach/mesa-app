import { Host, Switch } from '@expo/ui';
import { SymbolView } from 'expo-symbols';
import { Children, Fragment, isValidElement, type ReactNode } from 'react';
import { Pressable, TextInput, View, type StyleProp, type ViewStyle } from 'react-native';

import { AppText } from './AppText';
import {
  createThemedStyles, iconSize, radius, space, typography, useTheme,
} from '../../theme';

/** Fixed width of the label inside a field row (DESIGN.md › Editar un sitio). */
const FIELD_LABEL_WIDTH = 84;
const ROW_MIN_HEIGHT = 52;

type GroupedListProps = {
  /** Small title above the block («Dirección», «Personas»). */
  header?: string;
  /** One explanatory line below the block. */
  footer?: string;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

/**
 * Native-style grouped block: surface, rounded, rows separated by an inset hairline.
 * Short fixed groups only (settings, forms); long data uses FlatList.
 */
export function GroupedList({ header, footer, children, style }: GroupedListProps) {
  const styles = useStyles();
  const rows = Children.toArray(children).filter(isValidElement);
  return (
    <View style={[styles.section, style]}>
      {header && (
        <AppText accessibilityRole="header" variant="secondaryStrong" tone="muted" style={styles.header}>
          {header}
        </AppText>
      )}
      <View style={styles.block}>
        {rows.map((row, index) => (
          <Fragment key={row.key ?? index}>
            {index > 0 && <View style={styles.separator} />}
            {row}
          </Fragment>
        ))}
      </View>
      {footer && <AppText variant="caption" tone="muted" style={styles.footer}>{footer}</AppText>}
    </View>
  );
}

type LinkRow = {
  type: 'link';
  title: string;
  /** Current value shown before the chevron («Italiana», «3 nuevas»). */
  value?: string;
  /** Second line under the title. */
  detail?: string;
  leading?: ReactNode;
  onPress: () => void;
  accessibilityHint?: string;
};

type FieldRow = {
  type: 'field';
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  multiline?: boolean;
  maxLength?: number;
  /** Shown under the field; also turns the label red. */
  error?: string;
  autoCapitalize?: 'none' | 'sentences' | 'words';
};

type SwitchRow = {
  type: 'switch';
  title: string;
  detail?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
};

type ActionRow = {
  type: 'action';
  title: string;
  onPress: () => void;
  tone?: 'danger' | 'accent';
  accessibilityHint?: string;
};

export type GroupedRowProps = LinkRow | FieldRow | SwitchRow | ActionRow;

/** One row of a GroupedList. Rows are ≥ 52 pt high and expose role and state. */
export function GroupedRow(props: GroupedRowProps) {
  switch (props.type) {
    case 'link': return <LinkRowView {...props} />;
    case 'field': return <FieldRowView {...props} />;
    case 'switch': return <SwitchRowView {...props} />;
    case 'action': return <ActionRowView {...props} />;
  }
}

function usePressFeedback() {
  const { colors } = useTheme();
  return {
    android_ripple: { color: colors.separator },
    pressedStyle: { backgroundColor: colors.surfaceSecondary },
  };
}

function LinkRowView({ title, value, detail, leading, onPress, accessibilityHint }: LinkRow) {
  const styles = useStyles();
  const { colors } = useTheme();
  const { android_ripple, pressedStyle } = usePressFeedback();
  return (
    <Pressable
      onPress={onPress}
      android_ripple={android_ripple}
      accessibilityRole="button"
      accessibilityLabel={[title, value, detail].filter(Boolean).join(', ')}
      accessibilityHint={accessibilityHint}
      style={({ pressed }) => [styles.row, pressed && pressedStyle]}
    >
      {leading}
      <View style={styles.text}>
        <AppText variant="body">{title}</AppText>
        {detail && <AppText variant="secondary" tone="muted">{detail}</AppText>}
      </View>
      {value && (
        <AppText variant="body" tone="muted" numberOfLines={1} style={styles.value}>{value}</AppText>
      )}
      <SymbolView
        name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
        size={iconSize.inline}
        tintColor={colors.iconMuted}
      />
    </Pressable>
  );
}

function FieldRowView({
  label, value, onChangeText, placeholder, multiline, maxLength, error, autoCapitalize,
}: FieldRow) {
  const styles = useStyles();
  const { colors } = useTheme();
  const labelTone = error ? 'danger' : 'muted';
  if (multiline) {
    return (
      <View style={styles.fieldColumn}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textTertiary}
          maxLength={maxLength}
          multiline
          textAlignVertical="top"
          accessibilityLabel={label}
          accessibilityHint={error}
          style={[styles.input, styles.multiline]}
        />
        {error && <AppText variant="caption" tone="danger" accessibilityLiveRegion="polite">{error}</AppText>}
      </View>
    );
  }
  return (
    <View style={styles.fieldColumn}>
      <View style={styles.fieldRow}>
        <AppText variant="body" tone={labelTone} style={styles.fieldLabel} importantForAccessibility="no">
          {label}
        </AppText>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={error ? colors.danger : colors.textTertiary}
          maxLength={maxLength}
          autoCapitalize={autoCapitalize}
          accessibilityLabel={label}
          accessibilityHint={error}
          style={styles.input}
        />
      </View>
      {error && (
        <AppText variant="caption" tone="danger" accessibilityLiveRegion="polite" style={styles.fieldError}>
          {error}
        </AppText>
      )}
    </View>
  );
}

function SwitchRowView({ title, detail, value, onValueChange, disabled }: SwitchRow) {
  const styles = useStyles();
  const { scheme } = useTheme();
  return (
    <View
      style={styles.row}
      accessible
      accessibilityRole="switch"
      accessibilityLabel={detail ? `${title}, ${detail}` : title}
      accessibilityState={{ checked: value, disabled }}
      accessibilityActions={[{ name: 'activate' }]}
      onAccessibilityAction={() => !disabled && onValueChange(!value)}
    >
      {/* The explanation keeps full contrast even when the switch is disabled. */}
      <View style={styles.text}>
        <AppText variant="body">{title}</AppText>
        {detail && <AppText variant="secondary" tone="muted">{detail}</AppText>}
      </View>
      <Host matchContents colorScheme={scheme}>
        <Switch value={value} onValueChange={onValueChange} disabled={disabled} />
      </Host>
    </View>
  );
}

function ActionRowView({ title, onPress, tone = 'danger', accessibilityHint }: ActionRow) {
  const styles = useStyles();
  const { android_ripple, pressedStyle } = usePressFeedback();
  return (
    <Pressable
      onPress={onPress}
      android_ripple={android_ripple}
      accessibilityRole="button"
      accessibilityHint={accessibilityHint}
      style={({ pressed }) => [styles.row, styles.centered, pressed && pressedStyle]}
    >
      <AppText variant="bodyStrong" tone={tone}>{title}</AppText>
    </Pressable>
  );
}

const useStyles = createThemedStyles(({ colors }) => ({
  section: { gap: space.s2 },
  header: { paddingHorizontal: space.s4 },
  footer: { paddingHorizontal: space.s4 },
  block: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.lg,
    borderCurve: 'continuous',
    overflow: 'hidden',
  },
  separator: { height: 1, backgroundColor: colors.separator, marginLeft: space.s4 },
  row: {
    minHeight: ROW_MIN_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.s3,
    paddingHorizontal: space.s4,
    paddingVertical: space.s2,
  },
  centered: { justifyContent: 'center' },
  text: { flex: 1, minWidth: 0 },
  value: { flexShrink: 1, maxWidth: '50%', textAlign: 'right' },
  fieldColumn: { paddingHorizontal: space.s4 },
  fieldRow: { minHeight: ROW_MIN_HEIGHT, flexDirection: 'row', alignItems: 'center', gap: space.s3 },
  fieldLabel: { width: FIELD_LABEL_WIDTH },
  fieldError: { paddingLeft: FIELD_LABEL_WIDTH + space.s3, paddingBottom: space.s2 },
  input: {
    ...typography.body,
    flex: 1,
    minHeight: ROW_MIN_HEIGHT,
    color: colors.textPrimary,
    paddingVertical: space.s3,
  },
  multiline: { minHeight: 96 },
}));
