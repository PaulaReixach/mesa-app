import { LinearGradient } from 'expo-linear-gradient';
import { SymbolView } from 'expo-symbols';
import { router, Tabs, usePathname } from 'expo-router';
import type { ComponentProps } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { appTabsStyles as styles, tabNavigationColors as navigationColors } from './AppTabsLayout.styles';
import { colors } from '../theme/colors';

type SymbolName = ComponentProps<typeof SymbolView>['name'];

const hiddenScreenOptions = {
  href: null,
  tabBarStyle: { display: 'none' as const },
};

function PrimaryTabIcon({
  focused,
  name,
  size,
}: {
  focused: boolean;
  name: SymbolName;
  size: number;
}) {
  return (
    <View
      style={[
        styles.tabIconContainer,
        focused ? styles.tabIconContainerActive : null,
      ]}
    >
      <SymbolView
        name={name}
        size={size}
        tintColor={focused
          ? navigationColors.active
          : navigationColors.inactive}
      />
    </View>
  );
}

function PrimaryTabLabel({
  focused,
  label,
}: {
  focused: boolean;
  label: string;
}) {
  return (
    <Text
      allowFontScaling={false}
      style={[
        styles.tabLabel,
        focused ? styles.tabLabelActive : null,
      ]}
    >
      {label}
    </Text>
  );
}

export default function AppTabsLayout() {
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const bottomInset = Math.max(insets.bottom, 12);
  const showPrimaryNavigation = [
    '/home',
    '/groups',
    '/groups/explore',
    '/add',
    '/map',
    '/profile',
  ].includes(pathname);

  return (
    <Tabs
      initialRouteName="home"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: navigationColors.active,
        tabBarInactiveTintColor: navigationColors.inactive,
        tabBarHideOnKeyboard: true,
        tabBarAllowFontScaling: false,
        tabBarLabelPosition: 'below-icon',
        tabBarItemStyle: {
          height: 58,
          justifyContent: 'flex-start',
          paddingTop: 0,
        },
        tabBarIconStyle: { width: 52, height: 44, marginBottom: 0 },
        tabBarStyle: showPrimaryNavigation ? {
          position: 'absolute',
          right: 0,
          bottom: 0,
          left: 0,
          height: 64 + bottomInset,
          paddingHorizontal: 6,
          paddingTop: 6,
          paddingBottom: bottomInset,
          borderTopWidth: 0,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          backgroundColor: navigationColors.background,
          shadowColor: colors.shadow,
          shadowOffset: { width: 0, height: -7 },
          shadowOpacity: 0.11,
          shadowRadius: 20,
          elevation: 18,
        } : { display: 'none' },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Inicio',
          tabBarAccessibilityLabel: 'Inicio',
          tabBarIcon: ({ focused }) => (
            <PrimaryTabIcon
              focused={focused}
              name={{ ios: 'house', android: 'home', web: 'home' }}
              size={23}
            />
          ),
          tabBarLabel: ({ focused }) => (
            <PrimaryTabLabel focused={focused} label="Inicio" />
          ),
        }}
      />

      <Tabs.Screen
        name="groups"
        listeners={{
          tabPress: event => {
            event.preventDefault();
            router.replace('/groups');
          },
        }}
        options={{
          title: 'Grupos',
          tabBarAccessibilityLabel: 'Grupos',
          popToTopOnBlur: true,
          tabBarIcon: ({ focused }) => (
            <PrimaryTabIcon
              focused={focused}
              name={{
                ios: 'person.2',
                android: 'group',
                web: 'group',
              }}
              size={24}
            />
          ),
          tabBarLabel: ({ focused }) => (
            <PrimaryTabLabel focused={focused} label="Grupos" />
          ),
        }}
      />

      <Tabs.Screen
        name="add"
        options={{
          title: 'Añadir',
          tabBarAccessibilityLabel: 'Añadir',
          tabBarLabel: () => null,
          tabBarButton: ({
            accessibilityState,
            accessibilityLabel,
            onLongPress,
            onPress,
            testID,
          }) => (
            <Pressable
              accessibilityLabel={accessibilityLabel ?? 'Añadir'}
              accessibilityRole="button"
              accessibilityState={accessibilityState}
              onLongPress={onLongPress}
              onPress={onPress}
              testID={testID}
              style={({ pressed }) => [
                styles.addTabButton,
                pressed ? styles.addTabButtonPressed : null,
              ]}
            >
              <View style={styles.addSquareShadow}>
                <LinearGradient
                  colors={['#B93620', '#DD4D2C', '#C43E24']}
                  end={{ x: 1, y: 1 }}
                  start={{ x: 0, y: 0 }}
                  style={styles.addSquare}
                >
                  <SymbolView
                    name={{ ios: 'plus', android: 'add', web: 'add' }}
                    size={29}
                    tintColor={colors.white}
                  />
                </LinearGradient>
              </View>
            </Pressable>
          ),
        }}
      />

      <Tabs.Screen
        name="map"
        options={{
          title: 'Mapa',
          tabBarAccessibilityLabel: 'Mapa',
          tabBarIcon: ({ focused }) => (
            <PrimaryTabIcon
              focused={focused}
              name={{ ios: 'map', android: 'map', web: 'map' }}
              size={24}
            />
          ),
          tabBarLabel: ({ focused }) => (
            <PrimaryTabLabel focused={focused} label="Mapa" />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarAccessibilityLabel: 'Perfil',
          tabBarIcon: ({ focused }) => (
            <PrimaryTabIcon
              focused={focused}
              name={{ ios: 'person', android: 'person', web: 'person' }}
              size={23}
            />
          ),
          tabBarLabel: ({ focused }) => (
            <PrimaryTabLabel focused={focused} label="Perfil" />
          ),
        }}
      />

      <Tabs.Screen name="profile-edit" options={hiddenScreenOptions} />
      <Tabs.Screen name="account-settings" options={hiddenScreenOptions} />
      <Tabs.Screen name="change-password" options={hiddenScreenOptions} />
      <Tabs.Screen name="delete-account" options={hiddenScreenOptions} />
      <Tabs.Screen name="notifications" options={{ href: null }} />
      <Tabs.Screen name="group-invitations" options={hiddenScreenOptions} />
      <Tabs.Screen name="notification-settings" options={hiddenScreenOptions} />
      <Tabs.Screen name="privacy-settings" options={hiddenScreenOptions} />
      <Tabs.Screen name="help-support" options={hiddenScreenOptions} />
      <Tabs.Screen name="support-request" options={hiddenScreenOptions} />
      <Tabs.Screen name="about-mesa" options={hiddenScreenOptions} />
    </Tabs>
  );
}
