import { router, useLocalSearchParams } from 'expo-router';
import type { Href } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { GroupExitAction } from './GroupExitAction';
import { GroupInfoBanner } from './GroupDetailPrimitives';
import { GroupMemberRow } from './GroupMemberRow';
import { GroupMembersSummary } from './GroupMembersSummary';
import { PublicGroupLeaveAction } from './PublicGroupLeaveAction';
import { useAuth } from '../contexts/auth-context';
import { getErrorMessage } from '../lib/api';
import { leaveGroup } from '../services/group-member-service';
import { colors } from '../theme/colors';
import type { GroupPrivacy } from '../types/group';
import type { GroupMember } from '../types/group-member';

type Props = {
  privacy: GroupPrivacy;
  members: GroupMember[];
  pendingInvitationCount?: number;
  canManageInvitations?: boolean;
  onManageInvitations?: () => void;
  onMemberPress?: (member: GroupMember) => void;
};

export function GroupMembersTab({
  privacy,
  members,
  pendingInvitationCount = 0,
  canManageInvitations = false,
  onManageInvitations,
  onMemberPress,
}: Props) {
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const { accessToken, user } = useAuth();
  const [leaving, setLeaving] = useState(false);
  const participantCount = members.filter(member => member.role !== 'OWNER').length;
  const currentMembership = members.find(member => member.userId === user?.id);
  const canLeavePrivateGroup = privacy === 'PRIVATE'
    && currentMembership != null
    && currentMembership.role !== 'OWNER';
  const canLeavePublicGroup = privacy === 'PUBLIC'
    && currentMembership != null
    && currentMembership.role !== 'OWNER';

  async function leavePrivateGroup(): Promise<void> {
    if (!accessToken || !groupId || leaving) return;

    try {
      setLeaving(true);
      await leaveGroup(groupId, accessToken);
      router.replace('/groups' as Href);
    } catch (requestError) {
      Alert.alert(
        'No se ha podido salir del grupo',
        getErrorMessage(requestError),
      );
    } finally {
      setLeaving(false);
    }
  }

  function confirmLeavePrivateGroup(): void {
    Alert.alert(
      'Salir del grupo',
      'Dejarás de ver sus restaurantes, miembros y actividad. Para volver, la creadora tendrá que invitarte otra vez.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Salir del grupo',
          style: 'destructive',
          onPress: () => void leavePrivateGroup(),
        },
      ],
    );
  }

  return (
    <View style={styles.container}>
      {canManageInvitations && pendingInvitationCount > 0 ? (
        <GroupInfoBanner
          actionLabel="Gestionar"
          icon={{ ios: 'envelope.fill', android: 'mail', web: 'mail' }}
          onPress={onManageInvitations}
          subtitle="Personas pendientes de aceptar tu invitación."
          title={`${pendingInvitationCount} ${pendingInvitationCount === 1 ? 'invitación pendiente' : 'invitaciones pendientes'}`}
        />
      ) : null}

      <View style={styles.heading}>
        <Text style={styles.headingTitle}>Miembros del grupo</Text>
      </View>

      <View style={styles.list}>
        {members.map(member => (
          <GroupMemberRow
            key={member.id}
            member={member}
            onPress={onMemberPress ? () => onMemberPress(member) : undefined}
            privacy={privacy}
          />
        ))}
      </View>

      <GroupMembersSummary
        participantCount={participantCount}
        privacy={privacy}
      />

      {canLeavePrivateGroup ? (
        <GroupExitAction
          label="Salir del grupo"
          loading={leaving}
          onPress={confirmLeavePrivateGroup}
        />
      ) : null}

      {canLeavePublicGroup ? (
        <PublicGroupLeaveAction groupId={groupId} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 12 },
  heading: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headingTitle: { flex: 1, color: colors.text, fontSize: 12, fontWeight: '900' },
  list: { overflow: 'hidden', borderWidth: 1, borderColor: colors.border, borderRadius: 17, backgroundColor: colors.surface },
});
