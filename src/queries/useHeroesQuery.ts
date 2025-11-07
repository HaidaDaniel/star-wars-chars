import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchHeroesPage } from "../api/api";
import type { HeroPageResponse, Hero } from "../types/Hero.types";

export const useHeroesQuery = () => {
  return useInfiniteQuery<HeroPageResponse, Error>({
    queryKey: ["people"],
    initialPageParam: 1,
    queryFn: ({ pageParam = 1 }) =>
      fetchHeroesPage(pageParam as number),
    getNextPageParam: (lastPage) => {
      if (!lastPage.next) {
        return undefined;
      }
      const pageMatch = lastPage.next.match(/page=(\d+)/);
      return pageMatch ? parseInt(pageMatch[1], 10) : undefined;
    },
    retry: false,
  });
};

export const useHeroesList = () => {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isLoading,
    isFetching,
    isError,
    error,
  } = useHeroesQuery();

  const heroes: Hero[] = data?.pages.flatMap((page) => page.results) || [];

  const loadMoreHeroes = () => {
    if (hasNextPage && !isLoading && !isFetching) {
      fetchNextPage();
    }
  };

  return {
    heroes,
    loadMoreHeroes,
    hasNextPage: !!hasNextPage,
    isLoading,
    isFetching,
    isError,
    error,
  };
};
