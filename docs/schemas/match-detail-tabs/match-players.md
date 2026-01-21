# Match Players Tab Schema

**Tab**: Match Players
**Parent**: [Match Detail](../match-detail.md)

```
┌─────────────────────────────────────────────────────────────┐
│  ┌─────────────────┐              VS              ┌─────────────────┐  │
│  │                 │                               │                 │  │
│  │  [TEAM A LOGO]  │                               │  [TEAM B LOGO]  │  │
│  │                 │                               │                 │  │
│  │   TEAM A        │                               │   TEAM B        │  │
│  │   12 players    │                               │   11 players    │  │
│  │                 │                               │                 │  │
│  └─────────────────┘                               └─────────────────┘  │
│                                                              │
├──────────────────────────────┬───────────────────────────────┤
│  ⭐ Starting Lineup        │   ⭐ Starting Lineup           │
│  ✓ 3 players               │   ✓ 2 players                  │
 ├──────────────────────────────┼───────────────────────────────┤
 │  [99]                      │   [7]                          │
 │       John Smith            │       Alex Brown               │
 │       QB                    │        QB                     │
 │                                                              │
 │  [84]                      │   [11]                         │
 │       Mike Johnson          │       Tom Davis                │
 │       WR                    │        WR                     │
 │                                                              │
 │  [75]                      │                                │
 │       Chris Williams        │                                │
 │       TE                    │                                │
│                                                              │
├──────────────────────────────┼───────────────────────────────┤
│  👥 Bench                  │   👥 Bench                     │
│  9 players                 │   9 players                    │
├──────────────────────────────┼───────────────────────────────┤
│  [23]  Jane Doe  RB        │   [44]  Bob Wilson  TE         │
│  [12]  Mike Lee  FB        │   [32]  Sam Jones  RB          │
│  ...                       │   ...                          │
└──────────────────────────────┴───────────────────────────────┘
```

## What's on the tab

### Layout
- Side-by-side team comparison view
- Central "VS" divider between teams
- Each team column has its own header and player roster

### Team Header
- Team avatar (logo or initials)
- Team name (UPPERCASE)
- Total player count badge

### Player Sections (per team)
- Starting Lineup section (⭐ icon with star)
   - Only shown if team has starters
   - Green positive badge showing starter count
   - Larger player cards
   - Player number badge (visible)
   - Player name (full name)
   - Position chip with accent styling

- Bench section (👥 icon with users)
   - Only shown if team has bench players
   - Neutral badge showing bench count
   - Smaller, more compact player cards
   - Player number badge (smaller)
   - Player name (smaller text)
   - Position as plain text

### Empty State
- No players registered message when team has no players

## What we need from backend

**For players in match list:**

- Player id
- Player match id
- Person id
- Person full name
- Player number (from player_team_tournament)
- Position id
- Position title
- Team id
- Is starting status (is_starting)
- [Interface: `PlayerMatch`](../../../../src/app/features/matches/models/player-match.model.ts)
- [Backend Schema: `PlayerMatchSchema`](../../../../../statsboards-backend/src/player_match/schemas.py)
- **Backend API Endpoint:** Players are part of `ComprehensiveMatchData` loaded via match detail endpoint

**For match data:**

- Match data is loaded as part of `ComprehensiveMatchData` from parent component
- Includes teams data (team_a, team_b) with logos and names
- [Interface: `ComprehensiveMatchData`](../../../../src/app/features/matches/models/comprehensive-match.model.ts)
- See [Match Detail Schema](../match-detail.md) for full API endpoint details

**For static assets:**

- Team logo URLs (buildStaticUrl)
