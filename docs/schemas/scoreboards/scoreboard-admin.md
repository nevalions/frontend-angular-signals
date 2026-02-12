# Scoreboard Admin Page Schema

**Route**: `/sports/:sportId/tournaments/:tournamentId/matches/:matchId/admin`

**Parent**: Tournament Detail (Matches tab)

```
┌──────────────────────────────────────────────────────────────────────┐
│  Back to Match Details                                       │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│  SCOREBOARD PREVIEW                                            │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  [Team A Logo]   [Score]   [Score]   [Team B Logo]   │   │
│  │  [Tournament Logo]       [Qtr] [Time]  [Down/Distance]  │   │
│  └──────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│  [👁️🗑️] Collapse All / Expand All                          │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│  [👁️🗑️] Score Inputs                                       │
│  ┌────────────────────────────────────────────────────────────┐     │
│  │  Score Home:        [0] [▲] [▼]        [Submit]   │     │
│  │  Score Away:        [0] [▲] [▼]        [Submit]   │     │
│  └────────────────────────────────────────────────────────────┘     │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│  [👁️🗑️] Score Buttons                                      │
│  ┌────────────────────────────────────────────────────────────┐     │
│  │  Home:  [+6] [+1] [+3] [-1]                         │     │
│  │  Away:  [+6] [+1] [+3] [-1]                         │     │
│  └────────────────────────────────────────────────────────────┘     │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│  [👁️🗑️] Quarter Forms                                      │
│  ┌────────────────────────────────────────────────────────────┐     │
│  │  Quarter: [1st ▼]                    [Submit]         │     │
│  └────────────────────────────────────────────────────────────┘     │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│  [👁️🗑️] Time Forms                                          │
│  ┌────────────────────────────────────────────────────────────┐     │
│  │  Max Minutes: [12] [▲] [▼]            [Submit]       │     │
│  │  Game Time:  [12]:[00]              [Submit]        │     │
│  │  [Start Clock] [Pause Clock] [Reset Clock]             │     │
│  │                                                         │     │
│  │  Play Time:  [40]  [Reset Timer]                       │     │
│  │              [25]                                        │     │
│  └────────────────────────────────────────────────────────────┘     │
└──────────────────────────────────────────────────────────────────────┘

 ┌──────────────────────────────────────────────────────────────────────┐
 │  [👁️🗑️] Down & Distance Forms                               │
 │  ┌────────────────────────────────────────────────────────────┐     │
 │  │  Current: 1st & 10                                    │     │
 │  │                                                         │     │
 │  │  Down:                                                  │     │
 │  │  [1st] [2nd] [3rd] [4th] [🚩]                      │     │
 │  │                                                         │     │
 │  │  Distance: [10 ▼]                         [Submit]     │     │
  │  │  Quick: [INCH] [GOAL] [1&10]                          │     │
 │  │                                                         │     │
 │  │  Special States:                                       │     │
 │  │  [PAT 1] [PAT 2] [FG] [KICK OFF]                     │     │
 │  └────────────────────────────────────────────────────────────┘     │
 └──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│  [👁️🗑️] Timeout Forms                                      │
│  ┌────────────────────────────────────────────────────────────┐     │
│  │  Home Timeout: [●●●]              [Submit]             │     │
│  │  Away Timeout: [●●●]              [Submit]             │     │
│  └────────────────────────────────────────────────────────────┘     │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│  [👁️🗑️] Change Teams Forms                                  │
│  ┌────────────────────────────────────────────────────────────┐     │
│  │  Team A: [Select Team ▼]              [Submit]       │     │
│  │  Team B: [Select Team ▼]              [Submit]       │     │
│  └────────────────────────────────────────────────────────────┘     │
└──────────────────────────────────────────────────────────────────────┘

 ┌──────────────────────────────────────────────────────────────────────┐
  │  [👁️🗑️] Scoreboard Settings Forms                            │
  │  ┌────────────────────────────────────────────────────────────┐     │
  │  │  [✓] Use Sport Preset       [Toggle] Inherit settings │
  │  │                                 from sport's default │
  │  │                                 preset              │
  │  │  [Show/Hide] Qtr Field              [Submit]          │
  │  │  [Show/Hide] Game Time Field         [Submit]          │
  │  │  [Show/Hide] Play Clock            [Submit]          │
  │  │  [Show/Hide] Down & Distance Field  [Submit]          │
  │  │  [Show/Hide] Tournament Logo       [Submit]          │
  │  │  [Show/Hide] Sponsor Logo          [Submit]          │
  │  │  [Show/Hide] Sponsor Line          [Submit]          │
  │  │  [✓] Use Match Sponsors    [Toggle] Use match instead of │
  │  │                                 tournament sponsors     │
  │  │  Tournament Logo Scale: [Slider 0.5-2.0]                │
  │  │  Sponsor Scale:         [Slider 0.5-2.0]                │
  │  │                           (affects logo and line)       │
  │  └────────────────────────────────────────────────────────────┘     │

│  ┌────────────────────────────────────────────────────────────┐     │
│  │  HOME TEAM                                              │
│  │  [✓] Use Game Color      [Toggle]                     │
│  │  Home Team Game Color:  [Color Picker]   [Submit]        │
│  │  [✓] Use Game Title      [Toggle]                     │
│  │  Home Team Game Title:  [Title Input]   [Submit]        │
│  │  [✓] Use Game Logo       [Toggle]                     │
│  │  Home Team Game Logo:   [Upload File]                  │
│  │                          [Preview Image]                │
│  │                          [Remove Button]                │
│  │  Logo Scale:           [Slider 0.5-2.0]               │
│  └────────────────────────────────────────────────────────────┘     │
│  ┌────────────────────────────────────────────────────────────┐     │
│  │  AWAY TEAM                                              │
│  │  [✓] Use Game Color      [Toggle]                     │
│  │  Away Team Game Color:  [Color Picker]   [Submit]        │
│  │  [✓] Use Game Title      [Toggle]                     │
│  │  Away Team Game Title:  [Title Input]   [Submit]        │
  │  │  [✓] Use Game Logo       [Toggle]                     │
  │  │  Away Team Game Logo:   [Upload File]                  │
  │  │                          [Preview Image]                │
  │  │                          [Remove Button]                │
  │  │  Logo Scale:           [Slider 0.5-2.0]               │
  │  └────────────────────────────────────────────────────────────┘     │
  │  ┌────────────────────────────────────────────────────────────┐     │
  │  │  SPONSOR SETTINGS                                       │
  │  │  [✓] Tournament Logo       [Toggle] Show tournament      │
  │  │  [✓] Sponsor Logo          [Toggle] Show main sponsor  │
  │  │  [✓] Sponsor Line          [Toggle] Show sponsor line   │
  │  │  [✓] Use Match Sponsors    [Toggle] Use match instead of │
  │  │                                 tournament sponsors     │
  │  │  Tournament Logo Scale: [Slider 0.5-2.0]                │
  │  │  Sponsor Scale:         [Slider 0.5-2.0]                │
  │  │                           (affects logo and line)       │
  │  └────────────────────────────────────────────────────────────┘     │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│  [👁️🗑️] Events Forms                                       │
│  ┌────────────────────────────────────────────────────────────┐     │
│  │  TEAM A STATS                                        │     │
│  │  Offense Yards: 150                                  │     │
│  │  Pass Att: 15  Run Att: 10  Avg Yards: 6.0         │     │
│  │  3rd Down: 5/10  4th Down: 1/2  1st Downs: 8     │     │
│  │                                                         │     │
│  │  QUARTERBACK STATS                                    │     │
│  │  #12 QB: 12/15, 150yds, 2TD, QB Rating: 120.5     │     │
│  │                                                         │     │
│  │  OFFENSE PLAYERS STATS                                │     │
│  │  #84 WR: 8rec, 120yds, 2TD                       │     │
│  │  #32 RB: 10run, 85yds, 1TD                        │     │
│  │                                                         │     │
│  │  TEAM B STATS                                        │     │
│  │  Offense Yards: 120                                  │     │
│  │  Pass Att: 12  Run Att: 12  Avg Yards: 4.6          │     │
│  │  3rd Down: 3/10  4th Down: 0/1  1st Downs: 6     │     │
│  │                                                         │     │
│  │  QUARTERBACK STATS                                    │     │
│  │  #7 QB: 10/12, 100yds, 1TD, QB Rating: 95.0       │     │
│  │                                                         │     │
│  │  OFFENSE PLAYERS STATS                                │     │
│  │  #11 WR: 6rec, 80yds, 1TD                        │     │
│  │  #21 RB: 12run, 90yds, 1TD                        │     │
│  └────────────────────────────────────────────────────────────┘     │
│  ┌────────────────────────────────────────────────────────────┐     │
│  │  Field Length: [100] [▲] [▼]      [Submit]           │     │
│  └────────────────────────────────────────────────────────────┘     │
│  ┌────────────────────────────────────────────────────────────┐     │
│  │  FOOTBALL EVENTS TABLE                                 │     │
│  │  ┌────────────────────────────────────────────────┐    │     │
│  │  │ # | Qtr | Down | Play | Result | Players... │    │     │
│  │  │ 1 | 1st  | 1&10  | Run   | Gain 5yd  │    │     │
│  │  │  │      │       │       │ #32 RB    │    │     │
│  │  ├────────────────────────────────────────────────┤    │     │
│  │  │ 2 | 1st  | 1&5   | Pass  | Incomplete │    │     │
│  │  │  │      │       │       │ #12 QB    │    │     │
│  │  ├────────────────────────────────────────────────┤    │     │
│  │  │ 3 | 1st  | 1&10  | Run   | Gain 8yd  │    │     │
│  │  │  │      │       │       │ #32 RB    │    │     │
│  │  └────────────────────────────────────────────────┘    │     │
│  │  [+ Add Event] [Edit] [Delete]                       │     │
│  └────────────────────────────────────────────────────────────┘     │
└──────────────────────────────────────────────────────────────────────┘
```

## What's on the page

- **Back button** → Navigate back to match detail
- **Scoreboard preview** → Live preview of scoreboard display
- **"Collapse All / Expand All" button** → Toggle all collapsible sections at once, users can still individually toggle each section
- **Collapsible form sections** with toggle buttons:
  - **Score Inputs** → Manually enter scores for home/away
  - **Score Buttons** → Increment/decrement scores (+6, +1, +3, -1)
  - **Quarter Forms** → Select/update period value
    - Label/value mapping follows `period_mode` and `period_labels_json` when provided
    - Falls back to legacy quarter values when period metadata is not provided
  - **Time Forms** → Control game clock and play clock
    - Set max game time (minutes)
    - Set game time (minutes:seconds)
    - Start/Pause/Reset game clock
    - Start play clock (40s or 25s) or reset (only when `has_playclock=true`)
   - **Down & Distance Forms** → Set down and distance
     - Current display shows "Down & Distance" format (e.g., "1st & 10")
     - Down selection buttons (1st, 2nd, 3rd, 4th) with flag toggle
     - Distance dropdown with preset quick buttons (INCH, GOAL, 10)
     - Special game states (PAT 1, PAT 2, FG, KICK OFF) - when selected, down is hidden and only special state displays
  - **Timeout Forms** → Manage timeouts for each team (only when `has_timeouts=true`)
  - **Change Teams Forms** → Select different teams for the match
   - **Scoreboard Settings Forms** → Toggle scoreboard elements visibility and team settings:
       - **Use Sport Preset toggle**: When enabled, match inherits all settings from sport's default scoreboard preset. When disabled, match uses custom scoreboard settings independent of sport preset.
       - Display toggles: Qtr, Time, Play Clock, Down/Distance
       - Team settings (Home and Away):
         - Use game color switch + game color picker
         - Use game title switch + game title input
         - Use game logo switch + game logo upload (with preview and remove)
         - Logo scale slider (0.5-2.0)
       - Sponsor settings:
         - Display toggles: Tournament Logo, Sponsor Logo, Sponsor Line
         - Sponsor source toggle: Use match sponsors instead of tournament sponsors
         - Tournament logo scale slider (0.5-2.0)
         - Sponsor scale slider (0.5-2.0) - affects both sponsor logo and sponsor line

  - **Events Forms** → Football events tracking and statistics:
    - Team stats (offense yards, pass/run attempts, averages, down conversions, turnovers)
    - Quarterback stats (passing/rushing yards, TDs, QB rating)
    - Offense player stats (receptions, yards, TDs for WRs; rushing yards, TDs for RBs)
    - Field length setting
    - Football events table (create/edit/delete events with all player assignments)
- Each form has a submit button to save changes

## Real-time Updates (WebSocket)

**Events Updates:**

- Events list updates automatically via WebSocket (no page refresh needed)
- EventsForms component reads from `WebSocketService.events` computed property
- Event create/update/delete operations trigger WebSocket `event-update` message
- All connected clients receive updated events array instantly
- Play-by-play component also receives events from same WebSocket source

**Update Types:**

- **Event created**: New event appears in Events table immediately
- **Event updated**: Event details update in Events table immediately
- **Event deleted**: Event disappears from Events table immediately
- **Statistics recalculated**: Team/QB/Offense stats update when events change
- **Clock updates**: Game clock and play clock update via WebSocket `gameclock-update` and `playclock-update` messages
- **Scoreboard settings updates**: Scoreboard settings (toggles, colors, titles, logos, scales, use_sport_preset) update via WebSocket `scoreboard-data` partial message
- **Score updates**: Match scores update via WebSocket `match-update` message with updated match_data
- **Team data updates**: Team colors, logos, and names update via WebSocket `teams-data` message

**WebSocket Signal:**

- `events` → Full FootballEvent array replacement (not partial updates)
- `statistics` → Full MatchStats object replacement
- `scoreboardPartial` → Partial scoreboard settings updates (use_sport_preset, toggles, colors, titles, logos, scales, flags)
- `matchDataPartial` → Partial match_data updates (scores, quarter, down/distance)
- `teamsPartial` → Full teams object replacement
- Updates arrive via `event-update`, `statistics-update`, and `match-update` messages
- API calls (POST/PUT/DELETE to /api/football_event) trigger backend → database → WebSocket broadcast flow
- No HTTP GET requests to reload events after create/update/delete operations

## What we need from backend

**For initial data load:**

- Match id, match date, week, match_eesl_id
- Team A (id, title, logo icon URL, game color, game title, game logo)
- Team B (id, title, logo icon URL, game color, game title, game logo)
- Tournament id, title, logo icon URL, main sponsor id
- Match Data: score_team_a, score_team_b, qtr, down, distance, ball_on, timeout_team_a, timeout_team_b, game_status, field_length
- Gameclock: id, gameclock, gameclock_max, gameclock_status
- Playclock: id, playclock, playclock_status
- Scoreboard settings: visibility toggles, team colors, team titles/logos usage, scaling factors, flag/goal/timeout indicators, use_sport_preset toggle, capability flags (`has_playclock`, `has_timeouts`), period settings (`period_mode`, `period_labels_json`)
- Players in match (home and away rosters) with: id, player number, position, is_start, team_id, match_id
- Main tournament sponsor (id, title, logo icon URL, logo web URL)
- Football events in match with all player assignments and stats data
- Match stats (calculated from events): team stats, QB stats, offense stats

**API Endpoints:**

**Match Data:**
- `GET /api/matches/id/{match_id}` - Get match details
- `PUT /api/matches/{match_id}` - Update match (change teams)
- [Backend Schema: `MatchSchema`](../../statsboards-backend/src/matches/schemas.py)

- `GET /api/matches/id/{match_id}/match_data/` - Get match data
- `PUT /api/matchdata/{id}` - Update match data (key-value or full)
- `PUT /api/matchdata/id/{id}` - Update match data by id
- [Backend Schema: `MatchDataSchema`](../../statsboards-backend/src/matchdata/schemas.py)

**Clocks:**
- `GET /api/matches/id/{match_id}/gameclock/` - Get game clock
- `PUT /api/gameclock/{id}` - Update game clock
- [Backend Schema: `GameClockSchema`](../../statsboards-backend/src/gameclocks/schemas.py)

- `GET /api/matches/id/{match_id}/playclock/` - Get play clock
- `PUT /api/playclock/{id}` - Update play clock
- [Backend Schema: `PlayClockSchema`](../../statsboards-backend/src/playclocks/schemas.py)

**Scoreboard:**
- `GET /api/matches/id/{match_id}/scoreboard_data/` - Get scoreboard settings
- `PUT /api/scoreboards/{id}` - Update scoreboard settings
- `POST /api/matches/id/{match_id}/upload_team_logo` - Upload team game logo for match (returns logoUrl)
- [Backend Schema: `ScoreboardSchema`](../../statsboards-backend/src/scoreboards/schemas.py)

**Players in Match:**
- `GET /api/players_match/` - Get all players in match (filter by match_id)
- `POST /api/players_match/` - Create player in match
- `PUT /api/players_match/{id}/` - Update player in match
- [Backend Schema: `PlayerMatchSchema`](../../statsboards-backend/src/player_match/schemas.py)

**Teams:**
- `GET /api/teams/tournament/{tournament_id}/paginated` - Get teams for dropdown
- [Backend Schema: `TeamSchema`](../../statsboards-backend/src/teams/schemas.py)

**Tournament:**
- `GET /api/tournaments/{id}` - Get tournament for sponsor info
- [Backend Schema: `TournamentSchema`](../../statsboards-backend/src/tournaments/schemas.py)

**Sponsors:**
- `GET /api/sponsors/{id}` - Get sponsor details
- [Backend Schema: `SponsorSchema`](../../statsboards-backend/src/sponsors/schemas.py)

**Football Events & Stats:**
- `GET /api/matches/id/{match_id}/stats/` - Get match statistics for both teams (team, QB, offense, defense stats)
- `GET /api/football_event/match_id/{match_id}/` - Get all football events for a match
- `GET /api/football_event/matches/{match_id}/events-with-players/` - Get football events with all 17 player references pre-populated
- `POST /api/football_event/` - Create football event
- `PUT /api/football_event/{id}/` - Update football event
- `DELETE /api/football_event/id/{id}` - Delete football event (requires admin role)
- [Backend Schema: `FootballEventSchema`](../../statsboards-backend/src/football_events/schemas.py)
- [Backend Schema: `FootballTeamStats`](../../statsboards-backend/src/matches/schemas.py:88-105)
- [Backend Schema: `FootballQBStats`](../../statsboards-backend/src/matches/schemas.py:58-73)
- [Backend Schema: `FootballOffenseStats`](../../statsboards-backend/src/matches/schemas.py:43-55)

**WebSocket:**
- `WS /ws/match/{match_id}` - Real-time updates for match data, gameclock, playclock, scoreboard, football events, statistics
- Connect to WebSocket to receive live updates from other admins

## TODOs

None - all endpoints verified to exist in backend code
