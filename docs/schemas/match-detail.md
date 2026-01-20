# Match Detail Page Schema

**Route**: `/matches/:id`

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
│  [Scoreboard Admin]  [Scoreboard View]                   │
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

- Tab navigation: Match Players, Events, Stats
- Tab content area → Shows data for selected tab

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
