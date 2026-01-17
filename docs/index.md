# Documentation

Welcome to the Frontend Angular Signals project documentation. This folder contains detailed guides for development patterns, best practices, and conventions.

## Core Documentation

- **[Angular Signals Best Practices](./angular-signals-best-practices.md)** - Signal-based development patterns and requirements
- **[Component Patterns](./component-patterns.md)** - Component structure, inputs/outputs, and template patterns
- **[Service Patterns](./service-patterns.md)** - Service patterns, httpResource vs rxResource decision matrix, mixed schemas
- **[Template Requirements](./template-requirements.md)** - Modern control flow (@if, @for, @switch), signal bindings

## Patterns & Anti-Patterns

- **[Common Anti-Patterns](./common-anti-patterns.md)** - Common mistakes to avoid in signals, services, and templates
- **[Signals vs RxJS](./signals-vs-rxjs.md)** - When to use signals vs RxJS, interop patterns
- **[Pagination Pattern](./pagination-patterns.md)** - Canonical pattern for paginated lists
- **[Navigation Pattern](./navigation-patterns.md)** - NavigationHelperService for consistent routing
- **[Alert Pattern](./alert-patterns.md)** - Alert helpers for consistent CRUD UX
- **[Inline Editable Forms Pattern](./inline-editable-forms-pattern.md)** - Inline editing with edit/save/cancel icons

## Style & Conventions

- **[Code Style Guidelines](./code-style-guidelines.md)** - Editor config, TypeScript settings, import order, class organization
- **[Naming Conventions](./naming-conventions.md)** - File and code naming standards (kebab-case, PascalCase, etc.)
- **[Type Definitions](./type-definitions.md)** - Type and interface conventions (I prefix, optional properties)

## Testing

- **[Testing Patterns](./testing-patterns.md)** - Testing patterns for components, services, and models

## Configuration

- **[API Configuration](./api-configuration.md)** - API endpoints, static assets, PUT endpoint patterns, backend docs
- **[Backend Integration Patterns](./backend-integration-patterns.md)** - Schema strategy, mixed vs nested schemas, ordering with joined tables

## Tools

- **[MCP Tools for Angular Development](./mcp-tools.md)** - Angular CLI and ESLint MCP tools

---

## Quick Start

### New to this project?

1. Read **[Angular Signals Best Practices](./angular-signals-best-practices.md)** for signal-based development
2. Review **[Component Patterns](./component-patterns.md)** for component structure
3. Check **[Template Requirements](./template-requirements.md)** for modern Angular syntax

### Adding a feature?

1. Review **[Navigation Pattern](./navigation-patterns.md)** for consistent routing
2. Check **[Alert Pattern](./alert-patterns.md)** for CRUD operations
3. Follow **[API Configuration](./api-configuration.md)** for API integration
4. Review **[Backend Integration Patterns](./backend-integration-patterns.md)** for schema decisions and ordering issues

### Stuck?

- See **[Common Anti-Patterns](./common-anti-patterns.md)** for common pitfalls
- Review **[Signals vs RxJS](./signals-vs-rxjs.md)** for data fetching decisions
- Use **[MCP Tools](./mcp-tools.md)** for automated assistance

---

## Project Requirements

- **Angular Version**: 21.x
- **Component Type**: Standalone only (no NgModules)
- **Change Detection**: `ChangeDetectionStrategy.OnPush` for all components
- **State Management**: Signals for local state, RxJS for complex async operations
- **Testing**: Vitest (jsdom mode) with Happy-DOM for browser tests
- **Styling**: LESS with Taiga UI components
- **Build**: Angular CLI with TypeScript strict mode

---

## See Also

- **[AGENTS.md](../AGENTS.md)** - Development guidelines overview
- **[README.md](../README.md)** - Project setup and quick start guide
