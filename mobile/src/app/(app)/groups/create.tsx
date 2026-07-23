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
import { radii, shadows } from '../../../theme/layout';

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

  const [step, setStep] = useState(0);

  const isPrivate =
    privacy === 'PRIVATE';

  const stepTitles = ['La idea', 'Visibilidad', 'Tu gente'] as const;

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

  const canContinue = step > 0 || name.trim().length > 0;

  return (
    <SafeAreaView edges={['top', 'right', 'bottom', 'left']} style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Pressable
              accessibilityLabel="Volver"
              accessibilityRole="button"
              disabled={isSubmitting}
              onPress={() => step > 0 ? setStep(current => current - 1) : router.back()}
              style={({ pressed }) => [styles.headerButton, pressed ? styles.headerButtonPressed : null]}
            >
              <SymbolView
                name={{ ios: 'chevron.left', android: 'arrow_back', web: 'arrow_back' }}
                size={20}
                tintColor={colors.text}
              />
            </Pressable>
            <Text style={styles.headerTitle}>Crear grupo</Text>
            <Pressable
              accessibilityLabel="Cerrar"
              accessibilityRole="button"
              onPress={() => router.back()}
              style={styles.headerButton}
            >
              <SymbolView
                name={{ ios: 'xmark', android: 'close', web: 'close' }}
                size={18}
                tintColor={colors.muted}
              />
            </Pressable>
          </View>

          <View style={styles.progressHeader}>
            <View style={styles.progressCopy}>
              <Text style={styles.stepLabel}>PASO {step + 1} DE 3</Text>
              <Text style={styles.stepTitle}>{stepTitles[step]}</Text>
            </View>
            <View style={styles.progressTrack}>
              {[0, 1, 2].map(index => (
                <View
                  key={index}
                  style={[styles.progressSegment, index <= step ? styles.progressSegmentActive : null]}
                />
              ))}
            </View>
          </View>

          {step === 0 ? (
            <View style={styles.form}>
              <View style={styles.imageSection}>
                <Pressable
                  accessibilityLabel="Añadir foto del grupo"
                  accessibilityRole="button"
                  disabled={isPickingImage || isSubmitting}
                  onPress={openImageOptions}
                  style={({ pressed }) => [styles.imageButton, pressed ? styles.imageButtonPressed : null]}
                >
                  {selectedImage ? (
                    <Image source={{ uri: selectedImage.uri }} style={styles.groupImage} />
                  ) : (
                    <View style={styles.imagePlaceholder}>
                      <SymbolView
                        name={{ ios: 'photo.on.rectangle.angled', android: 'add_photo_alternate', web: 'add_photo_alternate' }}
                        size={32}
                        tintColor={colors.primary}
                      />
                    </View>
                  )}
                  <View style={styles.cameraButton}>
                    {isPickingImage ? (
                      <ActivityIndicator color={colors.primary} size="small" />
                    ) : (
                      <SymbolView
                        name={{ ios: 'camera.fill', android: 'photo_camera', web: 'photo_camera' }}
                        size={17}
                        tintColor={colors.primary}
                      />
                    )}
                  </View>
                </Pressable>
                <View style={styles.imageCopy}>
                  <Text style={styles.imageTitle}>Ponle una imagen reconocible</Text>
                  <Text style={styles.imageHint}>Opcional · cuadrada · máximo 5 MB</Text>
                </View>
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Nombre del grupo</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    autoCapitalize="sentences"
                    maxLength={100}
                    onChangeText={setName}
                    placeholder="Ej. Brunch por Barcelona"
                    placeholderTextColor={colors.muted}
                    selectionColor={colors.primary}
                    style={styles.input}
                    value={name}
                  />
                </View>
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Descripción <Text style={styles.optional}>opcional</Text></Text>
                <View style={[styles.inputContainer, styles.descriptionContainer]}>
                  <TextInput
                    maxLength={500}
                    multiline
                    onChangeText={setDescription}
                    placeholder="Explica qué tipo de sitios vais a guardar"
                    placeholderTextColor={colors.muted}
                    selectionColor={colors.primary}
                    style={[styles.input, styles.descriptionInput]}
                    textAlignVertical="top"
                    value={description}
                  />
                </View>
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Ciudad <Text style={styles.optional}>opcional</Text></Text>
                <View style={styles.inputContainer}>
                  <SymbolView
                    name={{ ios: 'mappin', android: 'location_on', web: 'location_on' }}
                    size={18}
                    tintColor={colors.muted}
                  />
                  <TextInput
                    autoCapitalize="words"
                    maxLength={100}
                    onChangeText={setCity}
                    placeholder="Barcelona, Girona, Tokio..."
                    placeholderTextColor={colors.muted}
                    selectionColor={colors.primary}
                    style={[styles.input, styles.inputWithIcon]}
                    value={city}
                  />
                </View>
              </View>
            </View>
          ) : null}

          {step === 1 ? (
            <View style={styles.form}>
              <View style={styles.choiceIntro}>
                <Text style={styles.choiceTitle}>¿Quién podrá ver este grupo?</Text>
                <Text style={styles.choiceText}>Podrás cambiarlo más adelante desde los ajustes del grupo.</Text>
              </View>

              <Pressable
                accessibilityRole="radio"
                accessibilityState={{ selected: isPrivate }}
                onPress={() => setPrivacy('PRIVATE')}
                style={[styles.privacyCard, isPrivate ? styles.privacyCardActive : null]}
              >
                <View style={[styles.privacyIcon, isPrivate ? styles.privacyIconActive : null]}>
                  <SymbolView
                    name={{ ios: 'lock.fill', android: 'lock', web: 'lock' }}
                    size={23}
                    tintColor={isPrivate ? colors.primary : colors.muted}
                  />
                </View>
                <View style={styles.optionText}>
                  <Text style={styles.optionTitle}>Privado</Text>
                  <Text style={styles.optionSubtitle}>Solo las personas invitadas pueden verlo y participar.</Text>
                </View>
                <View style={[styles.radio, isPrivate ? styles.radioActive : null]}>
                  {isPrivate ? <View style={styles.radioDot} /> : null}
                </View>
              </Pressable>

              <Pressable
                accessibilityRole="radio"
                accessibilityState={{ selected: !isPrivate }}
                onPress={() => setPrivacy('PUBLIC')}
                style={[styles.privacyCard, !isPrivate ? styles.privacyCardActiveOlive : null]}
              >
                <View style={[styles.privacyIcon, !isPrivate ? styles.privacyIconActiveOlive : null]}>
                  <SymbolView
                    name={{ ios: 'globe.europe.africa.fill', android: 'public', web: 'public' }}
                    size={23}
                    tintColor={!isPrivate ? colors.olive : colors.muted}
                  />
                </View>
                <View style={styles.optionText}>
                  <Text style={styles.optionTitle}>Público</Text>
                  <Text style={styles.optionSubtitle}>Cualquiera puede descubrirlo, seguirlo y guardar ideas.</Text>
                </View>
                <View style={[styles.radio, !isPrivate ? styles.radioActiveOlive : null]}>
                  {!isPrivate ? <View style={[styles.radioDot, styles.radioDotOlive]} /> : null}
                </View>
              </Pressable>

              <View style={styles.choiceSummary}>
                <SymbolView
                  name={{ ios: 'info.circle.fill', android: 'info', web: 'info' }}
                  size={18}
                  tintColor={isPrivate ? colors.primary : colors.olive}
                />
                <Text style={styles.choiceSummaryText}>
                  {isPrivate
                    ? 'Ideal para planes entre amigos, pareja o familia.'
                    : 'Ideal para compartir recomendaciones y crear comunidad.'}
                </Text>
              </View>
            </View>
          ) : null}

          {step === 2 ? (
            <View style={styles.form}>
              <View style={styles.choiceIntro}>
                <Text style={styles.choiceTitle}>¿A quién quieres sentar a la mesa?</Text>
                <Text style={styles.choiceText}>Es opcional. También podrás invitar personas cuando el grupo ya esté creado.</Text>
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Añadir por nombre de usuario</Text>
                <View style={styles.inputContainer}>
                  <SymbolView
                    name={{ ios: 'at', android: 'alternate_email', web: 'alternate_email' }}
                    size={18}
                    tintColor={colors.muted}
                  />
                  <TextInput
                    autoCapitalize="none"
                    autoCorrect={false}
                    maxLength={50}
                    onChangeText={setInviteUsername}
                    onSubmitEditing={handleAddInvite}
                    placeholder="usuario"
                    placeholderTextColor={colors.muted}
                    returnKeyType="done"
                    selectionColor={colors.primary}
                    style={[styles.input, styles.inviteInput]}
                    value={inviteUsername}
                  />
                  <Pressable
                    accessibilityLabel="Añadir usuario"
                    accessibilityRole="button"
                    onPress={handleAddInvite}
                    style={({ pressed }) => [styles.addInviteButton, pressed ? styles.addInviteButtonPressed : null]}
                  >
                    <SymbolView
                      name={{ ios: 'plus', android: 'add', web: 'add' }}
                      size={20}
                      tintColor={colors.white}
                    />
                  </Pressable>
                </View>

                {invitedUsernames.length > 0 ? (
                  <View style={styles.inviteChips}>
                    {invitedUsernames.map(username => (
                      <View key={username} style={styles.inviteChip}>
                        <Text style={styles.inviteChipText}>@{username}</Text>
                        <Pressable
                          accessibilityLabel={`Eliminar a @${username}`}
                          accessibilityRole="button"
                          hitSlop={8}
                          onPress={() => removeInvitedUsername(username)}
                        >
                          <SymbolView
                            name={{ ios: 'xmark', android: 'close', web: 'close' }}
                            size={12}
                            tintColor={colors.primary}
                          />
                        </Pressable>
                      </View>
                    ))}
                  </View>
                ) : (
                  <View style={styles.inviteEmpty}>
                    <View style={styles.inviteAvatarStack}>
                      <View style={styles.inviteAvatar}><Text style={styles.inviteAvatarText}>P</Text></View>
                      <View style={[styles.inviteAvatar, styles.inviteAvatarOverlap]}>
                        <SymbolView
                          name={{ ios: 'plus', android: 'add', web: 'add' }}
                          size={15}
                          tintColor={colors.muted}
                        />
                      </View>
                    </View>
                    <Text style={styles.fieldHint}>Tú serás la persona creadora del grupo.</Text>
                  </View>
                )}
              </View>

              {requestError ? (
                <View style={styles.errorBox}>
                  <SymbolView
                    name={{ ios: 'exclamationmark.triangle.fill', android: 'warning', web: 'warning' }}
                    size={18}
                    tintColor={colors.danger}
                  />
                  <Text style={styles.errorText}>{requestError}</Text>
                </View>
              ) : null}
            </View>
          ) : null}

          <View style={styles.footerActions}>
            {step > 0 ? (
              <Pressable
                accessibilityRole="button"
                onPress={() => setStep(current => current - 1)}
                style={styles.backButton}
              >
                <Text style={styles.backButtonText}>Atrás</Text>
              </Pressable>
            ) : null}

            <Pressable
              accessibilityRole="button"
              disabled={step === 2 ? !canCreate : !canContinue}
              onPress={() => step === 2
                ? void handleCreateGroup()
                : setStep(current => Math.min(current + 1, 2))}
              style={({ pressed }) => [
                styles.createButton,
                step === 2 && !canCreate || step < 2 && !canContinue
                  ? styles.createButtonDisabled
                  : null,
                pressed ? styles.createButtonPressed : null,
              ]}
            >
              {isSubmitting ? (
                <ActivityIndicator color={colors.white} size="small" />
              ) : (
                <>
                  <Text style={styles.createButtonText}>
                    {step === 2 ? 'Crear grupo' : 'Continuar'}
                  </Text>
                  <SymbolView
                    name={{
                      ios: step === 2 ? 'checkmark' : 'arrow.right',
                      android: step === 2 ? 'check' : 'arrow_forward',
                      web: step === 2 ? 'check' : 'arrow_forward',
                    }}
                    size={18}
                    tintColor={colors.white}
                  />
                </>
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
    gap: 24,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 30,
  },

  header: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  headerButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: colors.surface,
  },

  headerButtonPressed: {
    backgroundColor: '#F6EFE9',
  },

  headerTitle: {
    color: colors.text,
    fontSize: 17,
    fontFamily: fonts.bold,
    letterSpacing: -0.3,
  },

  progressHeader: {
    gap: 12,
  },

  progressCopy: {
    gap: 3,
  },

  stepLabel: {
    color: colors.primary,
    fontSize: 9,
    fontFamily: fonts.semiBold,
    letterSpacing: 0.8,
  },

  stepTitle: {
    color: colors.text,
    fontSize: 28,
    lineHeight: 34,
    fontFamily: fonts.bold,
    letterSpacing: -0.7,
  },

  progressTrack: {
    flexDirection: 'row',
    gap: 6,
  },

  progressSegment: {
    height: 4,
    flex: 1,
    borderRadius: 2,
    backgroundColor: colors.border,
  },

  progressSegmentActive: {
    backgroundColor: colors.primary,
  },

  imageSection: {
    minHeight: 104,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
    ...shadows.card,
  },

  imageButton: {
    position: 'relative',
    width: 80,
    height: 80,
    borderRadius: 20,
  },

  imageButtonPressed: {
    opacity: 0.78,
  },

  imagePlaceholder: {
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    backgroundColor: colors.primarySoft,
  },

  groupImage: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: '#E9DDD6',
  },

  cameraButton: {
    position: 'absolute',
    right: -5,
    bottom: -5,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.surface,
    borderRadius: 16,
    backgroundColor: colors.surface,
  },

  imageCopy: {
    flex: 1,
    gap: 4,
  },

  imageTitle: {
    color: colors.text,
    fontSize: 12,
    fontFamily: fonts.semiBold,
  },

  imageHint: {
    color: colors.muted,
    fontSize: 9,
    lineHeight: 14,
    fontFamily: fonts.regular,
  },

  form: {
    gap: 18,
  },

  field: {
    gap: 8,
  },

  label: {
    color: colors.text,
    fontSize: 13,
    fontFamily: fonts.bold,
  },

  optional: {
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 10,
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
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    ...shadows.card,
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

  choiceIntro: {
    gap: 5,
    marginBottom: 2,
  },

  choiceTitle: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 18,
    letterSpacing: -0.25,
  },

  choiceText: {
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 11,
    lineHeight: 17,
  },

  privacyCard: {
    minHeight: 104,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
  },

  privacyCardActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },

  privacyCardActiveOlive: {
    borderColor: colors.olive,
    backgroundColor: colors.oliveSoft,
  },

  privacyIcon: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: colors.surfaceMuted,
  },

  privacyIconActive: {
    backgroundColor: 'rgba(255,255,255,0.72)',
  },

  privacyIconActiveOlive: {
    backgroundColor: 'rgba(255,255,255,0.68)',
  },

  radio: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    borderRadius: 11,
  },

  radioActive: {
    borderColor: colors.primary,
  },

  radioActiveOlive: {
    borderColor: colors.olive,
  },

  radioDot: {
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },

  radioDotOlive: {
    backgroundColor: colors.olive,
  },

  choiceSummary: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    paddingHorizontal: 13,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceMuted,
  },

  choiceSummaryText: {
    flex: 1,
    color: colors.mutedStrong,
    fontFamily: fonts.regular,
    fontSize: 10,
    lineHeight: 15,
  },

  inviteInput: {
    paddingLeft: 2,
  },

  addInviteButton: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 17,
    backgroundColor: colors.primary,
  },

  addInviteButtonPressed: {
    backgroundColor: colors.primaryPressed,
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

  inviteEmpty: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceMuted,
  },

  inviteAvatarStack: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  inviteAvatar: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.surface,
    borderRadius: 18,
    backgroundColor: colors.primarySoft,
  },

  inviteAvatarOverlap: {
    marginLeft: -8,
    backgroundColor: colors.surface,
  },

  inviteAvatarText: {
    color: colors.primary,
    fontFamily: fonts.bold,
    fontSize: 12,
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

  footerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 'auto',
    paddingTop: 8,
  },

  backButton: {
    minWidth: 92,
    minHeight: 54,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.round,
    backgroundColor: colors.surface,
  },

  backButtonText: {
    color: colors.mutedStrong,
    fontFamily: fonts.semiBold,
    fontSize: 13,
  },

  createButton: {
    minHeight: 54,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: radii.round,
    backgroundColor: colors.primary,
    ...shadows.card,
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
