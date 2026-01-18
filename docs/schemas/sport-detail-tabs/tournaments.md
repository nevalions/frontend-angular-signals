# Sport Detail - Tournaments Tab

**Tab**: Tournaments

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

## What's on the page

- Search field for tournaments
<<<<<<< HEAD
- "Add Tournament" button
- List of tournament cards:
  - Trophy icon
  - Tournament name
  - Description (optional)
  - Click to go to tournament detail
- Items per page selector (10, 20, 50)
- Pagination controls
=======
- "Add Tournament" button → Navigate to [Tournament Create](../tournament-create.md)
- List of tournament cards:
  - Tournament logo (if available) - Trophy icon (@tui.trophy) used as fallback
  - Tournament title
  - Description (optional)
  - Click to go to tournament detail
>>>>>>> nevalions/staf-156-show-tournament-logo-in-sport-detail-tournaments-tab-instead

## What we need from backend

**For tournaments list:**
<<<<<<< HEAD
- Tournament id
- Tournament title
- Tournament description (optional)
- [Interface: `Tournament`](../../../src/app/features/tournaments/models/tournament.model.ts)
- [Backend Schema: `TournamentSchema`](../../../../statsboards-backend/src/tournaments/schemas.py)
- **Backend API Endpoint:** `GET /api/seasons/id/{season_id}/sports/id/{sport_id}/tournaments`
- **TODO:** Need paginated endpoint for tournaments by sport and season

**Pagination metadata:**
- Total count
- Total pages
- Current page
- Items per page
=======

- Tournament id
- Tournament title
- Tournament description (optional)
- Tournament logo icon URL (optional) - display if available, otherwise use trophy icon as fallback
- Each tournament has season_id connection
- [Interface: `Tournament`](../../../src/app/features/tournaments/models/tournament.model.ts)
- [Backend Schema: `TournamentSchema`](../../../../statsboards-backend/src/tournaments/schemas.py)
- **Backend API Endpoint:** `GET /api/seasons/id/{season_id}/sports/id/{sport_id}/tournaments` (non-paginated, uses season_id from selected season and sport_id from route)
>>>>>>> nevalions/staf-156-show-tournament-logo-in-sport-detail-tournaments-tab-instead
