import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [react(), tailwindcss(), tsconfigPaths()],
  server: {
    port: 3000,
    open: true,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate React and related libraries
          "react-vendor": ["react", "react-dom", "react-router-dom"],
          // Separate React Flow (large visualization library)
          "react-flow": ["@xyflow/react"],
          // Separate React Query
          "react-query": ["@tanstack/react-query"],
          // Separate InfiniteScroll
          "infinite-scroll": ["react-infinite-scroll-component"],
          // Other utilities
          "utils": ["axios", "zustand", "date-fns", "clsx", "tailwind-merge"],
        },
      },
    },
    // Increase chunk size warning limit (optional)
    chunkSizeWarningLimit: 600,
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    css: {
      modules: {
        classNameStrategy: "stable",
      },
    },
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      reportsDirectory: "./coverage",
      clean: true,
      cleanOnRerun: true,
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "**/*.test.*",
        "**/*.spec.*",
        "src/**/__tests__/**",
        "src/**/__mocks__/**",
        "src/test/mocks/**",
        "test/**",
        "tests/**",
        "**/mocks/**",
        "src/test/**",
        "src/**/test-utils/**",
        "src/test/setup.{ts,tsx}",
        "**/vitest.setup.{ts,tsx}",
        "**/vite-env.d.ts",
        // Entry points
        "src/main.tsx",
        "src/App.tsx",
        // Type definitions
        "src/types/**",
        // Constants (no logic to test)
        "src/constants/**",
        // Basic UI components (shadcn/ui)
        "src/components/ui/**",
        // CSS files
        "**/*.css",
        // Index files (re-exports only)
        "**/index.{ts,tsx}",
      ],
    },
  },
});
