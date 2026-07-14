import { SymbolView } from 'expo-symbols';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import {
  ReactNode,
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
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '../../contexts/auth-context';
import {
  getErrorMessage,
  resolveApiUrl,
} from '../../lib/api';
import {
  deleteCurrentUserAvatar,
  updateCurrentUserProfile,
  uploadCurrentUserAvatar,
} from '../../services/profile-service';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/fonts';

type EditFieldProps = TextInputProps & {
  label: string;
  hint?: string;
  trailing?: ReactNode;
};

const MAXIMUM_AVATAR_SIZE =
  5 * 1024 * 1024;

function EditField({
  label,
  hint,
  trailing,
  style,
  ...inputProps
}: EditFieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>
        {label}
      </Text>

      <View style={styles.inputContainer}>
        <TextInput
          {...inputProps}
          placeholderTextColor={colors.muted}
          selectionColor={colors.primary}
          style={[
            styles.input,
            trailing
              ? styles.inputWithTrailing
              : null,
            style,
          ]}
        />

        {trailing ? (
          <View style={styles.trailing}>
            {trailing}
          </View>
        ) : null}
      </View>

      {hint ? (
        <Text style={styles.fieldHint}>
          {hint}
        </Text>
      ) : null}
    </View>
  );
}

export default function EditProfileScreen() {
  const {
    user,
    accessToken,
    updateCurrentUser,
  } = useAuth();

  const [name, setName] =
    useState(user?.name ?? '');

  const [username, setUsername] =
    useState(user?.username ?? '');

  const [email, setEmail] =
    useState(user?.email ?? '');

  const [
    selectedAvatar,
    setSelectedAvatar,
  ] =
    useState<ImagePicker.ImagePickerAsset | null>(
      null,
    );

  const [
    shouldDeleteAvatar,
    setShouldDeleteAvatar,
  ] = useState(false);

  const [
    avatarLoadError,
    setAvatarLoadError,
  ] = useState(false);

  const [
    isPickingImage,
    setIsPickingImage,
  ] = useState(false);

  const [
    requestError,
    setRequestError,
  ] = useState<string | null>(null);

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false);

  useEffect(() => {
    setName(user?.name ?? '');
    setUsername(user?.username ?? '');
    setEmail(user?.email ?? '');

    setSelectedAvatar(null);
    setShouldDeleteAvatar(false);
    setAvatarLoadError(false);
  }, [user]);

  const displayInitial = useMemo(() => {
    const normalizedName = name.trim();

    return normalizedName
      ? normalizedName
          .charAt(0)
          .toUpperCase()
      : '?';
  }, [name]);

  const storedAvatarUri = useMemo(() => {
    if (
      !user?.avatarUrl
      || shouldDeleteAvatar
    ) {
      return null;
    }

    return resolveApiUrl(user.avatarUrl);
  }, [
    shouldDeleteAvatar,
    user?.avatarUrl,
  ]);

  const avatarPreviewUri =
    selectedAvatar?.uri
    ?? storedAvatarUri;

  const showAvatarImage =
    avatarPreviewUri !== null
    && !avatarLoadError;

  function validateSelectedImage(
    asset: ImagePicker.ImagePickerAsset,
  ): boolean {
    if (
      asset.fileSize
      && asset.fileSize > MAXIMUM_AVATAR_SIZE
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
  ) {
    if (!validateSelectedImage(asset)) {
      return;
    }

    setSelectedAvatar(asset);
    setShouldDeleteAvatar(false);
    setAvatarLoadError(false);
  }

  async function selectFromGallery() {
    try {
      setIsPickingImage(true);

      const permission =
        await ImagePicker
          .requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          'Permiso necesario',
          'Necesitamos acceder a tus fotos para cambiar la imagen de perfil.',
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

  async function takePhoto() {
    try {
      setIsPickingImage(true);

      const permission =
        await ImagePicker
          .requestCameraPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          'Permiso necesario',
          'Necesitamos acceder a la cámara para hacer tu foto de perfil.',
        );
        return;
      }

      const result =
        await ImagePicker.launchCameraAsync({
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

  function removeAvatar() {
    setSelectedAvatar(null);
    setShouldDeleteAvatar(true);
    setAvatarLoadError(false);
  }

  function openAvatarOptions() {
    const hasAvatar =
      selectedAvatar !== null
      || (
        user?.avatarUrl !== null
        && user?.avatarUrl !== undefined
        && !shouldDeleteAvatar
      );

    Alert.alert(
      'Foto de perfil',
      'Elige cómo quieres cambiarla.',
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
        ...(hasAvatar
          ? [
              {
                text: 'Eliminar foto',
                style:
                  'destructive' as const,
                onPress: removeAvatar,
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

  async function handleSave() {
    setRequestError(null);

    const normalizedName =
      name.trim();

    const normalizedUsername =
      username.trim();

    const normalizedEmail =
      email.trim();

    if (
      !normalizedName
      || !normalizedUsername
      || !normalizedEmail
    ) {
      setRequestError(
        'Completa el nombre, el nombre de usuario y el email.',
      );
      return;
    }

    if (normalizedUsername.length < 3) {
      setRequestError(
        'El nombre de usuario debe tener al menos 3 caracteres.',
      );
      return;
    }

    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (
      !emailPattern.test(
        normalizedEmail,
      )
    ) {
      setRequestError(
        'Introduce un email válido.',
      );
      return;
    }

    if (!accessToken) {
      setRequestError(
        'No se ha podido recuperar tu sesión.',
      );
      return;
    }

    try {
      setIsSubmitting(true);

      let updatedUser =
        await updateCurrentUserProfile(
          {
            name: normalizedName,
            username: normalizedUsername,
            email: normalizedEmail,
          },
          accessToken,
        );

      if (selectedAvatar) {
        updatedUser =
          await uploadCurrentUserAvatar(
            {
              uri: selectedAvatar.uri,
              fileName:
                selectedAvatar.fileName
                ?? null,
              mimeType:
                selectedAvatar.mimeType
                ?? null,
            },
            accessToken,
          );
      } else if (shouldDeleteAvatar) {
        updatedUser =
          await deleteCurrentUserAvatar(
            accessToken,
          );
      }

      updateCurrentUser(updatedUser);

      router.back();
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
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Pressable
              accessibilityLabel="Volver"
              accessibilityRole="button"
              disabled={isSubmitting}
              onPress={() => router.back()}
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
              Editar perfil
            </Text>

            <View
              style={styles.headerPlaceholder}
            />
          </View>

          <View style={styles.avatarSection}>
            <Pressable
              accessibilityLabel="Cambiar foto de perfil"
              accessibilityRole="button"
              disabled={
                isPickingImage
                || isSubmitting
              }
              onPress={openAvatarOptions}
              style={({ pressed }) => [
                styles.avatarWrapper,
                pressed
                  ? styles.avatarPressed
                  : null,
              ]}
            >
              {showAvatarImage ? (
                <Image
                  onError={() => {
                    setAvatarLoadError(true);
                  }}
                  source={{
                    uri: avatarPreviewUri,
                  }}
                  style={styles.avatarImage}
                />
              ) : (
                <View
                  style={styles.avatarFallback}
                >
                  <Text
                    style={
                      styles.avatarFallbackText
                    }
                  >
                    {displayInitial}
                  </Text>
                </View>
              )}

              <View style={styles.cameraBadge}>
                {isPickingImage ? (
                  <ActivityIndicator
                    color={colors.white}
                    size="small"
                  />
                ) : (
                  <SymbolView
                    name={{
                      ios: 'camera.fill',
                      android:
                        'photo_camera',
                      web: 'photo_camera',
                    }}
                    size={18}
                    tintColor={
                      colors.white
                    }
                  />
                )}
              </View>
            </Pressable>

            <Text style={styles.avatarTitle}>
              Foto de perfil
            </Text>

            <Text
              style={styles.avatarDescription}
            >
              Pulsa la foto para cambiarla.
            </Text>
          </View>

          <View style={styles.form}>
            <EditField
              autoCapitalize="words"
              autoComplete="name"
              editable={!isSubmitting}
              label="Nombre"
              maxLength={100}
              onChangeText={setName}
              placeholder="Tu nombre"
              returnKeyType="next"
              value={name}
            />

            <EditField
              autoCapitalize="none"
              autoComplete="username"
              autoCorrect={false}
              editable={!isSubmitting}
              hint="Entre 3 y 50 caracteres."
              label="Nombre de usuario"
              maxLength={50}
              onChangeText={setUsername}
              placeholder="usuario"
              returnKeyType="next"
              value={username}
              trailing={
                <Text style={styles.atSymbol}>
                  @
                </Text>
              }
            />

            <EditField
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect={false}
              editable={!isSubmitting}
              keyboardType="email-address"
              label="Email"
              maxLength={255}
              onChangeText={setEmail}
              onSubmitEditing={() => {
                void handleSave();
              }}
              placeholder="tu@email.com"
              returnKeyType="done"
              value={email}
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
            disabled={
              isSubmitting
              || isPickingImage
            }
            onPress={() => {
              void handleSave();
            }}
            style={({ pressed }) => [
              styles.saveButton,
              pressed && !isSubmitting
                ? styles.saveButtonPressed
                : null,
              isSubmitting
                ? styles.saveButtonDisabled
                : null,
            ]}
          >
            {isSubmitting ? (
              <ActivityIndicator
                color={colors.white}
                size="small"
              />
            ) : (
              <>
                <SymbolView
                  name={{
                    ios: 'checkmark',
                    android: 'check',
                    web: 'check',
                  }}
                  size={20}
                  tintColor={colors.white}
                />

                <Text
                  style={
                    styles.saveButtonText
                  }
                >
                  Guardar cambios
                </Text>
              </>
            )}
          </Pressable>
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
    paddingBottom: 34,
  },

  header: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 25,
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

  avatarSection: {
    alignItems: 'center',
    marginBottom: 30,
  },

  avatarWrapper: {
    width: 98,
    height: 98,
    marginBottom: 13,
    borderRadius: 49,
  },

  avatarPressed: {
    opacity: 0.78,
    transform: [
      {
        scale: 0.98,
      },
    ],
  },

  avatarImage: {
    width: 98,
    height: 98,
    borderRadius: 49,
    backgroundColor: '#E8DDD6',
  },

  avatarFallback: {
    width: 98,
    height: 98,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 49,
    backgroundColor: colors.primary,
  },

  avatarFallbackText: {
    color: colors.white,
    fontSize: 38,
    fontFamily: fonts.bold,
  },

  cameraBadge: {
    position: 'absolute',
    right: -1,
    bottom: 2,
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.background,
    borderRadius: 17,
    backgroundColor: colors.primary,
  },

  avatarTitle: {
    color: colors.text,
    fontSize: 17,
    fontFamily: fonts.bold,
  },

  avatarDescription: {
    marginTop: 5,
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },

  form: {
    gap: 20,
  },

  field: {
    gap: 8,
  },

  fieldLabel: {
    color: colors.text,
    fontSize: 14,
    fontFamily: fonts.bold,
  },

  inputContainer: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 15,
    backgroundColor: colors.inputBackground,
  },

  input: {
    flex: 1,
    minHeight: 52,
    paddingHorizontal: 15,
    paddingVertical: 0,
    color: colors.text,
    fontFamily: fonts.regular,
    fontSize: 15,
  },

  inputWithTrailing: {
    paddingRight: 4,
  },

  trailing: {
    width: 46,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },

  atSymbol: {
    color: colors.primary,
    fontSize: 18,
    fontFamily: fonts.bold,
  },

  fieldHint: {
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 17,
  },

  errorCard: {
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#F0C2B8',
    borderRadius: 14,
    backgroundColor: '#FFF1EE',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },

  errorText: {
    color: colors.danger,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 19,
  },

  saveButton: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 28,
    borderRadius: 27,
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
  },

  saveButtonPressed: {
    backgroundColor: colors.primaryPressed,
  },

  saveButtonDisabled: {
    opacity: 0.65,
  },

  saveButtonText: {
    color: colors.white,
    fontSize: 15,
    fontFamily: fonts.bold,
  },
});