# WebSocket Service Pattern

Use the WebSocket service for real-time match data updates with signal-based state management.

## Basic Usage

```typescript
// Inject service in component
private wsService = inject(WebSocketService);

// Connect to WebSocket on initialization
ngOnInit() {
  const matchId = 123;
  this.wsService.connect(matchId);
}

// Access data via signals
gameClock = computed(() => this.wsService.gameClock());
playClock = computed(() => this.wsService.playClock());
matchData = computed(() => this.wsService.matchData());
connectionState = computed(() => this.wsService.connectionState());
}

// Disconnect on destroy
ngOnDestroy() {
  this.wsService.disconnect();
}
```

## Service API

```typescript
// Connection management
connect(matchId: number, isReconnect = false): void
disconnect(): void
sendMessage(message: unknown): void
resetData(): void

// Read-only signals
connectionState: Signal<'connecting' | 'connected' | 'disconnected' | 'error'>
matchData: Signal<ComprehensiveMatchData | null> // Initial-load only
gameClock: Signal<GameClock | null>
playClock: Signal<PlayClock | null>
events: Signal<FootballEvent[]>
statistics: Signal<MatchStats | null>
lastEventUpdate: Signal<number | null>
lastStatsUpdate: Signal<number | null>
matchDataPartial: Signal<MatchData | null> // For incremental updates
scoreboardPartial: Signal<unknown | null> // For scoreboard settings updates
matchPartial: Signal<MatchWithDetails | null> // For match details updates
teamsPartial: Signal<{team_a: Team; team_b: Team} | null> // For team updates
playersPartial: Signal<PlayerMatchWithDetails[] | null> // For roster updates
eventsPartial: Signal<FootballEvent[] | null> // For game events updates
lastMatchDataUpdate: Signal<number | null> // Timestamp of last match data update
lastMatchUpdate: Signal<number | null> // Timestamp of last match update
lastTeamsUpdate: Signal<number | null> // Timestamp of last teams update
lastPlayersUpdate: Signal<number | null> // Timestamp of last players update
lastEventsUpdate: Signal<number | null> // Timestamp of last events update
lastError: Signal<string | null>
lastPingReceived: Signal<number | null>
connectionHealthy: Signal<boolean>
lastRtt: Signal<number | null>
connectionQuality: Signal<'good' | 'fair' | 'poor' | 'unknown'>
```

## Connection Health Monitoring

```typescript
// Check if connection is healthy (ping received within 60 seconds)
isHealthy = computed(() => wsService.connectionHealthy());

// Get timestamp of last ping received
lastPing = computed(() => wsService.lastPingReceived());

// Show connection health indicator
@if (wsService.connectionHealthy()) {
  <div class="status-healthy">Connection healthy</div>
} @else {
  <div class="status-unhealthy">Connection issue</div>
}
```

Health monitoring signals:

- `lastPingReceived`: Timestamp (ms) of last ping received from server, or `null` if no ping received yet
- `connectionHealthy`: `true` if ping received within 60 seconds, `false` otherwise
  - Returns `true` if no ping received yet (assumes healthy on new connection)
  - Returns `false` if no ping received in last 60 seconds (possible stale connection)

## Connection Quality Monitoring

```typescript
// Get last round-trip time (RTT) in milliseconds
rtt = computed(() => wsService.lastRtt());

// Get connection quality level
quality = computed(() => wsService.connectionQuality());

// Show connection quality indicator using ConnectionIndicatorComponent
<app-connection-indicator [showLabel]="true" />
```

Quality monitoring signals:

- `lastRtt`: Round-trip time (ms) calculated from ping/pong timestamp, or `null` if no RTT data yet
- `connectionQuality`: Connection quality level based on RTT:
  - `good`: RTT < 100ms
  - `fair`: RTT 100-300ms
  - `poor`: RTT > 300ms
  - `unknown`: No RTT data yet

## Message Types

The WebSocket service parses and routes incoming messages to appropriate signals:

| Message Type | Signal Updated | Action | Data Structure |
|--------------|---------------|--------|----------------|
| `initial-load` | `matchData`, `gameClock`, `playClock`, `events`, `statistics` | Sets all signals atomically from initial message | `ComprehensiveMatchData` |
| `ping` | `lastPingReceived`, `lastRtt`, `connectionQuality` | Responds with `pong`, calculates RTT | `{ timestamp: number }` |
| `playclock-update` | `playClock` | Updates clock signal | `PlayClock` |
| `gameclock-update` | `gameClock` | Updates clock signal | `GameClock` |
| `event-update` | `events`, `lastEventUpdate` | Updates events list | `FootballEvent[]` |
| `statistics-update` | `statistics`, `lastStatsUpdate` | Updates match statistics | `MatchStats` |
| `message-update` | `matchDataPartial`, `scoreboardPartial`, `lastMatchDataUpdate` | Updates partial match/scoreboard data | `MatchData` and `unknown` |

Ping/pong flow:

1. Server sends `ping` message with timestamp
2. Client responds with `pong` message containing same timestamp
3. Client updates `lastPingReceived` with current time
4. Client calculates RTT from timestamp and updates `lastRtt`
5. Client updates `connectionQuality` based on RTT value
6. `connectionHealthy` computed signal reflects connection health

## Connection State Monitoring

```typescript
// Show connection indicator in template
@if (wsService.connectionState() === 'connected') {
  <div class="status-connected">Live</div>
} @else if (wsService.connectionState() === 'connecting') {
  <div class="status-connecting">Connecting...</div>
} @else if (wsService.connectionState() === 'error') {
  <div class="status-error">Disconnected (reconnecting...)</div>
} @else {
  <div class="status-disconnected">Offline</div>
}
```

## Key Features

- Auto-reconnect: exponential backoff with jitter (up to 3 attempts, max 30s delay)
- Connection state tracking: `disconnected | connecting | connected | error`
- Connection health monitoring: ping/pong heartbeat with `connectionHealthy` signal
- Automatic cleanup: proper disconnect via `DestroyRef` on service destroy
- UUID-based client identification for server-side tracking
- Error handling: `lastError` signal for debugging connection issues

## Component-Level Data Handling

When using WebSocket data in components, handle the race condition between initial HTTP load and WebSocket `initial-load` message:

```typescript
// Use untracked() to prevent infinite loop and avoid creating dependency
private wsMatchDataEffect = effect(() => {
  const message = this.wsService.matchData();
  if (!message) return;

  const current = untracked(() => this.data());

  // Handle initial-load message: use as initial dataset if current is null and has teams
  if (!current && message['teams']) {
    this.data.set(message);
    this.loading.set(false);
    return;
  }

  // Skip if no current data yet (waiting for initial-load or HTTP load)
  if (!current) return;

  // Merge only changed fields for subsequent updates
  this.data.set({
    ...current,
    match_data: message.match_data ?? current.match_data,
    scoreboard: message.scoreboard ?? current.scoreboard,
  });
});
```

Key points:

- Use `untracked()` to read current data without creating a dependency
- Check for `initial-load` message when `current` is null
- Set `loading.set(false)` when initial data arrives from WebSocket
- Merge only changed fields for subsequent `match-update` messages
- Handles both race conditions: WebSocket before HTTP, or HTTP before WebSocket

## Immediate Signal Updates (API -> WebSocket Pattern)

When performing CRUD operations via HTTP API, update the WebSocket service's events signal directly for immediate UI feedback, then let other clients receive updates via the normal WebSocket broadcast.

Why this pattern:

- Updating client sees changes immediately
- Other clients still receive updates via WebSocket
- Eliminates duplicate HTTP reloads after successful API operations
- Provides instant UX while maintaining real-time synchronization

Create:

```typescript
onEventCreate(event: FootballEventCreate): void {
  const matchId = this.currentMatchId();
  const eventData = { ...event, match_id: matchId };

  this.scoreboardStore.createFootballEvent(eventData).subscribe({
    next: (createdEvent) => {
      const currentEvents = this.wsService.events();
      this.wsService.events.set([...currentEvents, createdEvent]);
    },
    error: (err) => console.error('Failed to create event', err),
  });
}
```

Update:

```typescript
onEventUpdate(payload: { id: number; data: FootballEventUpdate }): void {
  this.scoreboardStore.updateFootballEvent(payload.id, payload.data).subscribe({
    next: (updatedEvent) => {
      const currentEvents = this.wsService.events();
      this.wsService.events.set(
        currentEvents.map((e) => (e.id === payload.id ? updatedEvent : e))
      );
    },
    error: (err) => console.error('Failed to update event', err),
  });
}
```

Delete:

```typescript
onEventDelete(eventId: number): void {
  this.scoreboardStore.deleteFootballEvent(eventId).subscribe({
    next: () => {
      const currentEvents = this.wsService.events();
      this.wsService.events.set(currentEvents.filter((e) => e.id !== eventId));
    },
    error: (err) => console.error('Failed to delete event', err),
  });
}
```

Data flow:

```
Admin client (makes change)
  1. POST/PUT/DELETE to API
  2. API succeeds -> immediately update wsService.events()
  3. Component effect sees change -> UI updates instantly

Backend WebSocket broadcast
  4. Database trigger -> WebSocket broadcast
  5. All other clients receive event-update message

Other clients
  6. WebSocket receives event-update
  7. Component effects merge into local data
```

When to use this pattern:

- Admin or control panels where immediate feedback is critical
- Client makes changes via HTTP API and wants instant UI updates
- CRUD operations where performing client should see changes immediately

When not to use:

- Read-only clients (they should only receive updates via WebSocket)
- When WebSocket messages already provide immediate feedback
- For operations that do not change data visible to the client

Important notes:

- Backend WebSocket broadcast still happens for all clients
- Signal update is idempotent if message arrives after API response
- Component effects handle messages arriving before API response

## Partial Update Pattern

For incremental updates (score, quarter, scoreboard settings), the service uses partial update signals to preserve existing data.

WebSocket service signals:

- `matchData` - Reserved for `initial-load` messages only (complete dataset)
- `matchDataPartial` - For `match_data` updates (scores, quarters, etc.)
- `scoreboardPartial` - For `scoreboard_data` updates (settings, display options)
- `lastMatchDataUpdate` - Timestamp of last match data update

Why this pattern:

When you save a score/quarter change, the backend sends a `match-update` message containing only the changed fields (`match_data`, `scoreboard_data`). If we overwrite the entire `matchData` signal with this incomplete object, we lose `teams`, `players`, and other required data.

Component effects for partial updates:

```typescript
// Handle partial match_data updates (e.g., score, quarter changes)
private wsMatchDataPartialEffect = effect(() => {
  const partial = this.wsService.matchDataPartial();
  if (!partial) return;

  const current = untracked(() => this.data());
  if (!current) return;

  // Merge only match_data field (preserves teams, players, etc.)
  this.data.set({
    ...current,
    match_data: partial,
  });
});

// Handle partial scoreboard_data updates (e.g., scoreboard settings)
private wsScoreboardPartialEffect = effect(() => {
  const partial = this.wsService.scoreboardPartial();
  if (!partial) return;

  const current = untracked(() => this.data());
  if (!current) return;

  // Merge only scoreboard field (preserves all other data)
  this.data.set({
    ...current,
    scoreboard: partial as ComprehensiveMatchData['scoreboard'],
  });
});
```

Flow:

1. User saves score -> HTTP API succeeds
2. Backend sends `match-update` with `{ match_data: {...} }`
3. WebSocket service sets `matchDataPartial` signal
4. Component merges partial data
5. Teams, players, etc. preserved
6. UI updates with new score

Key benefits:

- No data loss: incremental updates do not overwrite complete dataset
- Type safety: components control their own data merging logic
- Separation of concerns: initial-load vs incremental updates
- Debugging: `lastMatchDataUpdate` timestamp available

## WebSocket URL

The service connects to: `WS /ws/match/{matchId}/{clientId}/`

- `matchId`: Match identifier for subscribing to match updates
- `clientId`: UUID v4 generated by service for unique session identification

## Related Documentation

- [WebSocket Data Flow Overview](../websocket-data-flow/overview.md)
- [WebSocket Message Types](../websocket-data-flow/message-types.md)
- [WebSocket Message Schemas](../websocket-data-flow/message-schemas.md)
- [API Configuration](../api-configuration.md)
- [Angular Signals Best Practices](../angular-signals-best-practices.md)
