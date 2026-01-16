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

## Context-Specific Interfaces

Different API endpoints may return different shapes of the same entity. Create context-specific interfaces that match the actual API response shape rather than trying to force a single interface to cover all cases.

### When to Use Mixed/Composed Interfaces

Use separate interfaces when:
- The same entity type has different shapes from different endpoints
- Some endpoints return nested data (e.g., `person` object) while others return flattened fields
- You need type safety based on the specific API context

### Example: Player Interfaces

```typescript
// Base interface - minimal fields shared across all responses
export interface Player {
  id: number;
  sport_id: number | null;
  person_id: number | null;
  player_eesl_id: number | null;
  user_id: number | null;
  isprivate: boolean;
  // Optional fields for endpoint-specific responses
  first_name?: string | null;
  second_name?: string | null;
  player_team_tournaments?: PlayerTeamTournament[];
}

// API: /api/players/available - Returns Player with nested Person
export interface PlayerWithPerson extends Player {
  person: Person;
}

// API: /api/players/paginated - Returns Player with flattened names
export interface PlayerWithNames extends Player {
  first_name: string | null;
  second_name: string | null;
  player_team_tournaments: PlayerTeamTournament[];
}

// API: /api/tournaments/id/{id}/players/paginated - Tournament-specific view
export interface PlayerInTournament {
  id: number;
  player_team_tournament_eesl_id: number | null;
  player_id: number;
  player_number: string | null;
  team_id: number | null;
  team_title: string | null;
  position_id: number | null;
  position_title: string | null;
  tournament_id: number | null;
  first_name: string | null;
  second_name: string | null;
}
```

### Best Practices

1. **Name interfaces by context** - `PlayerWithPerson`, `PlayerInTournament`, not just `Player`
2. **Match API response exactly** - don't add fields that don't exist in the response
3. **Use composition over inheritance** - combine smaller focused interfaces
4. **Keep base interface minimal** - only include fields truly shared across all responses
5. **Update paginated response types** to use the appropriate context-specific interface

```typescript
// Correct - Use context-specific types
export type PlayersPaginatedResponse = PaginatedResponse<PlayerWithPerson>;
export type PlayerTeamTournamentWithDetailsPaginatedResponse = PaginatedResponse<PlayerInTournament>;

// Avoid - Don't use a single generic Player type
export type PlayersPaginatedResponse = PaginatedResponse<Player>;
```

## Related Documentation

- [Naming Conventions](./naming-conventions.md) - Naming standards
- [Code Style Guidelines](./code-style-guidelines.md) - Coding conventions
