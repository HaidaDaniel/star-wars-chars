import {
  HERO_COLORS,
  FILM_COLORS,
  STARSHIP_COLORS,
} from "./colors";

export const FLOW_NODE_CONFIG = {
  width: 200,
  height: 40,
  padding: 0,
  heroYPosition: 5,
  filmsYPosition: 100,
  starshipsYPosition: 200,
} as const;

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

export const HERO_NODE_STYLE = {
  ...FLOW_NODE_BASE_STYLE,
  backgroundColor: HERO_COLORS.background,
  borderColor: HERO_COLORS.border,
  color: HERO_COLORS.text,
} as const;

export const FILM_NODE_STYLE = {
  ...FLOW_NODE_BASE_STYLE,
  backgroundColor: FILM_COLORS.background,
  borderColor: FILM_COLORS.border,
  color: FILM_COLORS.text,
} as const;

export const STARSHIP_NODE_STYLE = {
  ...FLOW_NODE_BASE_STYLE,
  backgroundColor: STARSHIP_COLORS.background,
  borderColor: STARSHIP_COLORS.border,
  color: STARSHIP_COLORS.text,
} as const;

