import { describe, it, expect } from "vitest";
import { cn } from "../utils";

describe("cn utility", () => {
  it("should merge class names", () => {
    const result = cn("foo", "bar");
    expect(result).toContain("foo");
    expect(result).toContain("bar");
  });

  it("should handle conditional classes", () => {
    const result = cn("foo", (false as boolean) && "bar", "baz");
    expect(result).toContain("foo");
    expect(result).toContain("baz");
    expect(result).not.toContain("bar");
  });

  it("should merge Tailwind classes correctly", () => {
    const result = cn("px-2 py-1", "px-4");
    expect(result).toContain("py-1");
    expect(result).toContain("px-4");
    expect(result).not.toContain("px-2");
  });

  it("should handle empty strings and null", () => {
    const result = cn("foo", "", null, undefined, "bar");
    expect(result).toContain("foo");
    expect(result).toContain("bar");
  });

  it("should handle arrays", () => {
    const result = cn(["foo", "bar"], "baz");
    expect(result).toContain("foo");
    expect(result).toContain("bar");
    expect(result).toContain("baz");
  });

  it("should handle objects", () => {
    const result = cn({ foo: true, bar: false, baz: true });
    expect(result).toContain("foo");
    expect(result).toContain("baz");
    expect(result).not.toContain("bar");
  });
});


