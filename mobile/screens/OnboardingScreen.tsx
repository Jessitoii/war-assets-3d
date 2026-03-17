import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Image } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, runOnJS, useAnimatedScrollHandler } from 'react-native-reanimated';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/NavigationRoot';
import { useStore, selectOnboardingContent, selectOnboardingCurrentPage } from '../store';
import { useShallow } from 'zustand/react/shallow';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../styles/theme';
import { initDB } from '../scripts/init-db';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

type OnboardingScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Onboarding'>;

interface Props {
  navigation: OnboardingScreenNavigationProp;
}

export const OnboardingScreen: React.FC<Props> = ({ navigation }) => {
  const content = useStore(useShallow(selectOnboardingContent));
  const currentPage = useStore(selectOnboardingCurrentPage);
  const onboardingProgress = useStore((state) => state.onboardingProgress);
  
  // Select actions individually to avoid reference changes
  const setCurrentPage = useStore((state) => state.onboarding.setCurrentPage);
  const setContent = useStore((state) => state.onboarding.setContent);
  const setFirstLaunch = useStore((state) => state.setFirstLaunch);
  const setOnboardingProgress = useStore((state) => state.setOnboardingProgress);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<Animated.ScrollView>(null);
  const isInitialScrollDone = useRef(false);

  const fetchContent = async () => {
    try {
      const db = await initDB();
      // network fetch simulation
      let remoteData: any = null;
      try {
        const res = await fetch('http://localhost:3000/api/v1/onboarding/content');
        if (res.ok) {
          remoteData = await res.json();
        }
      } catch (e) {
        console.log('Network failed, using fallback.');
      }

      if (remoteData) {
        // Write to DB
        await db.withTransactionAsync(async () => {
          for (const item of remoteData) {
            await db.runAsync(
              `INSERT OR REPLACE INTO onboarding_content (id, title, subtitle, description, image, orderIndex)
               VALUES (?, ?, ?, ?, ?, ?)`,
              [item.id, item.title, item.subtitle, item.description || '', item.image, item.orderIndex]
            );
          }
        });
      } else {
        const fallback = require('../assets/onboarding.json');
        await db.withTransactionAsync(async () => {
           for (const item of fallback) {
             await db.runAsync(
               `INSERT OR REPLACE INTO onboarding_content (id, title, subtitle, description, image, orderIndex)
                VALUES (?, ?, ?, ?, ?, ?)`,
               [item.id, item.title, item.subtitle, item.description || '', item.image, item.orderIndex]
             );
           }
         });
      }

      const result: any[] = await db.getAllAsync('SELECT * FROM onboarding_content ORDER BY orderIndex ASC');
      if (result && result.length > 0) {
        setContent(result);
      }
    } catch (e: any) {
      console.error('Failed to load onboarding content', e);
      setError(e.message || 'Unknown initialization error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  // Initial scroll to persisted progress
  useEffect(() => {
    if (!loading && content.length > 0 && !isInitialScrollDone.current) {
      if (onboardingProgress > 0 && onboardingProgress < content.length) {
        setCurrentPage(onboardingProgress);
        scrollRef.current?.scrollTo({ x: onboardingProgress * width, animated: false });
      }
      isInitialScrollDone.current = true;
    }
  }, [loading, content, onboardingProgress, setCurrentPage]);

  // Persist progress on change
  useEffect(() => {
    if (isInitialScrollDone.current) {
      async function persistProgress() {
        try {
          const db = await initDB();
          await db.execAsync(`UPDATE app_state SET onboardingProgress = ${currentPage} WHERE id = 1;`);
          setOnboardingProgress(currentPage);
        } catch (e) {
          console.error('Progress sync error', e);
        }
      }
      persistProgress();
    }
  }, [currentPage, setOnboardingProgress]);

  const handleComplete = async () => {
    try {
      const db = await initDB();
      await db.execAsync(`UPDATE app_state SET firstLaunch = 0, onboardingProgress = 0 WHERE id = 1;`);
      setFirstLaunch(false);
      setOnboardingProgress(0);
      setCurrentPage(0);
      navigation.replace('Home');
    } catch(e) {
      console.error(e);
      setFirstLaunch(false);
      navigation.replace('Home');
    }
  };

  const handleNext = () => {
    if (currentPage < content.length - 1) {
      const nextPage = currentPage + 1;
      scrollRef.current?.scrollTo({ x: nextPage * width, animated: true });
    }
  };

  const scrollHandler = useAnimatedScrollHandler({
    onMomentumEnd: (e) => {
      const page = Math.round(e.contentOffset.x / width);
      runOnJS(setCurrentPage)(page);
    },
  });

  if (error) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="alert-circle" size={64} color={theme.colors.error} style={styles.loaderIcon} />
        <Text style={styles.loadingTitle}>SYSTEM CRITICAL ERROR</Text>
        <Text style={styles.loadingSubtitle}>{error}</Text>
        <TouchableOpacity 
          style={[styles.getStartedBtn, { marginTop: 30 }]} 
          onPress={() => { setError(null); setLoading(true); fetchContent(); }}
        >
          <Text style={styles.getStartedText}>RETRY INITIALIZATION</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (loading || content.length === 0) {
     return (
       <View style={styles.loadingContainer}>
         <Ionicons name="shield-checkmark" size={64} color={theme.colors.primary} style={styles.loaderIcon} />
         <Text style={styles.loadingTitle}>INITIALIZING SYSTEM</Text>
         <Text style={styles.loadingSubtitle}>Establishing secure database connection...</Text>
       </View>
     );
  }

  const isLastPage = currentPage === content.length - 1;
  const currentItem = content[currentPage];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.skipBtn} onPress={handleComplete} accessibilityLabel="Skip Onboarding" accessibilityRole="button">
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>
      <Animated.ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        style={styles.carousel}
      >
        {content.map((item) => (
          <View key={item.id} style={styles.slide} accessible={true} accessibilityLabel={`Page ${item.orderIndex + 1}`} accessibilityLiveRegion="polite">
            <Image source={{ uri: item.image }} style={styles.image} resizeMode="contain" accessible={false} />
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.subtitle}>{item.subtitle}</Text>
          </View>
        ))}
      </Animated.ScrollView>
      
      <View style={styles.footer}>
        <View style={styles.indicators}>
           {content.map((_, index) => (
             <View key={index} style={[styles.dot, currentPage === index && styles.dotActive]} />
           ))}
        </View>
        
        <View style={styles.footerControls}>
          {isLastPage ? (
            <TouchableOpacity style={styles.getStartedBtn} onPress={handleComplete} accessibilityLabel="Get Started" accessibilityRole="button">
              <Text style={styles.getStartedText}>Get Started</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.nextBtn} onPress={handleNext} disabled={isLastPage} accessibilityLabel="Next Page" accessibilityRole="button">
              <Text style={styles.nextText}>Next</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.backgroundLight,
  },
  header: {
    height: 60,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
  },
  skipBtn: {
    padding: 10,
  },
  skipText: {
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  carousel: {
    flex: 1,
  },
  slide: {
    width,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  image: {
    width: width * 0.8,
    height: width * 0.8,
    marginBottom: 40,
  },
  title: {
    ...theme.typography.title,
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    ...theme.typography.body,
    color: '#888',
    textAlign: 'center',
  },
  footer: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  indicators: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ccc',
    marginHorizontal: 4,
  },
  dotActive: {
    backgroundColor: theme.colors.primary,
    width: 16,
  },
  footerControls: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 50,
  },
  nextBtn: {
    position: 'absolute',
    right: 0,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  nextText: {
    color: theme.colors.primary,
    fontWeight: 'bold',
    fontSize: 16,
  },
  getStartedBtn: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
  },
  getStartedText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  placeholderBtn: {
    height: 50, // same as getStartedBtn
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: theme.colors.backgroundDark,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loaderIcon: {
    marginBottom: 20,
    opacity: 0.8,
  },
  loadingTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 8,
  },
  loadingSubtitle: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
  }
});
