import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/NavigationRoot';
import { theme } from '../styles/theme';
import { useStore } from '../store';
import { useShallow } from 'zustand/react/shallow';
import { BeautifulMention } from '../components/BeautifulMention';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

type SearchFilterScreenNavigationProp = StackNavigationProp<RootStackParamList, 'SearchFilter'>;

interface Props {
  navigation: SearchFilterScreenNavigationProp;
}

const COUNTRIES = ['USA', 'Germany', 'USSR', 'UK', 'France'];
const GENERATIONS = ['WW2', 'Cold War', 'Modern'];

export const SearchFilterScreen: React.FC<Props> = ({ navigation }) => {
  const currentTheme = useStore((state) => state.theme);
  const isDark = currentTheme === 'dark';

  const categories = useStore(useShallow(state => state.categories));
  
  const selectedCategoryId = useStore((state) => state.selectedCategoryId);
  const setFilterCategory = useStore((state) => state.setFilterCategory);

  const selectedCountry = useStore((state) => state.selectedCountry);
  const setFilterCountry = useStore((state) => state.setFilterCountry);

  const selectedGeneration = useStore((state) => state.selectedGeneration);
  const setFilterGeneration = useStore((state) => state.setFilterGeneration);

  const resetFilters = useStore(state => state.resetFilters);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? theme.colors.backgroundDark : theme.colors.backgroundLight }]} edges={['bottom', 'top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
          <Ionicons name="close" size={24} color={isDark ? '#FFF' : '#000'} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: isDark ? '#FFF' : '#000' }]}>Filters</Text>
        <TouchableOpacity onPress={() => resetFilters()}>
          <Text style={styles.resetText}>Reset</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollContent} contentContainerStyle={styles.scrollLayout}>
        
        {/* Category Mentions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#FFF' : '#000' }]}>Category</Text>
          <View style={styles.mentionsWrap}>
            {categories.map(cat => (
              <BeautifulMention
                key={cat.id}
                label={cat.name}
                isActive={selectedCategoryId === cat.id}
                onPress={() => setFilterCategory(selectedCategoryId === cat.id ? null : cat.id)}
                onRemove={() => setFilterCategory(null)}
              />
            ))}
          </View>
        </View>

        {/* Country Mentions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#FFF' : '#000' }]}>Country</Text>
          <View style={styles.mentionsWrap}>
            {COUNTRIES.map(c => (
              <BeautifulMention
                key={c}
                label={c}
                isActive={selectedCountry === c}
                onPress={() => setFilterCountry(selectedCountry === c ? null : c)}
                onRemove={() => setFilterCountry(null)}
              />
            ))}
          </View>
        </View>

        {/* Generation Mentions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#FFF' : '#000' }]}>Generation</Text>
          <View style={styles.mentionsWrap}>
            {GENERATIONS.map(g => (
              <BeautifulMention
                key={g}
                label={g}
                isActive={selectedGeneration === g}
                onPress={() => setFilterGeneration(selectedGeneration === g ? null : g)}
                onRemove={() => setFilterGeneration(null)}
              />
            ))}
          </View>
        </View>

      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.applyButton}>
          <Text style={styles.applyButtonText}>Show Results</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(128,128,128,0.1)',
  },
  title: {
    ...theme.typography.title,
    fontSize: 18,
  },
  closeButton: {
    padding: 8,
    marginLeft: -8,
  },
  resetText: {
    color: theme.colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  scrollContent: {
    flex: 1,
  },
  scrollLayout: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  mentionsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(128,128,128,0.1)',
  },
  applyButton: {
    backgroundColor: theme.colors.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
