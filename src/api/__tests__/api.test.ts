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

  consoleErrorSpy.mockRestore();
});

it('should fetch films and starships using API filters (optimized approach)', async () => {
  // Using hero ID 1 (Luke Skywalker) who has film 1 and starship 12
  const heroId = 1;
  const res = await fetchFilmsAndStarships(heroId, [1], [12]);

  expect(res.films.length).toBeGreaterThanOrEqual(1);
  expect(res.starships.length).toBeGreaterThanOrEqual(1);
  
  // Verify that the results include the expected film and starship
  const film1 = res.films.find(f => f.id === 1);
  const starship12 = res.starships.find(s => s.id === 12);
  
  expect(film1).toBeDefined();
  expect(film1?.title).toBe('A New Hope');
  expect(film1?.id).toBeDefined();
  
  expect(starship12).toBeDefined();
  expect(starship12?.name).toBe('X-wing');
  expect(starship12?.id).toBeDefined();
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
