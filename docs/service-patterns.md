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
| Data polling                | `rxResource()`                                   | Need interval/timer                         |

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

For mutations (POST, PUT, DELETE), use `HttpClient` directly:

```typescript
@Injectable({ providedIn: 'root' })
export class SeasonStoreService {
  private http = inject(HttpClient);

  createSeason(data: SeasonCreate): Observable<Season> {
    return this.http.post<Season>(buildApiUrl('/api/seasons/'), data).pipe(
      tap(() => this.seasonsResource.reload())
    );
  }

  updateSeason(id: number, data: SeasonUpdate): Observable<Season> {
    return this.http.put<Season>(buildApiUrl(`/api/seasons/${id}`), data).pipe(
      tap(() => this.seasonsResource.reload())
    );
  }

  deleteSeason(id: number): Observable<void> {
    return this.http.delete<void>(buildApiUrl(`/api/seasons/${id}`)).pipe(
      tap(() => this.seasonsResource.reload())
    );
  }
}
```

## Related Documentation

- [Pagination Pattern](./pagination-patterns.md) - Paginated list pattern
- [API Configuration](./api-configuration.md) - API endpoint patterns
- [Angular Signals Best Practices](./angular-signals-best-practices.md) - Signal usage
