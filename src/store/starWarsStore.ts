import { create } from "zustand";
import type { StarWarsData } from "../types/Data";

/**
 * Store interface for managing global Star Wars application state.
 * Includes film data cache and modal state management.
 */
interface StarWarsStore {
  /** Cached film data indexed by film ID for quick lookup */
  data: StarWarsData;
  /** Function to update the cached film data */
  setData: (data: StarWarsData) => void;
  /** Currently selected hero ID (null if no hero is selected) */
  selectedHeroId: number | null;
  /** Boolean indicating whether the hero details modal is open */
  isModalOpen: boolean;
  /** Function to open the hero details modal for a specific hero */
  openModal: (heroId: number) => void;
  /** Function to close the hero details modal */
  closeModal: () => void;
}

/**
 * Global state store for Star Wars application data and UI state.
 * Uses Zustand for lightweight state management.
 */
export const useStarWarsStore = create<StarWarsStore>((set) => ({
  data: { films: {} },
  setData: (data) => set({ data }),
  selectedHeroId: null,
  isModalOpen: false,
  openModal: (heroId) => set({ selectedHeroId: heroId, isModalOpen: true }),
  closeModal: () => set({ isModalOpen: false, selectedHeroId: null }),
}));

