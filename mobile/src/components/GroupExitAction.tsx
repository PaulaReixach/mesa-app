import { SymbolView } from 'expo-symbols';
import {
  Pressable,
  StyleSheet,
  Text,
} from 'react-native';

import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';

type Props = {
  label: string;
  loading?: boolean;
  onPress: () => void;
};

export function GroupExitAction({
  label,
  loading = false,
  onPress,
}: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        pressed ? styles.pressed : null,
        loading ? styles.disabled : null,
      ]}
    >
      <SymbolView
        name={{
          ios: 'rectangle.portrait.and.arrow.right',
          android: 'logout',
          web: 'logout',
        }}
        size={17}
        tintColor={colors.danger}
      />
      <Text style={styles.text}>
        {loading ? 'Saliendo...' : label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#E7B8B0',
    borderRadius: 15,
    backgroundColor: '#FFF7F5',
  },
  text: {
    color: colors.danger,
    fontSize: 10,
    fontFamily: fonts.bold,
  },
  pressed: {
    opacity: 0.65,
  },
  disabled: {
    opacity: 0.55,
  },
});
