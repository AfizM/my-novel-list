import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ActivityState {
  tab: "following" | "global";
  setTab: (tab: "following" | "global") => void;
}

export const useActivityStore = create<ActivityState>()(
  persist(
    (set) => ({
      tab: "global",
      setTab: (tab) => set({ tab }),
    }),
    {
      name: "activity-store",
    },
  ),
);
