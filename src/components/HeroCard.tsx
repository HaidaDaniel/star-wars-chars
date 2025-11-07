import React from "react";
import { format } from "date-fns";
import type { Hero } from "../types/Hero.types";
import { useStarWarsStore } from "../store/starWarsStore";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "./ui/card";

/**
 * Component for displaying hero card with basic information
 * @param props - Hero data object
 */
export const HeroCard: React.FC<Hero> = (props) => {
  const {
    name,
    birthYear,
    eyeColor,
    gender,
    hairColor,
    height,
    mass,
    skinColor,
    homeworld,
    films,
    species,
    starships,
    vehicles,
    created,
    edited,
  } = props;

  const filmsData = useStarWarsStore((state) => state.data.films);

  const filmsDisplayText = films && films.length > 0
    ? (() => {
        const filmTitles = films.map((film) => filmsData[film]?.title).filter(Boolean);
        return filmTitles.length > 0 ? filmTitles.join(", ") : "N/A";
      })()
    : "N/A";

  return (
    <Card className="flex flex-col w-full h-[420px] transition-transform hover:scale-[1.02] cursor-pointer bg-card text-card-foreground border-border hover:border-primary/50 p-4">
      <div className="flex flex-col flex-1 p-4 sm:p-6 overflow-hidden">
        <CardHeader className="shrink-0">
          <CardTitle className="text-2xl mb-2 text-foreground">{name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-sm text-muted-foreground overflow-y-auto flex-1 py-4">
          <div>
            <strong className="text-foreground">Birth Year:</strong> {birthYear}
          </div>
          <div>
            <strong className="text-foreground">Eye Color:</strong> {eyeColor}
          </div>
          <div>
            <strong className="text-foreground">Gender:</strong> {gender}
          </div>
          <div>
            <strong className="text-foreground">Hair Color:</strong> {hairColor}
          </div>
          <div>
            <strong className="text-foreground">Height:</strong> {height}
          </div>
          <div>
            <strong className="text-foreground">Mass:</strong> {mass}
          </div>
          <div>
            <strong className="text-foreground">Skin Color:</strong> {skinColor}
          </div>
          <div>
            <strong className="text-foreground">Homeworld:</strong> {homeworld}
          </div>
          <div className="relative">
            <strong className="text-foreground">Films:</strong>{" "}
            <span
              className="line-clamp-2"
              title={filmsDisplayText}
            >
              {filmsDisplayText}
            </span>
          </div>
          <div>
            <strong className="text-foreground">Species:</strong>{" "}
            {species && species.length > 0 ? species.join(", ") : "N/A"}
          </div>
          <div>
            <strong className="text-foreground">Starships:</strong>{" "}
            {starships && starships.length > 0 ? starships.join(", ") : "N/A"}
          </div>
          <div>
            <strong className="text-foreground">Vehicles:</strong>{" "}
            {vehicles && vehicles.length > 0 ? vehicles.join(", ") : "N/A"}
          </div>
          <div>
            <strong className="text-foreground">Created:</strong> {format(new Date(created), "dd/MM/yyyy")}
          </div>
          <div>
            <strong className="text-foreground">Edited:</strong> {format(new Date(edited), "dd/MM/yyyy")}
          </div>
        </CardContent>
      </div>
    </Card>
  );
};

export default HeroCard;

