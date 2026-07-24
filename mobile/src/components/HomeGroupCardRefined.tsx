import { LinearGradient } from 'expo-linear-gradient';
import { SymbolView } from 'expo-symbols';
import { ImageBackground, Pressable, Text, View } from 'react-native';

import { groupCardStyles as styles } from './HomeGroupCardRefined.styles';
import { resolveApiUrl } from '../lib/api';
import { getRestaurantFallbackImage } from '../lib/restaurant-images';
import { colors } from '../theme/colors';
import type { RestaurantGroup } from '../types/group';
import type { GroupMember } from '../types/group-member';

export function HomeGroupCardRefined({
  group,
  members,
  onPress,
}: {
  group: RestaurantGroup;
  members: GroupMember[];
  onPress: () => void;
}) {
  const imageUri = group.imageUrl
    ? resolveApiUrl(group.imageUrl)
    : getRestaurantFallbackImage(group.name);
  const memberLabel = members.length > 0
    ? (
        members.length === 1
          ? '1 miembro'
          : `${members.length} miembros`
      )
    : undefined;

  return (
    <Pressable
      accessibilityHint={memberLabel}
      accessibilityLabel={`Abrir el grupo ${group.name}`}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        pressed ? styles.pressed : null,
      ]}
    >
      <ImageBackground
        imageStyle={styles.imageRadius}
        resizeMode="cover"
        source={{ uri: imageUri }}
        style={styles.image}
      >
        <LinearGradient
          colors={[
            'rgba(26, 20, 17, 0.08)',
            'rgba(26, 20, 17, 0.18)',
            'rgba(26, 20, 17, 0.78)',
          ]}
          locations={[0, 0.42, 1]}
          style={styles.overlay}
        />

        <View style={styles.privacyPill}>
          <SymbolView
            name={group.privacy === 'PRIVATE'
              ? { ios: 'lock.fill', android: 'lock', web: 'lock' }
              : { ios: 'globe', android: 'public', web: 'public' }}
            size={12}
            tintColor="#617C4A"
          />
          <Text allowFontScaling={false} style={styles.privacyText}>
            {group.privacy === 'PRIVATE' ? 'Privado' : 'Público'}
          </Text>
        </View>

        {memberLabel ? (
          <View style={styles.memberPill}>
            <SymbolView
              name={{ ios: 'person.2.fill', android: 'group', web: 'group' }}
              size={12}
              tintColor="#FFFFFF"
            />
            <Text allowFontScaling={false} style={styles.memberText}>
              {memberLabel}
            </Text>
          </View>
        ) : null}

        <View style={styles.bottomContent}>
          <Text allowFontScaling={false} numberOfLines={1} style={styles.title}>
            {group.name}
          </Text>
          <View style={styles.locationRow}>
            <SymbolView
              name={{ ios: 'mappin.and.ellipse', android: 'location_on', web: 'location_on' }}
              size={16}
              tintColor={colors.white}
            />
            <Text allowFontScaling={false} numberOfLines={1} style={styles.locationText}>
              {group.city ?? 'Sin ciudad'}
            </Text>
          </View>
        </View>

        <View style={styles.openButton}>
          <SymbolView
            name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
            size={24}
            tintColor="#FFFFFF"
          />
        </View>
      </ImageBackground>
    </Pressable>
  );
}
