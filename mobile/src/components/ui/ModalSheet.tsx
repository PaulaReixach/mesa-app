import type { ReactNode } from 'react';
import {
  ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from './AppText';
import { confirmDiscard } from './ConfirmAlert';
import {
  createThemedStyles, SCREEN_GUTTER, space, textActionHitSlop, touchTarget, useTheme,
} from '../../theme';

type ModalSheetProps = {
  title: string;
  onCancel: () => void;
  /** Without onSave the bar shows only «Cancelar» (or `cancelLabel`). */
  onSave?: () => void;
  saveLabel?: string;
  cancelLabel?: string;
  /** False until something changes or while a required field is empty. */
  canSave?: boolean;
  saving?: boolean;
  /** Unsaved edits: «Cancelar» asks before discarding them. */
  dirty?: boolean;
  /** Content scrolls by default; pass false for screens that manage their own list. */
  scroll?: boolean;
  children: ReactNode;
};

/**
 * Body of a modal route (`presentation: 'modal'`): bar Cancelar · Título · Guardar and the
 * content on the cream background (DESIGN.md › Ajustes del grupo › Editar).
 */
export function ModalSheet({
  title, onCancel, onSave, saveLabel = 'Guardar', cancelLabel = 'Cancelar',
  canSave = true, saving = false, dirty = false, scroll = true, children,
}: ModalSheetProps) {
  const styles = useStyles();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const saveEnabled = canSave && !saving;
  const cancel = () => (dirty ? confirmDiscard(onCancel) : onCancel());

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.bar, { paddingTop: Platform.OS === 'ios' ? space.s2 : insets.top + space.s2 }]}>
        <Pressable onPress={cancel} hitSlop={textActionHitSlop} accessibilityRole="button" style={styles.side}>
          <AppText variant="body" tone="olive" numberOfLines={1}>{cancelLabel}</AppText>
        </Pressable>
        <AppText variant="cardTitle" accessibilityRole="header" numberOfLines={1} style={styles.title}>
          {title}
        </AppText>
        <View style={[styles.side, styles.end]}>
          {onSave && (saving ? <ActivityIndicator color={colors.accent} /> : (
            <Pressable onPress={onSave} disabled={!saveEnabled} hitSlop={textActionHitSlop}
              accessibilityRole="button" accessibilityState={{ disabled: !saveEnabled }}>
              <AppText variant="bodyStrong" numberOfLines={1}
                style={{ color: saveEnabled ? colors.accent : colors.textSecondary }}>
                {saveLabel}
              </AppText>
            </Pressable>
          ))}
        </View>
      </View>
      {scroll ? (
        <ScrollView keyboardShouldPersistTaps="handled" keyboardDismissMode="interactive"
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + space.s8 }]}>
          {children}
        </ScrollView>
      ) : children}
    </KeyboardAvoidingView>
  );
}

const useStyles = createThemedStyles(({ colors }) => ({
  screen: { flex: 1, backgroundColor: colors.background },
  bar: {
    minHeight: touchTarget + space.s2,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: space.s4,
    paddingBottom: space.s2,
  },
  side: { width: 96, justifyContent: 'center' },
  end: { alignItems: 'flex-end' },
  title: { flex: 1, textAlign: 'center' },
  content: { paddingHorizontal: SCREEN_GUTTER, paddingTop: space.s3, gap: space.s6 },
}));
