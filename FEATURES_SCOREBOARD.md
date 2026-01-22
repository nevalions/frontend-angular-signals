# Scoreboard Feature

## Overview
Scoreboard is a real-time scoreboard management and display system for matches. It includes an admin interface for controlling match data (scores, time, quarters, timeouts, etc.) and a fullHD broadcast view for displaying the scoreboard.

## Backend API

### Match Data
```
GET /api/matches/id/{match_id}
PUT /api/matches/{match_id}
```
Get and update match details (teams, tournament, etc.).

### Match Data (Game State)
```
GET /api/matches/id/{match_id}/match_data/
PUT /api/matchdata/{id}
PUT /api/matchdata/id/{id}
```
Get and update match game state (scores, quarter, down, distance, timeouts, etc.).

### Game Clock
```
GET /api/matches/id/{match_id}/gameclock/
PUT /api/gameclock/{id}
```
Get and update game clock (time, max time, status).

### Play Clock
```
GET /api/matches/id/{match_id}/playclock/
PUT /api/playclock/{id}
```
Get and update play clock (time, status).

### Scoreboard Settings
```
GET /api/matches/id/{match_id}/scoreboard_data/
PUT /api/scoreboards/{id}
```
Get and update scoreboard display settings (visibility toggles, team colors, scaling factors).

### Players in Match
```
GET /api/players_match/
POST /api/players_match/
PUT /api/players_match/{id}/
GET /api/players_match/id/{player_id}/full_data/
```
Get, create, and update players in a match.

### Teams
```
GET /api/teams/tournament/{tournament_id}/paginated
GET /api/matches/id/{match_id}/teams
```
Get teams for tournament dropdown or match teams.

### Tournament & Sponsors
```
GET /api/tournaments/{id}
GET /api/sponsors/{id}
```
Get tournament details and sponsor information.

### Football Events & Stats
```
GET /api/matches/id/{match_id}/stats/
GET /api/football_event/match_id/{match_id}/
GET /api/football_event/matches/{match_id}/events-with-players/
POST /api/football_event/
PUT /api/football_event/{id}/
```
Get match statistics, football events, and create/update events.

### Full Context
```
GET /api/matches/id/{match_id}/full_context
```
Get match with teams, sport, and positions for initialization.

### WebSocket
```
WS /ws/match/{match_id}
```
Real-time updates for match data, game clock, play clock, scoreboard settings, and football events.

## Frontend Implementation

### Files
- `src/app/features/scoreboard/pages/admin/scoreboard-admin.component.*` - Admin interface with all forms
- `src/app/features/scoreboard/pages/view/scoreboard-view.component.*` - FullHD broadcast view
- `src/app/features/scoreboard/components/display/scoreboard-display-flat.component.*` - Reusable scoreboard display
- `src/app/features/scoreboard/components/admin-forms/qtr-forms/qtr-forms.component.*` - Quarter selection form
- `src/app/features/scoreboard/components/admin-forms/down-distance-forms/down-distance-forms.component.*` - Down & distance form
- `src/app/features/scoreboard/components/admin-forms/timeout-forms/timeout-forms.component.*` - Timeout management form
- `src/app/features/scoreboard/components/admin-forms/scoreboard-settings-forms/scoreboard-settings-forms.component.*` - Scoreboard display settings form
- `src/app/features/scoreboard/animations/slide-up.animation.ts` - Animation for roster displays

### Models
- `IMatchFullDataWithScoreboard` - Combined match, match data, teams, and scoreboard settings
- `IMatch` - Basic match information
- `IMatchData` - Game state (scores, quarter, down, distance, timeouts)
- `IGameclock` - Game clock data
- `IPlayclock` - Play clock data
- `IScoreboard` - Scoreboard display settings
- `IPlayerMatch` - Player in match data
- `IFootballEvent` - Football event data
- `IFootballTeamStats` - Team offensive statistics
- `IFootballQBStats` - Quarterback statistics
- `IFootballOffenseStats` - Offense player statistics
- `ITeam` - Team information
- `ITournament` - Tournament information
- `ISponsor` - Sponsor information

### Services
- `MatchesService` - Match CRUD and data operations
- `MatchDataService` - Match data CRUD operations
- `GameclockService` - Game clock operations
- `PlayclockService` - Play clock operations
- `ScoreboardService` - Scoreboard settings operations
- `PlayerMatchService` - Player in match operations
- `TeamsService` - Team operations
- `TournamentsService` - Tournament operations
- `SponsorsService` - Sponsor operations
- `FootballEventService` - Football event operations
- `WebsocketService` - Real-time WebSocket connection
- `MatchesFacadeService` - Combined data fetching for matches

### Components

#### Scoreboard Admin Page (`ScoreboardAdminComponent`)
- **Route**: `/sports/:sportId/tournaments/:tournamentId/matches/:matchId/admin`
- **Access**: Requires authentication
- **Features**:
  - Live scoreboard preview
  - Collapsible admin form sections
  - Score inputs (manual entry and +/- buttons)
  - Quarter selection (1st, 2nd, 3rd, 4th, OT)
  - Game clock control (max time, current time, start/pause/reset)
  - Play clock control (40s/25s start, reset)
  - Down & distance form
  - Timeout management (use/restore/reset)
  - Team selection dropdowns
  - Scoreboard display settings (visibility toggles, team colors, logo scaling)
  - Football events tracking and statistics

#### Scoreboard View Page (`ScoreboardViewComponent`)
- **Route**: `/scoreboard/match/:matchId/hd`
- **Access**: Public (no authentication)
- **Features**:
  - Read-only fullHD scoreboard display
  - Home/away offense roster display
  - Home/away defense roster display
  - Real-time WebSocket updates
  - Animated roster transitions
  - Conditional element display (logos, scores, clocks, indicators)

#### Scoreboard Display Component (`ScoreboardDisplayFlatComponent`)
- **Type**: Reusable component
- **Usage**: Admin preview and view page
- **Features**:
  - Conditional display of all scoreboard elements
  - Animated transitions
  - Lower stats displays (QB/Player/Team)
  - Responsive design
  - Custom styling via input

#### Admin Form Components

##### Quarter Forms (`QtrFormsComponent`)
- Quarter selection with button group
- Highlights current quarter
- Submit button to save

##### Down & Distance Forms (`DownDistanceFormsComponent`)
- Down selection (1st, 2nd, 3rd, 4th)
- Distance input with presets (10, Goal, Inches)
- Ball on yard line input (1-50)
- Flag toggle button
- Submit button to save

##### Timeout Forms (`TimeoutFormsComponent`)
- Timeout management for both teams
- Visual indicators (●●●)
- Use/Restore timeout buttons
- Reset all timeouts button
- Submit button to save

##### Scoreboard Settings Forms (`ScoreboardSettingsFormsComponent`)
- Display toggles (quarter, time, play clock, down/distance, logos)
- Team color pickers
- Use game color/title/logo toggles
- Scale sliders for logos (tournament, sponsor, team)
- Submit buttons to save

### State Management

#### ScoreboardAdminComponent Signals
- `data` - Combined match data (IMatchFullDataWithScoreboard)
- `tournamentSponsor` - Tournament sponsor (ISponsor)
- `gameClock` - Game clock time (number)
- `playClock` - Play clock time (number | null)
- `playerLowerId` - Lower display player ID
- `footballQbLowerId` - Lower display QB ID
- `gameclockResource` - httpResource for game clock
- `playclockResource` - httpResource for play clock
- `matchDataResource` - httpResource for match data
- `scoreboardResource` - httpResource for scoreboard settings
- `playersMatchResource` - rxResource for players in match
- `teamsResource` - rxResource for teams dropdown
- `footballStatsResource` - rxResource for football stats
- `footballEventsResource` - rxResource for football events
- `allFormsCollapsed` - Toggle for all forms collapse
- WebSocket subscription for real-time updates

#### ScoreboardViewComponent Signals
- `data` - Combined match data (IMatchFullDataWithScoreboard)
- `tournamentSponsor` - Tournament sponsor (ISponsor)
- `tournament` - Tournament (ITournament)
- `gameClock` - Game clock time (number)
- `playClock` - Play clock time (number | null)
- `showHomeOffenseRoster` - Home offense roster visibility
- `showAwayOffenseRoster` - Away offense roster visibility
- `showHomeDefenseRoster` - Home defense roster visibility
- `showAwayDefenseRoster` - Away defense roster visibility
- WebSocket subscription for real-time updates

### User Flows

#### Admin Flow
1. Navigate to match detail page
2. Click "Scoreboard Admin" link
3. View live scoreboard preview
4. Open desired form section
5. Make changes (scores, time, quarter, timeouts, settings, etc.)
6. Submit changes
7. Changes update immediately in preview and broadcast view
8. Other admins see changes via WebSocket

#### Broadcast View Flow
1. Navigate to scoreboard view URL
2. View fullHD scoreboard display
3. Real-time updates from admin changes
4. Rosters animate in/out based on settings

### Design Patterns Used
- **Signals** - All state uses Angular signals
- **OnPush** - Components use `ChangeDetectionStrategy.OnPush`
- **Standalone** - All components are standalone
- **WebSocket** - Real-time updates via WebSocketService
- **httpResource/rxResource** - Resource-based data fetching
- **Collapsible Sections** - Reusable collapsible section wrapper
- **Animations** - Angular animations for smooth transitions
- **Shared Components** - Reusable scoreboard display component

### Real-time Updates
All scoreboard elements update in real-time via WebSocket connection to `/ws/match/{match_id}`. Updates include:
- Match data (scores, quarter, down, distance, timeouts)
- Game clock (time, status)
- Play clock (time, status)
- Scoreboard settings (visibility, colors, toggles)
- Football events

### Schemas
All page schemas are documented in `docs/schemas/scoreboards/`:
- `scoreboard-admin.md` - Admin interface schema
- `scoreboard-view.md` - Broadcast view schema
- `scoreboard-display.md` - Display component schema

## Related Features
- Matches - Match management and details
- Tournaments - Tournament information
- Teams - Team management
- Players - Player roster management
- Football Events - Game events and statistics tracking

## Testing
- Model tests for data interfaces
- Service tests for all scoreboard services
- Component tests for admin and view pages
- Visual tests for scoreboard display

### Running Tests
```bash
npm run test
npm run test:coverage
npm run test:visual
```
