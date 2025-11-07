export type Hero = {
  id: number;
  name: string;
  birth_year: string;
  eye_color: string;
  gender: string;
  hair_color: string;
  height: string;
  mass: string;
  skin_color: string;
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

