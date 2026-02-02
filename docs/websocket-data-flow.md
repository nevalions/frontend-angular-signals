# WebSocket Data Flow - Backend to Clients

This document describes how data flows from the backend to frontend clients via WebSocket connections for real-time match updates.

## Table of Contents

- [Overview](#overview)
- [Connection Flow](#connection-flow)
- [Message Types](#message-types)
- [Initial Load](#initial-load)
- [Update Flow](#update-flow)
- [Message Schemas](#message-schemas)
- [Frontend Handling](#frontend-handling)
- [Error Handling](#error-handling)

## Overview

The WebSocket system enables real-time synchronization of match data across all connected clients. When data changes in the database, PostgreSQL triggers notify the backend, which broadcasts updates to all connected WebSocket clients for that match.

**Key Principles:**
- **Full Objects**: WebSocket messages always send complete objects, not partial updates
- **Real-time**: Updates are pushed immediately via database triggers
- **Broadcast**: All clients receive the same updates
- **Optimized**: Partial updates from frontend → Full updates to clients via WebSocket

## Connection Flow

```
┌─────────────┐         1. Connect          ┌──────────────┐
│  Frontend   │ ──────────────────────────> │   Backend    │
│  (Client)   │ ws://.../ws/id/{match_id}/{client_id}/│              │
└─────────────┘                           └──────────────┘
                                               │
                                               │ 2. Fetch comprehensive data
                                               │    (match, teams, players, events, etc.)
                                               │
                                               │ 3. Send initial-load message
                                               │
┌─────────────┐         4. Receive         ┌──────────────┐
│  Frontend   │ <─────────────────────────── │   Backend    │
│  (Client)   │     initial-load             │              │
└─────────────┘                           └──────────────┘
       │
       │ 5. Initialize signals with full data
       │
       ▼
    UI Ready

6. ...ongoing updates via database triggers...
```

**WebSocket Endpoint:**
```
ws://localhost:9000/api/matches/ws/id/{match_id}/{client_id}/
```

**Connection Handler:** `src/websocket/match_handler.py:34-42`

## Message Types

### Available Message Types

| Message Type | Purpose | Trigger | Content |
|-------------|---------|----------|----------|
| `initial-load` | Initial data on connection | Client connects | Full comprehensive match data |
| `match-update` | Match data changes | Database trigger on match/matchdata/scoreboard tables | Full match, matchdata, scoreboard, teams |
| `gameclock-update` | Game clock changes | Database trigger on gameclock table | Full GameClock object |
| `playclock-update` | Play clock changes | Database trigger on playclock table | Full PlayClock object |
| `event-update` | Football events changes | Database trigger on football_event table | Events array |
| `statistics-update` | Match stats changes | Database trigger (throttled) | Full MatchStats object |
| `ping` | Connection health check | Backend heartbeat | Timestamp |

## Initial Load

When a client connects, the backend immediately sends all required data in a single `initial-load` message.

### Backend Process

**Location:** `src/websocket/match_handler.py:21-76`

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

### Message Schema

```json
{
  "type": "initial-load",
  "data": {
    "match_id": 5,
    "id": 5,
    "status_code": 200,

    // Match details
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

    // Match scoreboard data (score, quarter, down, etc.)
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
      "timeout_team_a": "●●●",
      "timeout_team_b": "●●●",
      "field_length": 92
    },

    // Scoreboard display settings
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

    // Teams data
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

    // Players in match
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
      // ... more players
    ],

    // Football events (touchdowns, interceptions, etc.)
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
      // ... more events
    ],

    // Game clock
    "gameclock": {
      "id": 789,
      "match_id": 5,
      "gameclock": 720,  // seconds remaining
      "gameclock_status": "paused"
    },

    // Play clock
    "playclock": {
      "id": 321,
      "match_id": 5,
      "playclock": 40,
      "playclock_status": "running"
    },

    // Match statistics
    "statistics": {
      "match_id": 5,
      "team_a_stats": {...},
      "team_b_stats": {...}
    },

    // Server timestamp for clock synchronization
    "server_time_ms": 1706433600000
  }
}
```

### Frontend Handling

**Location:** `src/app/core/services/websocket-message-handlers.ts`

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

    // Set main match data signal
    this.context.matchData.set(matchData);

    // Set separate clock signals for predictor sync
    if (matchData.gameclock) {
      this.context.gameClock.set(this.context.mergeGameClock(matchData.gameclock));
    }
    if (matchData.playclock) {
      this.context.playClock.set(this.context.mergePlayClock(matchData.playclock));
    }

    // Set events and stats
    this.context.events.set(matchData.events);
    this.context.statistics.set(data['statistics']);
  }
}
```

## Update Flow

Updates flow from frontend → backend → database → triggers → WebSocket broadcast → all clients.

### Complete Update Flow

```
┌─────────────┐                              ┌─────────────────┐
│  Frontend   │                              │   PostgreSQL     │
│  (Client 1) │                              │   Database      │
└──────┬──────┘                              └────────┬────────┘
       │                                               │
       │ 1. Send partial HTTP update                     │
       │    PUT /api/matchdata/123/                    │
       │    { score_team_a: 7 }                        │
       │                                               │
       ▼                                               │
┌─────────────┐                                        │
│   Backend   │ ◄────────────────────────────────────────┤
│   (API)     │ 2. Update row                           │
└──────┬──────┘    SET score_team_a = 7              │
       │                                         │     │
       │                                         │     │
       │ 3. Return full updated object             │     │
       │    { id: 123, score_team_a: 7, ... }    │     │
       │                                         │     │
       └─────────────────────────────────────────────────┘
                                                      │
                                                      │ 4. Trigger fires (AFTER UPDATE)
                                                      │    pg_notify('matchdata_change', {...})
                                                      │
┌──────────────────────────────────────────────────────────┤
│                   WebSocket Manager                     │
│  Listens for PostgreSQL notifications                   │
└──────────────────┬─────────────────────────────────────┘
                   │
                   │ 5. Receive notification
                   │    { type: "match-update", match_id: 5,
                   │      data: { id: 123, match_id: 5,
                   │             score_team_a: 7, ... } }
                   │
                   │
                   │ 6. Fetch updated data
                   │    fetch_with_scoreboard_data(match_id)
                   │
                   │
                   │ 7. Broadcast to all subscribed clients
                   │
       ┌───────────┴──────────┬──────────────────┐
       │                      │                  │
       ▼                      ▼                  ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Frontend   │     │  Frontend   │     │  Frontend   │
│  (Client 1) │     │  (Client 2) │     │  (Client 3) │
│  (Sender)   │     │             │     │             │
└─────────────┘     └─────────────┘     └─────────────┘
       │                      │                  │
       │ 8. Receive          │ 8. Receive       │ 8. Receive
       │    match-update      │    match-update   │    match-update
       │    with full data    │    with full data │    with full data
       │                      │                  │
       ▼                      ▼                  ▼
   Merge signals           Merge signals       Merge signals
```

### Database Triggers

**Location:** `alembic/versions/2026_01_27_1000-stab147_matchdata.py`

```sql
CREATE OR REPLACE FUNCTION notify_matchdata_change() RETURNS trigger AS $$
BEGIN
    IF (TG_OP = 'DELETE') THEN
        PERFORM pg_notify('matchdata_change',
            json_build_object(
                'table', TG_TABLE_NAME,
                'operation', TG_OP,
                'old_id', OLD.id,
                'match_id', OLD.match_id
            )::text);
    ELSE
        PERFORM pg_notify('matchdata_change',
            json_build_object(
                'table', TG_TABLE_NAME,
                'operation', TG_OP,
                'new_id', NEW.id,
                'old_id', OLD.id,
                'match_id', NEW.match_id,
                'data', row_to_json(NEW)  -- Full row data!
            )::text);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER matchdata_change
AFTER INSERT OR UPDATE OR DELETE ON matchdata
FOR EACH ROW EXECUTE PROCEDURE notify_matchdata_change();
```

**Similar triggers exist for:**
- `match_change` (on `match` table)
- `scoreboard_change` (on `scoreboard` table)
- `playclock_change` (on `playclock` table)
- `gameclock_change` (on `gameclock` table)
- `football_event_change` (on `football_event` table)

### Backend WebSocket Listener

**Location:** `src/utils/websocket/websocket_manager.py:132-141`

```python
async def match_data_listener(self, connection, pid, channel, payload):
    # 1. Parse notification from PostgreSQL
    data = json.loads(payload.strip())

    # 2. Extract match_id
    match_id = data["match_id"]

    # 3. Add message type
    data["type"] = "match-update"

    # 4. Invalidate cache (if cache service available)
    if self._cache_service:
        self._cache_service.invalidate_match_data(match_id)

    # 5. Broadcast to all subscribed clients
    await connection_manager.send_to_all(data, match_id=match_id)
```

**Note:** The listener doesn't send the data directly. It adds it to a queue, and the queue processor handles fetching full data and broadcasting.

### Backend Queue Processor

**Location:** `src/websocket/match_handler.py:124-154`

```python
async def process_data_websocket(self, websocket, WebSocket, client_id: str, match_id: int):
    # Map message types to handlers
    handlers = {
        "initial-load": self.process_match_data,
        "message-update": self.process_match_data,
        "match-update": self.process_match_data,
        "gameclock-update": self.process_gameclock_data,
        "playclock-update": self.process_playclock_data,
        "event-update": self.process_event_data,
        "statistics-update": self.process_stats_data,
    }

    # Process queue messages
    while True:
        queue = await connection_manager.get_queue_for_client(client_id)
        data = await asyncio.wait_for(queue.get(), timeout=60.0)

        message_type = data.get("type")
        if message_type in handlers:
            # Fetch full data and send
            await handlers[message_type](websocket, match_id, data)
```

### Backend Data Fetcher

**Location:** `src/websocket/match_handler.py:157-202`

```python
async def process_match_data(
    self, websocket: WebSocket, match_id: int, data: dict | None = None
):
    if data is None:
        # No data provided - fetch full data
        full_match_data = await fetch_with_scoreboard_data(match_id)
        full_match_data["type"] = "match-update"
    else:
        # Data provided from trigger (has match_id, but need full objects)
        if data.get("type") == "initial-load" and "data" in data:
            full_match_data = {
                **data["data"],
                "type": "match-update",
            }
        else:
            # Use data as-is (already has what we need)
            full_match_data = data

    # Send to client
    if websocket.application_state == WebSocketState.CONNECTED:
        await websocket.send_json(full_match_data)
```

### Broadcasting to All Clients

**Location:** `src/utils/websocket/websocket_manager.py:347-361`

```python
async def send_to_all(self, data: str, match_id: str | None = None):
    if match_id:
        # Iterate over all subscribed clients for this match
        for client_id in self.match_subscriptions.get(match_id, []):
            if client_id in self.queues:
                # Add to each client's queue
                await self.queues[client_id].put(data)
```

## Message Schemas

### Match Update Message

Sent when: match, matchdata, scoreboard, or teams change

```json
{
  "type": "match-update",
  "match_id": 5,
  "data": {
    "match_id": 5,
    "id": 5,
    "status_code": 200,

    // Updated match data (FULL object)
    "match": {
      "id": 5,
      "match_date": "2024-01-15T15:00:00",
      "week": 3,
      "team_a_id": 10,
      "team_b_id": 11,
      "tournament_id": 2
    },

    // Updated matchdata (FULL object)
    "match_data": {
      "id": 123,
      "match_id": 5,
      "score_team_a": 7,      // ← Updated
      "score_team_b": 3,
      "game_status": "in-progress",
      "qtr": "1st",
      "down": "1st",
      "distance": "10",
      "ball_on": 20,
      "timeout_team_a": "●●●",
      "timeout_team_b": "●●●",
      "field_length": 92
    },

    // Updated scoreboard (FULL object)
    "scoreboard_data": {
      "id": 456,
      "match_id": 5,
      "is_flag": true,         // ← Updated
      "team_a_game_color": "#FF0000",
      "team_b_game_color": "#0000FF"
    },

    // Updated teams (FULL objects)
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

    // Players (if included)
    "players": [...],

    // Events (if included)
    "events": [...]
  }
}
```

### Game Clock Update Message

Sent when: game clock changes (time or status)

```json
{
  "type": "gameclock-update",
  "match_id": 5,
  "id": 789,
  "gameclock": 654,            // ← Updated seconds remaining
  "gameclock_status": "running", // ← Updated status
  "server_time_ms": 1706433600000
}
```

### Play Clock Update Message

Sent when: play clock changes (time or status)

```json
{
  "type": "playclock-update",
  "match_id": 5,
  "id": 321,
  "playclock": 35,              // ← Updated seconds
  "playclock_status": "running", // ← Updated status
  "server_time_ms": 1706433600000
}
```

### Event Update Message

Sent when: football events are added, updated, or deleted

**Note:** Throttled to 2 seconds to avoid excessive updates (see migration `2026_01_27_1153-589ef1bd6ca9_fix_ambiguous_match_id_in_trigger.py`)

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
    },
    // ... all events for match (full list)
  ],
  "server_time_ms": 1706433600000
}
```

### Statistics Update Message

Sent when: match statistics change (also throttled)

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

### Ping Message

Sent periodically: every 60 seconds from backend

```json
{
  "type": "ping",
  "timestamp": 1706433600000
}
```

Client should respond with:
```json
{
  "type": "pong",
  "timestamp": 1706433600000
}
```

## Frontend Handling

### WebSocket Service

**Location:** `src/app/core/services/websocket.service.ts`

#### Signals for Full Data
```typescript
// Main comprehensive data (set on initial-load)
readonly matchData = signal<ComprehensiveMatchData | null>(null);

// Separate clock signals (updated for predictor sync)
readonly gameClock = signal<GameClock | null>(null);
readonly playClock = signal<PlayClock | null>(null);

// Events and stats
readonly events = signal<FootballEvent[]>([]);
readonly statistics = signal<MatchStats | null>(null);
```

#### Signals for Partial Updates
```typescript
// Partial update signals (updated on subsequent messages)
readonly matchDataPartial = signal<MatchData | null>(null);
readonly scoreboardPartial = signal<unknown | null>(null);
readonly matchPartial = signal<MatchWithDetails | null>(null);
readonly teamsPartial = signal<{team_a: Team; team_b: Team} | null>(null);
readonly playersPartial = signal<PlayerMatchWithDetails[] | null>(null);
readonly eventsPartial = signal<FootballEvent[] | null>(null);

// Last update timestamps
readonly lastMatchDataUpdate = signal<number | null>(null);
readonly lastMatchUpdate = signal<number | null>(null);
readonly lastTeamsUpdate = signal<number | null>(null);
readonly lastPlayersUpdate = signal<number | null>(null);
readonly lastEventsUpdate = signal<number | null>(null);
```

#### Message Handler

**Location:** `src/app/core/services/websocket-message-handlers.ts`

```typescript
handleMessage(message: WebSocketMessage): void {
  const messageType = message['type'];
  const data = message['data'];

  // Handle initial-load
  if (messageType === 'initial-load') {
    this.context.matchData.set(comprehensiveData);
    this.context.gameClock.set(comprehensiveData.gameclock);
    this.context.playClock.set(comprehensiveData.playclock);
    this.context.events.set(comprehensiveData.events);
    this.context.statistics.set(data['statistics']);
  }

  // Handle match-update (partial updates)
  if (messageType === 'message-update' || messageType === 'match-update') {
    if (data['match_data']) {
      this.context.matchDataPartial.set(data['match_data']);
      this.context.lastMatchDataUpdate.set(Date.now());
    }
    if (data['scoreboard_data']) {
      this.context.scoreboardPartial.set(data['scoreboard_data']);
    }
    if (data['match']) {
      this.context.matchPartial.set(data['match']);
      this.context.lastMatchUpdate.set(Date.now());
    }
    if (data['teams_data']) {
      this.context.teamsPartial.set(data['teams_data']);
      this.context.lastTeamsUpdate.set(Date.now());
    }
    if (data['players']) {
      this.context.playersPartial.set(data['players']);
      this.context.lastPlayersUpdate.set(Date.now());
    }
    if (data['events']) {
      this.context.eventsPartial.set(data['events']);
      this.context.lastEventsUpdate.set(Date.now());
    }
  }

  // Handle gameclock-update
  if (messageType === 'gameclock-update') {
    const gameclock = message['gameclock'];
    const merged = this.context.mergeGameClock(gameclock);
    this.context.gameClock.set(merged);
  }

  // Handle playclock-update
  if (messageType === 'playclock-update') {
    const playclock = message['playclock'];
    const merged = this.context.mergePlayClock(playclock);
    this.context.playClock.set(merged);
  }

  // Handle event-update
  if (messageType === 'event-update') {
    this.handleEventUpdate(message);
  }

  // Handle statistics-update
  if (messageType === 'statistics-update') {
    this.handleStatisticsUpdate(message);
  }

  // Handle ping
  if (messageType === 'ping') {
    this.handlePing(message);
}
}
```

#### Facade Effects for Merging

**Location:** `src/app/features/scoreboard/pages/admin/scoreboard-admin.facade.ts`

```typescript
// Merge match_data updates
private wsMatchDataPartialEffect = effect(() => {
  const partial = this.wsService.matchDataPartial();
  if (!partial) return;

  const current = untracked(() => this.data());
  if (!current) return;

  // Merge only match_data field
  this.data.set({
    ...current,
    match_data: partial,
  });
});

// Merge scoreboard updates
private wsScoreboardPartialEffect = effect(() => {
  const partial = this.wsService.scoreboardPartial();
  if (!partial) return;

  const current = untracked(() => this.data());
  if (!current) return;

  this.data.set({
    ...current,
    scoreboard: partial as ComprehensiveMatchData['scoreboard'],
  });

  // Also update separate scoreboard signal
  this.scoreboard.set(partial as Scoreboard);
});

// Merge match updates
private wsMatchPartialEffect = effect(() => {
  const partial = this.wsService.matchPartial();
  if (!partial) return;

  const current = untracked(() => this.data());
  if (!current) return;

  this.data.set({
    ...current,
    match: partial,
  });
});

// Merge teams updates
private wsTeamsPartialEffect = effect(() => {
  const partial = this.wsService.teamsPartial();
  if (!partial) return;

  const current = untracked(() => this.data());
  if (!current) return;

  this.data.set({
    ...current,
    teams: partial,
  });
});

// Merge players updates
private wsPlayersFromMatchUpdateEffect = effect(() => {
  const players = this.wsService.playersPartial();
  if (!players) return;

  const current = untracked(() => this.data());
  if (!current) return;

  // Only merge if different
  if (JSON.stringify(current.players) !== JSON.stringify(players)) {
    this.data.set({
      ...current,
      players,
    });
  }
});

// Merge events updates
private wsEventsFromMatchUpdateEffect = effect(() => {
  const events = this.wsService.eventsPartial();
  if (!events) return;

  const current = untracked(() => this.data());
  if (!current) return;

  this.data.set({
    ...current,
    events,
  });
});
```

## Error Handling

### Connection Errors

**Client-Side Handling:**
```typescript
// websocket-connection-manager.ts
this.socket$
  .pipe(
    catchError((error) => {
      console.error('[WebSocket] Error:', error);
      this.options.setLastError(error?.message || 'WebSocket error');
      this.handleDisconnect(); // Attempt reconnection
      return EMPTY;
    })
  )
  .subscribe();
```

**Backend-Side Handling:**
```python
# match_handler.py
try:
    await websocket.send_json(data)
except ConnectionClosedOK:
    websocket_logger.debug("WebSocket closed normally")
except ConnectionClosedError as e:
    websocket_logger.error(f"WebSocket closed with error: {e}")
except RuntimeError as e:
    if "websocket.close" in str(e):
        websocket_logger.debug("WebSocket already closed")
    else:
        websocket_logger.error(f"Unexpected RuntimeError: {e}")
        raise
```

### Data Validation

**Backend validation:**
```python
# websocket_manager.py:93-118
async def _base_listener(self, connection, pid, channel, payload, update_type, invalidate_func=None):
    if not payload or not payload.strip():
        self.logger.warning("Empty payload received")
        return

    try:
        data = json.loads(payload.strip())
        match_id = data.get("match_id")

        if not match_id:
            self.logger.warning(f"Missing match_id in {update_type} notification")
            return

        data["type"] = update_type

        # ... rest of processing

    except json.JSONDecodeError as e:
        self.logger.error(f"JSON decode error in {update_type}: {e}")
    except Exception as e:
        self.logger.error(f"Error in {update_type}: {e}")
```

### Stale Connection Cleanup

**Location:** `src/utils/websocket/websocket_manager.py:334-346`

```python
async def cleanup_stale_connections(self, timeout_seconds: float = 90.0):
    now = time.time()
    stale_clients = [
        client_id
        for client_id, last_seen in self.last_activity.items()
        if now - last_seen > timeout_seconds
    ]

    for client_id in stale_clients:
        self.logger.warning(
            f"Cleaning up stale connection for client {client_id} "
            f"(inactive for {now - self.last_activity[client_id]:.1f}s)"
        )
        await self.disconnect(client_id)
```

## Performance Optimizations

### Throttling

**Event and statistics updates are throttled to avoid excessive broadcasts:**

```sql
-- From migration: 2026_01_27_1153-589ef1bd6ca9_fix_ambiguous_match_id_in_trigger.py
CREATE OR REPLACE FUNCTION notify_football_event_change() RETURNS trigger AS $$
DECLARE
    last_notify TIMESTAMP;
    throttle_seconds INTEGER := 2;  -- Throttle to 2 seconds
    match_id INTEGER;
BEGIN
    IF (TG_OP = 'DELETE') THEN
        match_id := OLD.match_id;
        PERFORM pg_notify('football_event_change', ...);
        RETURN OLD;
    ELSE
        match_id := NEW.match_id;
        SELECT last_notified_at INTO last_notify
        FROM match_stats_throttle
        WHERE match_stats_throttle.match_id = NEW.match_id;

        -- Only notify if last notification was > 2 seconds ago
        IF last_notify IS NULL OR
           EXTRACT(EPOCH FROM (NOW() - last_notify)) > throttle_seconds THEN
            INSERT INTO match_stats_throttle (match_id, last_notified_at)
            VALUES (NEW.match_id, NOW())
            ON CONFLICT (match_id) DO UPDATE
            SET last_notified_at = NOW();

            PERFORM pg_notify('football_event_change', ...);
        END IF;

        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;
```

### Caching

**Backend cache invalidation:**
```python
async def match_data_listener(self, connection, pid, channel, payload):
    # Invalidate cache when data changes
    if self._cache_service:
        self._cache_service.invalidate_match_data(match_id)
```

**Cache services:**
- `match_data` - matchdata table
- `gameclock` - gameclock table
- `playclock` - playclock table
- `event_data` - football_event table
- `stats` - aggregated statistics

### Batch Fetching

**Initial load fetches all data in parallel:**
```python
(
    initial_data,
    initial_playclock_data,
    initial_gameclock_data,
    initial_event_data,
    initial_stats_data,
) = await asyncio.gather(
    fetch_with_scoreboard_data(match_id),  # Includes: match, matchdata, scoreboard, teams, players
    fetch_playclock(match_id),
    fetch_gameclock(match_id),
    fetch_event(match_id),
    fetch_stats(match_id),
)
```

## Key Takeaways

1. **Full Objects Only**: WebSocket messages always send complete objects, not partial changes
2. **Database-Driven**: Updates are triggered by PostgreSQL triggers, not manual notifications
3. **Broadcast Pattern**: All connected clients receive the same updates simultaneously
4. **Partial Merging**: Frontend receives full objects but merges them into existing signals
5. **Optimized**: Throttling, caching, and parallel fetching ensure performance
6. **Real-Time**: Updates are pushed immediately after database changes
7. **Consistent State**: All clients maintain identical state via full object replacements

## Related Documentation

- [Backend API Documentation](http://localhost:9000/docs) - Interactive API docs
- [Angular Signals Best Practices](./angular-signals-best-practices.md)
- [Component Patterns](./component-patterns.md)
- [Backend WebSocket Handler](../../statsboards-backend/src/websocket/match_handler.py)
- [Backend WebSocket Manager](../../statsboards-backend/src/utils/websocket/websocket_manager.py)
