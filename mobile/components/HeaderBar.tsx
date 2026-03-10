import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../store';
import { theme } from '../styles/theme';

interface Props {
  onSearchPress: () => void;
  onComparePress: () => void;
  onSettingsPress?: () => void;
}

export const HeaderBar: React.FC<Props> = ({ onSearchPress, onComparePress, onSettingsPress }) => {
  const currentTheme = useStore((state) => state.theme);
  const setTheme = useStore((state) => state.setTheme);
  const queueLength = useStore((state) => state.comparisonQueue.length);
  const isDark = currentTheme === 'dark';

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: isDark ? '#FFF' : '#000' }]}>WAR ASSETS 3D</Text>
      <View style={styles.actions}>
        {onSettingsPress && (
          <TouchableOpacity onPress={onSettingsPress} style={styles.iconButton} accessibilityLabel="Settings">
            <Ionicons name="settings" size={24} color={isDark ? '#FFF' : '#000'} />
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={toggleTheme} style={styles.iconButton} accessibilityLabel="Toggle theme">
          <Ionicons name={isDark ? 'sunny' : 'moon'} size={24} color={isDark ? '#FFF' : '#000'} />
        </TouchableOpacity>
        <TouchableOpacity onPress={onSearchPress} style={styles.iconButton} accessibilityLabel="Open search filters">
          <Ionicons name="search" size={24} color={isDark ? '#FFF' : '#000'} />
        </TouchableOpacity>
        <TouchableOpacity onPress={onComparePress} style={styles.iconButton} accessibilityLabel="Open comparison">
          <Ionicons name="git-compare" size={24} color={isDark ? '#FFF' : '#000'} />
          {queueLength > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{queueLength}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 0,
    marginTop: 10,
  },
  title: {
    ...theme.typography.title,
    fontSize: 22,
    letterSpacing: 1.2,
  },
  actions: {
    flexDirection: 'row',
  },
  iconButton: {
    marginLeft: 16,
    padding: 4,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: theme.colors.error,
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
});
