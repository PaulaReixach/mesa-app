import {
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { colors } from '../theme/colors';

type MesaLogoProps = {
  compact?: boolean;
};

export function MesaLogo({
  compact = false,
}: MesaLogoProps) {
  return (
    <View
      accessibilityLabel="Mesa"
      accessibilityRole="image"
      style={styles.container}
    >
      <View
        style={[
          styles.icon,
          compact ? styles.compactIcon : null,
        ]}
      >
        <Text
          style={[
            styles.iconLetter,
            compact ? styles.compactIconLetter : null,
          ]}
        >
          M
        </Text>
      </View>

      <Text
        style={[
          styles.wordmark,
          compact ? styles.compactWordmark : null,
        ]}
      >
        Mesa
      </Text>

      <View
        style={[
          styles.divider,
          compact ? styles.compactDivider : null,
        ]}
      />
    </View>
  );
}

const serifFont = Platform.select({
  ios: 'Georgia',
  android: 'serif',
  default: 'serif',
});

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  icon: {
    width: 82,
    height: 82,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 23,
    backgroundColor: colors.primary,

    shadowColor: '#7A3828',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.18,
    shadowRadius: 14,

    elevation: 7,
  },
  compactIcon: {
    width: 58,
    height: 58,
    borderRadius: 17,
  },
  iconLetter: {
    marginTop: -3,
    color: colors.background,
    fontFamily: serifFont,
    fontSize: 53,
    fontStyle: 'italic',
    fontWeight: '500',
    lineHeight: 62,
    transform: [
      {
        rotate: '-5deg',
      },
    ],
  },
  compactIconLetter: {
    fontSize: 37,
    lineHeight: 44,
  },
  wordmark: {
    marginTop: 24,
    color: colors.text,
    fontFamily: serifFont,
    fontSize: 63,
    fontWeight: '400',
    letterSpacing: -2.2,
    lineHeight: 72,
  },
  compactWordmark: {
    marginTop: 14,
    fontSize: 42,
    lineHeight: 49,
  },
  divider: {
    width: 54,
    height: 3,
    marginTop: 12,
    borderRadius: 999,
    backgroundColor: colors.primary,
  },
  compactDivider: {
    width: 38,
    height: 2,
    marginTop: 8,
  },
});