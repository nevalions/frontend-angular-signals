# Context-Based Entity Pattern

Canonical pattern for displaying entity details based on context (sport vs tournament).

## Overview

This pattern allows a single detail page to render different content based on the navigation context. The same entity (player/team) can be viewed from:
- **Sport context**: Entity as part of a sport - shows career/history statistics only
- **Tournament context**: Entity as part of a tournament - shows tournament-specific assignment form

## Implementation Pattern

### Route Parameters

Use query parameters to indicate context:

```typescript
// Navigation from sport
toPlayerDetail(sportId, playerId, fromSport=true)

// Navigation from tournament
toPlayerDetail(sportId, playerId, fromSport=false, tournamentId, year)
```

### Component Setup

```typescript
@Component({ ... })
export class PlayerDetailComponent {
  // Query parameters
  fromSport = toSignal(
    this.route.queryParamMap.pipe(map((params) => params.get('fromSport') === 'true')),
    { initialValue: false }
  );

  fromTournamentId = toSignal(
    this.route.queryParamMap.pipe(map((params) => {
      const val = params.get('tournamentId');
      return val ? Number(val) : null;
    })),
    { initialValue: null }
  );

  fromYear = toSignal(
    this.route.queryParamMap.pipe(map((params) => {
      const val = params.get('year');
      return val ? Number(val) : null;
    })),
    { initialValue: null }
  );

  // Context signals
  isInSportContext = computed(() => this.fromSport() === true);
  isInTournamentContext = computed(() => this.fromTournamentId() !== null);

  // Conditional data loading
  playerResource = httpResource<PlayerWithPersonAndTournaments | PlayerDetailInTournamentResponse>(() => {
    const playerId = this.playerId();
    const fromTournamentId = this.fromTournamentId();
    if (!playerId) return undefined;
    
    if (fromTournamentId) {
      return buildApiUrl(`/api/players/id/${playerId}/in-tournament/${fromTournamentId}`);
    }
    
    return buildApiUrl(`/api/players/id/${playerId}/person`);
  });
}
```

### Template Conditional Rendering

```html
@if (isInTournamentContext()) {
  <div class="entity-detail__tournament-assignment">
    <h2>Tournament Assignment</h2>
    <!-- Tournament-specific form: team, number, position -->
    <app-assignment-form />
  </div>
}

@if (!isInTournamentContext()) {
  <div class="entity-detail__content">
    <!-- Career statistics sections only -->
    @if (careerByTeam().length > 0 || careerByTournament().length > 0) {
      <section>Career by Team</section>
      <section>Career by Tournament</section>
    }
  </div>
}
```

## Key Principles

### 1. Forms Only in Tournament Context

- **Tournament context**: Show assignment form (team, number, position, etc.)
- **Sport context**: NO forms - entity attributes are read-only in this context

**Rationale**: In sport context, you're viewing the entity's overall career across multiple tournaments. In tournament context, you're managing the specific assignment for that tournament.

### 2. Career Sections Only in Sport Context

- **Tournament context**: Hide career sections (they're not relevant to a single tournament assignment)
- **Sport context**: Show career history across teams and tournaments

**Rationale**: Career statistics represent the entity's overall history, which belongs in sport context, not when viewing a specific tournament assignment.

### 3. Single Detail Component

Reuse the same component for both contexts to avoid duplication:
- Use computed signals to determine context
- Conditionally render different sections based on context
- Load appropriate API endpoints based on context

### 4. Navigation Back Behavior

Navigate back to the originating context:

```typescript
navigateBack(): void {
  const sportId = this.sportId();
  const fromSport = this.fromSport();
  const fromTournamentId = this.fromTournamentId();
  const fromYear = this.fromYear();

  if (!sportId) return;

  if (!fromSport && fromTournamentId && fromYear) {
    // From tournament - go back to tournament detail
    this.navigationHelper.toTournamentDetail(sportId, fromYear, fromTournamentId, 'players');
  } else {
    // From sport - go back to sport detail
    this.navigationHelper.toSportDetail(sportId, undefined, 'players');
  }
}
```

## Applicable Entities

This pattern applies to entities that can exist in multiple contexts:

### Players

- **Sport context**: View player's career across all tournaments
- **Tournament context**: Edit player's assignment (team, number, position) for that tournament

### Teams (Future)

- **Sport context**: View team's roster across all tournaments
- **Tournament context**: Edit team's tournament-specific details

## API Considerations

### Sport Context Endpoint

```typescript
GET /api/players/id/{playerId}/person
// Returns: PlayerWithPersonAndTournaments (includes all career data)
```

### Tournament Context Endpoint

```typescript
GET /api/players/id/{playerId}/in-tournament/{tournamentId}
// Returns: PlayerDetailInTournamentResponse (includes tournament_assignment + career data)
```

## Related Documentation

- [Navigation Pattern](./navigation-patterns.md) - Navigation helper methods
- [Angular Signals Best Practices](./angular-signals-best-practices.md) - Signal patterns
- [Component Patterns](./component-patterns.md) - Component structure
