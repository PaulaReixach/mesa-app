import { SymbolView } from 'expo-symbols';
import { router } from 'expo-router';
import {
  ComponentProps,
  ReactNode,
} from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors } from '../../theme/colors';

type SymbolName =
  ComponentProps<typeof SymbolView>['name'];

type ActionCardProps = {
  icon: SymbolName;
  title: string;
  description: string;
  onPress: () => void;
  trailing?: ReactNode;
};

function ActionCard({
  icon,
  title,
  description,
  onPress,
  trailing,
}: ActionCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.actionCard,
        pressed
          ? styles.actionCardPressed
          : null,
      ]}
    >
      <View style={styles.actionIcon}>
        <SymbolView
          name={icon}
          size={23}
          tintColor={colors.primary}
        />
      </View>

      <View style={styles.actionContent}>
        <Text style={styles.actionTitle}>
          {title}
        </Text>

        <Text style={styles.actionDescription}>
          {description}
        </Text>
      </View>

      {trailing ?? (
        <SymbolView
          name={{
            ios: 'chevron.right',
            android: 'chevron_right',
            web: 'chevron_right',
          }}
          size={19}
          tintColor={colors.muted}
        />
      )}
    </Pressable>
  );
}

export default function AddScreen() {
  function chooseGroup(
    addMode: 'SEARCH' | 'MANUAL',
  ): void {
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
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.navigationHeader}>
          <Pressable
            accessibilityLabel="Cerrar"
            accessibilityRole="button"
            hitSlop={8}
            onPress={() => {
              router.back();
            }}
            style={({ pressed }) => [
              styles.closeButton,
              pressed
                ? styles.closeButtonPressed
                : null,
            ]}
          >
            <SymbolView
              name={{
                ios: 'xmark',
                android: 'close',
                web: 'close',
              }}
              size={18}
              tintColor={colors.text}
            />
          </Pressable>

          <Text style={styles.navigationTitle}>
            Añadir
          </Text>

          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.header}>
          <Text style={styles.title}>
            ¿Qué quieres hacer?
          </Text>

          <Text style={styles.subtitle}>
            Elige cómo quieres ampliar tus planes en Mesa.
          </Text>
        </View>

        <View style={styles.actions}>
          <ActionCard
            description="Encuentra restaurantes cercanos y añádelos a uno de tus grupos."
            icon={{
              ios: 'magnifyingglass',
              android: 'search',
              web: 'search',
            }}
            onPress={() => {
              chooseGroup('SEARCH');
            }}
            title="Buscar restaurante"
          />

          <ActionCard
            description="Crea un restaurante que todavía no aparezca en Mesa."
            icon={{
              ios: 'square.and.pencil',
              android: 'edit',
              web: 'edit',
            }}
            onPress={() => {
              chooseGroup('MANUAL');
            }}
            title="Añadir manualmente"
          />

          <ActionCard
            description="Invita a tu gente y empezad a organizar restaurantes juntos."
            icon={{
              ios: 'person.2.badge.plus',
              android: 'group_add',
              web: 'group_add',
            }}
            onPress={() => {
              router.push('/groups/create');
            }}
            title="Crear grupo"
          />
        </View>

        <View style={styles.notice}>
          <View style={styles.noticeIcon}>
            <SymbolView
              name={{
                ios: 'info.circle',
                android: 'info',
                web: 'info',
              }}
              size={18}
              tintColor={colors.primary}
            />
          </View>

          <Text style={styles.noticeText}>
            Antes de guardar un restaurante elegirás el grupo donde quieres añadirlo.
          </Text>
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
    gap: 26,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 34,
  },

  navigationHeader: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  closeButton: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 19,
  },

  closeButtonPressed: {
    backgroundColor: '#F4E9E3',
  },

  navigationTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '900',
  },

  headerSpacer: {
    width: 38,
  },

  header: {
    gap: 7,
    paddingTop: 2,
  },

  title: {
    color: colors.text,
    fontSize: 23,
    fontWeight: '900',
    letterSpacing: -0.35,
  },

  subtitle: {
    maxWidth: 310,
    color: colors.muted,
    fontSize: 13,
    lineHeight: 19,
  },

  actions: {
    gap: 13,
  },

  actionCard: {
    minHeight: 98,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 15,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    backgroundColor: colors.surface,
    shadowColor: '#2B2421',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.035,
    shadowRadius: 6,
    elevation: 1,
  },

  actionCardPressed: {
    opacity: 0.72,
    transform: [
      {
        scale: 0.99,
      },
    ],
  },

  actionIcon: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 25,
    backgroundColor: '#FBE9E2',
  },

  actionContent: {
    flex: 1,
    gap: 5,
  },

  actionTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '900',
  },

  actionDescription: {
    color: colors.muted,
    fontSize: 11,
    lineHeight: 17,
  },

  notice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderRadius: 16,
    backgroundColor: '#FBEDE7',
  },

  noticeIcon: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
    backgroundColor: '#FFF8F3',
  },

  noticeText: {
    flex: 1,
    color: colors.muted,
    fontSize: 11,
    lineHeight: 17,
  },
});
