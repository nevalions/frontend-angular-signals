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
matchData: Signal<ComprehensiveMatchData | null>
gameClock: Signal<GameClock | null>
playClock: Signal<PlayClock | null>
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
| `message-update` | `matchData` | Updates match data | `ComprehensiveMatchData` interface |

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
