import { SymbolView } from 'expo-symbols';
import { router, type Href } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { AppText } from './ui/AppText';
import { Avatar } from './ui/Avatar';
import { Button } from './ui/Button';
import { useAuth } from '../contexts/auth-context';
import { resolveApiUrl } from '../lib/api';
import { acceptGroupInvitation } from '../services/group-invitation-service';
import { createThemedStyles, fonts, iconSize, radius, space, useTheme } from '../theme';
import type { GroupInvitation } from '../types/group-invitation';

/**
 * Pending invitation as a personal message (prototype variant "mensaje personal"):
 * "Carlos te ha invitado al grupo X." with Aceptar (terracotta) and Ver invitación (olive).
 */
export function HomeInvitationMessage({ invitation, count, onAccepted }: {
  invitation: GroupInvitation;
  count: number;
  onAccepted: () => void;
}) {
  const { accessToken } = useAuth();
  const { colors } = useTheme();
  const styles = useStyles();
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sender = invitation.invitedBy;

  async function accept(): Promise<void> {
    if (!accessToken || accepting) return;
    setAccepting(true);
    setError(null);
    try {
      const accepted = await acceptGroupInvitation(invitation.id, accessToken);
      onAccepted();
      if (accepted.groupPrivacy === 'PUBLIC') {
        router.push(`/groups/public/${accepted.groupId}` as Href);
      } else {
        router.push({ pathname: '/groups/[groupId]', params: { groupId: accepted.groupId } });
      }
    } catch {
      setError('No hemos podido aceptar la invitación. Vuelve a intentarlo.');
    } finally {
      setAccepting(false);
    }
  }

  return (
    <View style={styles.message} accessibilityRole="summary">
      <Avatar name={sender.name} uri={sender.avatarUrl ? resolveApiUrl(sender.avatarUrl) : null} size={32} />
      <View style={styles.body}>
        <AppText variant="secondary">
          <AppText variant="secondary" style={styles.strong}>{sender.name}</AppText>
          {' te ha invitado al grupo '}
          <AppText variant="secondary" style={styles.strong}>{invitation.groupName}</AppText>.
        </AppText>
        <View style={styles.status}>
          <SymbolView accessible={false} name={{ ios: 'envelope', android: 'mail', web: 'mail' }}
            size={iconSize.status} tintColor={colors.secondary} />
          <AppText variant="label" tone="muted">
            Invitación pendiente{count > 1 ? ` · ${count}` : ''}
          </AppText>
        </View>
        {error && <AppText variant="caption" tone="danger" accessibilityLiveRegion="polite">{error}</AppText>}
        <View style={styles.actions}>
          <Button variant="text" tone="accent" title="Aceptar" loading={accepting}
            accessibilityLabel={`Aceptar la invitación a ${invitation.groupName}`} onPress={() => void accept()} />
          <Button variant="text" tone="olive" title={count > 1 ? 'Ver invitaciones' : 'Ver invitación'}
            onPress={() => router.push('/group-invitations')} />
        </View>
      </View>
    </View>
  );
}

const useStyles = createThemedStyles(({ colors }) => ({
  message: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 11,
    paddingHorizontal: 14,
    paddingTop: 13,
    paddingBottom: 9,
    borderWidth: 1,
    borderColor: colors.separator,
    borderRadius: radius.md,
    borderCurve: 'continuous',
    backgroundColor: colors.surface,
  },
  body: { flex: 1, minWidth: 0 },
  strong: { fontFamily: fonts.semiBold },
  status: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 5 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 19, marginTop: space.s2 },
}));
