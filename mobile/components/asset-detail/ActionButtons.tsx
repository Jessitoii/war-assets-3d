import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../styles/theme';

interface ActionButtonsProps {
  hasModel: boolean;
  isDark: boolean;
  onView3D: () => void;
  onCompare: () => void;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  hasModel,
  isDark,
  onView3D,
  onCompare,
}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity 
        onPress={onView3D} 
        disabled={!hasModel}
        style={[
          styles.button, 
          styles.primaryButton,
          !hasModel && styles.disabledButton
        ]}
        accessibilityLabel="View in 3D"
        accessibilityHint={hasModel ? "Opens interactive 3D model viewer" : "3D model is currently unavailable"}
      >
        <Ionicons name="cube-outline" size={24} color="#FFF" />
        <Text style={styles.primaryButtonText}>
          {hasModel ? 'View in 3-D' : '3-D Unavailable'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        onPress={onCompare} 
        style={[
          styles.button, 
          styles.secondaryButton,
          { backgroundColor: isDark ? theme.colors.secondary : '#E5E5EA' }
        ]}
        accessibilityLabel="Add to comparison"
        accessibilityHint="Adds this asset to the comparison queue"
      >
        <Ionicons name="git-compare-outline" size={20} color={isDark ? '#FFF' : '#000'} />
        <Text style={[styles.secondaryButtonText, { color: isDark ? '#FFF' : '#000' }]}>
          Compare
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    flexDirection: 'column',
    gap: 12,
  },
  button: {
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
  },
  disabledButton: {
    backgroundColor: '#999',
    opacity: 0.6,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: 'transparent',
  },
  primaryButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
