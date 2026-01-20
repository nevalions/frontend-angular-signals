# Stats Tab Schema

**Tab**: Stats
**Parent**: [Match Detail](../match-detail.md)

```
┌─────────────────────────────────────────────────────────────┐
│  [Team A]              vs              [Team B]            │
└─────────────────────────────────────────────────────────────┘
                                                                │
┌─────────────────────────────────────────────────────────────┐
│  Team Statistics                                            │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Statistic              Team A    Team B         │    │
│  │  Total Offense Yards    350       280             │    │
│  │  Passing Yards          220       180             │    │
│  │  Rushing Yards          130       100             │    │
│  │  Third Down Conversions 8/12     5/11            │    │
│  │  Fourth Down Conversions 1/1     0/1             │    │
│  │  Turnovers              2         1               │    │
│  │  First Downs Gained     18        15              │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                                                                │
┌─────────────────────────────────────────────────────────────┐
│  Quarterback Statistics                                     │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Player                    Team A      Team B    │    │
│  │  #99 John Smith              25-32       18-28     │    │
│  │  Passing Yards              220         180        │    │
│  │  Touchdowns                  2           1         │    │
│  │  Interceptions               1           0         │    │
│  │  QB Rating                 105.5       98.2       │    │
│  │  Rushing Attempts            5           8         │    │
│  │  Rushing Yards               15          32        │    │
│  │  Rushing Touchdowns           0           0         │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                                                                │
┌─────────────────────────────────────────────────────────────┐
│  Offense Statistics                                        │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Player                Team A       Team B       │    │
│  │  #84 Mike Johnson     5 catches   4 catches     │    │
│  │  Receiving Yards       120         95            │    │
│  │  Touchdowns              2           1            │    │
│  │  #75 Chris Williams   3 catches   5 catches     │    │
│  │  Receiving Yards        55         110           │    │
│  │  Touchdowns              0           0            │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                                                                │
┌─────────────────────────────────────────────────────────────┐
│  Defense Statistics                                        │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Player                Team A       Team B       │    │
│  │  #52 Sam Davis        8 tackles   6 tackles      │    │
│  │  Assists               3           2             │    │
│  │  Sacks                 2           0             │    │
│  │  Interceptions         1           0             │    │
│  │  #58 Mike Wilson      6 tackles   7 tackles      │    │
│  │  Assists               2           4             │    │
│  │  Sacks                 1           1             │    │
│  │  Interceptions         0           1             │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

## What's on the tab

- Team statistics table (side-by-side comparison)
- Quarterback statistics table (side-by-side comparison)
- Offense statistics table (side-by-side comparison)
- Defense statistics table (side-by-side comparison)
- Each statistic shows values for both Team A and Team B
- Statistics calculated from match events and player data

## What we need from backend

**For match statistics:**

- Team stats (both teams)
- QB stats (both teams)
- Offense stats (both teams)
- Defense stats (both teams)
- Match id
- [Interface: `FootballTeamStats`](../../../../src/app/features/matches/models/match.model.ts)
- [Interface: `FootballQBStats`](../../../../src/app/features/matches/models/match.model.ts)
- [Interface: `FootballOffenseStats`](../../../../src/app/features/matches/models/match.model.ts)
- [Interface: `FootballDefenseStats`](../../../../src/app/features/matches/models/match.model.ts)
- [Backend Schema: `FootballTeamStats`](../../../../../statsboards-backend/src/matches/schemas.py:88-105)
- [Backend Schema: `FootballQBStats`](../../../../../statsboards-backend/src/matches/schemas.py:58-73)
- [Backend Schema: `FootballOffenseStats`](../../../../../statsboards-backend/src/matches/schemas.py:43-55)
- [Backend Schema: `FootballDefenseStats`](../../../../../statsboards-backend/src/matches/schemas.py:76-86)
- **Backend API Endpoint:** `GET /api/matches/{match_id}/stats/`

**For player details in stats:**

- Player match id
- Player number
- Player name
- Position
- Team id
- **Backend API Endpoint:** `GET /api/players_match/` (filter by match_id)
