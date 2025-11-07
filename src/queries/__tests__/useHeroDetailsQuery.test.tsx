import React from "react";
import { describe, it, expect } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useHeroDetails } from "../useHeroDetailsQuery";
import { server } from "../../test/mocks/server";
import { http, HttpResponse } from "msw";
import { API_BASE_URL } from "../../constants/api";

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
    server.use(
      http.get(`${API_BASE_URL}/people/999/`, () => {
        return HttpResponse.json(
          { detail: "Not found" },
          { status: 404 }
        );
      })
    );

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
});

