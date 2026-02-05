# Update Flow

Updates flow from frontend -> backend -> database -> triggers -> WebSocket broadcast -> all clients.

## Complete Update Flow

```text
Frontend (client 1)                      PostgreSQL
  1. Send partial HTTP update
     PUT /api/matchdata/123/
     { score_team_a: 7 }

Backend (API)
  2. Update row
     SET score_team_a = 7
  3. Return full updated object
     { id: 123, score_team_a: 7, ... }

Database trigger fires
  4. pg_notify('matchdata_change', {...})

WebSocket manager
  5. Receive notification
     { type: "match-update", match_id: 5, data: { ... } }
  6. Fetch updated data
  7. Broadcast to all subscribed clients

All clients receive match-update and merge signals
```

## Database Triggers

Location: `statsboards-backend/alembic/versions/2026_01_27_1000-stab147_matchdata.py`

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
                'data', row_to_json(NEW)
            )::text);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER matchdata_change
AFTER INSERT OR UPDATE OR DELETE ON matchdata
FOR EACH ROW EXECUTE PROCEDURE notify_matchdata_change();
```

Similar triggers exist for:

- `match_change` (on `match` table)
- `scoreboard_change` (on `scoreboard` table)
- `playclock_change` (on `playclock` table)
- `gameclock_change` (on `gameclock` table)
- `football_event_change` (on `football_event` table)

## Backend WebSocket Listener

Location: `statsboards-backend/src/utils/websocket/websocket_manager.py:132-141`

```python
async def match_data_listener(self, connection, pid, channel, payload):
    data = json.loads(payload.strip())
    match_id = data["match_id"]
    data["type"] = "match-update"

    if self._cache_service:
        self._cache_service.invalidate_match_data(match_id)

    await connection_manager.send_to_all(data, match_id=match_id)
```

## Backend Queue Processor

Location: `statsboards-backend/src/websocket/match_handler.py:124-154`

```python
async def process_data_websocket(self, websocket, WebSocket, client_id: str, match_id: int):
    handlers = {
        "initial-load": self.process_match_data,
        "message-update": self.process_match_data,
        "match-update": self.process_match_data,
        "gameclock-update": self.process_gameclock_data,
        "playclock-update": self.process_playclock_data,
        "event-update": self.process_event_data,
        "statistics-update": self.process_stats_data,
    }

    while True:
        queue = await connection_manager.get_queue_for_client(client_id)
        data = await asyncio.wait_for(queue.get(), timeout=60.0)

        message_type = data.get("type")
        if message_type in handlers:
            await handlers[message_type](websocket, match_id, data)
```

## Backend Data Fetcher

Location: `statsboards-backend/src/websocket/match_handler.py:157-202`

```python
async def process_match_data(
    self, websocket: WebSocket, match_id: int, data: dict | None = None
):
    if data is None:
        full_match_data = await fetch_with_scoreboard_data(match_id)
        full_match_data["type"] = "match-update"
    else:
        if data.get("type") == "initial-load" and "data" in data:
            full_match_data = {
                **data["data"],
                "type": "match-update",
            }
        else:
            full_match_data = data

    if websocket.application_state == WebSocketState.CONNECTED:
        await websocket.send_json(full_match_data)
```

## Broadcasting to All Clients

Location: `statsboards-backend/src/utils/websocket/websocket_manager.py:347-361`

```python
async def send_to_all(self, data: str, match_id: str | None = None):
    if match_id:
        for client_id in self.match_subscriptions.get(match_id, []):
            if client_id in self.queues:
                await self.queues[client_id].put(data)
```

## Related Documentation

- [Message Types](./message-types.md)
- [Message Schemas](./message-schemas.md)
- [Frontend Handling](./frontend-handling.md)
