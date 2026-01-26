# Tournament EESL Matches Parse Page Schema

**Route**: `/sports/:sportId/seasons/:year/tournaments/:id/parse-matches`

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
│  Parse and automatically create matches from       │
│  EESL tournament.                                        │
│                                                             │
│  EESL Tournament ID: 34                                    │
│                                                             │
│  [Parse and Create Matches]                                  │
│                                                             │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  Matches Created                                            │
│                                                             │
│  ┌─────────────────────────────────────────────┐         │
│  │ 📅 2024-01-15                             │         │
│  │    Team A: 5 vs Team B: 3                 │         │
│  │    Week 1                                   │         │
│  │    EESL ID: 123                            │         │
│  └─────────────────────────────────────────────┘         │
│                                                             │
│  ┌─────────────────────────────────────────────┐         │
│  │ 📅 2024-01-22                             │         │
│  │    Team A: 7 vs Team B: 2                 │         │
│  │    Week 2                                   │         │
│  │    EESL ID: 456                            │         │
│  └─────────────────────────────────────────────┘         │
│                                                             │
└─────────────────────────────────────────────────────┘
```

## What's on the page

- EntityHeader component:
   - Back button → Navigate to `/sports/:sportId/seasons/:year/tournaments/:id`
   - Title: Tournament title (e.g., "PREMIER LEAGUE") with fallback to "Parse EESL Tournament Matches"
   - Logo: Tournament logo icon URL (optional)
- Description text explaining the feature
- EESL Tournament ID display:
  - Shows tournament_eesl_id value
  - Only displayed if tournament has eesl_id
- Action button:
  - TuiButton with `appearance="primary"`
  - "Parse and Create Matches" button → Fetch matches from EESL API and create them in database in one step
  - Shows "Parsing and Creating..." while processing
  - Disabled when tournament has no eesl_id
- Created matches list:
  - Shows each match with match date or match number
  - Displays team A and team B IDs
  - Shows week number if available
  - Shows EESL ID if available
  - TuiIcon (`@tui.calendar`) as match icon
  - Only displayed after successful parse
  - No remove/selection controls (all matches are created)
- Success dialog:
  - TuiDialogService modal shows success message with match count
  - "Success" label, size 'm'
  - Auto-navigates back to `/sports/:sportId/seasons/:year/tournaments/:id` on dialog close

## What we need from backend

**For parsing and creating EESL tournament matches:**

- Tournament eesl_id (from tournament.tournament_eesl_id)
- List of match data from EESL API
- Each match contains:
  - match_eesl_id
  - match_date (optional)
  - week (optional)
  - team_a_id
  - team_b_id
- Backend creates:
  - Matches in database
- Returns: List of created matches with full Match objects (including id)
- **Backend API Endpoint:** `GET /api/matches/pars_and_create/tournament/{eesl_tournament_id}` (where eesl_tournament_id is tournament.tournament_eesl_id)

**Note:** The backend returns a list of created matches with their database IDs.

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

- `GET /api/matches/pars_and_create/tournament/{eesl_tournament_id}` - Verified in `/statsboards-backend/src/matches/parser_router.py`
- `GET /api/tournaments/id/{tournament_id}/` - Standard BaseRouter endpoint
- `GET /api/sports/id/{sport_id}/` - Standard BaseRouter endpoint
- `GET /api/seasons/` - Standard BaseRouter endpoint
