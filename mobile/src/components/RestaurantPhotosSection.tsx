import { SymbolView } from 'expo-symbols';
import * as ImagePicker from 'expo-image-picker';
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
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getErrorMessage } from '../lib/api';
import {
  clearCachedRestaurantPhoto,
  deleteRestaurantPhoto,
  getCachedRestaurantPhotoUri,
  getRestaurantPhotos,
  uploadRestaurantPhoto,
} from '../services/restaurant-photo-service';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import type {
  RestaurantPhoto,
  RestaurantPhotoUploadFile,
} from '../types/restaurant-photo';

type RestaurantPhotosSectionProps = {
  accessToken: string;
  canAddPhotos: boolean;
  groupId: string;
  groupRestaurantId: string;
  onEnsureVisited: () => Promise<boolean>;
};

const MAXIMUM_FILE_SIZE = 5 * 1024 * 1024;
const MAXIMUM_PHOTOS = 30;
const MAXIMUM_PICKER_BATCH = 6;

function toUploadFile(
  asset: ImagePicker.ImagePickerAsset,
): RestaurantPhotoUploadFile {
  return {
    uri: asset.uri,
    fileName: asset.fileName ?? null,
    mimeType: asset.mimeType ?? null,
    fileSize: asset.fileSize ?? null,
  };
}

function formatPhotoDate(value: string): string {
  return new Date(value).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function RestaurantPhotosSection({
  accessToken,
  canAddPhotos,
  groupId,
  groupRestaurantId,
  onEnsureVisited,
}: RestaurantPhotosSectionProps) {
  const [photos, setPhotos] = useState<RestaurantPhoto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPicking, setIsPicking] = useState(false);
  const [uploadingProgress, setUploadingProgress] = useState<{
    current: number;
    total: number;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  const [deletingPhotoId, setDeletingPhotoId] = useState<string | null>(null);
  const [photoUris, setPhotoUris] = useState<Record<string, string>>({});
  const [photoDownloadErrors, setPhotoDownloadErrors] = useState<
    Record<string, boolean>
  >({});

  const loadPhotos = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      setPhotos(await getRestaurantPhotos(
        groupId,
        groupRestaurantId,
        accessToken,
      ));
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, groupId, groupRestaurantId]);

  useEffect(() => {
    void loadPhotos();
  }, [loadPhotos]);

  useEffect(() => {
    const photosToDownload = photos.filter(photo =>
      !photoUris[photo.id] && !photoDownloadErrors[photo.id]
    );

    if (photosToDownload.length === 0) {
      return;
    }

    let cancelled = false;

    void Promise.all(
      photosToDownload.map(async photo => {
        try {
          const uri = await getCachedRestaurantPhotoUri(
            photo.id,
            photo.imageUrl,
            accessToken,
          );

          return { id: photo.id, uri, failed: false };
        } catch {
          return { id: photo.id, uri: null, failed: true };
        }
      }),
    ).then(results => {
      if (cancelled) {
        return;
      }

      setPhotoUris(current => {
        const next = { ...current };

        results.forEach(result => {
          if (result.uri) {
            next[result.id] = result.uri;
          }
        });

        return next;
      });

      setPhotoDownloadErrors(current => {
        const next = { ...current };

        results.forEach(result => {
          if (result.failed) {
            next[result.id] = true;
          } else {
            delete next[result.id];
          }
        });

        return next;
      });
    });

    return () => {
      cancelled = true;
    };
  }, [
    accessToken,
    photoDownloadErrors,
    photoUris,
    photos,
  ]);

  const selectedPhoto = useMemo(() => {
    if (selectedPhotoIndex === null) {
      return null;
    }

    return photos[selectedPhotoIndex] ?? null;
  }, [photos, selectedPhotoIndex]);

  function retryPhotoDownload(photoId: string) {
    setPhotoDownloadErrors(current => {
      const next = { ...current };
      delete next[photoId];
      return next;
    });
  }

  function handlePhotoRenderError(photoId: string) {
    clearCachedRestaurantPhoto(photoId);

    setPhotoUris(current => {
      const next = { ...current };
      delete next[photoId];
      return next;
    });

    setPhotoDownloadErrors(current => ({
      ...current,
      [photoId]: true,
    }));
  }

  function validateAssets(
    assets: ImagePicker.ImagePickerAsset[],
  ): ImagePicker.ImagePickerAsset[] {
    const oversized = assets.some(asset =>
      asset.fileSize !== null
      && asset.fileSize !== undefined
      && asset.fileSize > MAXIMUM_FILE_SIZE
    );

    if (oversized) {
      Alert.alert(
        'Alguna foto es demasiado grande',
        'Las imágenes de más de 5 MB no se subirán.',
      );
    }

    return assets.filter(asset =>
      !asset.fileSize || asset.fileSize <= MAXIMUM_FILE_SIZE
    );
  }

  async function uploadAssets(
    selectedAssets: ImagePicker.ImagePickerAsset[],
  ) {
    const availableSlots = MAXIMUM_PHOTOS - photos.length;
    const assets = validateAssets(selectedAssets).slice(0, availableSlots);

    if (assets.length === 0) {
      return;
    }

    if (!await onEnsureVisited()) {
      return;
    }

    try {
      setErrorMessage(null);
      setUploadingProgress({ current: 0, total: assets.length });

      const uploaded: RestaurantPhoto[] = [];

      for (let index = 0; index < assets.length; index += 1) {
        const photo = await uploadRestaurantPhoto(
          groupId,
          groupRestaurantId,
          toUploadFile(assets[index]),
          accessToken,
        );

        uploaded.push(photo);
        setUploadingProgress({ current: index + 1, total: assets.length });
      }

      setPhotos(current => [...uploaded.reverse(), ...current]);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
      await loadPhotos();
    } finally {
      setUploadingProgress(null);
    }
  }

  async function selectFromGallery() {
    try {
      setIsPicking(true);

      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          'Permiso necesario',
          'Necesitamos acceder a tus fotos para añadirlas al restaurante.',
        );
        return;
      }

      const selectionLimit = Math.min(
        MAXIMUM_PICKER_BATCH,
        MAXIMUM_PHOTOS - photos.length,
      );

      if (selectionLimit <= 0) {
        Alert.alert(
          'Galería completa',
          'Este restaurante ya tiene el máximo de 30 fotos del grupo.',
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: true,
        selectionLimit,
        quality: 0.72,
      });

      if (!result.canceled && result.assets.length > 0) {
        await uploadAssets(result.assets);
      }
    } catch (error) {
      Alert.alert(
        'No se ha podido abrir la galería',
        getErrorMessage(error),
      );
    } finally {
      setIsPicking(false);
    }
  }

  async function takePhoto() {
    try {
      setIsPicking(true);

      const permission = await ImagePicker.requestCameraPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          'Permiso necesario',
          'Necesitamos acceder a la cámara para guardar una foto del restaurante.',
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        quality: 0.72,
      });

      if (!result.canceled && result.assets.length > 0) {
        await uploadAssets([result.assets[0]]);
      }
    } catch (error) {
      Alert.alert(
        'No se ha podido abrir la cámara',
        getErrorMessage(error),
      );
    } finally {
      setIsPicking(false);
    }
  }

  function openAddOptions() {
    if (isPicking || uploadingProgress || photos.length >= MAXIMUM_PHOTOS) {
      return;
    }

    Alert.alert(
      'Añadir fotos',
      'Guarda los platos y momentos de vuestra visita.',
      [
        {
          text: 'Elegir de la galería',
          onPress: () => void selectFromGallery(),
        },
        {
          text: 'Hacer una foto',
          onPress: () => void takePhoto(),
        },
        { text: 'Cancelar', style: 'cancel' },
      ],
    );
  }

  async function handleDeletePhoto(photo: RestaurantPhoto) {
    try {
      setDeletingPhotoId(photo.id);
      setErrorMessage(null);

      await deleteRestaurantPhoto(
        groupId,
        groupRestaurantId,
        photo.id,
        accessToken,
      );

      setPhotos(current => current.filter(item => item.id !== photo.id));
      setPhotoUris(current => {
        const next = { ...current };
        delete next[photo.id];
        return next;
      });
      setPhotoDownloadErrors(current => {
        const next = { ...current };
        delete next[photo.id];
        return next;
      });
      setSelectedPhotoIndex(null);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setDeletingPhotoId(null);
    }
  }

  function confirmDeletePhoto(photo: RestaurantPhoto) {
    Alert.alert(
      'Eliminar foto',
      'La foto dejará de estar disponible para el grupo.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => void handleDeletePhoto(photo),
        },
      ],
    );
  }

  return (
    <View style={styles.section}>
      <View style={styles.heading}>
        <View style={styles.headingCopy}>
          <Text style={styles.sectionTitle}>Fotos del grupo</Text>
          {!isLoading && photos.length > 0 ? (
            <Text style={styles.photoCount}>
              {photos.length} {photos.length === 1 ? 'foto' : 'fotos'} compartidas
            </Text>
          ) : null}
        </View>
        {canAddPhotos && photos.length > 0 && photos.length < MAXIMUM_PHOTOS ? (
          <Pressable
            accessibilityLabel="Añadir fotos"
            accessibilityRole="button"
            disabled={isPicking || uploadingProgress !== null}
            onPress={openAddOptions}
            style={({ pressed }) => [
              styles.headerAction,
              pressed ? styles.pressed : null,
            ]}
          >
            <SymbolView
              name={{ ios: 'plus', android: 'add', web: 'add' }}
              size={15}
              tintColor={colors.primary}
            />
            <Text style={styles.headerActionText}>Añadir</Text>
          </Pressable>
        ) : null}
      </View>

      {isLoading ? (
        <View style={styles.loadingRow}>
          <ActivityIndicator color={colors.primary} size="small" />
          <Text style={styles.loadingText}>Cargando fotos...</Text>
        </View>
      ) : null}

      {!isLoading && photos.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}>
            <SymbolView
              name={{ ios: 'photo.on.rectangle.angled', android: 'photo_library', web: 'photo_library' }}
              size={21}
              tintColor={colors.primary}
            />
          </View>
          <View style={styles.emptyCopy}>
            <Text style={styles.emptyTitle}>Guardad vuestra visita</Text>
            <Text style={styles.emptyDescription}>
              Fotos de platos y momentos, solo para este grupo.
            </Text>
          </View>
          {canAddPhotos ? (
            <Pressable
              accessibilityRole="button"
              disabled={isPicking || uploadingProgress !== null}
              onPress={openAddOptions}
              style={({ pressed }) => [
                styles.emptyAction,
                pressed ? styles.pressed : null,
              ]}
            >
              <Text style={styles.emptyActionText}>Añadir fotos</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}

      {!isLoading && photos.length > 0 ? (
        <View style={styles.photoGrid}>
          {photos.map((photo, index) => (
            <Pressable
              accessibilityLabel={`Abrir foto ${index + 1}`}
              accessibilityRole="button"
              key={photo.id}
              onPress={() => setSelectedPhotoIndex(index)}
              style={({ pressed }) => [
                styles.photoTile,
                pressed ? styles.pressed : null,
              ]}
            >
              {photoUris[photo.id] ? (
                <Image
                  onError={() => handlePhotoRenderError(photo.id)}
                  resizeMode="cover"
                  source={{ uri: photoUris[photo.id] }}
                  style={styles.thumbnail}
                />
              ) : photoDownloadErrors[photo.id] ? (
                <Pressable
                  accessibilityLabel="Reintentar cargar foto"
                  accessibilityRole="button"
                  onPress={() => retryPhotoDownload(photo.id)}
                  style={styles.photoLoadState}
                >
                  <SymbolView
                    name={{ ios: 'arrow.clockwise', android: 'refresh', web: 'refresh' }}
                    size={19}
                    tintColor={colors.primary}
                  />
                  <Text style={styles.photoLoadErrorText}>Reintentar</Text>
                </Pressable>
              ) : (
                <View style={styles.photoLoadState}>
                  <ActivityIndicator color={colors.primary} size="small" />
                </View>
              )}
            </Pressable>
          ))}
        </View>
      ) : null}

      {uploadingProgress ? (
        <View style={styles.progressRow}>
          <ActivityIndicator color={colors.primary} size="small" />
          <Text style={styles.progressText}>
            Subiendo {uploadingProgress.current}/{uploadingProgress.total}...
          </Text>
        </View>
      ) : null}

      {errorMessage ? (
        <View style={styles.errorRow}>
          <Text style={styles.errorText}>{errorMessage}</Text>
          <Pressable accessibilityRole="button" onPress={() => void loadPhotos()}>
            <Text style={styles.retryText}>Reintentar</Text>
          </Pressable>
        </View>
      ) : null}

      <Modal
        animationType="fade"
        onRequestClose={() => setSelectedPhotoIndex(null)}
        statusBarTranslucent
        visible={selectedPhoto !== null}
      >
        <SafeAreaView edges={['top', 'right', 'bottom', 'left']} style={styles.gallery}>
          {selectedPhoto ? (
            <>
              <View style={styles.galleryHeader}>
                <Pressable
                  accessibilityLabel="Cerrar galería"
                  accessibilityRole="button"
                  onPress={() => setSelectedPhotoIndex(null)}
                  style={styles.galleryIconButton}
                >
                  <SymbolView
                    name={{ ios: 'xmark', android: 'close', web: 'close' }}
                    size={21}
                    tintColor={colors.white}
                  />
                </Pressable>

                <Text style={styles.galleryCounter}>
                  {(selectedPhotoIndex ?? 0) + 1} / {photos.length}
                </Text>

                {selectedPhoto.canDelete ? (
                  <Pressable
                    accessibilityLabel="Eliminar foto"
                    accessibilityRole="button"
                    disabled={deletingPhotoId === selectedPhoto.id}
                    onPress={() => confirmDeletePhoto(selectedPhoto)}
                    style={styles.galleryIconButton}
                  >
                    {deletingPhotoId === selectedPhoto.id ? (
                      <ActivityIndicator color={colors.white} size="small" />
                    ) : (
                      <SymbolView
                        name={{ ios: 'trash', android: 'delete', web: 'delete' }}
                        size={19}
                        tintColor={colors.white}
                      />
                    )}
                  </Pressable>
                ) : (
                  <View style={styles.galleryIconButton} />
                )}
              </View>

              <View style={styles.galleryImageArea}>
                {photoUris[selectedPhoto.id] ? (
                  <Image
                    onError={() => handlePhotoRenderError(selectedPhoto.id)}
                    resizeMode="contain"
                    source={{ uri: photoUris[selectedPhoto.id] }}
                    style={styles.galleryImage}
                  />
                ) : photoDownloadErrors[selectedPhoto.id] ? (
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => retryPhotoDownload(selectedPhoto.id)}
                    style={styles.galleryLoadState}
                  >
                    <SymbolView
                      name={{ ios: 'arrow.clockwise', android: 'refresh', web: 'refresh' }}
                      size={25}
                      tintColor={colors.white}
                    />
                    <Text style={styles.galleryLoadText}>
                      Reintentar carga
                    </Text>
                  </Pressable>
                ) : (
                  <View style={styles.galleryLoadState}>
                    <ActivityIndicator color={colors.white} size="large" />
                    <Text style={styles.galleryLoadText}>
                      Cargando foto...
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.galleryFooter}>
                <Pressable
                  accessibilityLabel="Foto anterior"
                  accessibilityRole="button"
                  disabled={selectedPhotoIndex === 0}
                  onPress={() => setSelectedPhotoIndex(index =>
                    index === null ? null : Math.max(0, index - 1)
                  )}
                  style={({ pressed }) => [
                    styles.galleryNavButton,
                    selectedPhotoIndex === 0 ? styles.galleryNavDisabled : null,
                    pressed ? styles.galleryPressed : null,
                  ]}
                >
                  <SymbolView
                    name={{ ios: 'chevron.left', android: 'chevron_left', web: 'chevron_left' }}
                    size={22}
                    tintColor={colors.white}
                  />
                </Pressable>

                <View style={styles.galleryMeta}>
                  <Text style={styles.galleryUploader}>{selectedPhoto.uploadedByName}</Text>
                  <Text style={styles.galleryDate}>{formatPhotoDate(selectedPhoto.createdAt)}</Text>
                </View>

                <Pressable
                  accessibilityLabel="Foto siguiente"
                  accessibilityRole="button"
                  disabled={selectedPhotoIndex === photos.length - 1}
                  onPress={() => setSelectedPhotoIndex(index =>
                    index === null ? null : Math.min(photos.length - 1, index + 1)
                  )}
                  style={({ pressed }) => [
                    styles.galleryNavButton,
                    selectedPhotoIndex === photos.length - 1 ? styles.galleryNavDisabled : null,
                    pressed ? styles.galleryPressed : null,
                  ]}
                >
                  <SymbolView
                    name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
                    size={22}
                    tintColor={colors.white}
                  />
                </Pressable>
              </View>
            </>
          ) : null}
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 10,
  },
  heading: {
    minHeight: 24,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  headingCopy: {
    flex: 1,
    gap: 2,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 17,
    fontFamily: fonts.bold,
  },
  photoCount: {
    color: colors.muted,
    fontSize: 10,
    fontFamily: fonts.regular,
  },
  headerAction: {
    minHeight: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    paddingHorizontal: 9,
    borderRadius: 11,
    backgroundColor: colors.primarySoft,
  },
  headerActionText: {
    color: colors.primary,
    fontSize: 10,
    fontFamily: fonts.bold,
  },
  loadingRow: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  loadingText: {
    color: colors.muted,
    fontSize: 10,
    fontFamily: fonts.regular,
  },
  emptyState: {
    minHeight: 82,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 11,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  emptyIcon: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: '#FBE9E2',
  },
  emptyCopy: {
    flex: 1,
    gap: 2,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 12,
    fontFamily: fonts.bold,
  },
  emptyDescription: {
    color: colors.muted,
    fontSize: 9,
    lineHeight: 13,
    fontFamily: fonts.regular,
  },
  emptyAction: {
    minHeight: 34,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: colors.primary,
  },
  emptyActionText: {
    color: colors.white,
    fontSize: 9,
    fontFamily: fonts.bold,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
  },
  photoTile: {
    overflow: 'hidden',
    width: '31.8%',
    aspectRatio: 1,
    borderRadius: 14,
    backgroundColor: colors.surfaceMuted,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  photoLoadState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  photoLoadErrorText: {
    color: colors.primary,
    fontSize: 8,
    fontFamily: fonts.semiBold,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    minHeight: 24,
  },
  progressText: {
    color: colors.muted,
    fontSize: 9,
    fontFamily: fonts.regular,
  },
  errorRow: {
    gap: 5,
    padding: 10,
    borderRadius: 12,
    backgroundColor: '#FFF1EE',
  },
  errorText: {
    color: colors.danger,
    fontSize: 9,
    lineHeight: 13,
    fontFamily: fonts.regular,
  },
  retryText: {
    color: colors.primary,
    fontSize: 9,
    fontFamily: fonts.bold,
  },
  pressed: {
    opacity: 0.68,
  },
  gallery: {
    flex: 1,
    backgroundColor: '#171311',
  },
  galleryHeader: {
    height: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  galleryIconButton: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 21,
  },
  galleryCounter: {
    color: colors.white,
    fontSize: 12,
    fontFamily: fonts.bold,
  },
  galleryImageArea: {
    flex: 1,
    alignItems: 'stretch',
    justifyContent: 'center',
  },
  galleryImage: {
    width: '100%',
    height: '100%',
  },
  galleryLoadState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  galleryLoadText: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 10,
    fontFamily: fonts.medium,
  },
  galleryFooter: {
    minHeight: 88,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
  },
  galleryNavButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
  galleryNavDisabled: {
    opacity: 0.25,
  },
  galleryPressed: {
    opacity: 0.58,
  },
  galleryMeta: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  galleryUploader: {
    color: colors.white,
    fontSize: 11,
    fontFamily: fonts.bold,
  },
  galleryDate: {
    color: 'rgba(255,255,255,0.62)',
    fontSize: 9,
    fontFamily: fonts.regular,
  },
});
