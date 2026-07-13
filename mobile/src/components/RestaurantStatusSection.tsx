import { MaterialIcons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { getErrorMessage } from '../lib/api';
import { updateGroupRestaurantStatus } from '../services/restaurant-service';
import { colors } from '../theme/colors';
import {
  GroupRestaurant,
  GroupRestaurantStatus,
} from '../types/restaurant';

type RestaurantStatusSectionProps = {
  groupId: string;
  groupRestaurant: GroupRestaurant;
  accessToken: string;
  onUpdated: (
    groupRestaurant: GroupRestaurant,
  ) => void;
};

type StatusOption = {
  status: GroupRestaurantStatus;
  label: string;
  description: string;
  icon: keyof typeof MaterialIcons.glyphMap;
};

export const restaurantStatusPresentation: Record<
  GroupRestaurantStatus,
  {
    label: string;
    backgroundColor: string;
    textColor: string;
  }
> = {
  WANT_TO_GO: {
    label: 'Queremos ir',
    backgroundColor: '#FFF0E8',
    textColor: colors.primary,
  },
  VISITED: {
    label: 'Visitado',
    backgroundColor: '#E8EEDD',
    textColor: '#607349',
  },
  FAVORITE: {
    label: 'Favorito',
    backgroundColor: '#FFF0E8',
    textColor: colors.primary,
  },
  WANT_TO_REPEAT: {
    label: 'Repetir',
    backgroundColor: '#E8EEDD',
    textColor: '#607349',
  },
  DO_NOT_REPEAT: {
    label: 'No repetir',
    backgroundColor: '#F2ECE7',
    textColor: colors.muted,
  },
  ARCHIVED: {
    label: 'Archivado',
    backgroundColor: '#ECE8E6',
    textColor: colors.muted,
  },
};

const statusOptions: StatusOption[] = [
  {
    status: 'WANT_TO_GO',
    label: 'Queremos ir',
    description: 'Pendiente de probar.',
    icon: 'schedule',
  },
  {
    status: 'VISITED',
    label: 'Visitado',
    description: 'Ya habéis ido.',
    icon: 'check-circle-outline',
  },
  {
    status: 'WANT_TO_REPEAT',
    label: 'Repetir',
    description: 'Os gustó y volveríais.',
    icon: 'replay',
  },
  {
    status: 'DO_NOT_REPEAT',
    label: 'No repetir',
    description: 'No queréis volver.',
    icon: 'block',
  },
];

function friendlyErrorMessage(error: unknown): string {
  const message = getErrorMessage(error);

  if (
    message.toLocaleLowerCase('es').includes('fetch failed')
    || message.toLocaleLowerCase('es').includes('java.net')
    || message.toLocaleLowerCase('es').includes('failed to fetch')
  ) {
    return 'No se ha podido conectar con Mesa. Revisa que el backend esté iniciado y vuelve a intentarlo.';
  }

  return message;
}

export function RestaurantStatusSection({
  groupId,
  groupRestaurant,
  accessToken,
  onUpdated,
}: RestaurantStatusSectionProps) {
  const [updatingStatus, setUpdatingStatus] =
    useState<GroupRestaurantStatus | null>(null);

  const [updateError, setUpdateError] =
    useState<string | null>(null);

  async function handleStatusChange(
    status: GroupRestaurantStatus,
  ) {
    if (groupRestaurant.status === status) {
      return;
    }

    try {
      setUpdateError(null);
      setUpdatingStatus(status);

      const updatedRestaurant =
        await updateGroupRestaurantStatus(
          groupId,
          groupRestaurant.id,
          { status },
          accessToken,
        );

      onUpdated(updatedRestaurant);
    } catch (error) {
      setUpdateError(friendlyErrorMessage(error));
    } finally {
      setUpdatingStatus(null);
    }
  }

  function confirmArchive() {
    Alert.alert(
      'Archivar restaurante',
      'El restaurante seguirá guardado, pero quedará oculto de las vistas principales.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Archivar',
          style: 'destructive',
          onPress: () => {
            void handleStatusChange('ARCHIVED');
          },
        },
      ],
    );
  }

  return (
    <View style={styles.section}>
      <View style={styles.heading}>
        <Text style={styles.sectionTitle}>Estado</Text>
        <Text style={styles.sectionDescription}>
          El estado es del grupo. Favorito va separado y puede combinarse con cualquiera.
        </Text>
      </View>

      <View style={styles.statusGrid}>
        {statusOptions.map((option) => {
          const isSelected = groupRestaurant.status === option.status;
          const isUpdating = updatingStatus === option.status;

          return (
            <Pressable
              accessibilityRole="button"
              disabled={updatingStatus !== null}
              key={option.status}
              onPress={() => {
                void handleStatusChange(option.status);
              }}
              style={({ pressed }) => [
                styles.statusOption,
                isSelected ? styles.selectedStatusOption : null,
                pressed && !isSelected ? styles.statusOptionPressed : null,
              ]}
            >
              <View
                style={[
                  styles.statusIcon,
                  isSelected ? styles.selectedStatusIcon : null,
                ]}
              >
                {isUpdating ? (
                  <ActivityIndicator color={colors.primary} size="small" />
                ) : (
                  <MaterialIcons
                    color={isSelected ? colors.white : colors.primary}
                    name={option.icon}
                    size={18}
                  />
                )}
              </View>

              <Text
                numberOfLines={1}
                style={[
                  styles.statusOptionTitle,
                  isSelected ? styles.selectedStatusOptionTitle : null,
                ]}
              >
                {option.label}
              </Text>

              <Text numberOfLines={2} style={styles.statusOptionDescription}>
                {option.description}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {updateError ? (
        <View style={styles.updateError}>
          <Text style={styles.updateErrorText}>
            {updateError}
          </Text>
        </View>
      ) : null}

      {groupRestaurant.status === 'ARCHIVED' ? (
        <Pressable
          accessibilityRole="button"
          disabled={updatingStatus !== null}
          onPress={() => {
            void handleStatusChange('WANT_TO_GO');
          }}
          style={({ pressed }) => [
            styles.restoreButton,
            pressed ? styles.secondaryButtonPressed : null,
          ]}
        >
          {updatingStatus === 'WANT_TO_GO' ? (
            <ActivityIndicator color={colors.primary} size="small" />
          ) : (
            <Text style={styles.restoreButtonText}>
              Restaurar restaurante
            </Text>
          )}
        </Pressable>
      ) : (
        <Pressable
          accessibilityRole="button"
          disabled={updatingStatus !== null}
          onPress={confirmArchive}
          style={({ pressed }) => [
            styles.archiveButton,
            pressed ? styles.secondaryButtonPressed : null,
          ]}
        >
          {updatingStatus === 'ARCHIVED' ? (
            <ActivityIndicator color={colors.danger} size="small" />
          ) : (
            <Text style={styles.archiveButtonText}>
              Archivar restaurante
            </Text>
          )}
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 13,
  },
  heading: {
    gap: 4,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '900',
  },
  sectionDescription: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 18,
  },
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 9,
  },
  statusOption: {
    width: '48.6%',
    minHeight: 102,
    gap: 6,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    backgroundColor: colors.surface,
  },
  selectedStatusOption: {
    borderColor: colors.primary,
    backgroundColor: '#FFF3EE',
  },
  statusOptionPressed: {
    opacity: 0.72,
  },
  statusIcon: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: '#FFF0E8',
  },
  selectedStatusIcon: {
    backgroundColor: colors.primary,
  },
  statusOptionTitle: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '900',
  },
  selectedStatusOptionTitle: {
    color: colors.primary,
  },
  statusOptionDescription: {
    color: colors.muted,
    fontSize: 10,
    lineHeight: 14,
  },
  updateError: {
    padding: 13,
    borderWidth: 1,
    borderColor: '#F3C5BC',
    borderRadius: 16,
    backgroundColor: '#FFF1EE',
  },
  updateErrorText: {
    color: colors.danger,
    fontSize: 12,
    lineHeight: 18,
  },
  archiveButton: {
    minHeight: 46,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E2B6AE',
    borderRadius: 15,
    backgroundColor: '#FFF1EE',
  },
  archiveButtonText: {
    color: colors.danger,
    fontSize: 13,
    fontWeight: '900',
  },
  restoreButton: {
    minHeight: 46,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 15,
    backgroundColor: colors.surface,
  },
  restoreButtonText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '900',
  },
  secondaryButtonPressed: {
    opacity: 0.7,
  },
});
