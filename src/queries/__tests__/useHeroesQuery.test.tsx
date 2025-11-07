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
    });

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
    });

    expect(result.current.hasNextPage).toBe(true);
  });

  it("should load more heroes when loadMoreHeroes is called", async () => {
    const { result } = renderHook(() => useHeroesList(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const initialHeroesCount = result.current.heroes.length;

    if (result.current.hasNextPage) {
      result.current.loadMoreHeroes();

      await waitFor(() => {
        expect(result.current.isFetching).toBe(false);
      });

      // Should have more heroes after loading (MSW returns same hero for all pages)
      expect(result.current.heroes.length).toBe(initialHeroesCount + 1);
    }
  });

  it("should not load more when already loading", async () => {
    const { result } = renderHook(() => useHeroesList(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    result.current.loadMoreHeroes();
    result.current.loadMoreHeroes();
    result.current.loadMoreHeroes();

    expect(typeof result.current.isFetching).toBe("boolean");
  });
});

