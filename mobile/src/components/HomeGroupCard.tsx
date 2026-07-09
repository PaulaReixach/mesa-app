import { SymbolView } from 'expo-symbols';
import {
  Image,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { resolveApiUrl } from '../lib/api';
import { colors } from '../theme/colors';
import type { RestaurantGroup } from '../types/group';
import type { GroupMember } from '../types/group-member';

const fallbackBackgrounds = [
  '#D9C7B5',
  '#C9D5B6',
  '#D9B7A7',
  '#C6D4CE',
];

function fallbackBackground(value: string): string {
  const total = Array.from(value).reduce(
    (sum, character) => sum + character.charCodeAt(0),
    0,
  );

  return fallbackBackgrounds[total % fallbackBackgrounds.length];
}

function Avatar({ member }: { member: GroupMember }) {
  const avatarUri = member.avatarUrl
    ? resolveApiUrl(member.avatarUrl)
    : null;

  return (
    <View style={styles.avatar}>
      {avatarUri ? (
        <Image
          source={{ uri: avatarUri }}
          style={styles.avatarImage}
        />
      ) : (
        <Text style={styles.avatarInitial}>
          {member.name.charAt(0).toUpperCase()}
        </Text>
      )}
    </View>
  );
}

function AvatarStack({ members }: { members: GroupMember[] }) {
  const visibleMembers = members.slice(0, 4);
  const remaining = Math.max(0, members.length - visibleMembers.length);

  if (visibleMembers.length === 0) {
    return (
      <View style={styles.emptyAvatar}>
        <SymbolView
          name={{ ios: 'person.2.fill', android: 'group', web: 'group' }}
          size={14}
          tintColor={colors.white}
        />
      </View>
    );
  }

  return (
    <View style={styles.avatarStack}>
      {visibleMembers.map((member, index) => (
        <View
          key={member.id}
          style={index > 0 ? styles.avatarOverlap : null}
        >
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

export function HomeGroupCard({
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
    : null;

  const content = (
    <>
      <View style={styles.overlay} />

      {!imageUri ? (
        <View style={styles.fallbackIcon}>
          <SymbolView
            name={{ ios: 'fork.knife', android: 'restaurant', web: 'restaurant' }}
            size={46}
            tintColor="rgba(255,255,255,0.38)"
          />
        </View>
      ) : null}

      <View style={styles.privacyPill}>
        <SymbolView
          name={group.privacy === 'PRIVATE'
            ? { ios: 'lock.fill', android: 'lock', web: 'lock' }
            : { ios: 'globe', android: 'public', web: 'public' }}
          size={11}
          tintColor="#5C7842"
        />
        <Text style={styles.privacyText}>
          {group.privacy === 'PRIVATE' ? 'Privado' : 'Público'}
        </Text>
      </View>

      <View style={styles.bottomContent}>
        <Text numberOfLines={1} style={styles.title}>
          {group.name}
        </Text>

        <View style={styles.locationRow}>
          <SymbolView
            name={{ ios: 'mappin', android: 'location_on', web: 'location_on' }}
            size={12}
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
      style={({ pressed }) => [
        styles.card,
        pressed ? styles.pressed : null,
      ]}
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
        <View
          style={[
            styles.image,
            { backgroundColor: fallbackBackground(group.name) },
          ]}
        >
          {content}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 0,
    height: 154,
    overflow: 'hidden',
    borderRadius: 19,
    backgroundColor: '#D7CEC8',
  },
  image: {
    flex: 1,
    overflow: 'hidden',
    borderRadius: 19,
  },
  imageRadius: {
    borderRadius: 19,
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(30, 22, 18, 0.34)',
  },
  fallbackIcon: {
    position: 'absolute',
    top: 45,
    right: 16,
  },
  privacyPill: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.93)',
  },
  privacyText: {
    color: '#5C7842',
    fontSize: 8,
    fontWeight: '800',
  },
  bottomContent: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    left: 10,
    gap: 4,
  },
  title: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: -0.2,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  locationText: {
    flex: 1,
    color: colors.white,
    fontSize: 9,
    fontWeight: '600',
  },
  avatarStack: {
    minHeight: 29,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  avatar: {
    width: 27,
    height: 27,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: colors.white,
    borderRadius: 14,
    backgroundColor: '#F4DFD5',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarInitial: {
    color: colors.primary,
    fontSize: 9,
    fontWeight: '900',
  },
  avatarOverlap: {
    marginLeft: -7,
  },
  moreAvatar: {
    width: 27,
    height: 27,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.white,
    borderRadius: 14,
    backgroundColor: 'rgba(65,55,49,0.72)',
  },
  moreAvatarText: {
    color: colors.white,
    fontSize: 8,
    fontWeight: '900',
  },
  emptyAvatar: {
    width: 29,
    height: 29,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    borderWidth: 1.5,
    borderColor: colors.white,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  pressed: {
    opacity: 0.78,
  },
});
