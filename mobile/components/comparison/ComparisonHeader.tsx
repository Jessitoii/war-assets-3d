import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../../store';
import { theme } from '../../styles/theme';

interface Props {
  onAddPress: () => void;
}

export const ComparisonHeader: React.FC<Props> = ({ onAddPress }) => {
  const currentTheme = useStore((state) => state.theme);
  const clearComparison = useStore((state) => state.clearComparison);
  const queueLength = useStore((state) => state.comparisonQueue.length);
  const isDark = currentTheme === 'dark';

  const handleClearAll = () => {
    if (queueLength === 0) return;
    Alert.alert(
      'Clear All',
      'Are you sure you want to clear the comparison queue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', style: 'destructive', onPress: clearComparison },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: isDark ? '#FFF' : '#000' }]}>Comparison</Text>
      <View style={styles.actions}>
        <TouchableOpacity 
          onPress={onAddPress} 
          style={styles.iconButton} 
          accessibilityLabel="Add asset to compare"
          disabled={queueLength >= 3}
        >
          <Ionicons 
            name="add-circle" 
            size={28} 
            color={queueLength >= 3 ? (isDark ? '#444' : '#CCC') : theme.colors.primary} 
          />
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={handleClearAll} 
          style={styles.iconButton} 
          accessibilityLabel="Clear comparison queue"
          disabled={queueLength === 0}
        >
          <Ionicons 
            name="trash-outline" 
            size={24} 
            color={queueLength === 0 ? (isDark ? '#444' : '#CCC') : theme.colors.error} 
          />
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
    paddingHorizontal: 16,
    backgroundColor: 'transparent',
  },
  title: {
    ...theme.typography.title,
    fontSize: 22,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    marginLeft: 16,
    padding: 6,
  },
});
