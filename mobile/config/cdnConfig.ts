import Constants from 'expo-constants';

/**
 * ENVIRONMENT CONTROL:
 * Strictly controlled by environment variable for stability during production testing.
 * Falls back to dev-mode intelligence logic in local development.
 */
export const IS_PROD = __DEV__;
export const DATA_VERSION = 26;


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

    // Recursive handling for reconnaissance arrays
    if (Array.isArray(path)) {
      return path.map(p => CDN_CONFIG.resolveImage(p));
    }

    // IDEMPOTENCY CHECK
    const isAbsolute = /workers\.dev|r2\.dev|http/.test(path);
    if (isAbsolute) return path;

    // SANITIZATION: Strip legacy prefixes if somehow present
    const cleanPath = path.replace(/^(\/|images\/|public\/images\/)/, '');

    return `${CDN_CONFIG.imageUrl}/${cleanPath}`;
  },

  resolveModel: (path: string) => {
    if (!path) return undefined;

    // IDEMPOTENCY CHECK
    const isAbsolute = /workers\.dev|r2\.dev|http/.test(path);
    if (isAbsolute) return path;

    // SANITIZATION: Strip legacy prefixes
    const cleanPath = path.replace(/^(\/|models\/|public\/models\/)/, '');

    return `${CDN_CONFIG.modelUrl}/${cleanPath}`;
  }
};
