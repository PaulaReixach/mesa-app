import { Image } from 'expo-image';
import { View } from 'react-native';

// Icons drawn exactly as in the approved artboards. They are SVG assets rendered by expo-image
// (already in the dev build) and tinted, so no extra native module is needed.

const icons = {
  starFilled: require('../../../assets/images/icons/star-filled.svg'),
  starOutline: require('../../../assets/images/icons/star-outline.svg'),
  home: require('../../../assets/images/icons/tab-home.svg'),
  homeOn: require('../../../assets/images/icons/tab-home-on.svg'),
  groups: require('../../../assets/images/icons/tab-groups.svg'),
  groupsOn: require('../../../assets/images/icons/tab-groups-on.svg'),
  map: require('../../../assets/images/icons/tab-map.svg'),
  mapOn: require('../../../assets/images/icons/tab-map-on.svg'),
  profile: require('../../../assets/images/icons/tab-profile.svg'),
  profileOn: require('../../../assets/images/icons/tab-profile-on.svg'),
  plus: require('../../../assets/images/icons/plus.svg'),
};

type IconProps = { color: string; size?: number };
type TabIconProps = IconProps & { focused: boolean };

function Tinted({ source, color, size }: { source: number; color: string; size: number }) {
  return <Image source={source} style={{ width: size, height: size }} tintColor={color} contentFit="contain" accessible={false} />;
}

/** Rating star: filled, or outlined with a 1.6 stroke. */
export function StarIcon({ color, size = 32, filled }: IconProps & { filled: boolean }) {
  return <Tinted source={filled ? icons.starFilled : icons.starOutline} color={color} size={size} />;
}

export function HomeTabIcon({ color, size = 22, focused }: TabIconProps) {
  return <Tinted source={focused ? icons.homeOn : icons.home} color={color} size={size} />;
}

export function GroupsTabIcon({ color, size = 22, focused }: TabIconProps) {
  return <Tinted source={focused ? icons.groupsOn : icons.groups} color={color} size={size} />;
}

export function MapTabIcon({ color, size = 22, focused }: TabIconProps) {
  return <Tinted source={focused ? icons.mapOn : icons.map} color={color} size={size} />;
}

export function ProfileTabIcon({ color, size = 22, focused }: TabIconProps) {
  return <Tinted source={focused ? icons.profileOn : icons.profile} color={color} size={size} />;
}

/** «Añadir»: rounded square 26 (radius 8.5) in accent with the plus in onAccent. */
export function AddTabIcon({ color, plusColor }: { color: string; plusColor: string }) {
  return (
    <View style={{
      width: 26, height: 26, borderRadius: 8.5, borderCurve: 'continuous', backgroundColor: color,
      alignItems: 'center', justifyContent: 'center',
    }}>
      <Tinted source={icons.plus} color={plusColor} size={22} />
    </View>
  );
}
