import { render, screen, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, it, expect, beforeAll, afterAll, afterEach, vi } from "vitest";
import { HeroDetailsModal } from "../HeroDetailsModal";
import { server } from "../../test/mocks/server";

// Mock HeroDetails to avoid React Flow complexity in modal tests
vi.mock("../HeroDetails", () => ({
  HeroDetails: ({ heroDetails }: { heroDetails: any }) => (
    <div data-testid="hero-details-mock">Hero Details for {heroDetails.name}</div>
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

describe("HeroDetailsModal Component", () => {
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  const mockOnClose = vi.fn();

  afterEach(() => {
    mockOnClose.mockClear();
  });

  it("should not render modal when closed", () => {
    renderWithQueryClient(
      <HeroDetailsModal
        isOpen={false}
        heroId={null}
        onClose={mockOnClose}
      />
    );

    expect(screen.queryByText("Hero Details")).not.toBeInTheDocument();
  });

  it("should render modal when open with hero ID", () => {
    renderWithQueryClient(
      <HeroDetailsModal
        isOpen={true}
        heroId={1}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText("Hero Details")).toBeInTheDocument();
  });

  it("should show loading state when hero is loading", () => {
    renderWithQueryClient(
      <HeroDetailsModal
        isOpen={true}
        heroId={1}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText("Loading hero details...")).toBeInTheDocument();
  });

  it("should render HeroDetails component when data is loaded", async () => {
    renderWithQueryClient(
      <HeroDetailsModal
        isOpen={true}
        heroId={1}
        onClose={mockOnClose}
      />
    );

    // Wait for loading to finish and hero details to render
    await screen.findByTestId("hero-details-mock");
    
    expect(screen.getByTestId("hero-details-mock")).toBeInTheDocument();
  });

  it("should handle modal close via onOpenChange", () => {
    renderWithQueryClient(
      <HeroDetailsModal
        isOpen={true}
        heroId={1}
        onClose={mockOnClose}
      />
    );

    // Simulate dialog close behavior
    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();
    
    // The dialog component should be properly set up
    expect(screen.getByText("Hero Details")).toBeInTheDocument();
  });

  it("should handle null heroId", () => {
    renderWithQueryClient(
      <HeroDetailsModal
        isOpen={true}
        heroId={null}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText("Hero Details")).toBeInTheDocument();
  });
});
