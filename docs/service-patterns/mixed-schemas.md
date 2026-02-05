# Mixed Schemas Pattern

Backend may provide mixed schemas that flatten data from multiple related entities into a single response object.

## When to Use Mixed Schemas

Use mixed schemas when:

- Displaying list/grid views that need all related data in a single object
- Performance-critical views where avoiding nested lookups is important
- UI components that display fields from multiple related entities (Player + Person + Team + Position)
- Paginated endpoints for list/detail views

Use nested schemas when:

- API endpoints return complete entity graphs
- Related entities have their own rich details
- Client needs to access related entity data independently

## Example: Player in Tournament

Mixed schema (flat):

```typescript
// PlayerTeamTournamentWithDetailsAndPhotos
interface PlayerTeamTournamentWithDetailsAndPhotos {
  id: number;
  player_id: number;
  first_name: string;       // Flattened from Person
  second_name: string;      // Flattened from Person
  team_title: string;       // Flattened from Team
  position_title: string;   // Flattened from Position
  person_photo_url: string; // Flattened from Person
  team_id: number;
  position_id: number;
  // All fields in one flat object - easy to use in templates
}
```

Nested schema:

```typescript
// PlayerWithFullDetails
interface PlayerWithFullDetails {
  id: number;
  person: Person {          // Nested object
    first_name: string;
    second_name: string;
    person_photo_url: string;
  };
  player_team_tournaments: PlayerTeamTournament[]; // Nested array
}
```

## Service Usage

```typescript
getTournamentPlayersPaginatedWithPhotos(
  tournamentId: number,
  page: number,
  itemsPerPage: number,
  ascending: boolean = true,
  search: string = '',
  orderBy: string = 'second_name',
  orderByTwo?: string
): Observable<PaginatedPlayerTeamTournamentWithDetailsAndPhotosResponse> {
  let httpParams = new HttpParams()
    .set('page', page.toString())
    .set('items_per_page', itemsPerPage.toString())
    .set('ascending', ascending.toString())
    .set('order_by', orderBy);

  if (search) {
    httpParams = httpParams.set('search', search);
  }

  if (orderByTwo) {
    httpParams = httpParams.set('order_by_two', orderByTwo);
  }

  return this.http.get<PaginatedPlayerTeamTournamentWithDetailsAndPhotosResponse>(
    buildApiUrl(`/api/players_team_tournament/tournament/${tournamentId}/players/paginated/details-with-photos`),
    { params: httpParams }
  );
}
```

## Component Usage

```typescript
// Simplified - no data transformation needed
loadPlayers(): void {
  this.playerStore.getTournamentPlayersPaginatedWithPhotos(
    this.tournamentId(),
    this.page(),
    this.itemsPerPage(),
    this.sortOrder() === 'asc',
    this.search()
  ).subscribe({
    next: (response) => {
      this.players.set(response.data || []);
      this.totalCount.set(response.metadata.total_items);
    }
  });
}
```

## Benefits of Mixed Schemas

- Reduced frontend complexity (no data transformation)
- Fewer API calls (all data in one response)
- Simpler templates (direct property access)
- Better performance for list views

## Naming Conventions

Mixed schemas typically use these suffixes:

- `WithDetails` - Base related fields (titles, IDs)
- `WithPhotos` - Includes photo/icon URLs
- `WithFullDetails` - Complete nested objects

## Related Documentation

- [Type Definitions](../type-definitions.md)
- [Backend Integration Patterns](../backend-integration-patterns.md)
- [Canonical Service Pattern](./canonical-service-pattern.md)
