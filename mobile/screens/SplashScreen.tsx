import React, { useEffect, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withDelay, runOnJS } from 'react-native-reanimated';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/NavigationRoot';
import { useStore } from '../store';
import { theme } from '../styles/theme';

type SplashScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Splash'>;

interface Props {
  navigation: SplashScreenNavigationProp;
}

export const SplashScreen: React.FC<Props> = ({ navigation }) => {
  const isFirstLaunch = useStore((state) => state.firstLaunch);
  
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.5);
  const rotation = useSharedValue(0);

  const handleAnimationEnd = useCallback(() => {
    if (isFirstLaunch) {
      navigation.replace('Onboarding');
    } else {
      navigation.replace('Home');
    }
  }, [isFirstLaunch, navigation]);

  useEffect(() => {
    // fade‑in (0‑0.5 s), scale (0.5‑1 s), rotate (1‑2 s).
    opacity.value = withTiming(1, { duration: 500 });
    scale.value = withDelay(500, withTiming(1, { duration: 500 }));
    rotation.value = withDelay(1000, withTiming(360, { duration: 1000 }, (finished) => {
      if (finished) {
        runOnJS(handleAnimationEnd)();
      }
    }));
  }, [handleAnimationEnd, opacity, rotation, scale]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [
        { scale: scale.value },
        { rotate: `${rotation.value}deg` }
      ],
    };
  });

  return (
    <View style={styles.container} accessible={true} accessibilityLabel="Loading">
      <Animated.View style={[styles.logoContainer, animatedStyle]}>
        {/* Placeholder SVG/Logo component filling 60% of height */}
        <Text style={styles.logoText}>War Assets 3D</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    height: '60%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    color: '#FFF',
    ...theme.typography.title,
  },
});
