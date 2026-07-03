import { SymbolView } from 'expo-symbols';
import { router } from 'expo-router';
import {
  ComponentProps,
  useState,
} from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  SafeAreaView,
} from 'react-native-safe-area-context';

import { colors } from '../../theme/colors';

type SymbolName =
  ComponentProps<typeof SymbolView>['name'];

type HelpActionProps = {
  icon: SymbolName;
  title: string;
  subtitle: string;
  isLast?: boolean;
  onPress: () => void;
};

type FaqItemProps = {
  question: string;
  answer: string;
};

const faqs: FaqItemProps[] = [
  {
    question:
      '¿Cómo creo un grupo?',
    answer:
      'Entra en Grupos, pulsa el botón para crear uno nuevo y añade un nombre. La persona que crea el grupo se convierte en su propietaria.',
  },
  {
    question:
      '¿Cómo añado a otra persona?',
    answer:
      'Abre el grupo, entra en Miembros y escribe su nombre de usuario. La otra persona debe permitir invitaciones desde sus ajustes de privacidad.',
  },
  {
    question:
      '¿Cómo añado un restaurante?',
    answer:
      'Pulsa el botón central “+”, selecciona el grupo y completa los datos del restaurante. Después todos los miembros podrán verlo y actualizarlo.',
  },
  {
    question:
      '¿Puedo controlar las notificaciones?',
    answer:
      'Sí. Desde Perfil → Notificaciones puedes elegir qué avisos quieres recibir o desactivarlos todos.',
  },
  {
    question:
      '¿Quién puede ver mis datos?',
    answer:
      'Tu correo electrónico no se muestra a otros usuarios. Los miembros de tus grupos pueden ver tu nombre, usuario, foto y actividad dentro del grupo.',
  },
  {
    question:
      '¿Cómo elimino mi cuenta?',
    answer:
      'Entra en Perfil → Ajustes de cuenta → Eliminar cuenta. La eliminación es permanente y borra tus datos personales.',
  },
];

function HelpAction({
  icon,
  title,
  subtitle,
  isLast = false,
  onPress,
}: HelpActionProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.actionRow,

        !isLast
          ? styles.actionRowBorder
          : null,

        pressed
          ? styles.actionRowPressed
          : null,
      ]}
    >
      <View style={styles.actionIcon}>
        <SymbolView
          name={icon}
          size={19}
          tintColor={colors.text}
        />
      </View>

      <View style={styles.actionText}>
        <Text style={styles.actionTitle}>
          {title}
        </Text>

        <Text style={styles.actionSubtitle}>
          {subtitle}
        </Text>
      </View>

      <SymbolView
        name={{
          ios: 'chevron.right',
          android: 'chevron_right',
          web: 'chevron_right',
        }}
        size={17}
        tintColor={colors.muted}
      />
    </Pressable>
  );
}

function FaqItem({
  question,
  answer,
}: FaqItemProps) {
  const [
    expanded,
    setExpanded,
  ] = useState(false);

  return (
    <View style={styles.faqItem}>
      <Pressable
        accessibilityRole="button"
        onPress={() => {
          setExpanded(current => !current);
        }}
        style={({ pressed }) => [
          styles.faqHeader,

          pressed
            ? styles.faqHeaderPressed
            : null,
        ]}
      >
        <Text style={styles.faqQuestion}>
          {question}
        </Text>

        <SymbolView
          name={{
            ios: expanded
              ? 'chevron.up'
              : 'chevron.down',

            android: expanded
              ? 'keyboard_arrow_up'
              : 'keyboard_arrow_down',

            web: expanded
              ? 'keyboard_arrow_up'
              : 'keyboard_arrow_down',
          }}
          size={18}
          tintColor={colors.muted}
        />
      </Pressable>

      {expanded ? (
        <Text style={styles.faqAnswer}>
          {answer}
        </Text>
      ) : null}
    </View>
  );
}

export default function HelpSupportScreen() {
  return (
    <SafeAreaView
      edges={[
        'top',
        'right',
        'bottom',
        'left',
      ]}
      style={styles.safeArea}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Pressable
            accessibilityLabel="Volver"
            accessibilityRole="button"
            onPress={() => {
              router.back();
            }}
            style={({ pressed }) => [
              styles.headerButton,

              pressed
                ? styles.headerButtonPressed
                : null,
            ]}
          >
            <SymbolView
              name={{
                ios: 'chevron.left',
                android: 'arrow_back',
                web: 'arrow_back',
              }}
              size={20}
              tintColor={colors.text}
            />
          </Pressable>

          <Text style={styles.headerTitle}>
            Ayuda y soporte
          </Text>

          <View
            style={styles.headerPlaceholder}
          />
        </View>

        <View style={styles.intro}>
          <View style={styles.introIcon}>
            <SymbolView
              name={{
                ios: 'questionmark.circle.fill',
                android: 'help',
                web: 'help',
              }}
              size={29}
              tintColor={colors.primary}
            />
          </View>

          <Text style={styles.introTitle}>
            ¿En qué podemos ayudarte?
          </Text>

          <Text style={styles.introDescription}>
            Consulta las preguntas frecuentes o
            envíanos una solicitud si algo no
            funciona como debería.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Soporte
          </Text>

          <View style={styles.sectionContent}>
            <HelpAction
              icon={{
                ios: 'bubble.left.and.text.bubble.right',
                android: 'support_agent',
                web: 'support_agent',
              }}
              onPress={() => {
                router.push(
                  '/support-request',
                );
              }}
              subtitle="Describe el problema o envíanos una sugerencia."
              title="Contactar con soporte"
            />

            <HelpAction
              icon={{
                ios: 'lock',
                android: 'lock',
                web: 'lock',
              }}
              onPress={() => {
                router.push(
                  '/privacy-settings',
                );
              }}
              subtitle="Gestiona cómo pueden encontrarte y añadirte."
              title="Privacidad"
            />

            <HelpAction
              icon={{
                ios: 'gearshape',
                android: 'settings',
                web: 'settings',
              }}
              isLast
              onPress={() => {
                router.push(
                  '/account-settings',
                );
              }}
              subtitle="Contraseña, datos de acceso y eliminación de cuenta."
              title="Ajustes de cuenta"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Preguntas frecuentes
          </Text>

          <View style={styles.faqContainer}>
            {faqs.map(faq => (
              <FaqItem
                key={faq.question}
                answer={faq.answer}
                question={faq.question}
              />
            ))}
          </View>
        </View>

        <Text style={styles.footerText}>
          No encuentras la respuesta que buscas?
          Envía una solicitud y revisaremos tu caso.
        </Text>
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
    paddingHorizontal: 22,
    paddingTop: 8,
    paddingBottom: 40,
  },

  header: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 22,
  },

  headerButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
  },

  headerButtonPressed: {
    backgroundColor: '#F6EFE9',
  },

  headerPlaceholder: {
    width: 36,
    height: 36,
  },

  headerTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
  },

  intro: {
    alignItems: 'center',
    marginBottom: 34,
    paddingHorizontal: 16,
  },

  introIcon: {
    width: 68,
    height: 68,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    borderRadius: 34,
    backgroundColor: '#F7E8E2',
  },

  introTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
  },

  introDescription: {
    maxWidth: 320,
    marginTop: 7,
    color: colors.muted,
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
  },

  section: {
    marginBottom: 30,
  },

  sectionTitle: {
    marginBottom: 10,
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },

  sectionContent: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },

  actionRow: {
    minHeight: 76,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
  },

  actionRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  actionRowPressed: {
    backgroundColor: '#FBF6F2',
  },

  actionIcon: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 19,
    backgroundColor: '#F7EEE9',
  },

  actionText: {
    flex: 1,
    paddingVertical: 12,
  },

  actionTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },

  actionSubtitle: {
    marginTop: 4,
    color: colors.muted,
    fontSize: 12,
    lineHeight: 17,
  },

  faqContainer: {
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    backgroundColor: colors.surface,
  },

  faqItem: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  faqHeader: {
    minHeight: 62,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 13,
  },

  faqHeaderPressed: {
    backgroundColor: '#FBF6F2',
  },

  faqQuestion: {
    flex: 1,
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 19,
  },

  faqAnswer: {
    paddingHorizontal: 16,
    paddingBottom: 17,
    color: colors.muted,
    fontSize: 13,
    lineHeight: 20,
  },

  footerText: {
    marginTop: -4,
    paddingHorizontal: 24,
    color: colors.muted,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
  },
});