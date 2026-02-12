# Scoreboard Display Component Schema

**Component**: `ScoreboardDisplayFlatComponent`
**Type**: Shared/Reusable Component
**Usage**: Used in Scoreboard Admin (preview) and Scoreboard View (fullHD display)

```
┌──────────────────────────────────────────────────────────────────────┐
│  ┌──────────────────────────┐  ┌──────────────────────────┐   │
│  │ [Sponsor Logo]         │  │ [Tournament Logo]     │   │
│  │ (if is_main_sponsor)   │  │ (if is_tournament_logo) │   │
│  └──────────────────────────┘  └──────────────────────────┘   │
├──────────────────────────────────────┬──────────────────────────────┤
│  TEAM A                         │  TEAM B                       │
│  ┌──────────────────────────────┐  │  ┌──────────────────────────┐  │
│  │ [Optional: Lower Stats]    │  │  │ [Optional: Lower Stats] │  │
│  │ (QB/Player/Team Stats)   │  │  │ (QB/Player/Team Stats) │  │
│  └──────────────────────────────┘  │  └──────────────────────────┘  │
│  ┌──────────────┐              │  ┌──────────────┐            │
│  │ TEAM NAME    │              │  │ TEAM NAME    │            │
│  │ [Timeout ○●]│              │  │ [Timeout ○●]│            │
│  │ [GOAL/       │              │  │ [GOAL/       │            │
│  │  TIMEOUT]     │              │  │  TIMEOUT]     │            │
│  └──────────────┘              │  └──────────────┘            │
│  ┌──────────────┐              │  ┌──────────────┐            │
│  │              │              │  │              │            │
│  │ [Team Logo] │              │  │ [Team Logo] │            │
│  │              │              │  │              │            │
│  └──────────────┘              │  └──────────────┘            │
│  ┌──────────────┐              │  ┌──────────────┐            │
│  │     12      │              │  │     7       │            │
│  │   (Score)   │              │  │   (Score)   │            │
│  └──────────────┘              │  └──────────────┘            │
├──────────────────────────────────────┴──────────────────────────────┤
│  QUARTER      │  GAME CLOCK    │  PLAY CLOCK    │  DOWN/DIST   │
│  ┌─────────┐  │  ┌─────────┐  │  ┌─────────┐  │  ┌─────────┐ │
│  │   1st   │  │  │ 12:00  │  │  │   40    │  │  │1st & 10│ │
│  └─────────┘  │  └─────────┘  │  └─────────┘  │  └─────────┘ │
│               │  (red if    │  │  (red if   │  │  [FLAG]   │ │
│               │   < 5sec)   │  │   < 5sec)  │  │           │ │
│               │              │  │             │  │           │ │
└──────────────────────────────────────────────────────────────────────┘
```

## Component Overview

The `ScoreboardDisplayFlatComponent` is a reusable, signal-based component that renders the main scoreboard display. It supports:

- **Conditional display** of all scoreboard elements (logos, scores, clocks, indicators)
- **Animated transitions** for score changes, visibility changes
- **Lower stats displays** (optional overlay components for QB/Player/Team stats)
- **Responsive design** with font size adjustment for team names
- **Custom styling** through `scoreboardDisplayClass` input

## Component Inputs

```typescript
@Input() data: IMatchFullDataWithScoreboard | undefined;
@Input() tournamentSponsor: ISponsor | null | undefined;
@Input() tournament: ITournament | null | undefined;
@Input() gameClock: number = 0;
@Input() playClock: number | null = null;
@Input() scoreboardDisplayClass: string = 'fullhd-scoreboard';
@Input() playerLowerId: number | undefined | null = null;
@Input() footballQbLowerId: number | undefined | null = null;
```

## Display Elements

### Main Logos Area (Left Column)

- **Sponsor Logo** (`is_main_sponsor`): Main tournament sponsor logo
  - Scaled by `scale_main_sponsor` factor
  - Width: 50px (fixed)

- **Tournament Logo** (`is_tournament_logo`): Tournament logo
  - Scaled by `scale_tournament_logo` factor
  - Width: 50px (fixed)

### Team Display Area (Middle & Right Columns)

Each team displays:

**Team A / Team B Details:**
- Background color from `team_a_game_color` / `team_b_game_color` (with 0.8 opacity)
- **Optional Lower Stats Area** (absolute positioned):
  - `FootballQbLowerStatsDisplayFlatComponent` (if `is_football_qb_full_stats_lower` and QB id matches team)
  - `PlayerMatchLowerDisplayFlatComponent` (if `is_match_player_lower` and player matches team)
  - `TeamMatchLowerFootballStatsDisplayFlatComponent` (if `is_home_match_team_lower` / `is_away_match_team_lower`)

**Team Block:**
- **Team Name**:
  - Display game title if `use_team_a_game_title` / `use_team_b_game_title`
  - Otherwise use `team.title` from teams_data
  - Auto-adjusts font size (26px down to 10px) to fit container
  - Hidden when goal or timeout is shown

- **Timeout Indicators**:
  - 3 timeout boxes: `●` (white, 81% opacity) / `○` (black, 30% opacity)
  - Displayed from `timeout_team_a` / `timeout_team_b` string (e.g., "●●●")
  - Shown when `is_timeout_team_a` / `is_timeout_team_b` is true
  - Hidden entirely when `has_timeouts=false`
  - Hidden when goal is shown

- **Goal/Touchdown Indicator**:
  - Text: "ТАЧДАУН" (TOUCHDOWN in Russian)
  - Animated with breathing effect
  - Shown when `is_goal_team_a` / `is_goal_team_b` is true
  - Hidden when timeout is shown

**Team Logo:**
- Display game logo if `use_team_a_game_logo` / `use_team_b_game_logo`
- Otherwise use `team.team_logo_web_url` from teams_data
- Scaled by `scale_logo_a` / `scale_logo_b` factor
- Width: 50px (fixed)

**Score Block:**
- Score from `score_team_a` / `score_team_b`
- Font size: 55px
- Animated on score change
- Background: rgba(31, 31, 31, 0.8)

### Game Display Area (Right Column)

**Period Display** (`is_qtr`):
- Display value from `qtr`
- Label formatting follows `period_mode` and `period_labels_json` when provided
- Falls back to legacy quarter labeling when period metadata is missing
- Width: 70px
- Font size: 26px
- Animated on quarter change

**Game Clock** (`is_time`):
- Format: `MM:SS` (minutes and seconds)
- Calculated from `gameClock` input (total seconds)
- Width: 100px
- Font size: 30px

**Play Clock** (`is_playclock`):
- Seconds from `playClock` input
- Color: Orange (#ffc710) normally, Red when ≤ 5 seconds
- Width: 60px
- Font size: 30px
- Hidden entirely when `has_playclock=false`

**Down & Distance** (`is_downdistance`):
- Format: `{down} & {distance}` (e.g., "1st & 10")
- Width: 190px
- Font size: 26px
- Background: #808080 (gray)
- Animated on change

**Flag Indicator** (`is_flag`):
- Text: "ФЛАГ" (FLAG in Russian)
- Background: #e4cd1c (green)
- Absolute positioned over down & distance
- Shown when `is_flag` is true

## Lower Stats Displays (Optional Overlays)

### Player Match Lower Display
Shows single player stats:
- Player photo (tui-avatar, size 'xxl')
- Player number (match_number)
- Player name (first_name + second_name, uppercase)
- Player position

### Football QB Lower Stats Display
Shows quarterback stats:
- QB photo (tui-avatar, size 'xxl')
- QB number (match_number)
- QB name (first_name + second_name, uppercase)
- Position: "QB STATS"

### Team Match Lower Football Stats Display
Shows team offensive statistics (Russian text labels):
- Yards: `offence_yards`
- Run/Pass Yards: `run_yards / pass_yards`
- Run/Pass Attempts: `run_att / pass_att`
- Yards per Attempt: `avg_yards_per_att`
- Lost Yards: `lost_yards`
- Flag Yards: `flag_yards`
- First Downs Gained: `first_down_gained`
- 3rd Down Conversions: `third_down_conversions / third_down_attempts`
- 4th Down Conversions: `fourth_down_conversions / fourth_down_attempts`
- Turnovers: `turnovers`

## Animations

- **Score Change Animation**: Score text scales up/down on change
- **Visibility Change Animation**: Smooth fade in/out for goal/timeout/down-distance
- **Dissolve Animation**: Smooth fade in/out for lower stats displays
- **Breathing Animation**: Goal/touchdown indicator pulsates continuously

## Responsive Design

Media queries adjust layout at breakpoints:
- 1330px: Collapse to single column
- 900px: Single column, reduce team name width
- 730px: Further reduce team name width
- 420px: Collapse game container to two columns, smaller team name width
- 400px: Smaller score font (30px)

## What we need from backend

**Core Data:**
- `IMatchFullDataWithScoreboard` containing:
  - Match: id, team_a_id, team_b_id
  - Teams Data: team_a, team_b (id, title, team_logo_web_url)
  - Match Data: score_team_a, score_team_b, qtr, down, distance, timeout_team_a, timeout_team_b
  - Scoreboard Data: All visibility flags, team colors/titles/logos, scaling factors, indicators, capability flags (`has_playclock`, `has_timeouts`), period settings (`period_mode`, `period_labels_json`)
  - Player IDs for lower displays: `player_match_lower_id`, `football_qb_full_stats_match_lower_id`

- `ITournament`: id, tournament_logo_web_url
- `ISponsor`: id, logo_url

- `IGameclock`: gameclock (total seconds)
- `IPlayclock`: playclock (seconds)

**For Lower Stats Displays:**
- Player full data with: person (photo URLs, names), match_player (number, team_id), position (title)
- QB stats: passes, passes_completed, pass_yards, pass_td, run_yards, run_td, qb_rating, etc.
- Team stats: offence_yards, run_att, pass_att, avg_yards_per_att, lost_yards, flag_yards, third_down_conversions, fourth_down_conversions, first_down_gained, turnovers

**Backend Schemas:**
- `MatchSchema`, `MatchDataSchema`, `ScoreboardSchema`
- `TournamentSchema`, `SponsorSchema`
- `GameClockSchema`, `PlayClockSchema`
- `PlayerMatchSchema`
- `FootballTeamStats`, `FootballQBStats`, `FootballOffenseStats`
- `FootballEventSchema` (for stats calculation)

**API Endpoints:**
- `GET /api/matches/id/{match_id}` - Match details
- `GET /api/matches/id/{match_id}/match_data/` - Match data
- `GET /api/matches/id/{match_id}/scoreboard_data/` - Scoreboard settings
- `GET /api/matches/id/{match_id}/gameclock/` - Game clock
- `GET /api/matches/id/{match_id}/playclock/` - Play clock
- `GET /api/matches/id/{match_id}/stats/` - Team/QB/Offense stats
- `GET /api/players_match/id/{player_id}/full_data/` - Player full data
- WebSocket `WS /ws/match/{match_id}` - Real-time updates

## TODOs

None - all endpoints verified to exist in backend code
