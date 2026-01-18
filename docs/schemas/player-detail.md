# Player Detail Page Schema

**Route**: `/sports/:sportId/players/:playerId` (sport context) OR
`/sports/:sportId/seasons/:year/tournaments/:tournamentId/players/:playerId` (tournament context)

## Context-Based Rendering

**⚠️ This is a complex schema with context-based rendering:**

- Sport context: Shows career/history by team and tournament
- Tournament context: Shows inline editable team, number, and position fields

### Tournament Context

```
┌─────────────────────────────────────────────────────────────┐
│                    ┌─────────────────┐                      │
│                    │    NAVBAR       │                      │
│                    └─────────────────┘                      │
└─────────────────────────────────────────────────────────────┘
                                                               │
┌─────────────────────────────────────────────────────────────┐
│  ← Back                Player Name               [✏️ Edit]   │
│                                              [⋮ Menu]       │
└─────────────────────────────────────────────────────────────┘
                                                               │
┌─────────────────────────────────────────────────────────────┐
│  TOURNAMENT TITLE                                          │
│  ┌────────────────────────────────────────────────────┐    │
│  │  ┌─────────┐  Team: [Team Name]        [✏️]       │    │
│  │  │         │                                    │    │
│  │  │ [Photo] │  Player Number: #99         [✏️]       │    │
│  │  │         │                                    │    │
│  │  └─────────┘  Position: [Position]        [✏️]       │    │
│  │                                                   │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### Sport Context

```
┌─────────────────────────────────────────────────────────────┐
│                    ┌─────────────────┐                      │
│                    │    NAVBAR       │                      │
│                    └─────────────────┘                      │
└─────────────────────────────────────────────────────────────┘
                                                               │
┌─────────────────────────────────────────────────────────────┐
│  ← Back                Player Name               [🗑️ Delete]│
│                                              [⋮ Menu]       │
└─────────────────────────────────────────────────────────────┘
                                                               │
┌─────────────────────────────────────────────────────────────┐
│  ┌─────────┐                                                │
│  │         │  Career by Team                                │
│  │ [Photo] │                                                │
│  │         │  ┌────────────────────────────────────────┐   │
│  └─────────┘  │ TEAM NAME                            │   │
│              │                                      │   │
│              │ • Position: Forward, #99              │   │
│              │ • Position: Midfield, #10             │   │
│              │                                      │   │
│              └────────────────────────────────────────┘   │
│                                                            │
│              ┌────────────────────────────────────────┐   │
│              │ TEAM NAME 2                          │   │
│              │                                      │   │
│              │ • Position: Forward, #11              │   │
│              │                                      │   │
│              └────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                                                               │
┌─────────────────────────────────────────────────────────────┐
│  Career by Tournament                                      │
│  ┌────────────────────────────────────────────────────┐    │
│  │ TOURNAMENT NAME                                     │    │
│  │                                                      │    │
│  │ Team: TEAM NAME                                     │    │
│  │ Position: Forward                                   │    │
│  │ Number: #99                                         │    │
│  │                                                      │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

## What's on the page

### Common elements (both contexts)

- Entity header with:
  - Back button → Navigate back (to originating context)
  - Player name (SECOND, First format)
  - Edit button (sport context only) → Navigate to edit person
  - Delete button (sport context only)
  - Custom menu items
- Player photo avatar

### Tournament context specific

- Tournament title display
- Inline editable fields:
  - Team assignment (dropdown with save/cancel)
  - Player number (inline edit with save/cancel)
  - Position (dropdown with save/cancel)

### Sport context specific

- Career by Team section
- Career by Tournament section

## What we need from backend

**For player in sport context details:**

- Player id
- Player number (optional)
- Person id
- Person first name
- Person second name
- Person photo URL (optional)
- Player EESL ID (optional)
- Sport id
- Person object with full details
- Sport object with full details
- Player team tournament assignments list
- [Interface: `PlayerWithFullDetails`](../../../src/app/features/players/models/player.model.ts:108-118)
- [Backend Schema: `PlayerWithFullDetailsSchema`](../../../../statsboards-backend/src/player/schemas.py:57-62)
- **Backend API Endpoint:** `GET /api/players/paginated-full-details` (filter by player_id via search or direct lookup)

**For tournament context assignment:**

- Tournament id
- Tournament title
- Tournament year (from season)
- Team id
- Team title
- Position id
- Position title
- Player number
- Player team tournament EESL ID (optional)
- Person first name
- Person second name
- Person photo URL (optional)
- Player EESL ID (optional)
- Sport id
- Person object with full details
- Sport object with full details
- Tournament assignment details
- Career by team and tournament data
- [Interface: `PlayerDetailInTournamentResponse`](../../../src/app/features/players/models/player.model.ts:128-158)
- [Backend Schema: `PlayerDetailInTournamentResponse`](../../../../statsboards-backend/src/player/schemas.py:130-141)
- **Backend API Endpoint:** `GET /api/players/id/{player_id}/tournament/{tournament_id}`

**For tournament context teams dropdown:**

- Team id
- Team title
- Team city (optional)
- Team logo icon URL (optional)
- [Interface: `Team`](../../../src/app/features/teams/models/team.model.ts)
- [Backend Schema: `TeamSchema`](../../../../statsboards-backend/src/teams/schemas.py:42-45)
- **Backend API Endpoint:** `GET /api/tournaments/id/{tournament_id}/teams/paginated`

**For tournament context positions dropdown:**

- Position id
- Position title
- Sport id
- [Interface: `Position`](../../../src/app/features/positions/models/position.model.ts)
- [Backend Schema: `PositionSchema`](../../../../statsboards-backend/src/positions/schemas.py)
- **Backend API Endpoint:** `GET /api/positions/sport/{sport_id}/paginated`

**For sport context career by team and tournament:**

- Career by team:
  - Team id
  - Team title
  - Assignments list (position title, player number)
- Career by tournament:
  - Tournament id
  - Tournament title
  - Season id
  - Season year
  - Assignments list (team title, position title, player number)
- [Interface: `PlayerCareer`](../../../src/app/features/players/models/player.model.ts:123-126)
  - `CareerByTeam`: line 160-164
  - `CareerByTournament`: line 166-172
- [Backend Schema: `PlayerCareerResponseSchema`](../../../../statsboards-backend/src/player/schemas.py:108-112)
  - `CareerByTeamSchema`: line 90-95
  - `CareerByTournamentSchema`: line 98-105
- **Backend API Endpoint:** `GET /api/players/id/{player_id}/career`

**For updating tournament assignment:**

- Player team tournament id
- Team id (optional)
- Position id (optional)
- Player number (optional)
- [Backend Schema: `PlayerTeamTournamentSchemaUpdate`](../../../../statsboards-backend/src/player_team_tournament/schemas.py:19)
- **Backend API Endpoint:** `PUT /api/player-team-tournament/{item_id}/`
