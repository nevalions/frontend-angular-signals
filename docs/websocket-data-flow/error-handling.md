# Error Handling

## Connection Errors

Client-side handling:

```typescript
// websocket-connection-manager.ts
this.socket$
  .pipe(
    catchError((error) => {
      console.error('[WebSocket] Error:', error);
      this.options.setLastError(error?.message || 'WebSocket error');
      this.handleDisconnect();
      return EMPTY;
    })
  )
  .subscribe();
```

Backend-side handling:

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

## Data Validation

Backend validation:

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

## Stale Connection Cleanup

Location: `statsboards-backend/src/utils/websocket/websocket_manager.py:334-346`

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

## Related Documentation

- [Update Flow](./update-flow.md)
- [Performance Optimizations](./performance-optimizations.md)
