import { SymbolView } from 'expo-symbols';
import { router, useFocusEffect } from 'expo-router';
import type { Href } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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

type Props = {
  groupId: string;
  ownedByCurrentUser: boolean;
};

export function PublicGroupCollaborationActions({
  groupId,
  ownedByCurrentUser,
}: Props) {
  const { accessToken } = useAuth();
  const [state, setState] = useState<PublicGroupCollaborationState | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (): Promise<void> => {
    if (!accessToken) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setState(
        await getPublicGroupCollaborationState(
          groupId,
          accessToken,
        ),
      );
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

  function openRequest(): void {
    router.push(
      `/groups/public/${groupId}/collaborate` as Href,
    );
  }

  function openManagement(): void {
    router.push({
      pathname: '/groups/[groupId]/collaboration-requests',
      params: { groupId },
    });
  }

  function openCollaborationSpace(): void {
    router.push(
      `/groups/${groupId}/collaboration` as Href,
    );
  }

  function openInvitations(): void {
    router.push('/group-invitations' as Href);
  }

  async function cancelRequest(): Promise<void> {
    if (!accessToken || cancelling) {
      return;
    }

    try {
      setCancelling(true);
      setError(null);
      await cancelPublicGroupCollaborationRequest(
        groupId,
        accessToken,
      );
      await load();
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setCancelling(false);
    }
  }

  async function leaveCollaboration(): Promise<void> {
    if (!accessToken || leaving) {
      return;
    }

    try {
      setLeaving(true);
      setError(null);
      await leavePublicGroupCollaboration(
        groupId,
        accessToken,
      );
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
      'Tus valoraciones dejarán de contar en las medias del grupo. Seguirás siguiéndolo si ya lo hacías.',
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

  if (loading) {
    return (
      <View style={styles.loadingCard}>
        <ActivityIndicator color={colors.primary} size="small" />
      </View>
    );
  }

  if (ownedByCurrentUser) {
    return (
      <View style={styles.container}>
        <Pressable
          accessibilityRole="button"
          onPress={openManagement}
          style={({ pressed }) => [
            styles.outlineButton,
            pressed ? styles.pressed : null,
          ]}
        >
          <SymbolView
            name={{
              ios: 'person.2.badge.gearshape',
              android: 'manage_accounts',
              web: 'manage_accounts',
            }}
            size={18}
            tintColor={colors.primary}
          />
          <Text style={styles.outlineButtonText}>
            Gestionar colaboración
            {state?.pendingRequestCount
              ? ` · ${state.pendingRequestCount}`
              : ''}
          </Text>
        </Pressable>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </View>
    );
  }

  if (state?.invitationPending) {
    return (
      <View style={styles.invitationCard}>
        <View style={styles.stateRow}>
          <View style={styles.warmIcon}>
            <SymbolView
              name={{
                ios: 'envelope.badge.fill',
                android: 'mark_email_unread',
                web: 'mark_email_unread',
              }}
              size={18}
              tintColor={colors.primary}
            />
          </View>
          <View style={styles.stateText}>
            <Text style={styles.stateTitle}>
              Invitación pendiente
            </Text>
            <Text style={styles.stateSubtitle}>
              Puedes aceptar o rechazarla ahora.
            </Text>
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={openInvitations}
          style={({ pressed }) => [
            styles.smallOutlineButton,
            pressed ? styles.pressed : null,
          ]}
        >
          <Text style={styles.smallOutlineText}>Ver invitación</Text>
        </Pressable>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </View>
    );
  }

  const retryDate = state?.retryAt
    ? new Date(state.retryAt)
    : null;
  const retryBlocked = Boolean(
    retryDate && retryDate.getTime() > Date.now(),
  );

  if (state?.collaborating) {
    return (
      <View style={styles.successCard}>
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
            <Text style={styles.successTitle}>Colaborando</Text>
            <Text style={styles.stateSubtitle}>
              Valora y propón nuevos restaurantes.
            </Text>
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={openCollaborationSpace}
          style={({ pressed }) => [
            styles.greenButton,
            pressed ? styles.pressed : null,
          ]}
        >
          <Text style={styles.greenButtonText}>Abrir colaboración</Text>
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
    return (
      <View style={styles.pendingCard}>
        <View style={styles.stateRow}>
          <View style={styles.pendingIcon}>
            <SymbolView
              name={{
                ios: 'clock.fill',
                android: 'schedule',
                web: 'schedule',
              }}
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

        <Pressable
          accessibilityRole="button"
          disabled={cancelling}
          onPress={confirmCancel}
        >
          <Text style={styles.cancelText}>
            {cancelling ? 'Cancelando...' : 'Cancelar solicitud'}
          </Text>
        </Pressable>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </View>
    );
  }

  if (!state?.acceptingCollaborators) {
    return (
      <View style={styles.disabledCard}>
        <SymbolView
          name={{
            ios: 'person.crop.circle.badge.xmark',
            android: 'person_off',
            web: 'person_off',
          }}
          size={18}
          tintColor={colors.muted}
        />
        <Text style={styles.disabledText}>
          No acepta nuevas colaboraciones
        </Text>
      </View>
    );
  }

  if (retryBlocked && retryDate) {
    return (
      <View style={styles.disabledCard}>
        <SymbolView
          name={{
            ios: 'calendar.badge.clock',
            android: 'event_busy',
            web: 'event_busy',
          }}
          size={18}
          tintColor={colors.muted}
        />
        <Text style={styles.disabledText}>
          Podrás solicitar de nuevo el{' '}
          {retryDate.toLocaleDateString('es-ES')}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Pressable
        accessibilityRole="button"
        onPress={openRequest}
        style={({ pressed }) => [
          styles.outlineButton,
          pressed ? styles.pressed : null,
        ]}
      >
        <SymbolView
          name={{
            ios: 'person.badge.plus',
            android: 'person_add',
            web: 'person_add',
          }}
          size={18}
          tintColor={colors.primary}
        />
        <Text style={styles.outlineButtonText}>
          Solicitar colaborar
        </Text>
      </Pressable>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
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
  outlineButton: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 16,
    backgroundColor: colors.surface,
  },
  outlineButtonText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '900',
    textAlign: 'center',
  },
  invitationCard: {
    gap: 10,
    padding: 12,
    borderRadius: 17,
    backgroundColor: '#FFF7EC',
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
  warmIcon: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 13,
    backgroundColor: '#FFE5C2',
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
  stateTitle: {
    color: colors.text,
    fontSize: 11,
    fontWeight: '900',
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
  smallOutlineButton: {
    minHeight: 35,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.62)',
  },
  smallOutlineText: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: '900',
  },
  greenButton: {
    minHeight: 35,
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
  disabledCard: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    backgroundColor: colors.surface,
  },
  disabledText: {
    flex: 1,
    color: colors.muted,
    fontSize: 9,
    fontWeight: '800',
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
});
