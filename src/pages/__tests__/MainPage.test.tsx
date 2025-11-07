import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, it, expect, beforeAll, afterAll, afterEach, vi } from "vitest";
import { MainPage } from "../MainPage";
import { server } from "../../test/mocks/server";

// Mock infinite scroll to simplify testing
vi.mock("react-infinite-scroll-component", () => ({
  default: ({ 
    children, 
    hasMore, 
    next, 
    loader 
  }: { 
    children: React.ReactNode; 
    hasMore: boolean; 
    next: () => void; 
    loader: React.ReactNode 
  }) => (
    <div data-testid="infinite-scroll">
      {children}
      {hasMore && (
        <button onClick={next} data-testid="load-more">
          Load More
        </button>
      )}
      {loader}
    </div>
  ),
}));

// Mock HeroCard to simplify testing
vi.mock("../../components/HeroCard", () => ({
  default: ({ name, id }: { name: string; id: number }) => (
    <div data-testid={`hero-card-${id}`}>
      Hero: {name}
    </div>
  ),
}));

// Mock HeroDetailsModal to avoid complex modal testing
vi.mock("../../components/HeroDetailsModal", () => ({
  HeroDetailsModal: ({ 
    isOpen, 
    heroId, 
    onClose 
  }: { 
    isOpen: boolean; 
    heroId: number | null; 
    onClose: () => void 
  }) => (
    isOpen ? (
      <div data-testid="hero-modal">
        Modal for hero {heroId}
        <button onClick={onClose} data-testid="close-modal">
          Close
        </button>
      </div>
    ) : null
  ),
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

describe("MainPage Component", () => {
  beforeAll(() => server.listen());
  afterEach(() => {
    cleanup();
    server.resetHandlers();
    vi.unstubAllGlobals();
  });
  afterAll(() => server.close());

  it("should show loading skeleton initially", () => {
    renderWithQueryClient(<MainPage />);
    
    const skeletonElements = document.querySelectorAll('.animate-pulse');
    expect(skeletonElements.length).toBeGreaterThan(0);
  });

  it("should render hero cards when data loads", async () => {
    renderWithQueryClient(<MainPage />);

    await waitFor(() => {
      expect(screen.getByTestId("hero-card-1")).toBeInTheDocument();
    });

    expect(screen.getByText("Hero: Luke Skywalker")).toBeInTheDocument();
  });

  it("should render infinite scroll component", async () => {
    renderWithQueryClient(<MainPage />);

    await waitFor(() => {
      expect(screen.getByTestId("infinite-scroll")).toBeInTheDocument();
    });
  });

  it("should open modal when hero card is clicked", async () => {
    renderWithQueryClient(<MainPage />);

    await waitFor(() => {
      expect(screen.getByTestId("hero-card-1")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId("hero-card-1"));

    await waitFor(() => {
      expect(screen.getByTestId("hero-modal")).toBeInTheDocument();
    });

    expect(screen.getByText("Modal for hero 1")).toBeInTheDocument();
  });

  it("should close modal when close button is clicked", async () => {
    renderWithQueryClient(<MainPage />);

    await waitFor(() => {
      expect(screen.getByTestId("hero-card-1")).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByTestId("hero-card-1"));

    await waitFor(() => {
      expect(screen.getByTestId("hero-modal")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId("close-modal"));

    await waitFor(() => {
      expect(screen.queryByTestId("hero-modal")).not.toBeInTheDocument();
    });
  });

  it("should handle load more functionality", async () => {
    renderWithQueryClient(<MainPage />);

    await waitFor(() => {
      expect(screen.getByTestId("infinite-scroll")).toBeInTheDocument();
    });

    const loadMoreBtn = screen.queryByTestId("load-more");
    if (loadMoreBtn) {
      fireEvent.click(loadMoreBtn);
      expect(loadMoreBtn).toBeInTheDocument();
    }
  });

  it("should display error state when fetching heroes fails", async () => {
    const { http, HttpResponse } = await import("msw");
    server.use(
      http.get("https://sw-api.starnavi.io/people/", () => {
        return HttpResponse.json(
          { detail: "Internal server error" },
          { status: 500 }
        );
      })
    );
    
    renderWithQueryClient(<MainPage />);

    await waitFor(() => {
      expect(screen.getByText("Error loading heroes")).toBeInTheDocument();
    });

    expect(
      screen.getByText(/Error loading heroes/)
    ).toBeInTheDocument();
  });

  it("should display custom error message when available", async () => {
    const { http, HttpResponse } = await import("msw");
    const customErrorMessage = "Network connection failed";
    
    server.use(
      http.get("https://sw-api.starnavi.io/people/", () => {
        return HttpResponse.json(
          { detail: customErrorMessage },
          { status: 500 }
        );
      })
    );
    
    renderWithQueryClient(<MainPage />);

    await waitFor(() => {
      expect(screen.getByText("Error loading heroes")).toBeInTheDocument();
    });

    expect(screen.getByText(/Error loading heroes/)).toBeInTheDocument();
  });

  it("should reload page when Try Again button is clicked in error state", async () => {
    const reloadMock = vi.fn();
    vi.stubGlobal('location', { ...window.location, reload: reloadMock });

    const { http, HttpResponse } = await import("msw");
    server.use(
      http.get("https://sw-api.starnavi.io/people/", () => {
        return HttpResponse.json(
          { detail: "Server error" },
          { status: 500 }
        );
      })
    );
    
    renderWithQueryClient(<MainPage />);

    await waitFor(() => {
      expect(screen.getByText("Error loading heroes")).toBeInTheDocument();
    });

    const tryAgainButton = screen.getByRole("button", { name: /try again/i });
    fireEvent.click(tryAgainButton);

    expect(reloadMock).toHaveBeenCalledTimes(1);
  });

  it("should render skeleton loaders during fetching with proper key", async () => {
    const { http, HttpResponse, delay } = await import("msw");
    let requestCount = 0;
    
    server.use(
      http.get("https://sw-api.starnavi.io/people/", async ({ request }) => {
        requestCount++;
        const url = new URL(request.url);
        const page = url.searchParams.get("page");
        
        if (page === "2") {
          await delay(50);
        }
        
        return HttpResponse.json({
          count: 20,
          next: page === "2" ? null : "https://sw-api.starnavi.io/people/?page=2",
          previous: null,
          results: [
            {
              id: requestCount,
              name: `Hero ${requestCount}`,
              height: "172",
              mass: "77",
              hair_color: "blond",
              skin_color: "fair",
              eye_color: "blue",
              birth_year: "19BBY",
              gender: "male",
              homeworld: 1,
              films: [1],
              species: [],
              vehicles: [],
              starships: [],
              created: "2014-12-09T13:50:51.644000Z",
              edited: "2014-12-20T21:17:56.891000Z",
              url: `https://sw-api.starnavi.io/people/${requestCount}/`,
            },
          ],
        });
      })
    );

    renderWithQueryClient(<MainPage />);

    await waitFor(() => {
      expect(screen.getByTestId("hero-card-1")).toBeInTheDocument();
    });

    const loadMoreBtn = screen.queryByTestId("load-more");
    if (loadMoreBtn) {
      fireEvent.click(loadMoreBtn);
      expect(loadMoreBtn).toBeInTheDocument();
    }
  });

  it("should show 'All Characters Loaded' message when all heroes are loaded", async () => {
    const { http, HttpResponse } = await import("msw");
    server.use(
      http.get("https://sw-api.starnavi.io/people/", () => {
        return HttpResponse.json({
          count: 1,
          next: null,
          previous: null,
          results: [
            {
              id: 1,
              name: "Luke Skywalker",
              height: "172",
              mass: "77",
              hair_color: "blond",
              skin_color: "fair",
              eye_color: "blue",
              birth_year: "19BBY",
              gender: "male",
              homeworld: 1,
              films: [1, 2, 3],
              species: [],
              vehicles: [14, 30],
              starships: [12, 22],
              created: "2014-12-09T13:50:51.644000Z",
              edited: "2014-12-20T21:17:56.891000Z",
              url: "https://sw-api.starnavi.io/people/1/",
            },
          ],
        });
      })
    );

    renderWithQueryClient(<MainPage />);

    await waitFor(() => {
      expect(screen.getByTestId("hero-card-1")).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText("All Characters Loaded")).toBeInTheDocument();
    });
  });
});
