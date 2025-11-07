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

export const fetchFilmsAndStarships = async (
  filmIds: number[],
  starshipIds: number[]
): Promise<IFetchFilmsAndStarships> => {
  const films = await fetchWithLimit(filmIds, fetchFilmDetails);
  await new Promise(resolve => setTimeout(resolve, 100));
  const starships = await fetchWithLimit(starshipIds, fetchStarshipDetails);

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

