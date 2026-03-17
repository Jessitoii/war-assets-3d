import { dbHelper } from '../../scripts/init-db';

export interface AssetSpecs {
  range: string;
  speed: string;
  generation: string;
  country: string;
  [key: string]: string | undefined;
}

export interface Translation {
  name: string;
  country?: string;
  countryCode?: string;
  specs: Partial<AssetSpecs>;
  short_specs?: Partial<AssetSpecs>;
  full_dossier?: Partial<AssetSpecs>;
}

export interface Asset {
  id: string;
  name: string;
  categoryId: string;
  isFeatured: boolean;
  image?: string;
  images?: string[];
  specs?: AssetSpecs;
  short_specs?: AssetSpecs;
  full_dossier?: AssetSpecs;
  model?: string;
  hasModel?: boolean;
  dangerLevel?: number;
  threatType?: string;
  wikiUrl?: string;
  country?: string;
  countryCode?: string;
  translations?: {
    tr?: Translation;
    ru?: Translation;
    ar?: Translation;
    zh?: Translation;
    [key: string]: Translation | undefined;
  };
}

export interface Category {
  id: string;
  name: string;
  icon?: string;
}

export interface AssetState {
  assets: Asset[];
  categories: Category[];
  favorites: string[];
  comparisonQueue: string[];
  setAssets: (assets: Asset[]) => void;
  setCategories: (categories: Category[]) => void;
  toggleFavorite: (assetId: string) => void;
  setFavorites: (favorites: string[]) => void;
  addToComparison: (assetId: string) => void;
  removeFromComparison: (assetId: string) => void;
  clearComparison: () => void;
  setComparisonQueue: (assetIds: string[]) => void;
}

export const createAssetSlice = (set: any): AssetState => ({
  assets: [],
  categories: [],
  favorites: [],
  comparisonQueue: [],
  setAssets: (assets) => set((state: any) => ({ ...state, assets })),
  setCategories: (categories) => set((state: any) => ({ ...state, categories })),
  setFavorites: (favorites) => set((state: any) => ({ ...state, favorites })),
  toggleFavorite: (assetId) => set((state: any) => {
    const isFavorite = state.favorites.includes(assetId);
    return {
      ...state,
      favorites: isFavorite
        ? state.favorites.filter((id: string) => id !== assetId)
        : [...state.favorites, assetId]
    };
  }),
  addToComparison: (assetId) => set((state: any) => {
    if (state.comparisonQueue.length >= 3) return state;
    if (state.comparisonQueue.includes(assetId)) return state;

    // Persist to SQLite
    dbHelper.addToComparison(assetId).catch(e => console.error('Failed to add to comparison_queue:', e));

    return { ...state, comparisonQueue: [...state.comparisonQueue, assetId] };
  }),
  removeFromComparison: (assetId) => set((state: any) => {
    // Persist to SQLite
    dbHelper.removeFromComparison(assetId).catch(e => console.error('Failed to remove from comparison_queue:', e));

    return {
      ...state,
      comparisonQueue: state.comparisonQueue.filter((id: string) => id !== assetId)
    };
  }),
  clearComparison: () => set((state: any) => {
    // Persist to SQLite
    dbHelper.clearComparison().catch(e => console.error('Failed to clear comparison_queue:', e));

    return { ...state, comparisonQueue: [] };
  }),
  setComparisonQueue: (comparisonQueue) => set((state: any) => ({ ...state, comparisonQueue })),
});
