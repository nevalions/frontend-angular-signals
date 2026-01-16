# AGENTS.md - Development Guidelines

This document provides an overview of development guidelines and links to detailed documentation.

## Documentation Structure

This project uses a modular documentation structure. See the [`docs/`](./docs/) folder for detailed guides on specific topics.

## Core Documentation

- **[Angular Signals Best Practices](./docs/angular-signals-best-practices.md)** - Signal-based development patterns
- **[Component Patterns](./docs/component-patterns.md)** - Component structure and patterns
- **[Service Patterns](./docs/service-patterns.md)** - Service patterns including httpResource vs rxResource
- **[Template Requirements](./docs/template-requirements.md)** - Template best practices

## Patterns & Anti-Patterns

- **[Common Anti-Patterns](./docs/common-anti-patterns.md)** - What to avoid
- **[Signals vs RxJS](./docs/signals-vs-rxjs.md)** - When to use each
- **[Pagination Pattern](./docs/pagination-patterns.md)** - Paginated list pattern
- **[Navigation Pattern](./docs/navigation-patterns.md)** - Navigation helper service
- **[Alert Pattern](./docs/alert-patterns.md)** - User feedback patterns

## Style & Conventions

- **[Code Style Guidelines](./docs/code-style-guidelines.md)** - Coding conventions
- **[Naming Conventions](./docs/naming-conventions.md)** - File and code naming
- **[Type Definitions](./docs/type-definitions.md)** - Type conventions

## Testing

- **[Testing Patterns](./docs/testing-patterns.md)** - Testing components, services, and models
- **[Testing Common Mistakes](./docs/testing-common-mistakes.md)** - Catalog of common testing mistakes to avoid

## Configuration

- **[API Configuration](./docs/api-configuration.md)** - API endpoints and static assets

## Tools

- **[MCP Tools for Angular Development](./docs/mcp-tools.md)** - Angular CLI and ESLint MCP tools

---

## UI/Styles Development

**IMPORTANT**: When editing styles and UI components, use the built-in MCP tools:

- Use `angular-cli_*` MCP tools for Angular-specific tasks
- Use `taiga-ui_*` MCP tools for Taiga UI component library
- Delegate to the `frontend-angular-taiga` agent for Angular + Taiga UI development tasks with Playwright testing

## Important Notes

- All components must be standalone (no NgModules)
- Signal-based Angular project
- All components must use `ChangeDetectionStrategy.OnPush`
- Prefer signals over imperative state for all reactive patterns
- Paginated lists MUST follow the canonical Paginated List Pattern (see [Service Patterns](./docs/service-patterns.md))

## Build, Lint, and Test Commands

### Build Commands

```bash
npm run start          # Start development server (http://localhost:4200)
npm run build          # Production build
npm run watch          # Build with watch mode
```

**Important:**

- Do not start parallel builds on different ports
- Always connect to the existing development server on http://localhost:4200

### Test Commands

```bash
npm run test           # Run all tests (Vitest/jsdom mode - fast)
npm run test:coverage  # Run tests with coverage

# Run specific test files with Vitest
npm run test src/app/features/seasons/models/season.model.spec.ts
npm run test src/app/features/seasons/**/*.spec.ts  # Run all season tests

# Run browser tests (hybrid mode)
npm run test:browser      # Run component tests in Happy-DOM (real browser environment)
```

## Adding New Features

1. **Check for existing shared components** before creating new ones:
   - Review `src/app/shared/components/` for reusable UI patterns
   - Shared components include: `EntityHeader`, `Navbar`, `EmptyPage`, `Error404`
   - Example: Use `EntityHeaderComponent` for detail pages instead of duplicating header code
   - See `src/app/shared/components/README.md` for usage documentation
2. Create component directory: `src/app/components/feature-name/`
3. Create component files: `*.component.ts`, `*.html`, `*.less`
4. Create type definition: `src/app/type/feature.type.ts`
5. Create service extending `BaseApiService`: `feature.service.ts`
6. Create facade service in component directory
7. Add route to `src/app/app.routes.ts` with state injection
8. Update `src/app/store/appstate.ts` with feature state interface
9. For CRUD operations, use alert helpers from `src/app/core/utils/alert-helper.util.ts`:
   - `withCreateAlert()` for create operations
   - `withUpdateAlert()` for update operations
   - `withDeleteConfirm()` for delete operations

## Console Logging

Current codebase uses console.log for debugging. When making changes:

- Keep existing console.log statements unless refactoring
- Add meaningful console.log for API calls (already in BaseApiService)
- Remove console.log before production builds if necessary

## External Documentation

### Backend API Documentation

Backend API documentation is available at:
- Interactive docs: http://localhost:9000/docs
- Backend codebase: ../statsboards-backend

Refer to these resources for:
- Available endpoints and their parameters
- Request/response schemas
- Authentication requirements
- Example requests

### Angular Official Documentation

- [Angular.dev](https://angular.dev) - Official Angular documentation
- [Angular Style Guide](https://angular.dev/style-guide) - Coding conventions
