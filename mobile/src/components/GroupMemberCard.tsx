import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { colors } from '../theme/colors';
import { GroupMember } from '../types/group-member';

type GroupMemberCardProps = {
  member: GroupMember;
  canRemove: boolean;
  isRemoving: boolean;
  onRemove: () => void;
};

export function GroupMemberCard({
  member,
  canRemove,
  isRemoving,
  onRemove,
}: GroupMemberCardProps) {
  const roleLabel =
    member.role === 'OWNER'
      ? 'Propietaria'
      : 'Miembro';

  return (
    <View style={styles.card}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {member.name.charAt(0).toUpperCase()}
        </Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.name}>
          {member.name}
        </Text>

        <Text style={styles.username}>
          @{member.username}
        </Text>
      </View>

      <View style={styles.actions}>
        <View
          style={[
            styles.role,
            member.role === 'OWNER'
              ? styles.ownerRole
              : null,
          ]}
        >
          <Text
            style={[
              styles.roleText,
              member.role === 'OWNER'
                ? styles.ownerRoleText
                : null,
            ]}
          >
            {roleLabel}
          </Text>
        </View>

        {canRemove ? (
          <Pressable
            accessibilityRole="button"
            disabled={isRemoving}
            onPress={onRemove}
            style={({ pressed }) => [
              styles.removeButton,
              pressed && !isRemoving
                ? styles.removeButtonPressed
                : null,
            ]}
          >
            {isRemoving ? (
              <ActivityIndicator
                color={colors.danger}
                size="small"
              />
            ) : (
              <Text style={styles.removeText}>
                Eliminar
              </Text>
            )}
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    backgroundColor: colors.surface,
    padding: 14,
  },
  avatar: {
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
    backgroundColor: '#F7D9CF',
  },
  avatarText: {
    color: colors.primary,
    fontSize: 19,
    fontWeight: '800',
  },
  content: {
    flex: 1,
    gap: 3,
  },
  name: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  username: {
    color: colors.muted,
    fontSize: 13,
  },
  actions: {
    alignItems: 'flex-end',
    gap: 7,
  },
  role: {
    borderRadius: 999,
    backgroundColor: '#F0ECE9',
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  ownerRole: {
    backgroundColor: '#F7D9CF',
  },
  roleText: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '700',
  },
  ownerRoleText: {
    color: colors.primary,
  },
  removeButton: {
    minWidth: 58,
    alignItems: 'center',
    paddingVertical: 3,
  },
  removeButtonPressed: {
    opacity: 0.6,
  },
  removeText: {
    color: colors.danger,
    fontSize: 12,
    fontWeight: '700',
  },
});