import { SymbolView } from 'expo-symbols';
import {
  router,
  useFocusEffect,
} from 'expo-router';
import type { Href } from 'expo-router';
import {
  useCallback,
  useState,
} from 'react';
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
  const [state, setState] =
    useState<PublicGroupCollaborationState | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
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
            size={17}
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

  const retryDate = state?.retryAt
    ? new Date(state.retryAt)
    : null;
  const retryBlocked = Boolean(
    retryDate && retryDate.getTime() > Date.now(),
  );

  if (state?.collaborating) {
    return (
      <View style={styles.successBadge}>
        <SymbolView
          name={{
            ios: 'checkmark.circle.fill',
            android: 'check_circle',
            web: 'check_circle',
          }}
          size={17}
          tintColor="#607349"
        />
        <Text style={styles.successText}>
          Colaborando
        </Text>
      </View>
    );
  }

  if (state?.requestStatus === 'PENDING') {
    return (
      <View style={styles.container}>
        <View style={styles.pendingBadge}>
          <SymbolView
            name={{
              ios: 'clock.fill',
              android: 'schedule',
              web: 'schedule',
            }}
            size={16}
            tintColor="#9A6A21"
          />
          <Text style={styles.pendingText}>
            Solicitud pendiente
          </Text>
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
      <View style={styles.disabledBadge}>
        <Text style={styles.disabledText}>
          No acepta nuevas colaboraciones
        </Text>
      </View>
    );
  }

  if (retryBlocked && retryDate) {
    return (
      <View style={styles.disabledBadge}>
        <Text style={styles.disabledText}>
          Podrás volver a solicitar el{' '}
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
          size={17}
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
    gap: 8,
  },
  loadingCard: {
    minHeight: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 15,
    backgroundColor: colors.inputBackground,
  },
  outlineButton: {
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 15,
    backgroundColor: '#FFF4EF',
  },
  outlineButtonText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '900',
  },
  successBadge: {
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    borderRadius: 15,
    backgroundColor: '#E8EEDD',
  },
  successText: {
    color: '#607349',
    fontSize: 12,
    fontWeight: '900',
  },
  pendingBadge: {
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    borderRadius: 15,
    backgroundColor: '#FFF0D9',
  },
  pendingText: {
    color: '#9A6A21',
    fontSize: 12,
    fontWeight: '900',
  },
  cancelText: {
    color: colors.danger,
    fontSize: 11,
    fontWeight: '900',
    textAlign: 'center',
  },
  disabledBadge: {
    minHeight: 46,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 15,
    backgroundColor: colors.inputBackground,
  },
  disabledText: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: '800',
    textAlign: 'center',
  },
  errorText: {
    color: colors.danger,
    fontSize: 10,
    lineHeight: 15,
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.72,
  },
});
