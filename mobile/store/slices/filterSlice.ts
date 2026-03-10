import { create } from 'zustand';

export interface FilterState {
  selectedCategoryId: string | null;
  selectedCountry: string | null;
  selectedGeneration: string | null;
  
  setFilterCategory: (categoryId: string | null) => void;
  setFilterCountry: (country: string | null) => void;
  setFilterGeneration: (generation: string | null) => void;
  resetFilters: () => void;
}

export const createFilterSlice = (set: any): FilterState => ({
  selectedCategoryId: null,
  selectedCountry: null,
  selectedGeneration: null,

  setFilterCategory: (categoryId) => set((state: any) => ({ ...state, selectedCategoryId: categoryId })),
  setFilterCountry: (country) => set((state: any) => ({ ...state, selectedCountry: country })),
  setFilterGeneration: (generation) => set((state: any) => ({ ...state, selectedGeneration: generation })),
  resetFilters: () => set((state: any) => ({
    ...state,
    selectedCategoryId: null,
    selectedCountry: null,
    selectedGeneration: null,
  }))
});
