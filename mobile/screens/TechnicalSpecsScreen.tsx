import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/NavigationRoot';
import { theme } from '../styles/theme';
import { useStore } from '../store';
import { Ionicons } from '@expo/vector-icons';
import { PerformanceRadar } from '../components/asset-detail/PerformanceRadar';
import { useTranslation } from 'react-i18next';
import { DossierModal } from '../components/asset-detail/DossierModal';
import { getFlagEmoji } from '../utils/countryUtils';
import { t_spec } from '../utils/assetUtils';

type Props = StackScreenProps<RootStackParamList, 'TechnicalSpecs'>;

export const TechnicalSpecsScreen: React.FC<Props> = ({ route, navigation }) => {
  const { assetId } = route.params;
  const { t, i18n } = useTranslation();
  const isDark = useStore((state) => state.theme === 'dark');
  const asset = useStore((state) => state.assets.find(a => a.id === assetId));

  const [modalVisible, setModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState('');
  const [modalTitle, setModalTitle] = useState('');

  if (!asset) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: isDark ? theme.colors.backgroundDark : theme.colors.backgroundLight }]}>
        <Text style={{ color: isDark ? '#FFF' : '#000' }}>{t('asset.not_found')}</Text>
      </SafeAreaView>
    );
  }

  const textColor = isDark ? '#FFF' : '#000';
  const borderColor = isDark ? '#333' : '#E5E5EA';

  const getDossierContent = (specKey: string) => {
    if (!asset.full_dossier) return null;

    // We search for a corresponding entry in the full_dossier
    // Heuristic: matching key or key + "_insight" or common prefix + "_insight"
    const possibleKeys = [
      specKey,
      `${specKey}_insight`,
      `${specKey.split('_')[0]}_insight`,
      // Some assets use insight_N
      ...Object.keys(asset.full_dossier).filter(k => k.startsWith('insight_'))
    ];

    for (const k of possibleKeys) {
      const content = t_spec(asset, 'full_dossier', k, i18n.language);
      if (content && content !== 'N/A' && content.length > 10) {
        return { title: k, content };
      }
    }

    return null;
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: isDark ? theme.colors.backgroundDark : theme.colors.backgroundLight }]} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="close" size={28} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: textColor }]}>{t('common.technical_specs')}</Text>
      </View>

      <ScrollView style={styles.container}>
        <View style={[styles.countryBadge, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)' }]}>
          <Text style={styles.flagText}>
            {getFlagEmoji(asset.countryCode || '')}
          </Text>
          <Text style={[styles.countryName, { color: textColor }]}>
            {asset.country || t('common.global')}
          </Text>
        </View>

        {/* 2-Column Specs Grid */}
        <View style={styles.specsGrid}>
          {Object.entries(asset.short_specs).map(([key, value]) => {
            const dossier = getDossierContent(key);
            const hasDossier = !!dossier;

            return (
              <View key={key} style={[styles.specRow, { borderBottomColor: borderColor }]}>
                <Text style={styles.specLabel}>
                  {t(`asset.${key}`, { defaultValue: key.replace(/_/g, ' ').toUpperCase() })}
                </Text>
                {hasDossier ? (
                  <TouchableOpacity
                    onPress={() => {
                      setModalTitle(key.replace(/_/g, ' '));
                      setModalContent(dossier.content);
                      setModalVisible(true);
                    }}
                    style={styles.specValueContainer}
                  >
                    <Text style={[styles.specValue, { color: '#0A84FF', textDecorationLine: 'underline' }]}>
                      {t_spec(asset, 'short_specs', key, i18n.language)}
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.specValueContainer}>
                    <Text style={[styles.specValue, { color: textColor }]}>
                      {t_spec(asset, 'short_specs', key, i18n.language)}
                    </Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        <View style={styles.chartSection}>
          <PerformanceRadar metrics={asset.metrics} isDark={isDark} />
        </View>

        {/* Full Dossiers Section */}
        {asset.full_dossier && Object.keys(asset.full_dossier).length > 0 && (
          <View style={[styles.dossierContainer, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }]}>
            <View style={styles.dossierHeader}>
              <Ionicons name="document-text-sharp" size={20} color={theme.colors.primary} />
              <Text style={[styles.dossierTitle, { color: textColor }]}>{t('common.full_dossier').toUpperCase()}</Text>
            </View>
            <View style={[styles.divider, { backgroundColor: theme.colors.primary, opacity: 0.3, height: 1, marginBottom: 16 }]} />
            {Object.keys(asset.full_dossier).map((key) => {
              const dossierValue = t_spec(asset, 'full_dossier', key, i18n.language);
              if (!dossierValue || dossierValue === 'N/A' || dossierValue.length < 5) return null;
              return (
                <View key={key} style={styles.dossierItem}>
                  <Text style={[styles.dossierLabel, { color: theme.colors.primary }]}>{t(`asset.${key}`, { defaultValue: key.replace(/_/g, ' ').toUpperCase() })}</Text>
                  <Text style={[styles.dossierText, { color: textColor }]}>{dossierValue}</Text>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      <DossierModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title={modalTitle}
        content={modalContent}
        isDark={isDark}
      />
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
  specsGrid: {
    marginBottom: 24,
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  specLabel: {
    fontSize: 12,
    fontWeight: '900',
    color: '#0A84FF',
    letterSpacing: 1,
    flex: 1,
    paddingRight: 16,
  },
  specValue: {
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'right',
  },
  specValueContainer: {
    flex: 2,
  },
  chartSection: {
    marginTop: 10,
    marginBottom: 40,
    alignItems: 'center',
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
  countryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    marginBottom: 20,
    gap: 10,
    alignSelf: 'flex-start',
  },
  divider: {
    height: 1,
    width: '100%',
  },
  flagText: {
    fontSize: 24,
  },
  countryName: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxHeight: '70%',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 16,
  },
  modalScroll: {
    marginBottom: 20,
  },
  modalText: {
    fontSize: 18,
    lineHeight: 28,
    fontWeight: '500',
  },
  closeButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#000',
    fontWeight: '900',
    fontSize: 14,
    letterSpacing: 1,
  },
  dossierContainer: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 40,
  },
  dossierHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  dossierTitle: {
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
  },
  dossierItem: {
    marginBottom: 16,
  },
  dossierLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 4,
  },
  dossierText: {
    fontSize: 15,
    lineHeight: 22,
    opacity: 0.9,
  },
});

