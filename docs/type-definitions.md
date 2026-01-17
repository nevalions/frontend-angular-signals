# Type Definitions

This document covers type definition conventions and patterns.

## Shared Types

Common entity types used across multiple features are centralized in `src/app/shared/types/`:

- **Import shared types:** `import { Person, Team, Sport, Tournament, Sponsor, SponsorLine, Position, Season } from '../../../shared/types';`
- **Available entities:** Person, Sport, Team, Tournament, Sponsor, SponsorLine, Position, Season
- **Documentation:** See [Shared Types README](../app/shared/types/README.md) for detailed usage guidelines

**When to use shared types:**
- When a type is used in 2 or more different features
- For core entities that are stable and unlikely to change frequently
- When you need a single source of truth for common data structures

**When NOT to use shared types:**
- For feature-specific types (e.g., `TeamCreate`, `TournamentWithDetails`)
- When types are highly volatile or feature-specific logic

**Example usage:**
```typescript
import { Person, Team } from '../../../shared/types';

export interface TeamWithDetails extends Team {
  sport: Sport | null;
  main_sponsor: Sponsor | null;
  sponsor_line: SponsorLine | null;
}
```

## Type Directory Location

- Models defined in `src/app/features/<feature>/models/` directories (e.g., `src/app/features/teams/models/team.model.ts`)
- Interface naming: No prefix (e.g., `Person`, `Team`, `PlayerWithDetails`)
- Type naming: no prefix (e.g., `PaginationState`, `AgeStats`)
- Always mark optional properties with `?` (e.g., `id?: number | null`)
- Use strict TypeScript types: `string | null` for nullable fields, not optional alone

## Interface Naming

Use PascalCase without prefix for interfaces:

```typescript
// Good - No I prefix, matches feature directory
export interface Person {
  id: number;
  first_name: string;
  second_name: string;
  person_photo_url: string | null;
}

export interface Team {
  id: number;
  title: string;
  team_logo_url: string | null;
}

export interface PlayerWithDetails extends Player {
  person: Person;
  sport: Sport | null;
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
export interface Person {
  id: number; // Required - exists on all instances
  first_name: string; // Required
  second_name: string; // Required
  person_photo_url: string | null; // Nullable but always present in response
  person_dob?: string | null; // Optional - may be absent from response
  isprivate: boolean; // Required
  owner_user_id?: number | null; // Optional nullable field
}
```

## Create vs Update Types

Separate types for create and update operations:

```typescript
// Create type - no ID required, optional fields match backend schema
export interface SeasonCreate {
  year: number;
  description?: string | null;
  iscurrent?: boolean;
}

// Update type - all fields optional
export interface SeasonUpdate {
  year?: number;
  description?: string | null;
  iscurrent?: boolean;
}

// Full model - has ID
export interface Season {
  id: number;
  year: number;
  description?: string | null;
  iscurrent: boolean;
}
```

## Context-Specific Interfaces

Different API endpoints may return different shapes of same entity. Create context-specific interfaces that match the actual API response shape rather than trying to force a single interface to cover all cases.

### When to Use Mixed/Composed Interfaces

Use separate interfaces when:
- The same entity type has different shapes from different endpoints
- Some endpoints return nested data (e.g., `person` object) while others return flattened fields
- You need type safety based on specific API context

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

### WithDetails Schemas

Use `WithDetails` suffix for interfaces that include nested related entities from backend:

```typescript
// Base Team interface (imported from shared/types)
import { Team, Sport, Sponsor, SponsorLine } from '../../../shared/types';

// TeamWithDetails - includes nested entities
export interface TeamWithDetails extends Team {
  sport: Sport | null;
  main_sponsor: Sponsor | null;
  sponsor_line: SponsorLine | null;
}

// TournamentWithDetails - includes nested teams
export interface TournamentWithDetails extends Tournament {
  season: Season | null;
  sport: Sport | null;
  teams: Team[];
  main_sponsor: Sponsor | null;
  sponsor_line: SponsorLine | null;
}

// PlayerWithFullDetails - includes nested associations
export interface PlayerWithFullDetails {
  id: number;
  sport_id: number | null;
  person_id: number | null;
  player_eesl_id: number | null;
  user_id: number | null;
  isprivate: boolean;
  person: Person | null;
  sport: Sport | null;
  player_team_tournaments: PlayerTeamTournamentWithFullDetails[];
}

// Corresponding paginated response types
export type TeamsPaginatedWithDetailsResponse = PaginatedResponse<TeamWithDetails>;
export type TournamentsPaginatedWithDetailsResponse = PaginatedResponse<TournamentWithDetails>;
export type PaginatedPlayerWithFullDetailsResponse = PaginatedResponse<PlayerWithFullDetails>;
```

**When to use `WithDetails` schemas:**
- Displaying detail pages where you need related entity data
- Avoiding multiple API calls to fetch nested data
- When backend provides endpoints that return full entity graphs
- For stats interfaces that require nested context (e.g., `FootballOffenseStats`, `FootballQBStats`)

### Privacy Fields

Several models include privacy fields for authorization:

```typescript
// Common privacy fields
export interface Person {
  id: number;
  // ... other fields
  isprivate: boolean;
  owner_user_id?: number | null;
}

export interface Team {
  id: number;
  // ... other fields
  isprivate: boolean;
  user_id?: number | null;
}
```

**Privacy field patterns:**
- `isprivate: boolean` - Indicates if entity is private
- `user_id?: number | null` - Owner user reference (for Teams, Tournaments, Matches, Players)
- `owner_user_id?: number | null` - Owner user reference (for Persons)

### Best Practices

1. **Name interfaces by context** - `PlayerWithPerson`, `PlayerInTournament`, `TeamWithDetails`, not just `Player` or `Team`
2. **Match API response exactly** - don't add fields that don't exist in response
3. **Use composition over inheritance** - combine smaller focused interfaces
4. **Keep base interface minimal** - only include fields truly shared across all responses
5. **Update paginated response types** to use appropriate context-specific interface
6. **Include privacy fields** in Create/Update interfaces when backend requires them

```typescript
// Correct - Use context-specific types
export type PlayersPaginatedResponse = PaginatedResponse<PlayerWithPerson>;
export type PlayerTeamTournamentWithDetailsPaginatedResponse = PaginatedResponse<PlayerInTournament>;
export type TeamsPaginatedWithDetailsResponse = PaginatedResponse<TeamWithDetails>;

// Avoid - Don't use a single generic Player type
export type PlayersPaginatedResponse = PaginatedResponse<Player>;
```

## Related Documentation

- [Naming Conventions](./naming-conventions.md) - Naming standards
- [Code Style Guidelines](./code-style-guidelines.md) - Coding conventions
