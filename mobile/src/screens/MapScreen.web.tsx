import { View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmptyState } from '../components/ui/EmptyState';
import { createThemedStyles, screenGutter } from '../theme';

/**
 * Web placeholder for the map. react-native-maps has no web implementation, and Expo
 * renders every route on web, so importing it would break the whole web build.
 */
export default function MapScreen() {
  const insets = useSafeAreaInsets();
  const styles = useStyles();
  const { width } = useWindowDimensions();

  return (
    <View style={[styles.screen, { paddingTop: insets.top, paddingHorizontal: screenGutter(width) }]}>
      <EmptyState icon={{ ios: 'map', android: 'map', web: 'map' }}
        title="El mapa está en la app"
        message="Abre Mesa en tu móvil para ver los sitios de tus grupos en el mapa." />
    </View>
  );
}

const useStyles = createThemedStyles(({ colors }) => ({
  screen: { flex: 1, backgroundColor: colors.background },
}));
