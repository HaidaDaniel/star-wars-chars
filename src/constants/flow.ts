import {
  HERO_COLORS,
  FILM_COLORS,
  STARSHIP_COLORS,
} from "./colors";

/**
 * Configuration constants for React Flow graph nodes.
 * Defines dimensions and vertical positioning for hero, film, and starship nodes.
 */
export const FLOW_NODE_CONFIG = {
  /** Width of each node in pixels */
  width: 200,
  /** Height of each node in pixels */
  height: 40,
  /** Horizontal padding between nodes in pixels */
  padding: 0,
  /** Y position for the hero node (central node) */
  heroYPosition: 5,
  /** Y position for film nodes (middle row) */
  filmsYPosition: 100,
  /** Y position for starship nodes (bottom row) */
  starshipsYPosition: 200,
} as const;

/**
 * Base style configuration for React Flow graph nodes.
 * Applied to all nodes in the hero details graph visualization.
 */
export const FLOW_NODE_BASE_STYLE = {
  width: FLOW_NODE_CONFIG.width,
  height: `${FLOW_NODE_CONFIG.height}px`,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  borderRadius: "8px",
  borderWidth: "2px",
  fontWeight: "500",
  fontSize: "14px",
} as const;

/**
 * Style configuration for hero node (central node).
 * Blue theme with white text for dark mode visibility.
 */
export const HERO_NODE_STYLE = {
  ...FLOW_NODE_BASE_STYLE,
  backgroundColor: HERO_COLORS.background,
  borderColor: HERO_COLORS.border,
  color: HERO_COLORS.text,
} as const;

/**
 * Style configuration for film nodes.
 * Green theme with white text for dark mode visibility.
 */
export const FILM_NODE_STYLE = {
  ...FLOW_NODE_BASE_STYLE,
  backgroundColor: FILM_COLORS.background,
  borderColor: FILM_COLORS.border,
  color: FILM_COLORS.text,
} as const;

/**
 * Style configuration for starship nodes.
 * Purple theme with white text for dark mode visibility.
 */
export const STARSHIP_NODE_STYLE = {
  ...FLOW_NODE_BASE_STYLE,
  backgroundColor: STARSHIP_COLORS.background,
  borderColor: STARSHIP_COLORS.border,
  color: STARSHIP_COLORS.text,
} as const;

