# Type Definitions

This document covers type definition conventions and patterns.

## Type Directory Location

- All types defined in `src/app/type/` directory
- Interface naming: `I` prefix (e.g., `IPerson`, `ITeam`)
- Type naming: no prefix (e.g., `AgeStats`)
- Always mark optional properties with `?` (e.g., `id?: number | null`)

## Interface Naming

Use `I` prefix for interfaces:

```typescript
// Good - With I prefix
export interface IPerson {
  id?: number | null;
  first_name: string;
  second_name: string;
  person_photo_url: string | null;
}

export interface ITeam {
  id?: number | null;
  title: string;
  team_logo_url: string | null;
}
```

## Type Naming

No prefix for types:

```typescript
// Good - No prefix
export type PaginationState = {
  currentPage: number;
  itemsPerPage: number;
};

export type AgeStats = {
  min: number;
  max: number;
  average: number;
};
```

## Optional Properties

Always mark optional properties with `?`:

```typescript
export interface IPerson {
  id?: number | null; // Optional ID
  first_name: string; // Required
  second_name: string; // Required
  person_photo_url: string | null; // Nullable but always present
}
```

## Create vs Update Types

Separate types for create and update operations:

```typescript
// Create type - no ID required
export interface SeasonCreate {
  year: number;
  description?: string;
}

// Update type - all fields optional
export interface SeasonUpdate {
  year?: number;
  description?: string;
}

// Full model - has ID
export interface Season {
  id: number;
  year: number;
  description: string | null;
}
```

## Related Documentation

- [Naming Conventions](./naming-conventions.md) - Naming standards
- [Code Style Guidelines](./code-style-guidelines.md) - Coding conventions
