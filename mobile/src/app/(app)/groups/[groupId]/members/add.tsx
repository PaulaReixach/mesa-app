import {
  router,
  useFocusEffect,
  useLocalSearchParams,
} from 'expo-router';
import {
  useCallback,
  useMemo,
  useState,
} from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FormField } from '../../../../../components/FormField';
import { PrimaryButton } from '../../../../../components/PrimaryButton';
import { useAuth } from '../../../../../contexts/auth-context';
import { getErrorMessage } from '../../../../../lib/api';
import {
  cancelGroupInvitation,
  createGroupInvitation,
  getGroupInvitations,
} from '../../../../../services/group-invitation-service';
import { colors } from '../../../../../theme/colors';
import type { GroupInvitation } from '../../../../../types/group-invitation';
import { fonts } from '../../../../../theme/fonts';

export default function AddGroupMemberScreen() {
  const { groupId } = useLocalSearchParams<{
    groupId: string;
  }>();

  const { accessToken } = useAuth();

  const [username, setUsername] = useState('');
  const [invitations, setInvitations] = useState<GroupInvitation[]>([]);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const pendingInvitations = useMemo(
    () => invitations.filter(invitation => invitation.status === 'PENDING'),
    [invitations],
  );

  const loadInvitations = useCallback(async (): Promise<void> => {
    if (!accessToken || !groupId) {
      setIsLoading(false);
      return;
    }

    try {
      setRequestError(null);
      setIsLoading(true);
      setInvitations(
        await getGroupInvitations(groupId, accessToken),
      );
    } catch (error) {
      setRequestError(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, groupId]);

  useFocusEffect(
    useCallback(() => {
      void loadInvitations();
    }, [loadInvitations]),
  );

  async function handleCreateInvitation(): Promise<void> {
    setRequestError(null);
    setSuccessMessage(null);

    const normalizedUsername = username
      .trim()
      .replace(/^@/, '');

    if (!normalizedUsername) {
      setRequestError('Introduce el nombre de usuario.');
      return;
    }

    if (!accessToken || !groupId) {
      setRequestError(
        'No se ha podido recuperar tu sesión o el grupo.',
      );
      return;
    }

    try {
      setIsSubmitting(true);

      const invitation = await createGroupInvitation(
        groupId,
        {
          username: normalizedUsername,
        },
        accessToken,
      );

      setInvitations(current => [
        invitation,
        ...current.filter(item => item.id !== invitation.id),
      ]);
      setUsername('');
      setSuccessMessage(
        `Invitación enviada a @${invitation.invitedUser.username}.`,
      );
    } catch (error) {
      setRequestError(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  function confirmCancel(invitation: GroupInvitation): void {
    Alert.alert(
      'Cancelar invitación',
      `¿Quieres cancelar la invitación enviada a @${invitation.invitedUser.username}?`,
      [
        {
          text: 'Volver',
          style: 'cancel',
        },
        {
          text: 'Cancelar invitación',
          style: 'destructive',
          onPress: () => {
            void handleCancel(invitation);
          },
        },
      ],
    );
  }

  async function handleCancel(
    invitation: GroupInvitation,
  ): Promise<void> {
    if (!accessToken || !groupId || cancellingId) {
      return;
    }

    try {
      setCancellingId(invitation.id);
      setRequestError(null);
      setSuccessMessage(null);

      await cancelGroupInvitation(
        groupId,
        invitation.id,
        accessToken,
      );

      setInvitations(current =>
        current.map(item =>
          item.id === invitation.id
            ? {
                ...item,
                status: 'CANCELLED',
              }
            : item,
        ),
      );
      setSuccessMessage('Invitación cancelada.');
    } catch (error) {
      setRequestError(getErrorMessage(error));
    } finally {
      setCancellingId(null);
    }
  }

  return (
    <SafeAreaView
      edges={['top', 'right', 'bottom', 'left']}
      style={styles.safeArea}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Pressable
              accessibilityLabel="Volver"
              accessibilityRole="button"
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <Text style={styles.backText}>‹</Text>
            </Pressable>

            <Text style={styles.headerTitle}>
              Invitaciones
            </Text>

            <View style={styles.headerSpacer} />
          </View>

          <View style={styles.heading}>
            <Text style={styles.title}>
              Invita a alguien al grupo
            </Text>

            <Text style={styles.subtitle}>
              Recibirá una invitación y solo formará parte del grupo
              cuando la acepte.
            </Text>
          </View>

          <View style={styles.formCard}>
            <FormField
              autoCapitalize="none"
              autoCorrect={false}
              label="Nombre de usuario"
              maxLength={50}
              onChangeText={setUsername}
              placeholder="angel"
              value={username}
            />

            {requestError ? (
              <Text style={styles.error}>{requestError}</Text>
            ) : null}

            {successMessage ? (
              <Text style={styles.success}>{successMessage}</Text>
            ) : null}

            <PrimaryButton
              loading={isSubmitting}
              onPress={handleCreateInvitation}
              title="Enviar invitación"
            />
          </View>

          <View style={styles.pendingSection}>
            <View style={styles.sectionHeading}>
              <Text style={styles.sectionTitle}>
                Invitaciones pendientes
              </Text>
              <View style={styles.countBadge}>
                <Text style={styles.countText}>
                  {pendingInvitations.length}
                </Text>
              </View>
            </View>

            {isLoading ? (
              <View style={styles.loadingCard}>
                <ActivityIndicator
                  color={colors.primary}
                  size="small"
                />
                <Text style={styles.loadingText}>
                  Cargando invitaciones...
                </Text>
              </View>
            ) : null}

            {!isLoading && pendingInvitations.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyTitle}>
                  No hay invitaciones pendientes
                </Text>
                <Text style={styles.emptyText}>
                  Las nuevas invitaciones aparecerán aquí hasta que
                  se acepten, rechacen o cancelen.
                </Text>
              </View>
            ) : null}

            {!isLoading ? (
              <View style={styles.invitationList}>
                {pendingInvitations.map(invitation => (
                  <View
                    key={invitation.id}
                    style={styles.invitationCard}
                  >
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>
                        {invitation.invitedUser.name
                          .charAt(0)
                          .toUpperCase()}
                      </Text>
                    </View>

                    <View style={styles.invitationContent}>
                      <Text style={styles.invitedName}>
                        {invitation.invitedUser.name}
                      </Text>
                      <Text style={styles.invitedUsername}>
                        @{invitation.invitedUser.username}
                      </Text>
                      <Text style={styles.pendingText}>
                        Pendiente de respuesta
                      </Text>
                    </View>

                    <Pressable
                      accessibilityLabel={`Cancelar invitación a ${invitation.invitedUser.name}`}
                      accessibilityRole="button"
                      disabled={cancellingId !== null}
                      onPress={() => confirmCancel(invitation)}
                      style={({ pressed }) => [
                        styles.cancelButton,
                        pressed ? styles.pressed : null,
                      ]}
                    >
                      {cancellingId === invitation.id ? (
                        <ActivityIndicator
                          color={colors.danger}
                          size="small"
                        />
                      ) : (
                        <Text style={styles.cancelText}>
                          Cancelar
                        </Text>
                      )}
                    </Pressable>
                  </View>
                ))}
              </View>
            ) : null}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    gap: 26,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 36,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: colors.surface,
  },
  backText: {
    color: colors.text,
    fontFamily: fonts.regular,
    fontSize: 34,
    lineHeight: 36,
  },
  headerTitle: {
    color: colors.text,
    fontSize: 17,
    fontFamily: fonts.bold,
  },
  headerSpacer: {
    width: 44,
  },
  heading: {
    gap: 8,
    marginTop: 8,
  },
  title: {
    color: colors.text,
    fontSize: 29,
    fontFamily: fonts.bold,
    lineHeight: 35,
  },
  subtitle: {
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 22,
  },
  formCard: {
    gap: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    backgroundColor: colors.surface,
  },
  error: {
    color: colors.danger,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 19,
  },
  success: {
    color: '#607349',
    fontSize: 13,
    fontFamily: fonts.bold,
    lineHeight: 19,
  },
  pendingSection: {
    gap: 12,
  },
  sectionHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontFamily: fonts.bold,
  },
  countBadge: {
    minWidth: 25,
    height: 25,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 7,
    borderRadius: 999,
    backgroundColor: '#FBE9E2',
  },
  countText: {
    color: colors.primary,
    fontSize: 11,
    fontFamily: fonts.bold,
  },
  loadingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    backgroundColor: colors.surface,
  },
  loadingText: {
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 13,
  },
  emptyCard: {
    gap: 5,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    backgroundColor: colors.surface,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 14,
    fontFamily: fonts.bold,
  },
  emptyText: {
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 18,
  },
  invitationList: {
    gap: 10,
  },
  invitationCard: {
    minHeight: 76,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    padding: 13,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    backgroundColor: colors.surface,
  },
  avatar: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    backgroundColor: '#FBE9E2',
  },
  avatarText: {
    color: colors.primary,
    fontSize: 16,
    fontFamily: fonts.bold,
  },
  invitationContent: {
    flex: 1,
    gap: 2,
  },
  invitedName: {
    color: colors.text,
    fontSize: 13,
    fontFamily: fonts.bold,
  },
  invitedUsername: {
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 11,
  },
  pendingText: {
    marginTop: 2,
    color: '#9B6717',
    fontSize: 10,
    fontFamily: fonts.bold,
  },
  cancelButton: {
    minWidth: 70,
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#FFF1EE',
  },
  cancelText: {
    color: colors.danger,
    fontSize: 10,
    fontFamily: fonts.bold,
  },
  pressed: {
    opacity: 0.72,
  },
});
