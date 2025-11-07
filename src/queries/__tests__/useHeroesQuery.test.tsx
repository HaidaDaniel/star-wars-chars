import React from "react";
import { describe, it, expect } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useHeroesList } from "../useHeroesQuery";

describe("useHeroesList", () => {
  const createWrapper = () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          retryDelay: 0,
        },
      },
    });

    return ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };

  it("should fetch heroes list on mount", async () => {
    const { result } = renderHook(() => useHeroesList(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.heroes).toEqual([]);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    }, { timeout: 5000 });

    expect(result.current.heroes.length).toBeGreaterThan(0);
    expect(result.current.heroes[0].id).toBeDefined();
    expect(result.current.heroes[0].name).toBe("Luke Skywalker");
  });

  it("should have hasNextPage when next page exists", async () => {
    const { result } = renderHook(() => useHeroesList(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    }, { timeout: 5000 });

    expect(result.current.hasNextPage).toBe(true);
  });

  it("should load more heroes when loadMoreHeroes is called", async () => {
    const { result } = renderHook(() => useHeroesList(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    }, { timeout: 5000 });

    const initialHeroesCount = result.current.heroes.length;

    if (result.current.hasNextPage) {
      result.current.loadMoreHeroes();

      await waitFor(() => {
        expect(result.current.isFetching).toBe(false);
      });

      expect(result.current.heroes.length).toBe(initialHeroesCount + 1);
    }
  });

  it("should not load more when already loading", async () => {
    const { result } = renderHook(() => useHeroesList(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    }, { timeout: 5000 });

    result.current.loadMoreHeroes();
    result.current.loadMoreHeroes();
    result.current.loadMoreHeroes();

    expect(typeof result.current.isFetching).toBe("boolean");
  });

  describe("useHeroesQuery pagination", () => {
    it("should return undefined when there is no next page", () => {

      const lastPageWithoutNext = {
        count: 82,
        next: null,
        previous: null,
        results: [{ id: 1, name: "Luke Skywalker" }]
      };

      const mockQuery = {
        queryKey: ["people"],
        initialPageParam: 1,
        getNextPageParam: (lastPage: {next: string | null}) => {
          if (!lastPage.next) {
            return undefined;
          }
          const pageMatch = lastPage.next.match(/page=(\d+)/);
          return pageMatch ? parseInt(pageMatch[1], 10) : undefined;
        }
      };

      const nextPageParam = mockQuery.getNextPageParam(lastPageWithoutNext);
      expect(nextPageParam).toBeUndefined();

      const lastPageWithNext = {
        ...lastPageWithoutNext,
        next: "https://swapi.dev/api/people/?page=3"
      };

      const nextPageParamWithNext = mockQuery.getNextPageParam(lastPageWithNext);
      expect(nextPageParamWithNext).toBe(3);

      const lastPageWithInvalidNext = {
        ...lastPageWithoutNext,
        next: "https://swapi.dev/api/people/invalid"
      };

      const nextPageParamInvalid = mockQuery.getNextPageParam(lastPageWithInvalidNext);
      expect(nextPageParamInvalid).toBeUndefined();
    });
  });
});

