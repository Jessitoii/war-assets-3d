import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/NavigationRoot';
import { theme } from '../styles/theme';
import { useStore, selectFeaturedAssets, selectCategories } from '../store';
import { useShallow } from 'zustand/react/shallow';
import { HeaderBar } from '../components/HeaderBar';
import { SearchBar } from '../components/SearchBar';
import { QuickAccessCard } from '../components/QuickAccessCard';
import { CategoryGrid } from '../components/CategoryGrid';
import { initDB } from '../scripts/init-db';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

interface Props {
  navigation: HomeScreenNavigationProp;
}

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const currentTheme = useStore((state) => state.theme);
  const isDark = currentTheme === 'dark';
  
  const featuredAssets = useStore(useShallow(selectFeaturedAssets));
  const categories = useStore(useShallow(selectCategories));
  const setAssets = useStore((state) => state.setAssets);
  const setCategories = useStore((state) => state.setCategories);

  useEffect(() => {
    async function loadData() {
      try {
        const db = await initDB();
        
        // Fetch Categories
        const cats: any[] = await db.getAllAsync('SELECT * FROM categories');
        if (cats.length > 0) {
          setCategories(cats);
        }

        // Fetch Assets and map to Frontend Model
        const rawAssets: any[] = await db.getAllAsync('SELECT * FROM assets');
        if (rawAssets.length > 0) {
          const mappedAssets = rawAssets.map(a => ({
            id: a.id,
            name: a.name,
            categoryId: a.catId, // Map catId to categoryId
            isFeatured: !!a.featured, // Map featured to isFeatured
            image: a.img, // Map img to image
            modelUrl: a.model, // Map model to modelUrl
            dangerLevel: a.dangerLevel,
            threatType: a.threatType,
            specs: a.specs ? JSON.parse(a.specs) : undefined
          }));
          setAssets(mappedAssets);
        }
      } catch (e) {
        console.error('Failed to load home data:', e);
      }
    }
    loadData();
  }, [setAssets, setCategories]);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: isDark ? theme.colors.backgroundDark : theme.colors.backgroundLight }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <View style={styles.container}>
        <HeaderBar 
          onSearchPress={() => navigation.navigate('SearchFilter')} 
          onComparePress={() => navigation.navigate('Comparison')}
          onSettingsPress={() => navigation.navigate('Settings')}
        />
        
        <ScrollView showsVerticalScrollIndicator={false}>
          <SearchBar onPress={() => navigation.navigate('SearchFilter')} />

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: isDark ? '#FFF' : '#000' }]}>Featured Assets</Text>
            {featuredAssets.length > 0 ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.featuredScroll}>
                {featuredAssets.map((asset) => (
                  <QuickAccessCard
                    key={asset.id}
                    asset={asset}
                    onPress={() => navigation.navigate('AssetDetail', { assetId: asset.id })}
                  />
                ))}
              </ScrollView>
            ) : (
              <View style={styles.emptyState}>
                <Text style={{ color: isDark ? '#666' : '#AAA' }}>No featured assets yet</Text>
              </View>
            )}
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: isDark ? '#FFF' : '#000' }]}>Categories</Text>
            {categories.length > 0 ? (
              <CategoryGrid
                categories={categories}
                onCategoryPress={(categoryId) => navigation.navigate('Category', { categoryId })}
              />
            ) : (
              <View style={styles.emptyState}>
                <Text style={{ color: isDark ? '#666' : '#AAA' }}>Categories loading...</Text>
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  featuredScroll: {
    paddingRight: 16,
  },
  emptyState: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(128,128,128,0.05)',
    borderRadius: 12,
  },
});
