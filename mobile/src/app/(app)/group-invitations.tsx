import { SymbolView } from 'expo-symbols';
import {
  type Href,
  router,
  useFocusEffect,
} from 'expo-router';
import {
  useCallback,
  useMemo,
  useState,
} from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '../../contexts/auth-context';
import { getErrorMessage } from '../../lib/api';
import {
  acceptGroupInvitation,
  getMyGroupInvitations,
  rejectGroupInvitation,
} from '../../services/group-invitation-service';
import { colors } from '../../theme/colors';
import type {
  GroupInvitation,
  GroupInvitationStatus,
} from '../../types/group-invitation';

const statusPresentation: Record<
  GroupInvitationStatus,
  {
    label: string;
    backgroundColor: string;
    textColor: string;
  }
> = {
  PENDING: {
    label: 'Pendiente',
    backgroundColor: '#F7E8D2',
    textColor: '#9B6717',
  },
  ACCEPTED: {
    label: 'Aceptada',
    backgroundColor: '#E8EEDD',
    textColor: '#607349',
  },
  REJECTED: {
    label: 'Rechazada',
    backgroundColor: '#FFF1EE',
    textColor: colors.danger,
  },
  CANCELLED: {
    label: 'Cancelada',
    backgroundColor: '#ECE8E6',
    textColor: colors.muted,
  },
};

function formatDate(dateValue: string): string {
  return new Date(dateValue).toLocaleDateString(
    'es-ES',
    {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    },
  );
}

export default function GroupInvitationsScreen() {
  const { accessToken } = useAuth();
  const [invitations, setInvitations] = useState<GroupInvitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [actingId, setActingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const pendingInvitations = useMemo(
    () => invitations.filter(invitation => invitation.status === 'PENDING'),
    [invitations],
  );

  const resolvedInvitations = useMemo(
    () => invitations.filter(invitation => invitation.status !== 'PENDING'),
    [invitations],
  );

  const loadInvitations = useCallback(async (
    refreshing = false,
  ): Promise<void> => {
    if (!accessToken) {
      setIsLoading(false);
      return;
    }

    try {
      setErrorMessage(null);
      refreshing ? setIsRefreshing(true) : setIsLoading(true);
      setInvitations(await getMyGroupInvitations(accessToken));
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [accessToken]);

  useFocusEffect(
    useCallback(() => {
      void loadInvitations();
    }, [loadInvitations]),
  );

  function openGroup(invitation: GroupInvitation): void {
    if (invitation.groupPrivacy === 'PUBLIC') {
      router.push(
        `/groups/public/${invitation.groupId}` as Href,
      );
      return;
    }

    router.push({
      pathname: '/groups/[groupId]',
      params: {
        groupId: invitation.groupId,
      },
    });
  }

  async function handleAccept(
    invitation: GroupInvitation,
  ): Promise<void> {
    if (!accessToken || actingId) {
      return;
    }

    try {
      setActingId(invitation.id);
      setErrorMessage(null);

      const updated = await acceptGroupInvitation(
        invitation.id,
        accessToken,
      );

      setInvitations(current =>
        current.map(item =>
          item.id === updated.id ? updated : item,
        ),
      );

      Alert.alert(
        'Invitación aceptada',
        `Ya formas parte de “${updated.groupName}”.`,
        [
          {
            text: 'Seguir aquí',
            style: 'cancel',
          },
          {
            text: 'Abrir grupo',
            onPress: () => openGroup(updated),
          },
        ],
      );
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setActingId(null);
    }
  }

  function confirmReject(invitation: GroupInvitation): void {
    Alert.alert(
      'Rechazar invitación',
      `¿No quieres unirte a “${invitation.groupName}”?`,
      [
        {
          text: 'Volver',
          style: 'cancel',
        },
        {
          text: 'Rechazar',
          style: 'destructive',
          onPress: () => {
            void handleReject(invitation);
          },
        },
      ],
    );
  }

  async function handleReject(
    invitation: GroupInvitation,
  ): Promise<void> {
    if (!accessToken || actingId) {
      return;
    }

    try {
      setActingId(invitation.id);
      setErrorMessage(null);

      const updated = await rejectGroupInvitation(
        invitation.id,
        accessToken,
      );

      setInvitations(current =>
        current.map(item =>
          item.id === updated.id ? updated : item,
        ),
      );
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setActingId(null);
    }
  }

  function renderInvitation(
    invitation: GroupInvitation,
  ) {
    const presentation = statusPresentation[invitation.status];
    const isActing = actingId === invitation.id;

    return (
      <View
        key={invitation.id}
        style={styles.invitationCard}
      >
        <View style={styles.cardHeader}>
          <View style={styles.groupIcon}>
            <SymbolView
              name={{
                ios: 'person.2.fill',
                android: 'group',
                web: 'group',
              }}
              size={22}
              tintColor={colors.primary}
            />
          </View>

          <View style={styles.cardTitleContent}>
            <Text style={styles.groupName}>
              {invitation.groupName}
            </Text>
            <Text style={styles.inviterText}>
              Invitación de @{invitation.invitedBy.username}
            </Text>
          </View>

          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: presentation.backgroundColor,
              },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                {
                  color: presentation.textColor,
                },
              ]}
            >
              {presentation.label}
            </Text>
          </View>
        </View>

        <View style={styles.cardMeta}>
          <Text style={styles.privacyText}>
            Grupo {invitation.groupPrivacy === 'PUBLIC'
              ? 'público'
              : 'privado'}
          </Text>
          <Text style={styles.dateText}>
            {formatDate(invitation.createdAt)}
          </Text>
        </View>

        {invitation.status === 'PENDING' ? (
          <View style={styles.actionRow}>
            <Pressable
              accessibilityRole="button"
              disabled={actingId !== null}
              onPress={() => confirmReject(invitation)}
              style={({ pressed }) => [
                styles.secondaryButton,
                pressed ? styles.pressed : null,
              ]}
            >
              <Text style={styles.secondaryButtonText}>
                Rechazar
              </Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              disabled={actingId !== null}
              onPress={() => {
                void handleAccept(invitation);
              }}
              style={({ pressed }) => [
                styles.primaryButton,
                pressed ? styles.pressed : null,
              ]}
            >
              {isActing ? (
                <ActivityIndicator
                  color={colors.white}
                  size="small"
                />
              ) : (
                <Text style={styles.primaryButtonText}>
                  Aceptar
                </Text>
              )}
            </Pressable>
          </View>
        ) : null}

        {invitation.status === 'ACCEPTED' ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => openGroup(invitation)}
            style={({ pressed }) => [
              styles.openButton,
              pressed ? styles.pressed : null,
            ]}
          >
            <Text style={styles.openButtonText}>
              Abrir grupo
            </Text>
            <SymbolView
              name={{
                ios: 'chevron.right',
                android: 'chevron_right',
                web: 'chevron_right',
              }}
              size={17}
              tintColor={colors.primary}
            />
          </Pressable>
        ) : null}
      </View>
    );
  }

  return (
    <SafeAreaView
      edges={['top', 'right', 'bottom', 'left']}
      style={styles.safeArea}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={(
          <RefreshControl
            onRefresh={() => void loadInvitations(true)}
            refreshing={isRefreshing}
            tintColor={colors.primary}
          />
        )}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Pressable
            accessibilityLabel="Volver"
            accessibilityRole="button"
            onPress={() => router.back()}
            style={styles.iconButton}
          >
            <SymbolView
              name={{
                ios: 'chevron.left',
                android: 'arrow_back',
                web: 'arrow_back',
              }}
              size={20}
              tintColor={colors.text}
            />
          </Pressable>

          <Text style={styles.headerTitle}>
            Invitaciones
          </Text>

          <View style={styles.iconButton} />
        </View>

        <View style={styles.heading}>
          <Text style={styles.title}>
            Invitaciones a grupos
          </Text>
          <Text style={styles.subtitle}>
            Acepta para empezar a formar parte del grupo o rechaza
            las invitaciones que no te interesen.
          </Text>
        </View>

        {isLoading ? (
          <View style={styles.loading}>
            <ActivityIndicator
              color={colors.primary}
              size="large"
            />
          </View>
        ) : null}

        {errorMessage ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>
              {errorMessage}
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => void loadInvitations()}
            >
              <Text style={styles.retryText}>
                Volver a intentar
              </Text>
            </Pressable>
          </View>
        ) : null}

        {!isLoading && invitations.length === 0 ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
              <SymbolView
                name={{
                  ios: 'envelope.open',
                  android: 'mark_email_read',
                  web: 'mark_email_read',
                }}
                size={25}
                tintColor={colors.primary}
              />
            </View>
            <Text style={styles.emptyTitle}>
              No tienes invitaciones
            </Text>
            <Text style={styles.emptyText}>
              Cuando alguien te invite a un grupo, aparecerá aquí.
            </Text>
          </View>
        ) : null}

        {!isLoading && pendingInvitations.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Pendientes · {pendingInvitations.length}
            </Text>
            <View style={styles.list}>
              {pendingInvitations.map(renderInvitation)}
            </View>
          </View>
        ) : null}

        {!isLoading && resolvedInvitations.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Historial
            </Text>
            <View style={styles.list}>
              {resolvedInvitations.map(renderInvitation)}
            </View>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flexGrow: 1,
    gap: 24,
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 36,
  },
  header: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconButton: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '900',
  },
  heading: {
    gap: 7,
  },
  title: {
    color: colors.text,
    fontSize: 27,
    fontWeight: '900',
  },
  subtitle: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 20,
  },
  loading: {
    alignItems: 'center',
    paddingVertical: 80,
  },
  section: {
    gap: 11,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '900',
  },
  list: {
    gap: 11,
  },
  invitationCard: {
    gap: 13,
    padding: 15,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    backgroundColor: colors.surface,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },
  groupIcon: {
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
    backgroundColor: '#FBE9E2',
  },
  cardTitleContent: {
    flex: 1,
    gap: 3,
  },
  groupName: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '900',
  },
  inviterText: {
    color: colors.muted,
    fontSize: 11,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 999,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '900',
  },
  cardMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  privacyText: {
    color: colors.text,
    fontSize: 10,
    fontWeight: '700',
  },
  dateText: {
    color: colors.muted,
    fontSize: 10,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  secondaryButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 42,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    backgroundColor: colors.surface,
  },
  secondaryButtonText: {
    color: colors.danger,
    fontSize: 12,
    fontWeight: '900',
  },
  primaryButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 42,
    borderRadius: 14,
    backgroundColor: colors.primary,
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '900',
  },
  openButton: {
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    borderRadius: 14,
    backgroundColor: '#FBE9E2',
  },
  openButtonText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '900',
  },
  emptyCard: {
    alignItems: 'center',
    gap: 7,
    padding: 26,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    backgroundColor: colors.surface,
  },
  emptyIcon: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    borderRadius: 18,
    backgroundColor: '#FBE9E2',
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '900',
  },
  emptyText: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
  },
  errorCard: {
    gap: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F3C5BC',
    borderRadius: 18,
    backgroundColor: '#FFF1EE',
  },
  errorText: {
    color: colors.danger,
    fontSize: 12,
    lineHeight: 18,
  },
  retryText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '900',
  },
  pressed: {
    opacity: 0.72,
  },
});
