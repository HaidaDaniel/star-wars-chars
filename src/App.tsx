import React, { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";
import { fetchStarWarsData } from "./api/api";
import { useStarWarsStore } from "./store/starWarsStore";
import { MainPage } from "./pages/MainPage";
import "./App.css";

/**
 * React Query client instance for managing server state and caching.
 */
const queryClient = new QueryClient();

/**
 * Provider component that initializes global application data.
 * Fetches and caches Star Wars film data on application startup.
 * @param children - Child components to render
 */
function AppProviders({ children }: { children: React.ReactNode }) {
  const { data } = useQuery({
    queryKey: ["starWarsData"],
    queryFn: fetchStarWarsData,
  });
  const setData = useStarWarsStore((state) => state.setData);

  // Update global store when film data is loaded
  useEffect(() => {
    if (data) {
      setData(data);
    }
  }, [data, setData]);

  return <>{children}</>;
}

/**
 * Main application component.
 * Sets up React Query provider and routing.
 */
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppProviders>
        <Routes>
          <Route path="/" element={<MainPage />} />
        </Routes>
      </AppProviders>
    </QueryClientProvider>
  );
}

export default App;
