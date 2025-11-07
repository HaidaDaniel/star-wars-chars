import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { HeroCard } from "../HeroCard";
import { useStarWarsStore } from "../../store/starWarsStore";
import type { Hero } from "../../types/Hero.types";
import type { Film } from "../../types/Film.type";

const mockHero: Hero = {
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
  films: [1, 2],
  species: [1],
  starships: [12, 22],
  vehicles: [14, 30],
  url: "https://sw-api.starnavi.io/people/1/",
  created: "2014-12-09T13:50:51.644000Z",
  edited: "2014-12-20T21:17:56.891000Z",
};

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

describe("HeroCard", () => {
  beforeEach(() => {
    // Setup store with film data
    useStarWarsStore.getState().setData({
      films: {
        1: mockFilm,
        2: { ...mockFilm, id: 2, title: "The Empire Strikes Back" },
      },
    });
  });

  it("should render hero name", () => {
    render(<HeroCard {...mockHero} />);
    expect(screen.getByText("Luke Skywalker")).toBeInTheDocument();
  });

  it("should render hero details", () => {
    render(<HeroCard {...mockHero} />);

    expect(screen.getByText(/Birth Year:/)).toBeInTheDocument();
    expect(screen.getByText("19BBY")).toBeInTheDocument();
    expect(screen.getByText(/Eye Color:/)).toBeInTheDocument();
    expect(screen.getByText("blue")).toBeInTheDocument();
    expect(screen.getByText(/Gender:/)).toBeInTheDocument();
    expect(screen.getByText("male")).toBeInTheDocument();
  });

  it("should display film titles when available in store", () => {
    render(<HeroCard {...mockHero} />);

    const filmsText = screen.getByText(/Films:/).parentElement?.textContent;
    expect(filmsText).toContain("A New Hope");
  });

  it("should display N/A for films when not available in store", () => {
    useStarWarsStore.getState().setData({ films: {} });

    render(<HeroCard {...mockHero} />);

    const filmsText = screen.getByText(/Films:/).parentElement?.textContent;
    expect(filmsText).toContain("N/A");
  });

  it("should display N/A for empty species array", () => {
    const heroWithoutSpecies = { ...mockHero, species: [] };
    render(<HeroCard {...heroWithoutSpecies} />);

    const speciesText = screen.getByText(/Species:/).parentElement?.textContent;
    expect(speciesText).toContain("N/A");
  });

  it("should display species when available", () => {
    const heroWithSpecies = { ...mockHero, species: [1, 2] };
    render(<HeroCard {...heroWithSpecies} />);

    const speciesText = screen.getByText(/Species:/).parentElement?.textContent;
    expect(speciesText).toContain("1, 2");
  });

  it("should display formatted dates", () => {
    render(<HeroCard {...mockHero} />);

    expect(screen.getByText(/Created:/)).toBeInTheDocument();
    expect(screen.getByText(/Edited:/)).toBeInTheDocument();
  });

  it("should display all hero properties", () => {
    render(<HeroCard {...mockHero} />);

    expect(screen.getByText(/Hair Color:/)).toBeInTheDocument();
    expect(screen.getByText(/Height:/)).toBeInTheDocument();
    expect(screen.getByText(/Mass:/)).toBeInTheDocument();
    expect(screen.getByText(/Skin Color:/)).toBeInTheDocument();
    expect(screen.getByText(/Homeworld:/)).toBeInTheDocument();
    expect(screen.getByText(/Starships:/)).toBeInTheDocument();
    expect(screen.getByText(/Vehicles:/)).toBeInTheDocument();
  });

  it("should handle empty arrays for starships and vehicles", () => {
    const heroWithoutTransport = {
      ...mockHero,
      starships: [],
      vehicles: [],
    };

    render(<HeroCard {...heroWithoutTransport} />);

    const starshipsText = screen.getByText(/Starships:/).parentElement?.textContent;
    const vehiclesText = screen.getByText(/Vehicles:/).parentElement?.textContent;

    expect(starshipsText).toContain("N/A");
    expect(vehiclesText).toContain("N/A");
  });
});


