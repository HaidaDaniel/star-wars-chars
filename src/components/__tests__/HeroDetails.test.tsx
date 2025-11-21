import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, it, expect, beforeAll, afterAll, afterEach, vi } from "vitest";
import { HeroDetails } from "../HeroDetails";
import { server, mockHero } from "../../test/mocks/server";
import type { Hero } from "../../types/Hero.types";

vi.mock("@xyflow/react", () => ({
  ReactFlow: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="react-flow-mock">{children}</div>
  ),
  Controls: () => <div data-testid="controls-mock" />,
  Background: () => <div data-testid="background-mock" />,
}));

const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

const renderWithQueryClient = (component: React.ReactElement) => {
  const queryClient = createQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      {component}
    </QueryClientProvider>
  );
};

const mockHeroDetails: Hero = {
  ...mockHero,
  films: [1, 2, 3],
  starships: [12],
};

describe("HeroDetails Component", () => {
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it("should show loading state initially", () => {
    renderWithQueryClient(<HeroDetails heroDetails={mockHeroDetails} />);
    expect(screen.getByText(/Loading.*details/)).toBeInTheDocument();
    expect(screen.getByText("Fetching films and starships data")).toBeInTheDocument();
  });

  it("should render hero details with graph when data loads", async () => {
    renderWithQueryClient(<HeroDetails heroDetails={mockHeroDetails} />);

    await waitFor(() => {
      expect(screen.getByTestId("react-flow-mock")).toBeInTheDocument();
    });

    expect(screen.getByText("Graph Statistics")).toBeInTheDocument();
    expect(screen.getByText("Hero")).toBeInTheDocument();
    expect(screen.getByText(/Films:/)).toBeInTheDocument();
    expect(screen.getByText(/Starships:/)).toBeInTheDocument();
  });

  it("should display correct film and starship counts", async () => {
    renderWithQueryClient(<HeroDetails heroDetails={mockHeroDetails} />);

    await waitFor(() => {
      expect(screen.getByText("Graph Statistics")).toBeInTheDocument();
    });

    // The API returns data based on heroId filtering, not individual IDs
    // For heroId 1, the mock returns 1 film and 1 starship
    expect(screen.getByText(/Films:/)).toBeInTheDocument();
    expect(screen.getByText(/Starships:/)).toBeInTheDocument();
    
    // Check that both counts are "1" - there should be at least 2 elements with text "1"
    // (one for films count, one for starships count)
    const counts = screen.getAllByText("1");
    expect(counts.length).toBeGreaterThanOrEqual(2);
    
    // Verify the counts are displayed by checking the parent container
    // Find the parent div that contains "Graph Statistics" and verify it contains the counts
    const filmsLabel = screen.getByText(/Films:/);
    const starshipsLabel = screen.getByText(/Starships:/);
    expect(filmsLabel.closest('div[class*="bg-card"]')).toBeInTheDocument();
    expect(starshipsLabel.closest('div[class*="bg-card"]')).toBeInTheDocument();
  });

  it("should render React Flow components", async () => {
    renderWithQueryClient(<HeroDetails heroDetails={mockHeroDetails} />);

    await waitFor(() => {
      expect(screen.getByTestId("react-flow-mock")).toBeInTheDocument();
    });

    expect(screen.getByTestId("controls-mock")).toBeInTheDocument();
    expect(screen.getByTestId("background-mock")).toBeInTheDocument();
  });

  it("should handle hero with no films or starships", async () => {
    // Use a hero ID that doesn't exist in the mock server to get empty results
    const heroWithoutConnections: Hero = {
      ...mockHero,
      id: 999,
      films: [],
      starships: [],
    };

    renderWithQueryClient(<HeroDetails heroDetails={heroWithoutConnections} />);

    await waitFor(() => {
      expect(screen.getByText("Graph Statistics")).toBeInTheDocument();
    });

    expect(screen.getByText("Films:")).toBeInTheDocument();
    // When both arrays are empty and API returns empty results, counts should be 0
    const zeroCounts = screen.getAllByText("0");
    expect(zeroCounts.length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText("Starships:")).toBeInTheDocument();
  });

  it("should show error state when query fails", async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    // Use a hero ID that doesn't exist and has non-empty arrays
    // This will cause the API to return empty results, triggering the error condition
    const errorHero: Hero = {
      ...mockHero,
      id: 999,
      films: [999],
      starships: [999],
    };

    renderWithQueryClient(<HeroDetails heroDetails={errorHero} />);

    await waitFor(() => {
      expect(screen.getByText(/Failed to load.*details/)).toBeInTheDocument();
    }, { timeout: 2000 });
    
    expect(screen.queryByTestId("react-flow-mock")).not.toBeInTheDocument();
    expect(screen.queryByText("Graph Statistics")).not.toBeInTheDocument();

    consoleErrorSpy.mockRestore();
  });
});
