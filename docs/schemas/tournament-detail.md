# Tournament Detail Page Schema

**Route**: `/sports/:sportId/seasons/:year/tournaments/:id`

```
┌─────────────────────────────────────────────────────────────┐
│                    ┌─────────────────┐                      │
│                    │    NAVBAR       │                      │
│                    └─────────────────┘                      │
└─────────────────────────────────────────────────────────────┘
                                                               │
┌─────────────────────────────────────────────────────────────┐
│  ← Back            Tournament Title            [✏️ Edit]   │
│                                              [🗑️ Delete]   │
└─────────────────────────────────────────────────────────────┘
                                                               │
┌─────────────────────────────────────────────────────────────┐
│  [Matches] [Teams] [Players]                              │
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
  - Back button → Navigate to tournaments list in sport
  - Tournament title
  - Tournament logo (optional) - ⚠️ requires refactoring EntityHeaderComponent to support optional logo input
  - Edit button → Navigate to `/sports/:sportId/seasons/:year/tournaments/:id/edit`
  - Delete button → Confirm and delete tournament, navigate to tournaments list
- Tab navigation: Matches, Teams, Players
- Tab content area → Shows data for selected tab

## What we need from backend

**For tournament details:**

- Tournament id
- Tournament title
- Tournament description (optional)
- Tournament logo icon URL (optional)
- Season id
- Sport id
- [Interface: `Tournament`](../../../src/app/features/tournaments/models/tournament.model.ts)
- [Backend Schema: `TournamentSchema`](../../../../statsboards-backend/src/tournaments/schemas.py)
- **Backend API Endpoint:** `GET /api/tournaments/id/{tournament_id}/`
