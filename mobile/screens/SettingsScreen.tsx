import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, Alert } from 'react-native';
import { useStore } from '../store';
import * as SQLite from 'expo-sqlite';
import * as FileSystem from 'expo-file-system/legacy';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export const SettingsScreen = () => {
  const theme = useStore((state) => state.theme);
  const setTheme = useStore((state) => state.setTheme);
  const arEnabled = useStore((state) => state.arEnabled);
  const setArEnabled = useStore((state) => state.setArEnabled);
  const supportsAR = useStore((state) => state.supportsAR);

  const [isSyncing, setIsSyncing] = useState(false);
  const [offlineStatus, setOfflineStatus] = useState({
    is_offline_ready: false,
    db_size_bytes: 0,
    last_sync: null as string | null,
  });

  const isDark = theme === 'dark';
  const colors = {
    bg: isDark ? '#1a1a2e' : '#f0f2f5',
    card: isDark ? '#16213e' : '#ffffff',
    text: isDark ? '#e2e8f0' : '#2d3748',
    subtext: isDark ? '#94a3b8' : '#718096',
    border: isDark ? '#2e3748' : '#e2e8f0',
    primary: '#3182ce',
  };

  const fetchOfflineStatus = async () => {
    try {
      const db = await SQLite.openDatabaseAsync('war-assets.db');
      const result: any = await db.getFirstAsync('SELECT * FROM offline_status WHERE id = 1');
      if (result) {
        setOfflineStatus({
          is_offline_ready: Boolean(result.is_offline_ready),
          db_size_bytes: result.db_size_bytes || 0,
          last_sync: result.last_sync,
        });
      }
    } catch (e) {
      console.error('Failed to fetch offline status', e);
    }
  };

  useEffect(() => {
    fetchOfflineStatus();
  }, []);

  const handleToggleTheme = () => {
    const newTheme = isDark ? 'light' : 'dark';
    setTheme(newTheme);
  };

  const handleToggleAR = () => {
    if (!supportsAR) {
      Alert.alert('AR Not Supported', 'Your device does not support AR features.');
      return;
    }
    setArEnabled(!arEnabled);
  };

  const handleDataSync = async () => {
    setIsSyncing(true);
    try {
      // Mock API call to /api/v1/sync
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const dbInfo = await FileSystem.getInfoAsync((FileSystem.documentDirectory || '') + 'SQLite/war-assets.db');
      const dbSize = dbInfo.exists ? dbInfo.size : 0;
      const timestamp = new Date().toISOString();

      const db = await SQLite.openDatabaseAsync('war-assets.db');
      await db.runAsync(
        'UPDATE offline_status SET is_offline_ready = 1, db_size_bytes = ?, last_sync = ? WHERE id = 1',
        [dbSize, timestamp]
      );
      
      await fetchOfflineStatus();
      Alert.alert('Sync Complete', 'Data successfully synchronized.');
    } catch (e) {
      Alert.alert('Sync Failed', 'Could not synchronize data.');
      console.error(e);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Settings</Text>
      </View>

      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.subtext }]}>Appearance</Text>
        
        <View style={styles.row}>
          <View style={styles.rowText}>
            <Text style={[styles.rowTitle, { color: colors.text }]}>Dark Mode</Text>
            <Text style={[styles.rowSubtitle, { color: colors.subtext }]}>Toggle application theme</Text>
          </View>
          <Switch 
            value={isDark} 
            onValueChange={handleToggleTheme}
            trackColor={{ true: colors.primary, false: colors.border }}
            accessibilityHint="Toggles dark mode"
          />
        </View>
      </View>

      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.subtext }]}>Data & Sync</Text>
        
        <View style={styles.stateContainer}>
          <View style={styles.stateRow}>
            <Ionicons name={offlineStatus.is_offline_ready ? "cloud-done" : "cloud-offline"} size={24} color={colors.primary} />
            <View style={{ marginLeft: 12 }}>
              <Text style={[styles.rowTitle, { color: colors.text }]}>
                {offlineStatus.is_offline_ready ? "Offline Ready" : "Online Only"}
              </Text>
              <Text style={[styles.rowSubtitle, { color: colors.subtext }]}>
                DB Size: {(offlineStatus.db_size_bytes / 1024).toFixed(1)} KB
              </Text>
              {offlineStatus.last_sync && (
                <Text style={[styles.rowSubtitle, { color: colors.subtext }]}>
                  Last Sync: {new Date(offlineStatus.last_sync).toLocaleString()}
                </Text>
              )}
            </View>
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.syncButton, { backgroundColor: colors.primary, opacity: isSyncing ? 0.7 : 1 }]}
          onPress={handleDataSync}
          disabled={isSyncing}
        >
          <Ionicons name="sync" size={20} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.syncButtonText}>
            {isSyncing ? "Syncing..." : "Sync Data Now"}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.subtext }]}>Features</Text>
        
        <View style={styles.row}>
          <View style={styles.rowText}>
            <Text style={[styles.rowTitle, { color: colors.text }]}>Enable AR Features</Text>
            <Text style={[styles.rowSubtitle, { color: colors.subtext }]}>
              {supportsAR ? "Allow placing models in AR" : "AR not supported on this device"}
            </Text>
          </View>
          <Switch 
            value={arEnabled} 
            onValueChange={handleToggleAR}
            disabled={!supportsAR}
            trackColor={{ true: colors.primary, false: colors.border }}
            accessibilityHint="Toggles augmented reality capability"
          />
        </View>
      </View>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  section: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 16,
    letterSpacing: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowText: {
    flex: 1,
    paddingRight: 16,
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  rowSubtitle: {
    fontSize: 14,
  },
  stateContainer: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 8,
  },
  stateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  syncButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 8,
  },
  syncButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
