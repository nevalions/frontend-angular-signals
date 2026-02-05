# httpResource vs rxResource

Decision guide for choosing `httpResource()` vs `rxResource()`.

## Use httpResource() for:

- Simple GET requests without complex query logic
- Data that needs automatic loading based on reactive dependencies
- Requests that do not need RxJS operators (debounce, retry, etc.)
- Standard CRUD list/data fetching patterns
- Detail views by ID (direct URL binding)
- When you want simpler, cleaner code

```typescript
// Good - Simple data fetching
seasonsResource = httpResource<Season[]>(() => buildApiUrl('/api/seasons/'));

// Good - Detail by ID
seasonResource = httpResource<Season>(() => buildApiUrl(`/api/seasons/${id}`));

// Good - With reactive dependencies
seasonsBySportResource = httpResource<Season[]>(() =>
  buildApiUrl(`/api/sports/${sportId()}/seasons`),
);
```

## Use rxResource() for:

- Complex async patterns with RxJS operators
- Search with debouncing and minimum length filters
- Requests needing retry logic, timeout handling, or complex error recovery
- Multiple interdependent API calls or orchestration
- Request cancellation and race condition handling
- Custom request/response transformation
- Complex filtering or query composition

```typescript
// Good - Complex search with RxJS operators
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
// Good - Complex request orchestration
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

## Decision Matrix

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
| Data polling                | `interval()` + `takeUntilDestroyed()`            | Periodic data refresh (user status, etc.)   |

## Decision Criteria

- Need RxJS operators? -> Use `rxResource()`
- Need debouncing/filtering? -> Use `rxResource()`
- Need retry logic? -> Use `rxResource()`
- Simple GET with reactive deps? -> Use `httpResource()`
- Want less boilerplate? -> Use `httpResource()`
- Need request orchestration? -> Use `rxResource()`
- Need timeout handling? -> Use `rxResource()`

## Related Documentation

- [Canonical Service Pattern](./canonical-service-pattern.md)
- [Mixed Schemas](./mixed-schemas.md)
- [Polling and Heartbeat](./polling-and-heartbeat.md)
