import { SymbolView } from 'expo-symbols';
import { router, useFocusEffect } from 'expo-router';
import type { Href } from 'expo-router';
import type { ComponentProps } from 'react';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  type LayoutChangeEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useAuth } from '../contexts/auth-context';
import { getErrorMessage } from '../lib/api';
import {
  cancelPublicGroupCollaborationRequest,
  getPublicGroupCollaborationState,
  leavePublicGroupCollaboration,
} from '../services/group-service';
import { colors } from '../theme/colors';
import type { PublicGroupCollaborationState } from '../types/group';

type SymbolName = ComponentProps<typeof SymbolView>['name'];

type Props = {
  groupId: string;
  ownedByCurrentUser: boolean;
  hideWhenCollaborating?: boolean;
};

export function PublicGroupCollaborationActions({
  groupId,
  ownedByCurrentUser,
  hideWhenCollaborating = false,
}: Props) {
  const { accessToken } = useAuth();
  const [state, setState] = useState<PublicGroupCollaborationState | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [width, setWidth] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const compact = width === 0 || width < 340;

  const load = useCallback(async (): Promise<void> => {
    if (!accessToken) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setState(await getPublicGroupCollaborationState(groupId, accessToken));
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, [accessToken, groupId]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  function measure(event: LayoutChangeEvent): void {
    setWidth(event.nativeEvent.layout.width);
  }

  function openRequest(): void {
    router.push(`/groups/public/${groupId}/collaborate` as Href);
  }

  function openManagement(): void {
    router.push({
      pathname: '/groups/[groupId]/collaboration-requests',
      params: { groupId },
    });
  }

  function openCollaborationSpace(): void {
    router.push(`/groups/${groupId}/collaboration` as Href);
  }

  function openInvitations(): void {
    router.push('/group-invitations' as Href);
  }

  async function cancelRequest(): Promise<void> {
    if (!accessToken || cancelling) return;

    try {
      setCancelling(true);
      setError(null);
      await cancelPublicGroupCollaborationRequest(groupId, accessToken);
      await load();
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setCancelling(false);
    }
  }

  async function leaveCollaboration(): Promise<void> {
    if (!accessToken || leaving) return;

    try {
      setLeaving(true);
      setError(null);
      await leavePublicGroupCollaboration(groupId, accessToken);
      router.replace(`/groups/public/${groupId}` as Href);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLeaving(false);
    }
  }

  function confirmCancel(): void {
    Alert.alert(
      'Cancelar solicitud',
      'Podrás enviar una nueva solicitud más adelante.',
      [
        { text: 'Volver', style: 'cancel' },
        {
          text: 'Cancelar solicitud',
          style: 'destructive',
          onPress: () => void cancelRequest(),
        },
      ],
    );
  }

  function confirmLeave(): void {
    Alert.alert(
      'Dejar de colaborar',
      'Dejarás de formar parte del grupo y tus valoraciones dejarán de contar en sus medias. Seguirás siguiéndolo si ya lo hacías.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Dejar de colaborar',
          style: 'destructive',
          onPress: () => void leaveCollaboration(),
        },
      ],
    );
  }

  function renderCompactButton({
    title,
    icon,
    tone = 'primary',
    onPress,
    disabled = false,
  }: {
    title: string;
    icon: SymbolName;
    tone?: 'primary' | 'green' | 'muted' | 'warm';
    onPress?: () => void;
    disabled?: boolean;
  }) {
    const tint = tone === 'green'
      ? '#607349'
      : tone === 'muted'
        ? colors.muted
        : tone === 'warm'
          ? '#9A6A21'
          : colors.primary;

    return (
      <View onLayout={measure} style={styles.container}>
        <Pressable
          accessibilityRole="button"
          disabled={disabled || !onPress}
          onPress={onPress}
          style={({ pressed }) => [
            styles.compactButton,
            tone === 'green' ? styles.compactGreen : null,
            tone === 'warm' ? styles.compactWarm : null,
            tone === 'muted' ? styles.compactMuted : null,
            pressed ? styles.pressed : null,
          ]}
        >
          <SymbolView
            name={icon}
            size={18}
            tintColor={tint}
          />
          <Text style={[styles.compactText, { color: tint }]} numberOfLines={1}>
            {title}
          </Text>
        </Pressable>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </View>
    );
  }

  if (loading) {
    return (
      <View onLayout={measure} style={styles.loadingCard}>
        <ActivityIndicator color={colors.primary} size="small" />
      </View>
    );
  }

  if (ownedByCurrentUser) {
    return renderCompactButton({
      title: state?.pendingRequestCount
        ? `Gestionar · ${state.pendingRequestCount}`
        : 'Gestionar colaboración',
      icon: {
        ios: 'person.2.badge.gearshape',
        android: 'manage_accounts',
        web: 'manage_accounts',
      },
      onPress: openManagement,
    });
  }

  if (state?.invitationPending) {
    return renderCompactButton({
      title: 'Ver invitación',
      icon: {
        ios: 'envelope.badge.fill',
        android: 'mark_email_unread',
        web: 'mark_email_unread',
      },
      tone: 'warm',
      onPress: openInvitations,
    });
  }

  const retryDate = state?.retryAt ? new Date(state.retryAt) : null;
  const retryBlocked = Boolean(
    retryDate && retryDate.getTime() > Date.now(),
  );

  if (state?.collaborating && hideWhenCollaborating) {
    return (
      <View style={styles.container}>
        <Pressable
          accessibilityRole="button"
          disabled={leaving}
          onPress={confirmLeave}
          style={({ pressed }) => [
            styles.exitButton,
            pressed ? styles.pressed : null,
            leaving ? styles.disabled : null,
          ]}
        >
          <SymbolView
            name={{
              ios: 'rectangle.portrait.and.arrow.right',
              android: 'logout',
              web: 'logout',
            }}
            size={17}
            tintColor={colors.danger}
          />
          <Text style={styles.exitButtonText}>
            {leaving ? 'Saliendo...' : 'Dejar de colaborar'}
          </Text>
        </Pressable>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </View>
    );
  }

  if (state?.collaborating && compact) {
    return renderCompactButton({
      title: 'Colaborando',
      icon: {
        ios: 'checkmark.circle.fill',
        android: 'check_circle',
        web: 'check_circle',
      },
      tone: 'green',
      onPress: openCollaborationSpace,
    });
  }

  if (state?.collaborating) {
    return (
      <View onLayout={measure} style={styles.successCard}>
        <View style={styles.stateRow}>
          <View style={styles.greenIcon}>
            <SymbolView
              name={{
                ios: 'checkmark.circle.fill',
                android: 'check_circle',
                web: 'check_circle',
              }}
              size={18}
              tintColor="#607349"
            />
          </View>
          <View style={styles.stateText}>
            <Text style={styles.successTitle}>Tu espacio de colaboración</Text>
            <Text style={styles.stateSubtitle}>
              Propón restaurantes y comparte tus valoraciones.
            </Text>
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={openCollaborationSpace}
          style={({ pressed }) => [styles.greenButton, pressed ? styles.pressed : null]}
        >
          <Text style={styles.greenButtonText}>Proponer o valorar</Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          disabled={leaving}
          onPress={confirmLeave}
        >
          <Text style={styles.leaveText}>
            {leaving ? 'Saliendo...' : 'Dejar de colaborar'}
          </Text>
        </Pressable>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </View>
    );
  }

  if (state?.requestStatus === 'PENDING') {
    if (compact) {
      return renderCompactButton({
        title: cancelling ? 'Cancelando...' : 'Solicitud pendiente',
        icon: {
          ios: 'clock.fill',
          android: 'schedule',
          web: 'schedule',
        },
        tone: 'warm',
        onPress: confirmCancel,
        disabled: cancelling,
      });
    }

    return (
      <View onLayout={measure} style={styles.pendingCard}>
        <View style={styles.stateRow}>
          <View style={styles.pendingIcon}>
            <SymbolView
              name={{ ios: 'clock.fill', android: 'schedule', web: 'schedule' }}
              size={18}
              tintColor="#9A6A21"
            />
          </View>
          <View style={styles.stateText}>
            <Text style={styles.pendingTitle}>Solicitud pendiente</Text>
            <Text style={styles.stateSubtitle}>
              La creadora todavía debe responder.
            </Text>
          </View>
        </View>
        <Pressable disabled={cancelling} onPress={confirmCancel}>
          <Text style={styles.cancelText}>
            {cancelling ? 'Cancelando...' : 'Cancelar solicitud'}
          </Text>
        </Pressable>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </View>
    );
  }

  if (!state?.acceptingCollaborators) {
    return renderCompactButton({
      title: 'Colaboración cerrada',
      icon: {
        ios: 'person.crop.circle.badge.xmark',
        android: 'person_off',
        web: 'person_off',
      },
      tone: 'muted',
      disabled: true,
    });
  }

  if (retryBlocked && retryDate) {
    return renderCompactButton({
      title: `Disponible el ${retryDate.toLocaleDateString('es-ES')}`,
      icon: {
        ios: 'calendar.badge.clock',
        android: 'event_busy',
        web: 'event_busy',
      },
      tone: 'muted',
      disabled: true,
    });
  }

  return renderCompactButton({
    title: 'Solicitar colaborar',
    icon: {
      ios: 'person.badge.plus',
      android: 'person_add',
      web: 'person_add',
    },
    onPress: openRequest,
  });
}

const styles = StyleSheet.create({
  container: {
    gap: 7,
  },
  loadingCard: {
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    backgroundColor: colors.surface,
  },
  compactButton: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 16,
    backgroundColor: colors.surface,
  },
  compactGreen: {
    borderColor: '#B8C69D',
    backgroundColor: '#F1F3E9',
  },
  compactWarm: {
    borderColor: '#E6CDA7',
    backgroundColor: '#FFF7EC',
  },
  compactMuted: {
    borderColor: colors.border,
    backgroundColor: '#F7F5F3',
  },
  compactText: {
    flexShrink: 1,
    fontSize: 11,
    fontWeight: '900',
    textAlign: 'center',
  },
  exitButton: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#E7B8B0',
    borderRadius: 15,
    backgroundColor: '#FFF7F5',
  },
  exitButtonText: {
    color: colors.danger,
    fontSize: 10,
    fontWeight: '900',
  },
  successCard: {
    gap: 10,
    padding: 12,
    borderRadius: 17,
    backgroundColor: '#F1F3E9',
  },
  pendingCard: {
    gap: 10,
    padding: 12,
    borderRadius: 17,
    backgroundColor: '#FFF7EC',
  },
  stateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  greenIcon: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 13,
    backgroundColor: '#E0E9CF',
  },
  pendingIcon: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 13,
    backgroundColor: '#FFE5C2',
  },
  stateText: {
    flex: 1,
    gap: 2,
  },
  successTitle: {
    color: '#607349',
    fontSize: 11,
    fontWeight: '900',
  },
  pendingTitle: {
    color: '#9A6A21',
    fontSize: 11,
    fontWeight: '900',
  },
  stateSubtitle: {
    color: colors.muted,
    fontSize: 8,
    lineHeight: 12,
  },
  greenButton: {
    minHeight: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#607349',
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.58)',
  },
  greenButtonText: {
    color: '#607349',
    fontSize: 10,
    fontWeight: '900',
  },
  cancelText: {
    color: colors.danger,
    fontSize: 9,
    fontWeight: '900',
    textAlign: 'center',
  },
  leaveText: {
    color: colors.danger,
    fontSize: 9,
    fontWeight: '900',
    textAlign: 'center',
  },
  errorText: {
    color: colors.danger,
    fontSize: 8,
    lineHeight: 12,
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.72,
  },
  disabled: {
    opacity: 0.55,
  },
});
