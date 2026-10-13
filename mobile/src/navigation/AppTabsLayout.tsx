import { router, Tabs, usePathname } from 'expo-router';
import type { ComponentProps, ReactNode } from 'react';
import { useRef } from 'react';
import { Animated, Pressable, Text, View, useWindowDimensions } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppTabsStyles } from './AppTabsLayout.styles';
import {
  AddTabIcon, GroupsTabIcon, HomeTabIcon, MapTabIcon, ProfileTabIcon,
} from '../components/ui/MesaIcons';
import { fonts, useTheme } from '../theme';

const hiddenScreenOptions = {
  href: null,
  tabBarStyle: { display: 'none' as const },
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type PrimaryTabButtonProps = Omit<ComponentProps<typeof Pressable>, 'style'> & {
  style?: StyleProp<ViewStyle>;
};

function PrimaryTabButton({
  onPressIn,
  onPressOut,
  style,
  ...props
}: PrimaryTabButtonProps) {
  const styles = useAppTabsStyles();
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

/** Tab icon from the artboard; the selected tab sits on a 56×32 sage pill. */
function PrimaryTabIcon({ focused, children }: { focused: boolean; children: ReactNode }) {
  const styles = useAppTabsStyles();
  return (
    <View
      style={[
        styles.primaryTabIcon,
        focused ? styles.primaryTabIconActive : null,
      ]}
    >
      {children}
    </View>
  );
}

export default function AppTabsLayout() {
  const { colors } = useTheme();
  const styles = useAppTabsStyles();
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const { fontScale } = useWindowDimensions();
  const labelExtraHeight = Math.ceil(14 * (Math.min(fontScale, 1.3) - 1));
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
        tabBarActiveTintColor: colors.secondary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarHideOnKeyboard: true,
        tabBarAllowFontScaling: true,
        tabBarLabel: ({ children, color, focused }) => (
          <Text maxFontSizeMultiplier={1.3} style={[styles.tabLabel, focused && styles.tabLabelSelected, { color }]}>{children}</Text>
        ),
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
          height: 60 + labelExtraHeight,
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
          height: 60 + bottomInset + labelExtraHeight,
          paddingHorizontal: 6,
          paddingTop: 0,
          paddingBottom: bottomInset,
          overflow: 'visible',
          borderTopWidth: 1,
          borderTopColor: colors.border,
          backgroundColor: colors.surface,
          elevation: 0,
        } : { display: 'none' },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Inicio',
          tabBarAccessibilityLabel: 'Inicio',
          tabBarIcon: ({ focused, color }) => (
            <PrimaryTabIcon focused={focused}><HomeTabIcon color={String(color)} focused={focused} /></PrimaryTabIcon>
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
            <PrimaryTabIcon focused={focused}><GroupsTabIcon color={String(color)} focused={focused} /></PrimaryTabIcon>
          ),
        }}
      />

      <Tabs.Screen
        name="add"
        options={{
          title: 'Añadir',
          tabBarAccessibilityLabel: 'Añadir',
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
              style={[styles.addTabButton, { height: 60 + labelExtraHeight }]}
            >
              {({ pressed }) => (
                <>
                  <View style={styles.addIcon}>
                    <AddTabIcon color={pressed ? colors.accentPressed : colors.accent} plusColor={colors.onAccent} />
                  </View>
                  <Text maxFontSizeMultiplier={1.3} style={[styles.tabLabel, styles.tabLabelSelected, { color: colors.accent }]}>Añadir</Text>
                </>
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
            <PrimaryTabIcon focused={focused}><MapTabIcon color={String(color)} focused={focused} /></PrimaryTabIcon>
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarAccessibilityLabel: 'Perfil',
          tabBarIcon: ({ focused, color }) => (
            <PrimaryTabIcon focused={focused}><ProfileTabIcon color={String(color)} focused={focused} /></PrimaryTabIcon>
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
