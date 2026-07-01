import {
  router,
  useLocalSearchParams,
} from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FormField } from '../../../../../components/FormField';
import { PrimaryButton } from '../../../../../components/PrimaryButton';
import { useAuth } from '../../../../../contexts/auth-context';
import { getErrorMessage } from '../../../../../lib/api';
import { addGroupMember } from '../../../../../services/group-member-service';
import { colors } from '../../../../../theme/colors';

export default function AddGroupMemberScreen() {
  const { groupId } = useLocalSearchParams<{
    groupId: string;
  }>();

  const { accessToken } = useAuth();

  const [username, setUsername] = useState('');
  const [requestError, setRequestError] =
    useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] =
    useState(false);

  async function handleAddMember() {
    setRequestError(null);

    const normalizedUsername = username
      .trim()
      .replace(/^@/, '');

    if (!normalizedUsername) {
      setRequestError(
        'Introduce el nombre de usuario.',
      );
      return;
    }

    if (!accessToken || !groupId) {
      setRequestError(
        'No se ha podido recuperar tu sesión o el grupo.',
      );
      return;
    }

    try {
      setIsSubmitting(true);

      await addGroupMember(
        groupId,
        {
          username: normalizedUsername,
        },
        accessToken,
      );

      router.replace({
        pathname: '/groups/[groupId]',
        params: {
          groupId,
        },
      });
    } catch (error) {
      setRequestError(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SafeAreaView
      edges={['top', 'right', 'bottom', 'left']}
      style={styles.safeArea}
    >
      <KeyboardAvoidingView
        behavior={
          Platform.OS === 'ios' ? 'padding' : undefined
        }
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <Text style={styles.backText}>‹</Text>
            </Pressable>

            <Text style={styles.headerTitle}>
              Añadir miembro
            </Text>

            <View style={styles.headerSpacer} />
          </View>

          <View style={styles.heading}>
            <Text style={styles.title}>
              Invita a alguien al grupo
            </Text>

            <Text style={styles.subtitle}>
              Introduce su nombre de usuario de Mesa.
              Podrá ver el grupo y todos sus restaurantes.
            </Text>
          </View>

          <View style={styles.form}>
            <FormField
              autoCapitalize="none"
              autoCorrect={false}
              label="Nombre de usuario"
              maxLength={50}
              onChangeText={setUsername}
              placeholder="angel"
              value={username}
            />

            {requestError ? (
              <Text style={styles.error}>
                {requestError}
              </Text>
            ) : null}

            <PrimaryButton
              loading={isSubmitting}
              onPress={handleAddMember}
              title="Añadir al grupo"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: colors.surface,
  },
  backText: {
    color: colors.text,
    fontSize: 34,
    lineHeight: 36,
  },
  headerTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '800',
  },
  headerSpacer: {
    width: 44,
  },
  heading: {
    gap: 8,
    marginTop: 36,
    marginBottom: 28,
  },
  title: {
    color: colors.text,
    fontSize: 29,
    fontWeight: '800',
    lineHeight: 35,
  },
  subtitle: {
    color: colors.muted,
    fontSize: 16,
    lineHeight: 23,
  },
  form: {
    gap: 20,
  },
  error: {
    color: colors.danger,
    fontSize: 14,
    lineHeight: 20,
  },
});