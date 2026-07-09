import { StyleSheet } from 'react-native';

import { colors } from '../theme/colors';

export const addHubScreenStyles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FBF6F3' },
  content: {
    flexGrow: 1,
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 20,
    backgroundColor: '#FBF6F3',
  },
  header: {
    minHeight: 58,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  closeButton: {
    position: 'absolute', left: 0, width: 48, height: 48,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1,
    borderColor: '#E8DED7', borderRadius: 24, backgroundColor: '#FFFDFC',
  },
  closeButtonCompact: { width: 44, height: 44, borderRadius: 22 },
  title: {
    color: '#171412', fontSize: 21, fontWeight: '700', letterSpacing: -0.35,
  },
  titleCompact: { fontSize: 20 },
  actions: { gap: 12 },
  actionsCompact: { gap: 10 },
  tipSlot: { marginTop: 16 },
  tipCard: {
    minHeight: 86, flexDirection: 'row', alignItems: 'stretch', overflow: 'hidden',
    borderWidth: 1, borderColor: '#EADFD6', borderRadius: 19, backgroundColor: '#FAF2E9',
  },
  tipCardCompact: { minHeight: 78, borderRadius: 18 },
  tipCopyRow: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingLeft: 14, paddingVertical: 10, zIndex: 2,
  },
  tipIcon: {
    width: 42, height: 42, alignItems: 'center', justifyContent: 'center',
    borderRadius: 21, backgroundColor: '#FBE8CF',
  },
  tipIconCompact: { width: 38, height: 38, borderRadius: 19 },
  tipText: {
    flex: 1, color: '#625C58', fontSize: 15, fontWeight: '400', lineHeight: 21,
  },
  tipTextCompact: { fontSize: 14, lineHeight: 20 },
  tipStrong: { color: colors.primary, fontWeight: '700' },
  illustration: {
    width: 176, alignItems: 'flex-end', justifyContent: 'flex-end', overflow: 'hidden',
  },
  illustrationCompact: { width: 152 },
  illustrationImage: { width: 176, height: 92 },
  illustrationImageCompact: { width: 152, height: 82 },
  pressed: { opacity: 0.74 },
});
