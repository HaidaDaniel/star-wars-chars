import { describe, it, expect } from "vitest";
import { extractIdFromUrl, addIdToResource } from "../apiHelpers";

describe("apiHelpers", () => {
  describe("extractIdFromUrl", () => {
    it("should extract ID from URL with trailing slash", () => {
      const url = "https://sw-api.starnavi.io/people/1/";
      const id = extractIdFromUrl(url);
      expect(id).toBe(1);
    });

    it("should extract ID from URL without trailing slash", () => {
      const url = "https://sw-api.starnavi.io/people/42";
      const id = extractIdFromUrl(url);
      expect(id).toBe(42);
    });

    it("should extract ID from URL with multiple path segments", () => {
      const url = "https://sw-api.starnavi.io/api/v1/people/123/";
      const id = extractIdFromUrl(url);
      expect(id).toBe(123);
    });

    it("should return null for URL without ID", () => {
      const url = "https://sw-api.starnavi.io/people/";
      const id = extractIdFromUrl(url);
      expect(id).toBeNull();
    });

    it("should return null for invalid URL", () => {
      const url = "invalid-url";
      const id = extractIdFromUrl(url);
      expect(id).toBeNull();
    });

    it("should handle large IDs", () => {
      const url = "https://sw-api.starnavi.io/people/999999/";
      const id = extractIdFromUrl(url);
      expect(id).toBe(999999);
    });
  });

  describe("addIdToResource", () => {
    it("should add ID to resource without existing ID", () => {
      const resource = {
        url: "https://sw-api.starnavi.io/people/5/",
        name: "Test Hero",
      };

      const result = addIdToResource(resource);

      expect(result.id).toBe(5);
      expect(result.name).toBe("Test Hero");
      expect(result.url).toBe(resource.url);
    });

    it("should preserve existing ID if present", () => {
      const resource = {
        id: 10,
        url: "https://sw-api.starnavi.io/people/5/",
        name: "Test Hero",
      };

      const result = addIdToResource(resource);

      expect(result.id).toBe(10);
      expect(result.name).toBe("Test Hero");
    });

    it("should throw error if ID cannot be extracted", () => {
      const resource = {
        url: "https://sw-api.starnavi.io/people/",
        name: "Test Hero",
      };

      expect(() => addIdToResource(resource)).toThrow("Unable to extract ID from URL");
    });

    it("should work with different resource types", () => {
      const filmResource = {
        url: "https://sw-api.starnavi.io/films/3/",
        title: "Test Film",
      };

      const result = addIdToResource(filmResource);

      expect(result.id).toBe(3);
      expect(result.title).toBe("Test Film");
    });

    it("should preserve all original properties", () => {
      const resource = {
        url: "https://sw-api.starnavi.io/people/7/",
        name: "Test Hero",
        birth_year: "19BBY",
        eye_color: "blue",
      };

      const result = addIdToResource(resource);

      expect(result.id).toBe(7);
      expect(result.name).toBe("Test Hero");
      expect(result.birth_year).toBe("19BBY");
      expect(result.eye_color).toBe("blue");
    });
  });
});


