import { StyleSheet } from 'react-native';

import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';

const palette = {
  background: '#FBF6F3',
  border: '#E9DDD6',
  olive: '#62794D',
  primarySoft: '#FBE9E2',
  shadow: '#382D28',
  surface: '#FFFEFC',
  surfaceMuted: '#FFF9F6',
};

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: palette.background,
  },

  header: {
    zIndex: 3,
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 12,
    backgroundColor: palette.background,
  },

  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 14,
  },

  headerCopy: {
    flex: 1,
  },

  title: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: -0.7,
  },

  subtitle: {
    marginTop: 1,
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 12.5,
    lineHeight: 18,
  },

  filterButton: {
    position: 'relative',
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 21,
    backgroundColor: palette.surface,
    shadowColor: palette.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 7,
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
    height: 46,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 16,
    backgroundColor: palette.surface,
  },

  searchInput: {
    flex: 1,
    height: 44,
    paddingVertical: 0,
    color: colors.text,
    fontFamily: fonts.regular,
    fontSize: 13.5,
  },

  quickFilters: {
    marginTop: 10,
  },

  quickFiltersContent: {
    gap: 8,
    paddingRight: 4,
  },

  quickChip: {
    height: 34,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 13,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 17,
    backgroundColor: palette.surface,
  },

  quickChipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },

  quickChipText: {
    color: colors.text,
    fontFamily: fonts.medium,
    fontSize: 11.5,
  },

  quickChipTextActive: {
    color: colors.white,
    fontFamily: fonts.semiBold,
  },

  mapContainer: {
    flex: 1,
    minHeight: 0,
    overflow: 'hidden',
    backgroundColor: '#F1ECE4',
  },

  map: StyleSheet.absoluteFill,

  resultsPill: {
    position: 'absolute',
    top: 14,
    left: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: 'rgba(233, 221, 214, 0.95)',
    borderRadius: 16,
    backgroundColor: 'rgba(255, 254, 252, 0.94)',
    shadowColor: palette.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },

  resultsPillText: {
    color: colors.text,
    fontFamily: fonts.semiBold,
    fontSize: 10.5,
  },

  locationButton: {
    position: 'absolute',
    right: 14,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 22,
    backgroundColor: palette.surface,
    shadowColor: palette.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 5,
  },

  marker: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  markerBubble: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    borderColor: colors.white,
    borderRadius: 17,
    shadowColor: palette.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },

  markerBubbleSelected: {
    width: 42,
    height: 42,
    borderWidth: 4,
    borderColor: colors.white,
    borderRadius: 21,
    shadowOpacity: 0.28,
    shadowRadius: 7,
    elevation: 8,
  },

  markerPoint: {
    width: 0,
    height: 0,
    marginTop: -3,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },

  bottomSheet: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    left: 0,
    overflow: 'hidden',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: palette.surface,
    shadowColor: palette.shadow,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.13,
    shadowRadius: 13,
    elevation: 16,
  },

  dragZone: {
    paddingTop: 8,
    backgroundColor: palette.surface,
  },

  handle: {
    width: 38,
    height: 4,
    alignSelf: 'center',
    marginBottom: 8,
    borderRadius: 2,
    backgroundColor: '#D7CEC9',
  },

  collapsedHeader: {
    minHeight: 82,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 18,
    paddingBottom: 12,
  },

  collapsedCopy: {
    flex: 1,
  },

  collapsedTitle: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 17,
    lineHeight: 22,
  },

  collapsedSubtitle: {
    marginTop: 2,
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 11.5,
    lineHeight: 16,
  },

  listButton: {
    minWidth: 72,
    height: 34,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingHorizontal: 10,
    borderRadius: 17,
    backgroundColor: palette.primarySoft,
  },

  listButtonText: {
    color: colors.primary,
    fontFamily: fonts.semiBold,
    fontSize: 10.5,
  },

  selectedCard: {
    paddingHorizontal: 16,
    paddingBottom: 14,
  },

  selectedMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },

  selectedIcon: {
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
  },

  selectedCopy: {
    flex: 1,
  },

  selectedNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },

  selectedName: {
    flex: 1,
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 16,
    lineHeight: 21,
  },

  closeSelection: {
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 13,
    backgroundColor: '#F4EEEA',
  },

  selectedMeta: {
    marginTop: 2,
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 10.5,
    lineHeight: 15,
  },

  selectedStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: 5,
  },

  statusPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },

  statusPillText: {
    fontFamily: fonts.semiBold,
    fontSize: 9,
  },

  selectedDistance: {
    color: colors.muted,
    fontFamily: fonts.medium,
    fontSize: 10,
  },

  selectedActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 11,
  },

  primaryButton: {
    minHeight: 41,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: colors.primary,
  },

  primaryButtonText: {
    color: colors.white,
    fontFamily: fonts.semiBold,
    fontSize: 12,
  },

  iconButton: {
    width: 41,
    height: 41,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E7B8A8',
    borderRadius: 14,
    backgroundColor: palette.surfaceMuted,
  },

  list: {
    flex: 1,
  },

  listContent: {
    paddingHorizontal: 14,
    paddingBottom: 24,
  },

  restaurantRow: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 7,
    paddingHorizontal: 10,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: '#F0E7E1',
    borderRadius: 17,
    backgroundColor: colors.white,
  },

  restaurantRowSelected: {
    borderColor: '#E4AA95',
    backgroundColor: '#FFF7F3',
  },

  rowIcon: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 13,
  },

  rowCopy: {
    flex: 1,
  },

  rowName: {
    color: colors.text,
    fontFamily: fonts.semiBold,
    fontSize: 13.5,
    lineHeight: 18,
  },

  rowMeta: {
    marginTop: 1,
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 9.8,
    lineHeight: 14,
  },

  rowFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: 5,
  },

  rowDistance: {
    color: colors.muted,
    fontFamily: fonts.medium,
    fontSize: 9.5,
  },

  favoriteButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
  },

  state: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingBottom: 24,
  },

  stateIcon: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    borderRadius: 24,
    backgroundColor: palette.primarySoft,
  },

  stateTitle: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 15,
    textAlign: 'center',
  },

  stateText: {
    maxWidth: 285,
    marginTop: 6,
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 11.5,
    lineHeight: 17,
    textAlign: 'center',
  },

  retryButton: {
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 13,
    paddingHorizontal: 17,
    borderRadius: 14,
    backgroundColor: palette.primarySoft,
  },

  retryButtonText: {
    color: colors.primary,
    fontFamily: fonts.semiBold,
    fontSize: 11.5,
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
    maxHeight: '84%',
    paddingHorizontal: 20,
    paddingTop: 10,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: palette.background,
  },

  modalHandle: {
    width: 42,
    height: 4,
    alignSelf: 'center',
    marginBottom: 16,
    borderRadius: 2,
    backgroundColor: '#D7CEC9',
  },

  modalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },

  modalTitle: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: -0.45,
  },

  modalSubtitle: {
    marginTop: 2,
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 17,
  },

  modalClose: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 17,
    backgroundColor: palette.surface,
  },

  modalBody: {
    gap: 23,
    marginTop: 23,
  },

  modalSection: {
    gap: 11,
  },

  modalLabel: {
    color: colors.text,
    fontFamily: fonts.semiBold,
    fontSize: 15,
  },

  modalOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  modalOption: {
    minHeight: 39,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 20,
    backgroundColor: palette.surface,
  },

  modalOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },

  modalOptionText: {
    color: colors.muted,
    fontFamily: fonts.medium,
    fontSize: 11,
  },

  modalOptionTextSelected: {
    color: colors.white,
    fontFamily: fonts.semiBold,
  },

  locationWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    padding: 12,
    borderWidth: 1,
    borderColor: '#EBC7BA',
    borderRadius: 15,
    backgroundColor: '#FFF1EC',
  },

  locationWarningText: {
    flex: 1,
    color: colors.primary,
    fontFamily: fonts.medium,
    fontSize: 11,
    lineHeight: 16,
  },

  modalFooter: {
    flexDirection: 'row',
    gap: 9,
    marginTop: 26,
  },

  resetButton: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 17,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 16,
    backgroundColor: palette.surface,
  },

  resetButtonText: {
    color: colors.text,
    fontFamily: fonts.semiBold,
    fontSize: 12,
  },

  applyButton: {
    minHeight: 48,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: colors.primary,
  },

  applyButtonText: {
    color: colors.white,
    fontFamily: fonts.semiBold,
    fontSize: 12.5,
  },

  pressed: {
    opacity: 0.72,
  },
});
