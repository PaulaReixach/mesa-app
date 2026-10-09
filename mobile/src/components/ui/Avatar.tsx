import { Image } from 'expo-image';
import { useState } from 'react';
import { View } from 'react-native';

import { AppText } from './AppText';
import { fonts, useTheme } from '../../theme';

/** Decorative avatar: photo, or the initial in olive on sage (never "?"). Callers provide the label. */
export function Avatar({ name, uri, size = 32, ringColor }: {
  name: string;
  uri: string | null;
  size?: number;
  /** Border matching the surface behind, used when avatars overlap. */
  ringColor?: string;
}) {
  const { colors } = useTheme();
  const [failedUri, setFailedUri] = useState<string | null>(null);
  const showImage = uri !== null && failedUri !== uri;
  const initial = name.trim().charAt(0).toUpperCase();

  return (
    <View accessible={false} importantForAccessibility="no-hide-descendants"
      style={[{
        width: size, height: size, borderRadius: size / 2, overflow: 'hidden', alignItems: 'center',
        justifyContent: 'center', backgroundColor: colors.secondarySoft,
      }, ringColor ? { borderWidth: 2, borderColor: ringColor } : null]}>
      {showImage ? (
        <Image source={{ uri }} onError={() => setFailedUri(uri)} style={{ width: '100%', height: '100%' }}
          contentFit="cover" />
      ) : (
        <AppText maxFontSizeMultiplier={1.2}
          style={{ color: colors.onSecondarySoft, fontFamily: fonts.semiBold, fontSize: Math.round(size * 0.4) }}>
          {initial || '·'}
        </AppText>
      )}
    </View>
  );
}

/** Up to 3 overlapping avatars plus a "+N" counter. */
export function AvatarStack({ people, size = 28, max = 3, ringColor, resolveUri }: {
  people: { id: string; name: string; avatarUrl: string | null }[];
  size?: number;
  max?: number;
  ringColor: string;
  resolveUri: (url: string) => string;
}) {
  const { colors } = useTheme();
  if (people.length === 0) return null;
  const visible = people.slice(0, max);
  const extra = people.length - visible.length;
  const overlap = { marginLeft: -7 };

  return (
    <View accessible accessibilityLabel={`${people.length} ${people.length === 1 ? 'miembro' : 'miembros'}`}
      style={{ flexDirection: 'row', alignItems: 'center' }}>
      {visible.map((person, index) => (
        <View key={person.id} style={index > 0 ? overlap : undefined}>
          <Avatar name={person.name} uri={person.avatarUrl ? resolveUri(person.avatarUrl) : null} size={size}
            ringColor={ringColor} />
        </View>
      ))}
      {extra > 0 && (
        <View style={[overlap, {
          width: size, height: size, borderRadius: size / 2, borderWidth: 2, borderColor: ringColor,
          alignItems: 'center', justifyContent: 'center', backgroundColor: colors.secondarySoft,
        }]}>
          <AppText variant="label" tone="olive" maxFontSizeMultiplier={1.2}>+{extra}</AppText>
        </View>
      )}
    </View>
  );
}
