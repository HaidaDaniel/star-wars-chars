export type Hero = {
  id: number;
  name: string;
  birthYear: string;
  eyeColor: string;
  gender: string;
  hairColor: string;
  height: string;
  mass: string;
  skinColor: string;
  homeworld: number;
  films: number[];
  species: number[];
  starships: number[];
  vehicles: number[];
  url: string;
  created: string;
  edited: string;
};

export type HeroPageResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: Hero[];
};

