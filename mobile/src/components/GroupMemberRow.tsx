import { SymbolView } from 'expo-symbols';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { resolveApiUrl } from '../lib/api';
import { colors } from '../theme/colors';
import type { GroupPrivacy } from '../types/group';
import type { GroupMember } from '../types/group-member';
import { fonts } from '../theme/fonts';

type Props = {
  member: GroupMember;
  privacy: GroupPrivacy;
  onPress?: () => void;
};

export function GroupMemberRow({ member, privacy, onPress }: Props) {
  const avatar = member.avatarUrl ? resolveApiUrl(member.avatarUrl) : null;
  const owner = member.role === 'OWNER';
  const collaborator = privacy === 'PUBLIC' && !owner;
  const role = owner ? 'Creadora' : collaborator ? 'Colaborador' : 'Miembro';

  return (
    <Pressable
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && onPress ? styles.pressed : null]}
    >
      <View style={styles.avatarWrap}>
        <View style={styles.avatar}>
          {avatar ? (
            <Image source={{ uri: avatar }} style={styles.avatarImage} />
          ) : (
            <Text style={styles.avatarText}>{member.name.charAt(0).toUpperCase()}</Text>
          )}
        </View>
        {owner ? (
          <View style={styles.crown}>
            <SymbolView
              name={{ ios: 'crown.fill', android: 'workspace_premium', web: 'workspace_premium' }}
              size={9}
              tintColor={colors.white}
            />
          </View>
        ) : null}
      </View>

      <View style={styles.copy}>
        <Text numberOfLines={1} style={styles.name}>{member.name}</Text>
        <View style={[
          styles.pill,
          owner ? styles.ownerPill : collaborator ? styles.collaboratorPill : styles.memberPill,
        ]}>
          <Text style={[
            styles.role,
            owner ? styles.ownerText : collaborator ? styles.collaboratorText : styles.memberText,
          ]}>{role}</Text>
        </View>
      </View>

      {onPress ? (
        <SymbolView
          name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
          size={17}
          tintColor={colors.muted}
        />
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { minHeight: 64, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 11, paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  avatarWrap: { position: 'relative' },
  avatar: { width: 46, height: 46, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderRadius: 23, backgroundColor: '#F4E1D8' },
  avatarImage: { width: '100%', height: '100%' },
  avatarText: { color: colors.primary, fontSize: 14, fontFamily: fonts.bold },
  crown: { position: 'absolute', right: -2, bottom: -1, width: 19, height: 19, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: colors.surface, borderRadius: 10, backgroundColor: colors.primary },
  copy: { flex: 1, minWidth: 0, alignItems: 'flex-start', gap: 5 },
  name: { color: colors.text, fontSize: 12, fontFamily: fonts.bold },
  pill: { paddingHorizontal: 9, paddingVertical: 4, borderRadius: 999 },
  ownerPill: { backgroundColor: '#FBE9E2' },
  collaboratorPill: { backgroundColor: '#E8EEDD' },
  memberPill: { backgroundColor: '#F4EFEA' },
  role: { fontSize: 8, fontFamily: fonts.bold },
  ownerText: { color: colors.primary },
  collaboratorText: { color: '#607349' },
  memberText: { color: colors.muted },
  pressed: { opacity: 0.72 },
});
