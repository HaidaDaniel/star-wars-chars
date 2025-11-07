import axios from "axios";
import type { AxiosResponse } from "axios";
import type { Film } from "../types/Film.type";
import type { Starship } from "../types/Starship.type";
import type { StarWarsData } from "../types/Data";
import type { Hero, HeroPageResponse } from "../types/Hero.types";
import { API_BASE_URL, API_BATCH_SIZE } from "../constants/api";
import { addIdToResource } from "../utils/apiHelpers";

type FetchFunction<T> = (id: number) => Promise<T>;

/**
 * Performs a base HTTP GET request to the Star Wars API.
 * @param slug - API endpoint path (e.g., "people/1/" or "films/")
 * @returns Promise resolving to the response data of type T
 */
const baseRequest = async <T>(slug: string): Promise<T> => {
  const response: AxiosResponse<T> = await axios.get(`${API_BASE_URL}/${slug}`);
  return response.data;
};

/**
 * Fetches a paginated list of heroes from the Star Wars API.
 * Automatically extracts and adds ID to each hero resource.
 * @param page - Page number to fetch (starts from 1)
 * @returns Promise resolving to a page of heroes with extracted IDs
 */
export const fetchHeroesPage = async (page: number): Promise<HeroPageResponse> => {
  const response = await baseRequest<HeroPageResponse>(`people/?page=${page}`);
  
  return {
    ...response,
    results: response.results.map((hero) => addIdToResource(hero)),
  };
};

/**
 * Fetches detailed information about a specific hero by ID.
 * Automatically extracts and adds ID to the hero resource.
 * @param heroId - Unique identifier of the hero
 * @returns Promise resolving to hero details with extracted ID
 */
export const fetchHeroDetails = async (heroId: number): Promise<Hero> => {
  const hero = await baseRequest<Hero>(`people/${heroId}/`);
  return addIdToResource(hero);
};

/**
 * Fetches detailed information about a specific film by ID.
 * Automatically extracts and adds ID to the film resource.
 * @param filmId - Unique identifier of the film
 * @returns Promise resolving to film details with extracted ID
 */
export const fetchFilmDetails = async (filmId: number): Promise<Film> => {
  const film = await baseRequest<Film>(`films/${filmId}/`);
  return addIdToResource(film);
};

/**
 * Fetches detailed information about a specific starship by ID.
 * Automatically extracts and adds ID to the starship resource.
 * @param starshipId - Unique identifier of the starship
 * @returns Promise resolving to starship details with extracted ID
 */
export const fetchStarshipDetails = async (
  starshipId: number
): Promise<Starship> => {
  const starship = await baseRequest<Starship>(`starships/${starshipId}/`);
  return addIdToResource(starship);
};

/**
 * Fetches multiple items in batches with concurrency control to avoid overwhelming the API.
 * Processes items in batches and handles individual fetch failures gracefully.
 * @param ids - Array of item IDs to fetch
 * @param fetchFn - Function to fetch a single item by ID
 * @param batchSize - Maximum number of concurrent requests per batch (default: API_BATCH_SIZE)
 * @returns Promise resolving to array of successfully fetched items (failed items are excluded)
 */
export const fetchWithLimit = async <T>(
  ids: number[],
  fetchFn: FetchFunction<T>,
  batchSize: number = API_BATCH_SIZE
): Promise<T[]> => {
  if (ids.length === 0) {
    return [];
  }

  const results: T[] = [];

  // Process IDs in batches to control concurrency
  for (let i = 0; i < ids.length; i += batchSize) {
    const batch = ids.slice(i, i + batchSize);
    const batchPromises = batch.map(async (id) => {
      try {
        return await fetchFn(id);
      } catch (error) {
        console.error(`Failed to fetch data for ID: ${id}`, error);
        return null;
      }
    });

    const batchResults = (await Promise.all(batchPromises)) as (T | null)[];
    // Filter out failed requests (null values)
    const validResults = batchResults.filter(
      (result): result is T => result !== null
    );
    results.push(...validResults);
  }

  return results;
};

export interface IFetchFilmsAndStarships {
  films: Film[];
  starships: Starship[];
}

/**
 * Fetches films and starships data in parallel for a hero.
 * Used to populate the hero details graph with film and starship information.
 * @param filmIds - Array of film IDs where the hero appears
 * @param starshipIds - Array of starship IDs that the hero traveled on
 * @returns Promise resolving to an object containing arrays of films and starships
 */
export const fetchFilmsAndStarships = async (
  filmIds: number[],
  starshipIds: number[]
): Promise<IFetchFilmsAndStarships> => {
  const [films, starships] = await Promise.all([
    fetchWithLimit(filmIds, fetchFilmDetails),
    fetchWithLimit(starshipIds, fetchStarshipDetails),
  ]);

  return { films, starships };
};

/**
 * Fetches all Star Wars films and organizes them by ID for quick lookup.
 * Used to populate the global store with film data for display in hero cards.
 * @returns Promise resolving to StarWarsData with films indexed by ID
 */
export const fetchStarWarsData = async (): Promise<StarWarsData> => {
  const films = await baseRequest<{ results: Film[] }>(`films/`);

  return {
    films: films.results.map(addIdToResource).reduce<Record<number, Film>>((acc, film) => {
      acc[film.id] = film;
      return acc;
    }, {}),
  };
};

