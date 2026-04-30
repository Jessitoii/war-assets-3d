import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useStore } from '../store';
import { useTranslation } from 'react-i18next';

interface Props {
  onPress: () => void;
}

export const SearchBar: React.FC<Props> = ({ onPress }) => {
  const currentTheme = useStore((state) => state.theme);
  const isDark = currentTheme === 'dark';
  const { t } = useTranslation();

  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        style={[
          styles.inner,
          { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }
        ]}
      >
        <Ionicons name="search" size={20} color={isDark ? '#AAA' : '#888'} style={styles.icon} />
        <Text style={[styles.placeholder, { color: isDark ? '#AAA' : '#888' }]}>
          {t('search.placeholder', { defaultValue: 'Search assets...' })}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    marginBottom: 8,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
  },
  icon: {
    marginRight: 10,
  },
  placeholder: {
    fontSize: 16,
  },
});
