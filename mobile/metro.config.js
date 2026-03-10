const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.assetExts.push(
  // Adds support for 3D model files
  'glb',
  'gltf',
  'mtl',
  'obj'
);

config.resolver.sourceExts.push('mjs');

module.exports = config;
