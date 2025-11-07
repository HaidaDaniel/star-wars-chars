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
    retry: false,
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
