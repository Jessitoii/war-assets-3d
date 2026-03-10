import * as SQLite from 'expo-sqlite';
import * as FileSystem from 'expo-file-system';
const { documentDirectory } = FileSystem as any;

/**
 * Database Manager for War-Assets-3D
 * Handles initialization, schema migrations, and provides a safe singleton instance.
 */

let dbInstance: SQLite.SQLiteDatabase | null = null;
let initializationPromise: Promise<SQLite.SQLiteDatabase> | null = null;

const DB_NAME = 'war-assets.db';

export async function initDB(): Promise<SQLite.SQLiteDatabase> {
  // Return existing instance if available
  if (dbInstance) return dbInstance;
  
  // If initialization is already in progress, wait for it
  if (initializationPromise) return initializationPromise;

  initializationPromise = (async () => {
    try {
      const db = await SQLite.openDatabaseAsync(DB_NAME);
      
      // Basic configuration
      try {
        await db.execAsync('PRAGMA foreign_keys = ON;');
        await db.execAsync('PRAGMA journal_mode = WAL;');
      } catch (e) {
        console.warn('Database PRAGMA setup warning:', e);
      }

      // Apply Schema migrations safely
      await applyMigrations(db);

      dbInstance = db;
      return db;
    } catch (error: any) {
      console.error('CRITICAL DATABASE INITIALIZATION FAILURE:', error);
      initializationPromise = null; // Allow retry
      // Error Boundary: Throw a structured error that the UI can catch to show an error state
      throw new Error(`DB_INIT_FAILED: ${error.message || 'Unknown error'}`);
    }
  })();

  return initializationPromise;
}

/**
 * Safe query execution wrapper to prevent NullPointerExceptions
 */
export async function runQuery<T>(queryFn: (db: SQLite.SQLiteDatabase) => Promise<T>): Promise<T> {
  const db = await initDB();
  if (!db) {
    throw new Error('Database not initialized');
  }
  return await queryFn(db);
}

async function applyMigrations(db: SQLite.SQLiteDatabase) {
  const versionResult: any = await db.getFirstAsync('PRAGMA user_version;');
  const currentVersion = versionResult?.user_version || 0;

  console.log(`[DB] Engine. Version: ${currentVersion}`);

  // v16 PROTOCOL: Audit Column Sync + Per-item Seeding Log
  if (currentVersion < 16) {
    console.log('[DB] v16 RE-SEED: Nuking for data integrity...');
    
    await db.execAsync('PRAGMA foreign_keys = OFF;');
    
    try {
      await db.withExclusiveTransactionAsync(async () => {
        const tables = ['assets', 'categories', 'asset_3d_models', 'comparison_queue', 'onboarding_content', 'favorites', 'app_state', 'offline_status'];
        for (const t of tables) await db.execAsync(`DROP TABLE IF EXISTS ${t};`);

        await db.execAsync('CREATE TABLE categories (id TEXT PRIMARY KEY, name TEXT NOT NULL);');

        await db.execAsync(`
          CREATE TABLE assets (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            catId TEXT NOT NULL,
            img TEXT,
            model TEXT,
            dangerLevel INTEGER,
            threatType TEXT,
            featured BOOLEAN DEFAULT 0,
            specs TEXT,
            FOREIGN KEY (catId) REFERENCES categories(id) ON DELETE CASCADE
          );
        `);

        await db.execAsync(`
          CREATE TABLE favorites (
            id TEXT PRIMARY KEY,
            assetId TEXT NOT NULL,
            FOREIGN KEY (assetId) REFERENCES assets(id) ON DELETE CASCADE
          );
        `);

        await db.execAsync(`
          CREATE TABLE onboarding_content (
            id TEXT PRIMARY KEY,
            title TEXT,
            subtitle TEXT,
            description TEXT,
            image TEXT,
            orderIndex INTEGER
          );
        `);

        await db.execAsync(`
          CREATE TABLE asset_3d_models (
            assetId TEXT PRIMARY KEY,
            localPath TEXT NOT NULL,
            lastUpdated DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (assetId) REFERENCES assets(id) ON DELETE CASCADE
          );
        `);

        await db.execAsync(`
          CREATE TABLE comparison_queue (
            assetId TEXT PRIMARY KEY,
            FOREIGN KEY (assetId) REFERENCES assets(id) ON DELETE CASCADE
          );
        `);

        await db.execAsync(`
          CREATE TABLE app_state (
            id INTEGER PRIMARY KEY CHECK (id = 1),
            firstLaunch BOOLEAN NOT NULL DEFAULT 1,
            theme TEXT NOT NULL DEFAULT 'light',
            arEnabled BOOLEAN NOT NULL DEFAULT 0,
            onboardingProgress INTEGER NOT NULL DEFAULT 0,
            supportsAR BOOLEAN NOT NULL DEFAULT 0
          );
        `);
        await db.execAsync('INSERT INTO app_state (id) VALUES (1);');

        await db.execAsync(`
          CREATE TABLE offline_status (
            id INTEGER PRIMARY KEY CHECK (id = 1),
            is_offline_ready BOOLEAN NOT NULL DEFAULT 0,
            db_size_bytes INTEGER NOT NULL DEFAULT 0,
            last_sync DATETIME
          );
        `);
        await db.execAsync('INSERT INTO offline_status (id) VALUES (1);');

        // Seeding
        const cats = [
          { id: '1', name: 'Tanks' }, { id: '2', name: 'Aircraft' },
          { id: '3', name: 'Air Defense' }, { id: '4', name: 'Drones/Missiles' },
          { id: '5', name: 'Navy' }
        ];
        console.log(`[DB] Seeding ${cats.length} categories...`);
        for (const c of cats) {
          await db.runAsync('INSERT OR REPLACE INTO categories (id, name) VALUES (?, ?)', [c.id, c.name]);
        }

        const MILITARY_ASSETS = require('../assets/data/military-assets.json');
        console.log(`[DB] Seeding ${MILITARY_ASSETS.length} assets...`);
        for (const a of MILITARY_ASSETS) {
          const dLevel = typeof a.dangerLevel === 'number' ? a.dangerLevel : 0;
          const isFeaturedAsset = a.featured ? 1 : 0;
          
          await db.runAsync(
            `INSERT OR REPLACE INTO assets (id, name, catId, img, model, dangerLevel, threatType, featured, specs) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [a.id, a.name, a.catId, a.img, a.model, dLevel, a.threatType || '', isFeaturedAsset, a.specs ? JSON.stringify(a.specs) : null]
          );
          console.log(`[DB] Inserted asset: ${a.name}`);
        }

        const ONBOARDING_DATA = require('../assets/onboarding.json');
        console.log(`[DB] Seeding ${ONBOARDING_DATA.length} onboarding slides...`);
        for (const slide of ONBOARDING_DATA) {
          await db.runAsync(
            `INSERT OR REPLACE INTO onboarding_content (id, title, subtitle, image, orderIndex) 
             VALUES (?, ?, ?, ?, ?)`,
            [slide.id, slide.title, slide.subtitle, slide.image, slide.orderIndex]
          );
        }

        await db.execAsync('PRAGMA user_version = 16;');
        console.log('[DB] Migration and Seeding v16 complete.');
      });
    } finally {
      await db.execAsync('PRAGMA foreign_keys = ON;');
    }
  }
}

/**
 * Exported helper for common database operations
 */
export const dbHelper = {
  getAppState: () => runQuery(db => db.getFirstAsync('SELECT * FROM app_state WHERE id = 1')),
  updateTheme: (theme: string) => runQuery(db => db.runAsync('UPDATE app_state SET theme = ? WHERE id = 1', [theme])),
  
  // Reset Function for debugging
  resetDatabase: async () => {
    try {
      if (dbInstance) {
        await dbInstance.closeAsync();
        dbInstance = null;
        initializationPromise = null;
      }
      const dbPath = `${documentDirectory}SQLite/${DB_NAME}`;
      const info = await FileSystem.getInfoAsync(dbPath);
      if (info.exists) {
        await FileSystem.deleteAsync(dbPath);
        console.log('[DB] Database file deleted successfully.');
      }
      // Re-initialize
      await initDB();
    } catch (e) {
      console.error('[DB] Failed to reset database:', e);
    }
  },

  // Model Caching
  getCachedModel: (assetId: string) => runQuery(db => db.getFirstAsync('SELECT localPath FROM asset_3d_models WHERE assetId = ?', [assetId])),
  saveModelCache: (assetId: string, path: string) => runQuery(db => db.runAsync(
    'INSERT OR REPLACE INTO asset_3d_models (assetId, localPath, lastUpdated) VALUES (?, ?, CURRENT_TIMESTAMP)',
    [assetId, path]
  )),

  // Comparison Queue
  getComparisonQueue: () => runQuery(db => db.getAllAsync('SELECT assetId FROM comparison_queue')),
  addToComparison: (assetId: string) => runQuery(db => db.runAsync('INSERT OR IGNORE INTO comparison_queue (assetId) VALUES (?)', [assetId])),
  removeFromComparison: (assetId: string) => runQuery(db => db.runAsync('DELETE FROM comparison_queue WHERE assetId = ?', [assetId])),
  clearComparison: () => runQuery(db => db.runAsync('DELETE FROM comparison_queue')),
};
