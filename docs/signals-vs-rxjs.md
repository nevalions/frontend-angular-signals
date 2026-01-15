# Signals vs RxJS

This document covers when to use signals vs RxJS and provides interop patterns.

## Use Signals When

**Use signals for:**

- Managing component local state
- Deriving computed values from other state
- Working with template bindings and control flow
- Simple reactive dependencies without complex async patterns
- State that needs synchronous updates
- Pagination state (current page, items per page, derived page calculations)

**Example scenarios:**

```typescript
// Local component state
isVisible = signal(false);
count = signal(0);
items = signal<Item[]>([]);

// Derived state
filteredItems = computed(() =>
  this.items().filter(item => item.active)
);

// Pagination state
currentPage = signal(1);
itemsPerPage = signal(10);
totalPages = computed(() =>
  Math.ceil(this.totalCount() / this.itemsPerPage())
);
```

## Use RxJS When

**Use RxJS for:**

- Working with complex async operations (HTTP requests, timers, events)
- Need advanced operators (debounce, throttle, retry, combineLatest, etc.)
- Managing complex error handling and recovery
- Handling backpressure or stream buffering
- Interacting with external libraries or APIs that use Observables

**Example scenarios:**

```typescript
// Complex async operations
searchResults$ = this.http.get<Item[]>('/api/items').pipe(
  debounceTime(300),
  distinctUntilChanged(),
  retry(3),
  catchError(error => of([]))
);

// Multiple stream combination
combined$ = combineLatest([
  this.user$,
  this.settings$
]).pipe(
  map(([user, settings]) => ({ ... }))
);

// Advanced error handling
data$ = this.http.get<Data>('/api/data').pipe(
  timeout(5000),
  retryWhen(errors =>
    errors.pipe(
      delay(1000),
      take(3)
    )
  ),
  catchError(error => fallbackData$)
);
```

## Interop Patterns

### Convert Observable to Signal

Use `toSignal()` when you need an Observable as a signal.

```typescript
import { toSignal } from '@angular/core/rxjs-interop';

// Convert Observable to Signal
data = toSignal(
  this.http.get<Data[]>('/api/data'),
  { initialValue: [] }
);

// With error handling
data = toSignal(
  this.http.get<Data[]>('/api/data').pipe(
    catchError(err => {
      console.error('Failed to load data', err);
      return of([]);
    })
  ),
  { initialValue: [] }
);
```

### Convert Signal to Observable

Use `toObservable()` when you need a signal as an Observable (rarely needed).

```typescript
import { toObservable } from '@angular/core/rxjs-interop';

const itemsSignal = signal<Item[]>([]);
const items$ = toObservable(itemsSignal);
```

### Hybrid Pattern

Signal service returns Observable for flexibility:

```typescript
@Injectable({ providedIn: 'root' })
export class ItemService {
  createItem(item: Item): Observable<Item> {
    return this.http.post<Item>('/items', item);
  }

  // Component converts to signal
  itemsResource = httpResource<Item[]>(() => '/items');
  items = computed(() => this.itemsResource.value() ?? []);
}
```

## Trade-offs

| Aspect                | Signals                                    | RxJS                                      |
| ---------------------- | ------------------------------------------- | -------------------------------------------- |
| Syntax                 | Simpler syntax                             | More complex operators                      |
| Template integration   | Better template integration                  | Requires async pipes or manual conversion |
| Synchronous           | Synchronous execution                      | Asynchronous streams                      |
| Performance           | Efficient for synchronous state               | Efficient for async streams                 |
| Ecosystem             | Newer, growing ecosystem                 | Mature, extensive operator library           |
| Learning curve        | Simpler to learn                           | Steeper learning curve                    |
| Memory management     | Automatic cleanup                          | Manual subscription management                |

## Recommendation

**Use signals as the default for local state** and **use RxJS for async operations and complex stream manipulation.**

When in doubt:
- Component state → Signals
- API calls → RxJS (or httpResource)
- Complex async logic → RxJS
- Simple reactive deps → Signals
- Stream manipulation → RxJS

## Related Documentation

- [Angular Signals Best Practices](./angular-signals-best-practices.md) - Signal patterns
- [Service Patterns](./service-patterns.md) - Service patterns including httpResource vs rxResource
- [Testing Patterns](./testing-patterns.md) - Testing both signals and RxJS
