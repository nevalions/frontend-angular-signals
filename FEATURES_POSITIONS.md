# Positions Feature

## Overview
Positions are player positions within a sport (e.g., Goalkeeper, Defender, Midfielder, Forward).

## Backend API

### Get Positions by Sport
```
GET /api/sports/id/{sportId}/positions
```
Returns all positions for a given sport.

### Create Position
```
POST /api/positions/
Content-Type: application/json

{
  "title": "Goalkeeper",
  "sport_id": 1
}
```

### Update Position
```
PUT /api/positions/{id}/
Content-Type: application/json

{
  "title": "Goalkeeper",
  "sport_id": 1
}
```

### Delete Position
```
DELETE /api/positions/id/{id}
```

## Frontend Implementation

### Files
- `src/app/features/sports/models/position.model.ts` - TypeScript interfaces
- `src/app/features/sports/services/position-store.service.ts` - Service for API calls
- `src/app/features/sports/components/detail/sport-detail.component.ts` - UI and state management

### Model
```typescript
export interface Position {
  id: number;
  title: string;
  sport_id: number;
}

export interface PositionCreate {
  title: string;
  sport_id: number;
}

export interface PositionUpdate {
  title?: string;
  sport_id?: number;
}
```

### Service Methods
- `getPositionsBySportId(sportId: number)` - Fetch all positions for a sport
- `createPosition(data: PositionCreate)` - Create new position
- `updatePosition(id: number, data: PositionUpdate)` - Update existing position
- `deletePosition(id: number)` - Delete position

### Component Features
- **Positions Tab** - Located in sport detail view under Positions tab
- **Search** - Client-side search by position title
- **Pagination** - Client-side pagination (10, 20, 50 items per page)
- **Create** - Modal form to add new positions
- **Edit** - Modal form to edit existing positions
- **Delete** - Delete with confirmation dialog

### State Management
All positions state is managed using Angular Signals:
- `positions` - Array of positions
- `positionsLoading` - Loading state
- `positionsError` - Error message
- `positionSearchQuery` - Search query
- `positionsCurrentPage` - Current page number
- `positionsItemsPerPage` - Items per page
- `filteredPositions` - Computed filtered list
- `paginatedPositions` - Computed paginated list
- `positionFormOpen` - Modal open state
- `editingPosition` - Currently editing position

### User Flow
1. Navigate to sport detail page
2. Click "Positions" tab
3. View list of positions
4. Search/filter positions (optional)
5. Navigate pages (optional)
6. Create new position via "Add Position" button
7. Edit existing position via edit icon
8. Delete position via trash icon with confirmation

## Testing
- Model tests: `src/app/features/sports/models/position.model.spec.ts` (9 tests)
- Service tests: `src/app/features/sports/services/position-store.service.spec.ts` (4 tests)

### Running Tests
```bash
npm run test:unit -- --run src/app/features/sports/models/position.model.spec.ts
npm run test:unit -- --run src/app/features/sports/services/position-store.service.spec.ts
```

## Design Patterns Used
- **Signals** - All state uses Angular signals (signal, computed, effect)
- **OnPush** - Component uses `ChangeDetectionStrategy.OnPush`
- **Standalone** - Service is standalone (no NgModules)
- **HttpClient** - Uses Angular HttpClient via ApiService
- **Modal Pattern** - Form in modal overlay for create/edit
- **Delete Confirmation** - Uses `withDeleteConfirm()` utility

## Related Features
- Sports
- Players (positions will be associated with players)
- Teams (positions will be associated with teams)
