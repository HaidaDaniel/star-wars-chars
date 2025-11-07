import { useQuery } from "@tanstack/react-query";
import { fetchHeroDetails } from "../api/api";
import type { Hero } from "../types/Hero.types";

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
    retry: (failureCount, error) => {
      if (error?.message?.includes('404')) {
        return false;
      }
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });
};

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
