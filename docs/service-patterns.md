# Service Patterns

This document covers service patterns and best practices.

## httpResource vs rxResource Decision Matrix

### Use `httpResource()` for:

- Simple GET requests without complex query logic
- Data that needs automatic loading based on reactive dependencies
- Requests that don't need RxJS operators (debounce, retry, etc.)
- Standard CRUD list/data fetching patterns
- Detail views by ID (direct URL binding)
- When you want simpler, cleaner code

```typescript
// ✅ GOOD - Simple data fetching
seasonsResource = httpResource<Season[]>(() => buildApiUrl('/api/seasons/'));

// ✅ GOOD - Detail by ID
seasonResource = httpResource<Season>(() => buildApiUrl(`/api/seasons/${id}`));

// ✅ GOOD - With reactive dependencies
seasonsBySportResource = httpResource<Season[]>(() =>
  buildApiUrl(`/api/sports/${sportId()}/seasons`),
);
```

### Use `rxResource()` for:

- Complex async patterns with RxJS operators
- Search with debouncing and minimum length filters
- Requests needing retry logic, timeout handling, or complex error recovery
- Multiple interdependent API calls or orchestration
- Request cancellation and race condition handling
- Custom request/response transformation
- Complex filtering or query composition

```typescript
// ✅ GOOD - Complex search with RxJS operators
searchQuery = signal('');

searchResource = rxResource<Season[]>({
  request: computed(() => ({
    url: buildApiUrl('/api/seasons/'),
    params: { q: this.searchQuery() },
  })),
  loader: (params) =>
    this.http.get<Season[]>(params.url, { params: params.params }).pipe(
      debounceTime(300),
      filter(() => this.searchQuery().length >= 2),
      retry(3),
      catchError((err) => {
        this.errorService.log(err);
        return of([]);
      }),
    ),
});
```

```typescript
// ✅ GOOD - Complex request orchestration
complexDataResource = rxResource<CombinedData>({
  request: computed(() => ({
    userId: this.userId(),
    seasonId: this.seasonId(),
  })),
  loader: (params) =>
    this.http.get<User>(`/api/users/${params.request.userId}`).pipe(
      switchMap((user) =>
        this.http
          .get<Season[]>(`/api/users/${params.request.userId}/seasons`)
          .pipe(map((seasons) => ({ user, seasons, filteredSeasons: seasons }))),
      ),
      timeout(5000),
      catchError((err) => {
        this.errorService.log(err);
        return of({ user: null, seasons: [], filteredSeasons: [] });
      }),
    ),
});
```

### Decision Matrix

| Scenario                    | Recommended                                      | Reasoning                                   |
| --------------------------- | ------------------------------------------------ | ------------------------------------------- |
| Simple list fetch           | `httpResource()`                                 | Simpler, cleaner API                        |
| Detail by ID                | `httpResource()`                                 | Direct URL binding                          |
| Search with debounce        | `rxResource()`                                   | Need debounceTime operator                  |
| Auto-retry on failure       | `rxResource()`                                   | Need retry operator                         |
| Request cancellation        | Both work, `rxResource()` has built-in switchMap | Both cancel previous requests               |
| Response transformation     | Both work, `httpResource()` has `parse`          | Use `httpResource().parse` for simple cases |
| Multiple dependent requests | `rxResource()`                                   | Need switchMap/combineLatest                |
| Timeout handling            | `rxResource()`                                   | Need timeout operator                       |
| Complex error recovery      | `rxResource()`                                   | Need catchError + retryWhen                 |
| Rate limiting               | `rxResource()`                                   | Need throttleTime/sampleTime                |
| Data polling                | `interval()` + `takeUntilDestroyed()`              | Periodic data refresh (user status, etc.)  |

### Decision Criteria

- Need RxJS operators? → Use `rxResource()`
- Need debouncing/filtering? → Use `rxResource()`
- Need retry logic? → Use `rxResource()`
- Simple GET with reactive deps? → Use `httpResource()`
- Want less boilerplate? → Use `httpResource()`
- Need request orchestration? → Use `rxResource()`
- Need timeout handling? → Use `rxResource()`

## Canonical Service Pattern

### Basic Store Pattern

```typescript
@Injectable({ providedIn: 'root' })
export class SeasonStoreService {
  seasonsResource = httpResource<Season[]>(() => buildApiUrl('/api/seasons/'));

  seasons = computed(() => this.seasonsResource.value() ?? []);
  loading = computed(() => this.seasonsResource.isLoading());
  error = computed(() => this.seasonsResource.error());
}
```

### Mutation Methods

For standard CRUD operations (POST, PUT, DELETE), prefer `ApiService`:

```typescript
@Injectable({ providedIn: 'root' })
export class SeasonStoreService {
  private apiService = inject(ApiService);

  createSeason(data: SeasonCreate): Observable<Season> {
    return this.apiService.post<Season>('/api/seasons/', data).pipe(
      tap(() => this.seasonsResource.reload())
    );
  }

  updateSeason(id: number, data: SeasonUpdate): Observable<Season> {
    return this.apiService.put<Season>('/api/seasons/', id, data, true).pipe(
      tap(() => this.seasonsResource.reload())
    );
  }

  deleteSeason(id: number): Observable<void> {
    return this.apiService.delete('/api/seasons', id).pipe(
      tap(() => this.seasonsResource.reload())
    );
  }
}
```

**Keep `HttpClient` only when necessary:**
- Custom query parameters (pagination, search, filters)
- Custom headers or authentication tokens
- Streaming or custom request/response handling
```

## Mixed Schemas Pattern

Backend may provide mixed schemas that flatten data from multiple related entities into a single response object.

### When to Use Mixed Schemas

**Use Mixed Schemas when:**
- Displaying list/grid views that need all related data in a single object
- Performance-critical views where avoiding nested lookups is important
- UI components that display fields from multiple related entities (Player + Person + Team + Position)
- Paginated endpoints for list/detail views

**Use Nested Schemas when:**
- API endpoints returning complete entity graphs
- When related entities have their own rich details
- When client may need to access related entity data independently

### Example: Player in Tournament

**Mixed Schema (Flat):**
```typescript
// PlayerTeamTournamentWithDetailsAndPhotos
interface PlayerTeamTournamentWithDetailsAndPhotos {
  id: number;
  player_id: number;
  first_name: string;        // Flattened from Person
  second_name: string;       // Flattened from Person
  team_title: string;         // Flattened from Team
  position_title: string;     // Flattened from Position
  person_photo_url: string;    // Flattened from Person
  team_id: number;
  position_id: number;
  // All fields in one flat object - easy to use in templates
}
```

**Nested Schema:**
```typescript
// PlayerWithFullDetails
interface PlayerWithFullDetails {
  id: number;
  person: Person {              // Nested object
    first_name: string;
    second_name: string;
    person_photo_url: string;
  };
  player_team_tournaments: PlayerTeamTournament[];  // Nested array
}
```

### Service Usage

```typescript
getTournamentPlayersPaginatedWithPhotos(
  tournamentId: number,
  page: number,
  itemsPerPage: number,
  ascending: boolean = true,
  search: string = '',
  orderBy: string = 'second_name',
  orderByTwo?: string
): Observable<PaginatedPlayerTeamTournamentWithDetailsAndPhotosResponse> {
  let httpParams = new HttpParams()
    .set('page', page.toString())
    .set('items_per_page', itemsPerPage.toString())
    .set('ascending', ascending.toString())
    .set('order_by', orderBy);

  if (search) {
    httpParams = httpParams.set('search', search);
  }

  if (orderByTwo) {
    httpParams = httpParams.set('order_by_two', orderByTwo);
  }

  return this.http.get<PaginatedPlayerTeamTournamentWithDetailsAndPhotosResponse>(
    buildApiUrl(`/api/players_team_tournament/tournament/${tournamentId}/players/paginated/details-with-photos`),
    { params: httpParams }
  );
}
```

### Component Usage

```typescript
// Simplified - no data transformation needed
loadPlayers(): void {
  this.playerStore.getTournamentPlayersPaginatedWithPhotos(
    this.tournamentId(),
    this.page(),
    this.itemsPerPage(),
    this.sortOrder() === 'asc',
    this.search()
  ).subscribe({
    next: (response) => {
      this.players.set(response.data || []);
      this.totalCount.set(response.metadata.total_items);
    }
  });
}
```

### Benefits of Mixed Schemas

- ✅ Reduced frontend complexity (no data transformation)
- ✅ Fewer API calls (all data in one response)
- ✅ Simpler templates (direct property access)
- ✅ Better performance for list views

### Naming Conventions

Mixed schemas typically use these suffixes:
- `WithDetails` - Base related fields (titles, IDs)
- `WithPhotos` - Includes photo/icon URLs
- `WithFullDetails` - Complete nested objects

## Polling Pattern for Real-Time Updates

Use RxJS `interval()` with `takeUntilDestroyed()` for periodic data refresh.

### Use Cases

- User online status updates (users list, admins list)
- Real-time scoreboard data (when WebSocket not available)
- Notifications or alerts requiring periodic refresh
- Any data that changes frequently but doesn't need true real-time

### Implementation Pattern

```typescript
import { interval } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DestroyRef } from '@angular/core';

@Component({ /* ... */ })
export class UsersTabComponent {
  private destroyRef = inject(DestroyRef);

  constructor() {
    // Poll every 60 seconds
    interval(60000)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.loadUsers();
      });
  }

  loadUsers(): void {
    // Existing load logic
  }
}
```

### Key Points

- **`takeUntilDestroyed()`**: Automatically cleans up interval on component destroy
- **Interval timing**: Match backend heartbeat frequency (60 seconds)
- **Automatic cleanup**: No manual unsubscribe needed
- **Efficient**: Only active while component is alive

### Heartbeat Pattern

Maintain user's online status by sending periodic heartbeat to backend:

```typescript
@Injectable({ providedIn: 'root' })
export class AuthService {
  private heartbeatIntervalId: ReturnType<typeof setInterval> | null = null;

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(buildApiUrl('/api/auth/login'), body).pipe(
      tap(() => {
        this.fetchCurrentUser().subscribe(() => {
          this.startHeartbeat();
        });
      })
    );
  }

  logout(): void {
    this.stopHeartbeat();
    // ... existing logout logic
  }

  heartbeat(): Observable<void> {
    return this.http.post<void>(buildApiUrl('/api/auth/heartbeat'), null).pipe(
      catchError(() => of(undefined))
    );
  }

  private startHeartbeat(): void {
    this.stopHeartbeat();
    this.heartbeatIntervalId = setInterval(() => {
      this.heartbeat().subscribe();
    }, 60000);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatIntervalId) {
      clearInterval(this.heartbeatIntervalId);
      this.heartbeatIntervalId = null;
    }
  }
}
```

**Heartbeat Behavior:**
- Send heartbeat every 60 seconds while user is logged in
- Start after successful login
- Stop on logout
- Fail silently (no user alerts for network issues)
- Backend marks users offline after 2 minutes of no heartbeat

### When to Use Polling vs WebSocket

| Scenario | Recommended Approach |
|----------|---------------------|
| User online status | Polling (60s interval) |
| Real-time scoreboard | WebSocket (when available) |
| Chat/messaging | WebSocket |
| Notifications | Polling (30-60s) |
| Data that changes infrequently | Manual refresh |
| Real-time collaboration | WebSocket |

## WebSocket Service Pattern

For real-time data updates (scoreboards, live feeds), use the WebSocket service with signal-based state management.

### Basic Usage

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

### Service API

 ```typescript
// Connection management
connect(matchId: number): void
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

### Connection Health Monitoring

```typescript
// Check if connection is healthy (ping received within 60 seconds)
isHealthy = computed(() => wsService.connectionHealthy());

// Get timestamp of last ping received
lastPing = computed(() => wsService.lastPingReceived());

// Show connection health indicator
@if (wsService.connectionHealthy()) {
  <div class="status-healthy">● Connection Healthy</div>
} @else {
  <div class="status-unhealthy">● Connection Issue</div>
}
```

**Health Monitoring Signals:**
- `lastPingReceived`: Timestamp (ms) of last ping received from server, or `null` if no ping received yet
- `connectionHealthy`: Returns `true` if ping received within 60 seconds, `false` otherwise
  - Returns `true` if no ping received yet (assumes healthy on new connection)
  - Returns `false` if no ping received in last 60 seconds (possible stale connection)

### Connection Quality Monitoring

```typescript
// Get last round-trip time (RTT) in milliseconds
rtt = computed(() => wsService.lastRtt());

// Get connection quality level
quality = computed(() => wsService.connectionQuality());

// Show connection quality indicator using ConnectionIndicatorComponent
<app-connection-indicator [showLabel]="true" />
```

**Quality Monitoring Signals:**
- `lastRtt`: Round-trip time (ms) calculated from ping/pong timestamp, or `null` if no RTT data yet
- `connectionQuality`: Connection quality level based on RTT:
  - `'good'`: RTT < 100ms (green dot)
  - `'fair'`: RTT 100-300ms (yellow dot)
  - `'poor'`: RTT > 300ms (red dot)
  - `'unknown'`: No RTT data yet (gray dot)

### Message Types

The WebSocket service automatically parses and routes incoming messages to appropriate signals:

| Message Type | Signal Updated | Action | Data Structure |
|--------------|---------------|---------|----------------|
| `initial-load` | `matchData`, `gameClock`, `playClock`, `events`, `statistics` | Sets all signals atomically from initial message | `ComprehensiveMatchData` interface |
| `ping` | `lastPingReceived`, `lastRtt`, `connectionQuality` | Responds with `pong`, calculates RTT | `{ timestamp: number }` |
| `playclock-update` | `playClock` | Updates clock signal | `PlayClock` interface |
| `gameclock-update` | `gameClock` | Updates clock signal | `GameClock` interface |
| `event-update` | `events`, `lastEventUpdate` | Updates events list | `FootballEvent[]` interface |
| `statistics-update` | `statistics`, `lastStatsUpdate` | Updates match statistics | `MatchStats` interface |
| `message-update` | `matchDataPartial`, `scoreboardPartial`, `lastMatchDataUpdate` | Updates partial match/scoreboard data | `MatchData` and `unknown` |

**Ping/Pong Flow:**
1. Server sends `ping` message with timestamp
2. Client responds with `pong` message containing same timestamp
3. Client updates `lastPingReceived` signal with current time
4. Client calculates RTT (round-trip time) from timestamp and updates `lastRtt` signal
5. Client updates `connectionQuality` signal based on RTT value
4. `connectionHealthy` computed signal reflects connection health

### Connection State Monitoring

```typescript
// Show connection indicator in template
@if (wsService.connectionState() === 'connected') {
  <div class="status-connected">● Live</div>
} @else if (wsService.connectionState() === 'connecting') {
  <div class="status-connecting">Connecting...</div>
} @else if (wsService.connectionState() === 'error') {
  <div class="status-error">● Disconnected (reconnecting...)</div>
} @else {
  <div class="status-disconnected">○ Offline</div>
}
```

### Key Features

- **Auto-reconnect**: Exponential backoff with jitter (up to 3 attempts, max 30s delay)
- **Connection state tracking**: `'disconnected' | 'connecting' | 'connected' | 'error'`
- **Connection health monitoring**: Ping/pong heartbeat with `connectionHealthy` signal
- **Automatic cleanup**: Proper disconnect via `DestroyRef` on service destroy
- **UUID-based client identification**: Unique client ID per session for server-side tracking
- **Error handling**: `lastError` signal for debugging connection issues

### Component-Level Data Handling

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

**Key Points:**
- Use `untracked()` to read current data without creating a dependency
- Check for `initial-load` message when `current` is null
- Set `loading.set(false)` when initial data arrives from WebSocket
- Merge only changed fields for subsequent `match-update` messages
- This handles both race conditions: WebSocket before HTTP, or HTTP before WebSocket

### Immediate Signal Updates (API → WebSocket Pattern)

When performing CRUD operations via HTTP API, update the WebSocket service's events signal directly for immediate UI feedback, then let other clients receive updates via the normal WebSocket broadcast.

**Why This Pattern?**
- Updating client sees changes immediately (no waiting for WebSocket broadcast)
- Other clients still receive updates via WebSocket (maintains data consistency)
- Eliminates duplicate HTTP reloads after successful API operations
- Provides instant UX while maintaining real-time synchronization

**Implementation Pattern (Create):**

```typescript
onEventCreate(event: FootballEventCreate): void {
  const matchId = this.currentMatchId();
  const eventData = { ...event, match_id: matchId };
  
  this.scoreboardStore.createFootballEvent(eventData).subscribe({
    next: (createdEvent) => {
      // Update WebSocket signal immediately for instant UI feedback
      const currentEvents = this.wsService.events();
      this.wsService.events.set([...currentEvents, createdEvent]);
    },
    error: (err) => console.error('Failed to create event', err),
  });
}
```

**Implementation Pattern (Update):**

```typescript
onEventUpdate(payload: { id: number; data: FootballEventUpdate }): void {
  this.scoreboardStore.updateFootballEvent(payload.id, payload.data).subscribe({
    next: (updatedEvent) => {
      // Update WebSocket signal immediately - replace existing event
      const currentEvents = this.wsService.events();
      this.wsService.events.set(
        currentEvents.map((e) => (e.id === payload.id ? updatedEvent : e))
      );
    },
    error: (err) => console.error('Failed to update event', err),
  });
}
```

**Implementation Pattern (Delete):**

```typescript
onEventDelete(eventId: number): void {
  this.scoreboardStore.deleteFootballEvent(eventId).subscribe({
    next: () => {
      // Update WebSocket signal immediately - remove event
      const currentEvents = this.wsService.events();
      this.wsService.events.set(currentEvents.filter((e) => e.id !== eventId));
    },
    error: (err) => console.error('Failed to delete event', err),
  });
}
```

**Data Flow:**

```
┌─────────────────────────────────────────────────────────────┐
│  Admin Client (makes change)                              │
│  1. POST/PUT/DELETE to API                              │
│  2. API succeeds → immediately update wsService.events()   │
│  3. Component effect sees change → UI updates instantly     │
└─────────────────────────────────────────────────────────────┘
                          │
                          │ 3. Backend processes & triggers
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  Backend WebSocket Broadcast                               │
│  4. Database trigger → WebSocket broadcast                  │
│  5. All other clients receive event-update message         │
└─────────────────────────────────────────────────────────────┘
                          │
                          │ 6. Other clients update via WebSocket
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  Other Clients                                            │
│  7. WebSocket receives event-update                        │
│  8. Component effects merge into local data                │
└─────────────────────────────────────────────────────────────┘
```

**When to Use This Pattern:**
- Admin or control panels where immediate feedback is critical
- When a client makes changes via HTTP API and wants instant UI updates
- For CRUD operations where the performing client should see changes immediately
- Combined with component effects that watch `wsService.events()` and merge into local data

**When NOT to Use This Pattern:**
- Read-only clients (they should only receive updates via WebSocket)
- When WebSocket messages already provide immediate feedback
- For operations that don't change data visible to the client

**Important Notes:**
- Backend WebSocket broadcast still happens for all clients (ensures consistency)
- No duplicate data: WebSocket broadcast overwrites the same signal with identical data
- If WebSocket message arrives before API response, the component effect handles it normally
- If WebSocket message arrives after API response, the signal update is idempotent (no duplicate effects)

### Partial Update Pattern

For incremental updates (score, quarter, scoreboard settings), the service uses **partial update signals** to preserve existing data:

**WebSocket Service Signals:**
- `matchData` - Reserved for `initial-load` messages only (complete dataset)
- `matchDataPartial` - For `match_data` updates (scores, quarters, etc.)
- `scoreboardPartial` - For `scoreboard_data` updates (settings, display options)
- `lastMatchDataUpdate` - Timestamp of last match data update (for debugging)

**Why This Pattern?**
When you save a score/quarter change, the backend sends a `match-update` message containing only the changed fields (`match_data`, `scoreboard_data`). If we overwrite the entire `matchData` signal with this incomplete object, we lose `teams`, `players`, and other required data.

**Component Effects for Partial Updates:**

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

**Flow:**
1. User saves score → HTTP API succeeds
2. Backend sends `match-update` with `{ match_data: {...} }`
3. WebSocket service sets `matchDataPartial` signal (does NOT overwrite `matchData`)
4. Component's `wsMatchDataPartialEffect` merges partial data
5. `teams`, `players`, etc. preserved ✅
6. UI updates with new score ✅

**Key Benefits:**
- No data loss: Incremental updates don't overwrite complete dataset
- Type safety: Components control their own data merging logic
- Separation of concerns: Initial-load vs. incremental updates clearly separated
- Debugging: `lastMatchDataUpdate` timestamp available

### WebSocket URL

The service connects to: `WS /ws/match/{matchId}/{clientId}/`

- `matchId`: Match identifier for subscribing to match updates
- `clientId`: UUID v4 generated by service for unique session identification

### Related Documentation

- [Pagination Pattern](./pagination-patterns.md) - Paginated list pattern
- [API Configuration](./api-configuration.md) - API endpoint patterns, heartbeat endpoint
- [Angular Signals Best Practices](./angular-signals-best-practices.md) - Signal usage

## Related Documentation

- [Pagination Pattern](./pagination-patterns.md) - Paginated list pattern
- [API Configuration](./api-configuration.md) - API endpoint patterns
- [Angular Signals Best Practices](./angular-signals-best-practices.md) - Signal usage
