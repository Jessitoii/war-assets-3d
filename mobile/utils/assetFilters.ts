import { Asset } from '../store/slices/assetSlice';

export interface FilterOptions {
  categoryId?: string | null;
  country?: string | null;
  generation?: string | null;
  searchQuery?: string;
  sortBy?: string;
  language?: string;
}

export const filterAssets = (assets: Asset[], options: FilterOptions): Asset[] => {
  const { categoryId, country, generation, searchQuery, sortBy, language = 'en' } = options;
  
  let result = [...assets];

  // 1. Tactical Fuzzy Search & Filtering
  result = result.filter((asset) => {
    // Category Filter
    if (categoryId && asset.categoryId !== categoryId) return false;

    // Country Filter
    if (country && asset.specs?.country && asset.specs.country !== country) return false;

    // Generation Filter
    if (generation && asset.specs?.generation && !asset.specs.generation.toLowerCase().includes(generation.toLowerCase())) return false;

    // Deep Fuzzy Search Logic
    if (searchQuery) {
      const query = searchQuery.toLowerCase().trim();
      
      const matchesName = asset.name.toLowerCase().includes(query);
      const matchesId = asset.id.toLowerCase().includes(query);
      const matchesRole = asset.threatType?.toLowerCase().includes(query);
      
      const matchesSpecs = asset.specs ? Object.values(asset.specs).some(val => 
        val?.toString().toLowerCase().includes(query)
      ) : false;

      const matchesTranslations = asset.translations 
        ? Object.values(asset.translations).some(t => 
            t?.name?.toLowerCase().includes(query) || 
            (t?.specs && Object.values(t.specs).some(v => v?.toString().toLowerCase().includes(query)))
          ) 
        : false;

      if (!matchesName && !matchesId && !matchesRole && !matchesSpecs && !matchesTranslations) return false;
    }

    return true;
  });

  // 2. High-Performance Sort Engine
  if (sortBy) {
    result.sort((a, b) => {
      switch (sortBy) {
        case 'danger_high':
          return (b.dangerLevel || 0) - (a.dangerLevel || 0);
        
        case 'generation_modern': {
          const getGenRank = (g?: string) => {
            if (!g) return 0;
            const s = g.toLowerCase();
            if (s.includes('5th') || s.includes('5') || s.includes('next')) return 50;
            if (s.includes('4th') || s.includes('4')) return 40;
            if (s.includes('3rd') || s.includes('3')) return 30;
            if (s.includes('2nd') || s.includes('2')) return 20;
            if (s.includes('cold war') || s.includes('1st') || s.includes('1')) return 10;
            if (s.includes('ww2') || s.includes('vintage')) return 5;
            return 0;
          };
          return getGenRank(b.specs?.generation) - getGenRank(a.specs?.generation);
        }

        case 'alpha_asc': {
          const nameA = a.translations?.[language]?.name || a.name;
          const nameB = b.translations?.[language]?.name || b.name;
          return nameA.localeCompare(nameB);
        }

        case 'danger_low':
          return (a.dangerLevel || 0) - (b.dangerLevel || 0);

        default:
          return 0;
      }
    });
  }

  return result;
};
