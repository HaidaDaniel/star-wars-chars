import { create } from "zustand";
import type { StarWarsData } from "../types/Data";

interface StarWarsStore {
  data: StarWarsData;
  setData: (data: StarWarsData) => void;
  selectedHeroId: number | null;
  isModalOpen: boolean;
  openModal: (heroId: number) => void;
  closeModal: () => void;
}

export const useStarWarsStore = create<StarWarsStore>((set) => ({
  data: { films: {} },
  setData: (data) => set({ data }),
  selectedHeroId: null,
  isModalOpen: false,
  openModal: (heroId) => set({ selectedHeroId: heroId, isModalOpen: true }),
  closeModal: () => set({ isModalOpen: false, selectedHeroId: null }),
}));

