# Match Detail Page Schema

**Route**: `/sports/:sportId/matches/:id`

```
┌─────────────────────────────────────────────────────────────┐
│                    ┌─────────────────┐                      │
│                    │    NAVBAR       │                      │
│                    └─────────────────┘                      │
└─────────────────────────────────────────────────────────────┘
                                                                │
┌─────────────────────────────────────────────────────────────┐
│  ← Back              Match Title             [✏️ Edit]   │
│                                              [🗑️ Delete]   │
└─────────────────────────────────────────────────────────────┘
                                                                │
┌─────────────────────────────────────────────────────────────┐
│  [Team A Logo]      [Score]      [Team B Logo]             │
│     TEAM A            12-7             TEAM B               │
│                                                          │
│  Date: Jan 15, 2025  |  Week: 1  |  Tournament: EESL     │
│                                                          │
│  [Scoreboard Admin]  [Scoreboard View]  [QR]             │
└─────────────────────────────────────────────────────────────┘
                                                                │
┌─────────────────────────────────────────────────────────────┐
│  [Match Players] [Events] [Stats]                          │
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
  - Back button → Navigate to tournament detail with matches tab (if tournament context), otherwise sport detail or home
  - Match title (e.g., "Team A vs Team B")
  - Edit button → Navigate to `/matches/:id/edit`
  - Delete button → Confirm and delete match, navigate to tournament detail with matches tab

- Main match data section:
  - Team A logo and name
  - Current score (Team A - Team B)
  - Team B logo and name
  - Match date
  - Week number (if available)
  - Tournament name with link → Navigate to tournament detail
  - "Scoreboard Admin" button → Navigate to `/scoreboard/match/:id/admin`
  - "Scoreboard View" button → Navigate to `/scoreboard/match/:id/hd`
  - QR code image with absolute URL to current match detail page (`/sports/:sportId/matches/:id`)

 - Tab navigation: Match Players, Events, Stats
- Tab content area → Shows data for selected tab
- Connection indicator → Shows WebSocket connection status (Good/Fair/Poor/Connecting)
 
## Real-time Updates (WebSocket)

**WebSocket Integration:**

- Page automatically connects to WebSocket on load
- Real-time updates for:
  - **Match Data**: Score, quarter, down, distance (instant updates)
  - **Teams**: Logos, names, colors (instant updates)
  - **Players**: Roster changes, starter toggles, player details (instant updates)
  - **Events**: Touchdowns, penalties, turnovers (instant updates)
  - **Statistics**: Team stats, offense stats, QB stats, defense stats (instant updates)
- Connection indicator shows current connection quality
- Disconnects automatically when navigating away
- Reconnects cleanly on page refresh

**Score Changes via WebSocket:**

**Score Update Flow:**
1. User adds touchdown/field goal event → Backend updates match_data score (score_team_a, score_team_b)
2. Database trigger fires → PostgreSQL sends notification to backend
3. Backend sends `match-update` WebSocket message with updated match_data (full MatchData object)
4. WebSocket service updates `matchDataPartial` signal
5. `wsMatchDataPartialEffect` merges update into `comprehensiveData.match_data`
6. `scoreDisplay` computed property recalculates → Score updates instantly on page

**Triggered By:**
- **Touchdown event added** → Updates score_team_a or score_team_b (+7 points)
- **Field goal event added** → Updates score_team_a or score_team_b (+3 points)
- **Extra point successful** → Updates score_team_a or score_team_b (+1 point)
- **Two-point conversion successful** → Updates score_team_a or score_team_b (+2 points)
- **Safety** → Updates score_team_a or score_team_b (+2 points)
- **Manual score edit** → Direct update of score_team_a or score_team_b

**Score Display:**
- Score displayed in header: `${score_team_a}:${score_team_b}` (computed property)
- Updates instantly via WebSocket `match-update` messages
- No HTTP polling or page refresh needed
- All connected clients see same score simultaneously (broadcast pattern)

**WebSocket Message Types:**

- `initial-load` → Sets all match data (match, teams, players, events, scoreboard, statistics)
- `match-update` → Partial updates for match_data, players, events arrays
- `statistics-update` → Full MatchStats object replacement
- `ping` → Health check with auto-pong response

**Signals Used (WebSocketService):**

- `matchData()` → Full match data object
- `matchDataPartial()` → Score, quarter, game status updates
- `matchPartial()` → Match metadata updates (team IDs, dates, sponsors)
- `teamsPartial()` → Team updates (colors, logos, names)
- `playersPartial()` → Players roster array updates
- `eventsPartial()` → Events array updates
- `statistics()` → Complete MatchStats object

**Effects in Component:**

- `wsInitialLoadEffect` → Handles initial-load messages
- `wsMatchDataPartialEffect` → Handles match_data partial updates
- `wsMatchPartialEffect` → Handles match partial updates
- `wsTeamsPartialEffect` → Handles teams partial updates
- `wsPlayersPartialEffect` → Handles players array updates
- `wsEventsPartialEffect` → Handles events array updates

**Tab Updates:**

- **Match Players Tab**: Automatically reflects players roster changes (via comprehensiveData.players)
- **Events Tab**: Automatically reflects new events (via comprehensiveData.events)
- **Stats Tab**: Reads directly from wsService.statistics() computed property

## What we need from backend

**For match details:**

- Match id, match date, week
- Team A (id, title, logo icon URL)
- Team B (id, title, logo icon URL)
- Tournament (id, title, logo icon URL)
- Match Data (score_team_a, score_team_b, game_status)
- [Interface: `MatchWithDetails`](../../../src/app/features/matches/models/match.model.ts)
- [Backend Schema: `MatchWithDetailsSchema`](../../../../statsboards-backend/src/matches/schemas.py:113-116)
- **Backend API Endpoint:** `GET /api/matches/id/{match_id}/`

**For match data (score):**

- Match Data: score_team_a, score_team_b, qtr, down, distance, timeout_team_a, timeout_team_b, ball_on, game_status
- [Interface: `MatchData`](../../../src/app/features/matches/models/match-data.model.ts)
- [Backend Schema: `MatchDataSchema`](../../../../statsboards-backend/src/matchdata/schemas.py)
- **Backend API Endpoint:** `GET /api/matches/id/{match_id}/match_data/`
