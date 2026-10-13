import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { AccessibilityInfo, ActivityIndicator, Pressable, View } from 'react-native';

import { AppText } from './ui/AppText';
import { StarIcon } from './ui/MesaIcons';
import type { SavedPlace } from '../lib/home-recommendation';
import { createThemedStyles, fonts, formatScore, space, useTheme } from '../theme';
import type { RestaurantRatingsSummary } from '../types/restaurant-rating';

const STARS = [1, 2, 3, 4, 5];

/** Tile with the restaurant's initial in its stable cover tone (restaurants have no photo). */
export function PlaceTile({ name, size, radius }: { name: string; size: number; radius: number }) {
  const { cover } = useTheme();
  const tone = cover[Array.from(name.trim() || 'mesa').reduce((sum, char) => sum + char.charCodeAt(0), 0) % cover.length];
  return (
    <View accessible={false} style={{
      width: size, height: size, borderRadius: radius, borderCurve: 'continuous',
      backgroundColor: tone.background, alignItems: 'center', justifyContent: 'center',
    }}>
      <AppText maxFontSizeMultiplier={1}
        style={{ fontFamily: fonts.display, fontSize: size * 0.36, letterSpacing: -0.5, color: tone.ink }}>
        {(name.trim().charAt(0) || '·').toUpperCase()}
      </AppText>
    </View>
  );
}

/** «Valorar después de ir»: a visited place the user has not rated yet, 5 stars of 48 and «Guardar». */
export function HomeRateCard({ place, summary, onSave, onDismiss }: {
  place: SavedPlace;
  summary: RestaurantRatingsSummary;
  onSave: (score: number) => Promise<void>;
  /** «×»: hides the card until the next time the app opens. */
  onDismiss: () => void;
}) {
  const styles = useStyles();
  const { colors } = useTheme();
  const [score, setScore] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [failed, setFailed] = useState(false);
  const name = place.restaurant.restaurant.name;
  const other = summary.ratings.find(rating => !rating.currentUser);

  const projected = score === null ? null
    : (summary.ratings.reduce((sum, rating) => sum + rating.score, 0) + score) / (summary.ratings.length + 1);
  const hint = failed ? 'No se ha podido guardar. Vuelve a intentarlo.'
    : score !== null && projected !== null
      ? other ? `${other.name.split(/\s+/)[0]} le dio un ${other.score}. La media quedaría en ${formatScore(projected)}`
        : 'Serás la primera valoración del grupo.'
      : other ? `${other.name.split(/\s+/)[0]} ya le ha dado un ${other.score}.` : 'Tu nota cuenta para la media del grupo.';

  const save = async () => {
    if (score === null || saving) return;
    setSaving(true);
    setFailed(false);
    try {
      await onSave(score);
      AccessibilityInfo.announceForAccessibility(`Valoración guardada: ${score} de 5`);
    } catch {
      setFailed(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.head}>
        <PlaceTile name={name} size={52} radius={14} />
        <View style={styles.headText}>
          <AppText accessibilityRole="header" style={styles.title} numberOfLines={2}>¿Qué tal en {name}?</AppText>
          <AppText style={styles.sub} numberOfLines={1}>Lo marcasteis como visitado en {place.group.name}</AppText>
        </View>
        <Pressable onPress={onDismiss} accessibilityRole="button" accessibilityLabel="Ahora no" hitSlop={8}
          style={styles.close}>
          <SymbolView name={{ ios: 'xmark', android: 'close', web: 'close' }} size={14} tintColor={colors.textSecondary} />
        </Pressable>
      </View>
      <View accessibilityRole="radiogroup" accessibilityLabel="Tu puntuación de 1 a 5" style={styles.stars}>
        {STARS.map(value => {
          const filled = score !== null && value <= score;
          return (
            <Pressable key={value} onPress={() => setScore(value)} accessibilityRole="radio"
              accessibilityLabel={`${value} de 5`} accessibilityState={{ checked: score === value }} style={styles.star}>
              <StarIcon size={32} filled={filled} color={filled ? colors.rating : colors.iconMuted} />
            </Pressable>
          );
        })}
      </View>
      <View style={styles.footer}>
        <AppText style={[styles.hint, failed && { color: colors.danger }]} accessibilityLiveRegion="polite">{hint}</AppText>
        <Pressable onPress={save} disabled={score === null || saving} accessibilityRole="button"
          accessibilityState={{ disabled: score === null || saving }}
          style={({ pressed }) => [styles.save, (score === null) && styles.saveDisabled, pressed && styles.pressed]}>
          {saving ? <ActivityIndicator color={colors.background} />
            : <AppText style={[styles.saveText, score === null && { color: colors.textSecondary }]}>Guardar</AppText>}
        </Pressable>
      </View>
    </View>
  );
}

const useStyles = createThemedStyles(({ colors }) => ({
  card: {
    padding: space.s4, borderRadius: 24, borderCurve: 'continuous', backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.border,
  },
  head: { flexDirection: 'row', alignItems: 'center', gap: space.s3 },
  close: {
    width: 32, height: 32, marginTop: -6, marginRight: -6, alignSelf: 'flex-start', borderRadius: 16,
    alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceSecondary,
  },
  headText: { flex: 1, minWidth: 0 },
  title: { fontFamily: fonts.display, fontSize: 16, lineHeight: 21, letterSpacing: -0.2, color: colors.textPrimary },
  sub: { marginTop: 2, fontFamily: fonts.regular, fontSize: 13, lineHeight: 18, color: colors.textSecondary },
  stars: { marginTop: 14, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 6 },
  star: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  footer: { marginTop: 10, flexDirection: 'row', alignItems: 'center', gap: space.s3 },
  hint: { flex: 1, fontFamily: fonts.medium, fontSize: 13, lineHeight: 18, color: colors.secondary },
  save: {
    height: 40, minWidth: 92, paddingHorizontal: space.s4, borderRadius: 20, alignItems: 'center',
    justifyContent: 'center', backgroundColor: colors.textPrimary,
  },
  saveDisabled: { backgroundColor: colors.accentDisabled },
  saveText: { fontFamily: fonts.semiBold, fontSize: 14, color: colors.background },
  pressed: { transform: [{ scale: 0.97 }] },
}));
