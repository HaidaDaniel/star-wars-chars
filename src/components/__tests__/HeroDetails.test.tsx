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

    expect(screen.getByText("Films:")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("Starships:")).toBeInTheDocument();
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
    const heroWithoutConnections: Hero = {
      ...mockHero,
      films: [],
      starships: [],
    };

    renderWithQueryClient(<HeroDetails heroDetails={heroWithoutConnections} />);

    await waitFor(() => {
      expect(screen.getByText("Graph Statistics")).toBeInTheDocument();
    });

    expect(screen.getByText("Films:")).toBeInTheDocument();
    expect(screen.getAllByText("0")).toHaveLength(2);
    expect(screen.getByText("Starships:")).toBeInTheDocument();
  });

  it("should show error state when query fails", async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const errorHero: Hero = {
      ...mockHero,
      films: [999],
      starships: [999],
    };

    renderWithQueryClient(<HeroDetails heroDetails={errorHero} />);

    await waitFor(() => {
      expect(screen.getByText(/Failed to load.*details/)).toBeInTheDocument();
    }, { timeout: 10000 });
    
    expect(screen.queryByTestId("react-flow-mock")).not.toBeInTheDocument();
    expect(screen.queryByText("Graph Statistics")).not.toBeInTheDocument();

    consoleErrorSpy.mockRestore();
  });
});
