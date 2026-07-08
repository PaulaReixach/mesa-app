import { SymbolView } from 'expo-symbols';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { colors } from '../theme/colors';
import type {
  RestaurantProposal,
  RestaurantProposalStatus,
} from '../types/restaurant-proposal';

const statusPresentation: Record<RestaurantProposalStatus, {
  label: string;
  backgroundColor: string;
  textColor: string;
}> = {
  PENDING: {
    label: 'Pendiente',
    backgroundColor: '#FFF0D9',
    textColor: '#9A6A21',
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
    backgroundColor: '#EEEAE7',
    textColor: colors.muted,
  },
  DUPLICATE: {
    label: 'Ya añadida',
    backgroundColor: '#EEEAE7',
    textColor: colors.muted,
  },
};

type ProposalAction = 'ACCEPT' | 'REJECT' | 'CANCEL';

type Props = {
  proposal: RestaurantProposal;
  showProposer?: boolean;
  resolvingAction?: ProposalAction | null;
  onAccept?: () => void;
  onReject?: () => void;
  onCancel?: () => void;
};

export function RestaurantProposalCard({
  proposal,
  showProposer = false,
  resolvingAction = null,
  onAccept,
  onReject,
  onCancel,
}: Props) {
  const presentation = statusPresentation[proposal.status];
  const location = [proposal.address, proposal.city]
    .filter(Boolean)
    .join(' · ');
  const pending = proposal.status === 'PENDING';

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.icon}>
          <SymbolView
            name={{
              ios: 'fork.knife',
              android: 'restaurant',
              web: 'restaurant',
            }}
            size={21}
            tintColor={colors.primary}
          />
        </View>

        <View style={styles.heading}>
          <Text numberOfLines={1} style={styles.name}>
            {proposal.name}
          </Text>
          <Text numberOfLines={1} style={styles.meta}>
            {proposal.category ?? 'Restaurante'}
            {location ? ` · ${location}` : ''}
          </Text>
        </View>

        <View
          style={[
            styles.status,
            { backgroundColor: presentation.backgroundColor },
          ]}
        >
          <Text
            style={[
              styles.statusText,
              { color: presentation.textColor },
            ]}
          >
            {presentation.label}
          </Text>
        </View>
      </View>

      {showProposer ? (
        <Text style={styles.proposer}>
          Propuesto por @{proposal.proposedBy.username}
        </Text>
      ) : null}

      {proposal.message ? (
        <View style={styles.messageBox}>
          <Text style={styles.message}>{proposal.message}</Text>
        </View>
      ) : null}

      <Text style={styles.date}>
        {new Date(proposal.createdAt).toLocaleDateString('es-ES')}
      </Text>

      {pending && onAccept && onReject ? (
        <View style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            disabled={resolvingAction !== null}
            onPress={onReject}
            style={styles.rejectButton}
          >
            {resolvingAction === 'REJECT' ? (
              <ActivityIndicator color={colors.danger} size="small" />
            ) : (
              <Text style={styles.rejectText}>Rechazar</Text>
            )}
          </Pressable>

          <Pressable
            accessibilityRole="button"
            disabled={resolvingAction !== null}
            onPress={onAccept}
            style={styles.acceptButton}
          >
            {resolvingAction === 'ACCEPT' ? (
              <ActivityIndicator color={colors.white} size="small" />
            ) : (
              <Text style={styles.acceptText}>Aceptar</Text>
            )}
          </Pressable>
        </View>
      ) : null}

      {pending && onCancel ? (
        <Pressable
          accessibilityRole="button"
          disabled={resolvingAction !== null}
          onPress={onCancel}
          style={styles.cancelButton}
        >
          {resolvingAction === 'CANCEL' ? (
            <ActivityIndicator color={colors.danger} size="small" />
          ) : (
            <Text style={styles.cancelText}>Cancelar propuesta</Text>
          )}
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 11,
    padding: 15,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    backgroundColor: colors.surface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  icon: {
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
    backgroundColor: '#F3DED5',
  },
  heading: {
    flex: 1,
    gap: 3,
  },
  name: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '900',
  },
  meta: {
    color: colors.muted,
    fontSize: 9,
  },
  status: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 999,
  },
  statusText: {
    fontSize: 8,
    fontWeight: '900',
  },
  proposer: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: '800',
  },
  messageBox: {
    padding: 11,
    borderRadius: 14,
    backgroundColor: '#FFF8F3',
  },
  message: {
    color: colors.text,
    fontSize: 11,
    lineHeight: 17,
    fontStyle: 'italic',
  },
  date: {
    color: colors.muted,
    fontSize: 9,
  },
  actions: {
    flexDirection: 'row',
    gap: 9,
  },
  rejectButton: {
    minHeight: 43,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F1B9AE',
    borderRadius: 14,
    backgroundColor: '#FFF1EE',
  },
  rejectText: {
    color: colors.danger,
    fontSize: 11,
    fontWeight: '900',
  },
  acceptButton: {
    minHeight: 43,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: colors.primary,
  },
  acceptText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '900',
  },
  cancelButton: {
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    color: colors.danger,
    fontSize: 10,
    fontWeight: '900',
  },
});
