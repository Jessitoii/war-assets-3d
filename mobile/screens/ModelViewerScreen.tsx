import React, { useState, useCallback } from 'react';
import { View, StyleSheet, StatusBar, Alert } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/NavigationRoot';
import { useStore } from '../store';
import { ThreeDModelViewer } from '../components/model-viewer/ThreeDModelViewer';
import { ControlsOverlay } from '../components/model-viewer/ControlsOverlay';

type Props = StackScreenProps<RootStackParamList, 'ModelViewer'>;

export const ModelViewerScreen: React.FC<Props> = ({ route, navigation }) => {
  const { assetId } = route.params;
  const assets = useStore((state) => state.assets);
  const asset = assets.find((a) => a.id === assetId);
  const [arActive, setArActive] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const supportsAR = useStore((state) => state.supportsAR);

  const handleReset = useCallback(() => {
    setResetKey((prev) => prev + 1);
  }, []);

  const handleToggleAR = useCallback(() => {
    if (!supportsAR) {
      Alert.alert('AR Unavailable', 'Your device does not support Augmented Reality visualization.');
      return;
    }
    setArActive((prev) => !prev);
  }, [supportsAR]);

  const handleClose = useCallback(() => {
    navigation.goBack();
  }, [navigation]);



  if (!asset || !asset.model) {
    // Should ideally show error state from ThreeDModelViewer
    return (
      <View style={styles.container}>
        <ThreeDModelViewer assetId={assetId} modelUrl={""} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <ThreeDModelViewer
        key={resetKey}
        assetId={assetId}
        modelUrl={asset.model}
      />

      <ControlsOverlay
        onClose={handleClose}
        onReset={handleReset}
        onToggleAR={handleToggleAR}
        arActive={arActive}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
});
