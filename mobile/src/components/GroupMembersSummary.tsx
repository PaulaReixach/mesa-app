import { SymbolView } from 'expo-symbols';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/colors';
import type { GroupPrivacy } from '../types/group';
import { fonts } from '../theme/fonts';

export function GroupMembersSummary({
  privacy,
  participantCount,
}: {
  privacy: GroupPrivacy;
  participantCount: number;
}) {
  const publicGroup = privacy === 'PUBLIC';
  const participantLabel = publicGroup
    ? `${participantCount} ${participantCount === 1 ? 'colaborador' : 'colaboradores'}`
    : `${participantCount} ${participantCount === 1 ? 'miembro activo' : 'miembros activos'}`;
  const participantText = publicGroup
    ? 'Valoran y proponen restaurantes.'
    : 'Comparten recomendaciones.';

  return (
    <View style={styles.card}>
      <SummaryPart
        icon="owner"
        text="Gestiona el grupo y sus invitaciones."
        title="1 creadora"
      />
      <View style={styles.divider} />
      <SummaryPart
        icon="people"
        text={participantText}
        title={participantLabel}
      />
    </View>
  );
}

function SummaryPart({
  icon,
  title,
  text,
}: {
  icon: 'owner' | 'people';
  title: string;
  text: string;
}) {
  const owner = icon === 'owner';

  return (
    <View style={styles.part}>
      <View style={owner ? styles.greenIcon : styles.warmIcon}>
        <SymbolView
          name={owner
            ? { ios: 'crown.fill', android: 'workspace_premium', web: 'workspace_premium' }
            : { ios: 'person.2.fill', android: 'group', web: 'group' }}
          size={18}
          tintColor={owner ? '#607349' : colors.primary}
        />
      </View>
      <View style={styles.copy}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.text}>{text}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', gap: 11, padding: 13, borderRadius: 18, backgroundColor: '#FFF8EE' },
  part: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  divider: { width: StyleSheet.hairlineWidth, backgroundColor: '#DED5CE' },
  greenIcon: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20, backgroundColor: '#E8EEDD' },
  warmIcon: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20, backgroundColor: '#FBE9E2' },
  copy: { flex: 1, minWidth: 0, gap: 3 },
  title: { color: colors.text, fontSize: 9, fontFamily: fonts.bold },
  text: { color: colors.muted, fontSize: 7, lineHeight: 10 },
});
