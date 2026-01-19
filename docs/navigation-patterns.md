# Navigation Pattern

Canonical pattern for navigation using NavigationHelperService.

## Navigation Helper Service

Use `NavigationHelperService` for common navigation routes to avoid repetition:

```typescript
import { NavigationHelperService } from '../../../shared/services/navigation-helper.service';

@Component({ ... })
export class ExampleComponent {
  private navigationHelper = inject(NavigationHelperService);

  cancel(): void {
    this.navigationHelper.toTournamentsList(this.sportId, this.year);
  }

  onSubmit(): void {
    this.service.save().subscribe(() => {
      this.navigationHelper.toTournamentDetail(this.sportId, this.year, this.tournamentId);
    });
  }
}
```

## Available Navigation Methods

### Tournaments

```typescript
toTournamentsList(sportId: number | string, year: number | string)
toTournamentDetail(sportId: number | string, year: number | string, tournamentId: number | string)
toTournamentEdit(sportId: number | string, year: number | string, tournamentId: number | string)
toTournamentCreate(sportId: number | string, year: number | string)
```

### Sports

```typescript
toSportDetail(sportId: number | string, year?: number | string, tab?: string)
toSportEdit(sportId: number | string)
toSportsList()
```

### Teams

```typescript
toTeamDetail(sportId: number | string, teamId: number | string, year?: number | string)
toTeamEdit(sportId: number | string, teamId: number | string)
toTeamCreate(sportId: number | string)
```

### Players

```typescript
toPlayerDetail(sportId: number | string, playerId: number | string, fromSport?: boolean, tournamentId?: number | string, year?: number | string)
```

### Persons

```typescript
toPersonsList()
toPersonDetail(id: number | string)
toPersonEdit(id: number | string)
toPersonCreate()
```

### Users

```typescript
toUserProfile(userId: number | string)
```

### System

```typescript
toHome()
toError404()
```

## Tab Parameter Support

Navigation helpers support optional tab parameter for deep linking:

```typescript
// In NavigationHelperService
toDetail(sportId: number | string, year: number | string, id: number | string, tab?: string): void {
  const params = tab ? { queryParams: { tab } } : {};
  this.router.navigate(['/path', sportId, year, id], params);
}

// Usage in component
navigateBackToTournament(): void {
  const sportId = this.sportId();
  const year = this.year();
  const tournamentId = this.tournamentId();

  if (sportId && year && tournamentId) {
    // Navigate back to tournament with teams tab active
    this.navigationHelper.toDetail(sportId, year, tournamentId, 'teams');
  }
}
```

## Benefits

- ✅ Consistent navigation across the application
- ✅ Centralized navigation logic
- ✅ Easy to update if routes change
- ✅ Supports tab parameter for deep linking
- ✅ Type-safe navigation

## Related Documentation

- [Angular Signals Best Practices](./angular-signals-best-practices.md) - Tab navigation pattern
- [API Configuration](./api-configuration.md) - Backend API integration
