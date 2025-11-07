import axios from "axios";
import { API_BASE_URL } from "../constants/api";

/**
 * Helper function to convert snake_case keys to camelCase
 * @param obj - Object with snake_case keys
 * @returns Object with camelCase keys
 */
const toCamelCase = (obj: unknown): unknown => {
  if (obj === null || typeof obj !== "object" || obj instanceof Date) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(toCamelCase);
  }

  const camelCaseObj: Record<string, unknown> = {};
  
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      camelCaseObj[camelKey] = toCamelCase(obj[key as keyof typeof obj]);
    }
  }

  return camelCaseObj;
};

/**
 * Helper function to convert camelCase keys to snake_case for API requests
 * @param obj - Object with camelCase keys
 * @returns Object with snake_case keys
 */
const toSnakeCase = (obj: unknown): unknown => {
  if (obj === null || typeof obj !== "object" || obj instanceof Date) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(toSnakeCase);
  }

  const snakeCaseObj: Record<string, unknown> = {};
  
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
      snakeCaseObj[snakeKey] = toSnakeCase(obj[key as keyof typeof obj]);
    }
  }

  return snakeCaseObj;
};

/**
 * Configured axios instance with baseURL and interceptors
 * Automatically converts API responses from snake_case to camelCase
 * and request data from camelCase to snake_case
 */
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor to convert snake_case to camelCase
apiClient.interceptors.response.use(
  (response) => {
    if (response.data && typeof response.data === 'object') {
      response.data = toCamelCase(response.data);
    }
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Request interceptor to convert camelCase to snake_case
apiClient.interceptors.request.use(
  (config) => {
    if (config.data && typeof config.data === 'object') {
      config.data = toSnakeCase(config.data);
    }
    if (config.params && typeof config.params === 'object') {
      config.params = toSnakeCase(config.params);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;
