import * as ImagePicker from 'expo-image-picker';
import { SymbolView } from 'expo-symbols';
import { router } from 'expo-router';
import {
  useMemo,
  useState,
} from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  SafeAreaView,
} from 'react-native-safe-area-context';

import {
  useAuth,
} from '../../../contexts/auth-context';
import {
  getErrorMessage,
} from '../../../lib/api';
import {
  addGroupMember,
} from '../../../services/group-member-service';
import {
  createGroup,
  uploadGroupImage,
} from '../../../services/group-service';
import { colors } from '../../../theme/colors';
import {
  GroupPrivacy,
} from '../../../types/group';
import { fonts } from '../../../theme/fonts';

const MAXIMUM_GROUP_IMAGE_SIZE =
  5 * 1024 * 1024;

function normalizeUsername(
  value: string,
): string {
  return value
    .trim()
    .replace(/^@+/, '');
}

export default function CreateGroupScreen() {
  const {
    accessToken,
    user,
  } = useAuth();

  const [
    name,
    setName,
  ] = useState('');

  const [
    description,
    setDescription,
  ] = useState('');

  const [
    city,
    setCity,
  ] = useState('');

  const [
    privacy,
    setPrivacy,
  ] =
    useState<GroupPrivacy>(
      'PRIVATE',
    );

  const [
    selectedImage,
    setSelectedImage,
  ] =
    useState<ImagePicker.ImagePickerAsset | null>(
      null,
    );

  const [
    inviteUsername,
    setInviteUsername,
  ] = useState('');

  const [
    invitedUsernames,
    setInvitedUsernames,
  ] = useState<string[]>([]);

  const [
    isPickingImage,
    setIsPickingImage,
  ] = useState(false);

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false);

  const [
    requestError,
    setRequestError,
  ] = useState<string | null>(null);

  const isPrivate =
    privacy === 'PRIVATE';

  const canCreate = useMemo(() => {
    return (
      name.trim().length > 0
      && Boolean(accessToken)
      && !isSubmitting
    );
  }, [
    accessToken,
    isSubmitting,
    name,
  ]);

  function validateSelectedImage(
    asset: ImagePicker.ImagePickerAsset,
  ): boolean {
    if (
      asset.fileSize
      && asset.fileSize
        > MAXIMUM_GROUP_IMAGE_SIZE
    ) {
      Alert.alert(
        'Imagen demasiado grande',
        'La imagen no puede superar los 5 MB.',
      );

      return false;
    }

    return true;
  }

  function applySelectedImage(
    asset: ImagePicker.ImagePickerAsset,
  ): void {
    if (!validateSelectedImage(asset)) {
      return;
    }

    setSelectedImage(asset);
  }

  async function selectFromGallery():
  Promise<void> {
    try {
      setIsPickingImage(true);

      const permission =
        await ImagePicker
          .requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          'Permiso necesario',
          'Mesa necesita acceder a tus fotos para elegir la imagen del grupo.',
        );

        return;
      }

      const result =
        await ImagePicker
          .launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.75,
          });

      if (
        !result.canceled
        && result.assets.length > 0
      ) {
        applySelectedImage(
          result.assets[0],
        );
      }
    } catch (error) {
      Alert.alert(
        'No se ha podido abrir la galería',
        getErrorMessage(error),
      );
    } finally {
      setIsPickingImage(false);
    }
  }

  async function takePhoto():
  Promise<void> {
    try {
      setIsPickingImage(true);

      const permission =
        await ImagePicker
          .requestCameraPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          'Permiso necesario',
          'Mesa necesita acceder a la cámara para hacer la foto del grupo.',
        );

        return;
      }

      const result =
        await ImagePicker
          .launchCameraAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.75,
          });

      if (
        !result.canceled
        && result.assets.length > 0
      ) {
        applySelectedImage(
          result.assets[0],
        );
      }
    } catch (error) {
      Alert.alert(
        'No se ha podido abrir la cámara',
        getErrorMessage(error),
      );
    } finally {
      setIsPickingImage(false);
    }
  }

  function openImageOptions(): void {
    Alert.alert(
      'Foto del grupo',
      'Elige cómo quieres añadirla.',
      [
        {
          text: 'Elegir de la galería',
          onPress: () => {
            void selectFromGallery();
          },
        },
        {
          text: 'Hacer una foto',
          onPress: () => {
            void takePhoto();
          },
        },
        ...(selectedImage
          ? [
              {
                text: 'Eliminar foto',
                style:
                  'destructive' as const,
                onPress: () => {
                  setSelectedImage(null);
                },
              },
            ]
          : []),
        {
          text: 'Cancelar',
          style: 'cancel',
        },
      ],
    );
  }

  function getInviteValidationError(
    username: string,
    existingUsernames:
      string[],
  ): string | null {
    if (username.length < 3) {
      return 'El nombre de usuario debe tener al menos 3 caracteres.';
    }

    if (
      user?.username
      && username.toLowerCase()
        === user.username.toLowerCase()
    ) {
      return 'Tú ya serás la propietaria del grupo.';
    }

    const alreadyAdded =
      existingUsernames.some(
        existingUsername =>
          existingUsername.toLowerCase()
          === username.toLowerCase(),
      );

    if (alreadyAdded) {
      return `@${username} ya está en la lista.`;
    }

    return null;
  }

  function handleAddInvite(): void {
    const username =
      normalizeUsername(
        inviteUsername,
      );

    if (!username) {
      return;
    }

    const validationError =
      getInviteValidationError(
        username,
        invitedUsernames,
      );

    if (validationError) {
      setRequestError(validationError);
      return;
    }

    setInvitedUsernames(current => [
      ...current,
      username,
    ]);

    setInviteUsername('');
    setRequestError(null);
  }

  function removeInvitedUsername(
    username: string,
  ): void {
    setInvitedUsernames(current =>
      current.filter(
        currentUsername =>
          currentUsername !== username,
      ),
    );
  }

  function getUsernamesToInvite():
  string[] | null {
    const usernames = [
      ...invitedUsernames,
    ];

    const pendingUsername =
      normalizeUsername(
        inviteUsername,
      );

    if (!pendingUsername) {
      return usernames;
    }

    const validationError =
      getInviteValidationError(
        pendingUsername,
        usernames,
      );

    if (validationError) {
      setRequestError(validationError);
      return null;
    }

    usernames.push(pendingUsername);

    return usernames;
  }

  function openCreatedGroup(
    groupId: string,
  ): void {
    router.replace({
      pathname:
        '/groups/[groupId]',
      params: {
        groupId,
      },
    });
  }

  async function handleCreateGroup():
  Promise<void> {
    setRequestError(null);

    const normalizedName =
      name.trim();

    if (!normalizedName) {
      setRequestError(
        'Introduce un nombre para el grupo.',
      );

      return;
    }

    if (!accessToken) {
      setRequestError(
        'Tu sesión no está disponible. Inicia sesión de nuevo.',
      );

      return;
    }

    const usernamesToInvite =
      getUsernamesToInvite();

    if (!usernamesToInvite) {
      return;
    }

    try {
      setIsSubmitting(true);

      const createdGroup =
        await createGroup(
          {
            name: normalizedName,
            description:
              description.trim()
              || null,
            imageUrl: null,
            city:
              city.trim()
              || null,
            privacy,
          },
          accessToken,
        );

      const warnings: string[] = [];

      if (selectedImage) {
        try {
          await uploadGroupImage(
            createdGroup.id,
            {
              uri:
                selectedImage.uri,
            },
            accessToken,
          );
        } catch (error) {
          warnings.push(
            `Foto del grupo: ${getErrorMessage(error)}`,
          );
        }
      }

      for (
        const username
        of usernamesToInvite
      ) {
        try {
          await addGroupMember(
            createdGroup.id,
            {
              username,
            },
            accessToken,
          );
        } catch (error) {
          warnings.push(
            `@${username}: ${getErrorMessage(error)}`,
          );
        }
      }

      if (warnings.length > 0) {
        Alert.alert(
          'Grupo creado con algunos avisos',
          warnings.join('\n\n'),
          [
            {
              text: 'Ver grupo',
              onPress: () => {
                openCreatedGroup(
                  createdGroup.id,
                );
              },
            },
          ],
          {
            cancelable: false,
          },
        );

        return;
      }

      openCreatedGroup(
        createdGroup.id,
      );
    } catch (error) {
      setRequestError(
        getErrorMessage(error),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SafeAreaView
      edges={[
        'top',
        'right',
        'bottom',
        'left',
      ]}
      style={styles.safeArea}
    >
      <KeyboardAvoidingView
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : undefined
        }
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={
            styles.content
          }
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={
            false
          }
        >
          <View style={styles.header}>
            <Pressable
              accessibilityLabel="Volver"
              accessibilityRole="button"
              disabled={isSubmitting}
              onPress={() => {
                router.back();
              }}
              style={({ pressed }) => [
                styles.headerButton,

                pressed
                  ? styles.headerButtonPressed
                  : null,
              ]}
            >
              <SymbolView
                name={{
                  ios: 'chevron.left',
                  android: 'arrow_back',
                  web: 'arrow_back',
                }}
                size={20}
                tintColor={colors.text}
              />
            </Pressable>

            <Text style={styles.headerTitle}>
              Crear grupo
            </Text>

            <View
              style={styles.headerPlaceholder}
            />
          </View>

          <View style={styles.imageSection}>
            <Pressable
              accessibilityLabel="Añadir foto del grupo"
              accessibilityRole="button"
              disabled={
                isPickingImage
                || isSubmitting
              }
              onPress={openImageOptions}
              style={({ pressed }) => [
                styles.imageButton,

                pressed
                  ? styles.imageButtonPressed
                  : null,
              ]}
            >
              {selectedImage ? (
                <Image
                  source={{
                    uri:
                      selectedImage.uri,
                  }}
                  style={styles.groupImage}
                />
              ) : (
                <View
                  style={
                    styles.imagePlaceholder
                  }
                >
                  <SymbolView
                    name={{
                      ios: 'person.3.fill',
                      android: 'groups',
                      web: 'groups',
                    }}
                    size={35}
                    tintColor={
                      colors.primary
                    }
                  />
                </View>
              )}

              <View style={styles.cameraButton}>
                {isPickingImage ? (
                  <ActivityIndicator
                    color={colors.primary}
                    size="small"
                  />
                ) : (
                  <SymbolView
                    name={{
                      ios: 'camera.fill',
                      android: 'photo_camera',
                      web: 'photo_camera',
                    }}
                    size={17}
                    tintColor={
                      colors.primary
                    }
                  />
                )}
              </View>
            </Pressable>

            <Text style={styles.imageHint}>
              Foto del grupo
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.field}>
              <Text style={styles.label}>
                Nombre del grupo
              </Text>

              <View
                style={styles.inputContainer}
              >
                <TextInput
                  autoCapitalize="sentences"
                  maxLength={100}
                  onChangeText={setName}
                  placeholder="Ej. Foodies Barcelona"
                  placeholderTextColor={
                    colors.muted
                  }
                  selectionColor={
                    colors.primary
                  }
                  style={styles.input}
                  value={name}
                />
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>
                Descripción (opcional)
              </Text>

              <View
                style={[
                  styles.inputContainer,
                  styles.descriptionContainer,
                ]}
              >
                <TextInput
                  maxLength={500}
                  multiline
                  onChangeText={
                    setDescription
                  }
                  placeholder="¿Qué tipo de sitios os gustan?"
                  placeholderTextColor={
                    colors.muted
                  }
                  selectionColor={
                    colors.primary
                  }
                  style={[
                    styles.input,
                    styles.descriptionInput,
                  ]}
                  textAlignVertical="top"
                  value={description}
                />
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>
                Ciudad
              </Text>

              <View
                style={styles.inputContainer}
              >
                <SymbolView
                  name={{
                    ios: 'mappin',
                    android: 'location_on',
                    web: 'location_on',
                  }}
                  size={18}
                  tintColor={colors.muted}
                />

                <TextInput
                  autoCapitalize="words"
                  maxLength={100}
                  onChangeText={setCity}
                  placeholder="Barcelona, España"
                  placeholderTextColor={
                    colors.muted
                  }
                  selectionColor={
                    colors.primary
                  }
                  style={[
                    styles.input,
                    styles.inputWithIcon,
                  ]}
                  value={city}
                />
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>
                Privacidad
              </Text>

              <View style={styles.optionRow}>
                <View style={styles.optionText}>
                  <Text
                    style={styles.optionTitle}
                  >
                    {isPrivate
                      ? 'Grupo privado'
                      : 'Grupo público'}
                  </Text>

                  <Text
                    style={
                      styles.optionSubtitle
                    }
                  >
                    {isPrivate
                      ? 'Solo podrán verlo sus miembros.'
                      : 'Será visible públicamente.'}
                  </Text>
                </View>

                <Switch
                  accessibilityLabel="Grupo privado"
                  ios_backgroundColor="#DDD4CE"
                  onValueChange={value => {
                    setPrivacy(
                      value
                        ? 'PRIVATE'
                        : 'PUBLIC',
                    );
                  }}
                  thumbColor={
                    isPrivate
                      ? colors.white
                      : '#F9F6F3'
                  }
                  trackColor={{
                    false: '#DDD4CE',
                    true: colors.primary,
                  }}
                  value={isPrivate}
                />
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>
                Invitar miembros
              </Text>

              <View
                style={styles.inputContainer}
              >
                <SymbolView
                  name={{
                    ios: 'at',
                    android:
                      'alternate_email',
                    web:
                      'alternate_email',
                  }}
                  size={18}
                  tintColor={colors.muted}
                />

                <TextInput
                  autoCapitalize="none"
                  autoCorrect={false}
                  maxLength={50}
                  onChangeText={
                    setInviteUsername
                  }
                  onSubmitEditing={
                    handleAddInvite
                  }
                  placeholder="Añadir personas al grupo"
                  placeholderTextColor={
                    colors.muted
                  }
                  returnKeyType="done"
                  selectionColor={
                    colors.primary
                  }
                  style={[
                    styles.input,
                    styles.inviteInput,
                  ]}
                  value={inviteUsername}
                />

                <Pressable
                  accessibilityLabel="Añadir usuario"
                  accessibilityRole="button"
                  onPress={handleAddInvite}
                  style={({ pressed }) => [
                    styles.addInviteButton,

                    pressed
                      ? styles.addInviteButtonPressed
                      : null,
                  ]}
                >
                  <SymbolView
                    name={{
                      ios: 'plus',
                      android: 'add',
                      web: 'add',
                    }}
                    size={20}
                    tintColor={
                      colors.primary
                    }
                  />
                </Pressable>
              </View>

              {invitedUsernames.length > 0 ? (
                <View style={styles.inviteChips}>
                  {invitedUsernames.map(
                    username => (
                      <View
                        key={username}
                        style={styles.inviteChip}
                      >
                        <Text
                          style={
                            styles.inviteChipText
                          }
                        >
                          @{username}
                        </Text>

                        <Pressable
                          accessibilityLabel={`Eliminar a @${username}`}
                          accessibilityRole="button"
                          hitSlop={8}
                          onPress={() => {
                            removeInvitedUsername(
                              username,
                            );
                          }}
                        >
                          <SymbolView
                            name={{
                              ios: 'xmark',
                              android: 'close',
                              web: 'close',
                            }}
                            size={12}
                            tintColor={
                              colors.primary
                            }
                          />
                        </Pressable>
                      </View>
                    ),
                  )}
                </View>
              ) : null}

              <Text style={styles.fieldHint}>
                También podrás añadir miembros
                después desde el grupo.
              </Text>
            </View>

            {requestError ? (
              <View style={styles.errorBox}>
                <SymbolView
                  name={{
                    ios:
                      'exclamationmark.triangle.fill',
                    android: 'warning',
                    web: 'warning',
                  }}
                  size={18}
                  tintColor={colors.danger}
                />

                <Text style={styles.errorText}>
                  {requestError}
                </Text>
              </View>
            ) : null}

            <Pressable
              accessibilityRole="button"
              disabled={!canCreate}
              onPress={() => {
                void handleCreateGroup();
              }}
              style={({ pressed }) => [
                styles.createButton,

                !canCreate
                  ? styles.createButtonDisabled
                  : null,

                pressed && canCreate
                  ? styles.createButtonPressed
                  : null,
              ]}
            >
              {isSubmitting ? (
                <ActivityIndicator
                  color={colors.white}
                  size="small"
                />
              ) : (
                <Text
                  style={
                    styles.createButtonText
                  }
                >
                  Crear grupo
                </Text>
              )}
            </Pressable>
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
    paddingHorizontal: 22,
    paddingTop: 8,
    paddingBottom: 38,
  },

  header: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },

  headerButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
  },

  headerButtonPressed: {
    backgroundColor: '#F6EFE9',
  },

  headerPlaceholder: {
    width: 36,
    height: 36,
  },

  headerTitle: {
    color: colors.text,
    fontSize: 20,
    fontFamily: fonts.bold,
    letterSpacing: -0.3,
  },

  imageSection: {
    alignItems: 'center',
    marginBottom: 26,
  },

  imageButton: {
    position: 'relative',
    width: 116,
    height: 116,
    borderRadius: 58,
  },

  imageButtonPressed: {
    opacity: 0.78,
  },

  imagePlaceholder: {
    width: 116,
    height: 116,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 58,
    backgroundColor: '#F7E8E2',
  },

  groupImage: {
    width: 116,
    height: 116,
    borderRadius: 58,
    backgroundColor: '#E9DDD6',
  },

  cameraButton: {
    position: 'absolute',
    right: 1,
    bottom: 4,
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.background,
    borderRadius: 17,
    backgroundColor: colors.surface,
  },

  imageHint: {
    marginTop: 9,
    color: colors.muted,
    fontSize: 12,
    fontFamily: fonts.semiBold,
  },

  form: {
    gap: 19,
  },

  field: {
    gap: 8,
  },

  label: {
    color: colors.text,
    fontSize: 13,
    fontFamily: fonts.bold,
  },

  fieldHint: {
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 11,
    lineHeight: 16,
  },

  inputContainer: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 15,
    backgroundColor: colors.surface,
  },

  input: {
    flex: 1,
    paddingVertical: 13,
    color: colors.text,
    fontFamily: fonts.regular,
    fontSize: 14,
  },

  inputWithIcon: {
    paddingLeft: 2,
  },

  descriptionContainer: {
    minHeight: 82,
    alignItems: 'flex-start',
  },

  descriptionInput: {
    minHeight: 80,
    paddingTop: 14,
  },

  optionRow: {
    minHeight: 62,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 15,
    backgroundColor: colors.surface,
  },

  optionText: {
    flex: 1,
  },

  optionTitle: {
    color: colors.text,
    fontSize: 14,
    fontFamily: fonts.bold,
  },

  optionSubtitle: {
    marginTop: 3,
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 11,
    lineHeight: 16,
  },

  inviteInput: {
    paddingLeft: 2,
  },

  addInviteButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
  },

  addInviteButtonPressed: {
    backgroundColor: '#F7E8E2',
  },

  inviteChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  inviteChip: {
    minHeight: 30,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 10,
    borderRadius: 15,
    backgroundColor: '#F7E8E2',
  },

  inviteChipText: {
    color: colors.primary,
    fontSize: 12,
    fontFamily: fonts.bold,
  },

  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    padding: 13,
    borderWidth: 1,
    borderColor: '#F1C8C3',
    borderRadius: 14,
    backgroundColor: '#FFF0EE',
  },

  errorText: {
    flex: 1,
    color: colors.danger,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 17,
  },

  createButton: {
    minHeight: 54,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 3,
    borderRadius: 16,
    backgroundColor: colors.primary,
  },

  createButtonPressed: {
    backgroundColor: colors.primaryPressed,
  },

  createButtonDisabled: {
    opacity: 0.45,
  },

  createButtonText: {
    color: colors.white,
    fontSize: 15,
    fontFamily: fonts.bold,
  },
});