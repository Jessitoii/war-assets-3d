import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SplashScreen } from '../screens/SplashScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { SearchFilterScreen } from '../screens/SearchFilterScreen';
import { AssetDetailScreen } from '../screens/AssetDetailScreen';
import { CategoryScreen } from '../screens/CategoryScreen';
import { initDB } from '../scripts/init-db';
import { useStore } from '../store';
import { TechnicalSpecsScreen } from '../screens/TechnicalSpecsScreen';
import { ModelViewerScreen } from '../screens/ModelViewerScreen';
import { ComparisonScreen } from '../screens/ComparisonScreen';
import { SettingsScreen } from '../screens/SettingsScreen';

export type RootStackParamList = {
  Splash: undefined;
  Home: undefined;
  Onboarding: undefined;
  SearchFilter: undefined;
  AssetDetail: { assetId: string };
  Category: { categoryId: string };
  TechnicalSpecs: { assetId: string };
  ModelViewer: { assetId: string };
  Comparison: undefined;
  Settings: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export const NavigationRoot = () => {
  const [dbReady, setDbReady] = useState(false);
  const setFirstLaunch = useStore((state) => state.setFirstLaunch);
  const setOnboardingProgress = useStore((state) => state.setOnboardingProgress);
  const setTheme = useStore((state) => state.setTheme);
  const setFavorites = useStore((state) => state.setFavorites);
  const setComparisonQueue = useStore((state) => state.setComparisonQueue);

  useEffect(() => {
    async function setupDb() {
      try {
        const db = await initDB();
        // Since sqlite is init, might sync to store if needed
        const result: any = await db.getFirstAsync('SELECT firstLaunch, onboardingProgress, theme, supportsAR FROM app_state WHERE id = 1');
        if (result) {
          setFirstLaunch(Boolean(result.firstLaunch));
          setOnboardingProgress(result.onboardingProgress || 0);
          setTheme(result.theme || 'light');
          // Update supportsAR in store
          useStore.getState().setSupportsAR(Boolean(result.supportsAR));
        }

        const favs: any[] = await db.getAllAsync('SELECT assetId FROM favorites');
        setFavorites(favs.map(f => f.assetId));

        const queue: any[] = await db.getAllAsync('SELECT assetId FROM comparison_queue');
        setComparisonQueue(queue.map(q => q.assetId));
      } catch (e) {
        console.error('DB Error: ', e);
      } finally {
        setDbReady(true);
      }
    }
    setupDb();
  }, [setFirstLaunch, setOnboardingProgress, setFavorites, setComparisonQueue, setTheme]);

  if (!dbReady) {
    return null; // or a simple loading indicator
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Group screenOptions={{ presentation: 'modal' }}>
          <Stack.Screen name="SearchFilter" component={SearchFilterScreen} />
        </Stack.Group>
        <Stack.Screen name="AssetDetail" component={AssetDetailScreen} />
        <Stack.Screen name="Category" component={CategoryScreen} />
        <Stack.Screen name="TechnicalSpecs" component={TechnicalSpecsScreen} />
        <Stack.Screen name="ModelViewer" component={ModelViewerScreen} />
        <Stack.Screen name="Comparison" component={ComparisonScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
