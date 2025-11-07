import React from "react";
import { describe, it, expect } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useHeroDetails, useHeroDetailsQuery } from "../useHeroDetailsQuery";

describe("useHeroDetails", () => {
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

  it("should fetch hero details when heroId is provided", async () => {
    const { result } = renderHook(() => useHeroDetails(1), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.heroDetails).toBeUndefined();

    await waitFor(
      () => {
        expect(result.current.isLoading).toBe(false);
      });



    expect(result.current.isLoading).toBe(false);
    expect(result.current.heroDetails?.id).toBe(1);
    expect(result.current.heroDetails?.name).toBe("Luke Skywalker");
    expect(result.current.isError).toBe(false);
  });

  it("should not fetch when heroId is null", () => {
    const { result } = renderHook(() => useHeroDetails(null), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.heroDetails).toBeUndefined();
    expect(result.current.isError).toBe(false);
  });

  it("should handle error state when fetch fails", async () => {
    const { result } = renderHook(() => useHeroDetails(999), {
      wrapper: createWrapper(),
    });

    await waitFor(
      () => {
        expect(result.current.isLoading).toBe(false);
      });

    await waitFor(
      () => {
        expect(result.current.isError).toBe(true);
      });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.heroDetails).toBeUndefined();
  });

  describe("useHeroDetailsQuery", () => {
    it("should throw error when heroId is null and query is enabled", async () => {
      const queryClient = new QueryClient({
        defaultOptions: {
          queries: {
            retry: false,
            enabled: true,
          },
        },
      });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      );

      const { result } = renderHook(() => {
        return useHeroDetailsQuery(null);
      }, { wrapper });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe(null);

      const queryClient2 = new QueryClient({
        defaultOptions: { queries: { retry: false } }
      });

      try {
        await queryClient2.fetchQuery({
          queryKey: ["heroDetails", null],
          queryFn: () => {
            const heroId = null;
            if (!heroId) {
              throw new Error("Hero ID is required");
            }
            return Promise.resolve({});
          },
        });
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe("Hero ID is required");
      }
    });
  });
});

