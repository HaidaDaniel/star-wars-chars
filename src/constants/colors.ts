/**
 * Color constants for graph visualization.
 * These colors are used for hero, film, and starship nodes in the graph.
 * Can be used in both JavaScript/TypeScript code and Tailwind CSS classes.
 * 
 * Usage in JavaScript/TypeScript:
 *   import { HERO_COLORS } from './constants/colors';
 *   style={{ backgroundColor: HERO_COLORS.background }}
 * 
 * Usage in Tailwind CSS classes:
 *   className="bg-[--color-hero-bg] border-[--color-hero-border] text-[--color-hero-text]"
 *   Or using arbitrary values: className="bg-[#1e40af]"
 */

/**
 * Hero node colors (blue theme)
 */
export const HERO_COLORS = {
  /** Background color for hero nodes */
  background: "#1e40af",
  /** Border color for hero nodes */
  border: "#3b82f6",
  /** Text color for hero nodes */
  text: "#ffffff",
  /** Light variant for minimap and indicators */
  light: "#3b82f6",
} as const;

/**
 * Film node colors (green theme)
 */
export const FILM_COLORS = {
  /** Background color for film nodes */
  background: "#065f46",
  /** Border color for film nodes */
  border: "#10b981",
  /** Text color for film nodes */
  text: "#ffffff",
  /** Light variant for minimap and indicators */
  light: "#10b981",
} as const;

/**
 * Starship node colors (purple theme)
 */
export const STARSHIP_COLORS = {
  /** Background color for starship nodes */
  background: "#581c87",
  /** Border color for starship nodes */
  border: "#8b5cf6",
  /** Text color for starship nodes */
  text: "#ffffff",
  /** Light variant for minimap and indicators */
  light: "#8b5cf6",
} as const;

/**
 * Graph background and edge colors
 */
export const GRAPH_COLORS = {
  /** Background color for the graph canvas */
  background: "#1f2937",
  /** Color for graph edges/connections */
  edge: "#9ca3af",
  /** Background color for controls and minimap */
  controlBackground: "rgba(31, 41, 55, 0.95)",
  /** Border color for controls and minimap */
  controlBorder: "#374151",
} as const;

/**
 * All graph colors combined for easy access
 */
export const GRAPH_NODE_COLORS = {
  hero: HERO_COLORS,
  film: FILM_COLORS,
  starship: STARSHIP_COLORS,
} as const;

