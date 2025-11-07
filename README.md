# Star Wars Characters

A modern React application for browsing Star Wars characters with detailed information and interactive relationship graphs.

## Features

- 📋 **Character List** - Browse through Star Wars characters with infinite scroll
- 🔍 **Character Details** - View detailed information about each character
- 🌐 **Interactive Graph** - Visualize relationships between characters, films, and starships using React Flow
- 🖼️ **Lazy Loading Images** - Optimized image loading with IntersectionObserver
- 🎨 **Modern UI** - Built with Tailwind CSS and custom components
- ⚡ **Fast & Responsive** - Optimized performance with React Query caching
- 🧪 **Well Tested** - Comprehensive test coverage with Vitest

## Tech Stack

### Core
- **React 19** - UI library
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server

### State Management & Data Fetching
- **TanStack Query (React Query)** - Server state management and caching
- **Zustand** - Client state management
- **Axios** - HTTP client with interceptors

### UI & Styling
- **Tailwind CSS 4** - Utility-first CSS framework
- **React Flow** - Interactive node-based graphs
- **Lucide React** - Icon library
- **date-fns** - Date formatting

### Testing
- **Vitest** - Fast unit test framework
- **Testing Library** - React component testing
- **MSW (Mock Service Worker)** - API mocking

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript ESLint** - TypeScript-specific linting

## Requirements

- **Node.js** 18.x or higher
- **npm** 9.x or higher

## Installation

```bash
npm install
npm run dev
```

The application will be available at `http://localhost:5173`

## API

This project uses the [Star Wars API](https://sw-api.starnavi.io) to fetch character data, films, and starships information.

## Project Structure

```
src/
├── api/              # API client and configuration
│   ├── api.ts        # API methods
│   └── axiosConfig.ts # Axios setup with interceptors
├── components/       # React components
│   ├── ui/          # Reusable UI components
│   └── __tests__/   # Component tests
├── constants/       # Application constants
│   ├── api.ts       # API URLs and config
│   ├── colors.ts    # Graph color schemes
│   └── flow.ts      # React Flow configuration
├── helpers/         # Helper functions
│   └── FlowParamGeneration.ts # Graph generation logic
├── hooks/           # Custom React hooks
├── pages/           # Page components
├── queries/         # React Query hooks
│   ├── useHeroesQuery.ts
│   └── useHeroDetailsQuery.ts
├── store/           # Zustand store
│   └── starWarsStore.ts
├── types/           # TypeScript type definitions
├── utils/           # Utility functions
└── test/            # Test setup and mocks
```

## Testing

### Run Tests

```bash
npm run test          # Run tests in watch mode
npm run test:ui       # Run tests with UI interface
npm run test:coverage # Run tests with coverage report
```

### Test Coverage

The project includes comprehensive tests for:
- API layer and data fetching
- React components and UI
- Custom hooks
- State management
- Utility functions

Coverage reports are generated in the `coverage/` directory.

## Environment Variables

### VITE_ENABLE_IMAGES

Controls whether character images are loaded from external source or fallback placeholders are shown.

- **Default**: `true` (images are loaded)
- **To disable images**: Set to `false`

#### Local Development

Create a `.env` file in the project root:

```env
VITE_ENABLE_IMAGES=false
```

After changing the value, restart the dev server.

#### Production/Vercel Deployment

1. Go to your Vercel project settings
2. Navigate to **Settings** → **Environment Variables**
3. Add a new variable:
   - **Name**: `VITE_ENABLE_IMAGES`
   - **Value**: `false` (to disable images) or `true` (to enable images)
4. Redeploy your application

**Note**: When images are disabled, placeholder images will be shown instead of loading from `starwars-visualguide.com`.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run test` - Run tests
- `npm run test:coverage` - Run tests with coverage
- `npm run lint` - Run ESLint

## Installation

```bash
npm install
npm run dev
```

