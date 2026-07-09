import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SymbolView } from 'expo-symbols';
import { router } from 'expo-router';
import {
  Image,
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { addHubBannerImage } from '../../assets/AddHubBannerImage';
import { addHubActionStyles as actionStyles } from '../../components/AddHubActionCard.styles';
import { addHubScreenStyles as styles } from '../../components/AddHubScreen.styles';
import { colors } from '../../theme/colors';

type ActionIconName = keyof typeof MaterialCommunityIcons.glyphMap;

type ActionCardProps = {
  compact: boolean;
  iconBackgroundColor: string;
  iconColor: string;
  iconName: ActionIconName;
  onPress: () => void;
  subtitle: string;
  title: string;
};

function ActionCard({
  compact,
  iconBackgroundColor,
  iconColor,
  iconName,
  onPress,
  subtitle,
  title,
}: ActionCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        actionStyles.card,
        compact ? actionStyles.cardCompact : null,
        pressed ? actionStyles.cardPressed : null,
      ]}
    >
      <View
        style={[
          actionStyles.iconCircle,
          { backgroundColor: iconBackgroundColor },
          compact ? actionStyles.iconCircleCompact : null,
        ]}
      >
        <MaterialCommunityIcons
          color={iconColor}
          name={iconName}
          size={compact ? 34 : 37}
        />
      </View>

      <View style={actionStyles.copy}>
        <Text
          allowFontScaling={false}
          numberOfLines={1}
          style={[
            actionStyles.title,
            compact ? actionStyles.titleCompact : null,
          ]}
        >
          {title}
        </Text>
        <Text
          allowFontScaling={false}
          numberOfLines={2}
          style={[
            actionStyles.subtitle,
            compact ? actionStyles.subtitleCompact : null,
          ]}
        >
          {subtitle}
        </Text>
      </View>

      <SymbolView
        name={{
          ios: 'chevron.right',
          android: 'chevron_right',
          web: 'chevron_right',
        }}
        size={compact ? 18 : 20}
        tintColor="#77716D"
      />
    </Pressable>
  );
}

function TipCard({ compact }: { compact: boolean }) {
  return (
    <View
      style={[
        styles.tipCard,
        compact ? styles.tipCardCompact : null,
      ]}
    >
      <View style={styles.tipCopyRow}>
        <View
          style={[
            styles.tipIcon,
            compact ? styles.tipIconCompact : null,
          ]}
        >
          <MaterialCommunityIcons
            color="#D9892C"
            name="lightbulb-on-outline"
            size={compact ? 22 : 24}
          />
        </View>

        <Text
          allowFontScaling={false}
          style={[
            styles.tipText,
            compact ? styles.tipTextCompact : null,
          ]}
        >
          <Text style={styles.tipStrong}>Consejo: </Text>
          guarda tus favoritos en grupos temáticos
        </Text>
      </View>

      <View
        pointerEvents="none"
        style={[
          styles.illustration,
          compact ? styles.illustrationCompact : null,
        ]}
      >
        <Image
          resizeMode="contain"
          source={addHubBannerImage}
          style={[
            styles.illustrationImage,
            compact ? styles.illustrationImageCompact : null,
          ]}
        />
      </View>
    </View>
  );
}

export default function AddScreen() {
  const { height } = useWindowDimensions();
  const compact = height < 820;

  function chooseGroup(addMode: 'SEARCH' | 'MANUAL'): void {
    router.push({
      pathname: '/groups',
      params: { addMode },
    });
  }

  return (
    <SafeAreaView
      edges={['top', 'right', 'left']}
      style={styles.safeArea}
    >
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
            style={({ pressed }) => [
              styles.closeButton,
              compact ? styles.closeButtonCompact : null,
              pressed ? styles.pressed : null,
            ]}
          >
            <SymbolView
              name={{ ios: 'xmark', android: 'close', web: 'close' }}
              size={compact ? 20 : 22}
              tintColor={colors.text}
            />
          </Pressable>

          <Text
            allowFontScaling={false}
            style={[
              styles.title,
              compact ? styles.titleCompact : null,
            ]}
          >
            ¿Qué quieres hacer?
          </Text>
        </View>

        <View
          style={[
            styles.actions,
            compact ? styles.actionsCompact : null,
          ]}
        >
          <ActionCard
            compact={compact}
            iconBackgroundColor="#FFF4EA"
            iconColor="#B94F38"
            iconName="magnify"
            onPress={() => chooseGroup('SEARCH')}
            subtitle="Busca y guárdalo en un grupo"
            title="Buscar restaurante"
          />
          <ActionCard
            compact={compact}
            iconBackgroundColor="#F2F6EC"
            iconColor="#5B743A"
            iconName="pencil-outline"
            onPress={() => chooseGroup('MANUAL')}
            subtitle="Añade un sitio que no encuentres"
            title="Añadir manualmente"
          />
          <ActionCard
            compact={compact}
            iconBackgroundColor="#FFF4EA"
            iconColor="#C85B3D"
            iconName="account-group-outline"
            onPress={() => router.push('/groups/create')}
            subtitle="Privado o público"
            title="Crear grupo"
          />
          <ActionCard
            compact={compact}
            iconBackgroundColor="#F2F6EC"
            iconColor="#5B743A"
            iconName="email-outline"
            onPress={() => router.push('/group-invitations')}
            subtitle="Revisa solicitudes y pendientes"
            title="Abrir invitaciones"
          />
        </View>

        <View style={styles.tipSlot}>
          <TipCard compact={compact} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
