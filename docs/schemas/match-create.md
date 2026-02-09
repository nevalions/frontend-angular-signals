# Match Create Page Schema

**Route**: `/sports/:sportId/matches/new`

```
┌─────────────────────────────────────────────────────────────┐
│                    ┌─────────────────┐                      │
│                    │    NAVBAR       │                      │
│                    └─────────────────┘                      │
└─────────────────────────────────────────────────────────────┘
                                                               │
┌─────────────────────────────────────────────────────────────┐
│  Create Match                              [Cancel] [Save] │
└─────────────────────────────────────────────────────────────┘
                                                               │
┌─────────────────────────────────────────────────────────────┐
│  Tournament *                                             │
│  [Select tournament ▼]                                    │
│                                                             │
│  Week *                                                    │
│  [Week number]                                            │
│                                                             │
│  Match Date *                                              │
│  [Date picker]                                            │
│                                                             │
│  Team A *                                                  │
│  [Select team ▼]                                          │
│                                                             │
│  Team B *                                                  │
│  [Select team ▼]                                          │
│                                                             │
  │  EESL ID                                                   │
  │  [EESL ID]                                                │
  │  [Update from EESL] (shown only when EESL ID exists and in edit mode) |
  └─────────────────────────────────────────────────────────────┘
  ```

## What's on the page

- Page title: "Create Match"
- "Cancel" button → Navigate back
- "Save" button → Submit form
- Form with:
  - Tournament dropdown (required)
  - Week number (required)
  - Match date picker (required)
  - Team A dropdown (required)
  - Team B dropdown (required, different from Team A)
  - EESL ID field (optional)

## What we need from backend

**To create match:**
- Tournament id
- Week number
- Match date
- Team A id
- Team B id
- Match EESL ID (optional)
- [Interface: `MatchCreate`](../../../src/app/features/matches/models/match.model.ts)
- [Backend Schema: `MatchSchemaCreate`](../../../../statsboards-backend/src/matches/schemas.py)
- **Backend API Endpoint:** `POST /api/matches/`

**To parse and update match from EESL (edit mode only):**
- Match EESL ID
- [Interface: `Match`](../../../src/app/features/matches/models/match.model.ts)
- [Backend Schema: `MatchSchema`](../../../../statsboards-backend/src/matches/schemas.py)
- **Backend API Endpoint:** `POST /api/matches/pars_and_create/match/{eesl_match_id}`
- Updates: match date, week, team IDs, and sponsor info from EESL source

**For tournaments dropdown:**
- Tournament id
- Tournament title
- Season id
- Sport id
- [Interface: `Tournament`](../../../src/app/features/tournaments/models/tournament.model.ts)
- [Backend Schema: `TournamentSchema`](../../../../statsboards-backend/src/tournaments/schemas.py)
- **Backend API Endpoint:** `GET /api/tournaments/paginated`

**For teams dropdown:**
- Team id
- Team title
- [Interface: `Team`](../../../src/app/features/teams/models/team.model.ts)
- [Backend Schema: `TeamSchema`](../../../../statsboards-backend/src/teams/schemas.py)
- **Backend API Endpoint:** `GET /api/teams/tournament/{tournament_id}/paginated`
