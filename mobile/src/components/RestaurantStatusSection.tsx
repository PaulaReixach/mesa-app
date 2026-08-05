import { SymbolView } from 'expo-symbols';
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
import {
  updateGroupRestaurantStatus,
} from '../services/restaurant-service';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import type {
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

type ReturnStatus =
  | 'VISITED'
  | 'WANT_TO_REPEAT'
  | 'DO_NOT_REPEAT';

export const restaurantStatusPresentation: Record<
  GroupRestaurantStatus,
  {
    label: string;
    backgroundColor: string;
    textColor: string;
  }
> = {
  WANT_TO_GO: {
    label: 'Pendiente',
    backgroundColor: '#FBE8E0',
    textColor: '#B95135',
  },
  VISITED: {
    label: 'Visitado',
    backgroundColor: '#F1E7D8',
    textColor: '#805D34',
  },
  FAVORITE: {
    label: 'Visitado',
    backgroundColor: '#F1E7D8',
    textColor: '#805D34',
  },
  WANT_TO_REPEAT: {
    label: 'Repetir',
    backgroundColor: '#E8EEDD',
    textColor: '#52673F',
  },
  DO_NOT_REPEAT: {
    label: 'No repetir',
    backgroundColor: '#F0ECE9',
    textColor: '#625D59',
  },
  ARCHIVED: {
    label: 'Archivado',
    backgroundColor: '#F0ECE9',
    textColor: '#625D59',
  },
};

function isVisitedStatus(status: GroupRestaurantStatus): boolean {
  return status === 'VISITED'
    || status === 'WANT_TO_REPEAT'
    || status === 'DO_NOT_REPEAT'
    || status === 'FAVORITE';
}

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

  const isArchived = groupRestaurant.status === 'ARCHIVED';
  const isVisited = isVisitedStatus(groupRestaurant.status);
  const isBusy = updatingStatus !== null;

  async function handleStatusChange(
    status: GroupRestaurantStatus,
  ) {
    if (groupRestaurant.status === status || isBusy) {
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
      setUpdateError(getErrorMessage(error));
    } finally {
      setUpdatingStatus(null);
    }
  }

  function handleSituationChange(visited: boolean) {
    if (visited === isVisited) {
      return;
    }

    void handleStatusChange(visited ? 'VISITED' : 'WANT_TO_GO');
  }

  function confirmArchive() {
    Alert.alert(
      'Archivar restaurante',
      'Seguirá guardado en el grupo y podrás restaurarlo cuando quieras.',
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

  function renderReturnOption(
    status: ReturnStatus,
    label: string,
  ) {
    const selected = status === 'VISITED'
      ? groupRestaurant.status === 'VISITED'
        || groupRestaurant.status === 'FAVORITE'
      : groupRestaurant.status === status;

    return (
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ selected }}
        disabled={isBusy}
        key={status}
        onPress={() => void handleStatusChange(status)}
        style={({ pressed }) => [
          styles.intentOption,
          selected ? styles.intentOptionSelected : null,
          pressed ? styles.pressed : null,
        ]}
      >
        {updatingStatus === status ? (
          <ActivityIndicator
            color={selected ? colors.white : colors.primary}
            size="small"
          />
        ) : (
          <Text
            style={[
              styles.intentOptionText,
              selected ? styles.intentOptionTextSelected : null,
            ]}
          >
            {label}
          </Text>
        )}
      </Pressable>
    );
  }

  return (
    <View style={styles.section}>
      <View style={styles.heading}>
        <Text style={styles.sectionTitle}>
          En el grupo
        </Text>
        <Text style={styles.sectionDescription}>
          Cualquier miembro puede actualizar esta información.
        </Text>
      </View>

      {isArchived ? (
        <View style={styles.archivedBlock}>
          <View style={styles.archivedCopy}>
            <SymbolView
              name={{
                ios: 'archivebox',
                android: 'archive',
                web: 'archive',
              }}
              size={19}
              tintColor={colors.muted}
            />
            <View style={styles.archivedText}>
              <Text style={styles.archivedTitle}>Archivado</Text>
              <Text style={styles.archivedDescription}>
                No aparece entre pendientes ni visitados.
              </Text>
            </View>
          </View>

          <Pressable
            accessibilityRole="button"
            disabled={isBusy}
            onPress={() => void handleStatusChange('WANT_TO_GO')}
            style={({ pressed }) => [
              styles.restoreButton,
              pressed ? styles.pressed : null,
            ]}
          >
            {updatingStatus === 'WANT_TO_GO' ? (
              <ActivityIndicator color={colors.primary} size="small" />
            ) : (
              <Text style={styles.restoreButtonText}>
                Restaurar en pendientes
              </Text>
            )}
          </Pressable>
        </View>
      ) : (
        <>
          <View style={styles.controlBlock}>
            <View style={styles.controlHeading}>
              <Text style={styles.controlTitle}>Situación</Text>
              <Text style={styles.controlDescription}>
                ¿Sigue pendiente o ya habéis ido?
              </Text>
            </View>

            <View style={styles.situationControl}>
              {[
                { label: 'Pendiente', visited: false },
                { label: 'Visitado', visited: true },
              ].map(option => {
                const selected = option.visited === isVisited;
                const targetStatus: GroupRestaurantStatus = option.visited
                  ? 'VISITED'
                  : 'WANT_TO_GO';

                return (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    disabled={isBusy}
                    key={option.label}
                    onPress={() => handleSituationChange(option.visited)}
                    style={({ pressed }) => [
                      styles.situationOption,
                      selected ? styles.situationOptionSelected : null,
                      pressed ? styles.pressed : null,
                    ]}
                  >
                    {updatingStatus === targetStatus ? (
                      <ActivityIndicator
                        color={selected ? colors.white : colors.primary}
                        size="small"
                      />
                    ) : (
                      <Text
                        style={[
                          styles.situationOptionText,
                          selected ? styles.situationOptionTextSelected : null,
                        ]}
                      >
                        {option.label}
                      </Text>
                    )}
                  </Pressable>
                );
              })}
            </View>
          </View>

          {isVisited ? (
            <View style={styles.controlBlock}>
              <View style={styles.controlHeading}>
                <Text style={styles.controlTitle}>¿Volveríais?</Text>
                <Text style={styles.controlDescription}>
                  Dejad la decisión abierta o marcad si repetiríais.
                </Text>
              </View>
              <View style={styles.intentOptions}>
                {renderReturnOption('VISITED', 'Sin decidir')}
                {renderReturnOption('WANT_TO_REPEAT', 'Repetir')}
                {renderReturnOption('DO_NOT_REPEAT', 'No repetir')}
              </View>
            </View>
          ) : null}

          <Pressable
            accessibilityRole="button"
            disabled={isBusy}
            onPress={confirmArchive}
            style={({ pressed }) => [
              styles.archiveAction,
              pressed ? styles.pressed : null,
            ]}
          >
            {updatingStatus === 'ARCHIVED' ? (
              <ActivityIndicator color={colors.muted} size="small" />
            ) : (
              <>
                <SymbolView
                  name={{
                    ios: 'archivebox',
                    android: 'archive',
                    web: 'archive',
                  }}
                  size={16}
                  tintColor={colors.muted}
                />
                <Text style={styles.archiveActionText}>
                  Archivar restaurante
                </Text>
              </>
            )}
          </Pressable>
        </>
      )}

      {updateError ? (
        <View style={styles.updateError}>
          <Text style={styles.updateErrorText}>
            {updateError}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 14,
  },
  heading: {
    gap: 3,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 17,
    fontFamily: fonts.bold,
  },
  sectionDescription: {
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 11,
    lineHeight: 16,
  },
  controlBlock: {
    gap: 9,
  },
  controlHeading: {
    gap: 2,
  },
  controlTitle: {
    color: colors.text,
    fontSize: 13,
    fontFamily: fonts.bold,
  },
  controlDescription: {
    color: colors.muted,
    fontSize: 10,
    lineHeight: 14,
    fontFamily: fonts.regular,
  },
  situationControl: {
    flexDirection: 'row',
    gap: 4,
    padding: 4,
    borderRadius: 15,
    backgroundColor: colors.surfaceMuted,
  },
  situationOption: {
    flex: 1,
    minHeight: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  situationOptionSelected: {
    backgroundColor: colors.primary,
  },
  situationOptionText: {
    color: colors.mutedStrong,
    fontSize: 11,
    fontFamily: fonts.bold,
  },
  situationOptionTextSelected: {
    color: colors.white,
  },
  intentOptions: {
    flexDirection: 'row',
    gap: 6,
  },
  intentOption: {
    flex: 1,
    minHeight: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.surface,
    paddingHorizontal: 6,
  },
  intentOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  intentOptionText: {
    color: colors.mutedStrong,
    fontSize: 10,
    fontFamily: fonts.bold,
    textAlign: 'center',
  },
  intentOptionTextSelected: {
    color: colors.white,
  },
  archiveAction: {
    minHeight: 38,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 2,
  },
  archiveActionText: {
    color: colors.muted,
    fontSize: 11,
    fontFamily: fonts.semiBold,
  },
  archivedBlock: {
    gap: 12,
    paddingVertical: 13,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  archivedCopy: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  archivedText: {
    flex: 1,
    gap: 2,
  },
  archivedTitle: {
    color: colors.text,
    fontSize: 13,
    fontFamily: fonts.bold,
  },
  archivedDescription: {
    color: colors.muted,
    fontSize: 10,
    fontFamily: fonts.regular,
  },
  restoreButton: {
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 13,
    backgroundColor: colors.surface,
  },
  restoreButtonText: {
    color: colors.primary,
    fontSize: 11,
    fontFamily: fonts.bold,
  },
  pressed: {
    opacity: 0.66,
  },
  updateError: {
    borderWidth: 1,
    borderColor: '#F3C5BC',
    borderRadius: 14,
    backgroundColor: '#FFF1EE',
    padding: 12,
  },
  updateErrorText: {
    color: colors.danger,
    fontFamily: fonts.regular,
    fontSize: 11,
    lineHeight: 16,
  },
});
