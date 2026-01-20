# Common Anti-Patterns

This document covers common mistakes and anti-patterns to avoid.

## Service Anti-Patterns

### ❌ Don't make HTTP calls in service constructors

**BAD - Circular dependency risk:**

```typescript
@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);

  constructor() {
    // ❌ HTTP request in constructor causes circular dependency
    // if any interceptor injects this service
    this.fetchCurrentUser().subscribe();
  }
}
```

**Why this fails:**
- Constructor runs during service initialization
- HTTP requests trigger interceptors
- If interceptor injects `AuthService`, it creates a circular dependency
- Angular throws: `NG0200: Circular dependency detected`

**✅ GOOD - Use deferred initialization:**

```typescript
@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private initializationDone = false;

  constructor() {
    // Only load from storage, no HTTP calls
    this.loadFromStorage();
  }

  initialize(): void {
    // Prevent duplicate initialization
    if (this.initializationDone) return;
    this.initializationDone = true;

    // Defer HTTP until after DI graph is stable
    this.fetchCurrentUser().subscribe();
  }
}
```

**In App component:**

```typescript
export class App {
  private authService = inject(AuthService);

  constructor() {
    // Call initialize after DI is fully resolved
    this.authService.initialize();
  }
}
```

**Key points:**
- Keep constructors minimal (no HTTP, no complex logic)
- Use explicit `initialize()` method for startup logic
- Call `initialize()` in root component (App)
- Use a flag to prevent duplicate initialization

### ❌ Don't use toSignal() in services

**BAD - Memory leak risk:**

```typescript
@Injectable({ providedIn: 'root' })
export class BadService {
  items$ = this.http.get<Item[]>('/items');
  items = toSignal(this.items$); // Memory leak risk
}
```

**✅ GOOD - Use httpResource or expose Observable directly:**

```typescript
@Injectable({ providedIn: 'root' })
export class GoodService {
  itemsResource = httpResource<Item[]>(() => '/items');
  // Or expose Observable for components to convert
  items$ = this.http.get<Item[]>('/items');
}
```

### ❌ Don't use httpResource for mutations

**BAD - Wrong pattern:**

```typescript
createItem(item: Item) {
  httpResource(() => ({ url: '/items', method: 'POST', body: item }));
}
```

**✅ GOOD - Use HttpClient for mutations:**

```typescript
createItem(item: Item): Observable<Item> {
  return this.http.post<Item>('/items', item);
}
```

## Mutation Anti-Patterns

### ❌ Don't use effect() for state propagation

**BAD - Violates best practices:**

```typescript
items = signal<Item[]>([]);
filteredItems = signal<Item[]>([]);

constructor() {
  effect(() => {
    this.filteredItems.set(
      this.items().filter(item => item.active)
    ); // Violates best practices
  });
}
```

**✅ GOOD - Use computed for derived state:**

```typescript
items = signal<Item[]>([]);
filteredItems = computed(() => this.items().filter((item) => item.active));
```

## Lifecycle Anti-Patterns

### ❌ Don't use ngOnChanges with signals

**BAD - Old pattern with signals:**

```typescript
@Input({ required: true }) seasonId!: number;
ngOnChanges() {
  // Reacting to input changes
}
```

**✅ GOOD - Use computed for reactive transformations:**

```typescript
seasonId = input.required<number>();
season = computed(() => this.store.seasons().find((s) => s.id === this.seasonId()));
```

## Template Anti-Patterns

### ❌ Don't use *ngIf with async pipes

**BAD - Old pattern:**

```html
<div *ngIf="data$ | async">{{ data }}</div>
```

**✅ GOOD - Use @if with signals:**

```html
@if (data()) {
  <div>{{ data }}</div>
}
```

## Template Anti-Patterns

### ❌ Don't add manual clear buttons to tuiTextfield

**BAD - Manual clear button with @tui.close (doesn't exist):**

```html
<tui-textfield iconStart="@tui.search">
  <label tuiLabel>Search</label>
  <input placeholder="Search..." tuiTextfield [value]="searchQuery()" (input)="onSearchChange($any($event.target).value)" />
</tui-textfield>
@if (searchQuery()) {
  <button type="button" tuiButton appearance="flat" icon="@tui.close" size="s" (click)="clearSearch()">
    <tui-icon icon="@tui.close" />
  </button>
}
```

**Why this fails:**
- `@tui.close` icon doesn't exist in Taiga UI's Lucide icon set
- Causes 404 errors for `/assets/taiga-ui/icons/close.svg`
- Adds unnecessary code duplication

**✅ GOOD - Use built-in tuiTextfieldCleaner:**

```html
<tui-textfield iconStart="@tui.search">
  <label tuiLabel>Search</label>
  <input placeholder="Search..." tuiTextfield [value]="searchQuery()" (input)="onSearchChange($any($event.target).value)" />
</tui-textfield>
```

**Key points:**
- Taiga UI's `tuiTextfield` has built-in clear functionality
- The cleaner appears automatically when the field has value
- No need to manually track search/filter values or add clear buttons
- Cleaner is already styled and accessible by default

**Note:** For cancel buttons in forms/dialogs, use `@tui.x` icon instead of `@tui.close`.

### ❌ Don't use *ngIf with async pipes

**BAD - Hides element everywhere:**

```less
.auth-buttons__text {
  display: none; // Hidden on ALL viewports
}
```

**✅ GOOD - Only hide on specific breakpoints:**

```less
.auth-buttons__text {
  display: inline; // Show by default
}

@media (max-width: 640px) {
  .auth-buttons__text {
    display: none; // Only hide on mobile
  }
}
```

**Why this matters:**
- Global `display: none` breaks responsive behavior
- Element should be visible on desktop, hidden on mobile
- Always use media queries for responsive behavior

### ❌ Don't leave context-specific elements without explicit dimensions

**BAD - Missing width/height causes size inconsistency:**

```less
// Used in sport context
.player-detail__player-photo {
  background: var(--tui-background-accent-1);
  font-size: 3rem;
}

// Used in tournament context - has explicit dimensions
.player-detail__player-photo-large {
  background: var(--tui-background-accent-1);
  font-size: 3.5rem;
  width: 150px;
  height: 150px;
}
```

**Result:** Avatar appears smaller in sport context than tournament context.

**✅ GOOD - Apply explicit dimensions consistently:**

```less
.player-detail__player-photo {
  background: var(--tui-background-accent-1);
  font-size: 3.5rem;
  width: 150px;
  height: 150px;

  ::ng-deep tui-avatar {
    width: 150px;
    height: 150px;
  }
}
```

**Why this matters:**
- Ensures visual consistency across different contexts (sport vs tournament)
- Prevents UI elements from rendering differently based on context
- Use `::ng-deep tui-avatar` for Taiga UI components to ensure size is applied correctly

**✅ GOOD - Use @if with signals:**

```html
@if (data()) {
  <div>{{ data() }}</div>
}
```

## API Integration Anti-Patterns

### ❌ Don't assume API response matches component type

**BAD - Type mismatch causes runtime errors:**

```typescript
playerResource = httpResource<Player>(() => {
  return buildApiUrl(`/api/players/id/${playerId}/person`);
});

// Bug: API returns Person object (has `id`), not Player (has `person_id`)
const personId = player?.person_id; // undefined - dialog never opens
```

**✅ GOOD - Match type to actual API response:**

```typescript
playerResource = httpResource<Person>(() => {
  return buildApiUrl(`/api/players/id/${playerId}/person`);
});

// Correct: Person object has `id` property
const personId = player?.id;
```

**Key takeaway:** Always verify the actual structure of your API response and type your `httpResource` accordingly. Don't assume the endpoint name or route parameter determines the response type.

## State Management Anti-Patterns

### ❌ DO NOT use imperative state for reactive data

**BAD - Wrong:**

```typescript
season: Season | null = null; // Wrong
```

**✅ DO use signals:**

```typescript
season = signal<Season | null>(null); // Correct
```

### ❌ DO NOT use ngOnChanges for signal inputs

**BAD - Wrong:**

```typescript
@Input({ required: true }) seasonId!: number;
ngOnChanges() { ... } // Wrong
```

**✅ DO use computed for reactive transformations:**

```typescript
season = computed(() => { ... }); // Correct
```

### ❌ DO NOT use *ngIf with async pipes

**BAD - Old pattern:**

```html
<div *ngIf="data$ | async">...</div>
<!-- Old pattern -->
```

**✅ DO use `@if` with signals:**

```html
@if (data()) { ... }
<!-- Modern pattern -->
```

## Related Documentation

- [Angular Signals Best Practices](./angular-signals-best-practices.md) - Correct patterns
- [Component Patterns](./component-patterns.md) - Component best practices
- [Service Patterns](./service-patterns.md) - Service best practices
