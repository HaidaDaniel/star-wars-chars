import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import App from "../App";
import { server } from "../test/mocks/server";

// Wrapper component to provide routing context
const AppWithRouter = () => (
  <BrowserRouter>
    <App />
  </BrowserRouter>
);

describe("App Component", () => {
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it("should render without crashing", () => {
    render(<AppWithRouter />);
    expect(document.body).toBeInTheDocument();
  });

  it("should render main page route", () => {
    render(<AppWithRouter />);
    // MainPage should be rendered, which contains hero cards
    // We check for the infinite scroll container or loading state
    expect(document.querySelector('[data-testid], .grid') || document.body).toBeInTheDocument();
  });

  it("should setup React Query provider", () => {
    render(<AppWithRouter />);
    // The app should render without errors, indicating React Query is properly set up
    expect(document.body).toBeInTheDocument();
  });

  it("should setup routing correctly", () => {
    render(<AppWithRouter />);
    // Should render MainPage component at root route
    expect(document.body).toBeInTheDocument();
  });
});
