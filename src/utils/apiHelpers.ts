/**
 * Extracts resource ID from Star Wars API URL.
 * The API URLs follow the pattern: "https://sw-api.starnavi.io/{resource}/{id}/"
 * @param url - API resource URL (e.g., "https://sw-api.starnavi.io/people/1/")
 * @returns Extracted ID as number, or null if ID cannot be extracted
 */
export const extractIdFromUrl = (url: string): number | null => {
  const match = url.match(/\/(\d+)\/?$/);
  return match ? parseInt(match[1], 10) : null;
};

/**
 * Adds ID field to resource if it doesn't exist, extracting it from the URL.
 * This is necessary because the Star Wars API returns IDs in the URL rather than as a separate field.
 * @param resource - Resource object with url field (may optionally have id field)
 * @returns Resource with guaranteed id field
 * @throws Error if ID cannot be extracted from the URL
 */
export const addIdToResource = <T extends { url: string; id?: number }>(
  resource: T
): T & { id: number } => {
  // If ID already exists, return resource as-is
  if (resource.id) {
    return resource as T & { id: number };
  }

  // Extract ID from URL
  const id = extractIdFromUrl(resource.url);
  if (id === null) {
    throw new Error(`Unable to extract ID from URL: ${resource.url}`);
  }

  return { ...resource, id };
};

