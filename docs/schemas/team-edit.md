# Team Edit Page Schema

**Route**: `/sports/:sportId/teams/:teamId/edit`

```
┌─────────────────────────────────────────────────────────────┐
│                    ┌─────────────────┐                      │
│                    │    NAVBAR       │                      │
│                    └─────────────────┘                      │
└─────────────────────────────────────────────────────────────┘
                                                               │
┌─────────────────────────────────────────────────────────────┐
│  Edit Team                                 [Cancel] [Save] │
└─────────────────────────────────────────────────────────────┘
                                                               │
┌─────────────────────────────────────────────────────────────┐
│  Title *                                                   │
│  [Team title]                                             │
│                                                             │
│  City                                                      │
│  [Team city]                                              │
│                                                             │
│  Description                                               │
│  [Team description]                                       │
│  [                                                  ]       │
│  [                                                  ]       │
│  [                                                  ]       │
│  [                                                  ]       │
│                                                             │
│  Team Color                                                │
│  [Color picker]                                           │
│                                                             │
  │  EESL ID                                                   │
  │  [EESL ID]                                                │
  │  [Update from EESL] (shown only when EESL ID exists)    │
  │                                                             │
│  Sponsor Line ID                                           │
│  [Sponsor Line ID]                                        │
│                                                             │
│  Main Sponsor ID                                           │
│  [Main Sponsor ID]                                        │
│                                                             │
│  Team Logo URL                                             │
│  [https://example.com/logo.png]                            │
│                                                             │
│  Team Logo Icon URL                                        │
│  [https://example.com/icon.png]                           │
│                                                             │
│  Team Logo Web URL                                         │
│  [https://example.com/web-logo.png]                        │
└─────────────────────────────────────────────────────────────┘
```

## What's on the page

- Page title: "Edit Team"
- "Cancel" button → Navigate to team detail
- "Save" button → Submit form
- Form with:
  - Title field (required, pre-filled)
  - City field (optional, pre-filled)
  - Description field (optional, 4 rows, pre-filled)
  - Team color picker (optional, pre-filled)
  - EESL ID field (optional, pre-filled)
  - Sponsor Line ID field (optional, pre-filled)
  - Main Sponsor ID field (optional, pre-filled)
  - Team Logo URL field (optional, pre-filled)
  - Team Logo Icon URL field (optional, pre-filled)
  - Team Logo Web URL field (optional, pre-filled)

## What we need from backend

**To get team data for editing:**
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

**To update team:**
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
- [Interface: `TeamUpdate`](../../../src/app/features/teams/models/team.model.ts)
  - [Backend Schema: `TeamSchemaUpdate`](../../../../statsboards-backend/src/teams/schemas.py)
  - **Backend API Endpoint:** `PUT /api/teams/id/{team_id}/`

  **To parse and update team from EESL:**
  - Team EESL ID
  - [Interface: `Team`](../../../src/app/features/teams/models/team.model.ts)
  - [Backend Schema: `TeamSchema`](../../../../statsboards-backend/src/teams/schemas.py)
  - **Backend API Endpoint:** `POST /api/teams/pars_and_create/team/{eesl_team_id}`
  - Updates: title, city, description, team color, and logo URLs from EESL source

