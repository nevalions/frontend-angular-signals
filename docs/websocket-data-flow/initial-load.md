# Initial Load

When a client connects, the backend sends all required data in a single `initial-load` message.

## Backend Process

Location: `statsboards-backend/src/websocket/match_handler.py:21-76`

```python
async def send_initial_data(self, websocket: WebSocket, client_id: str, match_id: int):
    # 1. Fetch all data in parallel
    (
        initial_data,          # match + scoreboard + teams + matchdata
        initial_playclock_data,
        initial_gameclock_data,
        initial_event_data,
        initial_stats_data,
    ) = await asyncio.gather(
        fetch_with_scoreboard_data(match_id),
        fetch_playclock(match_id),
        fetch_gameclock(match_id),
        fetch_event(match_id),
        fetch_stats(match_id),
    )

    # 2. Combine into single message
    combined_data = {
        "type": "initial-load",
        "data": {
            # From fetch_with_scoreboard_data
            "match": {...},
            "scoreboard_data": {...},
            "teams_data": {team_a: {...}, team_b: {...}},
            "match_data": {...},
            "players": [...],
            "events": [...],

            # From separate fetches
            "gameclock": {...},
            "playclock": {...},
            "statistics": {...},

            "server_time_ms": int(time.time() * 1000),
        },
    }

    # 3. Send to client
    await websocket.send_json(combined_data)
```

## Message Schema

```json
{
  "type": "initial-load",
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
      "tournament_id": 2,
      "main_sponsor_id": 1,
      "sponsor_line_id": 1,
      "isprivate": false
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
      "is_flag": false,
      "team_a_game_color": "#FF0000",
      "team_b_game_color": "#0000FF",
      "team_a_game_title": "Team A",
      "team_b_game_title": "Team B",
      "scale_tournament_logo": 2,
      "scale_logo_a": 2,
      "scale_logo_b": 2
    },

    "teams_data": {
      "team_a": {
        "id": 10,
        "title": "Team A",
        "team_color": "#FF0000",
        "city": "City A",
        "team_logo_url": "..."
      },
      "team_b": {
        "id": 11,
        "title": "Team B",
        "team_color": "#0000FF",
        "city": "City B",
        "team_logo_url": "..."
      }
    },

    "players": [
      {
        "id": 100,
        "player_id": 50,
        "match_id": 5,
        "team_id": 10,
        "is_starting": true,
        "is_active": true,
        "person": {
          "id": 50,
          "first_name": "John",
          "last_name": "Doe",
          "jersey_number": 12
        },
        "position": {
          "id": 5,
          "title": "QB"
        }
      }
    ],

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

    "gameclock": {
      "id": 789,
      "match_id": 5,
      "gameclock": 720,
      "gameclock_status": "paused"
    },

    "playclock": {
      "id": 321,
      "match_id": 5,
      "playclock": 40,
      "playclock_status": "running"
    },

    "statistics": {
      "match_id": 5,
      "team_a_stats": {},
      "team_b_stats": {}
    },

    "server_time_ms": 1706433600000
  }
}
```

## Frontend Handling

Location: `src/app/core/services/websocket-message-handlers.ts`

```typescript
handleMessage(message: WebSocketMessage): void {
  if (messageType === 'initial-load') {
    const data = message['data'];
    const matchData: ComprehensiveMatchData = {
      match_data: data['match_data'],
      scoreboard: data['scoreboard_data'],
      match: data['match'],
      teams: data['teams_data'],
      gameclock: data['gameclock'],
      playclock: data['playclock'],
      events: data['events'],
    };

    this.context.matchData.set(matchData);

    if (matchData.gameclock) {
      this.context.gameClock.set(this.context.mergeGameClock(matchData.gameclock));
    }
    if (matchData.playclock) {
      this.context.playClock.set(this.context.mergePlayClock(matchData.playclock));
    }

    this.context.events.set(matchData.events);
    this.context.statistics.set(data['statistics']);
  }
}
```

## Related Documentation

- [Message Schemas](./message-schemas.md)
- [Frontend Handling](./frontend-handling.md)
