# Connection Flow

```text
Frontend (client)                      Backend
  1. Connect (ws://.../ws/id/{match_id}/{client_id}/)
  2. Fetch comprehensive data (match, teams, players, events, etc.)
  3. Send initial-load message
  4. Client receives initial-load
  5. Initialize signals with full data

UI ready

... ongoing updates via database triggers ...
```

WebSocket endpoint:

```
ws://localhost:9000/api/matches/ws/id/{match_id}/{client_id}/
```

Connection handler: `statsboards-backend/src/websocket/match_handler.py:34-42`

## Related Documentation

- [Initial Load](./initial-load.md)
- [Message Types](./message-types.md)
