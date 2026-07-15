import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SymbolView } from 'expo-symbols';
import type { ComponentProps } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { addHubScreenStyles as styles } from '../../components/AddHubScreen.styles';
import { colors } from '../../theme/colors';

type SymbolName = ComponentProps<typeof SymbolView>['name'];
type ActionTone = 'neutral' | 'olive' | 'terracotta';

type ActionRowProps = {
  icon: SymbolName;
  onPress: () => void;
  subtitle: string;
  title: string;
  tone: ActionTone;
};

function ActionRow({
  icon,
  onPress,
  subtitle,
  title,
  tone,
}: ActionRowProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.actionRow,
        pressed ? styles.pressed : null,
      ]}
    >
      <View
        style={[
          styles.actionIcon,
          tone === 'olive' ? styles.actionIconOlive : null,
          tone === 'terracotta' ? styles.actionIconTerracotta : null,
          tone === 'neutral' ? styles.actionIconNeutral : null,
        ]}
      >
        <SymbolView
          name={icon}
          size={27}
          tintColor={tone === 'olive'
            ? colors.olive
            : tone === 'terracotta'
              ? '#C44A30'
              : colors.mutedStrong}
        />
      </View>

      <View style={styles.actionCopy}>
        <Text
          adjustsFontSizeToFit
          allowFontScaling={false}
          minimumFontScale={0.88}
          numberOfLines={1}
          style={styles.actionTitle}
        >
          {title}
        </Text>
        <Text
          adjustsFontSizeToFit
          allowFontScaling={false}
          minimumFontScale={0.78}
          numberOfLines={1}
          style={styles.actionSubtitle}
        >
          {subtitle}
        </Text>
      </View>

      <SymbolView
        name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
        size={20}
        tintColor={colors.mutedStrong}
      />
    </Pressable>
  );
}

function AddHeader({ topInset }: { topInset: number }) {
  return (
    <LinearGradient
      colors={['#BB3A23', '#D1492B', '#C43C25']}
      end={{ x: 0.95, y: 1 }}
      start={{ x: 0.05, y: 0 }}
      style={[styles.header, { height: topInset + 96 }]}
    >
      <View style={[styles.headerTopRow, { marginTop: topInset + 24 }]}>
        <Pressable
          accessibilityLabel="Cerrar"
          accessibilityRole="button"
          hitSlop={8}
          onPress={() => router.replace('/home')}
          style={({ pressed }) => [
            styles.closeButton,
            pressed ? styles.pressed : null,
          ]}
        >
          <SymbolView
            name={{ ios: 'xmark', android: 'close', web: 'close' }}
            size={28}
            tintColor={colors.white}
          />
        </Pressable>

        <Text allowFontScaling={false} style={styles.headerTitle}>
          Añadir
        </Text>

        <View style={styles.headerSpacer} />
      </View>

      <Text
        allowFontScaling={false}
        pointerEvents="none"
        style={[styles.heroPlus, { top: topInset + 17 }]}
      >
        +
      </Text>
      <Image
        accessibilityIgnoresInvertColors
        resizeMode="contain"
        source={require('../../../assets/images/add-header-table.png')}
        style={styles.headerIllustration}
      />
    </LinearGradient>
  );
}

export default function AddScreen() {
  const insets = useSafeAreaInsets();

  function chooseGroup(addMode: 'SEARCH' | 'MANUAL'): void {
    router.push({
      pathname: '/groups',
      params: { addMode },
    });
  }

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />

      <ScrollView
        bounces={false}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <AddHeader topInset={insets.top} />

        <View style={styles.body}>
          <View style={styles.intro}>
            <Text
              adjustsFontSizeToFit
              allowFontScaling={false}
              minimumFontScale={0.86}
              numberOfLines={1}
              style={styles.title}
            >
              ¿Qué quieres guardar?
            </Text>
            <Text
              adjustsFontSizeToFit
              allowFontScaling={false}
              minimumFontScale={0.88}
              numberOfLines={1}
              style={styles.subtitle}
            >
              Encuentra un restaurante o crea uno nuevo.
            </Text>
          </View>

          <View style={styles.searchSection}>
            <Text allowFontScaling={false} style={styles.sectionLabel}>
              BUSCAR RESTAURANTE
            </Text>

            <Pressable
              accessibilityLabel="Buscar restaurante"
              accessibilityRole="button"
              onPress={() => chooseGroup('SEARCH')}
              style={({ pressed }) => [
                styles.searchCard,
                pressed ? styles.pressed : null,
              ]}
            >
              <SymbolView
                name={{ ios: 'magnifyingglass', android: 'search', web: 'search' }}
                size={30}
                tintColor="#BD422C"
              />
              <Text
                adjustsFontSizeToFit
                allowFontScaling={false}
                minimumFontScale={0.82}
                numberOfLines={1}
                style={styles.searchPlaceholder}
              >
                Nombre, cocina o ubicación
              </Text>
              <View style={styles.searchArrow}>
                <SymbolView
                  name={{ ios: 'arrow.right', android: 'arrow_forward', web: 'arrow_forward' }}
                  size={24}
                  tintColor={colors.white}
                />
              </View>
            </Pressable>

            <Text allowFontScaling={false} style={styles.searchHelper}>
              Lo añadiremos al grupo que elijas.
            </Text>
          </View>

          <View style={styles.otherSection}>
            <Text allowFontScaling={false} style={styles.sectionLabel}>
              OTRAS FORMAS DE AÑADIR
            </Text>

            <View style={styles.groupedCard}>
              <ActionRow
                icon={{ ios: 'pencil', android: 'edit', web: 'edit' }}
                onPress={() => chooseGroup('MANUAL')}
                subtitle="Para sitios que aún no aparecen"
                title="Añadir manualmente"
                tone="olive"
              />
              <View style={styles.divider} />
              <ActionRow
                icon={{ ios: 'person.2.fill', android: 'group_add', web: 'group_add' }}
                onPress={() => router.push('/groups/create')}
                subtitle="Organiza una lista con los tuyos"
                title="Crear un grupo"
                tone="terracotta"
              />
            </View>
          </View>

          <View style={styles.spaceSection}>
            <Text allowFontScaling={false} style={styles.sectionLabel}>
              TU ESPACIO
            </Text>

            <View style={styles.singleCard}>
              <ActionRow
                icon={{ ios: 'envelope', android: 'mail', web: 'mail' }}
                onPress={() => router.push('/group-invitations')}
                subtitle="Revisa invitaciones y solicitudes"
                title="Gestionar invitaciones"
                tone="neutral"
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
