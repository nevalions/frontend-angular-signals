# Team Detail Page Schema

**Route**: `/sports/:sportId/teams/:teamId` OR `/sports/:sportId/seasons/:year/tournaments/:tournamentId/teams/:teamId`

```
┌─────────────────────────────────────────────────────────────┐
│                    ┌─────────────────┐                      │
│                    │    NAVBAR       │                      │
│                    └─────────────────┘                      │
└─────────────────────────────────────────────────────────────┘
                                                               │
┌─────────────────────────────────────────────────────────────┐
│  ← Back                Team Title              [✏️ Edit]   │
│                                              [🗑️ Delete]   │
└─────────────────────────────────────────────────────────────┘
                                                               │
┌─────────────────────────────────────────────────────────────┐
│  ┌──────────┐  City: [Team City]                           │
│  │          │                                              │
│  │  [Logo]  │  Team Color: [Color swatch] #HEX            │
│  │          │                                              │
│  └──────────┘  EESL ID: [EESL ID]                         │
│                Sponsor Line ID: [Sponsor Line ID]           │
│                Main Sponsor ID: [Main Sponsor ID]          │
│                                                             │
│                Description                                  │
│                [Team description...]                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                                                               │
┌─────────────────────────────────────────────────────────────┐
│  URLs                                                       │
│                                                             │
│  Logo URL: [Link to logo]                                   │
│  Logo Icon URL: [Link to logo icon]                         │
│  Logo Web URL: [Link to web logo]                           │
└─────────────────────────────────────────────────────────────┘
```

## What's on the page

- Entity header with:
  - Back button → Navigate back (sport detail or tournament detail depending on context)
  - Team title
  - Edit button → Navigate to edit page
  - Delete button → Only shown when not in tournament context
- Team information card:
  - Team logo
  - City (optional)
  - Team color with swatch (optional)
  - EESL ID (optional)
  - Sponsor Line ID (optional)
  - Main Sponsor ID (optional)
  - Description (optional)
- URLs card:
  - Logo URL (optional, clickable link)
  - Logo Icon URL (optional, clickable link)
  - Logo Web URL (optional, clickable link)

## What we need from backend

**For team details:**
- Team id
- Team title
- Team city (optional)
- Team description (optional)
- Team color (optional)
- Team EESL ID (optional)
- Sponsor line ID (optional)
- Main sponsor ID (optional)
- Team logo URL (optional)
- Team logo icon URL (optional)
- Team logo web URL (optional)
- Sport id
- [Interface: `Team`](../../../src/app/features/teams/models/team.model.ts)
- [Backend Schema: `TeamSchema`](../../../../statsboards-backend/src/teams/schemas.py)
- **Backend API Endpoint:** `GET /api/teams/id/{team_id}/`
