import { SymbolView } from 'expo-symbols';
import { Tabs } from 'expo-router';
import {
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '../../theme/colors';

const navigationColors = {
  active: colors.primary,
  inactive: '#8D8681',
  border: '#EEE3DD',
  background: '#FFFFFF',
};

const hiddenScreenOptions = {
  href: null,
  tabBarStyle: {
    display: 'none' as const,
  },
};

export default function AppLayout() {
  const insets = useSafeAreaInsets();

  const bottomPadding = Math.max(
    insets.bottom,
    6,
  );

  return (
    <Tabs
      initialRouteName="home"
      screenOptions={{
        headerShown: false,

        tabBarActiveTintColor:
          navigationColors.active,

        tabBarInactiveTintColor:
          navigationColors.inactive,

        tabBarHideOnKeyboard: true,

        tabBarLabelPosition:
          'below-icon',

        tabBarItemStyle: {
          justifyContent: 'center',
          paddingTop: 3,
        },

        tabBarIconStyle: {
          width: 24,
          height: 22,
          marginBottom: 0,
        },

        tabBarLabelStyle: {
          marginTop: 0,
          fontSize: 10,
          fontWeight: '500',
          lineHeight: 13,
        },

        tabBarStyle: {
          height: 56 + bottomPadding,
          paddingTop: 4,
          paddingBottom: bottomPadding,

          borderTopWidth: 1,
          borderTopColor:
            navigationColors.border,

          backgroundColor:
            navigationColors.background,

          shadowColor: '#2B2421',
          shadowOffset: {
            width: 0,
            height: -2,
          },
          shadowOpacity: 0.04,
          shadowRadius: 5,

          elevation: 6,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Inicio',
          tabBarAccessibilityLabel:
            'Inicio',

          tabBarIcon: ({
            focused,
            color,
          }) => (
            <SymbolView
              name={{
                ios: focused
                  ? 'house.fill'
                  : 'house',
                android: 'home',
                web: 'home',
              }}
              size={20}
              tintColor={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="map"
        options={{
          title: 'Mapa',
          tabBarAccessibilityLabel:
            'Mapa',

          tabBarIcon: ({
            focused,
            color,
          }) => (
            <SymbolView
              name={{
                ios: focused
                  ? 'map.fill'
                  : 'map',
                android: 'map',
                web: 'map',
              }}
              size={20}
              tintColor={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="add"
        options={{
          title: 'Añadir',
          tabBarAccessibilityLabel:
            'Añadir',

          tabBarLabel: () => null,

          tabBarButton: ({
            accessibilityState,
            accessibilityLabel,
            onLongPress,
            onPress,
            testID,
          }) => (
            <Pressable
              accessibilityLabel={
                accessibilityLabel
                ?? 'Añadir'
              }
              accessibilityRole="button"
              accessibilityState={
                accessibilityState
              }
              onLongPress={onLongPress}
              onPress={onPress}
              testID={testID}
              style={({ pressed }) => [
                styles.addTabButton,
                pressed
                  ? styles.addTabButtonPressed
                  : null,
              ]}
            >
              <View style={styles.addCircle}>
                <SymbolView
                  name={{
                    ios: 'plus',
                    android: 'add',
                    web: 'add',
                  }}
                  size={25}
                  tintColor={colors.white}
                />
              </View>
            </Pressable>
          ),
        }}
      />

      <Tabs.Screen
        name="groups"
        options={{
          title: 'Grupos',
          tabBarAccessibilityLabel:
            'Grupos',

          tabBarIcon: ({
            focused,
            color,
          }) => (
            <SymbolView
              name={{
                ios: focused
                  ? 'person.2.fill'
                  : 'person.2',
                android: 'group',
                web: 'group',
              }}
              size={21}
              tintColor={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarAccessibilityLabel:
            'Perfil',

          tabBarIcon: ({
            focused,
            color,
          }) => (
            <SymbolView
              name={{
                ios: focused
                  ? 'person.fill'
                  : 'person',
                android: 'person',
                web: 'person',
              }}
              size={20}
              tintColor={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="profile-edit"
        options={hiddenScreenOptions}
      />

      <Tabs.Screen
        name="account-settings"
        options={hiddenScreenOptions}
      />

      <Tabs.Screen
        name="change-password"
        options={hiddenScreenOptions}
      />

      <Tabs.Screen
        name="delete-account"
        options={hiddenScreenOptions}
      />

      <Tabs.Screen
        name="notifications"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="notification-settings"
        options={hiddenScreenOptions}
      />
      
    </Tabs>
  );
}

const styles = StyleSheet.create({
  addTabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  addTabButtonPressed: {
    opacity: 0.78,
  },

  addCircle: {
    width: 44,
    height: 44,

    alignItems: 'center',
    justifyContent: 'center',

    marginTop: -5,

    borderWidth: 3,
    borderColor:
      navigationColors.background,

    borderRadius: 22,

    backgroundColor: colors.primary,

    shadowColor: '#7E3B2A',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.14,
    shadowRadius: 4,

    elevation: 4,
  },
});