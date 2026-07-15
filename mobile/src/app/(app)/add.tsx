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
  const isTerracotta = tone === 'terracotta';

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.featuredAction,
        pressed ? styles.pressed : null,
      ]}
    >
      <LinearGradient
        colors={isTerracotta
          ? ['#BE3A22', '#D34A29', '#C23B24']
          : ['#F4F3E9', '#F7F7EE', '#E9ECD9']}
        end={{ x: 1, y: 1 }}
        start={{ x: 0, y: 0 }}
        style={[
          styles.featuredActionSurface,
          isTerracotta
            ? styles.featuredActionTerracotta
            : styles.featuredActionOlive,
        ]}
      >
        {isTerracotta ? (
          <View pointerEvents="none" style={styles.featuredDecoration}>
            <View style={styles.featuredArcOuter} />
            <View style={styles.featuredArcInner} />
          </View>
        ) : null}

        <View
          style={[
            styles.featuredIcon,
            isTerracotta
              ? styles.featuredIconTerracotta
              : styles.featuredIconOlive,
          ]}
        >
          <SymbolView
            name={icon}
            size={32}
            tintColor={isTerracotta ? '#B83E27' : colors.olive}
          />
        </View>

        <View style={styles.featuredCopy}>
          <Text
            adjustsFontSizeToFit
            allowFontScaling={false}
            minimumFontScale={0.82}
            numberOfLines={1}
            style={[
              styles.featuredTitle,
              isTerracotta ? styles.featuredTitleLight : null,
            ]}
          >
            {title}
          </Text>
          <Text
            allowFontScaling={false}
            numberOfLines={2}
            style={[
              styles.featuredSubtitle,
              isTerracotta ? styles.featuredSubtitleLight : null,
            ]}
          >
            {subtitle}
          </Text>
        </View>

        <View
          style={[
            styles.featuredArrow,
            isTerracotta
              ? styles.featuredArrowTerracotta
              : styles.featuredArrowOlive,
          ]}
        >
          <SymbolView
            name={{ ios: 'arrow.right', android: 'arrow_forward', web: 'arrow_forward' }}
            size={22}
            tintColor={isTerracotta ? '#C34429' : colors.olive}
          />
        </View>
      </LinearGradient>
    </Pressable>
  );
}

function SecondaryAction({
  icon,
  onPress,
  subtitle,
  title,
  tone,
}: FeaturedActionProps) {
  const isOlive = tone === 'olive';

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.secondaryAction,
        pressed ? styles.pressed : null,
      ]}
    >
      <View
        style={[
          styles.secondaryIcon,
          isOlive ? styles.secondaryIconOlive : styles.secondaryIconTerracotta,
        ]}
      >
        <SymbolView
          name={icon}
          size={26}
          tintColor={isOlive ? colors.olive : '#C54B31'}
        />
      </View>

      <View style={styles.secondaryCopy}>
        <Text
          adjustsFontSizeToFit
          allowFontScaling={false}
          minimumFontScale={0.86}
          numberOfLines={1}
          style={styles.secondaryTitle}
        >
          {title}
        </Text>
        <Text
          allowFontScaling={false}
          numberOfLines={1}
          style={styles.secondarySubtitle}
        >
          {subtitle}
        </Text>
      </View>

      <SymbolView
        name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
        size={19}
        tintColor={colors.mutedStrong}
      />
    </Pressable>
  );
}

function AddHeader({ topInset }: { topInset: number }) {
  return (
    <LinearGradient
      colors={['#BC3B24', '#D1492B', '#C43C25']}
      end={{ x: 0.95, y: 1 }}
      start={{ x: 0.05, y: 0 }}
      style={[styles.header, { height: topInset + 206 }]}
    >
      <View style={[styles.headerTopRow, { marginTop: topInset + 20 }]}>
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
            size={27}
            tintColor={colors.white}
          />
        </Pressable>

        <Text allowFontScaling={false} style={styles.headerTitle}>
          Añadir
        </Text>

        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.heroCopy}>
        <Text allowFontScaling={false} style={styles.eyebrow}>
          UN SITIO PARA CADA PLAN
        </Text>
        <Text
          adjustsFontSizeToFit
          allowFontScaling={false}
          minimumFontScale={0.82}
          numberOfLines={1}
          style={styles.title}
        >
          ¿Qué quieres guardar?
        </Text>
        <Text
          allowFontScaling={false}
          numberOfLines={1}
          style={styles.subtitle}
        >
          Encuentra un restaurante o crea uno nuevo.
        </Text>
      </View>

      <Text
        allowFontScaling={false}
        pointerEvents="none"
        style={[styles.heroPlus, { top: topInset + 45 }]}
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
          <View style={styles.featuredList}>
            <FeaturedAction
              icon={{ ios: 'magnifyingglass', android: 'search', web: 'search' }}
              onPress={() => chooseGroup('SEARCH')}
              subtitle="Encuéntralo y guárdalo en uno de tus grupos"
              title="Buscar restaurante"
              tone="terracotta"
            />
            <FeaturedAction
              icon={{ ios: 'pencil', android: 'edit', web: 'edit' }}
              onPress={() => chooseGroup('MANUAL')}
              subtitle="Para ese sitio que todavía no aparece"
              title="Añadir manualmente"
              tone="olive"
            />
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeading}>
              <Text allowFontScaling={false} style={styles.sectionTitle}>
                Organiza tu espacio
              </Text>
              <Text allowFontScaling={false} style={styles.sectionCaption}>
                Grupos e invitaciones
              </Text>
            </View>

            <View style={styles.secondaryList}>
              <SecondaryAction
                icon={{ ios: 'person.2.fill', android: 'group_add', web: 'group_add' }}
                onPress={() => router.push('/groups/create')}
                subtitle="Organiza una lista con los tuyos"
                title="Crear un grupo"
                tone="terracotta"
              />
              <SecondaryAction
                icon={{ ios: 'envelope.fill', android: 'mail', web: 'mail' }}
                onPress={() => router.push('/group-invitations')}
                subtitle="Revisa invitaciones y solicitudes"
                title="Gestionar invitaciones"
                tone="olive"
              />
            </View>
          </View>

          <LinearGradient
            colors={['#FFF5E5', '#FCE8CB', '#FFF2DE']}
            end={{ x: 1, y: 0.8 }}
            start={{ x: 0, y: 0 }}
            style={styles.tipCard}
          >
            <View style={styles.tipIcon}>
              <SymbolView
                name={{ ios: 'lightbulb', android: 'lightbulb', web: 'lightbulb' }}
                size={25}
                tintColor={colors.amber}
              />
            </View>
            <View style={styles.tipCopy}>
              <Text allowFontScaling={false} style={styles.tipTitle}>
                Ponle intención a tus listas
              </Text>
              <Text allowFontScaling={false} style={styles.tipText}>
                “Cenas en Girona”, “Japón 2026” o “Brunch pendiente”.
              </Text>
            </View>
          </LinearGradient>
        </View>
      </ScrollView>
    </View>
  );
}
