import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchFilmsAndStarships } from "../api/api";
import type { IFetchFilmsAndStarships } from "../api/api";
import type { Hero } from "../types/Hero.types";
import { generateEdges, generateNodes } from "../helpers/FlowParamGeneration";
import { ReactFlow, Controls, Background } from "@xyflow/react";
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

export const HeroDetails: React.FC<HeroDetailsProps> = ({ heroDetails }) => {
  const { name, films, starships } = heroDetails;

  const {
    data: filmsAndStarshipsData,
    isLoading,
    isError,
    error,
  } = useQuery<IFetchFilmsAndStarships>({
    queryKey: ["filmsAndStarships", films || [], starships || []],
    queryFn: () => fetchFilmsAndStarships(films || [], starships || []),
    retry: (failureCount, error) => {
      if (error?.message?.includes('Failed to fetch any hero details data')) {
        return failureCount < 2;
      }
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1500 * 2 ** attemptIndex, 15000),
  });

  const { nodes, edges } = useMemo(() => {
    if (!filmsAndStarshipsData) {
      return { nodes: [], edges: [] };
    }
    
    const { films: filmDetails, starships: starshipDetails } =
      filmsAndStarshipsData;
    const generatedNodes = generateNodes(
      name,
      filmDetails,
      starshipDetails
    );
    const generatedEdges = generateEdges(filmDetails, starshipDetails);

    return { nodes: generatedNodes, edges: generatedEdges };
  }, [filmsAndStarshipsData, name]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-2">
          <h4 className="text-lg text-foreground">Loading {name} details...</h4>
          <p className="text-sm text-muted-foreground">Fetching films and starships data</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-4 max-w-md mx-auto p-4">
          <h4 className="text-lg text-destructive">Failed to load {name} details</h4>
          <p className="text-sm text-muted-foreground">
            {error?.message || "Unable to fetch films and starships information. This may be due to network issues or API rate limiting."}
          </p>
          <div className="text-xs text-muted-foreground">
            Requested: {(films?.length || 0)} films, {(starships?.length || 0)} starships
          </div>
        </div>
      </div>
    );
  }

  const filmsCount = filmsAndStarshipsData?.films.length || 0;
  const starshipsCount = filmsAndStarshipsData?.starships.length || 0;
  const warnings = filmsAndStarshipsData?.warnings;

  return (
    <div className="flex flex-col h-full w-full bg-background relative">
      {warnings && (warnings.failedFilms || warnings.failedStarships) && (
        <div className="absolute top-4 right-4 z-10 bg-yellow-50/90 border border-yellow-200 rounded-lg px-3 py-2 shadow-lg max-w-xs">
          <div className="text-xs text-yellow-800">
            <div className="font-semibold mb-1">⚠️ Partial data loaded</div>
            {warnings.failedFilms && (
              <div>Failed to load {warnings.failedFilms} film{warnings.failedFilms > 1 ? 's' : ''}</div>
            )}
            {warnings.failedStarships && (
              <div>Failed to load {warnings.failedStarships} starship{warnings.failedStarships > 1 ? 's' : ''}</div>
            )}
          </div>
        </div>
      )}

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

