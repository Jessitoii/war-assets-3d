import * as SQLite from 'expo-sqlite';

// Defines the boundary for app state slice
export interface AppState {
  firstLaunch: boolean;
  theme: 'light' | 'dark';
  arEnabled: boolean;
  onboardingProgress: number;
  supportsAR: boolean;
  language: 'en' | 'tr';
  setFirstLaunch: (value: boolean) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setLanguage: (lang: 'en' | 'tr') => void;
  setArEnabled: (enabled: boolean) => void;
  setSupportsAR: (supported: boolean) => void;
  setOnboardingProgress: (page: number) => void;
}

export const createAppSlice = (set: any): AppState => ({
  firstLaunch: true,
  theme: 'light',
  language: 'en',
  arEnabled: false,
  supportsAR: false,
  onboardingProgress: 0,
  setFirstLaunch: (value) => 
    set((state: any) => ({ ...state, firstLaunch: value })),
  setTheme: (theme) => {
    set((state: any) => ({ ...state, theme }));
    // Persist to SQLite
    SQLite.openDatabaseAsync('war-assets.db').then(db => {
      db.runAsync('UPDATE app_state SET theme = ? WHERE id = 1', [theme])
        .catch(e => console.error('Failed to persist theme:', e));
    });
  },
  setLanguage: (lang) => {
    set((state: any) => ({ ...state, language: lang }));
    SQLite.openDatabaseAsync('war-assets.db').then(db => {
      db.runAsync('UPDATE app_state SET language = ? WHERE id = 1', [lang])
        .catch(e => console.error('Failed to persist language:', e));
    });
  },
  setArEnabled: (enabled) => 
    set((state: any) => ({ ...state, arEnabled: enabled })),
  setSupportsAR: (supported) => {
    set((state: any) => ({ ...state, supportsAR: supported }));
    SQLite.openDatabaseAsync('war-assets.db').then(db => {
      db.runAsync('UPDATE app_state SET supportsAR = ? WHERE id = 1', [supported ? 1 : 0])
        .catch(e => console.error('Failed to persist supportsAR:', e));
    });
  },
  setOnboardingProgress: (page) =>
    set((state: any) => ({ ...state, onboardingProgress: page })),
});
