import { Alert, Platform } from 'react-native';

type ConfirmOptions = {
  title: string;
  /** Says what is lost and for whom («Se borrarán sus 31 sitios… No se puede deshacer.»). */
  message?: string;
  confirmLabel: string;
  cancelLabel?: string;
  /** Destructive actions are red and never the default button. */
  destructive?: boolean;
  onConfirm: () => void;
  onCancel?: () => void;
};

/**
 * Native confirmation alert: Cancelar · action (DESIGN.md › Ajustes del grupo › Alertas).
 * On web, where Alert does nothing, it falls back to window.confirm.
 */
export function confirmAlert({
  title, message, confirmLabel, cancelLabel = 'Cancelar', destructive = true, onConfirm, onCancel,
}: ConfirmOptions) {
  if (Platform.OS === 'web') {
    const accepted = globalThis.confirm?.([title, message].filter(Boolean).join('\n\n')) ?? false;
    if (accepted) onConfirm(); else onCancel?.();
    return;
  }
  Alert.alert(title, message, [
    { text: cancelLabel, style: 'cancel', onPress: onCancel },
    { text: confirmLabel, style: destructive ? 'destructive' : 'default', onPress: onConfirm },
  ], { cancelable: true, onDismiss: onCancel });
}

/** «¿Descartar los cambios?» for sheets closed with unsaved edits. */
export function confirmDiscard(onDiscard: () => void) {
  confirmAlert({
    title: '¿Descartar los cambios?',
    message: 'Lo que has cambiado no se guardará.',
    confirmLabel: 'Descartar',
    cancelLabel: 'Seguir editando',
    onConfirm: onDiscard,
  });
}
