# Sport Detail - Tournaments Tab

**Tab**: Tournaments
**Parent**: [Sport Detail](../sport-detail.md)

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  🔍 Search tournaments          [+ Add Tournament]        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                                                              │
┌─────────────────────────────────────────────────────────────┐
│  🏆                                                       │
│  TOURNAMENT NAME 1                                        │
│  Description (optional)                                   │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│  🏆                                                       │
│  TOURNAMENT NAME 2                                        │
│  Description (optional)                                   │
└─────────────────────────────────────────────────────────────┘
                                                              │
[Items per page: 10 20 50]           [< 1 2 3 >]
```

## What's on the tab

- Search field for tournaments
- "Add Tournament" button → Navigate to [Tournament Create](../tournament-create.md)
- List of tournament cards:
  - Tournament logo (if available) - Trophy icon (@tui.trophy) used as fallback
  - Tournament title
  - Description (optional)
  - Click to go to tournament detail

## What we need from backend

**For tournaments list:**
- Tournament id
- Tournament title
- Tournament description (optional)
- Tournament logo icon URL (optional) - display if available, otherwise use trophy icon as fallback
- Each tournament has season_id connection
- [Interface: `Tournament`](../../../src/app/features/tournaments/models/tournament.model.ts)
- [Backend Schema: `TournamentSchema`](../../../../statsboards-backend/src/tournaments/schemas.py)
- **Backend API Endpoint:** `GET /api/seasons/year/{year}/sports/id/{sport_id}/tournaments` (non-paginated, uses year from selected season and sport_id from route)

**Pagination metadata:**
- Total count
- Total pages
- Current page
- Items per page
