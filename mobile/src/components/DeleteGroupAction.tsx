import { SymbolView } from 'expo-symbols';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
} from 'react-native';

import { useAuth } from '../contexts/auth-context';
import { getErrorMessage } from '../lib/api';
import { deleteGroup } from '../services/group-service';
import { colors } from '../theme/colors';

type Props = {
  groupId: string;
  groupName: string;
};

export function DeleteGroupAction({ groupId, groupName }: Props) {
  const { accessToken } = useAuth();
  const [deleting, setDeleting] = useState(false);

  async function removeGroup(): Promise<void> {
    if (!accessToken || deleting) return;

    try {
      setDeleting(true);
      await deleteGroup(groupId, accessToken);
      router.replace('/groups');
    } catch (error) {
      Alert.alert(
        'No se ha podido borrar el grupo',
        getErrorMessage(error),
      );
    } finally {
      setDeleting(false);
    }
  }

  function confirmDelete(): void {
    Alert.alert(
      'Borrar grupo',
      `Se borrará “${groupName}” y todo su contenido. Esta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Borrar grupo',
          style: 'destructive',
          onPress: () => void removeGroup(),
        },
      ],
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      disabled={deleting}
      onPress={confirmDelete}
      style={({ pressed }) => [
        styles.button,
        pressed ? styles.pressed : null,
        deleting ? styles.disabled : null,
      ]}
    >
      {deleting ? (
        <ActivityIndicator color={colors.danger} size="small" />
      ) : (
        <>
          <SymbolView
            name={{
              ios: 'trash.fill',
              android: 'delete',
              web: 'delete',
            }}
            size={18}
            tintColor={colors.danger}
          />
          <Text style={styles.text}>Borrar grupo</Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#E7B8B0',
    borderRadius: 18,
    backgroundColor: '#FFF7F5',
  },
  text: {
    color: colors.danger,
    fontSize: 14,
    fontWeight: '900',
  },
  pressed: {
    backgroundColor: '#FDEAE6',
  },
  disabled: {
    opacity: 0.5,
  },
});
