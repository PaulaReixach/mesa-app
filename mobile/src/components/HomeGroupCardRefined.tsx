import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { ImageBackground, Pressable, Text, View } from 'react-native';

import { groupCardStyles as styles } from './HomeGroupCardRefined.styles';
import { homeFocusStyle } from './HomeDashboardStyles';
import { resolveApiUrl } from '../lib/api';
import { colors } from '../theme/colors';
import type { RestaurantGroup } from '../types/group';
import type { GroupMember } from '../types/group-member';

export function HomeGroupCardRefined({ group, members, onPress }: {
  group: RestaurantGroup; members: GroupMember[]; onPress: () => void;
}) {
  const imageUri = group.imageUrl ? resolveApiUrl(group.imageUrl) : null;
  const [failedImage, setFailedImage] = useState<string | null>(null);
  const [focused, setFocused] = useState(false);
  const privacy = group.privacy === 'PRIVATE' ? 'Privado' : 'Público';
  const memberLabel = members.length > 0 ? `, ${members.length} ${members.length === 1 ? 'miembro' : 'miembros'}` : '';

  return (
    <Pressable accessibilityLabel={`Abrir el grupo ${group.name}. ${privacy}${group.city ? `, ${group.city}` : ''}${memberLabel}`}
      accessibilityRole="button" onPress={onPress} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
      style={({ pressed }) => [styles.card, pressed && styles.pressed, focused && homeFocusStyle]}>
      <ImageBackground imageStyle={styles.imageRadius} resizeMode="cover"
        source={imageUri && failedImage !== imageUri ? { uri: imageUri } : undefined}
        onError={() => setFailedImage(imageUri)} style={styles.image}>
        {imageUri && failedImage !== imageUri && <View style={styles.overlay} />}
        <View style={styles.privacyPill}>
          <SymbolView accessible={false} name={group.privacy === 'PRIVATE'
            ? { ios: 'lock.fill', android: 'lock', web: 'lock' }
            : { ios: 'globe', android: 'public', web: 'public' }} size={14} tintColor={colors.olivePressed} />
          <Text style={styles.privacyText}>{privacy}</Text>
        </View>
        <View style={styles.bottomRow}>
          <View style={styles.bottomContent}>
            <Text style={styles.title}>{group.name}</Text>
            {group.city && <View style={styles.locationRow}>
              <SymbolView accessible={false} name={{ ios: 'mappin.and.ellipse', android: 'location_on', web: 'location_on' }} size={16} tintColor={colors.white} />
              <Text style={styles.locationText}>{group.city}</Text>
            </View>}
          </View>
          <View style={styles.openButton} accessible={false} importantForAccessibility="no-hide-descendants">
            <SymbolView name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }} size={24} tintColor={colors.white} />
          </View>
        </View>
      </ImageBackground>
    </Pressable>
  );
}
