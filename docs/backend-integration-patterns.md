# Backend Integration Patterns

This document covers patterns for working with backend APIs, schema decisions, and common integration issues.

## Schema Strategy

### Mixed vs Nested Schemas

Backend provides different response schemas for different use cases. Understanding when to use each is critical for clean frontend code.

### Decision Matrix

| Scenario | Recommended Schema | Reasoning |
|----------|------------------|-------------|
| List/Grid View | Mixed (Flat) | Faster rendering, less data transformation |
| Detail Page | Mixed (Flat) or Nested | Depends on complexity of related data |
| Forms/Editing | Nested | Clear separation of concerns, easier validation |
| API for Mobile | Mixed (Flat) | Reduce payload size, fewer round trips |
| Public API | Mixed (Flat) | Simpler integration for consumers |

### Mixed Schema Naming Conventions

```
{BaseEntity}{WithDetails|WithPhotos|WithFullDetails|AndPhotos}

Examples:
- PlayerTeamTournamentWithDetails ← Flat, has player names, team/position titles
- PlayerTeamTournamentWithFullDetails ← Has nested team/tournament/position objects
- PlayerTeamTournamentWithDetailsAndPhotos ← Flat + photo fields
- TeamWithDetails ← Has league, season details
```

### Anti-Patterns to Avoid

#### 1. Deeply Nested Arrays in Mixed Schemas

**Bad:**
```typescript
PlayerWithDetails {
  player_team_tournaments[] {
    team { sport { ... } }  // Deep nesting
  }
}
```

**Good:**
```typescript
PlayerTeamTournamentWithDetails {
  team_title: string       // Flattened
  sport_title: string      // Flattened
}
```

#### 2. Duplicate Field Names

**Bad:**
```typescript
{
  id: 123,              // Player ID
  team: { id: 456 }     // Team ID - same field name!
}
```

**Good:**
```typescript
{
  player_id: 123,        // Clear prefix
  team_id: 456,         // Clear prefix
}
```

#### 3. Mixed Nesting Levels

**Bad:**
```typescript
{
  team: { id, title },
  position_title,         // Some nested, some flat
}
```

**Good:** Either all nested OR all flattened

## Ordering with Joined Tables

### Common Issue

When backend queries join multiple tables, ordering by fields from joined tables requires special handling.

### Problem Example

**Frontend Request:**
```typescript
httpParams.set('order_by', 'second_name');
```

**Backend Error (Logger):**
```
WARNING - Order column second_name not found for PlayerTeamTournamentDB,
         defaulting to player_number
```

### Root Cause

```python
# Backend only looks on primary model
order_expr = await self._get_column_with_fallback(
    PlayerTeamTournamentDB,  # ❌ second_name is on PersonDB
    'second_name',
    PlayerTeamTournamentDB.player_number  # Fallback used!
)
```

### Solution Pattern

Backend needs to maintain a field-to-model mapping for multi-table queries:

```python
ORDER_FIELD_MAPPING = {
    "id": PlayerTeamTournamentDB.id,
    "player_number": PlayerTeamTournamentDB.player_number,
    "first_name": PersonDB.first_name,        # From joined table
    "second_name": PersonDB.second_name,      # From joined table
    "team_title": TeamDB.title,              # From joined table
    "position_title": PositionDB.title,        # From joined table
}
```

### Frontend Implementation

```typescript
// Always send valid field names from backend's ORDER_FIELD_MAPPING
getTournamentPlayersPaginatedWithPhotos(
  tournamentId: number,
  orderBy: string = 'second_name',  // Must match backend mapping
  orderByTwo?: string               // Optional secondary sort
) {
  let httpParams = new HttpParams()
    .set('order_by', orderBy);

  if (orderByTwo) {
    httpParams = httpParams.set('order_by_two', orderByTwo);
  }
  // ...
}
```

### Testing Ordering

**Before implementing:**
1. Check backend logger for "defaulting to" warnings
2. Verify field names match backend's ORDER_FIELD_MAPPING
3. Test with empty datasets

**Common Order Fields:**
- `id` - Primary key
- `second_name` - Surname (most common)
- `first_name` - First name
- `player_number` - Jersey number
- `title` - Entity title (team, position, tournament)

## Static Assets Pattern

All static asset URLs (team logos, person photos, tournament logos) MUST use `buildStaticUrl()`:

### Component Implementation

```typescript
import { buildStaticUrl } from '../../../core/config/api.constants';

personPhotoIconUrl(player: Player): string | null {
  return player.person_photo_icon_url
    ? buildStaticUrl(player.person_photo_icon_url)
    : null;
}

teamLogoUrl(team: Team): string | null {
  return team.team_logo_icon_url
    ? buildStaticUrl(team.team_logo_icon_url)
    : null;
}

tournamentLogoUrl(tournament: Tournament): string | null {
  return tournament.tournament_logo_web_url
    ? buildStaticUrl(tournament.tournament_logo_web_url)
    : null;
}
```

### Template Usage

```html
<tui-avatar [src]="personPhotoIconUrl(player)" [round]="true"></tui-avatar>

@if (teamLogoUrl(team); as logoUrl) {
  <img [src]="logoUrl" [alt]="team.title" />
}
```

### Capitalization in Templates

Use `UpperCasePipe` for titles that should always display in uppercase:

```html
<p>Team: {{ player.team_title | uppercase }}</p>
<h3>{{ team.title | uppercase }}</h3>
```

**Remember to import:**
```typescript
import { UpperCasePipe } from '@angular/common';

@Component({
  imports: [UpperCasePipe, ...]
})
```

## Common Issues and Solutions

### Issue 1: Ordering Fallback to Default

**Symptom:** Data sorts by wrong field despite sending correct `order_by` parameter.

**Cause:** Field doesn't exist on backend's primary model (joined table field).

**Solution:**
1. Check backend logs for "defaulting to" warnings
2. Verify field name exists in backend's ORDER_FIELD_MAPPING
3. Create/update backend mapping if missing

### Issue 2: Missing Photo Fields

**Symptom:** Avatars show placeholders, `person_photo_url` is null.

**Cause:** Using endpoint that returns nested schema without photo fields.

**Solution:**
1. Use mixed schema endpoint with photos (e.g., `details-with-photos`)
2. Verify backend schema includes photo fields
3. Check `buildStaticUrl()` is applied to photo URLs

### Issue 3: Type Mismatches

**Symptom:** TypeScript errors, missing properties on response types.

**Cause:** Frontend type doesn't match backend schema version.

**Solution:**
1. Check backend OpenAPI docs at `http://localhost:9000/docs`
2. Update frontend interface to match backend schema
3. Use `| null` for optional fields

## Best Practices

### 1. Always Check OpenAPI Docs

Before integrating new endpoints:
```bash
curl http://localhost:9000/openapi.json | jq '.paths | keys[]'
curl http://localhost:9000/openapi.json | jq '.components.schemas | keys[]'
```

### 2. Prefer Mixed Schemas for List Views

- Use nested schemas only for detail pages or complex relationships
- Mixed schemas reduce frontend data transformation
- Better performance for paginated lists

### 3. Maintain Field Naming Consistency

- Backend: Use `_id` suffix for foreign keys (`team_id`, `player_id`)
- Frontend: Match backend naming in types and templates
- Avoid duplication (don't use `id` for multiple different entities)

### 4. Document Schema Decisions

When creating new endpoints:
1. Document why mixed vs nested was chosen
2. List all fields in the response
3. Note any special ordering requirements
4. Document filtering/search capabilities

### 5. Test with Real Data

- Test ordering with empty, single-item, and multi-item datasets
- Test pagination edge cases (first page, last page)
- Verify photo URLs resolve correctly with `buildStaticUrl()`

## Related Documentation

- [Service Patterns](./service-patterns.md) - Service patterns, mixed schemas
- [API Configuration](./api-configuration.md) - Static assets, endpoint patterns
- [Type Definitions](./type-definitions.md) - TypeScript conventions
- Backend OpenAPI Docs: http://localhost:9000/docs
