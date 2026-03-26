import React, { useEffect, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withDelay, runOnJS } from 'react-native-reanimated';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/NavigationRoot';
import { useStore } from '../store';
import { theme } from '../styles/theme';

type LoadingScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Splash'>;

interface Props {
  navigation: LoadingScreenNavigationProp;
}

export const LoadingScreen: React.FC<Props> = ({ navigation }) => {
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
    // Initial sequence: wait briefly to ensure native splash is hidden, then fade in and rotate
    opacity.value = withTiming(1, { duration: 1000 });
    scale.value = withDelay(200, withTiming(1, { duration: 800 }));
    rotation.value = withDelay(1000, withTiming(360, { duration: 1500 }, (finished) => {
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
    <View style={styles.container} accessible={true} accessibilityLabel="Loading War Assets 3D">
      <Animated.View style={[styles.logoContainer, animatedStyle]}>
        <Text style={styles.logoText}>WAR ASSETS 3D</Text>
      </Animated.View>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
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
