import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Text, Dimensions, StatusBar, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStore } from '../store';
import { ComparisonHeader } from '../components/comparison/ComparisonHeader';
import { AssetPickerModal } from '../components/comparison/AssetPickerModal';
import { theme } from '../styles/theme';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/NavigationRoot';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { BattleForecastModal } from '../components/comparison/BattleForecastModal';
import { Asset } from '../store/slices/assetSlice';
import { t_spec, getFuzzySpec } from '../utils/assetUtils';
import { CDN_CONFIG } from '../config/cdnConfig';

const { width } = Dimensions.get('window');

type NavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

export const ComparisonScreen = () => {
  const [pickerVisible, setPickerVisible] = useState(false);
  const [forecastVisible, setForecastVisible] = useState(false);
  const [deepDive, setDeepDive] = useState(false);
  const comparisonQueue = useStore((state) => state.comparisonQueue);
  const assets = useStore((state) => state.assets);
  const removeFromComparison = useStore((state) => state.removeFromComparison);
  const isDark = useStore((state) => state.theme) === 'dark';
  const navigation = useNavigation<NavigationProp>();
  const { t, i18n } = useTranslation();

  const queuedAssets = React.useMemo(() =>
    comparisonQueue
      .map(id => assets.find(a => a.id === id))
      .filter((a): a is Asset => !!a),
    [comparisonQueue, assets]
  );

  const getPrioritySpecs = (asset: Asset) => {
    return {
      speed: getFuzzySpec(asset, 'short_specs', ['speed', t('asset.speed')], i18n.language),
      armour: getFuzzySpec(asset, 'short_specs', ['armour', t('asset.armour')], i18n.language),
      armament: getFuzzySpec(asset, 'short_specs', ['armament', t('asset.armament')], i18n.language),
    };
  };

  const isBetter = (currentValue: string, otherValues: string[], type: 'speed' | 'armour') => {
    if (otherValues.length === 0) return false;
    const currentNum = parseInt(currentValue.match(/\d+/)?.[0] || '0');
    const others = otherValues.map(v => parseInt(v.match(/\d+/)?.[0] || '0'));
    return currentNum > 0 && others.every(o => currentNum > o);
  };

  const renderComparisonRow = (label: string, specKey: string, isPriority: boolean = false) => (
    <View key={specKey} style={[styles.comparisonRow, { borderBottomColor: isDark ? '#222' : '#EEE' }]}>
      <Text style={[styles.rowLabel, { color: isDark ? '#888' : '#666' }]}>{label.toUpperCase()}</Text>
      <View style={styles.valuesContainer}>
        {queuedAssets.map((asset, idx) => {
          const val = getFuzzySpec(asset, 'short_specs', [specKey, label], i18n.language);
          const others = queuedAssets.filter((_, i) => i !== idx).map(a => getFuzzySpec(a, 'short_specs', [specKey, label], i18n.language));
          const highlighted = (specKey === 'speed' || specKey === 'armour') && isBetter(val, others, specKey as any);

          return (
            <View key={asset.id} style={styles.valueCell}>
              <Text style={[
                styles.valueText,
                { color: highlighted ? '#0A84FF' : (isDark ? '#FFF' : '#000') },
                highlighted && { fontWeight: '900' }
              ]}>
                {val}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#000' : '#F2F2F7' }]} edges={['top']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <ComparisonHeader onAddPress={() => setPickerVisible(true)} />

      {queuedAssets.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={[styles.emptyIconContainer, { backgroundColor: isDark ? '#1C1C1E' : '#E5E5EA' }]}>
            <Ionicons name="git-compare-outline" size={64} color={isDark ? '#444' : '#CCC'} />
          </View>
          <Text style={[styles.emptyText, { color: isDark ? '#888' : '#666' }]}>
            {t('comparison.empty_queue')}
          </Text>
          <Text style={[styles.emptySubtext, { color: isDark ? '#444' : '#999' }]}>
            {t('comparison.empty_subtext')}
          </Text>
        </View>
      ) : (
        <ScrollView style={styles.scrollView}>
          <View style={styles.assetHeaderRow}>
            {queuedAssets.map(asset => (
              <View key={asset.id} style={styles.miniAssetCard}>
                <TouchableOpacity style={styles.miniRemove} onPress={() => removeFromComparison(asset.id)}>
                  <Ionicons name="close-circle" size={20} color={theme.colors.error} />
                </TouchableOpacity>
                <Image
                  source={{ uri: CDN_CONFIG.resolveImage(asset.images?.[0] || asset.image || '') }}
                  style={styles.miniImage}
                />
                <Text style={[styles.miniName, { color: isDark ? '#FFF' : '#000' }]} numberOfLines={1}>{asset.name}</Text>
              </View>
            ))}
            {queuedAssets.length < 3 && (
              <TouchableOpacity
                style={[styles.miniAddSlot, { backgroundColor: isDark ? '#1C1C1E' : '#FFF' }]}
                onPress={() => setPickerVisible(true)}
              >
                <Ionicons name="add" size={24} color="#0A84FF" />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.comparisonBox}>
            <Text style={styles.sectionTitle}>{t('comparison.core_specs')}</Text>
            {renderComparisonRow(t('asset.speed'), 'speed')}
            {renderComparisonRow(t('asset.armour'), 'armour')}
            {renderComparisonRow(t('asset.armament'), 'primary_armament')}
          </View>

          <TouchableOpacity
            style={styles.deepDiveToggle}
            onPress={() => setDeepDive(!deepDive)}
          >
            <Text style={styles.deepDiveText}>
              {deepDive ? t('comparison.hide_details') : t('comparison.deep_dive')}
            </Text>
            <Ionicons name={deepDive ? 'chevron-up' : 'chevron-down'} size={16} color="#0A84FF" />
          </TouchableOpacity>

          {deepDive && (
            <View style={styles.comparisonBox}>
              {/* Filter out priority specs already shown */}
              {Array.from(new Set(queuedAssets.flatMap(a => Object.keys(a.short_specs))))
                .filter(key => !['speed', 'armour', 'primary_armament'].includes(key))
                .map(key => renderComparisonRow(t(`asset.${key}`) !== `asset.${key}` ? t(`asset.${key}`) : key.replace(/_/g, ' '), key))
              }
            </View>
          )}

          {queuedAssets.length === 2 && (
            <TouchableOpacity
              style={[styles.simulationButton, { backgroundColor: theme.colors.primary }]}
              onPress={() => setForecastVisible(true)}
            >
              <Ionicons name="shield-half-outline" size={24} color="#FFF" />
              <Text style={styles.simulationButtonText}>{t('comparison.initiate_simulation')}</Text>
            </TouchableOpacity>
          )}
          <View style={{ height: 100 }} />
        </ScrollView>
      )}

      <AssetPickerModal
        visible={pickerVisible}
        onClose={() => setPickerVisible(false)}
      />

      {queuedAssets.length === 2 && (
        <BattleForecastModal
          visible={forecastVisible}
          onClose={() => setForecastVisible(false)}
          assetA={queuedAssets[0]}
          assetB={queuedAssets[1]}
          isDark={isDark}
        />
      )}
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 40,
    alignItems: 'flex-start',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  emptySubtext: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  spacer: {
    height: 60,
  },
  assetHeaderRow: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  miniAssetCard: {
    width: (width - 64) / 3,
    alignItems: 'center',
  },
  miniImage: {
    width: '100%',
    height: 60,
    borderRadius: 12,
    marginBottom: 8,
  },
  miniName: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  miniRemove: {
    position: 'absolute',
    top: -5,
    right: -5,
    zIndex: 1,
  },
  miniAddSlot: {
    width: (width - 64) / 3,
    height: 60,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#0A84FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  comparisonBox: {
    margin: 16,
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#0A84FF',
    letterSpacing: 2,
    marginBottom: 16,
    textTransform: 'uppercase',
  },
  comparisonRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    alignItems: 'center',
  },
  rowLabel: {
    fontSize: 10,
    fontWeight: '700',
    width: 80,
  },
  valuesContainer: {
    flex: 1,
    flexDirection: 'row',
    gap: 12,
  },
  valueCell: {
    flex: 1,
    alignItems: 'center',
  },
  valueText: {
    fontSize: 13,
    textAlign: 'center',
  },
  deepDiveToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 8,
  },
  deepDiveText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0A84FF',
  },
  addSlot: {
    width: 260,
    height: 480, // Approximate height of the card
    marginHorizontal: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: 'rgba(128,128,128,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addSlotText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '600',
  },
  simulationContainer: {
    padding: 16,
    paddingBottom: 32,
    backgroundColor: 'transparent',
  },
  simulationButton: {
    margin: 16,
    height: 56,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  simulationButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
    marginLeft: 10,
  },
});
