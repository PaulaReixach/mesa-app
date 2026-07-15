import { LinearGradient } from 'expo-linear-gradient';
import { SymbolView } from 'expo-symbols';
import { router, Tabs, usePathname } from 'expo-router';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { appTabsStyles as styles, tabNavigationColors as navigationColors } from './AppTabsLayout.styles';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';

const hiddenScreenOptions = {
  href: null,
  tabBarStyle: { display: 'none' as const },
};

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
          height: 60,
          justifyContent: 'center',
          paddingTop: 4,
        },
        tabBarIconStyle: {
          width: 28,
          height: 27,
          marginBottom: 2,
        },
        tabBarLabelStyle: {
          marginTop: 0,
          fontSize: 11,
          fontFamily: fonts.medium,
          lineHeight: 14,
        },
        tabBarStyle: showPrimaryNavigation ? {
          position: 'absolute',
          right: 0,
          bottom: 0,
          left: 0,
          height: 66 + bottomInset,
          paddingHorizontal: 8,
          paddingTop: 6,
          paddingBottom: bottomInset,
          overflow: 'visible',
          borderTopWidth: 0,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          backgroundColor: navigationColors.background,
          shadowColor: colors.shadow,
          shadowOffset: { width: 0, height: -5 },
          shadowOpacity: 0.09,
          shadowRadius: 18,
          elevation: 14,
        } : { display: 'none' },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Inicio',
          tabBarAccessibilityLabel: 'Inicio',
          tabBarIcon: ({ focused, color }) => (
            <SymbolView
              name={{ ios: focused ? 'house.fill' : 'house', android: 'home', web: 'home' }}
              size={23}
              tintColor={color}
            />
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
          tabBarIcon: ({ focused, color }) => (
            <SymbolView
              name={{
                ios: focused ? 'person.2.fill' : 'person.2',
                android: 'group',
                web: 'group',
              }}
              size={24}
              tintColor={color}
            />
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
              <View style={styles.addCircleShadow}>
                <LinearGradient
                  colors={['#B93620', '#DD4D2C', '#C43E24']}
                  end={{ x: 1, y: 1 }}
                  start={{ x: 0, y: 0 }}
                  style={styles.addCircle}
                >
                  <SymbolView
                    name={{ ios: 'plus', android: 'add', web: 'add' }}
                    size={31}
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
          tabBarIcon: ({ focused, color }) => (
            <SymbolView
              name={{ ios: focused ? 'map.fill' : 'map', android: 'map', web: 'map' }}
              size={23}
              tintColor={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarAccessibilityLabel: 'Perfil',
          tabBarIcon: ({ focused, color }) => (
            <SymbolView
              name={{ ios: focused ? 'person.fill' : 'person', android: 'person', web: 'person' }}
              size={23}
              tintColor={color}
            />
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
