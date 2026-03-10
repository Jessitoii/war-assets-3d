import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../styles/theme';
import { useStore } from '../store';

interface Props {
  label: string;
  isActive: boolean;
  onPress: () => void;
  onRemove?: () => void;
}

export const BeautifulMention: React.FC<Props> = ({ label, isActive, onPress, onRemove }) => {
  const isDark = useStore(state => state.theme === 'dark');

  return (
    <TouchableOpacity 
      style={[
        styles.container, 
        isActive ? styles.activeContainer : (isDark ? styles.inactiveDark : styles.inactiveLight)
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[
        styles.text, 
        isActive ? styles.activeText : (isDark ? styles.inactiveTextDark : styles.inactiveTextLight)
      ]}>
        @{label}
      </Text>
      {isActive && onRemove && (
        <TouchableOpacity onPress={onRemove} style={styles.removeBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="close-circle" size={16} color="#FFF" />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  activeContainer: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  inactiveDark: {
    backgroundColor: '#333',
    borderColor: '#444',
  },
  inactiveLight: {
    backgroundColor: '#F0F0F0',
    borderColor: '#E0E0E0',
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
  },
  activeText: {
    color: '#FFF',
  },
  inactiveTextDark: {
    color: '#BBB',
  },
  inactiveTextLight: {
    color: '#666',
  },
  removeBtn: {
    marginLeft: 6,
  }
});
