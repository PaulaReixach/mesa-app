import { SymbolView } from 'expo-symbols';
import { Pressable, TextInput, View, type StyleProp, type ViewStyle } from 'react-native';

import { AppText } from './AppText';
import {
  createThemedStyles, iconSize, radius, space, typography, useTheme,
} from '../../theme';

type SearchFieldProps = {
  placeholder: string;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
} & (
  /** Trigger: looks like a search box and opens the search screen. */
  | { onPress: () => void; value?: undefined; onChangeText?: undefined }
  | {
    value: string;
    onChangeText: (text: string) => void;
    onPress?: undefined;
    onSubmitEditing?: () => void;
    autoFocus?: boolean;
  }
);

const SEARCH_ICON = { ios: 'magnifyingglass', android: 'search', web: 'search' } as const;
const CLEAR_ICON = { ios: 'xmark.circle.fill', android: 'cancel', web: 'cancel' } as const;

/** Search box (DESIGN.md › Inputs): 48 high, radius 12, olive magnifier, clear button. */
export function SearchField(props: SearchFieldProps) {
  const styles = useStyles();
  const { colors } = useTheme();
  const label = props.accessibilityLabel ?? props.placeholder;
  const icon = <SymbolView name={SEARCH_ICON} size={iconSize.search} tintColor={colors.secondary} />;

  if (props.onPress) {
    return (
      <Pressable onPress={props.onPress} accessibilityRole="search" accessibilityLabel={label}
        style={({ pressed }) => [styles.box, styles.trigger, pressed && styles.pressed, props.style]}>
        {icon}
        <AppText variant="body" tone="muted" numberOfLines={1} style={styles.flex}>{props.placeholder}</AppText>
      </Pressable>
    );
  }

  const { value, onChangeText } = props;
  return (
    <View style={[styles.box, styles.editable, props.style]}>
      {icon}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={props.placeholder}
        placeholderTextColor={colors.textTertiary}
        onSubmitEditing={props.onSubmitEditing}
        autoFocus={props.autoFocus}
        returnKeyType="search"
        autoCorrect={false}
        accessibilityRole="search"
        accessibilityLabel={label}
        style={[styles.input, styles.flex]}
      />
      {value.length > 0 && (
        <Pressable onPress={() => onChangeText('')} accessibilityRole="button" accessibilityLabel="Borrar búsqueda"
          hitSlop={12}>
          <SymbolView name={CLEAR_ICON} size={iconSize.search} tintColor={colors.iconMuted} />
        </Pressable>
      )}
    </View>
  );
}

const useStyles = createThemedStyles(({ colors }) => ({
  box: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    borderRadius: radius.md,
    borderCurve: 'continuous',
    borderWidth: 1,
    backgroundColor: colors.surface,
  },
  trigger: { borderColor: colors.border },
  editable: { borderColor: colors.borderInput },
  pressed: { backgroundColor: colors.surfaceSecondary },
  flex: { flex: 1, minWidth: 0 },
  input: { ...typography.body, color: colors.textPrimary, paddingVertical: space.s3 },
}));
