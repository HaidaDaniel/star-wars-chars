import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchFilmsAndStarships } from "../api/api";
import type { IFetchFilmsAndStarships } from "../api/api";
import type { Hero } from "../types/Hero.types";
import { generateEdges, generateNodes } from "../helpers/FlowParamGeneration";
import { ReactFlow, Controls, Background } from "@xyflow/react";
import type { Edge, Node } from "@xyflow/react";
import {
  HERO_COLORS,
  FILM_COLORS,
  STARSHIP_COLORS,
  GRAPH_COLORS,
} from "../constants/colors";
import "@xyflow/react/dist/base.css";
import "@xyflow/react/dist/style.css";

interface HeroDetailsProps {
  heroDetails: Hero;
}

/**
 * Component for displaying hero details as a graph visualization using React Flow.
 * Shows a graph structure where:
 * - The hero is the central node
 * - Films where the hero appears are connected from the hero
 * - Starships that the hero traveled on are connected from the films where they appear
 * @param heroDetails - Hero data object containing name, films, and starships information
 */
export const HeroDetails: React.FC<HeroDetailsProps> = ({ heroDetails }) => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  const { name, films, starships } = heroDetails;

  // Fetch detailed information about films and starships
  const {
    data: filmsAndStarshipsData,
    isLoading,
    isError,
  } = useQuery<IFetchFilmsAndStarships>({
    queryKey: ["filmsAndStarships", films || [], starships || []],
    queryFn: () => fetchFilmsAndStarships(films || [], starships || []),
  });

  // Generate graph nodes and edges when data is loaded
  useEffect(() => {
    if (filmsAndStarshipsData) {
      const { films: filmDetails, starships: starshipDetails } =
        filmsAndStarshipsData;
      const generatedNodes = generateNodes(
        name,
        filmDetails,
        starshipDetails
      );
      const generatedEdges = generateEdges(filmDetails, starshipDetails);

      setNodes(generatedNodes);
      setEdges(generatedEdges);
    }
  }, [filmsAndStarshipsData, name]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <h4 className="text-lg text-foreground">Loading hero details...</h4>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-full">
        <h4 className="text-lg text-destructive">Error fetching hero details</h4>
      </div>
    );
  }

  const filmsCount = filmsAndStarshipsData?.films.length || 0;
  const starshipsCount = filmsAndStarshipsData?.starships.length || 0;

  return (
    <div className="flex flex-col h-full w-full bg-background relative">
      {/* Graph statistics header */}
      <div className="absolute top-4 left-4 z-10 bg-card/90 backdrop-blur-sm border border-border rounded-lg px-4 py-2 shadow-lg">
        <div className="text-sm text-muted-foreground space-y-2">
          <div className="font-semibold text-foreground">Graph Statistics</div>
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full border-2"
              style={{
                backgroundColor: HERO_COLORS.background,
                borderColor: HERO_COLORS.border,
              }}
            />
            <span>Hero</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full border-2"
              style={{
                backgroundColor: FILM_COLORS.background,
                borderColor: FILM_COLORS.border,
              }}
            />
            <span>Films: <span className="text-foreground font-medium">{filmsCount}</span></span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full border-2"
              style={{
                backgroundColor: STARSHIP_COLORS.background,
                borderColor: STARSHIP_COLORS.border,
              }}
            />
            <span>Starships: <span className="text-foreground font-medium">{starshipsCount}</span></span>
          </div>
        </div>
      </div>

      {/* React Flow graph */}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        fitViewOptions={{
          padding: 0.2,
          maxZoom: 1.5,
          minZoom: 0.5,
        }}
        className="w-full h-full"
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        panOnDrag={true}
        zoomOnScroll={true}
        zoomOnPinch={true}
        preventScrolling={false}
        defaultEdgeOptions={{
          style: { stroke: GRAPH_COLORS.edge, strokeWidth: 2 },
          animated: false,
        }}
      >
        <Background color={GRAPH_COLORS.background} gap={16} />
        <Controls
          showZoom={true}
          showFitView={true}
          showInteractive={false}
          style={{
            backgroundColor: GRAPH_COLORS.controlBackground,
            border: `1px solid ${GRAPH_COLORS.controlBorder}`,
          }}
          className="react-flow-controls-custom"
        />
      </ReactFlow>
    </div>
  );
};

