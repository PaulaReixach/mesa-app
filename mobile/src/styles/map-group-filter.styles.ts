import { StyleSheet } from 'react-native';

import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';

export const groupFilterStyles = StyleSheet.create({
  constrainedChipLabel: {
    maxWidth: 72,
  },
  modalContent: {
    maxHeight: '82%',
  },
  searchBar: {
    height: 46,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 18,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#E9DDD6',
    borderRadius: 16,
    backgroundColor: '#FFFEFC',
  },
  searchInput: {
    flex: 1,
    height: 44,
    paddingVertical: 0,
    color: colors.text,
    fontFamily: fonts.regular,
    fontSize: 13,
  },
  allGroupsRow: {
    marginTop: 16,
  },
  list: {
    maxHeight: 390,
    marginTop: 8,
  },
  listContent: {
    gap: 8,
    paddingBottom: 4,
  },
  groupRow: {
    minHeight: 66,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E9DDD6',
    borderRadius: 17,
    backgroundColor: '#FFFEFC',
  },
  groupRowSelected: {
    borderColor: '#D9896C',
    backgroundColor: '#FFF5F0',
  },
  groupRowPressed: {
    opacity: 0.72,
  },
  groupIcon: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: 14,
    backgroundColor: '#EDF1E7',
  },
  groupIconSelected: {
    borderWidth: 1.5,
    borderColor: '#D9896C',
    backgroundColor: '#FBE3D9',
  },
  groupImage: {
    width: '100%',
    height: '100%',
  },
  groupCopy: {
    flex: 1,
    minWidth: 0,
  },
  groupName: {
    color: colors.text,
    fontFamily: fonts.semiBold,
    fontSize: 13,
    lineHeight: 18,
  },
  groupMeta: {
    marginTop: 2,
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 10,
    lineHeight: 14,
  },
  check: {
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 13,
    backgroundColor: '#FBE3D9',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 34,
  },
  emptyIcon: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    borderRadius: 24,
    backgroundColor: '#FBE9E2',
  },
  emptyTitle: {
    color: colors.text,
    fontFamily: fonts.semiBold,
    fontSize: 14,
    textAlign: 'center',
  },
  emptyText: {
    maxWidth: 260,
    marginTop: 5,
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 11,
    lineHeight: 16,
    textAlign: 'center',
  },
});
