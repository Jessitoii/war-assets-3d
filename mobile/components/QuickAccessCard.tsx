import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native';
import { Asset } from '../store/slices/assetSlice';
import { theme } from '../styles/theme';
import { useStore } from '../store';
import { CDN_CONFIG } from '../config/cdnConfig';

interface Props {
  asset: Asset;
  onPress: () => void;
}

export const QuickAccessCard: React.FC<Props> = ({ asset, onPress }) => {
  const currentTheme = useStore((state) => state.theme);
  const isDark = currentTheme === 'dark';

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[
        styles.container,
        { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#FFF' }
      ]}
    >
      <View style={styles.imageContainer}>
        {asset.image ? (
          <Image source={{ uri: CDN_CONFIG.resolveImage(asset.image) }} style={styles.image} />
        ) : (
          <View style={[styles.placeholder, { backgroundColor: isDark ? '#333' : '#EEE' }]}>
            <Text style={{ color: isDark ? '#666' : '#AAA' }}>No Image</Text>
          </View>
        )}
      </View>
      <View style={styles.info}>
        <Text numberOfLines={1} style={[styles.name, { color: isDark ? '#FFF' : '#000' }]}>
          {asset.name}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 160,
    borderRadius: 12,
    marginRight: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(128,128,128,0.1)',
  },
  imageContainer: {
    width: '100%',
    height: 100,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    padding: 10,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
  },
});
