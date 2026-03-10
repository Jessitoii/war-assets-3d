import React, { Suspense, useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stage, useGLTF } from '@react-three/drei/native';
import * as THREE from 'three';
import { theme } from '../../styles/theme';
import { AssetCDNService } from '../../services/AssetCDNService';
import { dbHelper } from '../../scripts/init-db';
import { CDN_CONFIG } from '../../config/cdnConfig';

interface ModelProps {
  url: string;
  onLoad?: () => void;
  onError?: (error: Error) => void;
}

const Model: React.FC<ModelProps> = ({ url, onLoad, onError }) => {
  const { scene } = useGLTF(url);
  const modelRef = useRef<THREE.Group>(null);

  useEffect(() => {
    if (scene) {
      onLoad?.();
    }
  }, [scene, onLoad]);

  useFrame(() => {
    if (modelRef.current) {
      modelRef.current.rotation.y += 0.005;
    }
  });

  useEffect(() => {
    return () => {
      if (scene) {
        scene.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.geometry.dispose();
            if (Array.isArray(mesh.material)) {
              mesh.material.forEach((m) => m.dispose());
            } else {
              mesh.material.dispose();
            }
          }
        });
      }
    };
  }, [scene]);

  return <primitive ref={modelRef} object={scene} />;
};

const FallbackBox: React.FC = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.01;
      meshRef.current.rotation.y += 0.01;
    }
  });

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial 
        color="#4A4A4A" 
        wireframe 
        emissive="#00FF00" 
        emissiveIntensity={0.5}
      />
    </mesh>
  );
};

interface Props {
  assetId: string;
  modelUrl: string;
  assetVersion?: string;
  expectedChecksum?: string;
  isMini?: boolean;
}

export const ThreeDModelViewer: React.FC<Props> = ({ 
  assetId, 
  modelUrl, 
  assetVersion, 
  expectedChecksum, 
  isMini = false 
}) => {
  const [localUrl, setLocalUrl] = useState<string | null>(null);
  const [error, setError] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const handleModelCaching = async () => {
      try {
        await AssetCDNService.init();

        const absoluteModelUrl = CDN_CONFIG.resolveModel(modelUrl);
        if (!absoluteModelUrl) {
           setError(true);
           setLoading(false);
           return;
        }

        const version = assetVersion || '1.0.0';

        const uri = await AssetCDNService.getModelUri({
          id: assetId,
          version,
          cdnUrl: absoluteModelUrl,
          expectedChecksum,
        });

        await dbHelper.saveModelCache(assetId, uri);

        if (isMounted) {
          setLocalUrl(uri);
          setLoading(false);
          setError(false);
        }
      } catch (err: any) {
        console.error('Model caching error:', err);
        if (isMounted) {
          setError(true);
          setLoading(false);
        }
      }
    };

    handleModelCaching();

    return () => {
      isMounted = false;
    };
  }, [assetId, modelUrl, assetVersion, expectedChecksum]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size={isMini ? "small" : "large"} color={theme.colors.primary} />
        {!isMini && <Text style={styles.text}>Synchronizing Geometry...</Text>}
      </View>
    );
  }

  const showFallback = error || !localUrl;

  return (
    <View 
      style={[styles.container, { backgroundColor: isMini ? 'transparent' : '#000' }]}
      pointerEvents={isMini ? 'none' : 'auto'}
    >
      <Canvas
        camera={{ position: [0, 0, 3], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <Suspense fallback={null}>
          {showFallback ? (
            <FallbackBox />
          ) : (
            isMini ? (
              <Model url={localUrl!} />
            ) : (
              <Stage environment="city" intensity={0.5} adjustCamera={true}>
                <Model url={localUrl!} />
              </Stage>
            )
          )}
        </Suspense>
        {!isMini && <OrbitControls makeDefault minDistance={1} maxDistance={10} />}
      </Canvas>
      {showFallback && !isMini && (
        <View style={styles.fallbackLabel}>
          <Text style={styles.fallbackText}>TACTICAL PLACEHOLDER: MODEL MISSING</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  text: {
    color: '#FFF',
    marginTop: 20,
    fontSize: 16,
    opacity: 0.7,
  },
  fallbackLabel: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    backgroundColor: 'rgba(255,0,0,0.3)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#FF0000',
  },
  fallbackText: {
    color: '#FF0000',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});
