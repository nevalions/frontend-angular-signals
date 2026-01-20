# Match Players Tab Schema

**Tab**: Match Players
**Parent**: [Match Detail](../match-detail.md)

```
┌─────────────────────────────────────────────────────────────┐
│  🔍 Search players         [+ Add Player]    [✏️ Edit]    │
└─────────────────────────────────────────────────────────────┘
                                                                │
┌─────────────────────────────────────────────────────────────┐
│  [Team A]                                                    │
│  ┌────────────────────────────────────────────────────┐    │
│  │  #99  QB        John Smith    [✏️] [🗑️]        │    │
│  │  #84  WR        Mike Johnson   [✏️] [🗑️]        │    │
│  │  #75  TE        Chris Williams [✏️] [🗑️]        │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  [Team B]                                                    │
│  ┌────────────────────────────────────────────────────┐    │
│  │  #7   QB        Alex Brown     [✏️] [🗑️]        │    │
│  │  #11  WR        Tom Davis      [✏️] [🗑️]        │    │
│  │  #88  TE        Jake Miller    [✏️] [🗑️]        │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

## What's on the tab

- Search input → Filter players by name or number
- "Add Player" button → Show form to add player to match
- "Edit" button → Toggle inline edit mode for all players
- Players grouped by team (Team A and Team B)
- Each player card shows:
  - Player number
  - Position
  - Player name
  - Edit button → Open player edit dialog
  - Delete button → Confirm and remove player from match
- Click on player → Navigate to player detail

## What we need from backend

**For players in match list:**

- Player match id
- Player (id, person_id, player number, position)
- Team id
- Match id
- Starting status (is_starter)
- [Interface: `PlayerMatch`](../../../../src/app/features/matches/models/player-match.model.ts)
- [Backend Schema: `PlayerMatchSchema`](../../../../../statsboards-backend/src/player_match/schemas.py)
- **Backend API Endpoint:** `GET /api/players_match/` (filter by match_id)

**For adding player to match:**

- Player id
- Team id
- Match id
- Player number
- Position
- Starting status
- [Interface: `PlayerMatchCreate`](../../../../src/app/features/matches/models/player-match.model.ts)
- [Backend Schema: `PlayerMatchSchemaCreate`](../../../../../statsboards-backend/src/player_match/schemas.py)
- **Backend API Endpoint:** `POST /api/players_match/`

**For updating player in match:**

- Player match id
- Updated player number, position, starting status
- [Interface: `PlayerMatchUpdate`](../../../../src/app/features/matches/models/player-match.model.ts)
- [Backend Schema: `PlayerMatchSchemaUpdate`](../../../../../statsboards-backend/src/player_match/schemas.py)
- **Backend API Endpoint:** `PUT /api/players_match/id/{player_match_id}/`

**For deleting player from match:**

- Player match id
- **Backend API Endpoint:** `DELETE /api/players_match/id/{player_match_id}/`

**For player details:**

- Player (id, person_id, player number, position)
- Person (id, first_name, last_name)
- Team (id, title)
- **Backend API Endpoint:** `GET /api/players_match/id/{player_match_id}/full_data/`
