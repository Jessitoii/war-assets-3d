import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../store';
import { theme } from '../styles/theme';
import { SortOption } from '../store/slices/filterSlice';
import { useTranslation } from 'react-i18next';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export const SortModal: React.FC<Props> = ({ visible, onClose }) => {
  const { t } = useTranslation();
  const sortBy = useStore((state) => state.sortBy);
  const setSortBy = useStore((state) => state.setSortBy);
  const isDark = useStore((state) => state.theme) === 'dark';

  const options: { label: string; value: SortOption; icon: string }[] = [
    { label: 'Lethality (Danger Level)', value: 'danger_high', icon: 'shield-half' },
    { label: 'Chronology (Modern first)', value: 'generation_modern', icon: 'time-outline' },
    { label: 'Alphabetical (A-Z)', value: 'alpha_asc', icon: 'text-outline' },
  ];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={[styles.content, { backgroundColor: isDark ? '#1C1C1E' : '#FFF' }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: isDark ? '#FFF' : '#000' }]}>Sort By</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={isDark ? '#FFF' : '#000'} />
            </TouchableOpacity>
          </View>

          {options.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              style={[
                styles.option,
                sortBy === opt.value && { backgroundColor: theme.colors.primary + '20' }
              ]}
              onPress={() => {
                setSortBy(opt.value);
                onClose();
              }}
            >
              <Ionicons 
                name={opt.icon as any} 
                size={20} 
                color={sortBy === opt.value ? theme.colors.primary : (isDark ? '#AAA' : '#666')} 
                style={styles.icon}
              />
              <Text style={[
                styles.optionText, 
                { color: isDark ? '#FFF' : '#000' },
                sortBy === opt.value && { color: theme.colors.primary, fontWeight: 'bold' }
              ]}>
                {opt.label}
              </Text>
              {sortBy === opt.value && (
                <Ionicons name="checkmark" size={20} color={theme.colors.primary} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  content: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  icon: {
    marginRight: 12,
    width: 24,
  },
  optionText: {
    fontSize: 16,
    flex: 1,
  },
});
