# WebSocket Events Sync Test Results

**Test Date:** January 28, 2026
**Match ID:** 2
**Test URLS:**
- Admin: `http://localhost:4200/scoreboard/match/2/admin`
- Match View (HD): `http://localhost:4200/scoreboard/match/2/hd`
- Match Detail (Events Tab): `http://localhost:4200/sports/1/matches/2?tab=events`

## Test Procedure

1. **Opened all three pages in separate browser tabs**
   - Tab 0: Admin page (for creating/editing events)
   - Tab 1: Match View/HD page (for viewing play-by-play)
   - Tab 2: Match Detail page with Events tab (for viewing detailed events)

2. **Verified initial state** - All pages showed "No events yet" or "No Events Recorded"

3. **Created an event on Admin page**
   - Event #: 1
   - Quarter: Q1
   - Down: 1st
   - Distance: 10 yards
   - Play Type: Run
   - Result: Gain
   - Players: -

4. **Verified event appeared on Admin page** ✓
   - Events table shows: `1 Q1 1 & 10 Run Gain -`
   - Play by Play section shows the event
   - Event was successfully saved to backend

5. **Checked Match View (HD page) WITHOUT RELOADING** ✗
   - Still shows: "No events yet"
   - Play by Play section is empty
   - **ISSUE: Event did NOT sync to HD view page**

6. **Checked Match Detail Events Tab WITHOUT RELOADING** ✗
   - Stats still show: 0 Total Plays, 0 Pass Plays, 0 Run Plays, 0 Scoring Plays
   - Shows: "No Events Recorded"
   - **ISSUE: Event did NOT sync to Match Detail page**

## Root Cause Analysis

Based on the code review:

### Admin Page (Working)
- `ScoreboardAdminComponent` correctly:
  - Connects to WebSocket via `wsService.connect(matchId)`
  - Has `wsEventsFromMatchUpdateEffect` that updates events
  - Has `wsEventsEffect` that listens to `wsService.events()` signal
  - Properly updates local `data.events` when WebSocket sends event updates

### Match View Page (Not Working)
- `ScoreboardViewComponent` has similar effects:
  - `wsEventsFromMatchUpdateEffect` - updates from `wsService.eventsPartial()`
  - `wsEventsEffect` - updates from `wsService.events()` signal
  - These should receive events when admin creates them

### Match Detail Page (Not Working)
- `MatchDetailComponent` has:
  - `wsEventsPartialEffect` - updates from `wsService.eventsPartial()`
  - `wsEventsEffect` - updates from `wsService.events()` signal
  - Should receive events when admin creates them

### WebSocket Service
- `WebSocketService` has:
  - `events` signal that gets updated from:
    - `initial-load` message
    - `event-update` message type (via `handleEventUpdate`)
    - `match-update` or `message-update` message type (via events data)
  - `eventsPartial` signal that gets updated from `match-update` or `message-update`

## Issue

The problem is likely one of:

1. **Backend not sending WebSocket event updates** when events are created via API
   - Admin creates events via `scoreboardStore.createFootballEvent()`
   - This makes an HTTP POST request
   - Backend should send WebSocket `event-update` or `match-update` message
   - If backend doesn't send this message, the WebSocket signal won't update

2. **WebSocket message type mismatch**
   - Admin expects events to come via a specific message type
   - Backend might be sending a different message type
   - Check backend WebSocket handler for event creation

3. **Race condition or timing issue**
   - Event might be added locally on admin but WebSocket update hasn't arrived yet
   - However, we waited 3 seconds and other pages still showed no events

## Next Steps to Fix

1. **Check backend WebSocket handler**
   - Verify that when `POST /api/matches/{match_id}/football-events/` is called
   - Backend should broadcast WebSocket message with:
     - Type: `event-update` or `match-update`
     - Data: Updated events array
     - Match ID: The match ID

2. **Add WebSocket message logging**
   - In `WebSocketService.handleMessage()`, add console logs for:
     - All message types received
     - Event update messages specifically
   - Check if `event-update` messages are being received

3. **Verify WebSocket connection**
   - Check that Match View and Match Detail pages are connected to the same match WebSocket
   - Verify they receive `initial-load` message with events data
   - Check if they're receiving any WebSocket messages at all

4. **Check for client ID conflicts**
   - WebSocket uses `clientId` to distinguish connections
   - Multiple tabs might have different client IDs
   - Verify backend broadcasts to all connected clients, not just the sender

## Test Code Reference

See `/home/linroot/code/statsboard/frontend-angular-signals/e2e/websocket-events-sync.spec.ts` for automated test that can be run with:
```bash
npx playwright test websocket-events-sync.spec.ts
```

## Summary

✓ **Event creation on Admin page works correctly**
✗ **Event sync to Match View (HD) page FAILS** - no WebSocket update received
✗ **Event sync to Match Detail (Events tab) page FAILS** - no WebSocket update received

**Conclusion:** The issue is likely in the backend not sending WebSocket updates when events are created/updated via API, or the WebSocket message format/type doesn't match what the frontend expects.

**Priority:** HIGH - This breaks real-time scoreboard functionality which is a core feature.
