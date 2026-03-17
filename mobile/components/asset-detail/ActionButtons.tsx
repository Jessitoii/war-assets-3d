import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../styles/theme';
import { useTranslation } from 'react-i18next';

interface ActionButtonsProps {
  hasModel: boolean;
  isDark: boolean;
  onView3D: () => void;
  onCompare: () => void;
  onShare: () => void;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  hasModel,
  isDark,
  onView3D,
  onCompare,
  onShare,
}) => {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        onPress={onView3D} 
        disabled={!hasModel}
        style={[
          styles.button, 
          styles.primaryButton,
          !hasModel && styles.disabledButton
        ]}
      >
        <Ionicons name="cube-outline" size={24} color="#FFF" />
        <Text style={styles.primaryButtonText}>
          {hasModel ? t('common.view_3d') : '3-D ' + t('common.data_unavailable').toLowerCase()}
        </Text>
      </TouchableOpacity>

      <View style={styles.secondaryRow}>
        <TouchableOpacity 
          onPress={onCompare} 
          style={[
            styles.button, 
            styles.secondaryButton,
            { backgroundColor: isDark ? theme.colors.secondary : '#E5E5EA', flex: 1 }
          ]}
        >
          <Ionicons name="git-compare-outline" size={20} color={isDark ? '#FFF' : '#000'} />
          <Text style={[styles.secondaryButtonText, { color: isDark ? '#FFF' : '#000' }]}>
            {t('common.comparison')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={onShare} 
          style={[
            styles.button, 
            styles.secondaryButton,
            { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', width: 60 }
          ]}
        >
          <Ionicons name="share-social-outline" size={20} color={isDark ? '#FFF' : '#000'} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    flexDirection: 'column',
    gap: 12,
  },
  secondaryRow: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
  },
  disabledButton: {
    backgroundColor: '#999',
    opacity: 0.6,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: 'transparent',
  },
  primaryButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
