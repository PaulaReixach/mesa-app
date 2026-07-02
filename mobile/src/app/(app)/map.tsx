import { SymbolView } from 'expo-symbols';
import {
  router,
} from 'expo-router';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors } from '../../theme/colors';

const filters = [
  'Grupo',
  'Estado',
  'Tipo',
  'Distancia',
];

export default function MapScreen() {
  return (
    <SafeAreaView
      edges={['top', 'right', 'left']}
      style={styles.safeArea}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>
            Mapa
          </Text>

          <Pressable
            accessibilityLabel="Filtros del mapa"
            accessibilityRole="button"
            style={styles.filterButton}
          >
            <SymbolView
              name={{
                ios: 'slider.horizontal.3',
                android: 'tune',
                web: 'tune',
              }}
              size={22}
              tintColor={colors.text}
            />
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={styles.filters}
          horizontal
          showsHorizontalScrollIndicator={false}
        >
          {filters.map((filter) => (
            <View
              key={filter}
              style={styles.filterChip}
            >
              <Text style={styles.filterText}>
                {filter}
              </Text>

              <SymbolView
                name={{
                  ios: 'chevron.down',
                  android: 'keyboard_arrow_down',
                  web: 'keyboard_arrow_down',
                }}
                size={16}
                tintColor={colors.muted}
              />
            </View>
          ))}
        </ScrollView>

        <View style={styles.mapPlaceholder}>
          <View style={styles.pinBackground}>
            <SymbolView
              name={{
                ios: 'map.fill',
                android: 'map',
                web: 'map',
              }}
              size={48}
              tintColor={colors.primary}
            />
          </View>

          <Text style={styles.placeholderTitle}>
            Tus restaurantes en el mapa
          </Text>

          <Text style={styles.placeholderText}>
            Aquí aparecerán todos los restaurantes guardados
            que tengan una ubicación disponible.
          </Text>

          <Pressable
            accessibilityRole="button"
            onPress={() => {
              router.push('/groups');
            }}
            style={({ pressed }) => [
              styles.groupsButton,
              pressed
                ? styles.groupsButtonPressed
                : null,
            ]}
          >
            <Text style={styles.groupsButtonText}>
              Ver mis grupos
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flexGrow: 1,
    gap: 20,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 34,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    color: colors.text,
    fontSize: 30,
    fontWeight: '800',
  },
  filterButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 15,
    backgroundColor: colors.surface,
  },
  filters: {
    gap: 8,
  },
  filterChip: {
    minHeight: 38,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 19,
    backgroundColor: colors.surface,
    paddingHorizontal: 13,
  },
  filterText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
  },
  mapPlaceholder: {
    flex: 1,
    minHeight: 460,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 28,
    backgroundColor: '#F4ECE4',
    padding: 28,
  },
  pinBackground: {
    width: 90,
    height: 90,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 30,
    backgroundColor: '#FBE0D6',
  },
  placeholderTitle: {
    color: colors.text,
    fontSize: 21,
    fontWeight: '800',
    textAlign: 'center',
  },
  placeholderText: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
  },
  groupsButton: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 7,
    borderRadius: 24,
    backgroundColor: colors.primary,
    paddingHorizontal: 25,
  },
  groupsButtonPressed: {
    backgroundColor: colors.primaryPressed,
  },
  groupsButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
});