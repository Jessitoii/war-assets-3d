import 'react-native-gesture-handler'; // Required for react-navigation
import React from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { NavigationRoot } from './navigation/NavigationRoot';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync().catch(() => {
  /* reloading the app might cause it to already be hidden */
});

export default function App() {
  return (
    <>
      <StatusBar style="light" />
      <NavigationRoot />
    </>
  );
}

