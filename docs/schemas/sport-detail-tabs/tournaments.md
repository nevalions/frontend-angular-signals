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
- "Add Tournament" button
- List of tournament cards:
  - Trophy icon
  - Tournament name
  - Description (optional)
  - Click to go to tournament detail
- Items per page selector (10, 20, 50)
- Pagination controls

## What we need from backend

**For tournaments list:**
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
