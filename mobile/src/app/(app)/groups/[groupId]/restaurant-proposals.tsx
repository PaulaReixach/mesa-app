import { SymbolView } from 'expo-symbols';
import {
  router,
  useFocusEffect,
  useLocalSearchParams,
} from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
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

import { RestaurantProposalCard } from '../../../../components/RestaurantProposalCard';
import { useAuth } from '../../../../contexts/auth-context';
import { getErrorMessage } from '../../../../lib/api';
import {
  acceptRestaurantProposal,
  getRestaurantProposals,
  rejectRestaurantProposal,
} from '../../../../services/restaurant-proposal-service';
import { colors } from '../../../../theme/colors';
import type { RestaurantProposal } from '../../../../types/restaurant-proposal';
import { fonts } from '../../../../theme/fonts';

type ResolutionAction = 'ACCEPT' | 'REJECT';

export default function RestaurantProposalsManagementScreen() {
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const { accessToken } = useAuth();

  const [proposals, setProposals] = useState<RestaurantProposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [resolving, setResolving] = useState<{
    id: string;
    action: ResolutionAction;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (isRefresh = false) => {
    if (!accessToken || !groupId) {
      setError('No se han podido recuperar las propuestas.');
      setLoading(false);
      return;
    }

    try {
      setError(null);
      isRefresh ? setRefreshing(true) : setLoading(true);
      setProposals(
        await getRestaurantProposals(groupId, accessToken),
      );
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [accessToken, groupId]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const pending = useMemo(
    () => proposals.filter(proposal => proposal.status === 'PENDING'),
    [proposals],
  );

  const history = useMemo(
    () => proposals.filter(proposal => proposal.status !== 'PENDING'),
    [proposals],
  );

  async function resolveProposal(
    proposal: RestaurantProposal,
    action: ResolutionAction,
  ): Promise<void> {
    if (!accessToken || !groupId || resolving) {
      return;
    }

    try {
      setResolving({ id: proposal.id, action });
      setError(null);

      const updated = action === 'ACCEPT'
        ? await acceptRestaurantProposal(
            groupId,
            proposal.id,
            accessToken,
          )
        : await rejectRestaurantProposal(
            groupId,
            proposal.id,
            accessToken,
          );

      setProposals(current => current.map(item =>
        item.id === updated.id ? updated : item
      ));

      if (action === 'ACCEPT') {
        await load(true);
      }
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setResolving(null);
    }
  }

  function confirmAccept(proposal: RestaurantProposal): void {
    Alert.alert(
      'Aceptar propuesta',
      `${proposal.name} se añadirá a la lista pública como pendiente de visitar.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Aceptar',
          onPress: () => void resolveProposal(proposal, 'ACCEPT'),
        },
      ],
    );
  }

  function confirmReject(proposal: RestaurantProposal): void {
    Alert.alert(
      'Rechazar propuesta',
      `${proposal.name} no se añadirá al grupo.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Rechazar',
          style: 'destructive',
          onPress: () => void resolveProposal(proposal, 'REJECT'),
        },
      ],
    );
  }

  return (
    <SafeAreaView
      edges={['top', 'right', 'bottom', 'left']}
      style={styles.safeArea}
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
        <Text style={styles.headerTitle}>Propuestas</Text>
        <View style={styles.iconButton} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => void load(true)}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loading}>
            <ActivityIndicator color={colors.primary} size="large" />
          </View>
        ) : null}

        {!loading ? (
          <>
            <View style={styles.introCard}>
              <View style={styles.introIcon}>
                <SymbolView
                  name={{
                    ios: 'tray.full.fill',
                    android: 'inbox',
                    web: 'inbox',
                  }}
                  size={23}
                  tintColor={colors.primary}
                />
              </View>
              <View style={styles.introText}>
                <Text style={styles.introTitle}>
                  Revisa las propuestas
                </Text>
                <Text style={styles.introDescription}>
                  Al aceptar, el restaurante se añadirá a la lista pública y quedará registrado quién lo propuso.
                </Text>
              </View>
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Pendientes</Text>
                <Text style={styles.sectionCount}>{pending.length}</Text>
              </View>

              {pending.length === 0 ? (
                <View style={styles.emptyCard}>
                  <Text style={styles.emptyTitle}>Todo revisado</Text>
                  <Text style={styles.emptyText}>
                    No hay propuestas pendientes en este momento.
                  </Text>
                </View>
              ) : (
                <View style={styles.list}>
                  {pending.map(proposal => (
                    <RestaurantProposalCard
                      key={proposal.id}
                      proposal={proposal}
                      showProposer
                      resolvingAction={
                        resolving?.id === proposal.id
                          ? resolving.action
                          : null
                      }
                      onAccept={() => confirmAccept(proposal)}
                      onReject={() => confirmReject(proposal)}
                    />
                  ))}
                </View>
              )}
            </View>

            {history.length > 0 ? (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Historial</Text>
                  <Text style={styles.sectionCount}>{history.length}</Text>
                </View>
                <View style={styles.list}>
                  {history.map(proposal => (
                    <RestaurantProposalCard
                      key={proposal.id}
                      proposal={proposal}
                      showProposer
                    />
                  ))}
                </View>
              </View>
            ) : null}
          </>
        ) : null}

        {error ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>{error}</Text>
            <Pressable onPress={() => void load()}>
              <Text style={styles.retryText}>Volver a intentar</Text>
            </Pressable>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  header: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
  },
  iconButton: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { color: colors.text, fontSize: 15, fontFamily: fonts.bold },
  content: {
    flexGrow: 1,
    gap: 22,
    paddingHorizontal: 18,
    paddingBottom: 36,
  },
  loading: { alignItems: 'center', paddingVertical: 100 },
  introCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    backgroundColor: colors.surface,
  },
  introIcon: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: '#FBE9E2',
  },
  introText: { flex: 1, gap: 4 },
  introTitle: { color: colors.text, fontSize: 14, fontFamily: fonts.bold },
  introDescription: { color: colors.muted, fontSize: 10, lineHeight: 15 },
  section: { gap: 12 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: { color: colors.text, fontSize: 17, fontFamily: fonts.bold },
  sectionCount: { color: colors.primary, fontSize: 12, fontFamily: fonts.bold },
  list: { gap: 10 },
  emptyCard: {
    gap: 5,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    backgroundColor: colors.surface,
  },
  emptyTitle: { color: colors.text, fontSize: 14, fontFamily: fonts.bold },
  emptyText: { color: colors.muted, fontSize: 10, lineHeight: 15 },
  errorCard: {
    gap: 6,
    padding: 14,
    borderRadius: 15,
    backgroundColor: '#FFF1EE',
  },
  errorText: { color: colors.danger, fontSize: 11, lineHeight: 16 },
  retryText: { color: colors.primary, fontSize: 10, fontFamily: fonts.bold },
});
