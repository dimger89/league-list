# Sports Leagues

Sports Leagues is a responsive Vue application for browsing leagues from TheSportsDB. Users can search by league name, filter by sport, and select a league to view its first available season badge.

## Features

- Fetches sports leagues from TheSportsDB.
- Searches league names with trimmed, case-insensitive matching and highlights matching text.
- Filters leagues by sport using options derived from the API response.
- Displays each league's name, sport, and alternate name when available.
- Loads a season badge only when a league is selected.
- Caches resolved badge URLs and no-badge results in memory.
- Provides a responsive card grid with keyboard-accessible selection.
- Handles initial loading, request errors with retry actions, empty API responses, badge loading and error states, unavailable badges, and filters with no matching results.

## Tech Stack

- Vue 3.5 with the Composition API and TypeScript 5.8
- Vite 6
- PrimeVue 4.5 with the PrimeUIX Aura theme
- SCSS with Sass 1.x
- Vitest 3, Vue Test Utils 2, and jsdom
- ESLint 9 and Prettier 3

## Getting Started

### Prerequisites

- Node.js 22+
- npm 10+

Install dependencies:

```sh
npm install
```

Start the development server:

```sh
npm run dev
```

Create a type-checked production build:

```sh
npm run build
```

Run TypeScript checks:

```sh
npm run type-check
```

Run ESLint:

```sh
npm run lint
```

Run unit tests:

```sh
npm run test:unit
```

## Architecture

The application keeps responsibilities separated without introducing global state management:

- `src/api/` contains the stateless TheSportsDB client, response handling, and badge selection logic.
- `src/components/` contains the filter controls, responsive league list, and individual league cards.
- `useLeagues` loads leagues and exposes loading/error state, dynamically derived sport options, and locally filtered results.
- `useLeagueBadges` manages per-league badge state, in-memory caching, in-flight request deduplication, and retryable failures.
- `App.vue` coordinates the page view state, filters, selected league, badge requests, and component interactions.
- `src/types/` contains the API data types, while `src/styles/` contains shared application styling.

## Design Decisions

### Client-side filtering

The league list is fetched once and filtered locally because the dataset is small and already available in memory. Search remains immediate and requires neither debounce nor additional API requests.

### Dynamic sport options

Sport options are derived from the loaded league data, deduplicated, and sorted instead of being hardcoded.

### State management

Vue refs, computed values, and focused composables are sufficient for the application's small, feature-local state. Pinia would add unnecessary complexity for this scope.

### Badge caching

Badge caching belongs to the application layer, leaving the API client stateless. Successful badge URLs and empty results are cached by league ID for the current session. Concurrent requests for the same league share one in-flight request, while failed requests are not cached as successful results and remain retryable.

### Badge selection

TheSportsDB may return seasons whose badge value is null or empty. The API layer therefore returns the first non-empty `strBadge` in the seasons response, or `null` when none is available.

### UI

PrimeVue provides the form controls, buttons, loading indicators, and feedback messages. Custom SCSS handles the layout, card presentation, and responsive behavior down to small viewports. Vue transitions add subtle badge and filtering feedback while respecting reduced-motion preferences.

## Testing

The Vitest suite covers:

- case-insensitive and trimmed league search, sport filtering, combined filters, and dynamic sport options;
- TheSportsDB endpoint usage, non-OK responses, first-available badge selection, and missing badge data;
- successful and empty badge caching, concurrent request deduplication, error state, and retry behavior;
- conditional alternate names, card selection events, and the main badge display states in `LeagueCard`.

API and network boundaries are mocked, so unit tests do not call TheSportsDB.

## AI Tools Used

OpenAI Codex was used to assist with:

- implementation and code scaffolding;
- UI implementation and refinement;
- generating and refining tests;
- repetitive development tasks.

ChatGPT was used to assist with:

- interpreting the assignment requirements;
- discussing and reviewing architecture and design decisions;
- reviewing API and caching behavior;
- identifying edge cases;
- reviewing the implementation and tests.

AI-generated suggestions and code were reviewed and adjusted before being included in the final solution.

## API

The application uses these TheSportsDB v1 endpoints:

- All leagues: `https://www.thesportsdb.com/api/v1/json/3/all_leagues.php`
- Season badges: `https://www.thesportsdb.com/api/v1/json/3/search_all_seasons.php?badge=1&id={leagueId}`

Official documentation: [TheSportsDB API Documentation](https://www.thesportsdb.com/free_sports_api)
