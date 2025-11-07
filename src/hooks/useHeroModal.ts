import { useStarWarsStore } from "../store/starWarsStore";

/**
 * Custom hook for managing hero details modal state
 * @returns Object containing modal state and control functions
 */
export const useHeroModal = () => {
  const selectedHeroId = useStarWarsStore((state) => state.selectedHeroId);
  const isModalOpen = useStarWarsStore((state) => state.isModalOpen);
  const openModal = useStarWarsStore((state) => state.openModal);
  const closeModal = useStarWarsStore((state) => state.closeModal);

  return {
    selectedHeroId,
    isModalOpen,
    handleOpenModal: openModal,
    handleCloseModal: closeModal,
  };
};

