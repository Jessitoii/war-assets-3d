import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../styles/theme';
import { useStore } from '../../store';

interface Props {
  onClose: () => void;
  onReset: () => void;
  onToggleAR: () => void;
  arActive: boolean;
}

export const ControlsOverlay: React.FC<Props> = ({ onClose, onReset, onToggleAR, arActive }) => {
  const { supportsAR } = useStore();

  return (
    <View style={styles.container} pointerEvents="box-none">
      <View style={styles.topRow}>
        <TouchableOpacity style={styles.iconButton} onPress={onClose}>
          <Ionicons name="close-outline" size={28} color="#FFF" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="share-outline" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.bottomRow}>
        <TouchableOpacity 
          style={[
            styles.mainButton, 
            !supportsAR && styles.disabledButton,
            arActive && styles.activeButton
          ]} 
          onPress={onToggleAR}
          disabled={!supportsAR}
        >
          <Ionicons name="scan-outline" size={24} color="#FFF" />
          <Text style={styles.buttonText}>{arActive ? 'Exit AR' : 'Enter AR'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.mainButton} onPress={onReset}>
          <Ionicons name="refresh-outline" size={24} color="#FFF" />
          <Text style={styles.buttonText}>Reset View</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 15,
  },
  iconButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  mainButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  activeButton: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  disabledButton: {
    opacity: 0.4,
  },
  buttonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 16,
  },
});
