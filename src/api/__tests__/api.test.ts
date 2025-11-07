import { it, expect, vi, beforeEach } from 'vitest';
import { API_BASE_URL } from '../../constants/api';
import {
  fetchHeroesPage,
  fetchHeroDetails,
  fetchFilmDetails,
  fetchStarshipDetails,
  fetchWithLimit,
  fetchFilmsAndStarships,
  fetchStarWarsData,
} from '../api';

beforeEach(() => {
  vi.clearAllMocks();
});

it('should fetch heroes page with correct endpoint and add IDs to results', async () => {
  const page = 1;
  const res = await fetchHeroesPage(page);

  expect(res.count).toBe(82);
  expect(res.results).toHaveLength(1);
  expect(res.results[0].name).toBe('Luke Skywalker');
  expect(res.results[0].id).toBeDefined();
  expect(res.next).toBe(`${API_BASE_URL}/people/?page=2`);
});

it('should fetch hero details and add ID to resource', async () => {
  const res = await fetchHeroDetails(1);
  
  expect(res.name).toBe('Luke Skywalker');
  expect(res.id).toBeDefined();
  expect(res.birthYear).toBe('19BBY');
  expect(res.eyeColor).toBe('blue');
});

it('should fetch film details and add ID to resource', async () => {
  const res = await fetchFilmDetails(1);
  
  expect(res.title).toBe('A New Hope');
  expect(res.id).toBeDefined();
  expect(res.episodeId).toBe(4);
  expect(res.director).toBe('George Lucas');
});

it('should fetch starship details and add ID to resource', async () => {
  const res = await fetchStarshipDetails(12);
  
  expect(res.name).toBe('X-wing');
  expect(res.id).toBeDefined();
  expect(res.model).toBe('T-65 X-wing');
  expect(res.starshipClass).toBe('Starfighter');
});

it('should return empty array when fetchWithLimit receives empty list', async () => {
  const out = await fetchWithLimit([], async () => ({}));
  expect(out).toEqual([]);
});

it('should process items in batches and skip failed requests', async () => {
  // Suppress console.error for this test since we expect errors
  const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

  const ids = [1, 2, 3, 4, 5];
  const order: number[] = [];

  const fetchFn = vi.fn(async (id: number) => {
    order.push(id);
    if (id === 3) throw new Error('boom');
    return { id };
  });

  const res = await fetchWithLimit(ids, fetchFn, 2);

  expect(fetchFn).toHaveBeenCalledTimes(ids.length);
  expect(res).toEqual([{ id: 1 }, { id: 2 }, { id: 4 }, { id: 5 }]);

  expect(order).toEqual(ids);

  // Restore console.error
  consoleErrorSpy.mockRestore();
});

it('should fetch films and starships in parallel using fetchWithLimit', async () => {
  const res = await fetchFilmsAndStarships([1], [12]);

  expect(res.films).toHaveLength(1);
  expect(res.starships).toHaveLength(1);
  expect(res.films[0].title).toBe('A New Hope');
  expect(res.films[0].id).toBeDefined();
  expect(res.starships[0].name).toBe('X-wing');
  expect(res.starships[0].id).toBeDefined();
});

it('should fetch and organize films data by ID', async () => {
  const res = await fetchStarWarsData();
  
  expect(res.films).toBeDefined();
  expect(typeof res.films).toBe('object');
  const filmKeys = Object.keys(res.films);
  expect(filmKeys.length).toBeGreaterThan(0);
  
  const firstFilmId = Number(filmKeys[0]);
  const firstFilm = res.films[firstFilmId];
  expect(firstFilm.title).toBe('A New Hope');
  expect(firstFilm.id).toBeDefined();
});
