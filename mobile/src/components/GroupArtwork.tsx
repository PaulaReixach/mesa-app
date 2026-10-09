import { useState } from 'react';
import { Image, Text, View, useWindowDimensions } from 'react-native';
import { resolveApiUrl } from '../lib/api';
import { groupListStyles as styles } from './GroupList.styles';

export function GroupArtwork({ imageUrl, name }: { imageUrl: string | null; name: string }) {
  const uri = imageUrl ? resolveApiUrl(imageUrl) : null;
  const [failedUri, setFailedUri] = useState<string | null>(null);
  const { width, fontScale } = useWindowDimensions();
  return (
    <View accessible={false} importantForAccessibility="no-hide-descendants"
      style={[styles.artwork, (width < 360 || fontScale > 1.3) && styles.smallArtwork]}>
      {uri && failedUri !== uri
        ? <Image source={{ uri }} onError={() => setFailedUri(uri)} style={styles.image} />
        : <Text allowFontScaling={false} style={styles.initial}>{name.charAt(0).toUpperCase()}</Text>}
    </View>
  );
}
