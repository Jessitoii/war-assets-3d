export interface OnboardingContent {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  orderIndex: number;
}

export interface OnboardingState {
  currentPage: number;
  content: OnboardingContent[];
  setCurrentPage: (page: number) => void;
  setContent: (content: OnboardingContent[]) => void;
  nextPage: () => void;
}

export const createOnboardingSlice = (set: any): OnboardingState => ({
  currentPage: 0,
  content: [],
  setCurrentPage: (page) =>
    set((state: any) => ({ ...state, currentPage: page })),
  setContent: (content) =>
    set((state: any) => ({ ...state, content })),
  nextPage: () =>
    set((state: any) => ({
      ...state,
      currentPage: Math.min(state.currentPage + 1, Math.max(0, state.content.length - 1))
    })),
});
