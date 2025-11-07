export const API_BASE_URL = "https://sw-api.starnavi.io";

export const API_RETRY_CONFIG = {
  maxRetries: 3,
  retryDelay: 1000,
} as const;

export const API_BATCH_SIZE = 5;

export const CHARACTER_IMAGE_URL = "https://starwars-visualguide.com/assets/img/characters";

export const FALLBACK_CHARACTER_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='600' viewBox='0 0 400 600'%3E%3Crect fill='%23111827' width='400' height='600'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='48' fill='%236b7280'%3ENo Image%3C/text%3E%3C/svg%3E";

export const IMAGES_ENABLED = import.meta.env.VITE_ENABLE_IMAGES !== 'false';

