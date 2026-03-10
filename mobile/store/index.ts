import { create } from 'zustand';
import { AppState, createAppSlice } from './slices/appSlice';
import { OnboardingState, createOnboardingSlice } from './slices/onboardingSlice';
import { AssetState, createAssetSlice } from './slices/assetSlice';
import { FilterState, createFilterSlice } from './slices/filterSlice';

// Combine slices
export type StoreState = AppState & { onboarding: OnboardingState } & AssetState & FilterState;


export const useStore = create<StoreState>()((set, get, api) => ({
  ...createAppSlice(set),
  ...createAssetSlice(set),
  ...createFilterSlice(set),
  onboarding: createOnboardingSlice((fn: any) => set((state: any) => ({ onboarding: fn(state.onboarding) }))),
}));

// Memoized Selectors Strategy
export const selectTheme = (state: StoreState) => state.theme;
export const selectFirstLaunch = (state: StoreState) => state.firstLaunch;
export const selectOnboardingContent = (state: StoreState) => state.onboarding.content;
export const selectOnboardingCurrentPage = (state: StoreState) => state.onboarding.currentPage;

// These return new references, so MUST be used with `useShallow` or memoized
export const selectAssets = (state: StoreState) => state.assets;
export const selectCategories = (state: StoreState) => state.categories;
export const selectFeaturedAssets = (state: StoreState) => state.assets.filter(a => a.isFeatured);
