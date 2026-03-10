import * as FileSystem from 'expo-file-system/legacy';
import * as Crypto from 'expo-crypto';
import { CDN_CONFIG } from '../config/cdnConfig';

const ASSET_CACHE_DIR = `${FileSystem.cacheDirectory}models/`;

interface ModelAsset {
  id: string;
  version: string;
  cdnUrl: string; // This might be relative now
  expectedChecksum?: string;
}

export class AssetCDNService {
  /**
   * Initializes the cache directory.
   */
  static async init() {
    const dirInfo = await FileSystem.getInfoAsync(ASSET_CACHE_DIR);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(ASSET_CACHE_DIR, { intermediates: true });
    }
  }

  /**
   * Resolves the local URI for a model. 
   * Downloads from CDN if not cached or if version mismatch.
   */
  static async getModelUri(asset: ModelAsset): Promise<string> {
    const fileName = `${asset.id}_v${asset.version}.glb`;
    const localUri = `${ASSET_CACHE_DIR}${fileName}`;
    
    // Resolve full CDN URL if relative
    const fullCdnUrl = CDN_CONFIG.resolveModel(asset.cdnUrl)!;

    const fileInfo = await FileSystem.getInfoAsync(localUri);

    if (fileInfo.exists) {
      console.log(`[AssetCDN] Serving cached model: ${fileName}`);
      return localUri;
    }

    // Not in cache, download it
    console.log(`[AssetCDN] Downloading model from: ${fullCdnUrl}`);
    return await this.downloadAndValidate({ ...asset, cdnUrl: fullCdnUrl }, localUri);
  }

  private static async downloadAndValidate(asset: ModelAsset, localUri: string): Promise<string> {
    try {
      // 1. Download accurately
      const downloadRes = await FileSystem.downloadAsync(asset.cdnUrl, localUri);

      const contentType = downloadRes.headers['content-type'] || downloadRes.headers['Content-Type'] || '';
      const isGLB = contentType.includes('octet-stream') || contentType.includes('gltf-binary');

      if (downloadRes.status !== 200 || !isGLB) {
        console.error(`[AssetCDN] Invalid response for ${asset.id}. Status: ${downloadRes.status}, Type: ${contentType}`);
        // If it's a 404 HTML page, don't keep it
        await FileSystem.deleteAsync(localUri, { idempotent: true });
        throw new Error(`Invalid model file received. HTTP Status: ${downloadRes.status}`);
      }

      // 2. Production Integrity Check: SHA-256 Validation
      if (asset.expectedChecksum) {
        // Use string literal for encoding to avoid enum issues
        const fileContent = await FileSystem.readAsStringAsync(localUri, { encoding: 'base64' as any });
        const actualChecksum = await Crypto.digestStringAsync(
          Crypto.CryptoDigestAlgorithm.SHA256,
          fileContent
        );

        if (actualChecksum !== asset.expectedChecksum) {
          console.error(`[AssetCDN] Checksum Mismatch! Expected: ${asset.expectedChecksum}, Got: ${actualChecksum}`);
          // Remove corrupted file
          await FileSystem.deleteAsync(localUri, { idempotent: true });
          throw new Error('Asset integrity validation failed.');
        }
        console.log(`[AssetCDN] Integrity check passed for ${asset.id}`);
      }

      return localUri;
    } catch (error) {
      console.error(`[AssetCDN] Download failed for ${asset.id}:`, error);
      throw error;
    }
  }

  /**
   * Clears old versions of models to save space.
   */
  static async pruneCache(activeAssets: { id: string; version: string }[]) {
    const files = await FileSystem.readDirectoryAsync(ASSET_CACHE_DIR);
    const activeFiles = activeAssets.map(a => `${a.id}_v${a.version}.glb`);

    for (const file of files) {
      if (!activeFiles.includes(file)) {
        console.log(`[AssetCDN] Pruning old asset: ${file}`);
        await FileSystem.deleteAsync(`${ASSET_CACHE_DIR}${file}`, { idempotent: true });
      }
    }
  }
}
