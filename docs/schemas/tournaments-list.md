# Tournaments List Page Schema

**Route**: `/sports/:sportId/seasons/:year/tournaments`

```
┌─────────────────────────────────────────────────────────────┐
│                    ┌─────────────────┐                      │
│                    │    NAVBAR       │                      │
│                    └─────────────────┘                      │
└─────────────────────────────────────────────────────────────┘
                                                               │
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                        Tournaments                          │
│                        Season: {year}                       │
│                                                             │
│   ┌──────────────────────────────────────────────────┐    │
│   │  [Tournament Title]                              │    │
│   │  [Logo]  Description (optional)                   │    │
│   │                                                  │    │
│   └──────────────────────────────────────────────────┘    │
│   ┌──────────────────────────────────────────────────┐    │
│   │  [Tournament Title 2]                            │    │
│   │  [Logo]  Description (optional)                   │    │
│   │                                                  │    │
│   └──────────────────────────────────────────────────┘    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                                                               │
┌─────────────────────────────────────────────────────────────┐
│           Add Tournament                                    │
└─────────────────────────────────────────────────────────────┘
```

## What's on the page

- Page title: "Tournaments" (with season year)
- Back button → Navigate to sport detail with tournaments list in selected year
- "Add Tournament" button → Navigate to `/sports/:sportId/seasons/:year/tournaments/new`
- List of tournament cards:
  - Tournament title
  - Tournament logo (optional)
  - Description (optional)
  - Click to go to tournament detail
- Pagination controls
- Items per page selector

## What we need from backend

**For tournaments list:**

- Tournament id
- Tournament title
- Tournament description (optional)
- Tournament logo icon URL (optional)
- [Interface: `Tournament`](../../../src/app/features/tournaments/models/tournament.model.ts)
- [Backend Schema: `TournamentSchema`](../../../../statsboards-backend/src/tournaments/schemas.py)
- **Backend API Endpoint:** `GET /api/tournaments/season/{season_year}/sport/{sport_id}/paginated`
