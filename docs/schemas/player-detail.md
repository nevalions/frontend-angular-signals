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
**TODO** its complex model, recheck what we must use here, simple playerSchema doesnot have names

- Player id
- Player number (optional)
- Person id
- Person first name
- Person second name
- Person photo URL (optional)
- Player EESL ID (optional)
- Sport id
- [Interface: `Player`](../../../src/app/features/players/models/player.model.ts)
- [Backend Schema: `PlayerSchema`](../../../../statsboards-backend/src/players/schemas.py)
- **Backend API Endpoint:** `GET /api/players/id/{player_id}/`

**For tournament context assignment:**

- Tournament id
- Tournament title
- Team id
- Team title
- Position id
- Position title
- Player team tournament EESL ID (optional)
- Person first name
- Person second name
- Person photo URL (optional)
- Player EESL ID (optional)
- [Interface: `PlayerTournamentAssignment`](../../../src/app/features/players/models/player.model.ts)
  **TODO** We need to find in backend schema and endpoint for it or create

**For tournament context teams dropdown:**

- Team id
- Team title
- [Interface: `Team`](../../../src/app/features/teams/models/team.model.ts)
- [Backend Schema: `TeamSchema`](../../../../statsboards-backend/src/teams/schemas.py)
- **Backend API Endpoint:** `GET /api/teams/tournament/{tournament_id}/paginated`

**For tournament context positions dropdown:**

- Position id
- Position title
- Sport id
- [Interface: `Position`](../../../src/app/features/positions/models/position.model.ts)
- [Backend Schema: `PositionSchema`](../../../../statsboards-backend/src/positions/schemas.py)
- **Backend API Endpoint:** `GET /api/positions/sport/{sport_id}/paginated`

**For sport context career by team:**

- Team id
- Team title
- Assignments (position title, player number)
  **TODO** We need to find in backend schema and in frontend interface
- [Backend API Endpoint:\*\* `GET /api/player-team-assignments/player/{player_id}/`

**For sport context career by tournament:**

- Tournament id
- Tournament title
- Team title
- Position title
- Player number
  **TODO** We need to find in backend schema and in frontend interface
- [Backend API Endpoint:\*\* `GET /api/player-tournament-assignments/player/{player_id}/`

## TODO

- Verify backend endpoints exist for player career data
- Verify assignment update endpoints exist for tournament context
