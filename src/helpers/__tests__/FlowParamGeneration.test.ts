import { describe, it, expect } from "vitest";
import { generateNodes, generateEdges } from "../FlowParamGeneration";
import type { Film } from "../../types/Film.type";
import type { Starship } from "../../types/Starship.type";

describe("FlowParamGeneration", () => {
  const mockFilms: Film[] = [
    {
      id: 1,
      title: "A New Hope",
      episodeId: 4,
      openingCrawl: "It is a period of civil war...",
      director: "George Lucas",
      producer: "Gary Kurtz",
      releaseDate: "1977-05-25",
      species: [],
      starships: [],
      vehicles: [],
      characters: [],
      planets: [],
      url: "https://swapi.dev/api/films/1/",
      created: "2014-12-10T14:23:31.880000Z",
      edited: "2014-12-20T19:49:45.256000Z",
    },
    {
      id: 2,
      title: "The Empire Strikes Back",
      episodeId: 5,
      openingCrawl: "It is a dark time...",
      director: "Irvin Kershner",
      producer: "Gary Kurtz",
      releaseDate: "1980-05-17",
      species: [],
      starships: [],
      vehicles: [],
      characters: [],
      planets: [],
      url: "https://swapi.dev/api/films/2/",
      created: "2014-12-12T11:26:24.656000Z",
      edited: "2014-12-15T13:07:53.386000Z",
    },
  ];

  const mockStarships: Starship[] = [
    {
      id: 1,
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
      pilots: [],
      films: [1, 2],
      url: "https://swapi.dev/api/starships/12/",
      created: "2014-12-12T11:19:05.340000Z",
      edited: "2014-12-20T21:23:49.886000Z",
    },
    {
      id: 2,
      name: "Millennium Falcon",
      model: "YT-1300 light freighter",
      manufacturer: "Corellian Engineering Corporation",
      costInCredits: "100000",
      length: "34.37",
      maxAtmospheringSpeed: "1050",
      crew: "4",
      passengers: "6",
      cargoCapacity: "100000",
      consumables: "2 months",
      hyperdriveRating: "0.5",
      MGLT: "75",
      starshipClass: "Light freighter",
      pilots: [],
      films: [1],
      url: "https://swapi.dev/api/starships/10/",
      created: "2014-12-10T16:59:45.094000Z",
      edited: "2014-12-20T21:23:49.880000Z",
    },
  ];

  describe("generateNodes", () => {
    it("should generate nodes for hero, films, and starships", () => {
      const heroName = "Luke Skywalker";
      const nodes = generateNodes(heroName, mockFilms, mockStarships);

      expect(nodes).toHaveLength(5);

      const heroNode = nodes.find(node => node.id === "hero");
      expect(heroNode).toBeDefined();
      expect((heroNode?.data as { label: { props: { children: string } } }).label.props.children).toBe(heroName);

      const filmNodes = nodes.filter(node => node.id.startsWith("film-"));
      expect(filmNodes).toHaveLength(2);
    expect((filmNodes[0].data as { label: { props: { children: string } } }).label.props.children).toBe("A New Hope");
    expect((filmNodes[1].data as { label: { props: { children: string } } }).label.props.children).toBe("The Empire Strikes Back");

      const starshipNodes = nodes.filter(node => node.id.startsWith("ship-"));
      expect(starshipNodes).toHaveLength(2);
    expect((starshipNodes[0].data as { label: { props: { children: string } } }).label.props.children).toBe("X-wing");
    expect((starshipNodes[1].data as { label: { props: { children: string } } }).label.props.children).toBe("Millennium Falcon");
    });

    it("should return empty array when hero name is empty", () => {
      const nodes = generateNodes("", mockFilms, mockStarships);
      expect(nodes).toEqual([]);
    });

    it("should handle empty films and starships arrays", () => {
      const heroName = "Luke Skywalker";
      const nodes = generateNodes(heroName, [], []);

      expect(nodes).toHaveLength(1);
      expect(nodes[0].id).toBe("hero");
      expect((nodes[0].data as { label: { props: { children: string } } }).label.props.children).toBe(heroName);
    });

    it("should position nodes correctly", () => {
      const heroName = "Luke Skywalker";
      const nodes = generateNodes(heroName, mockFilms, mockStarships);

      const heroNode = nodes.find(node => node.id === "hero");
      expect(heroNode?.position.x).toBe(0);

      const filmNodes = nodes.filter(node => node.id.startsWith("film-"));
      expect(filmNodes[0].position.y).toBe(filmNodes[1].position.y);
      expect(filmNodes[0].position.x).not.toBe(filmNodes[1].position.x);
    });
  });

  describe("generateEdges", () => {
    it("should generate edges from hero to films", () => {
      const edges = generateEdges(mockFilms, mockStarships);

      const heroToFilmEdges = edges.filter(edge => edge.source === "hero");
      expect(heroToFilmEdges).toHaveLength(2);
      expect(heroToFilmEdges[0].target).toBe("film-0");
      expect(heroToFilmEdges[1].target).toBe("film-1");
    });

    it("should generate edges from films to starships based on film associations", () => {
      const edges = generateEdges(mockFilms, mockStarships);

      const filmToStarshipEdges = edges.filter(edge => 
        edge.source.startsWith("film-") && edge.target.startsWith("ship-")
      );

      const xWingEdges = filmToStarshipEdges.filter(edge => edge.target === "ship-0");
      expect(xWingEdges.length).toBeGreaterThan(0);

      const falconEdges = filmToStarshipEdges.filter(edge => edge.target === "ship-1");
      expect(falconEdges.length).toBeGreaterThan(0);
    });

    it("should handle empty arrays", () => {
      const edges = generateEdges([], []);
      expect(edges).toEqual([]);
    });

    it("should handle films without starships", () => {
      const edges = generateEdges(mockFilms, []);
      
      const heroToFilmEdges = edges.filter(edge => edge.source === "hero");
      expect(heroToFilmEdges).toHaveLength(2);

      const filmToStarshipEdges = edges.filter(edge => 
        edge.source.startsWith("film-") && edge.target.startsWith("ship-")
      );
      expect(filmToStarshipEdges).toHaveLength(0);
    });

    it("should generate unique edge IDs", () => {
      const edges = generateEdges(mockFilms, mockStarships);
      
      const edgeIds = edges.map(edge => edge.id);
      const uniqueEdgeIds = [...new Set(edgeIds)];
      
      expect(edgeIds.length).toBe(uniqueEdgeIds.length);
    });
  });
});
