import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { HeroCardSkeleton } from "../HeroCardSkeleton";

describe("HeroCardSkeleton", () => {
  it("should render skeleton loader", () => {
    render(<HeroCardSkeleton />);

    const skeletonElements = screen.getAllByRole("generic").filter(
      (el) => el.className.includes("animate-pulse")
    );

    expect(skeletonElements.length).toBeGreaterThan(0);
  });

  it("should have correct structure", () => {
    const { container } = render(<HeroCardSkeleton />);

    expect(container.querySelector(".flex.flex-col")).toBeInTheDocument();
  });

  it("should display multiple skeleton lines", () => {
    const { container } = render(<HeroCardSkeleton />);

    const pulseElements = container.querySelectorAll(".animate-pulse");
    expect(pulseElements.length).toBeGreaterThan(1);
  });
});


