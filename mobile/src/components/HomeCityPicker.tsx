import { BottomSheet, Column, Host, List, ListItem, Text } from '@expo/ui';

import { fonts, useTheme } from '../theme';

/** Native bottom sheet to choose the city for "Un sitio para hoy" (DESIGN.md › Components › Patrones nativos). */
export function HomeCityPicker({ isPresented, cities, selectedCity, placeCounts, onSelect, onDismiss }: {
  isPresented: boolean;
  cities: string[];
  selectedCity: string | null;
  placeCounts: Record<string, number>;
  onSelect: (city: string) => void;
  onDismiss: () => void;
}) {
  const { colors, scheme } = useTheme();

  return (
    <Host matchContents colorScheme={scheme}>
      <BottomSheet isPresented={isPresented} onDismiss={onDismiss} showDragIndicator>
        <Column spacing={8} style={{ paddingTop: 8 }}>
          <Text style={{ paddingHorizontal: 22 }}
            textStyle={{ fontFamily: fonts.semiBold, fontSize: 18, color: colors.textPrimary }}>
            ¿Dónde nos sentamos hoy?
          </Text>
          <List>
            {cities.map(city => {
              const count = placeCounts[city] ?? 0;
              const places = `${count} ${count === 1 ? 'sitio guardado' : 'sitios guardados'}`;
              return (
                <ListItem key={city} onPress={() => onSelect(city)}
                  supportingText={city === selectedCity ? `${places} · Seleccionada` : places}>
                  <Text textStyle={{
                    fontFamily: city === selectedCity ? fonts.semiBold : fonts.regular,
                    fontSize: 16,
                    color: city === selectedCity ? colors.secondary : colors.textPrimary,
                  }}>
                    {city}
                  </Text>
                </ListItem>
              );
            })}
          </List>
        </Column>
      </BottomSheet>
    </Host>
  );
}
