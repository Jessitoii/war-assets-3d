import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, FlatList, LayoutAnimation, Platform, UIManager } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/NavigationRoot';
import { theme } from '../styles/theme';
import { useStore } from '../store';
import { useShallow } from 'zustand/react/shallow';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { QuickAccessCard } from '../components/QuickAccessCard';
import { useTranslation } from 'react-i18next';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type SearchFilterScreenNavigationProp = StackNavigationProp<RootStackParamList, 'SearchFilter'>;

interface Props {
  navigation: SearchFilterScreenNavigationProp;
}

interface FilterState {
  searchQuery: string;
  catIds: string[];
  threatTypes: string[];
  countryCodes: string[];
  dangerLevels: string[];
}

export const SearchFilterScreen: React.FC<Props> = ({ navigation }) => {
  const currentTheme = useStore((state) => state.theme);
  const isDark = currentTheme === 'dark';
  const { t } = useTranslation();

  const categories = useStore(useShallow(state => state.categories));
  const allAssets = useStore(state => state.assets);

  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    catIds: [],
    threatTypes: [],
    countryCodes: [],
    dangerLevels: [],
  });

  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Derived metadata from assets
  const countries = useMemo(() => {
    const codes = Array.from(new Set(allAssets.map(a => a.countryCode).filter(Boolean)));
    return codes.sort() as string[];
  }, [allAssets]);

  const threatTypes = useMemo(() => {
    const types = Array.from(new Set(allAssets.map(a => a.threatType).filter(Boolean)));
    return types.sort() as string[];
  }, [allAssets]);

  // Debounce logic
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(filters.searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [filters.searchQuery]);

  const getDangerLevel = (danger?: number) => {
    if (danger === undefined) return t('common.low');
    if (danger < 33) return t('common.low');
    if (danger < 67) return t('common.medium');
    return t('common.high');
  };

  const filteredAssets = useMemo(() => {
    return allAssets.filter(asset => {
      if (debouncedSearch) {
        const query = debouncedSearch.toLowerCase();
        if (!asset.name?.toLowerCase().includes(query) && !asset.id?.toLowerCase().includes(query)) return false;
      }
      if (filters.catIds.length > 0 && !filters.catIds.includes(asset.catId)) return false;
      if (filters.threatTypes.length > 0 && !filters.threatTypes.includes(asset.threatType || '')) return false;
      if (filters.countryCodes.length > 0 && !filters.countryCodes.includes(asset.countryCode || '')) return false;
      if (filters.dangerLevels.length > 0) {
        if (!filters.dangerLevels.includes(getDangerLevel(asset.dangerLevel))) return false;
      }
      return true;
    });
  }, [allAssets, filters, debouncedSearch]);

  const toggleFilter = (key: keyof FilterState, value: string) => {
    setFilters(prev => {
      const current = prev[key] as string[];
      const exists = current.includes(value);
      return {
        ...prev,
        [key]: exists ? current.filter(v => v !== value) : [...current, value]
      };
    });
  };

  const resetAllFilters = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setFilters({
      searchQuery: '',
      catIds: [],
      threatTypes: [],
      countryCodes: [],
      dangerLevels: [],
    });
  };

  const toggleFilterPanel = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsFilterVisible(!isFilterVisible);
  };

  const renderChip = (category: keyof FilterState, value: string, label?: string) => {
    const isActive = (filters[category] as string[]).includes(value);
    return (
      <TouchableOpacity
        key={value}
        onPress={() => toggleFilter(category, value)}
        style={[
          styles.chip,
          { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' },
          isActive && styles.activeChip
        ]}
      >
        <Text style={[styles.chipText, { color: isDark ? '#AAA' : '#666' }, isActive && styles.activeChipText]}>
          {label || value}
        </Text>
      </TouchableOpacity>
    );
  };

  const hasActiveFilters = filters.catIds.length > 0 || filters.threatTypes.length > 0 || filters.countryCodes.length > 0 || filters.dangerLevels.length > 0;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? theme.colors.backgroundDark : theme.colors.backgroundLight }]} edges={['bottom', 'top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
          <Ionicons name="close" size={24} color={isDark ? '#FFF' : '#000'} />
        </TouchableOpacity>

        <View style={styles.searchWrapper}>
          <Ionicons name="search" size={18} color={isDark ? '#888' : '#AAA'} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: isDark ? '#FFF' : '#000', backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}
            placeholder={t('search.placeholder')}
            placeholderTextColor={isDark ? '#666' : '#999'}
            value={filters.searchQuery}
            onChangeText={(text) => setFilters(prev => ({ ...prev, searchQuery: text }))}
            autoFocus={true}
          />
        </View>

        <TouchableOpacity onPress={toggleFilterPanel} style={[styles.filterToggle, isFilterVisible && styles.activeToggle]}>
          <Ionicons name="options" size={20} color={isFilterVisible ? '#FFF' : theme.colors.primary} />
          <Text style={[styles.toggleText, { color: isFilterVisible ? '#FFF' : theme.colors.primary }]}>{t('search.filter')}</Text>
        </TouchableOpacity>
      </View>

      {isFilterVisible && (
        <View style={[styles.filterPanel, { backgroundColor: isDark ? '#111' : '#F9F9F9' }]}>
          <ScrollView contentContainerStyle={styles.panelScroll}>
            <View style={styles.panelSection}>
              <Text style={styles.sectionHeader}>{t('search.origin')}</Text>
              <View style={styles.chipGrid}>
                {countries.map(code => renderChip('countryCodes', code))}
              </View>
            </View>

            <View style={styles.panelSection}>
              <Text style={styles.sectionHeader}>{t('search.threat_type')}</Text>
              <View style={styles.chipGrid}>
                {threatTypes.map(type => renderChip('threatTypes', type))}
              </View>
            </View>

            <View style={styles.panelSection}>
              <Text style={styles.sectionHeader}>{t('search.level')}</Text>
              <View style={styles.chipGrid}>
                {[t('common.low'), t('common.medium'), t('common.high')].map(level => renderChip('dangerLevels', level))}
              </View>
            </View>

            {hasActiveFilters && (
              <TouchableOpacity onPress={resetAllFilters} style={styles.panelClearAll}>
                <Text style={styles.clearAllText}>{t('search.clear_all')}</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>
      )}

      <FlatList
        data={filteredAssets}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.columnWrapper}
        renderItem={({ item }) => (
          <View style={styles.cardWrapper}>
            <QuickAccessCard
              asset={item}
              onPress={() => navigation.navigate('AssetDetail', { assetId: item.id })}
            />
          </View>
        )}
        ListHeaderComponent={
          <View style={styles.resultsHeader}>
            <Text style={[styles.resultsCount, { color: isDark ? theme.colors.primary : '#333' }]}>
              {filteredAssets.length} {t('common.active_hotspots')}
            </Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="alert-circle-outline" size={64} color={theme.colors.primary} style={{ marginBottom: 16 }} />
            <Text style={[styles.emptyTitle, { color: isDark ? '#FFF' : '#000' }]}>{t('search.no_assets_db')}</Text>
            <Text style={[styles.emptySubtitle, { color: isDark ? '#888' : '#666' }]}>{t('search.adjust_filters')}</Text>
            <TouchableOpacity onPress={resetAllFilters} style={styles.refreshButton}>
              <Text style={styles.refreshButtonText}>{t('search.reset_filters')}</Text>
            </TouchableOpacity>
          </View>
        }
      />
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(128,128,128,0.1)',
  },
  closeButton: {
    padding: 4,
    marginRight: 8,
  },
  searchWrapper: {
    flex: 1,
    position: 'relative',
    justifyContent: 'center',
  },
  searchIcon: {
    position: 'absolute',
    left: 12,
    zIndex: 1,
  },
  searchInput: {
    height: 40,
    borderRadius: 20,
    paddingLeft: 38,
    paddingRight: 12,
    fontSize: 16,
  },
  filterToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginLeft: 8,
    borderWidth: 1,
    borderColor: 'rgba(10, 132, 255, 0.3)',
  },
  activeToggle: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  toggleText: {
    fontSize: 10,
    fontWeight: '900',
    marginLeft: 4,
    letterSpacing: 1,
  },
  filterPanel: {
    maxHeight: 400,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(128,128,128,0.2)',
  },
  panelScroll: {
    paddingVertical: 16,
  },
  panelSection: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: 10,
    fontWeight: '900',
    color: '#888',
    marginBottom: 12,
    letterSpacing: 2,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  activeChip: {
    backgroundColor: 'rgba(10, 132, 255, 0.1)',
    borderColor: theme.colors.primary,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 3,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  activeChipText: {
    color: theme.colors.primary,
    fontWeight: '800',
  },
  panelClearAll: {
    alignItems: 'center',
    paddingVertical: 12,
    marginHorizontal: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 69, 58, 0.3)',
    borderRadius: 4,
  },
  clearAllText: {
    color: '#FF453A',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
  },
  resultsHeader: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: 'rgba(10, 132, 255, 0.05)',
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
  },
  resultsCount: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 2,
  },
  listContent: {
    padding: 16,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  cardWrapper: {
    width: '48%',
  },
  emptyState: {
    padding: 60,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 13,
    marginBottom: 24,
    textAlign: 'center',
  },
  refreshButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 4,
  },
  refreshButtonText: {
    color: '#FFF',
    fontWeight: '900',
    fontSize: 12,
    letterSpacing: 1,
  },
});
