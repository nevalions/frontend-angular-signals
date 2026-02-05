# Polling and Heartbeat Patterns

Use RxJS polling for periodic refresh and a heartbeat for online status.

## Use Cases

- User online status updates (users list, admins list)
- Real-time scoreboard data (when WebSocket not available)
- Notifications or alerts requiring periodic refresh
- Data that changes frequently but does not need true real-time

## Polling Implementation Pattern

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

## Key Points

- `takeUntilDestroyed()` automatically cleans up interval on component destroy
- Match interval timing to backend heartbeat frequency (60 seconds)
- No manual unsubscribe needed
- Only active while component is alive

## Heartbeat Pattern

Maintain user online status by sending a periodic heartbeat to backend:

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

Heartbeat behavior:

- Send heartbeat every 60 seconds while user is logged in
- Start after successful login
- Stop on logout
- Fail silently (no user alerts for network issues)
- Backend marks users offline after 2 minutes of no heartbeat

## When to Use Polling vs WebSocket

| Scenario | Recommended Approach |
|----------|----------------------|
| User online status | Polling (60s interval) |
| Real-time scoreboard | WebSocket (when available) |
| Chat/messaging | WebSocket |
| Notifications | Polling (30-60s) |
| Data that changes infrequently | Manual refresh |
| Real-time collaboration | WebSocket |

## Related Documentation

- [WebSocket Service Pattern](./websocket-service-pattern.md)
- [API Configuration](../api-configuration.md)
