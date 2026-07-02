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
          size={25}
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
          size={20}
          tintColor={colors.muted}
        />
      )}
    </Pressable>
  );
}

export default function AddScreen() {
  function openGroups() {
    router.push('/groups');
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
        <View style={styles.header}>
          <Text style={styles.title}>
            Añadir
          </Text>

          <Text style={styles.subtitle}>
            ¿Qué quieres hacer?
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
            onPress={openGroups}
            title="Buscar restaurante"
          />

          <ActionCard
            description="Añade un restaurante que todavía no aparezca en la búsqueda."
            icon={{
              ios: 'square.and.pencil',
              android: 'edit',
              web: 'edit',
            }}
            onPress={openGroups}
            title="Añadir manualmente"
          />

          <ActionCard
            description="Crea un espacio para organizar restaurantes con otras personas."
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
          <SymbolView
            name={{
              ios: 'info.circle',
              android: 'info',
              web: 'info',
            }}
            size={20}
            tintColor={colors.primary}
          />

          <Text style={styles.noticeText}>
            Para añadir un restaurante tendrás que elegir
            primero el grupo donde quieres guardarlo.
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
    gap: 28,
    paddingHorizontal: 24,
    paddingTop: 26,
    paddingBottom: 34,
  },
  header: {
    gap: 7,
  },
  title: {
    color: colors.text,
    fontSize: 30,
    fontWeight: '800',
  },
  subtitle: {
    color: colors.muted,
    fontSize: 16,
  },
  actions: {
    gap: 13,
  },
  actionCard: {
    minHeight: 104,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 22,
    backgroundColor: colors.surface,
    padding: 17,
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
    width: 54,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: '#FBE9E2',
  },
  actionContent: {
    flex: 1,
    gap: 5,
  },
  actionTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  actionDescription: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 19,
  },
  notice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    borderRadius: 17,
    backgroundColor: '#FBE9E2',
    padding: 15,
  },
  noticeText: {
    flex: 1,
    color: colors.muted,
    fontSize: 13,
    lineHeight: 19,
  },
});