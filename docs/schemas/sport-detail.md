# Sport Detail Page Schema

**Route**: `/sports/:id`

```
┌─────────────────────────────────────────────────────────────┐
│                    ┌─────────────────┐                      │
│                    │    NAVBAR       │                      │
│                    └─────────────────┘                      │
└─────────────────────────────────────────────────────────────┘
                                                              │
┌─────────────────────────────────────────────────────────────┐
│  ← Back                Sport Name              [✏️ Edit]   │
│                                              [🗑️ Delete]   │
└─────────────────────────────────────────────────────────────┘
                                                              │
┌─────────────────────────────────────────────────────────────┐
│  [Tournaments] [Teams] [Players] [Positions]   Season: ▼  │
└─────────────────────────────────────────────────────────────┘
                                                              │
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                    Tab Content Here                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## What's on the page

- Entity header with:
<<<<<<< HEAD
  - Back button
  - Sport title
  - Edit button
  - Delete button
- Tab navigation: Tournaments, Teams, Players, Positions
- Season dropdown selector
- Tab content area
=======
  - Back button → Navigate to `/sports`
  - Sport title
  - Edit button → Navigate to `/sports/:id/edit`
  - Delete button → Confirm and delete sport, navigate to `/sports`
- Tab navigation: Tournaments, Teams, Players, Positions
- Season dropdown selector → Updates `?year={season_year}` query param, refreshes tab content
- Tab content area → Shows data for selected season
>>>>>>> nevalions/staf-156-show-tournament-logo-in-sport-detail-tournaments-tab-instead

## What we need from backend

**For sport details:**
- Sport id
- Sport title
- Sport description (optional)
- [Interface: `Sport`](../../../src/app/features/sports/models/sport.model.ts)
- [Backend Schema: `SportSchema`](../../../../statsboards-backend/src/sports/schemas.py)
- **Backend API Endpoint:** `GET /api/sports/id/{sport_id}/`

**For seasons dropdown:**
- Season id
- Season year
- [Interface: `Season`](../../../src/app/features/seasons/models/season.model.ts)
- [Backend Schema: `SeasonSchema`](../../../../statsboards-backend/src/seasons/schemas.py)
- **Backend API Endpoint:** `GET /api/seasons/paginated`
