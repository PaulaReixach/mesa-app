import { SymbolView } from 'expo-symbols';
import {
  Image,
  ImageBackground,
  Pressable,
  Text,
  View,
} from 'react-native';

import { groupCardStyles as styles } from './HomeGroupCardRefined.styles';
import { resolveApiUrl } from '../lib/api';
import { colors } from '../theme/colors';
import type { RestaurantGroup } from '../types/group';
import type { GroupMember } from '../types/group-member';

const fallbackBackgrounds = ['#D9C7B5', '#C9D5B6', '#D9B7A7', '#C6D4CE'];

function fallbackBackground(value: string): string {
  const total = Array.from(value).reduce(
    (sum, character) => sum + character.charCodeAt(0),
    0,
  );
  return fallbackBackgrounds[total % fallbackBackgrounds.length];
}

function Avatar({ member }: { member: GroupMember }) {
  const avatarUri = member.avatarUrl ? resolveApiUrl(member.avatarUrl) : null;

  return (
    <View style={styles.avatar}>
      {avatarUri ? (
        <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
      ) : (
        <Text style={styles.avatarInitial}>{member.name.charAt(0).toUpperCase()}</Text>
      )}
    </View>
  );
}

function AvatarStack({ members }: { members: GroupMember[] }) {
  const visible = members.slice(0, 4);
  const remaining = Math.max(0, members.length - visible.length);

  if (visible.length === 0) {
    return (
      <View style={styles.emptyAvatar}>
        <SymbolView
          name={{ ios: 'person.2.fill', android: 'group', web: 'group' }}
          size={12}
          tintColor={colors.white}
        />
      </View>
    );
  }

  return (
    <View style={styles.avatarStack}>
      {visible.map((member, index) => (
        <View key={member.id} style={index > 0 ? styles.avatarOverlap : null}>
          <Avatar member={member} />
        </View>
      ))}
      {remaining > 0 ? (
        <View style={[styles.moreAvatar, styles.avatarOverlap]}>
          <Text style={styles.moreAvatarText}>+{remaining}</Text>
        </View>
      ) : null}
    </View>
  );
}

export function HomeGroupCardRefined({
  group,
  members,
  onPress,
}: {
  group: RestaurantGroup;
  members: GroupMember[];
  onPress: () => void;
}) {
  const imageUri = group.imageUrl ? resolveApiUrl(group.imageUrl) : null;

  const content = (
    <>
      <View style={styles.overlay} />
      {!imageUri ? (
        <View style={styles.fallbackIcon}>
          <SymbolView
            name={{ ios: 'fork.knife', android: 'restaurant', web: 'restaurant' }}
            size={38}
            tintColor="rgba(255,255,255,0.38)"
          />
        </View>
      ) : null}

      <View style={styles.privacyPill}>
        <SymbolView
          name={group.privacy === 'PRIVATE'
            ? { ios: 'lock.fill', android: 'lock', web: 'lock' }
            : { ios: 'globe', android: 'public', web: 'public' }}
          size={10}
          tintColor="#5C7842"
        />
        <Text style={styles.privacyText}>
          {group.privacy === 'PRIVATE' ? 'Privado' : 'Público'}
        </Text>
      </View>

      <View style={styles.bottomContent}>
        <Text numberOfLines={1} style={styles.title}>{group.name}</Text>
        <View style={styles.locationRow}>
          <SymbolView
            name={{ ios: 'mappin', android: 'location_on', web: 'location_on' }}
            size={10}
            tintColor={colors.white}
          />
          <Text numberOfLines={1} style={styles.locationText}>
            {group.city ?? 'Sin ciudad'}
          </Text>
        </View>
        <AvatarStack members={members} />
      </View>
    </>
  );

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed ? styles.pressed : null]}
    >
      {imageUri ? (
        <ImageBackground
          imageStyle={styles.imageRadius}
          source={{ uri: imageUri }}
          style={styles.image}
        >
          {content}
        </ImageBackground>
      ) : (
        <View style={[styles.image, { backgroundColor: fallbackBackground(group.name) }]}>
          {content}
        </View>
      )}
    </Pressable>
  );
}
