import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../styles/theme';
import { AssetSpecs } from '../../store/slices/assetSlice';

interface SpecsSummaryProps {
  specs: AssetSpecs;
  isDark: boolean;
  onPress: () => void;
}

export const SpecsSummary: React.FC<SpecsSummaryProps> = ({ specs, isDark, onPress }) => {
  const cardBg = isDark ? theme.colors.secondary : '#FFF';
  const textColor = isDark ? '#FFF' : '#000';
  const subTextColor = isDark ? '#AAA' : '#666';

  const items = [
    { label: 'Range', value: specs.range, icon: 'navigate-outline' },
    { label: 'Speed', value: specs.speed, icon: 'speedometer-outline' },
    { label: 'Generation', value: specs.generation, icon: 'git-network-outline' },
    { label: 'Country', value: specs.country, icon: 'globe-outline' },
  ];

  return (
    <TouchableOpacity 
      onPress={onPress} 
      style={[styles.container, { backgroundColor: cardBg }]}
      accessibilityLabel="View technical specifications"
      accessibilityRole="button"
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: textColor }]}>Technical Summary</Text>
        <Ionicons name="chevron-forward" size={18} color={subTextColor} />
      </View>
      <View style={styles.grid}>
        {items.map((item, index) => (
          <View key={index} style={styles.specItem}>
            <Ionicons name={item.icon as any} size={20} color={theme.colors.primary} />
            <Text style={[styles.value, { color: textColor }]}>{item.value}</Text>
            <Text style={[styles.label, { color: subTextColor }]}>{item.label}</Text>
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  specItem: {
    width: '48%',
    marginBottom: 16,
    alignItems: 'center',
  },
  value: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 4,
  },
  label: {
    fontSize: 12,
    marginTop: 2,
  },
});
