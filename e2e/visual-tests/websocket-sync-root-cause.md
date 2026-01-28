# Root Cause Analysis: WebSocket Event Sync Issue

## Problem Confirmed
✗ **Events created on Admin page do NOT sync to:**
  - Match View (HD) page (`/scoreboard/match/{id}/hd`)
  - Match Detail Events Tab page (`/sports/{sportId}/matches/{id}?tab=events`)

## Root Cause

The backend does **NOT** broadcast WebSocket updates when events are created, updated, or deleted via the API.

### Evidence

1. **Football Event API Endpoints** (`src/football_events/views.py`):
   ```python
   @router.post("/")
   async def create_football_event(...):
       new_football_event = await football_event_service.create(football_event)
       return FootballEventSchema.model_validate(new_football_event)
       # ❌ NO WebSocket broadcast here!
       # ❌ NO cache invalidation here!
   
   @router.put("/{item_id}/")
   async def update_football_event_endpoint(...):
       football_event_update = await football_event_service.update(item_id, football_event)
       return football_event_update
       # ❌ NO WebSocket broadcast here!
       # ❌ NO cache invalidation here!
   
   @router.delete("/id/{model_id}/")
   async def delete_football_event_endpoint(...):
       await football_event_service.delete(model_id)
       return {"detail": f"FootballEvent {model_id} deleted successfully"}
       # ❌ NO WebSocket broadcast here!
       # ❌ NO cache invalidation here!
   ```

2. **Football Event Service** (`src/football_events/db_services.py`):
   ```python
   @handle_service_exceptions(item_name=ITEM, operation="creating")
   async def create(self, item: FootballEventSchemaCreate) -> FootballEventDB:
       result = await super().create(item)
       self.logger.info(f"{ITEM} created")
       return result  # ❌ NO WebSocket broadcast!
       # ❌ NO cache invalidation!
   
   @handle_service_exceptions(item_name=ITEM, operation="updating")
   async def update(self, item_id: int, item: FootballEventSchemaUpdate, **kwargs):
       updated_ = await super().update(item_id, item, **kwargs)
       return updated_  # ❌ NO WebSocket broadcast!
       # ❌ NO cache invalidation!
   
   # Note: There's no explicit delete method shown, but BaseServiceDB likely has one
   ```

3. **WebSocket Event Broadcasting** (`src/websocket/match_handler.py`):
   ```python
   # The handler fetches event data on demand:
   async def fetch_event(event_id: int, database=None, cache_service=None):
       event_data = await fetch_event(match_id, cache_service=self.cache_service)
       event_data["type"] = "event-update"
       await websocket.send_json(event_data)
   ```
   
   **This only sends updates when CLIENT requests them**, not automatically when events change in database!

## What Should Happen

When an event is created/updated/deleted via the API:

1. **Database operation completes** (event created/updated/deleted)
2. **Cache should be invalidated** for the match's event data
3. **WebSocket message should be broadcast** to all connected clients for that match:
   - Type: `event-update` or `match-update`
   - Data: Full events array for the match
   - Match ID: The match ID
4. **All connected WebSocket clients receive the message** and update their signals:
   - `wsService.events()` signal updates
   - All pages react to the change

## Comparison: Working vs Non-Working

### What Works
- **Initial connection**: All pages receive `initial-load` message with events data
- **Event creation on Admin**: Admin page shows the event (because it's the creator)
- **Event updates on Admin**: Admin page reflects updates

### What Doesn't Work
- **Event sync to Match View**: Never receives WebSocket updates
- **Event sync to Match Detail Events Tab**: Never receives WebSocket updates

## Fix Required

### Solution 1: Add WebSocket Broadcasting to Event API Endpoints

Modify `src/football_events/views.py` to broadcast WebSocket updates:

```python
from src.websocket.websocket_manager import manager

@router.post("/")
async def create_football_event(
    football_event_service: FootballEventService,
    football_event: FootballEventSchemaCreate
):
    try:
        self.logger.debug(f"Creating {ITEM} endpoint")
        new_football_event = await football_event_service.create(football_event)
        
        # ✅ ADD: Broadcast WebSocket update to all connected clients
        await manager.broadcast_to_match(
            match_id=new_football_event.match_id,
            message={
                "type": "event-update",
                "data": {
                    "events": await football_event_service.get_events_with_players(new_football_event.match_id)
                }
            }
        )
        
        return FootballEventSchema.model_validate(new_football_event)
    except Exception as e:
        self.logger.error(f"Error creating football_event: {e}", exc_info=e)
        raise

@router.put("/{item_id}/")
async def update_football_event_endpoint(
    football_event_service: FootballEventService,
    item_id: int,
    football_event: FootballEventSchemaUpdate,
):
    try:
        self.logger.debug(f"Updating {ITEM} endpoint")
        football_event_update = await football_event_service.update(
            item_id,
            football_event,
        )
        
        # ✅ ADD: Broadcast WebSocket update to all connected clients
        await manager.broadcast_to_match(
            match_id=football_event_update.match_id,
            message={
                "type": "event-update",
                "data": {
                    "events": await football_event_service.get_events_with_players(football_event_update.match_id)
                }
            }
        )
        
        if football_event_update is None:
            raise HTTPException(status_code=404, detail=f"{ITEM} {item_id} not found")
        return football_event_update
    except HTTPException:
        raise
    except Exception as e:
        self.logger.error(f"Error updating football_event: {e}", exc_info=e)
        raise

@router.delete("/id/{model_id}/")
async def delete_football_event_endpoint(
    football_event_service: FootballEventService,
    model_id: int,
    _: Annotated[FootballEventDB, Depends(require_roles("admin"))],
):
    self.logger.debug(f"Delete football event endpoint id:{model_id}")
    
    # Get match_id before deleting
    event = await football_event_service.get_by_id(model_id)
    match_id = event.match_id if event else None
    
    await football_event_service.delete(model_id)
    
    # ✅ ADD: Broadcast WebSocket update to all connected clients
    if match_id:
        await manager.broadcast_to_match(
            match_id=match_id,
            message={
                "type": "event-update",
                "data": {
                    "events": await football_event_service.get_events_with_players(match_id)
                }
            }
        )
    
    return {"detail": f"FootballEvent {model_id} deleted successfully"}
```

### Solution 2: Implement Cache Invalidation

Modify the cache service to invalidate event cache when events change:

```python
# In match_data_cache_service.py or cache_service.py

async def invalidate_events_cache(match_id: int):
    """Invalidate the events cache for a specific match"""
    cache_key = f"events_{match_id}"
    # Remove from Redis/in-memory cache
    await cache_manager.delete(cache_key)
```

Call this after each create/update/delete operation.

### Solution 3: Use Database Triggers (Alternative)

Set up database triggers to automatically notify when events change:

```python
# In FootballEventDB model
@event.listens_for('after_insert')
@event.listens_for('after_update')
@event.listens_for('after_delete')
def notify_event_change(mapper, connection, target):
    """Send WebSocket notification when events change"""
    from src.websocket.websocket_manager import manager
    import asyncio
    
    match_id = target.match_id
    asyncio.create_task(manager.broadcast_to_match(
        match_id=match_id,
        message={
            "type": "event-update",
            "data": {
                "events": []  # Cache will be invalidated on next request
            }
        }
    ))
```

## Testing the Fix

After implementing the fix:

1. Run the WebSocket sync test:
   ```bash
   npx playwright test websocket-events-sync.spec.ts
   ```

2. Manually test:
   - Open all three pages
   - Create event on Admin
   - **Verify:** Event appears on Match View page within 2-3 seconds
   - **Verify:** Event appears on Match Detail Events tab within 2-3 seconds
   - Update event on Admin
   - **Verify:** Update reflects on both pages
   - Delete event on Admin
   - **Verify:** Event disappears from both pages

## Priority

**CRITICAL** - This is a production issue affecting the core scoreboard functionality. Real-time updates are not working for events, which breaks the main use case of the scoreboard admin interface.

## Files to Modify

### Backend (Priority: HIGH)
1. `src/football_events/views.py` - Add WebSocket broadcasting to create/update/delete endpoints
2. `src/football_events/db_services.py` - Optionally add cache invalidation
3. `src/websocket/websocket_manager.py` - Ensure `broadcast_to_match()` method exists and works correctly

### Frontend (Priority: LOW - likely correct, just not receiving messages)
1. `src/core/services/websocket.service.ts` - Verify `handleEventUpdate()` and `handleMatchUpdate()` correctly parse events data
2. Add debug logging to verify messages are being received

## Verification Checklist

- [ ] Backend broadcasts `event-update` message on event creation
- [ ] Backend broadcasts `event-update` message on event update
- [ ] Backend broadcasts `event-update` message on event deletion
- [ ] All WebSocket clients receive the `event-update` message
- [ ] `wsService.events()` signal updates on all pages
- [ ] Match View page shows events in real-time
- [ ] Match Detail Events tab shows events in real-time
- [ ] Automated Playwright test passes
