import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import { router } from 'expo-router';
import {
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { addHubBannerImage } from '../../assets/AddHubBannerImage';
import { addHubIconImages } from '../../assets/AddHubIconImages';
import { addHubActionStyles as actionStyles } from '../../components/AddHubActionCard.styles';
import { addHubScreenStyles as styles } from '../../components/AddHubScreen.styles';
import { colors } from '../../theme/colors';

type AddHubImageSource = { uri: string };

type ActionCardProps = {
  compact: boolean;
  imageSource: AddHubImageSource;
  onPress: () => void;
  subtitle: string;
  title: string;
};

function ActionCard({
  compact,
  imageSource,
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
      <View style={[
        actionStyles.iconCircle,
        compact ? actionStyles.iconCircleCompact : null,
      ]}>
        <Image
          contentFit="contain"
          source={imageSource}
          style={actionStyles.iconImage}
        />
      </View>

      <View style={actionStyles.copy}>
        <Text
          numberOfLines={1}
          style={[
            actionStyles.title,
            compact ? actionStyles.titleCompact : null,
          ]}
        >
          {title}
        </Text>
        <Text
          numberOfLines={1}
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
    <View style={[
      styles.tipCard,
      compact ? styles.tipCardCompact : null,
    ]}>
      <View style={styles.tipCopyRow}>
        <View style={[
          styles.tipIcon,
          compact ? styles.tipIconCompact : null,
        ]}>
          <Image
            contentFit="contain"
            source={addHubIconImages.tip}
            style={styles.tipIconImage}
          />
        </View>
        <Text style={[
          styles.tipText,
          compact ? styles.tipTextCompact : null,
        ]}>
          <Text style={styles.tipStrong}>Consejo: </Text>
          guarda tus favoritos en grupos temáticos
        </Text>
      </View>

      <View style={[
        styles.illustration,
        compact ? styles.illustrationCompact : null,
      ]}>
        <Image
          contentFit="contain"
          contentPosition={{ right: 0, bottom: 0 }}
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
  const compact = height < 780;

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

          <Text style={[
            styles.title,
            compact ? styles.titleCompact : null,
          ]}>
            ¿Qué quieres hacer?
          </Text>
        </View>

        <View style={[
          styles.actions,
          compact ? styles.actionsCompact : null,
        ]}>
          <ActionCard
            compact={compact}
            imageSource={addHubIconImages.search}
            onPress={() => chooseGroup('SEARCH')}
            subtitle="Busca y guárdalo en un grupo"
            title="Buscar restaurante"
          />
          <ActionCard
            compact={compact}
            imageSource={addHubIconImages.manual}
            onPress={() => chooseGroup('MANUAL')}
            subtitle="Añade un sitio que no encuentres"
            title="Añadir manualmente"
          />
          <ActionCard
            compact={compact}
            imageSource={addHubIconImages.group}
            onPress={() => router.push('/groups/create')}
            subtitle="Privado o público"
            title="Crear grupo"
          />
          <ActionCard
            compact={compact}
            imageSource={addHubIconImages.invitations}
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
