import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../styles/theme';

interface AssetHeaderProps {
  name: string;
  isFavorite: boolean;
  isDark: boolean;
  onBack: () => void;
  onToggleFavorite: () => void;
}

export const AssetHeader: React.FC<AssetHeaderProps> = ({
  name,
  isFavorite,
  isDark,
  onBack,
  onToggleFavorite,
}) => {
  const textColor = isDark ? '#FFF' : '#000';
  const iconColor = isDark ? '#FFF' : '#000';

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        onPress={onBack} 
        style={styles.backButton}
        accessibilityLabel="Go back"
        accessibilityHint="Navigates to the previous screen"
      >
        <Ionicons name="arrow-back" size={24} color={iconColor} />
      </TouchableOpacity>
      
      <Text style={[styles.title, { color: textColor }]} numberOfLines={1}>
        {name}
      </Text>

      <TouchableOpacity 
        onPress={onToggleFavorite} 
        style={styles.favoriteButton}
        accessibilityLabel={isFavorite ? "Remove from favorites" : "Add to favorites"}
        accessibilityHint={isFavorite ? "Removes this asset from your favorites list" : "Adds this asset to your favorites list"}
      >
        <Ionicons 
          name={isFavorite ? "heart" : "heart-outline"} 
          size={24} 
          color={isFavorite ? '#FF3B30' : iconColor} 
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    height: 60,
  },
  backButton: {
    padding: 8,
    width: theme.spacing.touchTarget,
    height: theme.spacing.touchTarget,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    ...theme.typography.title,
    fontSize: 20,
    flex: 1,
    textAlign: 'center',
  },
  favoriteButton: {
    padding: 8,
    width: theme.spacing.touchTarget,
    height: theme.spacing.touchTarget,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
