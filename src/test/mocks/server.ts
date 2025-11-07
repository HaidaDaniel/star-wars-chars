import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";
import { API_BASE_URL } from "../../constants/api";
import type { Film } from "~/types/Film.type";
import type { Hero, HeroPageResponse } from "~/types/Hero.types";
import type { Starship } from "~/types/Starship.type";

export const mockHero: Hero = {
  id: 1,
  name: "Luke Skywalker",
  birthYear: "19BBY",
  eyeColor: "blue",
  gender: "male",
  hairColor: "blond",
  height: "172",
  mass: "77",
  skinColor: "fair",
  homeworld: 1,
  films: [1, 2, 3],
  species: [1],
  starships: [12, 22],
  vehicles: [14, 30],
  url: `${API_BASE_URL}/people/1/`,
  created: "2014-12-09T13:50:51.644000Z",
  edited: "2014-12-20T21:17:56.891000Z",
};

export const mockHeroPageResponse: HeroPageResponse = {
  count: 82,
  next: `${API_BASE_URL}/people/?page=2`,
  previous: null,
  results: [mockHero],
};

export const mockFilm: Film = {
  id: 1,
  title: "A New Hope",
  episodeId: 4,
  openingCrawl: "It is a period of civil war...",
  director: "George Lucas",
  producer: "Gary Kurtz, Rick McCallum",
  releaseDate: "1977-05-25",
  species: [1, 2],
  starships: [2, 3],
  vehicles: [4, 5],
  characters: [1, 2],
  planets: [1, 2],
  url: `${API_BASE_URL}/films/1/`,
  created: "2014-12-10T14:23:31.880000Z",
  edited: "2014-12-20T19:49:45.256000Z",
};

export const mockStarship: Starship = {
  id: 12,
  name: "X-wing",
  model: "T-65 X-wing",
  manufacturer: "Incom Corporation",
  costInCredits: "149999",
  length: "12.5",
  maxAtmospheringSpeed: "1050",
  crew: "1",
  passengers: "0",
  cargoCapacity: "110",
  consumables: "1 week",
  hyperdriveRating: "1.0",
  MGLT: "100",
  starshipClass: "Starfighter",
  pilots: [1],
  films: [1, 2, 3],
  url: `${API_BASE_URL}/starships/12/`,
  created: "2014-12-12T11:19:05.340000Z",
  edited: "2014-12-20T21:23:49.886000Z",
};

export const handlers = [
  http.get(`${API_BASE_URL}/people/`, ({ request }) => {
    const url = new URL(request.url);
    const page = url.searchParams.get("page") || "1";

    if (page === "1") {
      return HttpResponse.json(mockHeroPageResponse);
    }
 
    return HttpResponse.json({
      ...mockHeroPageResponse,
      next: page === "2" ? `${API_BASE_URL}/people/?page=3` : null,
      previous: page !== "1" ? `${API_BASE_URL}/people/?page=${Number(page) - 1}` : null,
    });
  }),

  http.get(`${API_BASE_URL}/people/:id/`, ({ params }) => {
    const id = Number(params.id);
    
    if (id === 999) {
      return HttpResponse.json(
        { detail: "Not found" },
        { status: 404 }
      );
    }
    
    return HttpResponse.json({
      ...mockHero,
      id: id,
      url: `${API_BASE_URL}/people/${id}/`,
    });
  }),

  http.get(`${API_BASE_URL}/films/:id/`, ({ params }) => {
    const id = Number(params.id);
    
    if (id === 999) {
      return HttpResponse.json(
        { detail: "Not found" },
        { status: 404 }
      );
    }
    
    return HttpResponse.json({
      ...mockFilm,
      url: `${API_BASE_URL}/films/${id}/`,
    });
  }),

  http.get(`${API_BASE_URL}/films/`, () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: _, ...filmWithoutId } = mockFilm;
    return HttpResponse.json({
      count: 1,
      next: null,
      previous: null,
      results: [filmWithoutId],
    });
  }),

  http.get(`${API_BASE_URL}/starships/:id/`, ({ params }) => {
    const id = Number(params.id);
    
    if (id === 999) {
      return HttpResponse.json(
        { detail: "Not found" },
        { status: 404 }
      );
    }
    
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: _, ...starshipWithoutId } = mockStarship;
    return HttpResponse.json({
      ...starshipWithoutId,
      url: `${API_BASE_URL}/starships/${id}/`,
    });
  }),
];

export const server = setupServer(...handlers);

