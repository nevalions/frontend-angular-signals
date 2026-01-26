# Scoreboard View Page Schema

**Route**: `/scoreboard/match/:matchId/hd` (standalone fullHD broadcast page)

```
┌──────────────────────────────────────────────────────────────────────┐
│                    FULLHD SCOREBOARD VIEW                        │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│  [HOME OFFENSE ROSTER]                                      │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │  ┌──────────────────────────────────────────────────┐    │   │
│  │  │  #99  QB        John Smith                    │    │   │
│  │  └──────────────────────────────────────────────────┘    │   │
│  │  ┌──────────────────────────────────────────────────┐    │   │
│  │  │  #84  WR        Mike Johnson                   │    │   │
│  │  └──────────────────────────────────────────────────┘    │   │
│  │  ┌──────────────────────────────────────────────────┐    │   │
│  │  │  #75  TE        Chris Williams                │    │   │
│  │  └──────────────────────────────────────────────────┘    │   │
│  └────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│  [AWAY OFFENSE ROSTER]                                      │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │  ┌──────────────────────────────────────────────────┐    │   │
│  │  │  #7   QB        Alex Brown                    │    │   │
│  │  └──────────────────────────────────────────────────┘    │   │
│  │  ┌──────────────────────────────────────────────────┐    │   │
│  │  │  #11  WR        Tom Davis                     │    │   │
│  │  └──────────────────────────────────────────────────┘    │   │
│  │  ┌──────────────────────────────────────────────────┐    │   │
│  │  │  #88  TE        Jake Miller                   │    │   │
│  │  └──────────────────────────────────────────────────┘    │   │
│  └────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│                    SCOREBOARD DISPLAY                           │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │  [Tournament Logo]                                    │   │
│  │                                                       │   │
│  │  [Team A Logo]   12   [Team B Logo]                 │   │
│  │     TEAM A                   TEAM B                      │   │
│  │                                                       │   │
│  │  [Sponsor Logo]                                       │   │
│  │                                                       │   │
│  │     Qtr: 1st    Time: 12:00                          │   │
│  │    Down: 1st & 10   Play Clock: 40                   │   │
│  └────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│                    SPONSOR LINE                                 │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │  [Match Sponsor Logo]                                  │   │
│  └────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────┘
```

## What's on page

**Read-only scoreboard display** with:

- **Home offense roster** (if `is_team_a_start_offense` is true)
  - Displays starting offense players for home team
  - Each player card shows: number, position, name
  - Team game color background
  - Animated show/hide transition

- **Away offense roster** (if `is_team_b_start_offense` is true)
  - Displays starting offense players for away team
  - Each player card shows: number, position, name
  - Team game color background
  - Animated show/hide transition

- **Home defense roster** (if `is_team_a_start_defense` is true)
  - Displays starting defense players for home team
  - Each player card shows: number, position, name
  - Team game color background
  - Animated show/hide transition

- **Away defense roster** (if `is_team_b_start_defense` is true)
  - Displays starting defense players for away team
  - Each player card shows: number, position, name
  - Team game color background
  - Animated show/hide transition

- **Scoreboard display**
  - Tournament logo (if `is_tournament_logo` is true, scaled by `scale_tournament_logo`)
  - Main sponsor logo (if `is_main_sponsor` is true, scaled by `scale_main_sponsor`)
  - Team A logo (if `use_team_a_game_logo` is true, scaled by `scale_logo_a`)
  - Team A name (if `use_team_a_game_title` is true, or default to team title)
  - Team B logo (if `use_team_b_game_logo` is true, scaled by `scale_logo_b`)
  - Team B name (if `use_team_b_game_title` is true, or default to team title)
  - Team colors (if `use_team_a_game_color` / `use_team_b_game_color` is true)
  - Quarter display (if `is_qtr` is true)
  - Game clock (if `is_time` is true)
  - Down & distance (if `is_downdistance` is true)
  - Play clock (if `is_playclock` is true)
  - Goal indicators (if `is_goal_team_a` / `is_goal_team_b` is true)
  - Flag indicator (if `is_flag` is true)
  - Timeout indicators (if `is_timeout_team_a` / `is_timeout_team_b` is true)

- **Sponsor line**
  - Main sponsor line (if `is_sponsor_line` is true)
  - Match sponsor line (if `is_match_sponsor_line` is true)

- **Football stats lower display** (optional)
  - Team lower stats (if `is_home_match_team_lower` or `is_away_match_team_lower` is true)
  - QB full stats (if `is_football_qb_full_stats_lower` is true, shows player `football_qb_full_stats_match_lower_id`)
  - Player stats (if `is_match_player_lower` is true, shows player `player_match_lower_id`)

**Real-time updates:**

All scoreboard elements update in real-time via WebSocket connection. Rosters animate in/out based on visibility toggles.

## What we need from backend

**For initial data load:**

- Match id, match date, week
- Team A (id, title, logo icon URL)
- Team B (id, title, logo icon URL)
- Tournament (id, title, logo icon URL, main sponsor id)
- Match Data: score_team_a, score_team_b, qtr, down, distance, timeout_team_a, timeout_team_b, ball_on, game_status
- Gameclock: id, gameclock, gameclock_max, gameclock_status
- Playclock: id, playclock, playclock_status
- Scoreboard settings: all visibility toggles, team colors/titles/logos, scaling factors, indicators
- Players in match (home/away offense/defense rosters) with: id, player number, position, person name, team_id, match_id
- Main tournament sponsor: id, title, logo icon URL, logo web URL
- Sport (id) for positions lookup
- Match stats (team, QB, offense, defense stats) if showing lower displays

**API Endpoints:**

**Match Data:**
- `GET /api/matches/id/{match_id}` - Get match details
- `GET /api/matches/id/{match_id}/match_data/` - Get match data
- [Backend Schema: `MatchSchema`](../../statsboards-backend/src/matches/schemas.py)
- [Backend Schema: `MatchDataSchema`](../../statsboards-backend/src/matchdata/schemas.py)

**Clocks:**
- `GET /api/matches/id/{match_id}/gameclock/` - Get game clock
- [Backend Schema: `GameClockSchema`](../../statsboards-backend/src/gameclocks/schemas.py)

- `GET /api/matches/id/{match_id}/playclock/` - Get play clock
- [Backend Schema: `PlayClockSchema`](../../statsboards-backend/src/playclocks/schemas.py)

**Scoreboard:**
- `GET /api/matches/id/{match_id}/scoreboard_data/` - Get scoreboard settings
- [Backend Schema: `ScoreboardSchema`](../../statsboards-backend/src/scoreboards/schemas.py)

**Players in Match:**
- `GET /api/matches/id/{match_id}/players_with_full_data_optimized` - Get all players with full data in match
- `GET /api/players_match/` - Get players in match (filter by match_id)
- `GET /api/players_match/id/{player_id}/full_data/` - Get player full data in match
- [Backend Schema: `PlayerMatchSchema`](../../statsboards-backend/src/player_match/schemas.py)

**Teams:**
- `GET /api/matches/id/{match_id}/teams` - Get both teams for match
- [Backend Schema: `TeamSchema`](../../statsboards-backend/src/teams/schemas.py)

**Tournament:**
- `GET /api/tournaments/{id}` - Get tournament
- [Backend Schema: `TournamentSchema`](../../statsboards-backend/src/tournaments/schemas.py)

**Sponsors:**
- `GET /api/sponsors/{id}` - Get sponsor details
- [Backend Schema: `SponsorSchema`](../../statsboards-backend/src/sponsors/schemas.py)

**Football Events & Stats (for lower displays):**
- `GET /api/matches/id/{match_id}/stats/` - Get match statistics for both teams (team, QB, offense, defense stats)
- `GET /api/football_event/matches/{match_id}/events-with-players/` - Get football events with player references
- [Backend Schema: `FootballEventSchema`](../../statsboards-backend/src/football_events/schemas.py)
- [Backend Schema: `FootballTeamStats`](../../statsboards-backend/src/matches/schemas.py:88-105)
- [Backend Schema: `FootballQBStats`](../../statsboards-backend/src/matches/schemas.py:58-73)
- [Backend Schema: `FootballOffenseStats`](../../statsboards-backend/src/matches/schemas.py:43-55)

**Context Data (for initialization):**
- `GET /api/matches/id/{match_id}/full_context` - Get match with teams, sport, positions
- Returns: match with team_a, team_b, tournaments (sport id)

**WebSocket:**
- `WS /ws/match/{match_id}` - Real-time updates for:
  - Match data (score, qtr, down, distance, timeouts)
  - Game clock (time, status)
  - Play clock (time, status)
  - Scoreboard settings (visibility, colors, toggles)
  - Football events (if applicable)
  - Match statistics (team, QB, offense, defense stats)

## TODOs

None - all endpoints verified to exist in backend code
