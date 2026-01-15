# Common Anti-Patterns

This document covers common mistakes and anti-patterns to avoid.

## Service Anti-Patterns

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
