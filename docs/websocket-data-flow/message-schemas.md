# Message Schemas

## Match Update Message

Sent when: match, matchdata, scoreboard, or teams change.

```json
{
  "type": "match-update",
  "match_id": 5,
  "data": {
    "match_id": 5,
    "id": 5,
    "status_code": 200,

    "match": {
      "id": 5,
      "match_date": "2024-01-15T15:00:00",
      "week": 3,
      "team_a_id": 10,
      "team_b_id": 11,
      "tournament_id": 2
    },

    "match_data": {
      "id": 123,
      "match_id": 5,
      "score_team_a": 7,
      "score_team_b": 3,
      "game_status": "in-progress",
      "qtr": "1st",
      "down": "1st",
      "distance": "10",
      "ball_on": 20,
      "timeout_team_a": "***",
      "timeout_team_b": "***",
      "field_length": 92
    },

    "scoreboard_data": {
      "id": 456,
      "match_id": 5,
      "is_flag": true,
      "team_a_game_color": "#FF0000",
      "team_b_game_color": "#0000FF"
    },

    "teams_data": {
      "team_a": {
        "id": 10,
        "title": "Team A",
        "team_color": "#FF0000",
        "team_logo_url": "..."
      },
      "team_b": {
        "id": 11,
        "title": "Team B",
        "team_color": "#0000FF",
        "team_logo_url": "..."
      }
    },

    "players": [
      {
        "id": 100,
        "match_number": "12",
        "player_team_tournament": {
          "player_number": "12"
        }
      }
    ],

    "events": []
  }
}
```

## Game Clock Update Message

Sent when: game clock changes (time or status).

```json
{
  "type": "gameclock-update",
  "match_id": 5,
  "id": 789,
  "gameclock": 654,
  "gameclock_status": "running",
  "server_time_ms": 1706433600000
}
```

## Play Clock Update Message

Sent when: play clock changes (time or status).

```json
{
  "type": "playclock-update",
  "match_id": 5,
  "id": 321,
  "playclock": 35,
  "playclock_status": "running",
  "server_time_ms": 1706433600000
}
```

## Event Update Message

Sent when: football events are added, updated, or deleted.

Note: throttled to 2 seconds to avoid excessive updates (see migration `2026_01_27_1153-589ef1bd6ca9_fix_ambiguous_match_id_in_trigger.py`).

```json
{
  "type": "event-update",
  "match_id": 5,
  "events": [
    {
      "id": 1000,
      "match_id": 5,
      "event_type": "touchdown",
      "team_id": 10,
      "player_id": 50,
      "quarter": "1st",
      "time_seconds": 120,
      "description": "Touchdown"
    }
  ],
  "server_time_ms": 1706433600000
}
```

## Statistics Update Message

Sent when: match statistics change (also throttled).

```json
{
  "type": "statistics-update",
  "match_id": 5,
  "data": {
    "match_id": 5,
    "team_a_stats": {
      "offence_yards": 250,
      "pass_yards": 180,
      "run_yards": 70,
      "turnovers": 1
    },
    "team_b_stats": {
      "offence_yards": 150,
      "pass_yards": 120,
      "run_yards": 30,
      "turnovers": 2
    }
  },
  "server_time_ms": 1706433600000
}
```

## Related Documentation

- [Message Types](./message-types.md)
- [Update Flow](./update-flow.md)
