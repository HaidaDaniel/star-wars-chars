import { useQuery } from "@tanstack/react-query";
import { fetchHeroDetails } from "../api/api";
import type { Hero } from "../types/Hero.types";

/**
 * Query hook for fetching hero details by ID
 * @param heroId - Unique identifier of the hero (null if no hero selected)
 * @returns TanStack Query result for hero details
 */
export const useHeroDetailsQuery = (heroId: number | null) => {
  return useQuery<Hero, Error>({
    queryKey: ["heroDetails", heroId],
    queryFn: () => {
      if (!heroId) {
        throw new Error("Hero ID is required");
      }
      return fetchHeroDetails(heroId);
    },
    enabled: !!heroId,
  });
};

/**
 * Hook that combines the query with additional processing for hero details
 * @param heroId - Unique identifier of the hero (null if no hero selected)
 * @returns Object containing hero details, loading state, and error state
 */
export const useHeroDetails = (heroId: number | null) => {
  const {
    data: heroDetails,
    isLoading,
    isError,
  } = useHeroDetailsQuery(heroId);

  return {
    heroDetails,
    isLoading,
    isError,
  };
};
