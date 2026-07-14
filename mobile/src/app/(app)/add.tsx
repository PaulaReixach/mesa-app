import { SymbolView } from 'expo-symbols';
import { router } from 'expo-router';
import type { ComponentProps } from 'react';
import {
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { addHubScreenStyles as styles } from '../../components/AddHubScreen.styles';
import { colors } from '../../theme/colors';

type SymbolName = ComponentProps<typeof SymbolView>['name'];
type ActionTone = 'olive' | 'terracotta';

type FeaturedActionProps = {
  icon: SymbolName;
  onPress: () => void;
  subtitle: string;
  title: string;
  tone: ActionTone;
};

function FeaturedAction({
  icon,
  onPress,
  subtitle,
  title,
  tone,
}: FeaturedActionProps) {
  const olive = tone === 'olive';

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.featuredAction,
        olive ? styles.featuredActionOlive : styles.featuredActionTerracotta,
        pressed ? styles.pressed : null,
      ]}
    >
      <View style={[styles.featuredIcon, olive ? styles.featuredIconOlive : null]}>
        <SymbolView
          name={icon}
          size={28}
          tintColor={olive ? colors.olive : colors.primary}
        />
      </View>

      <View style={styles.featuredCopy}>
        <Text style={styles.featuredTitle}>{title}</Text>
        <Text style={styles.featuredSubtitle}>{subtitle}</Text>
      </View>

      <View style={[styles.featuredArrow, olive ? styles.featuredArrowOlive : null]}>
        <SymbolView
          name={{ ios: 'arrow.up.right', android: 'arrow_outward', web: 'arrow_outward' }}
          size={17}
          tintColor={olive ? colors.olive : colors.primary}
        />
      </View>
    </Pressable>
  );
}

function SecondaryAction({
  icon,
  onPress,
  subtitle,
  title,
}: Omit<FeaturedActionProps, 'tone'>) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.secondaryAction, pressed ? styles.pressed : null]}
    >
      <View style={styles.secondaryIcon}>
        <SymbolView name={icon} size={21} tintColor={colors.primary} />
      </View>
      <View style={styles.secondaryCopy}>
        <Text style={styles.secondaryTitle}>{title}</Text>
        <Text style={styles.secondarySubtitle}>{subtitle}</Text>
      </View>
      <SymbolView
        name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
        size={18}
        tintColor={colors.muted}
      />
    </Pressable>
  );
}

export default function AddScreen() {
  function chooseGroup(addMode: 'SEARCH' | 'MANUAL'): void {
    router.push({
      pathname: '/groups',
      params: { addMode },
    });
  }

  return (
    <SafeAreaView edges={['top', 'right', 'left']} style={styles.safeArea}>
      <ScrollView
        bounces={false}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Pressable
            accessibilityLabel="Cerrar"
            accessibilityRole="button"
            onPress={() => router.replace('/home')}
            style={({ pressed }) => [styles.closeButton, pressed ? styles.pressed : null]}
          >
            <SymbolView
              name={{ ios: 'xmark', android: 'close', web: 'close' }}
              size={20}
              tintColor={colors.text}
            />
          </Pressable>
          <Text style={styles.headerTitle}>Añadir</Text>
          <View style={styles.closeButton} />
        </View>

        <View style={styles.hero}>
          <Text style={styles.eyebrow}>Un sitio para cada plan</Text>
          <Text style={styles.title}>¿Qué quieres guardar?</Text>
          <Text style={styles.subtitle}>
            Encuentra un restaurante, crea uno manualmente o empieza una lista nueva.
          </Text>
        </View>

        <View style={styles.featuredGrid}>
          <FeaturedAction
            icon={{ ios: 'magnifyingglass', android: 'search', web: 'search' }}
            onPress={() => chooseGroup('SEARCH')}
            subtitle="Encuéntralo y añádelo a un grupo"
            title="Buscar restaurante"
            tone="terracotta"
          />
          <FeaturedAction
            icon={{ ios: 'square.and.pencil', android: 'edit', web: 'edit' }}
            onPress={() => chooseGroup('MANUAL')}
            subtitle="Para ese sitio que todavía no aparece"
            title="Añadir manualmente"
            tone="olive"
          />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeading}>
            <Text style={styles.sectionTitle}>Organiza tu espacio</Text>
            <Text style={styles.sectionCaption}>Grupos e invitaciones</Text>
          </View>

          <View style={styles.secondaryList}>
            <SecondaryAction
              icon={{ ios: 'person.2.fill', android: 'group_add', web: 'group_add' }}
              onPress={() => router.push('/groups/create')}
              subtitle="Privado para los tuyos o público para compartir"
              title="Crear un grupo"
            />
            <SecondaryAction
              icon={{ ios: 'envelope.fill', android: 'mail', web: 'mail' }}
              onPress={() => router.push('/group-invitations')}
              subtitle="Revisa invitaciones y solicitudes pendientes"
              title="Gestionar invitaciones"
            />
          </View>
        </View>

        <View style={styles.tipCard}>
          <View style={styles.tipIcon}>
            <SymbolView
              name={{ ios: 'lightbulb.fill', android: 'lightbulb', web: 'lightbulb' }}
              size={21}
              tintColor={colors.amber}
            />
          </View>
          <View style={styles.tipCopy}>
            <Text style={styles.tipTitle}>Una lista funciona mejor con intención</Text>
            <Text style={styles.tipText}>
              Prueba nombres concretos: “Cenas en Girona”, “Japón 2026” o “Brunch pendiente”.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
