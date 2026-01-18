# Tournament Players Tab Schema

**Tab**: Players
**Parent**: [Tournament Detail](../tournament-detail.md)

```
┌─────────────────────────────────────────────────────────────┐
│  🔍 Search players            [⬆️⬇️] Sort by Name  [+ Player]│
└─────────────────────────────────────────────────────────────┘
                                                               │
┌─────────────────────────────────────────────────────────────┐
│  ┌────────────────────────────────────────────────────┐    │
│  │  [Avatar]                                           │    │
│  │  SECOND, First                                      │    │
│  │  EESL ID: 12345                                     │    │
│  │  Team: TEAM NAME                                    │    │
│  │  Position: Forward                                  │    │
│  │  #99                                               │    │
│  │                                                      │    │
│  └────────────────────────────────────────────────────┘    │
│  ┌────────────────────────────────────────────────────┐    │
│  │  [Avatar]                                           │    │
│  │  SMITH, John                                        │    │
│  │  EESL ID: 12346                                     │    │
│  │  Team: TEAM NAME                                    │    │
│  │  Position: Midfield                                 │    │
│  │  #10                                               │    │
│  │                                                      │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                                                               │
┌─────────────────────────────────────────────────────────────┐
│  Items per page: [10] [25] [50]                    1/5     │
└─────────────────────────────────────────────────────────────┘
```

**Add Player Dialog (when open):**

```
┌─────────────────────────────────────────────────────────────┐
│  Add Player to Tournament                         [✕]      │
├─────────────────────────────────────────────────────────────┤
│  🔍 Search available players                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  [Avatar] NAME, Second                    ●      │    │
│  │  EESL ID: 12345                                   │    │
│  └────────────────────────────────────────────────────┘    │
│  ┌────────────────────────────────────────────────────┐    │
│  │  [Avatar] SMITH, John                                   │
│  │  EESL ID: 12346                                   │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
│                       [Cancel] [Add Player]               │
└─────────────────────────────────────────────────────────────┘
```

## What's on the tab

- Search input → Filter players by name
- Sort button → Toggle sort order (name)
- "Add Player" button → Open add player dialog
- List of player cards:
  - Player photo avatar (or initials)
  - Player name (SECOND, First format)
  - Player EESL ID (optional)
  - Team assignment (optional)
  - Position (optional)
  - Player number (optional)
  - Click to go to player detail
- Pagination controls
- Items per page selector

- Add player dialog (when open):
  - Search input → Filter available players by name
  - List of available players in sport (not already in current tournament)
  - Select player (radio button selection)
  - "Cancel" button → Close dialog
  - "Add Player" button → Add selected player to tournament

## What we need from backend

**For players list:**
**TODO** mark it as complex schema

- Player id
- Player number (optional)
- Player EESL ID (optional)
- Player team tournament EESL ID (optional)
- Person id
- Person first name
- Person second name
- Person photo URL (optional)
- Team id (optional)
- Team title (optional)
- Position id (optional)
- Position title (optional)
  **TODO** its complex model check schema and interface
- [Interface: `Player`](../../../../src/app/features/players/models/player.model.ts)
- [Backend Schema: `PlayerTournamentSchema`](../../../../../statsboards-backend/src/players/schemas.py)
- **Backend API Endpoint:** `GET /api/players/tournament/{tournament_id}/paginated`

**Query params:**

- `search`: Search by name
- `page`: Page number
- `page_size`: Items per page
- `sort`: Sort field (name)
- `sort_order`: asc or desc

**For available players dropdown (add player):**
**TODO** mark it as complex schema

- Player id
- Player EESL ID (optional)
- Person id
- Person first name
- Person second name
- Person photo URL (optional)
  **TODO** its complex model check schema and interface
- [Backend API Endpoint:\*\* `GET /api/players/sport/{sport_id}/available-for-tournament/{tournament_id}`

**To add player to tournament:**

- Player id
- Tournament id
- Team id (optional)
- Position id (optional)
- Player number (optional)
- [Backend Schema: `PlayerTournamentAssignmentCreate`](../../../../../statsboards-backend/src/players/schemas.py)
- **Backend API Endpoint:** `POST /api/tournaments/{tournament_id}/players/`

## TODO

- Verify backend endpoint exists for available players for tournament
- Verify backend endpoint exists for adding player to tournament
