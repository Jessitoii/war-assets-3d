import { create } from 'zustand';

export type SortOption = 'danger_high' | 'danger_low' | 'generation_modern' | 'generation_vintage' | 'alpha_asc' | 'alpha_desc';

export interface FilterState {
  selectedCategoryId: string | null;
  selectedCountry: string | null;
  selectedGeneration: string | null;
  searchQuery: string;
  sortBy: SortOption;
  
  setFilterCategory: (categoryId: string | null) => void;
  setFilterCountry: (country: string | null) => void;
  setFilterGeneration: (generation: string | null) => void;
  setSearchQuery: (query: string) => void;
  setSortBy: (sort: SortOption) => void;
  resetFilters: () => void;
}

export const createFilterSlice = (set: any): FilterState => ({
  selectedCategoryId: null,
  selectedCountry: null,
  selectedGeneration: null,
  searchQuery: '',
  sortBy: 'danger_high',

  setFilterCategory: (categoryId) => set((state: any) => ({ ...state, selectedCategoryId: categoryId })),
  setFilterCountry: (country) => set((state: any) => ({ ...state, selectedCountry: country })),
  setFilterGeneration: (generation) => set((state: any) => ({ ...state, selectedGeneration: generation })),
  setSearchQuery: (searchQuery) => set((state: any) => ({ ...state, searchQuery })),
  setSortBy: (sortBy) => set((state: any) => ({ ...state, sortBy })),
  resetFilters: () => set((state: any) => ({
    ...state,
    selectedCategoryId: null,
    selectedCountry: null,
    selectedGeneration: null,
    searchQuery: '',
    sortBy: 'danger_high',
  }))
});
