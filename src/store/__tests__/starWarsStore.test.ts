import { describe, it, expect, beforeEach } from "vitest";
import { useStarWarsStore } from "../starWarsStore";
import type { StarWarsData } from "../../types/Data";
import type { Film } from "../../types/Film.type";

describe("starWarsStore", () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    const store = useStarWarsStore.getState();
    store.setData({ films: {} });
    store.closeModal();
  });

  it("should have initial state", () => {
    const store = useStarWarsStore.getState();

    expect(store.data.films).toEqual({});
    expect(store.selectedHeroId).toBeNull();
    expect(store.isModalOpen).toBe(false);
  });

  it("should set data", () => {
    const mockFilm: Film = {
      id: 1,
      title: "A New Hope",
      episode_id: 4,
      opening_crawl: "Test",
      director: "George Lucas",
      producer: "Gary Kurtz",
      release_date: "1977-05-25",
      species: [],
      starships: [],
      vehicles: [],
      characters: [],
      planets: [],
      url: "https://sw-api.starnavi.io/films/1/",
      created: "2014-12-10T14:23:31.880000Z",
      edited: "2014-12-20T19:49:45.256000Z",
    };

    const mockData: StarWarsData = {
      films: {
        1: mockFilm,
      },
    };

    useStarWarsStore.getState().setData(mockData);

    const store = useStarWarsStore.getState();
    expect(store.data.films[1]).toEqual(mockFilm);
  });

  it("should open modal with hero ID", () => {
    useStarWarsStore.getState().openModal(5);

    const store = useStarWarsStore.getState();
    expect(store.isModalOpen).toBe(true);
    expect(store.selectedHeroId).toBe(5);
  });

  it("should close modal and reset selected hero ID", () => {
    useStarWarsStore.getState().openModal(10);
    
    let store = useStarWarsStore.getState();
    expect(store.isModalOpen).toBe(true);
    expect(store.selectedHeroId).toBe(10);

    useStarWarsStore.getState().closeModal();

    store = useStarWarsStore.getState();
    expect(store.isModalOpen).toBe(false);
    expect(store.selectedHeroId).toBeNull();
  });

  it("should update selected hero ID when opening modal with different ID", () => {
    useStarWarsStore.getState().openModal(1);
    
    let store = useStarWarsStore.getState();
    expect(store.selectedHeroId).toBe(1);

    useStarWarsStore.getState().openModal(2);

    store = useStarWarsStore.getState();
    expect(store.selectedHeroId).toBe(2);
    expect(store.isModalOpen).toBe(true);
  });

  it("should replace existing data when setData is called", () => {
    const mockFilm1: Film = {
      id: 1,
      title: "Film 1",
      episode_id: 1,
      opening_crawl: "Test",
      director: "Director",
      producer: "Producer",
      release_date: "1977-05-25",
      species: [],
      starships: [],
      vehicles: [],
      characters: [],
      planets: [],
      url: "https://sw-api.starnavi.io/films/1/",
      created: "2014-12-10T14:23:31.880000Z",
      edited: "2014-12-20T19:49:45.256000Z",
    };

    const mockFilm2: Film = {
      id: 2,
      title: "Film 2",
      episode_id: 2,
      opening_crawl: "Test",
      director: "Director",
      producer: "Producer",
      release_date: "1980-05-21",
      species: [],
      starships: [],
      vehicles: [],
      characters: [],
      planets: [],
      url: "https://sw-api.starnavi.io/films/2/",
      created: "2014-12-10T14:23:31.880000Z",
      edited: "2014-12-20T19:49:45.256000Z",
    };

    useStarWarsStore.getState().setData({ films: { 1: mockFilm1 } });
    
    let store = useStarWarsStore.getState();
    expect(Object.keys(store.data.films)).toHaveLength(1);

    useStarWarsStore.getState().setData({ films: { 2: mockFilm2 } });

    store = useStarWarsStore.getState();
    expect(Object.keys(store.data.films)).toHaveLength(1);
    expect(store.data.films[2]).toEqual(mockFilm2);
    expect(store.data.films[1]).toBeUndefined();
  });
});


