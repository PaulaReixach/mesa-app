import { Image } from 'expo-image';
import { router } from 'expo-router';
import { View } from 'react-native';

import { AppText } from './ui/AppText';
import { Button } from './ui/Button';
import { createThemedStyles, fonts, radius, space } from '../theme';

const firstTablePhoto = require('../../assets/images/home-first-table.webp');

const steps = [
  { title: 'Reúne a tu gente', text: 'Crea un grupo e invita a tus amigos.' },
  { title: 'Guardad los sitios que os gustan', text: 'Vuestros favoritos, en una misma lista.' },
  { title: 'Compartid cómo fue', text: 'Opiniones para decidir dónde volver.' },
];

/** First-use Home (prototype `emptyHome`): photo card with one action and three steps. */
export function HomeFirstTable() {
  const styles = useStyles();

  return (
    <View style={styles.wrapper}>
      <View style={styles.card}>
        <Image source={firstTablePhoto} contentFit="cover" contentPosition={{ left: '64%', top: '42%' }}
          accessibilityLabel="Amigos compartiendo una comida en un restaurante" style={styles.photo} />
        <View style={styles.copy}>
          <AppText accessibilityRole="header" variant="emptyTitle">Un grupo para tu gente.</AppText>
          <AppText variant="body" tone="muted" style={styles.text}>
            Guardad restaurantes, compartid opiniones y elegid vuestro próximo plan.
          </AppText>
          <Button size="lg" title="Crear mi primer grupo" onPress={() => router.push('/groups/create')} />
        </View>
      </View>

      <View style={styles.steps}>
        <AppText accessibilityRole="header" variant="bodyStrong">Así empieza vuestra lista</AppText>
        {steps.map((step, index) => (
          <View key={step.title} style={[styles.step, index < steps.length - 1 && styles.stepSeparated]}>
            <AppText variant="label" tone="olive" style={styles.stepNumber}>{String(index + 1).padStart(2, '0')}</AppText>
            <View style={styles.stepCopy}>
              <AppText variant="body" style={styles.stepTitle}>{step.title}</AppText>
              <AppText variant="secondary" tone="muted">{step.text}</AppText>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const useStyles = createThemedStyles(({ colors }) => ({
  wrapper: { gap: 20 },
  card: {
    overflow: 'hidden',
    borderRadius: radius.xl - 2,
    borderCurve: 'continuous',
    backgroundColor: colors.surface,
  },
  photo: { width: '100%', height: 144 },
  copy: { paddingHorizontal: 20, paddingVertical: 18, gap: space.s2 },
  text: { marginBottom: space.s2 },
  steps: { gap: 0 },
  step: { flexDirection: 'row', alignItems: 'flex-start', gap: 13, paddingVertical: 9 },
  stepSeparated: { borderBottomWidth: 1, borderBottomColor: colors.separator },
  stepNumber: { width: 26, paddingTop: 3 },
  stepCopy: { flex: 1, gap: 3 },
  stepTitle: { fontFamily: fonts.medium },
}));
