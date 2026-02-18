# FrontendAngularSignals

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.0.4.

## Features

Implemented features are documented in `FEATURES_*.md` files:

- [Positions Feature](FEATURES_POSITIONS.md) - Player positions within sports
- [Scoreboard Feature](FEATURES_SCOREBOARD.md) - Real-time scoreboard management and display

## Development Documentation

For detailed development guidelines, patterns, and best practices, see the [`docs/`](./docs/) folder:

- **[Angular Signals Best Practices](./docs/angular-signals-best-practices.md)** - Signal-based development patterns
- **[Component Patterns](./docs/component-patterns.md)** - Component structure and patterns
- **[Service Patterns](./docs/service-patterns.md)** - Service patterns and patterns
- **[Testing Patterns](./docs/testing-patterns.md)** - Testing patterns for components, services, and models

For the complete documentation index, see **[docs/index.md](./docs/index.md)** or the **[Development Guidelines](./AGENTS.md)** file.

## Installation

To install dependencies, run:

```bash
npm install --legacy-peer-deps
```

The `--legacy-peer-deps` flag is required due to Taiga UI peer dependency constraints.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running visual tests

Visual tests use [Playwright](https://playwright.dev/) to capture and compare screenshots across different browsers and devices.

### Run all visual tests

```bash
npm run test:visual
```

### Run specific test by name pattern

```bash
npm run test:visual:grep -- "sports list.*desktop"
```

### Run tests by device type

```bash
npm run test:visual:desktop  # Only desktop tests
npm run test:visual:mobile   # Only mobile tests
npm run test:visual:tablet   # Only tablet tests
```

### Run tests by page type

```bash
npm run test:visual:list-only    # All list page tests
npm run test:visual:detail-only  # All detail page tests
```

### Interactive modes

```bash
npm run test:visual:ui      # Run tests in interactive UI mode
npm run test:visual:report   # View HTML report of last run
```

### List all available tests

```bash
npm run test:visual:list
```

### Run specific test file

```bash
npx playwright test sports.spec.ts
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
