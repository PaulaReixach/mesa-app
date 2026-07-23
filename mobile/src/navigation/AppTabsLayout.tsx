import { SymbolView } from 'expo-symbols';
import { router, Tabs, usePathname } from 'expo-router';
import type { ComponentProps } from 'react';
import { useRef } from 'react';
import { Animated, Pressable, View } from 'react-native';
import type { ColorValue, StyleProp, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { appTabsStyles as styles, tabNavigationColors as navigationColors } from './AppTabsLayout.styles';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';

const hiddenScreenOptions = {
  href: null,
  tabBarStyle: { display: 'none' as const },
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type PrimaryTabButtonProps = Omit<ComponentProps<typeof Pressable>, 'style'> & {
  style?: StyleProp<ViewStyle>;
};
type SymbolName = ComponentProps<typeof SymbolView>['name'];

function PrimaryTabButton({
  onPressIn,
  onPressOut,
  style,
  ...props
}: PrimaryTabButtonProps) {
  const pressProgress = useRef(new Animated.Value(0)).current;

  const animatePress = (toValue: number, duration: number) => {
    pressProgress.stopAnimation();
    Animated.timing(pressProgress, {
      toValue,
      duration,
      useNativeDriver: true,
    }).start();
  };

  return (
    <AnimatedPressable
      {...props}
      onPressIn={event => {
        animatePress(1, 90);
        onPressIn?.(event);
      }}
      onPressOut={event => {
        animatePress(0, 150);
        onPressOut?.(event);
      }}
      style={[
        style,
        styles.primaryTabButton,
        {
          opacity: pressProgress.interpolate({
            inputRange: [0, 1],
            outputRange: [1, 0.72],
          }),
          transform: [
            {
              scale: pressProgress.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 0.975],
              }),
            },
          ],
        },
      ]}
    />
  );
}

function PrimaryTabIcon({
  color,
  focused,
  name,
  size,
}: {
  color: ColorValue;
  focused: boolean;
  name: SymbolName;
  size: number;
}) {
  return (
    <View
      style={[
        styles.primaryTabIcon,
        focused ? styles.primaryTabIconActive : null,
      ]}
    >
      <SymbolView name={name} size={size} tintColor={color} />
    </View>
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
        tabBarButton: ({
          accessibilityLabel,
          accessibilityState,
          children,
          onLongPress,
          onPress,
          style,
          testID,
        }) => (
          <PrimaryTabButton
            accessibilityLabel={accessibilityLabel}
            accessibilityRole="button"
            accessibilityState={accessibilityState}
            onLongPress={onLongPress}
            onPress={onPress}
            style={style}
            testID={testID}
          >
            {children}
          </PrimaryTabButton>
        ),
        tabBarItemStyle: {
          height: 60,
          justifyContent: 'center',
          paddingTop: 4,
        },
        tabBarIconStyle: {
          width: 64,
          height: 32,
          marginBottom: 0,
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
            <PrimaryTabIcon
              color={color}
              focused={focused}
              name={{ ios: focused ? 'house.fill' : 'house', android: 'home', web: 'home' }}
              size={23}
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
            <PrimaryTabIcon
              color={color}
              focused={focused}
              name={{
                ios: focused ? 'person.2.fill' : 'person.2',
                android: 'group',
                web: 'group',
              }}
              size={24}
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
              style={styles.addTabButton}
            >
              {({ pressed }) => (
                <View
                  style={[
                    styles.addCircleFrame,
                    pressed ? styles.addCircleFramePressed : null,
                  ]}
                >
                  <View
                    style={[
                      styles.addCircle,
                      pressed ? styles.addCirclePressed : null,
                    ]}
                  >
                    <SymbolView
                      name={{ ios: 'plus', android: 'add', web: 'add' }}
                      size={31}
                      tintColor={colors.white}
                    />
                  </View>
                </View>
              )}
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
            <PrimaryTabIcon
              color={color}
              focused={focused}
              name={{ ios: focused ? 'map.fill' : 'map', android: 'map', web: 'map' }}
              size={23}
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
            <PrimaryTabIcon
              color={color}
              focused={focused}
              name={{ ios: focused ? 'person.fill' : 'person', android: 'person', web: 'person' }}
              size={23}
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
