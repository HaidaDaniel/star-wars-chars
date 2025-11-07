import { describe, it, expect } from "vitest";
import { generateNodes, generateEdges } from "../FlowParamGeneration";
import type { Film } from "../../types/Film.type";
import type { Starship } from "../../types/Starship.type";

describe("FlowParamGeneration", () => {
  const mockFilms: Film[] = [
    {
      id: 1,
      title: "A New Hope",
      episode_id: 4,
      opening_crawl: "It is a period of civil war...",
      director: "George Lucas",
      producer: "Gary Kurtz",
      release_date: "1977-05-25",
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
      episode_id: 5,
      opening_crawl: "It is a dark time...",
      director: "Irvin Kershner",
      producer: "Gary Kurtz",
      release_date: "1980-05-17",
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
      pilots: [],
      films: [1, 2],
      url: "https://swapi.dev/api/starships/12/",
      created: "2014-12-12T11:19:05.340000Z",
      edited: "2014-12-20T21:23:49.886000Z",
    },
    {
      name: "Millennium Falcon",
      model: "YT-1300 light freighter",
      manufacturer: "Corellian Engineering Corporation",
      cost_in_credits: "100000",
      length: "34.37",
      max_atmosphering_speed: "1050",
      crew: "4",
      passengers: "6",
      cargo_capacity: "100000",
      consumables: "2 months",
      hyperdrive_rating: "0.5",
      MGLT: "75",
      starship_class: "Light freighter",
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

      expect(nodes).toHaveLength(5); // 1 hero + 2 films + 2 starships

      // Check hero node
      const heroNode = nodes.find(node => node.id === "hero");
      expect(heroNode).toBeDefined();
      expect(heroNode?.data.label.props.children).toBe(heroName);

      // Check film nodes
      const filmNodes = nodes.filter(node => node.id.startsWith("film-"));
      expect(filmNodes).toHaveLength(2);
      expect(filmNodes[0].data.label.props.children).toBe("A New Hope");
      expect(filmNodes[1].data.label.props.children).toBe("The Empire Strikes Back");

      // Check starship nodes
      const starshipNodes = nodes.filter(node => node.id.startsWith("ship-"));
      expect(starshipNodes).toHaveLength(2);
      expect(starshipNodes[0].data.label.props.children).toBe("X-wing");
      expect(starshipNodes[1].data.label.props.children).toBe("Millennium Falcon");
    });

    it("should return empty array when hero name is empty", () => {
      const nodes = generateNodes("", mockFilms, mockStarships);
      expect(nodes).toEqual([]);
    });

    it("should handle empty films and starships arrays", () => {
      const heroName = "Luke Skywalker";
      const nodes = generateNodes(heroName, [], []);

      expect(nodes).toHaveLength(1); // Only hero node
      expect(nodes[0].id).toBe("hero");
      expect(nodes[0].data.label.props.children).toBe(heroName);
    });

    it("should position nodes correctly", () => {
      const heroName = "Luke Skywalker";
      const nodes = generateNodes(heroName, mockFilms, mockStarships);

      const heroNode = nodes.find(node => node.id === "hero");
      expect(heroNode?.position.x).toBe(0);

      const filmNodes = nodes.filter(node => node.id.startsWith("film-"));
      expect(filmNodes[0].position.y).toBe(filmNodes[1].position.y); // Same Y level
      expect(filmNodes[0].position.x).not.toBe(filmNodes[1].position.x); // Different X positions
    });
  });

  describe("generateEdges", () => {
    it("should generate edges from hero to films", () => {
      const edges = generateEdges(mockFilms, mockStarships);

      // Hero to film edges
      const heroToFilmEdges = edges.filter(edge => edge.source === "hero");
      expect(heroToFilmEdges).toHaveLength(2);
      expect(heroToFilmEdges[0].target).toBe("film-0");
      expect(heroToFilmEdges[1].target).toBe("film-1");
    });

    it("should generate edges from films to starships based on film associations", () => {
      const edges = generateEdges(mockFilms, mockStarships);

      // Film to starship edges
      const filmToStarshipEdges = edges.filter(edge => 
        edge.source.startsWith("film-") && edge.target.startsWith("ship-")
      );

      // X-wing appears in films 1 and 2
      const xWingEdges = filmToStarshipEdges.filter(edge => edge.target === "ship-0");
      expect(xWingEdges.length).toBeGreaterThan(0);

      // Millennium Falcon appears in film 1
      const falconEdges = filmToStarshipEdges.filter(edge => edge.target === "ship-1");
      expect(falconEdges.length).toBeGreaterThan(0);
    });

    it("should handle empty arrays", () => {
      const edges = generateEdges([], []);
      expect(edges).toEqual([]);
    });

    it("should handle films without starships", () => {
      const edges = generateEdges(mockFilms, []);
      
      // Should still have hero to film edges
      const heroToFilmEdges = edges.filter(edge => edge.source === "hero");
      expect(heroToFilmEdges).toHaveLength(2);

      // Should not have film to starship edges
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
