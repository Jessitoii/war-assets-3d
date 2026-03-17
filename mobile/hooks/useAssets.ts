import { useMemo } from 'react';
import { useStore } from '../store';
import { useTranslation } from 'react-i18next';
import { filterAssets } from '../utils/assetFilters';

export const useAssets = () => {
  const assets = useStore((state) => state.assets);
  const selectedCategoryId = useStore((state) => state.selectedCategoryId);
  const selectedCountry = useStore((state) => state.selectedCountry);
  const selectedGeneration = useStore((state) => state.selectedGeneration);
  const searchQuery = useStore((state) => state.searchQuery);
  const sortBy = useStore((state) => state.sortBy);
  const { i18n } = useTranslation();

  return useMemo(() => {
    return filterAssets(assets, {
      categoryId: selectedCategoryId,
      country: selectedCountry,
      generation: selectedGeneration,
      searchQuery,
      sortBy,
      language: i18n.language
    });
  }, [assets, selectedCategoryId, selectedCountry, selectedGeneration, searchQuery, sortBy, i18n.language]);
};
