import * as ImagePicker from 'expo-image-picker';
import { SymbolView } from 'expo-symbols';
import {
  router,
  useLocalSearchParams,
} from 'expo-router';
import {
  useCallback,
  useEffect,
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
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DeleteGroupAction } from '../../../../components/DeleteGroupAction';
import { FormField } from '../../../../components/FormField';
import { useAuth } from '../../../../contexts/auth-context';
import {
  getErrorMessage,
  resolveApiUrl,
} from '../../../../lib/api';
import {
  deleteGroupImage,
  getGroup,
  updateGroup,
  uploadGroupImage,
} from '../../../../services/group-service';
import { colors } from '../../../../theme/colors';
import type {
  GroupPrivacy,
  RestaurantGroup,
} from '../../../../types/group';
import { fonts } from '../../../../theme/fonts';

const MAXIMUM_GROUP_IMAGE_SIZE =
  5 * 1024 * 1024;

export default function EditGroupScreen() {
  const { groupId } = useLocalSearchParams<{
    groupId: string;
  }>();

  const {
    accessToken,
    user,
  } = useAuth();

  const [group, setGroup] =
    useState<RestaurantGroup | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] =
    useState('');
  const [city, setCity] = useState('');
  const [privacy, setPrivacy] =
    useState<GroupPrivacy>('PRIVATE');
  const [selectedImage, setSelectedImage] =
    useState<ImagePicker.ImagePickerAsset | null>(null);
  const [removeCurrentImage, setRemoveCurrentImage] =
    useState(false);
  const [isLoading, setIsLoading] =
    useState(true);
  const [isSaving, setIsSaving] =
    useState(false);
  const [requestError, setRequestError] =
    useState<string | null>(null);

  const loadGroup = useCallback(async () => {
    if (!accessToken || !groupId) {
      setRequestError(
        'No se ha podido recuperar el grupo.',
      );
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setRequestError(null);

      const response = await getGroup(
        groupId,
        accessToken,
      );

      setGroup(response);
      setName(response.name);
      setDescription(response.description ?? '');
      setCity(response.city ?? '');
      setPrivacy(response.privacy);
    } catch (error) {
      setRequestError(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, groupId]);

  useEffect(() => {
    void loadGroup();
  }, [loadGroup]);

  const isOwner =
    Boolean(group && user?.id === group.ownerUserId);

  const canSave = useMemo(() => {
    return (
      isOwner
      && name.trim().length > 0
      && !isSaving
    );
  }, [isOwner, isSaving, name]);

  const currentImageUri =
    group?.imageUrl && !removeCurrentImage
      ? resolveApiUrl(group.imageUrl)
      : null;

  function validateImage(
    asset: ImagePicker.ImagePickerAsset,
  ): boolean {
    if (
      asset.fileSize
      && asset.fileSize > MAXIMUM_GROUP_IMAGE_SIZE
    ) {
      Alert.alert(
        'Imagen demasiado grande',
        'La imagen no puede superar los 5 MB.',
      );
      return false;
    }

    return true;
  }

  async function selectFromGallery(): Promise<void> {
    const permission = await ImagePicker
      .requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        'Permiso necesario',
        'Mesa necesita acceder a tus fotos.',
      );
      return;
    }

    const result = await ImagePicker
      .launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.75,
      });

    if (
      !result.canceled
      && result.assets.length > 0
      && validateImage(result.assets[0])
    ) {
      setSelectedImage(result.assets[0]);
      setRemoveCurrentImage(false);
    }
  }

  async function takePhoto(): Promise<void> {
    const permission = await ImagePicker
      .requestCameraPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        'Permiso necesario',
        'Mesa necesita acceder a la cámara.',
      );
      return;
    }

    const result = await ImagePicker
      .launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.75,
      });

    if (
      !result.canceled
      && result.assets.length > 0
      && validateImage(result.assets[0])
    ) {
      setSelectedImage(result.assets[0]);
      setRemoveCurrentImage(false);
    }
  }

  function openImageOptions(): void {
    Alert.alert(
      'Foto del grupo',
      'Elige cómo quieres actualizarla.',
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
        ...(
          selectedImage || currentImageUri
            ? [
                {
                  text: 'Eliminar foto',
                  style: 'destructive' as const,
                  onPress: () => {
                    setSelectedImage(null);
                    setRemoveCurrentImage(true);
                  },
                },
              ]
            : []
        ),
        {
          text: 'Cancelar',
          style: 'cancel',
        },
      ],
    );
  }

  async function handleSave(): Promise<void> {
    if (!accessToken || !groupId || !canSave) {
      return;
    }

    try {
      setIsSaving(true);
      setRequestError(null);

      await updateGroup(
        groupId,
        {
          name: name.trim(),
          description: description.trim() || null,
          city: city.trim() || null,
          privacy,
        },
        accessToken,
      );

      if (selectedImage) {
        await uploadGroupImage(
          groupId,
          { uri: selectedImage.uri },
          accessToken,
        );
      } else if (
        removeCurrentImage
        && group?.imageUrl
      ) {
        await deleteGroupImage(
          groupId,
          accessToken,
        );
      }

      router.back();
    } catch (error) {
      setRequestError(getErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <SafeAreaView
      edges={['top', 'right', 'bottom', 'left']}
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
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Pressable
              accessibilityLabel="Volver"
              accessibilityRole="button"
              disabled={isSaving}
              onPress={() => {
                router.back();
              }}
              style={styles.headerButton}
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
              Editar grupo
            </Text>

            <Pressable
              accessibilityRole="button"
              disabled={!canSave}
              onPress={() => {
                void handleSave();
              }}
            >
              <Text
                style={[
                  styles.saveText,
                  !canSave
                    ? styles.saveTextDisabled
                    : null,
                ]}
              >
                Guardar
              </Text>
            </Pressable>
          </View>

          {isLoading ? (
            <View style={styles.loading}>
              <ActivityIndicator
                color={colors.primary}
                size="large"
              />
            </View>
          ) : null}

          {!isLoading && !isOwner ? (
            <View style={styles.accessCard}>
              <SymbolView
                name={{
                  ios: 'lock.fill',
                  android: 'lock',
                  web: 'lock',
                }}
                size={24}
                tintColor={colors.primary}
              />

              <Text style={styles.accessTitle}>
                Solo la creadora puede editar el grupo
              </Text>

              <Text style={styles.accessText}>
                Los demás miembros pueden consultar el grupo y editar sus restaurantes.
              </Text>
            </View>
          ) : null}

          {!isLoading && isOwner && group ? (
            <>
              <View style={styles.imageSection}>
                <Pressable
                  accessibilityRole="button"
                  onPress={openImageOptions}
                  style={styles.imageButton}
                >
                  {selectedImage ? (
                    <Image
                      source={{ uri: selectedImage.uri }}
                      style={styles.groupImage}
                    />
                  ) : currentImageUri ? (
                    <Image
                      source={{ uri: currentImageUri }}
                      style={styles.groupImage}
                    />
                  ) : (
                    <View style={styles.imageFallback}>
                      <Text style={styles.imageInitial}>
                        {name.charAt(0).toUpperCase() || 'M'}
                      </Text>
                    </View>
                  )}

                  <View style={styles.cameraBadge}>
                    <SymbolView
                      name={{
                        ios: 'camera.fill',
                        android: 'photo_camera',
                        web: 'photo_camera',
                      }}
                      size={17}
                      tintColor={colors.text}
                    />
                  </View>
                </Pressable>

                <Text style={styles.imageHint}>
                  Cambia la foto del grupo
                </Text>
              </View>

              <View style={styles.formCard}>
                <FormField
                  autoCapitalize="words"
                  label="Nombre del grupo"
                  maxLength={100}
                  onChangeText={setName}
                  placeholder="Amigos foodie"
                  value={name}
                />

                <FormField
                  autoCapitalize="sentences"
                  label="Descripción"
                  maxLength={500}
                  multiline
                  onChangeText={setDescription}
                  placeholder="¿Qué tipo de sitios os gustan?"
                  style={styles.multilineInput}
                  textAlignVertical="top"
                  value={description}
                />

                <FormField
                  autoCapitalize="words"
                  label="Ciudad"
                  maxLength={100}
                  onChangeText={setCity}
                  placeholder="Barcelona"
                  value={city}
                />
              </View>

              <View style={styles.privacyCard}>
                <View style={styles.privacyIcon}>
                  <SymbolView
                    name={{
                      ios: privacy === 'PRIVATE'
                        ? 'lock.fill'
                        : 'globe',
                      android: privacy === 'PRIVATE'
                        ? 'lock'
                        : 'public',
                      web: privacy === 'PRIVATE'
                        ? 'lock'
                        : 'public',
                    }}
                    size={20}
                    tintColor={colors.primary}
                  />
                </View>

                <View style={styles.privacyText}>
                  <Text style={styles.privacyTitle}>
                    Grupo privado
                  </Text>

                  <Text style={styles.privacyDescription}>
                    Solo las personas invitadas pueden verlo y unirse.
                  </Text>
                </View>

                <Switch
                  onValueChange={value => {
                    setPrivacy(
                      value ? 'PRIVATE' : 'PUBLIC',
                    );
                  }}
                  thumbColor={colors.white}
                  trackColor={{
                    false: '#D9D1CC',
                    true: colors.primary,
                  }}
                  value={privacy === 'PRIVATE'}
                />
              </View>

              {requestError ? (
                <View style={styles.errorCard}>
                  <Text style={styles.errorText}>
                    {requestError}
                  </Text>
                </View>
              ) : null}

              <Pressable
                accessibilityRole="button"
                disabled={!canSave}
                onPress={() => {
                  void handleSave();
                }}
                style={({ pressed }) => [
                  styles.primaryButton,
                  pressed && canSave
                    ? styles.primaryButtonPressed
                    : null,
                  !canSave
                    ? styles.primaryButtonDisabled
                    : null,
                ]}
              >
                {isSaving ? (
                  <ActivityIndicator
                    color={colors.white}
                    size="small"
                  />
                ) : (
                  <Text style={styles.primaryButtonText}>
                    Guardar cambios
                  </Text>
                )}
              </Pressable>

              <DeleteGroupAction
                groupId={groupId}
                groupName={group.name}
              />
            </>
          ) : null}
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
    gap: 22,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 34,
  },
  header: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerButton: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 19,
  },
  headerTitle: {
    color: colors.text,
    fontSize: 15,
    fontFamily: fonts.bold,
  },
  saveText: {
    color: colors.primary,
    fontSize: 13,
    fontFamily: fonts.bold,
  },
  saveTextDisabled: {
    opacity: 0.4,
  },
  loading: {
    alignItems: 'center',
    paddingVertical: 90,
  },
  imageSection: {
    alignItems: 'center',
    gap: 8,
  },
  imageButton: {
    position: 'relative',
    width: 104,
    height: 104,
  },
  groupImage: {
    width: '100%',
    height: '100%',
    borderRadius: 52,
  },
  imageFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 52,
    backgroundColor: '#F3DED5',
  },
  imageInitial: {
    color: colors.primary,
    fontSize: 38,
    fontFamily: fonts.bold,
  },
  cameraBadge: {
    position: 'absolute',
    right: -1,
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
    color: colors.primary,
    fontSize: 11,
    fontFamily: fonts.bold,
  },
  formCard: {
    gap: 17,
    padding: 17,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    backgroundColor: colors.surface,
  },
  multilineInput: {
    minHeight: 92,
    paddingTop: 14,
  },
  privacyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    backgroundColor: colors.surface,
  },
  privacyIcon: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
    backgroundColor: '#FBE9E2',
  },
  privacyText: {
    flex: 1,
    gap: 3,
  },
  privacyTitle: {
    color: colors.text,
    fontSize: 14,
    fontFamily: fonts.bold,
  },
  privacyDescription: {
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 10,
    lineHeight: 15,
  },
  accessCard: {
    alignItems: 'center',
    gap: 10,
    padding: 28,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 22,
    backgroundColor: colors.surface,
  },
  accessTitle: {
    color: colors.text,
    fontSize: 16,
    fontFamily: fonts.bold,
    textAlign: 'center',
  },
  accessText: {
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
  },
  errorCard: {
    padding: 14,
    borderWidth: 1,
    borderColor: '#F3C5BC',
    borderRadius: 15,
    backgroundColor: '#FFF1EE',
  },
  errorText: {
    color: colors.danger,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 18,
  },
  primaryButton: {
    minHeight: 54,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: colors.primary,
  },
  primaryButtonPressed: {
    backgroundColor: colors.primaryPressed,
  },
  primaryButtonDisabled: {
    opacity: 0.45,
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: 15,
    fontFamily: fonts.bold,
  },
});
