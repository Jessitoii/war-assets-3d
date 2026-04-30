import Constants from 'expo-constants';

/**
 * ENVIRONMENT CONTROL:
 * Strictly controlled by environment variable for stability during production testing.
 * Falls back to dev-mode intelligence logic in local development.
 */
export const IS_PROD = !__DEV__;
export const DATA_VERSION = 29;


// Dynamically extract the IP from the metro bundler host uri
const getDevIp = () => {
  const hostUri = Constants.expoConfig?.hostUri;
  if (!hostUri) return 'localhost';
  return hostUri.split(':')[0];
};

export const DEV_MACHINE_IP = getDevIp();

// WORKER PROXY: Primary tactical edge node
const PROXY_DOMAIN = 'https://warassets-cdn.alpercanzerr1600.workers.dev';
const R2_DOMAIN = 'https://pub-2c4d302f7a9147f2b8723c7d066dc44f.r2.dev';
const LOCAL_DOMAIN = `http://${DEV_MACHINE_IP}:3000/public`;

export const CDN_CONFIG = {
  BASE_URL: IS_PROD ? PROXY_DOMAIN : LOCAL_DOMAIN,

  get imageUrl() {
    return `${this.BASE_URL}/images`;
  },

  get modelUrl() {
    return `${this.BASE_URL}/models`;
  },

  /**
   * DOMAIN GUARD (Idempotent Resolver):
   * Prevents nested URLs. If a path is already absolute (contains Worker or R2),
   * it returns the path immediately.
   */
  resolveImage: (path: string | string[]): any => {
    if (!path) return undefined;

    if (Array.isArray(path)) {
      return path.map(p => CDN_CONFIG.resolveImage(p));
    }

    if (typeof path !== 'string') return path;

    // Sadece domain kısmını proxy url yapsın başka bir şey yapmasın
    if (path.startsWith('http')) {
      return path.replace(/^https?:\/\/[^/]+/, PROXY_DOMAIN);
    }

    return `${PROXY_DOMAIN}/${path.replace(/^\//, '')}`;
  },

  resolveModel: (path: string | string[]): any => {
    if (!path) return undefined;

    if (Array.isArray(path)) {
      return path.map(p => CDN_CONFIG.resolveModel(p));
    }

    if (typeof path !== 'string') return path;

    // Sadece domain kısmını proxy url yapsın başka bir şey yapmasın
    if (path.startsWith('http')) {
      return path.replace(/^https?:\/\/[^/]+/, PROXY_DOMAIN);
    }

    return `${PROXY_DOMAIN}/${path.replace(/^\//, '')}`;
  }
};
