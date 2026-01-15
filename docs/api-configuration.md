# API Configuration

This document covers API configuration, static assets, and backend patterns.

## API Configuration

All API endpoints use constants from `src/app/core/config/api.constants.ts`.

```typescript
import { buildApiUrl } from '../../../core/config/api.constants';
```

**Never hardcode API URLs.** Use environment variables via `constants.ts`.

## Static Assets (Images, Logos, etc.)

All static asset URLs (team logos, person photos, etc.) MUST use `buildStaticUrl()` function:

```typescript
import { buildStaticUrl } from '../../../core/config/api.constants';

// In component
teamLogoUrl(team: Team): string | null {
  return team.team_logo_url ? buildStaticUrl(team.team_logo_url) : null;
}
```

### Template Usage

**BAD - Direct URL binding:**

```html
<img [src]="team.team_logo_url" [alt]="team.title" />
```

**GOOD - Using buildStaticUrl:**

```html
@if (teamLogoUrl(team); as logoUrl) {
  <img [src]="logoUrl" [alt]="team.title" />
} @else {
  <div class="placeholder">No logo</div>
}
```

## PUT Endpoint Patterns

**All PUT endpoints use path parameters (`/{item_id}/`).**

### Teams Endpoint

```typescript
updateTeam(id: number, teamData: TeamUpdate): Observable<Team> {
  return this.apiService.put<Team>('/api/teams/', id, teamData, true).pipe(tap(() => this.reload()));
}
```

### Persons Endpoint

```typescript
updatePerson(id: number, personData: PersonUpdate): Observable<Person> {
  return this.apiService.put<Person>('/api/persons/', id, personData, true).pipe(tap(() => this.reload()));
}
```

### Tournaments Endpoint

Uses direct HttpClient:

```typescript
updateTournament(id: number, data: TournamentUpdate): Observable<Tournament> {
  return this.http.put<Tournament>(buildApiUrl(`/api/tournaments/${id}`), data).pipe(tap(() => this.reload()));
}
```

### Seasons Endpoint

```typescript
updateSeason(id: number, seasonData: SeasonUpdate): Observable<Season> {
  return this.apiService.put<Season>('/api/seasons/', id, seasonData, true).pipe(tap(() => this.reload()));
}
```

### Sports Endpoint

```typescript
updateSport(id: number, sportData: SportUpdate): Observable<Sport> {
  return this.apiService.put<Sport>('/api/sports/', id, sportData, true).pipe(tap(() => this.reload()));
}
```

## API Endpoint Reference

| Resource  | PUT Endpoint Pattern          | Frontend Usage (`usePathParam`) | Backend View Reference        |
| --------- | ---------------------------- | ---------------------------- | --------------------------- |
| Teams     | `PUT /api/teams/{id}/`       | `true`                       | `src/teams/views.py:103`   |
| Persons   | `PUT /api/persons/{id}/`     | `true`                       | `src/person/views.py`        |
| Tournaments| `PUT /api/tournaments/{id}/` | Path param in URL             | `src/tournaments/views.py`    |
| Seasons   | `PUT /api/seasons/{id}/`      | `true`                       | `src/seasons/views.py:54`   |
| Sports    | `PUT /api/sports/{id}/`       | `true`                       | `src/sports/views.py:41`    |

## Team-Tournament Relation Endpoints

### Available Teams for Tournament

Get teams in tournament's sport that are not yet added to the tournament.

```typescript
getAvailableTeamsForTournament(tournamentId: number): Observable<Team[]> {
  return this.http.get<Team[]>(buildApiUrl(`/api/tournaments/id/${tournamentId}/teams/available`));
}
```

**Backend Reference:** `src/tournaments/views.py` - `get_available_teams_for_tournament_endpoint`

### Add Team to Tournament

Create team-tournament relation using the special `{team_id}in{tournament_id}` pattern.

```typescript
addTeamToTournament(tournamentId: number, teamId: number): Observable<TeamTournament> {
  return this.apiService.post<TeamTournament>(`/api/team_in_tournament/${team_id}in${tournament_id}`, {});
}
```

**Backend Reference:** `src/team_tournament/views.py` - `create_team_tournament_relation_endpoint`

### Teams in Tournament

Get teams already added to a tournament.

```typescript
getTeamsByTournamentId(tournamentId: number): Observable<Team[]> {
  return this.http.get<Team[]>(buildApiUrl(`/api/team_in_tournament/tournament/id/${tournamentId}/teams`));
}
```

**Backend Reference:** `src/team_tournament/views.py` - `get_teams_in_tournament_endpoint`

## When Adding New PUT Endpoints

1. Always assume path parameters (`/{item_id}/`) pattern
2. Check backend view to verify:
   ```bash
   grep -A 5 "@router.put" ../statsboards-backend/src/<resource>/views.py
   ```

3. Use `usePathParam: true` in `apiService.put()` calls
4. Verify with backend API docs at http://localhost:9000/docs

## Backend API Documentation

Backend API documentation is available at:

- Interactive docs: http://localhost:9000/docs
- Backend codebase: ../statsboards-backend

Refer to these resources for:
- Available endpoints and their parameters
- Request/response schemas
- Authentication requirements
- Example requests

## Related Documentation

- [Service Patterns](./service-patterns.md) - Service patterns including httpResource vs rxResource
- [Code Style Guidelines](./code-style-guidelines.md) - Import order and organization
