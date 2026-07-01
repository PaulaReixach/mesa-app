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
    backgroundColor: '#F7E8D2',
    textColor: '#8A5B17',
  },
  VISITED: {
    label: 'Visitado',
    backgroundColor: '#E5EDF7',
    textColor: '#365F91',
  },
  FAVORITE: {
    label: 'Favorito',
    backgroundColor: '#FBE4E7',
    textColor: '#A33B4A',
  },
  WANT_TO_REPEAT: {
    label: 'Queremos repetir',
    backgroundColor: '#E8F1EB',
    textColor: colors.success,
  },
  DO_NOT_REPEAT: {
    label: 'No repetir',
    backgroundColor: '#FBE9E5',
    textColor: colors.danger,
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
    description: 'El grupo todavía tiene pendiente probarlo.',
  },
  {
    status: 'VISITED',
    label: 'Visitado',
    description: 'Ya habéis ido al restaurante.',
  },
  {
    status: 'FAVORITE',
    label: 'Favorito',
    description: 'Uno de los favoritos del grupo.',
  },
  {
    status: 'WANT_TO_REPEAT',
    label: 'Queremos repetir',
    description: 'Os gustó y queréis volver.',
  },
  {
    status: 'DO_NOT_REPEAT',
    label: 'No repetir',
    description: 'No queréis volver a este restaurante.',
  },
];

export function RestaurantStatusSection({
  groupId,
  groupRestaurant,
  accessToken,
  onUpdated,
}: RestaurantStatusSectionProps) {
  const [
    updatingStatus,
    setUpdatingStatus,
  ] = useState<GroupRestaurantStatus | null>(null);

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
          {
            status,
          },
          accessToken,
        );

      onUpdated(updatedRestaurant);
    } catch (error) {
      setUpdateError(getErrorMessage(error));
    } finally {
      setUpdatingStatus(null);
    }
  }

  function confirmArchive() {
    Alert.alert(
      'Archivar restaurante',
      'El restaurante seguirá guardado, pero quedará marcado como archivado.',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
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
        <Text style={styles.sectionTitle}>
          Estado
        </Text>

        <Text style={styles.sectionDescription}>
          Cualquier miembro del grupo puede cambiarlo.
        </Text>
      </View>

      <View style={styles.statusList}>
        {statusOptions.map((option) => {
          const isSelected =
            groupRestaurant.status === option.status;

          const isUpdating =
            updatingStatus === option.status;

          return (
            <Pressable
              accessibilityRole="button"
              disabled={updatingStatus !== null}
              key={option.status}
              onPress={() => {
                void handleStatusChange(
                  option.status,
                );
              }}
              style={({ pressed }) => [
                styles.statusOption,
                isSelected
                  ? styles.selectedStatusOption
                  : null,
                pressed && !isSelected
                  ? styles.statusOptionPressed
                  : null,
              ]}
            >
              <View style={styles.statusOptionText}>
                <Text
                  style={[
                    styles.statusOptionTitle,
                    isSelected
                      ? styles.selectedStatusOptionTitle
                      : null,
                  ]}
                >
                  {option.label}
                </Text>

                <Text
                  style={styles.statusOptionDescription}
                >
                  {option.description}
                </Text>
              </View>

              {isUpdating ? (
                <ActivityIndicator
                  color={colors.primary}
                  size="small"
                />
              ) : null}

              {!isUpdating && isSelected ? (
                <Text style={styles.checkmark}>
                  ✓
                </Text>
              ) : null}
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
            pressed
              ? styles.secondaryButtonPressed
              : null,
          ]}
        >
          {updatingStatus === 'WANT_TO_GO' ? (
            <ActivityIndicator
              color={colors.primary}
              size="small"
            />
          ) : (
            <Text style={styles.restoreButtonText}>
              Restaurar como “Queremos ir”
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
            pressed
              ? styles.secondaryButtonPressed
              : null,
          ]}
        >
          {updatingStatus === 'ARCHIVED' ? (
            <ActivityIndicator
              color={colors.danger}
              size="small"
            />
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
    gap: 14,
  },
  heading: {
    gap: 5,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 21,
    fontWeight: '800',
  },
  sectionDescription: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 19,
  },
  statusList: {
    gap: 10,
  },
  statusOption: {
    minHeight: 76,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    backgroundColor: colors.surface,
    padding: 15,
  },
  selectedStatusOption: {
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: '#FFF3EE',
    padding: 14,
  },
  statusOptionPressed: {
    opacity: 0.72,
  },
  statusOptionText: {
    flex: 1,
    gap: 4,
  },
  statusOptionTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  selectedStatusOptionTitle: {
    color: colors.primary,
  },
  statusOptionDescription: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 17,
  },
  checkmark: {
    color: colors.primary,
    fontSize: 20,
    fontWeight: '800',
  },
  updateError: {
    borderWidth: 1,
    borderColor: '#F3C5BC',
    borderRadius: 16,
    backgroundColor: '#FFF1EE',
    padding: 14,
  },
  updateErrorText: {
    color: colors.danger,
    fontSize: 14,
    lineHeight: 20,
  },
  archiveButton: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2B6AE',
    borderRadius: 15,
    backgroundColor: '#FFF1EE',
    paddingHorizontal: 16,
  },
  archiveButtonText: {
    color: colors.danger,
    fontSize: 14,
    fontWeight: '800',
  },
  restoreButton: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 15,
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
  },
  restoreButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '800',
  },
  secondaryButtonPressed: {
    opacity: 0.7,
  },
});