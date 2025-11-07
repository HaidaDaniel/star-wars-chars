import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";
import { API_BASE_URL } from "../../constants/api";

// Mock data
export const mockHero: any = {
  id: 1,
  name: "Luke Skywalker",
  birth_year: "19BBY",
  eye_color: "blue",
  gender: "male",
  hair_color: "blond",
  height: "172",
  mass: "77",
  skin_color: "fair",
  homeworld: 1,
  films: [1, 2, 3],
  species: [1],
  starships: [12, 22],
  vehicles: [14, 30],
  url: `${API_BASE_URL}/people/1/`,
  created: "2014-12-09T13:50:51.644000Z",
  edited: "2014-12-20T21:17:56.891000Z",
};

export const mockHeroPageResponse: any = {
  count: 82,
  next: `${API_BASE_URL}/people/?page=2`,
  previous: null,
  results: [mockHero],
};

export const mockFilm: any = {
  id: 1,
  title: "A New Hope",
  episode_id: 4,
  opening_crawl: "It is a period of civil war...",
  director: "George Lucas",
  producer: "Gary Kurtz, Rick McCallum",
  release_date: "1977-05-25",
  species: [1, 2],
  starships: [2, 3],
  vehicles: [4, 5],
  characters: [1, 2],
  planets: [1, 2],
  url: `${API_BASE_URL}/films/1/`,
  created: "2014-12-10T14:23:31.880000Z",
  edited: "2014-12-20T19:49:45.256000Z",
};

export const mockStarship: any = {
  id: 12,
  name: "X-wing",
  model: "T-65 X-wing",
  manufacturer: "Incom Corporation",
  cost_in_credits: "149999",
  length: "12.5",
  max_atmosphering_speed: "1050",
  crew: "1",
  passengers: "0",
  cargo_capacity: "110",
  consumables: "1 week",
  hyperdrive_rating: "1.0",
  MGLT: "100",
  starship_class: "Starfighter",
  pilots: [1],
  films: [1, 2, 3],
  url: `${API_BASE_URL}/starships/12/`,
  created: "2014-12-12T11:19:05.340000Z",
  edited: "2014-12-20T21:23:49.886000Z",
};

// Request handlers
export const handlers = [
  // Get heroes page
  http.get(`${API_BASE_URL}/people/`, ({ request }) => {
    const url = new URL(request.url);
    const page = url.searchParams.get("page");
    
    if (page === "1") {
      return HttpResponse.json(mockHeroPageResponse);
    }
    
    return HttpResponse.json({
      ...mockHeroPageResponse,
      next: page === "2" ? `${API_BASE_URL}/people/?page=3` : null,
      previous: page !== "1" ? `${API_BASE_URL}/people/?page=${Number(page) - 1}` : null,
    });
  }),

  // Get hero by ID
  http.get(`${API_BASE_URL}/people/:id/`, ({ params }) => {
    const id = Number(params.id);
    return HttpResponse.json({
      ...mockHero,
      id: id,
      url: `${API_BASE_URL}/people/${id}/`,
    });
  }),

  // Get film by ID
  http.get(`${API_BASE_URL}/films/:id/`, ({ params }) => {
    const id = Number(params.id);
    const filmWithoutId = { ...mockFilm };
    delete filmWithoutId.id;
    return HttpResponse.json({
      ...filmWithoutId,
      url: `${API_BASE_URL}/films/${id}/`,
    });
  }),

  // Get all films
  http.get(`${API_BASE_URL}/films/`, () => {
    const filmWithoutId = { ...mockFilm };
    delete filmWithoutId.id;
    return HttpResponse.json({
      count: 1,
      next: null,
      previous: null,
      results: [filmWithoutId],
    });
  }),

  // Get starship by ID
  http.get(`${API_BASE_URL}/starships/:id/`, ({ params }) => {
    const id = Number(params.id);
    const starshipWithoutId = { ...mockStarship };
    delete starshipWithoutId.id;
    return HttpResponse.json({
      ...starshipWithoutId,
      url: `${API_BASE_URL}/starships/${id}/`,
    });
  }),
];

// Setup server
export const server = setupServer(...handlers);

