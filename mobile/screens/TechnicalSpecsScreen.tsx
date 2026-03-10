import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/NavigationRoot';
import { theme } from '../styles/theme';
import { useStore } from '../store';
import { Ionicons } from '@expo/vector-icons';

type Props = StackScreenProps<RootStackParamList, 'TechnicalSpecs'>;

export const TechnicalSpecsScreen: React.FC<Props> = ({ route, navigation }) => {
  const { assetId } = route.params;
  const isDark = useStore((state) => state.theme === 'dark');
  const asset = useStore((state) => state.assets.find(a => a.id === assetId));

  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const getParsedSpecs = (specs: any) => {
    if (!specs) return null;
    if (typeof specs === 'string') {
      try {
        return JSON.parse(specs);
      } catch (e) {
        return null;
      }
    }
    return specs;
  };

  const parsedSpecs = getParsedSpecs(asset?.specs);
  const specs = parsedSpecs ? Object.entries(parsedSpecs).map(([key, value]) => ({ 
    key, 
    value: typeof value === 'object' ? JSON.stringify(value) : String(value) 
  })) : [
    { key: 'range', value: '8,000 km' },
    { key: 'speed', value: 'Mach 2.5' },
    { key: 'generation', value: '5th Gen' },
    { key: 'country', value: 'USA' },
    { key: 'engine', value: 'Pratt & Whitney F135' },
    { key: 'payload', value: '8,160 kg' },
  ];

  const textColor = isDark ? '#FFF' : '#000';
  const borderColor = isDark ? '#333' : '#E5E5EA';

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: isDark ? theme.colors.backgroundDark : theme.colors.backgroundLight }]} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="close" size={28} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: textColor }]}>Technical Specifications</Text>
      </View>

      <ScrollView style={styles.container}>
        <View style={styles.table}>
          <View style={[styles.tableHeader, { borderBottomColor: borderColor }]}>
            <Text style={[styles.headerCell, { color: textColor, flex: 1 }]}>Specification</Text>
            <TouchableOpacity 
              style={styles.headerCellContainer}
              onPress={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            >
              <Text style={[styles.headerCell, { color: textColor }]}>Value</Text>
              <Ionicons name={sortOrder === 'asc' ? 'chevron-up' : 'chevron-down'} size={14} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>
          
          {specs.map((item, index) => (
            <View 
              key={index} 
              style={[
                styles.tableRow, 
                { borderBottomColor: borderColor },
                index % 2 === 1 && { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }
              ]}
              accessibilityLabel={`Specification ${item.key}: ${item.value}`}
            >
              <Text style={[styles.cell, { color: isDark ? '#AAA' : '#666', flex: 1, textTransform: 'capitalize' }]}>
                {item.key.replace(/([A-Z])/g, ' $1')}
              </Text>
              <Text style={[styles.cell, { color: textColor, fontWeight: '600' }]}>{item.value}</Text>
            </View>
          ))}
        </View>

        <View style={styles.chartPlaceholder}>
          <Text style={[styles.chartTitle, { color: textColor }]}>Performance Metrics</Text>
          <View style={[styles.chartBox, { backgroundColor: isDark ? '#1C1C1E' : '#FFF', borderColor }]}>
             <Ionicons name="bar-chart" size={48} color={theme.colors.primary} style={{ opacity: 0.5 }} />
             <Text style={{ color: isDark ? '#666' : '#AAA', marginTop: 10 }}>Chart data visualization loading...</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  container: {
    padding: 16,
  },
  table: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 24,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerCellContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  headerCell: {
    fontWeight: '700',
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 16,
    borderBottomWidth: 1,
    alignItems: 'center',
  },
  cell: {
    fontSize: 16,
  },
  chartPlaceholder: {
    marginTop: 10,
    marginBottom: 40,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  chartBox: {
    height: 200,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
