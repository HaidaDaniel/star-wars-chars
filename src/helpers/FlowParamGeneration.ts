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

/**
 * Creates a label component for graph nodes with white text for dark theme visibility
 * @param text - Text to display in the node
 * @returns React element for the node label
 */
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

/**
 * Calculates the horizontal position for nodes to prevent overlap
 * @param index - Index of the node
 * @param totalCount - Total number of nodes in the row
 * @returns X coordinate for the node
 */
const calculateNodeXPosition = (
  index: number,
  totalCount: number
): number => {
  const nodeSpacing = FLOW_NODE_CONFIG.width + FLOW_NODE_CONFIG.padding;
  const totalWidth = totalCount * nodeSpacing;
  const startX = -(totalWidth / 2) + FLOW_NODE_CONFIG.width / 2;
  return startX + index * nodeSpacing;
};

/**
 * Generates React Flow nodes for hero, films, and starships.
 * Creates a central hero node, film nodes positioned above starships,
 * and starship nodes positioned at the bottom.
 * @param heroName - Name of the hero to display in the center node
 * @param films - Array of films where the hero appears
 * @param starships - Array of starships that the hero traveled on
 * @returns Array of React Flow nodes with proper positioning
 */
export const generateNodes = (
  heroName: string,
  films: Film[],
  starships: Starship[]
): Node[] => {
  if (!heroName) {
    return [];
  }

  // Create the central hero node with blue styling
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

  // Create film nodes with green styling, horizontally distributed
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

  // Create starship nodes with purple styling, horizontally distributed
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

/**
 * Generates React Flow edges connecting hero to films and films to starships.
 * Creates edges from hero to all films where the hero appears,
 * and from each film to starships that appear in that film and are in the hero's starships list.
 * @param films - Array of films associated with the hero
 * @param starships - Array of starships that the hero traveled on
 * @returns Array of React Flow edges representing the connections
 */
export const generateEdges = (
  films: Film[],
  starships: Starship[]
): Edge[] => {
  const edges: Edge[] = [];

  // Create edges from hero node to all film nodes
  const heroToFilmEdges: Edge[] = films.map((_, index) => ({
    id: `e-hero-film-${index}`,
    source: "hero",
    target: `film-${index}`,
  }));

  edges.push(...heroToFilmEdges);

  // Create edges from film nodes to starship nodes
  // Only connect starships to films where they appear
  starships.forEach((starship, starshipIndex) => {
    starship.films.forEach((filmId) => {
      const filmIndex = films.findIndex((film) => film.id === filmId);
      // Only create edge if the film is in the hero's films list
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

