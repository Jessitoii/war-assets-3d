import Constants from 'expo-constants';

export const IS_PROD = !__DEV__;

// Dynamically extract the IP from the metro bundler host uri
const getDevIp = () => {
  const hostUri = Constants.expoConfig?.hostUri;
  if (!hostUri) return 'localhost';
  return hostUri.split(':')[0];
};

export const DEV_MACHINE_IP = getDevIp();

export const CDN_CONFIG = {
  BASE_URL: IS_PROD
    ? 'https://pub-2c4d302f7a9147f2b8723c7d066dc44f.r2.dev'
    : `http://${DEV_MACHINE_IP}:3000/public`,

  get imageUrl() {
    return `${this.BASE_URL}/images`;
  },

  get modelUrl() {
    return `${this.BASE_URL}/models`;
  },

  resolveImage: (filename: string) => {
    if (!filename) return undefined;
    if (filename.startsWith('http')) return filename;
    return `${CDN_CONFIG.imageUrl}/${filename}`;
  },

  resolveModel: (filename: string) => {
    if (!filename) return undefined;
    if (filename.startsWith('http')) return filename;
    return `${CDN_CONFIG.modelUrl}/${filename}`;
  }
};
