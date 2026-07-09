import { SymbolView } from 'expo-symbols';
import { router } from 'expo-router';
import type { ComponentProps } from 'react';
import {
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { addHubActionStyles as actionStyles } from '../../components/AddHubActionCard.styles';
import { addHubScreenStyles as styles } from '../../components/AddHubScreen.styles';
import { colors } from '../../theme/colors';

type SymbolName = ComponentProps<typeof SymbolView>['name'];

type ActionCardProps = {
  compact: boolean;
  icon: SymbolName;
  onPress: () => void;
  subtitle: string;
  title: string;
  tone: 'terracotta' | 'sage';
};

function ActionCard({
  compact,
  icon,
  onPress,
  subtitle,
  title,
  tone,
}: ActionCardProps) {
  const sage = tone === 'sage';

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
        sage
          ? actionStyles.iconCircleSage
          : actionStyles.iconCircleTerracotta,
      ]}>
        <SymbolView
          name={icon}
          size={compact ? 31 : 36}
          tintColor={sage ? '#678047' : colors.primary}
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
        size={compact ? 20 : 23}
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
          <SymbolView
            name={{
              ios: 'lightbulb.fill',
              android: 'lightbulb',
              web: 'lightbulb',
            }}
            size={compact ? 21 : 25}
            tintColor="#E29A2C"
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
        <View style={styles.sun} />
        <View style={styles.table} />
        <View style={styles.plate} />
        <View style={styles.plateFood} />

        <View style={styles.wineOne}>
          <SymbolView
            name={{ ios: 'wineglass', android: 'wine_bar', web: 'wine_bar' }}
            size={24}
            tintColor="#FFF3E7"
          />
        </View>
        <View style={styles.wineTwo}>
          <SymbolView
            name={{ ios: 'wineglass', android: 'wine_bar', web: 'wine_bar' }}
            size={19}
            tintColor="#FFF3E7"
          />
        </View>
        <View style={styles.leafOne}>
          <SymbolView
            name={{ ios: 'leaf.fill', android: 'eco', web: 'eco' }}
            size={30}
            tintColor="#6C874E"
          />
        </View>
        <View style={styles.leafTwo}>
          <SymbolView
            name={{ ios: 'leaf.fill', android: 'eco', web: 'eco' }}
            size={23}
            tintColor="#789557"
          />
        </View>
        <View style={styles.sparkle}>
          <SymbolView
            name={{ ios: 'sparkles', android: 'auto_awesome', web: 'auto_awesome' }}
            size={17}
            tintColor="#F3C766"
          />
        </View>
      </View>
    </View>
  );
}

export default function AddScreen() {
  const { height } = useWindowDimensions();
  const compact = height < 850;

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
              size={compact ? 22 : 25}
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
            icon={{ ios: 'magnifyingglass', android: 'search', web: 'search' }}
            onPress={() => chooseGroup('SEARCH')}
            subtitle="Busca y guárdalo en un grupo"
            title="Buscar restaurante"
            tone="terracotta"
          />
          <ActionCard
            compact={compact}
            icon={{ ios: 'pencil', android: 'edit', web: 'edit' }}
            onPress={() => chooseGroup('MANUAL')}
            subtitle="Añade un sitio que no encuentres"
            title="Añadir manualmente"
            tone="sage"
          />
          <ActionCard
            compact={compact}
            icon={{ ios: 'person.2.fill', android: 'group', web: 'group' }}
            onPress={() => router.push('/groups/create')}
            subtitle="Privado o público"
            title="Crear grupo"
            tone="terracotta"
          />
          <ActionCard
            compact={compact}
            icon={{ ios: 'envelope', android: 'mail', web: 'mail' }}
            onPress={() => router.push('/group-invitations')}
            subtitle="Revisa solicitudes y pendientes"
            title="Abrir invitaciones"
            tone="sage"
          />
        </View>

        <TipCard compact={compact} />
      </ScrollView>
    </SafeAreaView>
  );
}
