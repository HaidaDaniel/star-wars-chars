import type { AxiosResponse } from "axios";
import type { Film } from "../types/Film.type";
import type { Starship } from "../types/Starship.type";
import type { StarWarsData } from "../types/Data";
import type { Hero, HeroPageResponse } from "../types/Hero.types";
import { API_BATCH_SIZE } from "../constants/api";
import { addIdToResource } from "../utils/apiHelpers";
import { apiClient } from "./axiosConfig";

type FetchFunction<T> = (id: number) => Promise<T>;

const baseRequest = async <T>(endpoint: string, params?: Record<string, unknown>): Promise<T> => {
  const response: AxiosResponse<T> = await apiClient.get(endpoint, { params });
  return response.data;
};

export const fetchHeroesPage = async (page: number): Promise<HeroPageResponse> => {
  const response = await baseRequest<HeroPageResponse>('people/', { page });
  
  return {
    ...response,
    results: response.results.map((hero) => addIdToResource(hero)),
  };
};

export const fetchHeroDetails = async (heroId: number): Promise<Hero> => {
  const hero = await baseRequest<Hero>(`people/${heroId}/`);
  return addIdToResource(hero);
};

export const fetchFilmDetails = async (filmId: number): Promise<Film> => {
  const film = await baseRequest<Film>(`films/${filmId}/`);
  return addIdToResource(film);
};

export const fetchStarshipDetails = async (
  starshipId: number
): Promise<Starship> => {
  const starship = await baseRequest<Starship>(`starships/${starshipId}/`);
  return addIdToResource(starship);
};

export const fetchWithLimit = async <T>(
  ids: number[],
  fetchFn: FetchFunction<T>,
  batchSize: number = API_BATCH_SIZE
): Promise<T[]> => {
  if (ids.length === 0) {
    return [];
  }

  const results: T[] = [];

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
  warnings?: {
    failedFilms?: number;
    failedStarships?: number;
  };
}

type PaginatedResponse<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

/**
 * Fetches all films for a specific hero using API filtering.
 * Uses the filter endpoint to get all films in a single request instead of multiple individual requests.
 * @param heroId - The ID of the hero to fetch films for
 * @returns Array of Film objects
 */
const fetchFilmsByHeroId = async (heroId: number): Promise<Film[]> => {
  try {
    const response = await baseRequest<PaginatedResponse<Film>>('films/', { people: heroId });
    return response.results.map(addIdToResource);
  } catch (error) {
    console.error(`Failed to fetch films for hero ID: ${heroId}`, error);
    return [];
  }
};

/**
 * Fetches all starships for a specific hero using API filtering.
 * Uses the filter endpoint to get all starships in a single request instead of multiple individual requests.
 * @param heroId - The ID of the hero to fetch starships for
 * @returns Array of Starship objects
 */
const fetchStarshipsByHeroId = async (heroId: number): Promise<Starship[]> => {
  try {
    const response = await baseRequest<PaginatedResponse<Starship>>('starships/', { pilots: heroId });
    return response.results.map(addIdToResource);
  } catch (error) {
    console.error(`Failed to fetch starships for hero ID: ${heroId}`, error);
    return [];
  }
};

/**
 * Optimized function to fetch films and starships for a hero using API filters.
 * Instead of making N+M individual requests (one per film and starship),
 * this makes only 2 requests using filters: one for all films and one for all starships.
 * This significantly reduces the number of API calls and helps avoid rate limiting (429 errors).
 * @param heroId - The ID of the hero to fetch related data for
 * @param filmIds - Array of film IDs (kept for backward compatibility, but not used in optimized version)
 * @param starshipIds - Array of starship IDs (kept for backward compatibility, but not used in optimized version)
 * @returns Object containing films, starships, and optional warnings
 */
export const fetchFilmsAndStarships = async (
  heroId: number,
  filmIds: number[],
  starshipIds: number[]
): Promise<IFetchFilmsAndStarships> => {
  // Use optimized filter-based approach: fetch all films and starships in 2 requests instead of N+M
  const [films, starships] = await Promise.all([
    fetchFilmsByHeroId(heroId),
    fetchStarshipsByHeroId(heroId),
  ]);

  const failedFilms = filmIds.length - films.length;
  const failedStarships = starshipIds.length - starships.length;

  const hadFilmsToFetch = filmIds.length > 0;
  const hadStarshipsToFetch = starshipIds.length > 0;
  const gotNoFilms = films.length === 0;
  const gotNoStarships = starships.length === 0;
  
  if ((hadFilmsToFetch || hadStarshipsToFetch) && gotNoFilms && gotNoStarships) {
    throw new Error('Failed to fetch any hero details data');
  }

  const result: IFetchFilmsAndStarships = { films, starships };
  
  if (failedFilms > 0 || failedStarships > 0) {
    result.warnings = {};
    if (failedFilms > 0) result.warnings.failedFilms = failedFilms;
    if (failedStarships > 0) result.warnings.failedStarships = failedStarships;
  }

  return result;
};

export const fetchStarWarsData = async (): Promise<StarWarsData> => {
  const films = await baseRequest<{ results: Film[] }>('films/');

  return {
    films: films.results.map(addIdToResource).reduce<Record<number, Film>>((acc, film) => {
      acc[film.id] = film;
      return acc;
    }, {}),
  };
};

