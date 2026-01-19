# Tournament EESL Teams Parse Page Schema

**Route**: `/sports/:sportId/seasons/:year/tournaments/:id/parse-eesl`

```
┌─────────────────────────────────────────────────────┐
│                    ┌─────────────────┐                      │
│                    │    NAVBAR       │                      │
│                    └─────────────────┘                      │
└─────────────────────────────────────────────────────┘

 ┌─────────────────────────────────────────────────────┐
  │  ← Back          TOURNAMENT TITLE (or "Parse EESL")       │
  └─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│                                                             │
│  Parse and automatically create teams from       │
│  EESL tournament.                                        │
│                                                             │
│  EESL Tournament ID: 34                                    │
│                                                             │
│  [Parse and Create Teams]                                    │
│                                                             │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  Teams Created                                            │
│                                                             │
│  ┌─────────────────────────────────────────────┐         │
│  │ 👥 Team Name                              │         │
│  │    EESL ID: 123                             │         │
│  └─────────────────────────────────────────────┘         │
│                                                             │
│  ┌─────────────────────────────────────────────┐         │
│  │ 👥 Another Team Name                       │         │
│  │    EESL ID: 456                             │         │
│  └─────────────────────────────────────────────┘         │
│                                                             │
└─────────────────────────────────────────────────────┘
```

## What's on the page

- EntityHeader component:
   - Back button → Navigate to `/sports/:sportId/seasons/:year/tournaments/:id`
   - Title: Tournament title (e.g., "PREMIER LEAGUE") with fallback to "Parse EESL Tournament Teams"
   - Logo: Tournament logo icon URL (optional)
- Description text explaining to feature
- EESL Tournament ID display:
  - Shows tournament_eesl_id value
  - Only displayed if tournament has eesl_id
- Action button:
  - TuiButton with `appearance="primary"`
  - "Parse and Create Teams" button → Fetch teams from EESL API and create them in database in one step
  - Shows "Parsing and Creating..." while processing
  - Disabled when tournament has no eesl_id
- Created teams list:
  - Shows each team with title and EESL ID
  - TuiIcon (`@tui.users`) as team icon
  - Only displayed after successful parse
  - No remove/selection controls (all teams are created)
- Success dialog:
  - TuiDialogService modal shows success message with team count
  - "Success" label, size 'm'
  - Auto-navigates back to `/sports/:sportId/seasons/:year/tournaments/:id` on dialog close

## What we need from backend

**For parsing and creating EESL tournament teams:**

- Tournament eesl_id (from tournament.tournament_eesl_id)
- List of team data from EESL API
- Each team contains:
  - team_eesl_id
  - title
  - description (optional)
  - logo_url (optional)
- Backend creates:
  - Teams in database
  - Team-tournament connections (linking created teams to the tournament)
- Returns: List of created teams with full Team objects (including id)
- **Backend API Endpoint:** `POST /api/teams/pars_and_create/tournament/{eesl_tournament_id}` (where eesl_tournament_id is tournament.tournament_eesl_id)

**Note:** The backend returns a tuple `[teams, team_tournament_ids]` but frontend only uses the teams array.

**For tournament context:**

- Tournament id (from route parameter `:id`)
- Tournament title
- Tournament logo icon URL (optional)
- Tournament eesl_id (required for parsing)
- [Interface: `Tournament`](../../../src/app/features/tournaments/models/tournament.model.ts)
- [Backend Schema: `TournamentSchema`](../../../../statsboards-backend/src/tournaments/schemas.py)
- **Backend API Endpoint:** `GET /api/tournaments/id/{tournament_id}/`

**For sport context:**

- Sport id (from route parameter `:sportId`)
- Sport title
- [Interface: `Sport`](../../../src/app/features/sports/models/sport.model.ts)
- [Backend Schema: `SportSchema`](../../../../statsboards-backend/src/sports/schemas.py)
- **Backend API Endpoint:** `GET /api/sports/id/{sport_id}/`

**For season context:**

- Season year (from route parameter `:year`)
- Season ID (derived from season year)
- [Interface: `Season`](../../../src/app/features/seasons/models/season.model.ts)
- [Backend Schema: `SeasonSchema`](../../../../statsboards-backend/src/seasons/schemas.py)
- **Backend API Endpoint:** `GET /api/seasons/`

## Backend Endpoint Verification

All endpoints exist in backend:

- `POST /api/teams/pars_and_create/tournament/{eesl_tournament_id}` - Verified in `/statsboards-backend/src/teams/views.py:254`
- `GET /api/tournaments/id/{tournament_id}/` - Standard BaseRouter endpoint
- `GET /api/sports/id/{sport_id}/` - Standard BaseRouter endpoint
- `GET /api/seasons/` - Standard BaseRouter endpoint
