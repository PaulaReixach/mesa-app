import { StyleSheet } from 'react-native';

import { colors } from '../../theme/colors';
import { fonts } from '../../theme/fonts';

const palette = {
  appBackground: '#FBF6F3',
  border: '#EADFD8',
  mutedSurface: '#FFF9F6',
  olive: '#62794D',
  primarySoft: '#FBE8E0',
  shadow: '#2B2421',
  surface: '#FFFEFC',
};

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: palette.appBackground,
  },

  topPanel: {
    zIndex: 2,
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 14,
    backgroundColor: palette.appBackground,
  },

  headingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },

  headingCopy: {
    flex: 1,
  },

  title: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 32,
    lineHeight: 38,
    letterSpacing: -0.8,
  },

  subtitle: {
    marginTop: 2,
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 13.5,
    lineHeight: 19,
  },

  filterButton: {
    position: 'relative',
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 22,
    backgroundColor: palette.surface,
    shadowColor: palette.shadow,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },

  filterDot: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 7,
    height: 7,
    borderWidth: 1.5,
    borderColor: palette.surface,
    borderRadius: 4,
    backgroundColor: palette.olive,
  },

  searchBar: {
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 15,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 18,
    backgroundColor: palette.surface,
  },

  searchInput: {
    flex: 1,
    height: 48,
    paddingVertical: 0,
    color: colors.text,
    fontFamily: fonts.regular,
    fontSize: 14,
  },

  filtersRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 11,
  },

  filterChip: {
    minWidth: 0,
    height: 40,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 20,
    backgroundColor: palette.surface,
  },

  filterChipActive: {
    borderColor: '#E7B4A4',
    backgroundColor: '#FFF1EC',
  },

  filterChipDisabled: {
    opacity: 0.55,
  },

  filterText: {
    flexShrink: 1,
    color: colors.text,
    fontFamily: fonts.medium,
    fontSize: 11.5,
  },

  filterTextActive: {
    color: colors.primary,
    fontFamily: fonts.semiBold,
  },

  mapContainer: {
    flex: 1,
    minHeight: 0,
    overflow: 'hidden',
    backgroundColor: '#F1ECE4',
  },

  map: {
    ...StyleSheet.absoluteFillObject,
  },

  mapResultBadge: {
    position: 'absolute',
    top: 14,
    left: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 11,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(234, 223, 216, 0.92)',
    borderRadius: 18,
    backgroundColor: 'rgba(255, 254, 252, 0.94)',
    shadowColor: palette.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },

  mapResultText: {
    color: colors.text,
    fontFamily: fonts.semiBold,
    fontSize: 11.5,
  },

  locationButton: {
    position: 'absolute',
    right: 16,
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 23,
    backgroundColor: palette.surface,
    shadowColor: palette.shadow,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 5,
  },

  markerWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  markerHalo: {
    position: 'absolute',
    top: -6,
    width: 55,
    height: 55,
    borderRadius: 28,
    backgroundColor: 'rgba(213, 106, 74, 0.16)',
  },

  markerBubble: {
    width: 37,
    height: 37,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.white,
    borderRadius: 19,
    shadowColor: palette.shadow,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },

  markerBubbleSelected: {
    width: 45,
    height: 45,
    borderRadius: 23,
  },

  markerPoint: {
    width: 0,
    height: 0,
    marginTop: -3,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 9,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },

  bottomSheet: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    left: 0,
    overflow: 'hidden',
    borderTopLeftRadius: 27,
    borderTopRightRadius: 27,
    backgroundColor: palette.surface,
    shadowColor: palette.shadow,
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 15,
  },

  dragArea: {
    paddingTop: 9,
    backgroundColor: palette.surface,
  },

  handle: {
    width: 42,
    height: 4,
    alignSelf: 'center',
    marginBottom: 8,
    borderRadius: 2,
    backgroundColor: '#D8D0CB',
  },

  sheetHeader: {
    minHeight: 90,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 18,
    paddingBottom: 14,
  },

  sheetHeadingCopy: {
    flex: 1,
  },

  sheetTitle: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 20,
    lineHeight: 25,
  },

  sheetSubtitle: {
    marginTop: 2,
    color: colors.muted,
    fontFamily: fonts.medium,
    fontSize: 12,
    lineHeight: 17,
  },

  sheetHint: {
    marginTop: 5,
    color: '#9A8F89',
    fontFamily: fonts.regular,
    fontSize: 10.5,
  },

  locationHint: {
    maxWidth: 245,
    marginTop: 5,
    color: colors.primary,
    fontFamily: fonts.medium,
    fontSize: 10.5,
    lineHeight: 15,
  },

  resetText: {
    marginTop: 4,
    color: colors.primary,
    fontFamily: fonts.semiBold,
    fontSize: 11.5,
  },

  selectedSummary: {
    paddingHorizontal: 16,
    paddingBottom: 14,
  },

  selectedTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  selectedThumbnail: {
    width: 57,
    height: 57,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
  },

  selectedCopy: {
    flex: 1,
  },

  selectedNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  selectedName: {
    flex: 1,
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 18,
    lineHeight: 23,
  },

  clearSelectionButton: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: '#F5EFEB',
  },

  selectedMeta: {
    marginTop: 2,
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 11.5,
    lineHeight: 16,
  },

  selectedContextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },

  selectedDistance: {
    color: colors.muted,
    fontFamily: fonts.medium,
    fontSize: 10.5,
  },

  selectedActions: {
    flexDirection: 'row',
    gap: 9,
    marginTop: 12,
  },

  detailButton: {
    minHeight: 43,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
    backgroundColor: colors.primary,
  },

  detailButtonPressed: {
    backgroundColor: colors.primaryPressed,
  },

  detailButtonText: {
    color: colors.white,
    fontFamily: fonts.semiBold,
    fontSize: 13,
  },

  secondaryActionButton: {
    width: 43,
    height: 43,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E4B29F',
    borderRadius: 15,
    backgroundColor: '#FFF9F6',
  },

  list: {
    flex: 1,
  },

  restaurantList: {
    paddingHorizontal: 13,
    paddingBottom: 24,
  },

  restaurantRow: {
    minHeight: 83,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    marginBottom: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#F0E7E1',
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
  },

  restaurantRowSelected: {
    borderColor: '#E5AA96',
    backgroundColor: '#FFF8F4',
  },

  restaurantThumbnail: {
    width: 55,
    height: 55,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 17,
  },

  restaurantCopy: {
    flex: 1,
  },

  restaurantName: {
    color: colors.text,
    fontFamily: fonts.semiBold,
    fontSize: 15,
    lineHeight: 20,
  },

  restaurantMeta: {
    marginTop: 2,
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 10.5,
    lineHeight: 15,
  },

  restaurantFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },

  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },

  statusBadgeText: {
    fontFamily: fonts.semiBold,
    fontSize: 9.5,
  },

  restaurantDistance: {
    color: colors.muted,
    fontFamily: fonts.medium,
    fontSize: 10,
  },

  rowFavoriteButton: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 19,
  },

  rowFavoriteButtonPressed: {
    backgroundColor: palette.primarySoft,
  },

  state: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
    paddingBottom: 24,
  },

  stateIcon: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    borderRadius: 25,
    backgroundColor: palette.primarySoft,
  },

  stateTitle: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 16,
    textAlign: 'center',
  },

  stateText: {
    maxWidth: 285,
    marginTop: 7,
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
  },

  retryButton: {
    minHeight: 42,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
    paddingHorizontal: 18,
    borderRadius: 15,
    backgroundColor: palette.primarySoft,
  },

  retryButtonText: {
    color: colors.primary,
    fontFamily: fonts.semiBold,
    fontSize: 12,
  },

  emptyList: {
    flexGrow: 1,
  },

  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(43, 36, 33, 0.38)',
  },

  modalContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    backgroundColor: palette.appBackground,
  },

  modalHandle: {
    width: 46,
    height: 5,
    alignSelf: 'center',
    marginBottom: 18,
    borderRadius: 3,
    backgroundColor: '#D8D0CB',
  },

  modalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 14,
  },

  modalTitle: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 24,
    lineHeight: 30,
    letterSpacing: -0.5,
  },

  modalSubtitle: {
    marginTop: 3,
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 12.5,
    lineHeight: 18,
  },

  modalCloseButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 18,
    backgroundColor: palette.surface,
  },

  modalBody: {
    gap: 25,
    marginTop: 25,
  },

  modalSection: {
    gap: 12,
  },

  modalLabel: {
    color: colors.text,
    fontFamily: fonts.semiBold,
    fontSize: 16,
  },

  modalOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 9,
  },

  modalOption: {
    minHeight: 41,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 21,
    backgroundColor: palette.surface,
  },

  modalOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },

  modalOptionText: {
    color: colors.muted,
    fontFamily: fonts.medium,
    fontSize: 11.5,
  },

  modalOptionTextSelected: {
    color: colors.white,
    fontFamily: fonts.semiBold,
  },

  locationWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    padding: 13,
    borderWidth: 1,
    borderColor: '#EBC7BA',
    borderRadius: 16,
    backgroundColor: '#FFF1EC',
  },

  locationWarningText: {
    flex: 1,
    color: colors.primary,
    fontFamily: fonts.medium,
    fontSize: 11.5,
    lineHeight: 17,
  },

  modalFooter: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 28,
  },

  modalResetButton: {
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 17,
    backgroundColor: palette.surface,
  },

  modalResetText: {
    color: colors.text,
    fontFamily: fonts.semiBold,
    fontSize: 12.5,
  },

  applyButton: {
    minHeight: 50,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderRadius: 17,
    backgroundColor: colors.primary,
  },

  applyButtonPressed: {
    backgroundColor: colors.primaryPressed,
  },

  applyButtonText: {
    color: colors.white,
    fontFamily: fonts.semiBold,
    fontSize: 13,
  },

  pressed: {
    opacity: 0.72,
  },
});
