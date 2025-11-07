import React from "react";
import type { Edge, Node } from "@xyflow/react";
import type { Film } from "../types/Film.type";
import type { Starship } from "../types/Starship.type";
import {
  FLOW_NODE_CONFIG,
  HERO_NODE_STYLE,
  FILM_NODE_STYLE,
  STARSHIP_NODE_STYLE,
} from "../constants/flow";

import {
  HERO_COLORS,
} from "../constants/colors";

const createNodeLabel = (text: string): React.ReactElement => {
  return React.createElement(
    "div",
    {
      style: {
        color: HERO_COLORS.text,
        textAlign: "center",
        padding: "0 8px",
        width: "100%",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
      },
    },
    text
  );
};

const calculateNodeXPosition = (
  index: number,
  totalCount: number
): number => {
  const nodeSpacing = FLOW_NODE_CONFIG.width + FLOW_NODE_CONFIG.padding;
  const totalWidth = totalCount * nodeSpacing;
  const startX = -(totalWidth / 2) + FLOW_NODE_CONFIG.width / 2;
  return startX + index * nodeSpacing;
};

export const generateNodes = (
  heroName: string,
  films: Film[],
  starships: Starship[]
): Node[] => {
  if (!heroName) {
    return [];
  }

  const heroNode: Node = {
    id: "hero",
    data: { 
      label: createNodeLabel(heroName),
    },
    position: {
      x: 0,
      y: FLOW_NODE_CONFIG.heroYPosition,
    },
    style: HERO_NODE_STYLE,
  };

  const filmNodes: Node[] = films.map((film, index) => ({
    id: `film-${index}`,
    data: { 
      label: createNodeLabel(film.title),
    },
    position: {
      x: calculateNodeXPosition(index, films.length),
      y: FLOW_NODE_CONFIG.filmsYPosition,
    },
    style: FILM_NODE_STYLE,
  }));

  const starshipNodes: Node[] = starships.map((starship, index) => ({
    id: `ship-${index}`,
    data: { 
      label: createNodeLabel(starship.name),
    },
    position: {
      x: calculateNodeXPosition(index, starships.length),
      y: FLOW_NODE_CONFIG.starshipsYPosition,
    },
    style: STARSHIP_NODE_STYLE,
  }));

  return [heroNode, ...filmNodes, ...starshipNodes];
};

export const generateEdges = (
  films: Film[],
  starships: Starship[]
): Edge[] => {
  const edges: Edge[] = [];

  const heroToFilmEdges: Edge[] = films.map((_, index) => ({
    id: `e-hero-film-${index}`,
    source: "hero",
    target: `film-${index}`,
  }));

  edges.push(...heroToFilmEdges);

  starships.forEach((starship, starshipIndex) => {
    starship.films.forEach((filmId) => {
      const filmIndex = films.findIndex((film) => film.id === filmId);
      if (filmIndex !== -1) {
        edges.push({
          id: `e-film-ship-${starshipIndex}-${filmIndex}`,
          source: `film-${filmIndex}`,
          target: `ship-${starshipIndex}`,
        });
      }
    });
  });

  return edges;
};

