import { router, useLocalSearchParams } from 'expo-router';
import type { Href } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { GroupInfoBanner } from './GroupDetailPrimitives';
import { GroupMemberRow } from './GroupMemberRow';
import { GroupMembersSummary } from './GroupMembersSummary';
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
  const publicGroup = privacy === 'PUBLIC';
  const participantCount = members.filter(member => member.role !== 'OWNER').length;

  function openAll(): void {
    if (!publicGroup || !groupId) return;
    router.push(
      `/groups/public/${groupId}/collaborators` as Href,
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
        <Text style={styles.headingTitle}>
          {publicGroup ? 'Colaboradores del grupo' : 'Miembros del grupo'}
        </Text>
        <Pressable
          accessibilityRole={publicGroup ? 'button' : undefined}
          disabled={!publicGroup}
          hitSlop={8}
          onPress={openAll}
          style={({ pressed }) => pressed ? styles.pressed : null}
        >
          <Text style={styles.headingCount}>Ver todos ({members.length}) ›</Text>
        </Pressable>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 12 },
  heading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  headingTitle: { flex: 1, color: colors.text, fontSize: 12, fontWeight: '900' },
  headingCount: { color: '#607349', fontSize: 9, fontWeight: '900' },
  list: { overflow: 'hidden', borderWidth: 1, borderColor: colors.border, borderRadius: 17, backgroundColor: colors.surface },
  pressed: { opacity: 0.65 },
});
