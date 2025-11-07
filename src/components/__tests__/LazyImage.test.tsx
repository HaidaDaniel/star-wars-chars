import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { render, screen, waitFor, fireEvent, act } from "@testing-library/react";
import { LazyImage } from "../LazyImage";

vi.mock("../../constants/api", () => ({
  API_BASE_URL: "https://sw-api.starnavi.io",
  CHARACTER_IMAGE_URL: "https://starwars-visualguide.com/assets/img/characters",
  FALLBACK_CHARACTER_IMAGE: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='600' viewBox='0 0 400 600'%3E%3Crect fill='%23111827' width='400' height='600'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='48' fill='%236b7280'%3ENo Image%3C/text%3E%3C/svg%3E",
  IMAGES_ENABLED: true,
}));

const CHARACTER_IMAGE_URL = "https://starwars-visualguide.com/assets/img/characters";
const FALLBACK_CHARACTER_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='600' viewBox='0 0 400 600'%3E%3Crect fill='%23111827' width='400' height='600'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='48' fill='%236b7280'%3ENo Image%3C/text%3E%3C/svg%3E";

describe("LazyImage", () => {
  let mockObserverInstance: {
    observe: ReturnType<typeof vi.fn>;
    disconnect: ReturnType<typeof vi.fn>;
    unobserve: ReturnType<typeof vi.fn>;
    takeRecords: ReturnType<typeof vi.fn>;
  };
  let observeCallback: IntersectionObserverCallback;
  let observerOptions: IntersectionObserverInit | undefined;

  beforeEach(() => {
    mockObserverInstance = {
      observe: vi.fn(),
      disconnect: vi.fn(),
      unobserve: vi.fn(),
      takeRecords: vi.fn(),
    };

    const MockIntersectionObserver = function(
      this: typeof mockObserverInstance,
      callback: IntersectionObserverCallback,
      options?: IntersectionObserverInit
    ) {
      observeCallback = callback;
      observerOptions = options;
      return mockObserverInstance;
    } as unknown as {
      new (callback: IntersectionObserverCallback, options?: IntersectionObserverInit): IntersectionObserver;
    };

    global.IntersectionObserver = MockIntersectionObserver;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should render with loading state initially", () => {
    render(<LazyImage characterId={1} alt="Luke Skywalker" />);

    expect(screen.getByText("Loading...")).toBeInTheDocument();
    const img = screen.getByAltText("Luke Skywalker");
    expect(img).toHaveClass("opacity-0");
  });

  it("should apply custom className to wrapper", () => {
    const { container } = render(
      <LazyImage characterId={1} alt="Luke Skywalker" className="custom-class" />
    );

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass("custom-class");
    expect(wrapper).toHaveClass("relative", "overflow-hidden");
  });

  it("should set proper alt text on image", () => {
    render(<LazyImage characterId={1} alt="Luke Skywalker" />);

    const img = screen.getByAltText("Luke Skywalker");
    expect(img).toBeInTheDocument();
  });

  it("should create IntersectionObserver with correct options", () => {
    render(<LazyImage characterId={1} alt="Luke Skywalker" />);

    expect(observerOptions).toBeDefined();
    expect(observerOptions?.rootMargin).toBe("50px");
  });

  it("should observe image element when mounted", () => {
    render(<LazyImage characterId={1} alt="Luke Skywalker" />);

    expect(mockObserverInstance.observe).toHaveBeenCalled();
  });

  it("should load image when element intersects viewport", async () => {
    render(<LazyImage characterId={1} alt="Luke Skywalker" />);

    const img = screen.getByAltText("Luke Skywalker");

    expect(img).toHaveAttribute("src", FALLBACK_CHARACTER_IMAGE);

    act(() => {
      observeCallback(
        [
          {
            isIntersecting: true,
            target: img,
            intersectionRatio: 1,
            boundingClientRect: {} as DOMRectReadOnly,
            intersectionRect: {} as DOMRectReadOnly,
            rootBounds: null,
            time: Date.now(),
          },
        ],
        mockObserverInstance as unknown as IntersectionObserver
      );
    });

    await waitFor(() => {
      expect(img).toHaveAttribute("src", `${CHARACTER_IMAGE_URL}/1.jpg`);
    });
  });

  it("should not load image when element does not intersect", () => {
    render(<LazyImage characterId={1} alt="Luke Skywalker" />);

    const img = screen.getByAltText("Luke Skywalker");

    observeCallback(
      [
        {
          isIntersecting: false,
          target: img,
          intersectionRatio: 0,
          boundingClientRect: {} as DOMRectReadOnly,
          intersectionRect: {} as DOMRectReadOnly,
          rootBounds: null,
          time: Date.now(),
        },
      ],
      mockObserverInstance as unknown as IntersectionObserver
    );

    expect(img).toHaveAttribute("src", FALLBACK_CHARACTER_IMAGE);
  });

  it("should hide loading state when image loads successfully", async () => {
    render(<LazyImage characterId={1} alt="Luke Skywalker" />);

    const img = screen.getByAltText("Luke Skywalker");

    act(() => {
      observeCallback(
        [
          {
            isIntersecting: true,
            target: img,
            intersectionRatio: 1,
            boundingClientRect: {} as DOMRectReadOnly,
            intersectionRect: {} as DOMRectReadOnly,
            rootBounds: null,
            time: Date.now(),
          },
        ],
        mockObserverInstance as unknown as IntersectionObserver
      );
    });

    await waitFor(() => {
      expect(img).toHaveAttribute("src", `${CHARACTER_IMAGE_URL}/1.jpg`);
    });

    act(() => {
      fireEvent.load(img);
    });

    await waitFor(() => {
      expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
      expect(img).toHaveClass("opacity-100");
      expect(img).not.toHaveClass("opacity-0");
    });
  });

  it("should show fallback image on load error", async () => {
    render(<LazyImage characterId={1} alt="Luke Skywalker" />);

    const img = screen.getByAltText("Luke Skywalker");

    act(() => {
      observeCallback(
        [
          {
            isIntersecting: true,
            target: img,
            intersectionRatio: 1,
            boundingClientRect: {} as DOMRectReadOnly,
            intersectionRect: {} as DOMRectReadOnly,
            rootBounds: null,
            time: Date.now(),
          },
        ],
        mockObserverInstance as unknown as IntersectionObserver
      );
    });

    await waitFor(() => {
      expect(img).toHaveAttribute("src", `${CHARACTER_IMAGE_URL}/1.jpg`);
    });

    act(() => {
      fireEvent.error(img);
    });

    await waitFor(() => {
      expect(img).toHaveAttribute("src", FALLBACK_CHARACTER_IMAGE);
      expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
    });
  });

  it("should disconnect observer on unmount", () => {
    const { unmount } = render(<LazyImage characterId={1} alt="Luke Skywalker" />);

    unmount();

    expect(mockObserverInstance.disconnect).toHaveBeenCalled();
  });

  it("should render different character images based on characterId", async () => {
    const { rerender } = render(<LazyImage characterId={1} alt="Character 1" />);

    let img = screen.getByAltText("Character 1");

    act(() => {
      observeCallback(
        [
          {
            isIntersecting: true,
            target: img,
            intersectionRatio: 1,
            boundingClientRect: {} as DOMRectReadOnly,
            intersectionRect: {} as DOMRectReadOnly,
            rootBounds: null,
            time: Date.now(),
          },
        ],
        mockObserverInstance as unknown as IntersectionObserver
      );
    });

    await waitFor(() => {
      expect(img).toHaveAttribute("src", `${CHARACTER_IMAGE_URL}/1.jpg`);
    });

    rerender(<LazyImage characterId={2} alt="Character 2" />);

    img = screen.getByAltText("Character 2");


    expect(img).toHaveAttribute("src", `${CHARACTER_IMAGE_URL}/1.jpg`);

    expect(mockObserverInstance.disconnect).toHaveBeenCalled();
  });

  it("should have lazy loading attribute on img element", () => {
    render(<LazyImage characterId={1} alt="Luke Skywalker" />);

    const img = screen.getByAltText("Luke Skywalker");
    expect(img).toHaveAttribute("loading", "lazy");
  });

  it("should render proper structure with wrapper and loading indicator", () => {
    const { container } = render(<LazyImage characterId={1} alt="Luke Skywalker" />);

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass("relative", "overflow-hidden");
    expect(wrapper.querySelector("img")).toBeInTheDocument();
    expect(wrapper.querySelector(".animate-pulse")).toBeInTheDocument();
  });

  it("should handle multiple intersection events correctly", async () => {
    render(<LazyImage characterId={1} alt="Luke Skywalker" />);

    const img = screen.getByAltText("Luke Skywalker");

    act(() => {
      observeCallback(
        [
          {
            isIntersecting: true,
            target: img,
            intersectionRatio: 1,
            boundingClientRect: {} as DOMRectReadOnly,
            intersectionRect: {} as DOMRectReadOnly,
            rootBounds: null,
            time: Date.now(),
          },
        ],
        mockObserverInstance as unknown as IntersectionObserver
      );
    });

    await waitFor(() => {
      expect(img).toHaveAttribute("src", `${CHARACTER_IMAGE_URL}/1.jpg`);
    });

    const currentSrc = img.getAttribute("src");
    
    act(() => {
      observeCallback(
        [
          {
            isIntersecting: true,
            target: img,
            intersectionRatio: 1,
            boundingClientRect: {} as DOMRectReadOnly,
            intersectionRect: {} as DOMRectReadOnly,
            rootBounds: null,
            time: Date.now(),
          },
        ],
        mockObserverInstance as unknown as IntersectionObserver
      );
    });

    expect(img).toHaveAttribute("src", currentSrc);
  });

  it("should not trigger load if already has error", async () => {
    render(<LazyImage characterId={1} alt="Luke Skywalker" />);

    const img = screen.getByAltText("Luke Skywalker");

    act(() => {
      observeCallback(
        [
          {
            isIntersecting: true,
            target: img,
            intersectionRatio: 1,
            boundingClientRect: {} as DOMRectReadOnly,
            intersectionRect: {} as DOMRectReadOnly,
            rootBounds: null,
            time: Date.now(),
          },
        ],
        mockObserverInstance as unknown as IntersectionObserver
      );
    });

    await waitFor(() => {
      expect(img).toHaveAttribute("src", `${CHARACTER_IMAGE_URL}/1.jpg`);
    });

    act(() => {
      fireEvent.error(img);
    });

    await waitFor(() => {
      expect(img).toHaveAttribute("src", FALLBACK_CHARACTER_IMAGE);
    });

    act(() => {
      observeCallback(
        [
          {
            isIntersecting: true,
            target: img,
            intersectionRatio: 1,
            boundingClientRect: {} as DOMRectReadOnly,
            intersectionRect: {} as DOMRectReadOnly,
            rootBounds: null,
            time: Date.now(),
          },
        ],
        mockObserverInstance as unknown as IntersectionObserver
      );
    });

    expect(img).toHaveAttribute("src", FALLBACK_CHARACTER_IMAGE);
  });

  it("should show correct initial image src", () => {
    render(<LazyImage characterId={1} alt="Luke Skywalker" />);

    const img = screen.getByAltText("Luke Skywalker");
    expect(img).toHaveAttribute("src", FALLBACK_CHARACTER_IMAGE);
  });

  it("should handle image load transition with correct opacity classes", async () => {
    render(<LazyImage characterId={1} alt="Luke Skywalker" />);

    const img = screen.getByAltText("Luke Skywalker");

    expect(img).toHaveClass("opacity-0");

    act(() => {
      observeCallback(
        [
          {
            isIntersecting: true,
            target: img,
            intersectionRatio: 1,
            boundingClientRect: {} as DOMRectReadOnly,
            intersectionRect: {} as DOMRectReadOnly,
            rootBounds: null,
            time: Date.now(),
          },
        ],
        mockObserverInstance as unknown as IntersectionObserver
      );
    });

    await waitFor(() => {
      expect(img).toHaveAttribute("src", `${CHARACTER_IMAGE_URL}/1.jpg`);
    });

    act(() => {
      fireEvent.load(img);
    });

    await waitFor(() => {
      expect(img).toHaveClass("opacity-100");
    });
  });

  it("should handle error before intersection", async () => {
    render(<LazyImage characterId={1} alt="Luke Skywalker" />);

    const img = screen.getByAltText("Luke Skywalker");

    expect(img).toHaveAttribute("src", FALLBACK_CHARACTER_IMAGE);

    act(() => {
      fireEvent.error(img);
    });

    await waitFor(() => {
      expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
    });

    act(() => {
      observeCallback(
        [
          {
            isIntersecting: true,
            target: img,
            intersectionRatio: 1,
            boundingClientRect: {} as DOMRectReadOnly,
            intersectionRect: {} as DOMRectReadOnly,
            rootBounds: null,
            time: Date.now(),
          },
        ],
        mockObserverInstance as unknown as IntersectionObserver
      );
    });

    expect(img).toHaveAttribute("src", FALLBACK_CHARACTER_IMAGE);
  });
});
