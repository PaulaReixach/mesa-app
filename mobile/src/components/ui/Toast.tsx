import {
  createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode,
} from 'react';
import { AccessibilityInfo, Pressable, View } from 'react-native';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from './AppText';
import {
  createThemedStyles, motion, radius, SCREEN_GUTTER, space, textActionHitSlop, useTheme,
} from '../../theme';

type ToastOptions = {
  message: string;
  /** One short action («Ver», «Deshacer»). */
  actionLabel?: string;
  onAction?: () => void;
  /** ms; longer by default when there is an action to reach. */
  duration?: number;
};

type ToastState = ToastOptions & { id: number };

const ToastContext = createContext<((options: ToastOptions) => void) | null>(null);

/** Shows the bottom status notice. Requires `ToastProvider` above the screen. */
export function useToast() {
  const show = useContext(ToastContext);
  if (!show) throw new Error('useToast must be used inside ToastProvider');
  return show;
}

/**
 * Bottom notice in charcoal (DESIGN.md › Gestionar propuestas): role status, announced to
 * screen readers, one optional action. Reanimated layout animations honour reduced motion.
 */
export function ToastProvider({ children, bottomOffset = 0 }: { children: ReactNode; bottomOffset?: number }) {
  const [toast, setToast] = useState<ToastState | null>(null);
  const nextId = useRef(0);

  const show = useCallback((options: ToastOptions) => {
    nextId.current += 1;
    setToast({ ...options, id: nextId.current });
    AccessibilityInfo.announceForAccessibility(options.message);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), toast.duration ?? (toast.actionLabel ? 6000 : 4000));
    return () => clearTimeout(timer);
  }, [toast]);

  const value = useMemo(() => show, [show]);
  return (
    <ToastContext.Provider value={value}>
      {children}
      {toast && <ToastView key={toast.id} toast={toast} bottomOffset={bottomOffset} onClose={() => setToast(null)} />}
    </ToastContext.Provider>
  );
}

function ToastView({ toast, bottomOffset, onClose }: { toast: ToastState; bottomOffset: number; onClose: () => void }) {
  const styles = useStyles();
  const { colors, scheme } = useTheme();
  const insets = useSafeAreaInsets();
  const actionColor = scheme === 'dark' ? colors.accent : colors.accentSoft;
  return (
    <View pointerEvents="box-none" style={[styles.wrapper, { bottom: insets.bottom + bottomOffset + space.s3 }]}>
      <Animated.View
        entering={FadeInDown.duration(motion.enter)}
        exiting={FadeOutDown.duration(motion.state)}
        role="status"
        accessibilityLiveRegion="polite"
        style={styles.toast}
      >
        <AppText variant="secondaryStrong" style={[styles.message, { color: scheme === 'dark' ? colors.textPrimary : colors.background }]}>
          {toast.message}
        </AppText>
        {toast.actionLabel && (
          <Pressable hitSlop={textActionHitSlop} accessibilityRole="button"
            onPress={() => { toast.onAction?.(); onClose(); }}>
            <AppText variant="bodyStrong" style={{ color: actionColor }}>{toast.actionLabel}</AppText>
          </Pressable>
        )}
      </Animated.View>
    </View>
  );
}

const useStyles = createThemedStyles(({ colors, scheme, elevation }) => ({
  wrapper: { position: 'absolute', left: SCREEN_GUTTER, right: SCREEN_GUTTER },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.s4,
    paddingVertical: 14,
    paddingHorizontal: space.s4,
    borderRadius: radius.md,
    borderCurve: 'continuous',
    backgroundColor: scheme === 'dark' ? colors.surfaceElevated : colors.textPrimary,
    boxShadow: elevation.floating,
  },
  message: { flex: 1 },
}));
