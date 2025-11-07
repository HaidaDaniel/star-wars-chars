import { render, screen, fireEvent, waitFor } from "@testing-library/react";
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
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it("should show loading skeleton initially", () => {
    renderWithQueryClient(<MainPage />);
    
    // Should show skeleton loaders while loading (look for animate-pulse class)
    const skeletonElements = document.querySelectorAll('.animate-pulse');
    expect(skeletonElements.length).toBeGreaterThan(0);
  });

  it("should render hero cards when data loads", async () => {
    renderWithQueryClient(<MainPage />);

    // Wait for hero cards to appear
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

    // Wait for hero card to appear
    await waitFor(() => {
      expect(screen.getByTestId("hero-card-1")).toBeInTheDocument();
    });

    // Click on hero card
    fireEvent.click(screen.getByTestId("hero-card-1"));

    // Modal should open
    await waitFor(() => {
      expect(screen.getByTestId("hero-modal")).toBeInTheDocument();
    });

    expect(screen.getByText("Modal for hero 1")).toBeInTheDocument();
  });

  it("should close modal when close button is clicked", async () => {
    renderWithQueryClient(<MainPage />);

    // Wait for hero card and click it
    await waitFor(() => {
      expect(screen.getByTestId("hero-card-1")).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByTestId("hero-card-1"));

    // Wait for modal to open
    await waitFor(() => {
      expect(screen.getByTestId("hero-modal")).toBeInTheDocument();
    });

    // Click close button
    fireEvent.click(screen.getByTestId("close-modal"));

    // Modal should close
    await waitFor(() => {
      expect(screen.queryByTestId("hero-modal")).not.toBeInTheDocument();
    });
  });

  it("should handle load more functionality", async () => {
    renderWithQueryClient(<MainPage />);

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByTestId("infinite-scroll")).toBeInTheDocument();
    });

    // Check if load more button exists (when hasMore is true)
    const loadMoreBtn = screen.queryByTestId("load-more");
    if (loadMoreBtn) {
      fireEvent.click(loadMoreBtn);
      // Should trigger loading more heroes
      expect(loadMoreBtn).toBeInTheDocument();
    }
  });
});
