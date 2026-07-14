import { SymbolView } from 'expo-symbols';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '../../../../contexts/auth-context';
import { getErrorMessage, resolveApiUrl } from '../../../../lib/api';
import {
  acceptPublicGroupCollaborationRequest,
  getGroup,
  getPublicGroupCollaborationRequests,
  rejectPublicGroupCollaborationRequest,
  updateGroup,
} from '../../../../services/group-service';
import { colors } from '../../../../theme/colors';
import type {
  CollaborationRequest,
  CollaborationRequestStatus,
  RestaurantGroup,
} from '../../../../types/group';
import { fonts } from '../../../../theme/fonts';

const statusPresentation: Record<CollaborationRequestStatus, {
  label: string;
  backgroundColor: string;
}> = {
  PENDING: { label: 'Pendiente', backgroundColor: '#FFF0D9' },
  ACCEPTED: { label: 'Aceptada', backgroundColor: '#E8EEDD' },
  REJECTED: { label: 'Rechazada', backgroundColor: '#FFF1EE' },
  CANCELLED: { label: 'Cancelada', backgroundColor: '#EEEAE7' },
  LEFT: { label: 'Dejó el grupo', backgroundColor: '#EEEAE7' },
};

function RequestCard({
  request,
  resolvingAction,
  onAccept,
  onReject,
}: {
  request: CollaborationRequest;
  resolvingAction: 'ACCEPT' | 'REJECT' | null;
  onAccept: () => void;
  onReject: () => void;
}) {
  const avatarUri = request.requester.avatarUrl
    ? resolveApiUrl(request.requester.avatarUrl)
    : null;
  const isPending = request.status === 'PENDING';
  const presentation = statusPresentation[request.status];

  return (
    <View style={styles.requestCard}>
      <View style={styles.requestHeader}>
        <View style={styles.avatar}>
          {avatarUri ? (
            <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
          ) : (
            <Text style={styles.avatarText}>{request.requester.name.charAt(0).toUpperCase()}</Text>
          )}
        </View>
        <View style={styles.requesterText}>
          <Text style={styles.requesterName}>{request.requester.name}</Text>
          <Text style={styles.requesterUsername}>@{request.requester.username}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: presentation.backgroundColor }]}>
          <Text style={styles.statusText}>{presentation.label}</Text>
        </View>
      </View>

      {request.message ? (
        <Text style={styles.message}>“{request.message}”</Text>
      ) : (
        <Text style={styles.noMessage}>Sin mensaje adicional.</Text>
      )}
      <Text style={styles.dateText}>{new Date(request.createdAt).toLocaleDateString('es-ES')}</Text>

      {isPending ? (
        <View style={styles.actions}>
          <Pressable accessibilityRole="button" disabled={resolvingAction !== null} onPress={onReject} style={styles.rejectButton}>
            {resolvingAction === 'REJECT' ? <ActivityIndicator color={colors.danger} size="small" /> : <Text style={styles.rejectButtonText}>Rechazar</Text>}
          </Pressable>
          <Pressable accessibilityRole="button" disabled={resolvingAction !== null} onPress={onAccept} style={styles.acceptButton}>
            {resolvingAction === 'ACCEPT' ? <ActivityIndicator color={colors.white} size="small" /> : <Text style={styles.acceptButtonText}>Aceptar</Text>}
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

export default function CollaborationRequestsScreen() {
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const { accessToken } = useAuth();
  const [group, setGroup] = useState<RestaurantGroup | null>(null);
  const [requests, setRequests] = useState<CollaborationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [savingSetting, setSavingSetting] = useState(false);
  const [resolving, setResolving] = useState<{ id: string; action: 'ACCEPT' | 'REJECT' } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (isRefresh = false) => {
    if (!accessToken || !groupId) {
      setError('No se han podido recuperar las solicitudes.');
      setLoading(false);
      return;
    }
    try {
      setError(null);
      isRefresh ? setRefreshing(true) : setLoading(true);
      const [groupResponse, requestResponse] = await Promise.all([
        getGroup(groupId, accessToken),
        getPublicGroupCollaborationRequests(groupId, accessToken),
      ]);
      setGroup(groupResponse);
      setRequests(requestResponse);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [accessToken, groupId]);

  useFocusEffect(useCallback(() => {
    void load();
  }, [load]));

  const pendingRequests = useMemo(
    () => requests.filter(request => request.status === 'PENDING'),
    [requests],
  );
  const historyRequests = useMemo(
    () => requests.filter(request => request.status !== 'PENDING'),
    [requests],
  );

  async function handleToggleAccepting(value: boolean): Promise<void> {
    if (!accessToken || !groupId || !group || savingSetting) return;
    try {
      setSavingSetting(true);
      setError(null);
      const updated = await updateGroup(groupId, {
        name: group.name,
        description: group.description,
        city: group.city,
        privacy: group.privacy,
        acceptingCollaborators: value,
      }, accessToken);
      setGroup(updated);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setSavingSetting(false);
    }
  }

  async function resolveRequest(
    request: CollaborationRequest,
    action: 'ACCEPT' | 'REJECT',
  ): Promise<void> {
    if (!accessToken || !groupId || resolving) return;
    try {
      setResolving({ id: request.id, action });
      setError(null);
      const updated = action === 'ACCEPT'
        ? await acceptPublicGroupCollaborationRequest(groupId, request.id, accessToken)
        : await rejectPublicGroupCollaborationRequest(groupId, request.id, accessToken);
      setRequests(current => current.map(item => item.id === updated.id ? updated : item));
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setResolving(null);
    }
  }

  return (
    <SafeAreaView edges={['top', 'right', 'bottom', 'left']} style={styles.safeArea}>
      <View style={styles.header}>
        <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.iconButton}>
          <SymbolView name={{ ios: 'chevron.left', android: 'arrow_back', web: 'arrow_back' }} size={20} tintColor={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Colaboración</Text>
        <View style={styles.iconButton} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void load(true)} tintColor={colors.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {loading ? <View style={styles.centered}><ActivityIndicator color={colors.primary} size="large" /></View> : null}

        {!loading && group ? (
          <>
            <View style={styles.settingCard}>
              <View style={styles.settingIcon}>
                <SymbolView name={{ ios: 'person.badge.plus', android: 'person_add', web: 'person_add' }} size={20} tintColor={colors.primary} />
              </View>
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Aceptar solicitudes</Text>
                <Text style={styles.settingDescription}>Permite que otras personas pidan colaborar en este grupo público.</Text>
              </View>
              {savingSetting ? <ActivityIndicator color={colors.primary} size="small" /> : (
                <Switch
                  value={group.acceptingCollaborators}
                  onValueChange={value => void handleToggleAccepting(value)}
                  thumbColor={colors.white}
                  trackColor={{ false: '#DDD4CE', true: colors.primary }}
                />
              )}
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Pendientes</Text><Text style={styles.sectionCount}>{pendingRequests.length}</Text></View>
              {pendingRequests.length === 0 ? (
                <View style={styles.emptyCard}><Text style={styles.emptyTitle}>Todo al día</Text><Text style={styles.emptyText}>No tienes solicitudes pendientes de revisar.</Text></View>
              ) : (
                <View style={styles.list}>{pendingRequests.map(request => (
                  <RequestCard
                    key={request.id}
                    request={request}
                    resolvingAction={resolving?.id === request.id ? resolving.action : null}
                    onAccept={() => void resolveRequest(request, 'ACCEPT')}
                    onReject={() => void resolveRequest(request, 'REJECT')}
                  />
                ))}</View>
              )}
            </View>

            {historyRequests.length > 0 ? (
              <View style={styles.section}>
                <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Historial</Text><Text style={styles.sectionCount}>{historyRequests.length}</Text></View>
                <View style={styles.list}>{historyRequests.map(request => (
                  <RequestCard key={request.id} request={request} resolvingAction={null} onAccept={() => undefined} onReject={() => undefined} />
                ))}</View>
              </View>
            ) : null}
          </>
        ) : null}

        {error ? <View style={styles.errorCard}><Text style={styles.errorText}>{error}</Text></View> : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  header: { minHeight: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18 },
  iconButton: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: colors.text, fontSize: 15, fontFamily: fonts.bold },
  content: { flexGrow: 1, gap: 22, paddingHorizontal: 18, paddingBottom: 36 },
  centered: { alignItems: 'center', paddingVertical: 90 },
  settingCard: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderWidth: 1, borderColor: colors.border, borderRadius: 20, backgroundColor: colors.surface },
  settingIcon: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 15, backgroundColor: '#FBE9E2' },
  settingText: { flex: 1, gap: 4 },
  settingTitle: { color: colors.text, fontSize: 14, fontFamily: fonts.bold },
  settingDescription: { color: colors.muted, fontSize: 10, lineHeight: 15 },
  section: { gap: 12 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { color: colors.text, fontSize: 17, fontFamily: fonts.bold },
  sectionCount: { color: colors.primary, fontSize: 12, fontFamily: fonts.bold },
  list: { gap: 10 },
  requestCard: { gap: 12, padding: 15, borderWidth: 1, borderColor: colors.border, borderRadius: 20, backgroundColor: colors.surface },
  requestHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderRadius: 22, backgroundColor: '#FBE9E2' },
  avatarImage: { width: '100%', height: '100%' },
  avatarText: { color: colors.primary, fontSize: 16, fontFamily: fonts.bold },
  requesterText: { flex: 1, gap: 2 },
  requesterName: { color: colors.text, fontSize: 13, fontFamily: fonts.bold },
  requesterUsername: { color: colors.primary, fontSize: 10, fontFamily: fonts.bold },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 5, borderRadius: 999 },
  statusText: { color: colors.text, fontSize: 8, fontFamily: fonts.bold },
  message: { color: colors.text, fontSize: 12, lineHeight: 18, fontStyle: 'italic' },
  noMessage: { color: colors.muted, fontSize: 11, fontStyle: 'italic' },
  dateText: { color: colors.muted, fontSize: 9 },
  actions: { flexDirection: 'row', gap: 9 },
  rejectButton: { minHeight: 44, flex: 1, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#F1B9AE', borderRadius: 15, backgroundColor: '#FFF1EE' },
  rejectButtonText: { color: colors.danger, fontSize: 12, fontFamily: fonts.bold },
  acceptButton: { minHeight: 44, flex: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 15, backgroundColor: colors.primary },
  acceptButtonText: { color: colors.white, fontSize: 12, fontFamily: fonts.bold },
  emptyCard: { gap: 5, padding: 18, borderWidth: 1, borderColor: colors.border, borderRadius: 18, backgroundColor: colors.surface },
  emptyTitle: { color: colors.text, fontSize: 14, fontFamily: fonts.bold },
  emptyText: { color: colors.muted, fontSize: 11, lineHeight: 16 },
  errorCard: { padding: 14, borderRadius: 15, backgroundColor: '#FFF1EE' },
  errorText: { color: colors.danger, fontSize: 11, lineHeight: 16 },
});
