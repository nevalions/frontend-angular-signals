# Canonical Service Pattern

Standard store structure and mutation patterns.

## Basic Store Pattern

```typescript
@Injectable({ providedIn: 'root' })
export class SeasonStoreService {
  seasonsResource = httpResource<Season[]>(() => buildApiUrl('/api/seasons/'));

  seasons = computed(() => this.seasonsResource.value() ?? []);
  loading = computed(() => this.seasonsResource.isLoading());
  error = computed(() => this.seasonsResource.error());
}
```

## Mutation Methods

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

## Keep HttpClient Only When Necessary

- Custom query parameters (pagination, search, filters)
- Custom headers or authentication tokens
- Streaming or custom request/response handling

## Related Documentation

- [httpResource vs rxResource](./httpresource-vs-rxresource.md)
- [Alert Pattern](../alert-patterns.md)
- [Mixed Schemas](./mixed-schemas.md)
