# Shared Types

This directory contains shared TypeScript type definitions used across multiple features in the application.

## Purpose

Centralizing type definitions:
- Ensures consistency across the codebase
- Reduces duplication (DRY principle)
- Simplifies maintenance - changes only need to be made in one place
- Provides a single source of truth for common entity types

## Usage

Import shared types using the barrel export (relative path):

```typescript
import { Person, Team, Tournament, Sport, Sponsor, SponsorLine, Position, Season } from '../../../shared/types';
```

## Available Types

### Core Entities

- **Person** - Person entity with name, photo, and EESL ID
- **Sport** - Sport entity with title and description
- **Team** - Team entity with logo, colors, and sponsor information
- **Tournament** - Tournament entity with season and sport information
- **Sponsor** - Sponsor entity with logo information
- **SponsorLine** - Sponsor line grouping entity
- **Position** - Player position entity with category
- **Season** - Season entity with year and current status

## Guidelines

### When to Add Types Here

Add types to this directory when:
1. The type is used in **2 or more** different features
2. The type represents a core entity (Person, Team, Tournament, etc.)
3. The type is stable and unlikely to change frequently

### When NOT to Add Types Here

Keep types in feature-specific model files when:
1. The type is only used within a single feature
2. The type is a feature-specific extension (e.g., `TeamCreate`, `TournamentWithDetails`)
3. The type is highly volatile or feature-specific logic

### Feature-Specific Extensions

Feature-specific types should extend shared types in their respective model files:

```typescript
// In src/app/features/teams/models/team.model.ts
import { Team } from '../../../shared/types';

export interface TeamCreate extends Omit<Partial<Team>, 'id'> {}

export interface TeamWithDetails extends Team {
  sport: Sport | null;
  main_sponsor: Sponsor | null;
  sponsor_line: SponsorLine | null;
}
```

## File Structure

```
shared/types/
├── entities.types.ts  # Core entity definitions
├── index.ts          # Barrel export
└── README.md         # This file
```

## Related Documentation

- [Type Definitions Guide](../../../docs/type-definitions.md)
- [Code Style Guidelines](../../../docs/code-style-guidelines.md)
