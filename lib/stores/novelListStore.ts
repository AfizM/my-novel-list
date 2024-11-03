import { create } from "zustand";
import { persist } from "zustand/middleware";

interface NovelListState {
  selectedFilter: string;
  searchTerm: string;
  ratingFilter: number;
  chapterFilter: number;
  sortBy: string;
  setSelectedFilter: (value: string) => void;
  setSearchTerm: (value: string) => void;
  setRatingFilter: (value: number) => void;
  setChapterFilter: (value: number) => void;
  setSortBy: (value: string) => void;
  resetFilters: () => void;
}

export const useNovelListStore = create<NovelListState>()(
  persist(
    (set) => ({
      selectedFilter: "All",
      searchTerm: "",
      ratingFilter: 0,
      chapterFilter: 0,
      sortBy: "score",
      setSelectedFilter: (value) => set({ selectedFilter: value }),
      setSearchTerm: (value) => set({ searchTerm: value }),
      setRatingFilter: (value) => set({ ratingFilter: value }),
      setChapterFilter: (value) => set({ chapterFilter: value }),
      setSortBy: (value) => set({ sortBy: value }),
      resetFilters: () =>
        set({
          selectedFilter: "All",
          searchTerm: "",
          ratingFilter: 0,
          chapterFilter: 0,
          sortBy: "score",
        }),
    }),
    {
      name: "novel-list-store",
    },
  ),
);
