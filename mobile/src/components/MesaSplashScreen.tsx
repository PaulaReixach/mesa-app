import * as SplashScreen from 'expo-splash-screen';
import {
  useCallback,
  useEffect,
  useRef,
} from 'react';
import {
  Animated,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { colors } from '../theme/colors';
import { MesaLogo } from './MesaLogo';

type MesaSplashScreenProps = {
  canFinish: boolean;
  onFinish: () => void;
};

export function MesaSplashScreen({
  canFinish,
  onFinish,
}: MesaSplashScreenProps) {
  const screenOpacity =
    useRef(new Animated.Value(1)).current;

  const logoOpacity =
    useRef(new Animated.Value(0)).current;

  const logoScale =
    useRef(new Animated.Value(0.88)).current;

  const logoTranslateY =
    useRef(new Animated.Value(18)).current;

  const sloganOpacity =
    useRef(new Animated.Value(0)).current;

  const sloganTranslateY =
    useRef(new Animated.Value(10)).current;

  const nativeSplashHidden = useRef(false);
  const exitStarted = useRef(false);

  useEffect(() => {
    const entranceAnimation = Animated.sequence([
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 520,
          useNativeDriver: true,
        }),
        Animated.spring(logoScale, {
          toValue: 1,
          damping: 12,
          mass: 0.8,
          stiffness: 95,
          useNativeDriver: true,
        }),
        Animated.timing(logoTranslateY, {
          toValue: 0,
          duration: 520,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(sloganOpacity, {
          toValue: 1,
          duration: 420,
          useNativeDriver: true,
        }),
        Animated.timing(sloganTranslateY, {
          toValue: 0,
          duration: 420,
          useNativeDriver: true,
        }),
      ]),
    ]);

    entranceAnimation.start();

    return () => {
      entranceAnimation.stop();
    };
  }, [
    logoOpacity,
    logoScale,
    logoTranslateY,
    sloganOpacity,
    sloganTranslateY,
  ]);

  useEffect(() => {
    if (!canFinish || exitStarted.current) {
      return;
    }

    exitStarted.current = true;

    const exitAnimation = Animated.timing(
      screenOpacity,
      {
        toValue: 0,
        duration: 320,
        useNativeDriver: true,
      },
    );

    exitAnimation.start(({ finished }) => {
      if (finished) {
        onFinish();
      }
    });

    return () => {
      exitAnimation.stop();
    };
  }, [
    canFinish,
    onFinish,
    screenOpacity,
  ]);

  const handleLayout = useCallback(() => {
    if (
      Platform.OS === 'web'
      || nativeSplashHidden.current
    ) {
      return;
    }

    nativeSplashHidden.current = true;
    SplashScreen.hide();
  }, []);

  return (
    <Animated.View
      onLayout={handleLayout}
      style={[
        styles.screen,
        {
          opacity: screenOpacity,
        },
      ]}
    >
      <View style={styles.decorationTop} />
      <View style={styles.decorationBottom} />

      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: logoOpacity,
            transform: [
              {
                scale: logoScale,
              },
              {
                translateY: logoTranslateY,
              },
            ],
          },
        ]}
      >
        <MesaLogo />
      </Animated.View>

      <Animated.View
        style={[
          styles.sloganContainer,
          {
            opacity: sloganOpacity,
            transform: [
              {
                translateY: sloganTranslateY,
              },
            ],
          },
        ]}
      >
        <Text style={styles.slogan}>
          Buenos planes,
        </Text>

        <Text style={styles.slogan}>
          mejores recuerdos.
        </Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: colors.background,
  },
  logoContainer: {
    marginTop: -54,
  },
  sloganContainer: {
    position: 'absolute',
    bottom: 58,
    alignItems: 'center',
  },
  slogan: {
    color: colors.primary,
    fontFamily: Platform.select({
      ios: 'Georgia',
      android: 'serif',
      default: 'serif',
    }),
    fontSize: 16,
    fontStyle: 'italic',
    lineHeight: 23,
  },
  decorationTop: {
    position: 'absolute',
    top: -130,
    right: -110,
    width: 270,
    height: 270,
    borderRadius: 135,
    backgroundColor: '#FBE8DE',
    opacity: 0.55,
  },
  decorationBottom: {
    position: 'absolute',
    bottom: -170,
    left: -130,
    width: 310,
    height: 310,
    borderRadius: 155,
    backgroundColor: '#F4DDD2',
    opacity: 0.45,
  },
});