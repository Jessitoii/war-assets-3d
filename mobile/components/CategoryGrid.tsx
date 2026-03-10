import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Category } from '../store/slices/assetSlice';
import { useStore } from '../store';
import { theme } from '../styles/theme';

interface Props {
  categories: Category[];
  onCategoryPress: (categoryId: string) => void;
}

const { width } = Dimensions.get('window');
const COLUMN_COUNT = 4;
const GAP = 10;
const ITEM_WIDTH = (width - 32 - (GAP * (COLUMN_COUNT - 1))) / COLUMN_COUNT;

export const CategoryGrid: React.FC<Props> = ({ categories, onCategoryPress }) => {
  const currentTheme = useStore((state) => state.theme);
  const isDark = currentTheme === 'dark';

  return (
    <View style={styles.grid}>
      {categories.map((category) => (
        <TouchableOpacity
          key={category.id}
          onPress={() => onCategoryPress(category.id)}
          style={[
            styles.item,
            { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' }
          ]}
        >
          <View style={styles.iconContainer}>
            <Ionicons
              name={(category.icon as any) || 'cube-outline'}
              size={24}
              color={isDark ? theme.colors.primary : theme.colors.primary}
            />
          </View>
          <Text numberOfLines={1} style={[styles.name, { color: isDark ? '#CCC' : '#444' }]}>
            {category.name}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -GAP / 2,
  },
  item: {
    width: ITEM_WIDTH,
    margin: GAP / 2,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  iconContainer: {
    marginBottom: 6,
  },
  name: {
    fontSize: 10,
    fontWeight: '500',
    textAlign: 'center',
  },
});
