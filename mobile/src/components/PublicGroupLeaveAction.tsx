import { router, useFocusEffect } from 'expo-router';
import type { Href } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Text } from 'react-native';

import { GroupExitAction } from './GroupExitAction';
import { useAuth } from '../contexts/auth-context';
import { getErrorMessage } from '../lib/api';
import {
  getPublicGroupCollaborationState,
  leavePublicGroupCollaboration,
} from '../services/group-service';
import { colors } from '../theme/colors';

export function PublicGroupLeaveAction({ groupId }: { groupId: string }) {
  const { accessToken } = useAuth();
  const [collaborating, setCollaborating] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (): Promise<void> => {
    if (!accessToken) return;

    try {
      setError(null);
      const state = await getPublicGroupCollaborationState(
        groupId,
        accessToken,
      );
      setCollaborating(state.collaborating);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    }
  }, [accessToken, groupId]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  async function leave(): Promise<void> {
    if (!accessToken || leaving) return;

    try {
      setLeaving(true);
      setError(null);
      await leavePublicGroupCollaboration(groupId, accessToken);
      router.replace(`/groups/public/${groupId}` as Href);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLeaving(false);
    }
  }

  function confirmLeave(): void {
    Alert.alert(
      'Dejar de colaborar',
      'Dejarás de formar parte del grupo y tus valoraciones dejarán de contar en sus medias. Seguirás siguiéndolo si ya lo hacías.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Dejar de colaborar',
          style: 'destructive',
          onPress: () => void leave(),
        },
      ],
    );
  }

  if (!collaborating) return null;

  return (
    <>
      <GroupExitAction
        label="Dejar de colaborar"
        loading={leaving}
        onPress={confirmLeave}
      />
      {error ? (
        <Text style={{ color: colors.danger, fontSize: 8, textAlign: 'center' }}>
          {error}
        </Text>
      ) : null}
    </>
  );
}
