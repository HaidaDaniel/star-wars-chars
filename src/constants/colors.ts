export const HERO_COLORS = {
  background: "#1e40af",
  border: "#3b82f6",
  text: "#ffffff",
  light: "#3b82f6",
} as const;

export const FILM_COLORS = {
  background: "#065f46",
  border: "#10b981",
  text: "#ffffff",
  light: "#10b981",
} as const;

export const STARSHIP_COLORS = {
  background: "#581c87",
  border: "#8b5cf6",
  text: "#ffffff",
  light: "#8b5cf6",
} as const;

export const GRAPH_COLORS = {
  background: "#1f2937",
  edge: "#9ca3af",
  controlBackground: "rgba(31, 41, 55, 0.95)",
  controlBorder: "#374151",
} as const;

export const GRAPH_NODE_COLORS = {
  hero: HERO_COLORS,
  film: FILM_COLORS,
  starship: STARSHIP_COLORS,
} as const;

